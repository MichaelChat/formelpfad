/**
 * Zentrale Punktevergabe (XP), Level, Streaks, Tagesziele.
 * Alle Regeln stehen hier und in docs/learning-model.md.
 */
import { addDays, daysBetween, type Day } from './dates'

export const XP_RULES = {
  /** Richtige Aufgabe nach Schwierigkeit 1/2/3. */
  correct: { 1: 10, 2: 15, 3: 20 } as Record<1 | 2 | 3, number>,
  /** Abzug je benutztem Hinweis (Minimum siehe minCorrect). */
  perHint: 3,
  minCorrect: 3,
  /** Faktor für die n-te richtige Lösung derselben Aufgabe am selben Tag (n = 1, 2, 3, ≥4). */
  repeatFactors: [1, 0.5, 0.2, 0],
  /** Bonus, wenn eine zuvor falsch beantwortete Aufgabe korrigiert wird (einmal pro Tag und Aufgabe). */
  fixBonus: 5,
  lessonFirst: 20,
  lessonRepeat: 5,
  bossFirst: 50,
  bossRepeat: 10,
  reviewSession: 10,
  examPerPercent: 0.6,
  examRepeatSameDay: 10,
  quest: 15,
  dailyGoal: 10,
}

export function xpForAttempt(opts: { difficulty: 1 | 2 | 3; correct: boolean; hintsUsed: number; repeatIndex: number; fixedPreviousError: boolean; partialScore?: number }): number {
  if (!opts.correct && !(opts.partialScore && opts.partialScore > 0)) return 0
  const base = XP_RULES.correct[opts.difficulty]
  const partial = opts.correct ? 1 : opts.partialScore ?? 0
  const afterHints = Math.max(XP_RULES.minCorrect, base * partial - XP_RULES.perHint * opts.hintsUsed)
  const factor = XP_RULES.repeatFactors[Math.min(opts.repeatIndex, XP_RULES.repeatFactors.length - 1)] ?? 0
  const bonus = opts.correct && opts.fixedPreviousError && opts.repeatIndex === 0 ? XP_RULES.fixBonus : 0
  return Math.round(afterHints * factor) + bonus
}

/** Schwelle für Level n (n ≥ 1): 0, 100, 250, 450, 700, 1000, … (Abstand wächst um 50). */
export function levelThreshold(level: number): number {
  return 25 * (level - 1) * (level + 2)
}

export function levelFromXp(xp: number): { level: number; current: number; next: number; progress: number } {
  let level = 1
  while (xp >= levelThreshold(level + 1)) level++
  const current = levelThreshold(level)
  const next = levelThreshold(level + 1)
  return { level, current, next, progress: (xp - current) / (next - current) }
}

/**
 * Streak: Anzahl aufeinanderfolgender Lerntage. Ein Tag zählt, wenn mindestens eine Aufgabe
 * richtig gelöst wurde. Ist heute noch nichts gelernt, läuft die Serie bis gestern weiter
 * (sie bricht erst, wenn ein ganzer Tag ohne Aktivität vergeht).
 */
export function computeStreak(activeDays: Iterable<Day>, today: Day): { current: number; activeToday: boolean; longest: number } {
  const set = new Set(activeDays)
  const activeToday = set.has(today)
  let d = activeToday ? today : addDays(today, -1)
  let current = 0
  while (set.has(d)) {
    current++
    d = addDays(d, -1)
  }
  // längste Serie
  const sorted = [...set].sort()
  let longest = 0
  let run = 0
  let prev: Day | null = null
  for (const day of sorted) {
    run = prev && daysBetween(prev, day) === 1 ? run + 1 : 1
    longest = Math.max(longest, run)
    prev = day
  }
  return { current, activeToday, longest }
}

export type GoalKind = 'xp' | 'exercises' | 'minutes'

export const GOAL_LABELS: Record<GoalKind, string> = { xp: 'XP', exercises: 'Aufgaben', minutes: 'Minuten' }

export interface DayStats {
  xp: number
  exercises: number
  correct: number
  ms: number
  lessons: number
}

export function goalProgress(kind: GoalKind, target: number, stats: DayStats | undefined): { value: number; target: number; done: boolean } {
  const s = stats ?? { xp: 0, exercises: 0, correct: 0, ms: 0, lessons: 0 }
  const value = kind === 'xp' ? s.xp : kind === 'exercises' ? s.exercises : Math.floor(s.ms / 60000)
  return { value, target, done: value >= target }
}
