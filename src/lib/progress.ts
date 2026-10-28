/**
 * Lernfortschritt: Datenmodell und reine Update-Funktionen.
 * Der Zustand ist ein einfaches JSON-Objekt – so lassen sich Export/Import und eine
 * spätere Synchronisation ohne Umbau der Lernlogik ergänzen.
 */
import type { Skill } from '../content/types'
import { localDay, type Day } from './dates'
import type { GoalKind, DayStats } from './gamification'
import { xpForAttempt, XP_RULES } from './gamification'
import { attemptOutcome, updateSkill, type SkillScores } from './mastery'
import { qualityFrom, schedule, type SrsCard } from './srs'

export const STATE_VERSION = 1

export type Mode = 'lesson' | 'review' | 'weakness' | 'boss' | 'practice' | 'exam' | 'arena'

export interface AttemptRecord {
  exId: string
  at: string
  day: Day
  correct: boolean
  score: number
  hints: number
  ms: number
  skill: Skill
  formulaIds: string[]
  mode: Mode
  type: string
  xp: number
}

export interface ExerciseStat {
  attempts: number
  correct: number
  wrong: number
  hintsUsed: number
  lastAt: string
  last: number[]
  totalMs: number
}

export interface FormulaProgress {
  skills: SkillScores
  attempts: number
  correct: number
  lastAt?: string
  srs?: SrsCard
  wrongLog: { at: string; exId: string }[]
}

export interface ExamTaskResult {
  taskId: string
  points: number
  maxPoints: number
  estimated: boolean
}

export interface ExamAttempt {
  id: string
  examId: string
  at: string
  timed: boolean
  durationMs: number
  points: number
  maxPoints: number
  tasks: ExamTaskResult[]
}

export interface Settings {
  name: string
  dailyGoal: { kind: GoalKind; target: number }
  theme: 'system' | 'light' | 'dark'
  bossTimer: boolean
  reduceMotion: boolean
}

export interface AppState {
  version: number
  createdAt: string
  settings: Settings
  xp: number
  daily: Record<Day, DayStats>
  exercise: Record<string, ExerciseStat>
  formula: Record<string, FormulaProgress>
  lessons: Record<string, { firstAt: string; lastAt: string; best: number; times: number }>
  bosses: Record<string, { firstAt: string; lastAt: string; best: number; passed: boolean }>
  achievements: Record<string, string>
  favorites: string[]
  exams: ExamAttempt[]
  /** Anzahl richtiger Lösungen je Aufgabe heute (gegen XP-Farming). */
  today: { day: Day; correctCount: Record<string, number>; fixed: string[]; goalRewarded: boolean; reviewRewarded: number }
  quests: Record<Day, string[]>
  /** Zuletzt falsch beantwortete Aufgaben (neueste zuerst). */
  recentWrong: string[]
  log: AttemptRecord[]
}

export const MAX_LOG = 4000

export function initialState(now = new Date()): AppState {
  return {
    version: STATE_VERSION,
    createdAt: now.toISOString(),
    settings: { name: '', dailyGoal: { kind: 'xp', target: 50 }, theme: 'system', bossTimer: false, reduceMotion: false },
    xp: 0,
    daily: {},
    exercise: {},
    formula: {},
    lessons: {},
    bosses: {},
    achievements: {},
    favorites: [],
    exams: [],
    today: { day: localDay(now), correctCount: {}, fixed: [], goalRewarded: false, reviewRewarded: 0 },
    quests: {},
    recentWrong: [],
    log: [],
  }
}

function ensureToday(s: AppState, day: Day): AppState['today'] {
  return s.today.day === day ? s.today : { day, correctCount: {}, fixed: [], goalRewarded: false, reviewRewarded: 0 }
}

