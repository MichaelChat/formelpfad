/**
 * Lern-Engine: stellt Sitzungen zusammen und leitet alle Kennzahlen aus dem
 * tatsächlichen Lernstand ab (keine erfundenen Werte).
 */
import {
  chapterById,
  chapters,
  exerciseById,
  exercises,
  exercisesForFormula,
  formulaById,
  formulas,
  isGradable,
  lessons,
} from '../content'
import { isKnowledge, KIND_LABELS, type CardKind, type Chapter, type Exercise, type Formula, type Lesson, type Skill } from '../content/types'
import { addDays, localDay, type Day } from './dates'
import { generateExercise } from './generator'
import { masteryOf, type MasteryInfo } from './mastery'
import { hashString, mulberry32, shuffle } from './math/random'
import { BOSS_PASS, type AppState } from './progress'
import { isDue, overdueDays } from './srs'

// ------------------------------------------------------------------ Sitzungen

export type SessionItem =
  | { kind: 'intro'; title: string; text: string; formulaIds: string[] }
  | { kind: 'formula'; formulaId: string }
  | { kind: 'example'; formulaId: string }
  | { kind: 'exercise'; exercise: Exercise }
  | { kind: 'mistakes'; formulaIds: string[] }

export interface Session {
  id: string
  mode: 'lesson' | 'review' | 'weakness' | 'boss' | 'practice' | 'arena'
  title: string
  subtitle?: string
  items: SessionItem[]
  lessonId?: string
  chapterId?: string
  /** Zeitlimit in Sekunden (Boss mit Timer / Arena). */
  timeLimit?: number
  /** Feedback sofort (Lernen) oder erst am Ende (Prüfungsmodus). */
  deferFeedback?: boolean
}

const SKILL_ORDER: Skill[] = ['erkennen', 'einsetzen', 'abrufen', 'auswaehlen', 'umstellen', 'interpretieren', 'anwenden']

function skillRank(s: Skill): number {
  return SKILL_ORDER.indexOf(s)
}

/** Verfügbare Kompetenzdimensionen einer Formel (aus Aufgaben + Generator). */
export function availableSkills(formulaId: string): Skill[] {
  const set = new Set<Skill>()
  for (const ex of exercisesForFormula(formulaId)) if (isGradable(ex)) set.add(ex.skill)
  const f = formulaById.get(formulaId)
  for (const t of f?.generator?.targets ?? []) set.add(t.skill)
  return SKILL_ORDER.filter((s) => set.has(s))
}

export function formulaMastery(state: AppState, formulaId: string): MasteryInfo {
  return masteryOf(state.formula[formulaId]?.skills, availableSkills(formulaId))
}

function generatedFor(formula: Formula, seed: number): Exercise | null {
  return generateExercise(formula, seed)
}

/** Seed, der sich pro Tag und Durchlauf ändert – damit Wiederholungen nicht monoton sind. */
function seedFor(state: AppState, key: string): number {
  return hashString(`${key}:${localDay()}:${state.log.length}`)
}

export function buildLessonSession(state: AppState, lessonId: string): Session | null {
  const lesson = lessons.find((l) => l.id === lessonId)
  if (!lesson) return null
  const chapter = chapterById.get(lesson.chapterId)!
  const repeat = !!state.lessons[lessonId]
  const rng = mulberry32(seedFor(state, lessonId))
  const perFormula = Math.max(2, Math.min(5, Math.ceil(9 / lesson.formulaIds.length)))
  const items: SessionItem[] = [{ kind: 'intro', title: lesson.title, text: lesson.goal, formulaIds: lesson.formulaIds }]
  const used = new Set<string>()

  for (const fid of lesson.formulaIds) {
    const f = formulaById.get(fid)
    if (!f) continue
    items.push({ kind: 'formula', formulaId: fid })
    if (f.example) items.push({ kind: 'example', formulaId: fid })
    let pool = exercisesForFormula(fid).filter((e) => isGradable(e) && e.formulaIds[0] === fid && !used.has(e.id) && e.origin !== 'klausur')
    if (pool.length < perFormula) pool = [...pool, ...exercisesForFormula(fid).filter((e) => isGradable(e) && !used.has(e.id) && !pool.includes(e))]
    // Beim ersten Durchlauf: vom Leichten zum Schweren; bei Wiederholung gemischt.
    const ordered = repeat ? shuffle(rng, pool) : [...pool].sort((a, b) => skillRank(a.skill) - skillRank(b.skill) || a.difficulty - b.difficulty)
    const chosen = ordered.slice(0, perFormula)
    const gen = f.generator ? generatedFor(f, seedFor(state, `${lessonId}:${fid}`)) : null
    if (gen && chosen.length >= 2) chosen.splice(Math.min(2, chosen.length), 0, gen)
    else if (gen) chosen.push(gen)
    for (const ex of chosen) {
      used.add(ex.id)
      items.push({ kind: 'exercise', exercise: ex })
    }
  }
  items.push({ kind: 'mistakes', formulaIds: lesson.formulaIds })
  return { id: `lesson:${lessonId}:${Date.now()}`, mode: 'lesson', title: lesson.title, subtitle: `${chapter.number} · ${chapter.title}`, items, lessonId, chapterId: chapter.id }
}

