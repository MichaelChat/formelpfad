/**
 * Wiederholungsplanung (vereinfachtes SM-2, dokumentiert in docs/learning-model.md).
 *
 * Pro Formel gibt es eine „Karte“ mit Leichtigkeitsfaktor (ease), Intervall und Fälligkeit.
 * Qualität q (0–5) eines Versuchs:
 *   korrekt ohne Hinweis: 5 (schwere Formel: 4) · korrekt mit Hinweisen: 3 · falsch: 1
 * Regeln:
 * - q < 3: Wiederholung morgen, Wiederholungszähler auf 0, ease sinkt (Fehler zählen stark).
 * - q ≥ 3: Intervall 1 → 3 → Intervall · ease (gerundet), höchstens 60 Tage.
 * - Pro Tag zählt nur EIN positiver Schritt je Formel (Mehrfachwiederholung am selben
 *   Tag verlängert das Intervall nicht künstlich). Fehler wirken immer sofort.
 * - Wiederholte Fehler (lapses) senken ease zusätzlich.
 */
import { addDays, daysBetween, type Day } from './dates'

export interface SrsCard {
  ease: number
  interval: number
  reps: number
  lapses: number
  due: Day
  lastReviewed: Day
}

export const MIN_EASE = 1.3
export const MAX_INTERVAL = 60

export function initialCard(today: Day, difficulty: 1 | 2 | 3): SrsCard {
  return { ease: difficulty === 3 ? 2.2 : difficulty === 2 ? 2.4 : 2.5, interval: 0, reps: 0, lapses: 0, due: today, lastReviewed: today }
}

export function qualityFrom(correct: boolean, hintsUsed: number, difficulty: 1 | 2 | 3, partialScore?: number): number {
  const score = partialScore ?? (correct ? 1 : 0)
  if (score < 0.5) return 1
  if (hintsUsed > 0 || score < 1) return 3
  return difficulty === 3 ? 4 : 5
}

export function schedule(card: SrsCard | undefined, q: number, today: Day, difficulty: 1 | 2 | 3): SrsCard {
  const c = card ?? initialCard(today, difficulty)
  if (q < 3) {
    const ease = Math.max(MIN_EASE, c.ease - 0.2 - (c.lapses >= 2 ? 0.1 : 0))
    return { ease, interval: 1, reps: 0, lapses: c.lapses + 1, due: addDays(today, 1), lastReviewed: today }
  }
  // Nur ein positiver Schritt pro Tag
  if (c.reps > 0 && c.lastReviewed === today) return c
  const ease = Math.max(MIN_EASE, c.ease + (0.1 - (5 - q) * (0.08 + (5 - q) * 0.02)))
  const reps = c.reps + 1
  const interval = reps === 1 ? 1 : reps === 2 ? 3 : Math.min(MAX_INTERVAL, Math.round(c.interval * ease))
  return { ease, interval, reps, lapses: c.lapses, due: addDays(today, interval), lastReviewed: today }
}

export function isDue(card: SrsCard | undefined, today: Day): boolean {
  return !!card && daysBetween(card.due, today) >= 0
}

export function overdueDays(card: SrsCard, today: Day): number {
  return daysBetween(card.due, today)
}