function bumpDay(daily: AppState['daily'], day: Day, delta: Partial<DayStats>): AppState['daily'] {
  const cur = daily[day] ?? { xp: 0, exercises: 0, correct: 0, ms: 0, lessons: 0 }
  return {
    ...daily,
    [day]: {
      xp: cur.xp + (delta.xp ?? 0),
      exercises: cur.exercises + (delta.exercises ?? 0),
      correct: cur.correct + (delta.correct ?? 0),
      ms: cur.ms + (delta.ms ?? 0),
      lessons: cur.lessons + (delta.lessons ?? 0),
    },
  }
}

export function addXp(s: AppState, amount: number, now: Date): AppState {
  if (amount <= 0) return s
  const day = localDay(now)
  return { ...s, xp: s.xp + amount, daily: bumpDay(s.daily, day, { xp: amount }) }
}

export interface AttemptInput {
  exId: string
  skill: Skill
  difficulty: 1 | 2 | 3
  formulaIds: string[]
  formulaDifficulty: Record<string, 1 | 2 | 3>
  correct: boolean
  /** 0–1, Teilpunkte bei Schritt-/Zuordnungsaufgaben. */
  score: number
  hintsUsed: number
  ms: number
  mode: Mode
  type: string
  /** In Klausursimulationen gibt es pro Aufgabe keine XP (XP gibt es für die ganze Simulation). */
  awardXp?: boolean
  /** Selbsteinschätzungen fließen nur abgeschwächt in die Kompetenz ein. */
  selfAssessed?: boolean
}

export function recordAttempt(state: AppState, a: AttemptInput, now = new Date()): { state: AppState; xp: number } {
  const day = localDay(now)
  const iso = now.toISOString()
  const today = ensureToday(state, day)
  const prevStat = state.exercise[a.exId]
  const wasWrongBefore = state.recentWrong.includes(a.exId)
  const repeatIndex = today.correctCount[a.exId] ?? 0
  const xp = a.awardXp === false ? 0 : xpForAttempt({ difficulty: a.difficulty, correct: a.correct, hintsUsed: a.hintsUsed, repeatIndex, fixedPreviousError: wasWrongBefore && !today.fixed.includes(a.exId), partialScore: a.score })

  const stat: ExerciseStat = {
    attempts: (prevStat?.attempts ?? 0) + 1,
    correct: (prevStat?.correct ?? 0) + (a.correct ? 1 : 0),
    wrong: (prevStat?.wrong ?? 0) + (a.correct ? 0 : 1),
    hintsUsed: (prevStat?.hintsUsed ?? 0) + a.hintsUsed,
    lastAt: iso,
    last: [...(prevStat?.last ?? []), a.score].slice(-5),
    totalMs: (prevStat?.totalMs ?? 0) + a.ms,
  }

  const formula = { ...state.formula }
  const outcomeRaw = attemptOutcome(a.correct, a.hintsUsed, a.score)
  for (const fid of a.formulaIds) {
    const fp = formula[fid] ?? { skills: {}, attempts: 0, correct: 0, wrongLog: [] }
    const outcome = a.selfAssessed ? outcomeRaw * 0.8 : outcomeRaw
    const skills = { ...fp.skills, [a.skill]: updateSkill(fp.skills[a.skill], outcome) }
    const diff = a.formulaDifficulty[fid] ?? 2
    const srs = schedule(fp.srs, qualityFrom(a.correct, a.hintsUsed, diff, a.score), day, diff)
    formula[fid] = {
      skills,
      attempts: fp.attempts + 1,
      correct: fp.correct + (a.correct ? 1 : 0),
      lastAt: iso,
      srs,
      wrongLog: a.correct ? fp.wrongLog : [...fp.wrongLog, { at: iso, exId: a.exId }].slice(-20),
    }
  }

  let recentWrong = state.recentWrong.filter((id) => id !== a.exId)
  if (!a.correct) recentWrong = [a.exId, ...recentWrong].slice(0, 60)

  const record: AttemptRecord = { exId: a.exId, at: iso, day, correct: a.correct, score: a.score, hints: a.hintsUsed, ms: a.ms, skill: a.skill, formulaIds: a.formulaIds, mode: a.mode, type: a.type, xp }

  let next: AppState = {
    ...state,
    exercise: { ...state.exercise, [a.exId]: stat },
    formula,
    recentWrong,
    today: {
      ...today,
      correctCount: a.correct ? { ...today.correctCount, [a.exId]: repeatIndex + 1 } : today.correctCount,
      fixed: a.correct && wasWrongBefore ? [...today.fixed, a.exId] : today.fixed,
    },
    log: [...state.log, record].slice(-MAX_LOG),
    daily: bumpDay(state.daily, day, { exercises: 1, correct: a.correct ? 1 : 0, ms: Math.min(a.ms, 10 * 60000) }),
  }
  next = addXp(next, xp, now)
  return { state: next, xp }
}