export function buildPracticeSession(state: AppState, formulaId: string): Session | null {
  const f = formulaById.get(formulaId)
  if (!f) return null
  const rng = mulberry32(seedFor(state, `practice:${formulaId}`))
  const pool = exercisesForFormula(formulaId).filter(isGradable)
  // Schwächste Dimensionen zuerst
  const skills = state.formula[formulaId]?.skills ?? {}
  const ordered = shuffle(rng, pool).sort((a, b) => (skills[a.skill] ?? 0) - (skills[b.skill] ?? 0))
  const chosen: Exercise[] = ordered.slice(0, 5)
  for (let i = 0; i < 2 && f.generator; i++) {
    const g = generatedFor(f, seedFor(state, `practice:${formulaId}:${i}`))
    if (g) chosen.push(g)
  }
  return { id: `practice:${formulaId}:${Date.now()}`, mode: 'practice', title: `Üben: ${f.name}`, items: [{ kind: 'formula', formulaId }, ...chosen.map((exercise) => ({ kind: 'exercise' as const, exercise }))] }
}

export function dueFormulas(state: AppState, today: Day = localDay()): Formula[] {
  return formulas
    .filter((f) => isDue(state.formula[f.id]?.srs, today))
    .sort((a, b) => overdueDays(state.formula[b.id]!.srs!, today) - overdueDays(state.formula[a.id]!.srs!, today))
}

export function upcomingReviews(state: AppState, days: number, today: Day = localDay()): { day: Day; count: number }[] {
  const out: { day: Day; count: number }[] = []
  for (let i = 1; i <= days; i++) {
    const d = addDays(today, i)
    out.push({ day: d, count: formulas.filter((f) => state.formula[f.id]?.srs?.due === d).length })
  }
  return out
}

/** Problematische Formeln: geübt, aber schwach oder kürzlich mehrfach falsch. */
export function weakFormulas(state: AppState, limit = 8): Formula[] {
  const cutoff = addDays(localDay(), -14)
  const scored = formulas
    .filter((f) => (state.formula[f.id]?.attempts ?? 0) > 0)
    .map((f) => {
      const m = formulaMastery(state, f.id)
      const recentWrong = (state.formula[f.id]?.wrongLog ?? []).filter((w) => w.at.slice(0, 10) >= cutoff).length
      return { f, weakness: (1 - m.score) + 0.15 * recentWrong }
    })
    .filter((x) => x.weakness > 0.45)
    .sort((a, b) => b.weakness - a.weakness)
  return scored.slice(0, limit).map((x) => x.f)
}

function pickReviewExercises(state: AppState, f: Formula, n: number, seedKey: string): Exercise[] {
  const rng = mulberry32(seedFor(state, seedKey))
  const skills = state.formula[f.id]?.skills ?? {}
  const lastIds = new Set(state.log.slice(-30).map((r) => r.exId))
  const pool = exercisesForFormula(f.id).filter((e) => isGradable(e) && !lastIds.has(e.id))
  // aktive Abrufaufgaben bevorzugen; schwache Dimensionen zuerst
  const ordered = shuffle(rng, pool).sort((a, b) => {
    const activeA = ['abrufen', 'einsetzen', 'umstellen', 'anwenden'].includes(a.skill) ? 0 : 1
    const activeB = ['abrufen', 'einsetzen', 'umstellen', 'anwenden'].includes(b.skill) ? 0 : 1
    return activeA - activeB || (skills[a.skill] ?? 0) - (skills[b.skill] ?? 0)
  })
  const out = ordered.slice(0, n)
  if (out.length < n && f.generator) {
    const g = generatedFor(f, seedFor(state, `${seedKey}:gen`))
    if (g) out.push(g)
  } else if (f.generator && rng() < 0.5 && out.length > 0) {
    const g = generatedFor(f, seedFor(state, `${seedKey}:gen`))
    if (g) out[out.length - 1] = g
  }
  return out
}

