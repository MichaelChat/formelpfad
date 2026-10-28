/**
 * Klausursimulation: Bewertung nach Abgabe.
 * - Rechenaufgaben: volle Punkte bei richtiger Lösung.
 * - Schrittaufgaben: Punkte je Schritt (offizielle Teilpunkte, falls angegeben, sonst gleichmäßig).
 * - Mehrfachauswahl: (richtig gewählt − falsch gewählt) / Anzahl richtiger, mindestens 0
 *   (Teilpunkt-Schätzung der App, gekennzeichnet).
 * - Zuordnung: Anteil richtiger Paare.
 * - Offene Fragen: Selbsteinschätzung anhand der Musterlösung (0 / ½ / volle Punkte).
 */
import type { Exam, Exercise } from '../content/types'
import { exerciseById, estimatedPointTasks } from '../content'

export interface ExerciseResult {
  /** 0–1 */
  score: number
  correct: boolean
  /** Ergebnis ist eine Schätzung (Teilpunkte bei Mehrfachauswahl/Selbsteinschätzung). */
  estimated: boolean
}

export function stepWeights(ex: Exercise): number[] {
  if (ex.type !== 'steps') return []
  const pts = ex.steps.map((s) => s.points)
  if (pts.every((p) => typeof p === 'number')) {
    const sum = pts.reduce<number>((a, b) => a + (b ?? 0), 0)
    return pts.map((p) => (p ?? 0) / sum)
  }
  return ex.steps.map(() => 1 / ex.steps.length)
}

export function scoreSteps(ex: Exercise, stepCorrect: boolean[]): number {
  const w = stepWeights(ex)
  return w.reduce((s, wi, i) => s + (stepCorrect[i] ? wi : 0), 0)
}

export function scoreMulti(selected: string[], ex: Exercise): number {
  if (ex.type !== 'mc') return 0
  const correct = ex.options.filter((o) => o.correct).map((o) => o.id)
  const right = selected.filter((id) => correct.includes(id)).length
  const wrong = selected.filter((id) => !correct.includes(id)).length
  if (!ex.multi) return right === 1 && wrong === 0 ? 1 : 0
  return Math.max(0, (right - wrong) / correct.length)
}

export interface TaskScore {
  taskId: string
  number: string
  title: string
  topic: string
  chapterId: string
  points: number
  maxPoints: number
  estimated: boolean
}

export function scoreExam(exam: Exam, results: Record<string, ExerciseResult>): { tasks: TaskScore[]; points: number; maxPoints: number; byTopic: { topic: string; points: number; maxPoints: number }[] } {
  const tasks: TaskScore[] = []
  for (const section of exam.sections) {
    for (const task of section.tasks) {
      const exScores = task.exerciseIds.map((id) => results[id]?.score ?? 0)
      const avg = exScores.length ? exScores.reduce((a, b) => a + b, 0) / exScores.length : 0
      const est = task.exerciseIds.some((id) => results[id]?.estimated) || estimatedPointTasks.has(task.id)
      tasks.push({ taskId: task.id, number: task.number, title: task.title, topic: task.topic, chapterId: task.chapterId, points: Math.round(avg * task.points * 100) / 100, maxPoints: task.points, estimated: est })
    }
  }
  const points = Math.round(tasks.reduce((s, t) => s + t.points, 0) * 100) / 100
  const maxPoints = tasks.reduce((s, t) => s + t.maxPoints, 0)
  const topics = new Map<string, { points: number; maxPoints: number }>()
  for (const t of tasks) {
    const cur = topics.get(t.topic) ?? { points: 0, maxPoints: 0 }
    topics.set(t.topic, { points: cur.points + t.points, maxPoints: cur.maxPoints + t.maxPoints })
  }
  return { tasks, points, maxPoints, byTopic: [...topics.entries()].map(([topic, v]) => ({ topic, ...v })) }
}

export function examExercises(exam: Exam): Exercise[] {
  return exam.sections.flatMap((s) => s.tasks.flatMap((t) => t.exerciseIds.map((id) => exerciseById.get(id)).filter((e): e is Exercise => !!e)))
}

/**
 * Klausurrelevanz: Zählt, in wie vielen ausgewerteten Klausuren und Aufgaben eine Formel vorkommt
 * und wie viele Punkte die zugehörigen Aufgaben haben. Keine Wahrscheinlichkeiten.
 */
export function relevance(exams: Exam[]): Map<string, { exams: number; tasks: number; points: number }> {
  const out = new Map<string, { exams: number; tasks: number; points: number }>()
  for (const exam of exams) {
    const seenInExam = new Set<string>()
    for (const section of exam.sections) {
      for (const task of section.tasks) {
        const fids = new Set(task.exerciseIds.flatMap((id) => exerciseById.get(id)?.formulaIds ?? []))
        for (const fid of fids) {
          const cur = out.get(fid) ?? { exams: 0, tasks: 0, points: 0 }
          cur.tasks += 1
          cur.points += task.points / fids.size
          if (!seenInExam.has(fid)) {
            cur.exams += 1
            seenInExam.add(fid)
          }
          out.set(fid, cur)
        }
      }
    }
  }
  return out
}
