/**
 * Erfolge – jeder an ein reales, im Lernstand nachweisbares Ereignis gekoppelt.
 * Tägliche Quests – aus den tatsächlich vorhandenen Inhalten und dem heutigen Lernprotokoll berechnet.
 */
import { chapters, exerciseById } from '../content'
import { localDay, type Day } from './dates'
import { computeStreak } from './gamification'
import { hashString, mulberry32, shuffle } from './math/random'
import { activeDays, type AppState } from './progress'
import { formulaMastery } from './engine'

export interface Achievement {
  id: string
  title: string
  description: string
  icon: 'sparkles' | 'book' | 'flame' | 'brain' | 'wrench' | 'crown' | 'scroll' | 'target' | 'trophy'
  check: (s: AppState) => boolean
}

export const ACHIEVEMENTS: Achievement[] = [
  { id: 'first-correct', title: 'Erste Formel gelernt', description: 'Die erste Aufgabe richtig gelöst.', icon: 'sparkles', check: (s) => s.log.some((r) => r.correct) },
  { id: 'first-lesson', title: 'Erste Lektion abgeschlossen', description: 'Eine Lektion vollständig durchgearbeitet.', icon: 'book', check: (s) => Object.keys(s.lessons).length > 0 },
  { id: 'recall', title: 'Aus dem Kopf', description: 'Eine Formel ohne Hinweis frei aus dem Gedächtnis eingegeben.', icon: 'brain', check: (s) => s.log.some((r) => r.correct && r.type === 'formula' && r.hints === 0) },
  { id: 'fixer', title: 'Fehler korrigiert', description: 'Eine zuvor falsch beantwortete Aufgabe später richtig gelöst.', icon: 'wrench', check: (s) => hasFixedError(s) },
  { id: 'streak-3', title: 'Drei Tage am Stück', description: 'An drei aufeinanderfolgenden Tagen gelernt.', icon: 'flame', check: (s) => computeStreak(activeDays(s), localDay()).longest >= 3 },
  { id: 'streak-7', title: 'Sieben Tage gelernt', description: 'An sieben aufeinanderfolgenden Tagen gelernt.', icon: 'flame', check: (s) => computeStreak(activeDays(s), localDay()).longest >= 7 },
  { id: 'mastered-1', title: 'Formel sicher beherrscht', description: 'Eine Formel in mehreren Kompetenzen sicher beherrscht.', icon: 'target', check: (s) => Object.keys(s.formula).some((id) => formulaMastery(s, id).level === 'beherrscht') },
  { id: 'chapter', title: 'Erstes Kapitel gemeistert', description: 'Alle Lektionen eines Kapitels abgeschlossen und die Boss-Challenge bestanden.', icon: 'crown', check: (s) => chapters.some((c) => c.lessons.every((l) => s.lessons[l.id]) && s.bosses[c.id]?.passed) },
  { id: 'exam', title: 'Erste Klausur simuliert', description: 'Eine vollständige Klausursimulation abgegeben.', icon: 'scroll', check: (s) => s.exams.length > 0 },
  { id: 'hundred', title: 'Hundert Aufgaben', description: '100 Aufgaben bearbeitet.', icon: 'trophy', check: (s) => s.log.length >= 100 },
]

function hasFixedError(s: AppState): boolean {
  const wrongSeen = new Set<string>()
  for (const r of s.log) {
    if (!r.correct) wrongSeen.add(r.exId)
    else if (wrongSeen.has(r.exId)) return true
  }
  return false
}

/** Prüft alle Erfolge und gibt neu freigeschaltete zurück. */
export function evaluateAchievements(state: AppState, now = new Date()): { state: AppState; unlocked: Achievement[] } {
  const unlocked = ACHIEVEMENTS.filter((a) => !state.achievements[a.id] && a.check(state))
  if (!unlocked.length) return { state, unlocked }
  const achievements = { ...state.achievements }
  for (const a of unlocked) achievements[a.id] = now.toISOString()
  return { state: { ...state, achievements }, unlocked }
}

// ------------------------------------------------------------------ Quests

export interface Quest {
  id: string
  title: string
  target: number
  progress: number
}

type QuestTemplate = { id: string; title: string; target: number; count: (s: AppState, day: Day) => number; available?: (s: AppState) => boolean }

const TEMPLATES: QuestTemplate[] = [
  { id: 'recall3', title: 'Drei Formeln ohne Hinweis aus dem Gedächtnis eingeben', target: 3, count: (s, d) => s.log.filter((r) => r.day === d && r.correct && r.type === 'formula' && r.hints === 0).length },
  { id: 'calc5', title: 'Fünf Rechenaufgaben richtig lösen', target: 5, count: (s, d) => s.log.filter((r) => r.day === d && r.correct && (r.type === 'numeric' || r.type === 'steps')).length },
  { id: 'fix3', title: 'Drei frühere Fehler korrigieren', target: 3, available: (s) => s.recentWrong.length >= 3, count: (s) => s.today.fixed.length },
  { id: 'theory-multi', title: 'Eine Theoriefrage und eine mehrstufige Aufgabe richtig lösen', target: 2, count: (s, d) => {
    const today = s.log.filter((r) => r.day === d && r.correct)
    const theory = today.some((r) => r.type === 'mc' && exerciseById.get(r.exId)?.skill === 'interpretieren')
    const multi = today.some((r) => r.type === 'steps')
    return (theory ? 1 : 0) + (multi ? 1 : 0)
  } },
  { id: 'nohint5', title: 'Fünf Aufgaben ohne Hinweis lösen', target: 5, count: (s, d) => s.log.filter((r) => r.day === d && r.correct && r.hints === 0).length },
  { id: 'review', title: 'Eine Wiederholungs- oder Schwächen-Runde abschließen', target: 1, count: (s, d) => (s.log.some((r) => r.day === d && (r.mode === 'review' || r.mode === 'weakness')) ? 1 : 0) },
]

export function dailyQuests(state: AppState, day: Day = localDay()): Quest[] {
  const rng = mulberry32(hashString(`quests:${day}`))
  const pool = TEMPLATES.filter((t) => !t.available || t.available(state))
  return shuffle(rng, pool)
    .slice(0, 3)
    .map((t) => ({ id: t.id, title: t.title, target: t.target, progress: Math.min(t.target, t.count(state, day)) }))
}
