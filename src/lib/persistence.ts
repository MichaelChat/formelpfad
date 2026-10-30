/**
 * Speicherung im Browser (localStorage). Der gesamte Lernstand ist ein JSON-Dokument
 * mit Versionsnummer. Bei künftigen Formatänderungen wird hier migriert.
 *
 * Keine personenbezogenen Daten außer dem optional eingegebenen Vornamen.
 * Ohne Anmeldung ist das der einzige Speicher (plus Export/Import). Mit Anmeldung siehe lib/cloud/sync.ts.
 */
import { initialState, STATE_VERSION, type AppState } from './progress'

export const STORAGE_KEY = 'formelpfad:state:v1'

export interface StorageLike {
  getItem(key: string): string | null
  setItem(key: string, value: string): void
  removeItem(key: string): void
}

export function defaultStorage(): StorageLike | null {
  try {
    const s = globalThis.localStorage
    const probe = '__formelpfad_probe__'
    s.setItem(probe, '1')
    s.removeItem(probe)
    return s
  } catch {
    return null
  }
}

function isObject(v: unknown): v is Record<string, unknown> {
  return typeof v === 'object' && v !== null && !Array.isArray(v)
}

/** Prüft grob die Struktur und ergänzt fehlende Felder mit Standardwerten. */
export function normalizeState(raw: unknown): AppState | null {
  if (!isObject(raw)) return null
  if (typeof raw.version !== 'number' || raw.version > STATE_VERSION) return null
  const base = initialState()
  const merged = { ...base, ...raw } as AppState
  merged.settings = { ...base.settings, ...(isObject(raw.settings) ? (raw.settings as Partial<AppState['settings']>) : {}) }
  merged.today = isObject(raw.today) ? { ...base.today, ...(raw.today as Partial<AppState['today']>) } : base.today
  for (const key of ['daily', 'exercise', 'formula', 'lessons', 'bosses', 'achievements', 'quests'] as const) {
    if (!isObject(merged[key])) (merged as unknown as Record<string, unknown>)[key] = {}
  }
  for (const key of ['favorites', 'exams', 'recentWrong', 'log'] as const) {
    if (!Array.isArray(merged[key])) (merged as unknown as Record<string, unknown>)[key] = []
  }
  if (typeof merged.xp !== 'number' || !Number.isFinite(merged.xp)) merged.xp = 0
  merged.version = STATE_VERSION
  return merged
}

export interface LoadResult {
  state: AppState
  persistent: boolean
  recovered?: boolean
}

export function loadState(storage: StorageLike | null = defaultStorage()): LoadResult {
  if (!storage) return { state: initialState(), persistent: false }
  const raw = storage.getItem(STORAGE_KEY)
  if (!raw) return { state: initialState(), persistent: true }
  try {
    const parsed = normalizeState(JSON.parse(raw))
    if (parsed) return { state: parsed, persistent: true }
  } catch {
    /* fällt unten durch */
  }
  // Defekter Speicherstand: Sicherung aufheben, nicht still überschreiben.
  try {
    storage.setItem(`${STORAGE_KEY}:defekt:${Date.now()}`, raw)
  } catch {
    /* ignorieren */
  }
  return { state: initialState(), persistent: true, recovered: true }
}

export function saveState(state: AppState, storage: StorageLike | null = defaultStorage()): boolean {
  if (!storage) return false
  try {
    storage.setItem(STORAGE_KEY, JSON.stringify(state))
    return true
  } catch {
    return false
  }
}

export function exportState(state: AppState): string {
  return JSON.stringify({ app: 'formelpfad', exportedAt: new Date().toISOString(), state }, null, 2)
}

export function importState(json: string): { ok: true; state: AppState } | { ok: false; error: string } {
  let data: unknown
  try {
    data = JSON.parse(json)
  } catch {
    return { ok: false, error: 'Die Datei ist kein gültiges JSON.' }
  }
  const candidate = isObject(data) && data.app === 'formelpfad' ? data.state : data
  const state = normalizeState(candidate)
  if (!state) return { ok: false, error: 'Die Datei enthält keinen lesbaren Lernstand dieser App.' }
  return { ok: true, state }
}

export function clearState(storage: StorageLike | null = defaultStorage()): void {
  storage?.removeItem(STORAGE_KEY)
}
