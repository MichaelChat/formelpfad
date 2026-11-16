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
import * as num1 from './data/num-1'
import * as num2 from './data/num-2'
import * as num3 from './data/num-3'
import * as num4 from './data/num-4'
import { DEFAULT_SUBJECT, isKnowledge, isSubjectId, PARTS, partsOf, SUBJECTS, type CardKind, type Chapter, type Exam, type Exercise, type Formula, type Lesson, type PartId, type Subject, type SubjectId } from './types'

interface ContentModule {
  chapters: Chapter[]
  formulas: Formula[]
  exercises: Exercise[]
  officialChecks: { id: string; value: number; dec: number; note: string }[]
  /** Zusätzliche Lektionen für Kapitel aus anderen Dateien (z. B. Wissen zu einem Formelkapitel). */
  extraLessons?: { chapterId: string; lessons: Lesson[] }[]
}

const modules: ContentModule[] = [fin1, fin2, rw1, rw2, jb, wissenFin, wissenRw, wissenJb, wissenAbruf, num1, num2, num3, num4]

/** Kapitel in fester Reihenfolge je Teil; Zusatzlektionen werden an ihr Kapitel angehängt. */
const CHAPTER_ORDER = ['fin-grundlagen', 'fin-zeitwert', 'fin-renten', 'fin-anleihen', 'fin-invest', 'fin-aktien', 'fin-portfolio', 'rw-grundlagen', 'rw-bilanz', 'rw-bewertung', 'rw-kosten', 'rw-kostenstellen', 'rw-kostentraeger', 'jb-grundlagen', 'jb-ansatz', 'jb-bewertung', 'jb-guv', 'jb-anhang', 'num-gleitpunkt', 'num-lr', 'num-qr', 'num-kondition', 'num-ausgleich', 'num-newton', 'num-interpolation', 'num-spline', 'num-quadratur', 'num-eigenwerte', 'num-iterativ']

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
export const exams: Exam[] = [...exam.exams, ...num4.exams]
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

// ------------------------------------------------------------------ Fächer

/** Fach eines Kapitels (über seinen Teil). */
export function subjectOfChapter(chapterId: string): SubjectId | undefined {
  const c = chapterById.get(chapterId)
  return c ? PARTS[c.part].subject : undefined
}

/** Fach einer Klausur: abgeleitet aus den Kapiteln ihrer Aufgaben. */
export function subjectOfExam(exam: Exam): SubjectId | undefined {
  const cid = exam.sections.flatMap((s) => s.tasks)[0]?.chapterId
  return cid ? subjectOfChapter(cid) : undefined
}

/** Alle Inhalte eines Fachs. Seiten und Lern-Engine arbeiten nur mit diesem Ausschnitt. */
export interface SubjectScope {
  subject: Subject
  parts: PartId[]
  chapters: Chapter[]
  chapterIds: Set<string>
  formulas: Formula[]
  exercises: Exercise[]
  lessons: typeof lessons
  exams: Exam[]
  cardsOfKind: (kind: CardKind) => Formula[]
}

const scopeCache = new Map<SubjectId, SubjectScope>()

export function scopeFor(id: SubjectId): SubjectScope {
  const cached = scopeCache.get(id)
  if (cached) return cached
  const sChapters = chapters.filter((c) => PARTS[c.part].subject === id)
  const chapterIds = new Set(sChapters.map((c) => c.id))
  const sFormulas = formulas.filter((f) => chapterIds.has(f.chapterId))
  const scope: SubjectScope = {
    subject: SUBJECTS[id],
    parts: partsOf(id),
    chapters: sChapters,
    chapterIds,
    formulas: sFormulas,
    exercises: exercises.filter((e) => chapterIds.has(e.chapterId)),
    lessons: lessons.filter((l) => chapterIds.has(l.chapterId)),
    exams: exams.filter((e) => subjectOfExam(e) === id),
    cardsOfKind: (kind) => sFormulas.filter((f) => (kind === 'wissen' ? isKnowledge(f) : !isKnowledge(f))),
  }
  scopeCache.set(id, scope)
  return scope
}

/** Aktives Fach aus dem Lernstand; unbekannte oder noch nicht verfügbare Fächer fallen auf das Standardfach zurück. */
export function activeSubjectId(state: { settings: { subject?: string } }): SubjectId {
  const s = state.settings.subject
  return isSubjectId(s) && SUBJECTS[s].available ? s : DEFAULT_SUBJECT
}

/** Inhalte des aktiven Fachs. */
export function scopeOf(state: { settings: { subject?: string } }): SubjectScope {
  return scopeFor(activeSubjectId(state))
}
