/**
 * Zusammenführen zweier Lernstände (z. B. Handy offline + Laptop).
 *
 * Drei-Wege-Merge: `base` ist der letzte Stand, den beide Seiten gemeinsam hatten
 * (der zuletzt erfolgreich synchronisierte). Zähler (XP, Versuche, Tagesstatistik …)
 * werden als „Cloud + eigene Änderungen seit base“ addiert, damit nichts doppelt zählt.
 * Ohne base (erste Anmeldung mit bereits lokal gelerntem Stand) werden beide Stände
 * als unabhängig betrachtet und addiert.
 *
 * Werte, die sich nicht sinnvoll addieren lassen (Kompetenzwerte, Wiederholungsplan,
 * Einstellungen, Favoriten), stammen von der Seite mit der jüngeren Änderung.
 */
import { MAX_LOG, STATE_VERSION, type AppState, type AttemptRecord, type ExerciseStat, type FormulaProgress } from '../progress'

const add = (local: number, remote: number, base: number | undefined) => remote + Math.max(0, local - (base ?? 0))
const later = (a?: string, b?: string) => ((a ?? '') >= (b ?? '') ? a : b)
const earlier = (a?: string, b?: string) => (!a ? b : !b ? a : a <= b ? a : b)

function mergeMap<T>(l: Record<string, T>, r: Record<string, T>, fn: (l: T, r: T, key: string) => T): Record<string, T> {
  const out: Record<string, T> = { ...r }
  for (const [k, v] of Object.entries(l)) {
    const rv = r[k]
    out[k] = rv === undefined ? v : fn(v, rv, k)
  }
  return out
}

const logKey = (r: AttemptRecord) => `${r.at}|${r.exId}`

export function mergeLogs(a: AttemptRecord[], b: AttemptRecord[], max = MAX_LOG): AttemptRecord[] {
  const seen = new Map<string, AttemptRecord>()
  for (const r of [...a, ...b]) seen.set(logKey(r), r)
  return [...seen.values()].sort((x, y) => (x.at < y.at ? -1 : x.at > y.at ? 1 : 0)).slice(-max)
}

export function mergeStates(local: AppState, remote: AppState, base: AppState | null): AppState {
  const b = base
  const localNewer = (local.updatedAt ?? '') >= (remote.updatedAt ?? '')
  const newer = localNewer ? local : remote

  const daily = mergeMap(local.daily, remote.daily, (l, r, day) => {
    const bd = b?.daily[day]
    return {
      xp: add(l.xp, r.xp, bd?.xp),
      exercises: add(l.exercises, r.exercises, bd?.exercises),
      correct: add(l.correct, r.correct, bd?.correct),
      ms: add(l.ms, r.ms, bd?.ms),
      lessons: add(l.lessons, r.lessons, bd?.lessons),
    }
  })

  const exercise = mergeMap<ExerciseStat>(local.exercise, remote.exercise, (l, r, id) => {
    const be = b?.exercise[id]
    const lNewer = l.lastAt >= r.lastAt
    return {
      attempts: add(l.attempts, r.attempts, be?.attempts),
      correct: add(l.correct, r.correct, be?.correct),
      wrong: add(l.wrong, r.wrong, be?.wrong),
      hintsUsed: add(l.hintsUsed, r.hintsUsed, be?.hintsUsed),
      totalMs: add(l.totalMs, r.totalMs, be?.totalMs),
      lastAt: lNewer ? l.lastAt : r.lastAt,
      last: lNewer ? l.last : r.last,
    }
  })

  const formula = mergeMap<FormulaProgress>(local.formula, remote.formula, (l, r, id) => {
    const bf = b?.formula[id]
    const src = (l.lastAt ?? '') >= (r.lastAt ?? '') ? l : r
    const wrong = new Map([...l.wrongLog, ...r.wrongLog].map((w) => [`${w.at}|${w.exId}`, w]))
    return {
      skills: src.skills,
      srs: src.srs,
      lastAt: later(l.lastAt, r.lastAt),
      attempts: add(l.attempts, r.attempts, bf?.attempts),
      correct: add(l.correct, r.correct, bf?.correct),
      wrongLog: [...wrong.values()].sort((x, y) => (x.at < y.at ? -1 : 1)).slice(-20),
    }
  })

  const lessons = mergeMap(local.lessons, remote.lessons, (l, r, id) => ({
    firstAt: earlier(l.firstAt, r.firstAt)!,
    lastAt: later(l.lastAt, r.lastAt)!,
    best: Math.max(l.best, r.best),
    times: add(l.times, r.times, b?.lessons[id]?.times),
  }))

  const bosses = mergeMap(local.bosses, remote.bosses, (l, r) => ({
    firstAt: earlier(l.firstAt, r.firstAt)!,
    lastAt: later(l.lastAt, r.lastAt)!,
    best: Math.max(l.best, r.best),
    passed: l.passed || r.passed,
  }))

  const achievements = mergeMap(local.achievements, remote.achievements, (l, r) => earlier(l, r)!)

  const exams = [...new Map([...remote.exams, ...local.exams].map((e) => [e.id, e])).values()].sort((x, y) => (x.at < y.at ? -1 : 1)).slice(-50)

  const quests = mergeMap(local.quests, remote.quests, (l, r) => [...new Set([...r, ...l])])

  let today: AppState['today']
  if (local.today.day === remote.today.day) {
    const l = local.today
    const r = remote.today
    today = {
      day: l.day,
      correctCount: mergeMap(l.correctCount, r.correctCount, (x, y) => Math.max(x, y)),
      fixed: [...new Set([...r.fixed, ...l.fixed])],
      goalRewarded: l.goalRewarded || r.goalRewarded,
      reviewRewarded: Math.max(l.reviewRewarded, r.reviewRewarded),
    }
  } else {
    today = local.today.day > remote.today.day ? local.today : remote.today
  }

  return {
    version: STATE_VERSION,
    createdAt: earlier(local.createdAt, remote.createdAt)!,
    settings: newer.settings,
    favorites: newer.favorites,
    recentWrong: newer.recentWrong,
    xp: add(local.xp, remote.xp, b?.xp),
    daily,
    exercise,
    formula,
    lessons,
    bosses,
    achievements,
    exams,
    today,
    quests,
    log: mergeLogs(local.log, remote.log),
    updatedAt: later(local.updatedAt, remote.updatedAt),
  }
}

/** Hat dieser Stand schon echten Lernfortschritt (lohnt sich die Übernahme)? */
export function hasProgress(s: AppState): boolean {
  return s.xp > 0 || s.log.length > 0 || Object.keys(s.lessons).length > 0
}