export function recordLessonComplete(state: AppState, lessonId: string, score: number, now = new Date()): { state: AppState; xp: number } {
  const iso = now.toISOString()
  const prev = state.lessons[lessonId]
  const xp = prev ? XP_RULES.lessonRepeat : XP_RULES.lessonFirst
  let next: AppState = {
    ...state,
    lessons: { ...state.lessons, [lessonId]: { firstAt: prev?.firstAt ?? iso, lastAt: iso, best: Math.max(prev?.best ?? 0, score), times: (prev?.times ?? 0) + 1 } },
    daily: bumpDay(state.daily, localDay(now), { lessons: 1 }),
  }
  next = addXp(next, xp, now)
  return { state: next, xp }
}

export const BOSS_PASS = 0.7

export function recordBoss(state: AppState, chapterId: string, score: number, now = new Date()): { state: AppState; xp: number; passed: boolean } {
  const iso = now.toISOString()
  const prev = state.bosses[chapterId]
  const passed = score >= BOSS_PASS
  const xp = passed ? (prev?.passed ? XP_RULES.bossRepeat : XP_RULES.bossFirst) : 0
  let next: AppState = {
    ...state,
    bosses: { ...state.bosses, [chapterId]: { firstAt: prev?.firstAt ?? iso, lastAt: iso, best: Math.max(prev?.best ?? 0, score), passed: (prev?.passed ?? false) || passed } },
  }
  next = addXp(next, xp, now)
  return { state: next, xp, passed }
}

export function recordReviewSession(state: AppState, now = new Date()): { state: AppState; xp: number } {
  const day = localDay(now)
  const today = ensureToday(state, day)
  // höchstens drei Wiederholungsbelohnungen pro Tag
  if (today.reviewRewarded >= 3) return { state: { ...state, today }, xp: 0 }
  const next = addXp({ ...state, today: { ...today, reviewRewarded: today.reviewRewarded + 1 } }, XP_RULES.reviewSession, now)
  return { state: next, xp: XP_RULES.reviewSession }
}

export function recordExam(state: AppState, attempt: ExamAttempt, now = new Date()): { state: AppState; xp: number } {
  const day = localDay(now)
  const sameDay = state.exams.some((e) => e.examId === attempt.examId && localDay(new Date(e.at)) === day)
  const pct = attempt.maxPoints > 0 ? (attempt.points / attempt.maxPoints) * 100 : 0
  const xp = sameDay ? XP_RULES.examRepeatSameDay : Math.round(pct * XP_RULES.examPerPercent)
  const next = addXp({ ...state, exams: [...state.exams, attempt].slice(-50) }, xp, now)
  return { state: next, xp }
}

export function toggleFavorite(state: AppState, formulaId: string): AppState {
  const has = state.favorites.includes(formulaId)
  return { ...state, favorites: has ? state.favorites.filter((f) => f !== formulaId) : [...state.favorites, formulaId] }
}

/** Tage mit mindestens einer richtig gelösten Aufgabe. */
export function activeDays(state: AppState): Day[] {
  return Object.entries(state.daily)
    .filter(([, s]) => s.correct > 0)
    .map(([d]) => d)
}
