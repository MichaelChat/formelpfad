import * as fin1 from './data/fin-1'
import * as fin2 from './data/fin-2'
import * as rw1 from './data/rw-1'
import * as rw2 from './data/rw-2'
import * as jb from './data/jb'
import * as wissenFin from './data/wissen-fin'
import * as wissenRw from './data/wissen-rw'
import * as wissenJb from './data/wissen-jb'
import * as wissenAbruf from './data/wissen-abruf'
import * as exam from './data/exam'
import { isKnowledge, type CardKind, type Chapter, type Exam, type Exercise, type Formula, type Lesson, type PartId } from './types'

interface ContentModule {
  chapters: Chapter[]
  formulas: Formula[]
  exercises: Exercise[]
  officialChecks: { id: string; value: number; dec: number; note: string }[]
  /** Zusätzliche Lektionen für Kapitel aus anderen Dateien (z. B. Wissen zu einem Formelkapitel). */
  extraLessons?: { chapterId: string; lessons: Lesson[] }[]
}

const modules: ContentModule[] = [fin1, fin2, rw1, rw2, jb, wissenFin, wissenRw, wissenJb, wissenAbruf]

/** Kapitel in fester Reihenfolge je Teil; Zusatzlektionen werden an ihr Kapitel angehängt. */
const CHAPTER_ORDER = ['fin-grundlagen', 'fin-zeitwert', 'fin-renten', 'fin-anleihen', 'fin-invest', 'fin-aktien', 'fin-portfolio', 'rw-grundlagen', 'rw-bilanz', 'rw-bewertung', 'rw-kosten', 'rw-kostenstellen', 'rw-kostentraeger', 'jb-grundlagen', 'jb-ansatz', 'jb-bewertung', 'jb-guv', 'jb-anhang']

export const chapters: Chapter[] = modules
  .flatMap((m) => m.chapters)
  .map((c) => {
    const extra = modules.flatMap((m) => m.extraLessons ?? []).filter((x) => x.chapterId === c.id).flatMap((x) => x.lessons)
    return extra.length ? { ...c, lessons: [...c.lessons, ...extra] } : c
  })
  .sort((a, b) => {
    const ia = CHAPTER_ORDER.indexOf(a.id)
    const ib = CHAPTER_ORDER.indexOf(b.id)
    return (ia < 0 ? 999 : ia) - (ib < 0 ? 999 : ib)
  })
export const formulas: Formula[] = modules.flatMap((m) => m.formulas)
export const exercises: Exercise[] = [...modules.flatMap((m) => m.exercises), ...exam.exercises]

/** Alle Lernkarten einer Art (Formeln oder Wissen). */
export function cardsOfKind(kind: CardKind): Formula[] {
  return formulas.filter((f) => (kind === 'wissen' ? isKnowledge(f) : !isKnowledge(f)))
}

/** Pfad zur Detailseite einer Karte. */
export function cardPath(f: Pick<Formula, 'id' | 'kind'>): string {
  return `${isKnowledge(f) ? '/wissen' : '/formeln'}/${encodeURIComponent(f.id)}`
}
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
