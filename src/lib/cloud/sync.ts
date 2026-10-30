/**
 * Synchronisation Lernstand ↔ Cloud.
 *
 * - Der Browser hält einen Cache pro Konto (`formelpfad:user:<uid>:…`): die App bleibt
 *   offline benutzbar und startet sofort.
 * - Jede Änderung wird lokal gespeichert und nach kurzer Pause in die Cloud geschrieben.
 * - Schreiben ist „optimistisch“: Die Cloud nimmt nur an, wenn ihre Revision noch die ist,
 *   die wir zuletzt gesehen haben. Sonst hat ein anderes Gerät dazwischen gespeichert →
 *   zusammenführen (merge.ts) und erneut schreiben.
 *
 * Unabhängig von Firebase; die Cloud wird über das Interface `Remote` angesprochen.
 */
import { normalizeState, STORAGE_KEY, type StorageLike } from '../persistence'
import { initialState, type AppState } from '../progress'
import { hasProgress, mergeStates } from './merge'

export interface RemoteDoc {
  state: AppState
  rev: number
}

export type SaveResult = { ok: true; rev: number } | { ok: false; current: RemoteDoc | null }

export interface Remote {
  load(): Promise<RemoteDoc | null>
  /** Schreibt nur, wenn die Cloud noch Revision `expectedRev` hat (0 = noch kein Dokument). */
  save(state: AppState, expectedRev: number): Promise<SaveResult>
  remove(): Promise<void>
}

export type SyncStatus = 'synced' | 'saving' | 'offline' | 'error'

interface Meta {
  rev: number
  dirty: boolean
}

/** Grenze für ein Firestore-Dokument ist 1 MiB; wir bleiben deutlich darunter. */
export const MAX_CLOUD_BYTES = 800_000

/** Höchstzahl gespeicherter Statistiken für zufallsgenerierte Varianten (jede hat eine eigene ID). */
export const MAX_GENERATED_STATS = 300

function pruneGenerated(s: AppState, keep: number): AppState {
  const gen = Object.entries(s.exercise).filter(([id]) => id.startsWith('gen:'))
  if (gen.length <= keep) return s
  const drop = new Set(
    gen
      .sort((a, b) => (a[1].lastAt < b[1].lastAt ? -1 : 1))
      .slice(0, gen.length - keep)
      .map(([id]) => id),
  )
  return { ...s, exercise: Object.fromEntries(Object.entries(s.exercise).filter(([id]) => !drop.has(id))) }
}

/**
 * Sorgt dafür, dass der Stand in ein Cloud-Dokument passt: nur die neuesten Statistiken
 * generierter Varianten behalten, dann bei Bedarf das Antwortprotokoll von vorne kürzen.
 * XP, Kompetenzen, Wiederholungsplan und Originalaufgaben bleiben vollständig.
 */
export function fitForCloud(state: AppState, maxBytes = MAX_CLOUD_BYTES): AppState {
  let s = pruneGenerated(state, MAX_GENERATED_STATS)
  let size = JSON.stringify(s).length
  // 1. Statistiken alter Zufallsvarianten (am wenigsten wertvoll)
  let keep = MAX_GENERATED_STATS
  while (size > maxBytes && keep > 30) {
    keep = Math.floor(keep / 2)
    s = pruneGenerated(s, keep)
    size = JSON.stringify(s).length
  }
  // 2. Älteste Einträge im Antwortprotokoll
  while (size > maxBytes && s.log.length > 0) {
    const drop = Math.max(50, Math.ceil(s.log.length * ((size - maxBytes) / size)) + 10)
    s = { ...s, log: s.log.slice(drop) }
    size = JSON.stringify(s).length
  }
  return s
}

export class SyncController {
  private readonly keys: { state: string; base: string; meta: string }
  private current: AppState = initialState()
  private base: AppState | null = null
  private meta: Meta = { rev: 0, dirty: false }
  private timer: ReturnType<typeof setTimeout> | null = null
  private pushing: Promise<void> | null = null
  private pushAgain = false
  private statusValue: SyncStatus = 'synced'
  private readonly statusListeners = new Set<(s: SyncStatus) => void>()
  private readonly stateListeners = new Set<(s: AppState) => void>()
  private stopped = false

