import * as fin1 from './data/fin-1'
import * as fin2 from './data/fin-2'
import * as rw1 from './data/rw-1'
import * as rw2 from './data/rw-2'
import * as jb from './data/jb'
import * as exam from './data/exam'
import type { Chapter, Exam, Exercise, Formula, Lesson, PartId } from './types'

const modules = [fin1, fin2, rw1, rw2, jb]

export const chapters: Chapter[] = modules.flatMap((m) => m.chapters)
export const formulas: Formula[] = modules.flatMap((m) => m.formulas)
export const exercises: Exercise[] = [...modules.flatMap((m) => m.exercises), ...exam.exercises]
export const exams: Exam[] = exam.exams
export const estimatedPointTasks = exam.estimatedPointTasks
export const officialChecks = modules.flatMap((m) => m.officialChecks)

export const chapterById = new Map(chapters.map((c) => [c.id, c]))
export const formulaById = new Map(formulas.map((f) => [f.id, f]))
export const exerciseById = new Map(exercises.map((e) => [e.id, e]))
export const examById = new Map(exams.map((e) => [e.id, e]))

export const lessons: (Lesson & { chapterId: string; index: number })[] = chapters.flatMap((c) =>
  c.lessons.map((l, index) => ({ ...l, chapterId: c.id, index })),
)
export const lessonById = new Map(lessons.map((l) => [l.id, l]))

const exercisesByFormula = new Map<string, Exercise[]>()
for (const ex of exercises) {
  for (const fid of ex.formulaIds) {
    const list = exercisesByFormula.get(fid) ?? []
    list.push(ex)
    exercisesByFormula.set(fid, list)
  }
}

export function exercisesForFormula(formulaId: string): Exercise[] {
  return exercisesByFormula.get(formulaId) ?? []
}

export function formulasForChapter(chapterId: string): Formula[] {
  return formulas.filter((f) => f.chapterId === chapterId)
}

export function exercisesForChapter(chapterId: string): Exercise[] {
  return exercises.filter((e) => e.chapterId === chapterId)
}

export function chaptersForPart(part: PartId): Chapter[] {
  return chapters.filter((c) => c.part === part)
}

/** Nur geprüfte bzw. mathematisch abgeleitete Aufgaben dürfen bewertet werden. */
export function isGradable(ex: Exercise): boolean {
  return ex.status !== 'ungeprüft'
}
