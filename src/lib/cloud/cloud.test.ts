import { describe, expect, it } from 'vitest'
import { initialState, recordAttempt, recordLessonComplete, toggleFavorite, type AppState, type AttemptInput } from '../progress'
import { STORAGE_KEY, type StorageLike } from '../persistence'
import { mergeStates } from './merge'
import { fitForCloud, SyncController, type Remote, type RemoteDoc, type SaveResult } from './sync'

const attempt = (exId: string, correct = true): AttemptInput => ({
  exId,
  skill: 'einsetzen',
  difficulty: 1,
  formulaIds: ['fin.barwert'],
  formulaDifficulty: { 'fin.barwert': 1 },
  correct,
  score: correct ? 1 : 0,
  hintsUsed: 0,
  ms: 20_000,
  mode: 'practice',
  type: 'numeric',
})

const t = (min: number) => new Date(Date.UTC(2026, 9, 30, 9, min))
const stamp = (s: AppState, min: number): AppState => ({ ...s, updatedAt: t(min).toISOString() })

function memoryStorage(): StorageLike & { map: Map<string, string> } {
  const map = new Map<string, string>()
  return { map, getItem: (k) => map.get(k) ?? null, setItem: (k, v) => void map.set(k, v), removeItem: (k) => void map.delete(k) }
}

/** Cloud zum Testen: verhält sich wie das Firestore-Dokument (Revisionsprüfung). */
class FakeRemote implements Remote {
  doc: { data: string; rev: number } | null = null
  online = true
  saves = 0
  async load(): Promise<RemoteDoc | null> {
    if (!this.online) throw new Error('offline')
    return this.doc ? { state: JSON.parse(this.doc.data) as AppState, rev: this.doc.rev } : null
  }
  async save(state: AppState, expectedRev: number): Promise<SaveResult> {
    if (!this.online) throw new Error('offline')
    const cur = this.doc ? { state: JSON.parse(this.doc.data) as AppState, rev: this.doc.rev } : null
    if ((cur?.rev ?? 0) !== expectedRev) return { ok: false, current: cur }
    this.saves++
    this.doc = { data: JSON.stringify(state), rev: expectedRev + 1 }
    return { ok: true, rev: expectedRev + 1 }
  }
  async remove() {
    this.doc = null
  }
  get state(): AppState {
    return JSON.parse(this.doc!.data) as AppState
  }
}

describe('Zusammenführen von Lernständen', () => {
  it('addiert Änderungen beider Geräte seit dem gemeinsamen Stand, ohne doppelt zu zählen', () => {
    const base = stamp(recordAttempt(initialState(t(0)), attempt('a'), t(0)).state, 0) // 10 XP
    const phone = stamp(recordAttempt(base, attempt('b'), t(5)).state, 5) // +10
    const laptop = stamp(recordAttempt(base, attempt('c'), t(6)).state, 6) // +10
    const merged = mergeStates(phone, laptop, base)
    expect(merged.xp).toBe(30)
    expect(merged.log.map((r) => r.exId).sort()).toEqual(['a', 'b', 'c'])
    expect(merged.formula['fin.barwert']!.attempts).toBe(3)
    const day = Object.keys(merged.daily)[0]!
    expect(merged.daily[day]!.exercises).toBe(3)
  })

  it('ist neutral, wenn nur eine Seite etwas geändert hat', () => {
    const base = stamp(recordAttempt(initialState(t(0)), attempt('a'), t(0)).state, 0)
    const changed = stamp(recordLessonComplete(base, 'l1', 1, t(3)).state, 3)
    expect(mergeStates(base, changed, base)).toMatchObject({ xp: changed.xp, lessons: changed.lessons })
    expect(mergeStates(changed, base, base)).toMatchObject({ xp: changed.xp, lessons: changed.lessons })
  })

  it('ohne gemeinsamen Stand (erste Anmeldung) werden beide Stände übernommen', () => {
    const anon = recordAttempt(initialState(t(0)), attempt('a'), t(0)).state
    const account = recordAttempt(initialState(t(0)), attempt('b'), t(1)).state
    const merged = mergeStates(anon, account, null)
    expect(merged.xp).toBe(20)
    expect(merged.log).toHaveLength(2)
  })

  it('Einstellungen und Favoriten kommen von der jüngeren Änderung', () => {
    const base = stamp(initialState(t(0)), 0)
    const a = stamp(toggleFavorite(base, 'f1'), 2)
    const b = stamp({ ...base, settings: { ...base.settings, name: 'Alex' } }, 4)
    const merged = mergeStates(a, b, base)
    expect(merged.settings.name).toBe('Alex')
    expect(merged.favorites).toEqual([])
    expect(mergeStates(stamp(a, 9), b, base).favorites).toEqual(['f1'])
  })

  it('kürzt das Protokoll, bis der Stand in ein Cloud-Dokument passt', () => {
    let s = initialState(t(0))
    for (let i = 0; i < 600; i++) s = recordAttempt(s, attempt(i % 2 ? `gen:fin.barwert:BW:${i}` : 'fin.barwert.e3'), new Date(t(0).getTime() + i * 60_000)).state
    const small = fitForCloud(s, 30_000)
    expect(JSON.stringify(small).length).toBeLessThanOrEqual(30_000)
    expect(small.log.length).toBeLessThan(s.log.length)
    expect(small.log.at(-1)).toEqual(s.log.at(-1)) // neueste Einträge bleiben
    expect(small.xp).toBe(s.xp)
    expect(small.exercise['fin.barwert.e3']).toEqual(s.exercise['fin.barwert.e3']) // Originalaufgaben bleiben
    expect(small.exercise['gen:fin.barwert:BW:599']).toBeDefined() // neueste Variante bleibt
    expect(Object.keys(fitForCloud(s).exercise).filter((id) => id.startsWith('gen:'))).toHaveLength(300)
  })
})

