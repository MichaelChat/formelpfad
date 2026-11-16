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

describe('Papier-Aufgaben', () => {
  it('Lektionen verweisen nur auf existierende Papier-Aufgaben aus dem eigenen Kapitel', () => {
    for (const l of lessons) {
      for (const id of l.paperTaskIds ?? []) {
        const ex = exercises.find((e) => e.id === id)
        expect(ex, `${l.id} → ${id}`).toBeTruthy()
        expect(ex!.type === 'selfcheck' && ex!.paper, `${id} ist keine Papier-Aufgabe`).toBe(true)
        expect(ex!.chapterId, `${id} gehört nicht zum Kapitel von ${l.id}`).toBe(l.chapterId)
      }
    }
  })

  it('jede Papier-Aufgabe hat Musterlösung, Quelle und steht in genau einer Lektion', () => {
    const used = lessons.flatMap((l) => l.paperTaskIds ?? [])
    for (const ex of exercises.filter((e) => e.type === 'selfcheck' && e.paper)) {
      if (ex.type !== 'selfcheck') continue
      expect(ex.modelAnswer.length, ex.id).toBeGreaterThan(0)
      expect(ex.sources?.length ?? 0, ex.id).toBeGreaterThan(0)
      expect(used.filter((id) => id === ex.id), ex.id).toHaveLength(1)
      if (ex.status === 'abgeleitet' && ex.origin !== 'app') expect(ex.statusNote, `${ex.id} braucht einen Hinweis, warum die Lösung nicht offiziell ist`).toBeTruthy()
    }
  })
})
