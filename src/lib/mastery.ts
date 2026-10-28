/**
 * Kompetenzprofil je Formel und Kompetenzdimension.
 *
 * Jede Dimension hat einen Wert zwischen 0 und 1, der nach jedem Versuch per
 * exponentiell gleitendem Mittel angepasst wird:
 *   neu = alt + α · (Ergebnis − alt),  α = 0,35
 * Ergebnis: korrekt ohne Hinweis = 1, mit Hinweisen 0,7 / 0,5 / 0,35, falsch = 0
 * (bei Teilpunkten wird mit dem Teilergebnis gerechnet).
 *
 * „Beherrscht“ verlangt mehr als Wiedererkennen: mindestens min(3, verfügbare
 * Dimensionen) Dimensionen ≥ 0,8, davon mindestens eine aktive Dimension
 * (abrufen, einsetzen, umstellen oder anwenden), sofern es für die Formel
 * aktive Aufgaben gibt. Eine richtige Multiple-Choice-Antwort allein reicht nie.
 */
import type { Skill } from '../content/types'

export const ALPHA = 0.35
export const ACTIVE_SKILLS: readonly Skill[] = ['abrufen', 'einsetzen', 'umstellen', 'anwenden']

export type SkillScores = Partial<Record<Skill, number>>

export function attemptOutcome(correct: boolean, hintsUsed: number, partialScore?: number): number {
  const base = partialScore !== undefined ? partialScore : correct ? 1 : 0
  if (base <= 0) return 0
  const hintFactor = hintsUsed <= 0 ? 1 : hintsUsed === 1 ? 0.7 : hintsUsed === 2 ? 0.5 : 0.35
  return base * hintFactor
}

export function updateSkill(prev: number | undefined, outcome: number): number {
  // Erster Versuch: Startwert 0, damit eine einzelne richtige Antwort nicht sofort „sicher“ bedeutet.
  const p = prev ?? 0
  return Math.min(1, Math.max(0, p + ALPHA * (outcome - p)))
}

export type MasteryLevel = 'neu' | 'lernend' | 'gefestigt' | 'beherrscht'

export const MASTERY_LABELS: Record<MasteryLevel, string> = {
  neu: 'Neu',
  lernend: 'Am Lernen',
  gefestigt: 'Gefestigt',
  beherrscht: 'Beherrscht',
}

export interface MasteryInfo {
  level: MasteryLevel
  /** Durchschnitt über die verfügbaren Dimensionen (0–1). */
  score: number
}

export function masteryOf(skills: SkillScores | undefined, available: readonly Skill[]): MasteryInfo {
  if (!skills || Object.keys(skills).length === 0 || available.length === 0) return { level: 'neu', score: 0 }
  const vals = available.map((s) => skills[s] ?? 0)
  const score = vals.reduce((a, b) => a + b, 0) / vals.length
  const strong = available.filter((s) => (skills[s] ?? 0) >= 0.8)
  const activeAvailable = available.filter((s) => ACTIVE_SKILLS.includes(s))
  const needActive = activeAvailable.length > 0
  const hasActive = strong.some((s) => ACTIVE_SKILLS.includes(s))
  if (strong.length >= Math.min(3, available.length) && (!needActive || hasActive)) return { level: 'beherrscht', score }
  const practiced = available.filter((s) => (skills[s] ?? 0) > 0).length
  if (score >= 0.5 && practiced >= Math.min(2, available.length)) return { level: 'gefestigt', score }
  return { level: 'lernend', score }
}
