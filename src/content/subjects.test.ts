import { describe, expect, it } from 'vitest'
import { activeSubjectId, chapters, exams, exercises, formulas, lessons, scopeFor, subjectOfExam } from './index'
import { DEFAULT_SUBJECT, PARTS, SUBJECTS, type SubjectId } from './types'

const ids = Object.keys(SUBJECTS) as SubjectId[]
const available = ids.filter((id) => SUBJECTS[id].available)

describe('Fächer', () => {
  it('jeder Teil gehört zu einem bekannten Fach, das Standardfach ist verfügbar', () => {
    for (const p of Object.values(PARTS)) expect(ids).toContain(p.subject)
    expect(SUBJECTS[DEFAULT_SUBJECT].available).toBe(true)
  })

  it('verfügbare Fächer haben Kapitel, Lektionen und Karten', () => {
    for (const id of available) {
      const s = scopeFor(id)
      expect(s.chapters.length, id).toBeGreaterThan(0)
      expect(s.lessons.length, id).toBeGreaterThan(0)
      expect(s.formulas.length, id).toBeGreaterThan(0)
    }
  })

  it('die Fächer teilen alle Inhalte ohne Überschneidung auf', () => {
    const sum = (f: (id: SubjectId) => number) => ids.reduce((n, id) => n + f(id), 0)
    expect(sum((id) => scopeFor(id).chapters.length)).toBe(chapters.length)
    expect(sum((id) => scopeFor(id).formulas.length)).toBe(formulas.length)
    expect(sum((id) => scopeFor(id).exercises.length)).toBe(exercises.length)
    expect(sum((id) => scopeFor(id).lessons.length)).toBe(lessons.length)
    expect(sum((id) => scopeFor(id).exams.length)).toBe(exams.length)
  })

  it('jede Klausur gehört zu genau einem Fach (alle Aufgaben aus demselben Fach)', () => {
    for (const exam of exams) {
      const s = subjectOfExam(exam)
      expect(s, exam.id).toBeDefined()
      const scope = scopeFor(s!)
      for (const t of exam.sections.flatMap((x) => x.tasks)) expect(scope.chapterIds.has(t.chapterId), t.id).toBe(true)
    }
  })

  it('aktives Fach: fehlend, unbekannt oder in Vorbereitung → Standardfach', () => {
    expect(activeSubjectId({ settings: {} })).toBe(DEFAULT_SUBJECT)
    expect(activeSubjectId({ settings: { subject: 'gibt-es-nicht' } })).toBe(DEFAULT_SUBJECT)
    const planned = ids.find((id) => !SUBJECTS[id].available)
    if (planned) expect(activeSubjectId({ settings: { subject: planned } })).toBe(DEFAULT_SUBJECT)
    for (const id of available) expect(activeSubjectId({ settings: { subject: id } })).toBe(id)
  })
})