  constructor(
    uid: string,
    private readonly remote: Remote,
    private readonly storage: StorageLike | null,
    private readonly debounceMs = 1500,
  ) {
    const p = `formelpfad:user:${uid}`
    this.keys = { state: `${p}:state`, base: `${p}:base`, meta: `${p}:meta` }
  }

  get status(): SyncStatus {
    return this.statusValue
  }
  get state(): AppState {
    return this.current
  }
  get hasUnsyncedChanges(): boolean {
    return this.meta.dirty
  }

  onStatus(fn: (s: SyncStatus) => void): () => void {
    this.statusListeners.add(fn)
    return () => this.statusListeners.delete(fn)
  }
  /** Meldet Stände, die von außen kommen (anderes Gerät), an die Oberfläche. */
  onRemoteState(fn: (s: AppState) => void): () => void {
    this.stateListeners.add(fn)
    return () => this.stateListeners.delete(fn)
  }

  private setStatus(s: SyncStatus) {
    if (s === this.statusValue) return
    this.statusValue = s
    this.statusListeners.forEach((fn) => fn(s))
  }

  private read(key: string): AppState | null {
    try {
      const raw = this.storage?.getItem(key)
      return raw ? normalizeState(JSON.parse(raw)) : null
    } catch {
      return null
    }
  }
  private write(key: string, value: unknown) {
    try {
      this.storage?.setItem(key, JSON.stringify(value))
    } catch {
      /* Speicher voll oder gesperrt – die Cloud bleibt maßgeblich */
    }
  }
  private persistLocal() {
    this.write(this.keys.state, this.current)
    this.write(this.keys.meta, this.meta)
    if (this.base) this.write(this.keys.base, this.base)
    else this.storage?.removeItem(this.keys.base)
  }

  /** Lädt Cache + Cloud, übernimmt ggf. einen alten Stand ohne Konto und gibt den Startzustand zurück. */
  async start(): Promise<AppState> {
    const cached = this.read(this.keys.state)
    this.base = this.read(this.keys.base)
    try {
      const m = JSON.parse(this.storage?.getItem(this.keys.meta) ?? 'null') as Meta | null
      if (m && typeof m.rev === 'number') this.meta = { rev: m.rev, dirty: !!m.dirty }
    } catch {
      /* ignorieren */
    }
    // Cache, der schon einmal synchronisiert war, aber dessen Ausgangsstand fehlt, lässt sich
    // nicht sicher verrechnen (sonst würde doppelt gezählt) → verwerfen, die Cloud gilt.
    const local = cached && !this.base && this.meta.rev !== 0 ? null : cached

    // Lernstand aus der Zeit vor der Anmeldung (nur im Browser gespeichert)
    const legacyRaw = this.storage?.getItem(STORAGE_KEY) ?? null
    let legacy: AppState | null = null
    if (legacyRaw) {
      try {
        legacy = normalizeState(JSON.parse(legacyRaw))
      } catch {
        legacy = null
      }
      if (legacy && !hasProgress(legacy)) legacy = null
    }

    let remote: RemoteDoc | null
    try {
      remote = await this.remote.load()
    } catch {
      // Offline: mit dem Cache weiterarbeiten, später synchronisieren.
      this.current = local ?? cached ?? initialState()
      this.setStatus('offline')
      return this.current
    }

    let state: AppState
    if (remote) {
      // Ohne eigene ungespeicherte Änderungen ist die Cloud maßgeblich; sonst zusammenführen.
      state = local && this.meta.dirty ? mergeStates(local, remote.state, this.base) : remote.state
      this.meta.rev = remote.rev
      this.base = remote.state
    } else {
      // Kein Cloud-Dokument (neues Konto oder gelöscht): lokalen Stand nur übernehmen, wenn er zu einem früheren Sync gehört.
      state = local && this.meta.rev === 0 ? local : initialState()
      this.meta.rev = 0
      this.base = null
    }

    if (legacy) {
      state = mergeStates(legacy, state, null)
      // Alten Stand nicht löschen, sondern umbenennen (falls etwas schiefgeht, bleibt er erhalten).
      try {
        this.storage?.setItem(`${STORAGE_KEY}:uebernommen:${Date.now()}`, legacyRaw!)
        this.storage?.removeItem(STORAGE_KEY)
      } catch {
        /* ignorieren */
      }
    }

    this.current = state
    this.meta.dirty = !remote || state !== remote.state
    this.persistLocal()
    if (this.meta.dirty) await this.flush()
    else this.setStatus('synced')
    return this.current
  }