export function buildReviewSession(state: AppState, max = 8): Session | null {
  const due = dueFormulas(state)
  if (due.length === 0) return null
  const items: SessionItem[] = []
  for (const f of due) {
    for (const ex of pickReviewExercises(state, f, due.length > 4 ? 1 : 2, `review:${f.id}`)) items.push({ kind: 'exercise', exercise: ex })
    if (items.length >= max) break
  }
  const rng = mulberry32(seedFor(state, 'review'))
  return { id: `review:${Date.now()}`, mode: 'review', title: 'Fällige Wiederholungen', subtitle: `${countLabel(due)} fällig`, items: interleaveByKind(shuffle(rng, items)).slice(0, max) }
}

/** „3 Formeln · 2 Begriffe“ */
export function countLabel(cards: Pick<Formula, 'kind'>[]): string {
  const k = cards.filter((c) => isKnowledge(c)).length
  const f = cards.length - k
  const part = (n: number, kind: CardKind) => `${n} ${n === 1 ? KIND_LABELS[kind].one : KIND_LABELS[kind].many}`
  return [f ? part(f, 'formel') : '', k ? part(k, 'wissen') : ''].filter(Boolean).join(' · ') || '0 Karten'
}

/** Abwechselnd Formel- und Wissensaufgaben, damit sich beide Arten mischen (Interleaving). */
export function interleaveByKind(items: SessionItem[]): SessionItem[] {
  const kindOf = (it: SessionItem) => {
    if (it.kind !== 'exercise') return 'x'
    const f = formulaById.get(it.exercise.formulaIds[0] ?? '')
    return f && isKnowledge(f) ? 'w' : 'f'
  }
  const w = items.filter((i) => kindOf(i) === 'w')
  const f = items.filter((i) => kindOf(i) === 'f')
  const rest = items.filter((i) => kindOf(i) === 'x')
  const out: SessionItem[] = []
  // Verhältnis beibehalten: die größere Gruppe bekommt entsprechend mehr Plätze
  let wi = 0
  let fi = 0
  while (wi < w.length || fi < f.length) {
    const takeW = fi >= f.length || (wi < w.length && wi / Math.max(1, w.length) <= fi / Math.max(1, f.length))
    out.push(takeW ? w[wi++]! : f[fi++]!)
  }
  return [...rest, ...out]
}

export type MixScope = 'gemischt' | CardKind

/**
 * Gemischtes Training: fällige, schwache und bereits begonnene Karten beider Arten,
 * je eine Aufgabe pro Karte, abwechselnd Formel und Wissen. Ohne Lernstand: Karten der
 * ersten Lektion jedes Teils. Optional auf Kapitel und/oder Art beschränkt.
 */