describe('Synchronisation', () => {
  it('neues Konto: legt das Cloud-Dokument an und übernimmt einen alten Browser-Stand', async () => {
    const storage = memoryStorage()
    const old = recordAttempt(initialState(t(0)), attempt('a'), t(0)).state
    storage.setItem(STORAGE_KEY, JSON.stringify(old))
    const remote = new FakeRemote()
    const ctrl = new SyncController('u1', remote, storage, 0)
    const state = await ctrl.start()
    expect(state.xp).toBe(10)
    expect(remote.state.xp).toBe(10)
    expect(ctrl.status).toBe('synced')
    // alter Stand wird umbenannt, nicht gelöscht
    expect(storage.getItem(STORAGE_KEY)).toBeNull()
    expect([...storage.map.keys()].some((k) => k.startsWith(`${STORAGE_KEY}:uebernommen:`))).toBe(true)
  })

  it('zwei Geräte gleichzeitig: Konflikt wird erkannt und zusammengeführt', async () => {
    const remote = new FakeRemote()
    const phone = new SyncController('u1', remote, memoryStorage(), 0)
    const laptop = new SyncController('u1', remote, memoryStorage(), 0)
    const p0 = await phone.start()
    const l0 = await laptop.start()

    phone.commit(stamp(recordAttempt(p0, attempt('a'), t(1)).state, 1))
    await phone.flush()
    // Laptop kennt die Änderung des Handys noch nicht
    const external: AppState[] = []
    laptop.onRemoteState((s) => external.push(s))
    laptop.commit(stamp(recordAttempt(l0, attempt('b'), t(2)).state, 2))
    await laptop.flush()

    expect(remote.state.xp).toBe(20)
    expect(remote.state.log.map((r) => r.exId).sort()).toEqual(['a', 'b'])
    expect(external.at(-1)!.xp).toBe(20) // Oberfläche des Laptops bekommt den zusammengeführten Stand

    await phone.refresh()
    expect(phone.state.xp).toBe(20)
  })

  it('offline weiterlernen und später nachreichen', async () => {
    const remote = new FakeRemote()
    const storage = memoryStorage()
    const ctrl = new SyncController('u1', remote, storage, 0)
    const s0 = await ctrl.start()
    remote.online = false
    ctrl.commit(stamp(recordAttempt(s0, attempt('a'), t(1)).state, 1))
    await ctrl.flush()
    expect(ctrl.status).toBe('offline')
    expect(ctrl.hasUnsyncedChanges).toBe(true)

    // Seite neu laden, während noch offline: Cache wird benutzt
    const again = new SyncController('u1', remote, storage, 0)
    expect((await again.start()).xp).toBe(10)

    remote.online = true
    await again.refresh()
    expect(again.status).toBe('synced')
    expect(remote.state.xp).toBe(10)
  })

  it('erster Start offline, später online: nichts geht verloren', async () => {
    const remote = new FakeRemote()
    remote.doc = { data: JSON.stringify(recordAttempt(initialState(t(0)), attempt('z'), t(0)).state), rev: 3 }
    remote.online = false
    const storage = memoryStorage()
    const ctrl = new SyncController('u1', remote, storage, 0)
    const s0 = await ctrl.start()
    ctrl.commit(stamp(recordAttempt(s0, attempt('a'), t(1)).state, 1))
    await ctrl.flush()

    remote.online = true
    const next = new SyncController('u1', remote, storage, 0)
    const s = await next.start()
    expect(s.xp).toBe(20)
    expect(remote.state.log.map((r) => r.exId).sort()).toEqual(['a', 'z'])
  })

  it('Abmelden löscht den Zwischenspeicher im Browser, Löschen auch die Cloud', async () => {
    const remote = new FakeRemote()
    const storage = memoryStorage()
    const ctrl = new SyncController('u1', remote, storage, 0)
    await ctrl.start()
    expect([...storage.map.keys()].some((k) => k.startsWith('formelpfad:user:u1'))).toBe(true)
    ctrl.stop(true)
    expect([...storage.map.keys()].some((k) => k.startsWith('formelpfad:user:u1'))).toBe(false)

    const c2 = new SyncController('u1', remote, storage, 0)
    await c2.start()
    await c2.deleteEverything()
    expect(remote.doc).toBeNull()
  })

  it('auf anderem Gerät gelöscht → hier wird ebenfalls neu begonnen', async () => {
    const remote = new FakeRemote()
    const ctrl = new SyncController('u1', remote, memoryStorage(), 0)
    const s0 = await ctrl.start()
    ctrl.commit(stamp(recordAttempt(s0, attempt('a'), t(1)).state, 1))
    await ctrl.flush()
    remote.doc = null
    await ctrl.refresh()
    expect(ctrl.state.xp).toBe(0)
  })
})