  /** Von der Oberfläche nach jeder Änderung aufgerufen. */
  commit(state: AppState) {
    if (this.stopped) return
    this.current = state
    this.meta.dirty = true
    this.persistLocal()
    if (this.timer) clearTimeout(this.timer)
    this.timer = setTimeout(() => void this.flush(), this.debounceMs)
  }

  /** Schreibt sofort (z. B. vor dem Abmelden oder beim Verlassen der Seite). */
  async flush(): Promise<void> {
    if (this.timer) {
      clearTimeout(this.timer)
      this.timer = null
    }
    if (this.pushing) {
      this.pushAgain = true
      return this.pushing
    }
    if (!this.meta.dirty) return
    this.pushing = this.push().finally(() => {
      this.pushing = null
    })
    await this.pushing
    if (this.pushAgain && this.meta.dirty && !this.stopped) {
      this.pushAgain = false
      await this.flush()
    }
  }

  private async push(): Promise<void> {
    this.setStatus('saving')
    for (let attempt = 0; attempt < 4; attempt++) {
      const toSave = fitForCloud(this.current)
      let res: SaveResult
      try {
        res = await this.remote.save(toSave, this.meta.rev)
      } catch {
        this.setStatus('offline')
        return
      }
      if (res.ok) {
        this.meta.rev = res.rev
        this.base = toSave
        // Nur „sauber“, wenn in der Zwischenzeit nichts Neues dazukam.
        this.meta.dirty = this.current !== toSave && JSON.stringify(this.current) !== JSON.stringify(toSave)
        this.persistLocal()
        this.setStatus('synced')
        return
      }
      // Konflikt: anderes Gerät war schneller → zusammenführen und erneut versuchen.
      if (res.current) {
        this.current = mergeStates(this.current, res.current.state, this.base)
        this.base = res.current.state
        this.meta.rev = res.current.rev
      } else {
        this.meta.rev = 0
        this.base = null
      }
      this.persistLocal()
      this.stateListeners.forEach((fn) => fn(this.current))
    }
    this.setStatus('error')
  }

  /** Holt Änderungen anderer Geräte (z. B. wenn der Tab wieder sichtbar wird). */
  async refresh(): Promise<void> {
    if (this.stopped) return
    let remote: RemoteDoc | null
    try {
      remote = await this.remote.load()
    } catch {
      this.setStatus('offline')
      return
    }
    if (!remote) {
      // Dokument fehlt, obwohl schon synchronisiert wurde → auf einem anderen Gerät gelöscht.
      if (this.meta.rev !== 0) {
        this.current = initialState()
        this.meta = { rev: 0, dirty: true }
        this.base = null
        this.persistLocal()
        this.stateListeners.forEach((fn) => fn(this.current))
      }
    } else if (remote.rev !== this.meta.rev) {
      this.current = this.meta.dirty ? mergeStates(this.current, remote.state, this.base) : remote.state
      this.base = remote.state
      this.meta.rev = remote.rev
      this.persistLocal()
      this.stateListeners.forEach((fn) => fn(this.current))
    }
    if (this.meta.dirty) await this.flush()
    else this.setStatus('synced')
  }

  /** Beendet die Synchronisation; mit `forget` wird der Cache dieses Kontos im Browser gelöscht. */
  stop(forget: boolean) {
    this.stopped = true
    if (this.timer) clearTimeout(this.timer)
    if (forget) for (const k of Object.values(this.keys)) this.storage?.removeItem(k)
  }

  /** Löscht den Lernstand in der Cloud und im Browser. */
  async deleteEverything(): Promise<void> {
    await this.remote.remove()
    this.stop(true)
  }
}