export function buildMixedSession(state: AppState, opts: { scope?: MixScope; chapterIds?: string[]; max?: number } = {}): Session | null {
  const { scope = 'gemischt', chapterIds, max = 10 } = opts
  const rng = mulberry32(seedFor(state, `mix:${scope}:${chapterIds?.join(',') ?? ''}`))
  const inScope = (f: Formula) => (scope === 'gemischt' || (scope === 'wissen') === isKnowledge(f)) && (!chapterIds || chapterIds.includes(f.chapterId))
  const today = localDay()
  const cards = formulas.filter((f) => inScope(f) && exercisesForFormula(f.id).some(isGradable))
  const due = cards.filter((f) => isDue(state.formula[f.id]?.srs, today))
  const weak = weakFormulas(state, 30).filter(inScope)
  const started = shuffle(rng, cards.filter((f) => (state.formula[f.id]?.attempts ?? 0) > 0))
  // Noch nichts geübt (oder alles abgearbeitet): auch neue Karten zulassen
  const fresh = shuffle(rng, cards.filter((f) => !(state.formula[f.id]?.attempts ?? 0)))
  const order: Formula[] = []
  const seen = new Set<string>()
  for (const f of [...due, ...weak, ...started, ...fresh]) {
    if (seen.has(f.id)) continue
    seen.add(f.id)
    order.push(f)
  }
  // Beide Arten sollen vorkommen, wenn gemischt
  const pickFrom = scope === 'gemischt' ? interleaveCards(order) : order
  const items: SessionItem[] = []
  const usedEx = new Set<string>()
  for (const f of pickFrom) {
    const ex = pickReviewExercises(state, f, 1, `mix:${f.id}`).find((e) => !usedEx.has(e.id) && e.type !== 'selfcheck')
      ?? pickReviewExercises(state, f, 1, `mix:${f.id}`).find((e) => !usedEx.has(e.id))
    if (!ex) continue
    usedEx.add(ex.id)
    items.push({ kind: 'exercise', exercise: ex })
    if (items.length >= max) break
  }
  if (!items.length) return null
  const title = scope === 'wissen' ? 'Wissen trainieren' : scope === 'formel' ? 'Formeln trainieren' : 'Gemischtes Training'
  const chapterTitle = chapterIds?.length === 1 ? chapterById.get(chapterIds[0]!)?.title : undefined
  return {
    id: `mix:${scope}:${Date.now()}`,
    mode: 'practice',
    title,
    subtitle: chapterTitle ?? (scope === 'gemischt' ? 'Formeln und Wissen im Wechsel' : `${items.length} Aufgaben`),
    items: scope === 'gemischt' ? interleaveByKind(items) : items,
  }
}

function interleaveCards(cards: Formula[]): Formula[] {
  const w = cards.filter(isKnowledge)
  const f = cards.filter((c) => !isKnowledge(c))
  const out: Formula[] = []
  for (let i = 0; i < Math.max(w.length, f.length); i++) {
    if (f[i]) out.push(f[i]!)
    if (w[i]) out.push(w[i]!)
  }
  return out
}

export function buildWeaknessSession(state: AppState, max = 8): Session | null {
  const items: SessionItem[] = []
  const seen = new Set<string>()
  for (const id of state.recentWrong.slice(0, 4)) {
    const ex = exerciseById.get(id)
    if (ex && isGradable(ex) && !seen.has(id)) {
      seen.add(id)
      items.push({ kind: 'exercise', exercise: ex })
    }
  }
  for (const f of weakFormulas(state)) {
    for (const ex of pickReviewExercises(state, f, 1, `weak:${f.id}`)) {
      if (!seen.has(ex.id)) {
        seen.add(ex.id)
        items.push({ kind: 'exercise', exercise: ex })
      }
    }
    if (items.length >= max) break
  }
  if (items.length === 0) return null
  return { id: `weak:${Date.now()}`, mode: 'weakness', title: 'Meine Schwächen trainieren', subtitle: 'Frühere Fehler und schwache Formeln', items: items.slice(0, max) }
}

export function buildBossSession(state: AppState, chapterId: string, timed: boolean): Session | null {
  const chapter = chapterById.get(chapterId)
  if (!chapter) return null
  const rng = mulberry32(seedFor(state, `boss:${chapterId}`))
  const pool = exercises.filter((e) => e.chapterId === chapterId && isGradable(e) && e.type !== 'selfcheck')
  const hard = shuffle(rng, pool.filter((e) => e.difficulty >= 2 || ['anwenden', 'auswaehlen', 'interpretieren', 'umstellen'].includes(e.skill)))
  const chosen: Exercise[] = []
  const bySkill = new Set<Skill>()
  // Methodenwahl und Theorie und Rechnen mischen
  for (const ex of hard) {
    if (chosen.length >= 6) break
    if (!bySkill.has(ex.skill) || chosen.length >= 4) {
      chosen.push(ex)
      bySkill.add(ex.skill)
    }
  }
  const genFormulas = shuffle(rng, chapter.lessons.flatMap((l) => l.formulaIds).map((id) => formulaById.get(id)!).filter((f) => f?.generator))
  for (const f of genFormulas.slice(0, 2)) {
    const g = generatedFor(f, seedFor(state, `boss:${chapterId}:${f.id}`))
    if (g) chosen.push({ ...g, difficulty: 3 })
  }
  if (chosen.length === 0) return null
  const minutes = chosen.reduce((s, e) => s + (e.estMinutes ?? (e.type === 'steps' ? 5 : 2)), 0)
  return {
    id: `boss:${chapterId}:${Date.now()}`,
    mode: 'boss',
    title: `Boss-Challenge ${chapter.number}`,
    subtitle: chapter.title,
    items: shuffle(rng, chosen).map((exercise) => ({ kind: 'exercise' as const, exercise })),
    chapterId,
    ...(timed ? { timeLimit: Math.round(minutes * 60) } : {}),
  }
}

export function buildArenaSession(state: AppState, chapterIds: string[], count: number, timed: boolean): Session | null {
  const rng = mulberry32(seedFor(state, `arena:${chapterIds.join(',')}`))
  const pool = shuffle(rng, exercises.filter((e) => chapterIds.includes(e.chapterId) && isGradable(e) && e.type !== 'selfcheck'))
  const chosen = pool.slice(0, count)
  if (chosen.length === 0) return null
  const minutes = chosen.reduce((s, e) => s + (e.estMinutes ?? (e.type === 'steps' ? 5 : 2)), 0)
  return {
    id: `arena:${Date.now()}`,
    mode: 'arena',
    title: 'Themen-Training',
    subtitle: `${chosen.length} Aufgaben${timed ? ' · mit Zeitlimit' : ''}`,
    items: chosen.map((exercise) => ({ kind: 'exercise' as const, exercise })),
    ...(timed ? { timeLimit: Math.round(minutes * 60), deferFeedback: true } : {}),
  }
}

export function buildRetrySession(exerciseIds: string[]): Session | null {
  const items = exerciseIds.map((id) => exerciseById.get(id)).filter((e): e is Exercise => !!e).map((exercise) => ({ kind: 'exercise' as const, exercise }))
  if (!items.length) return null
  return { id: `retry:${Date.now()}`, mode: 'practice', title: 'Fehler erneut üben', items }
}

// ------------------------------------------------------------------ Lernpfad

export type LessonStatus = 'abgeschlossen' | 'verfügbar' | 'gesperrt'

/**
 * Innerhalb eines Kapitels bauen Lektionen aufeinander auf (fachlicher Grund: spätere
 * Formeln verwenden frühere). Eine Lektion ist verfügbar, wenn die vorherige abgeschlossen
 * ist. Kapitel selbst sind nicht gesperrt – Finanzierung, Rechnungswesen und JB sind unabhängig.
 * Gesperrte Lektionen können bewusst trotzdem gestartet werden.
 */
export function lessonStatus(state: AppState, lesson: Lesson & { chapterId: string; index: number }): LessonStatus {
  if (state.lessons[lesson.id]) return 'abgeschlossen'
  if (lesson.index === 0) return 'verfügbar'
  const prev = chapterById.get(lesson.chapterId)!.lessons[lesson.index - 1]!
  return state.lessons[prev.id] ? 'verfügbar' : 'gesperrt'
}

export function bossUnlocked(state: AppState, chapter: Chapter): boolean {
  return chapter.lessons.every((l) => !!state.lessons[l.id])
}

export function chapterProgress(state: AppState, chapter: Chapter): { done: number; total: number; mastered: number; formulas: number; bossPassed: boolean } {
  const done = chapter.lessons.filter((l) => state.lessons[l.id]).length
  const fids = chapter.lessons.flatMap((l) => l.formulaIds)
  const mastered = fids.filter((id) => formulaMastery(state, id).level === 'beherrscht').length
  return { done, total: chapter.lessons.length, mastered, formulas: fids.length, bossPassed: !!state.bosses[chapter.id]?.passed }
}

/** Nächste empfohlene Lektion: erste nicht abgeschlossene, verfügbare Lektion im zuletzt bearbeiteten Teil. */
export function nextLesson(state: AppState): (Lesson & { chapterId: string; index: number }) | null {
  const lastLesson = Object.entries(state.lessons).sort((a, b) => b[1].lastAt.localeCompare(a[1].lastAt))[0]
  const lastChapter = lastLesson ? lessons.find((l) => l.id === lastLesson[0])?.chapterId : undefined
  const order = lastChapter ? [...chapters.filter((c) => c.id === lastChapter), ...chapters.slice(chapters.findIndex((c) => c.id === lastChapter) + 1), ...chapters] : chapters
  for (const c of order) {
    for (const l of lessons.filter((x) => x.chapterId === c.id)) if (lessonStatus(state, l) === 'verfügbar') return l
  }
  return null
}

export function currentChapter(state: AppState): Chapter {
  const nl = nextLesson(state)
  return chapterById.get(nl?.chapterId ?? chapters[0]!.id)!
}

export { BOSS_PASS }
