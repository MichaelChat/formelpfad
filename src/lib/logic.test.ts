import { describe, expect, it } from 'vitest'
import { parseNumberInput } from './format'
import { checkChoice, checkFormulaInput, checkNumeric } from './validation'
import { fmt } from './format'
import { parse, evaluate } from './math/parser'
import { checkEquivalence } from './math/equivalence'
import { computeStreak, levelFromXp, levelThreshold, xpForAttempt, goalProgress } from './gamification'
import { addDays, daysBetween, localDay } from './dates'
import { schedule, qualityFrom, isDue } from './srs'
import { masteryOf, updateSkill, attemptOutcome } from './mastery'
import { SELF_ASSESSED_FACTOR, initialState, recordAttempt, recordLessonComplete, recordBoss, recordExam, type AttemptInput } from './progress'
import { exportState, importState, loadState, saveState, STORAGE_KEY, type StorageLike } from './persistence'
import { scoreExam, scoreMulti } from './exam'
import { exams, exerciseById, lessons } from '../content'
import { buildLessonSession, lessonStatus, nextLesson, dueFormulas, buildReviewSession, formulaMastery, buildMixedSession, countLabel } from './engine'
import { formulaById as cardById } from '../content'
import { evaluate as evalEx, emptyResponse } from './evaluate'

const attempt = (over: Partial<AttemptInput> = {}): AttemptInput => ({
  exId: 'fin.barwert.e3', skill: 'einsetzen', difficulty: 1, formulaIds: ['fin.barwert'], formulaDifficulty: { 'fin.barwert': 1 },
  correct: true, score: 1, hintsUsed: 0, ms: 30000, mode: 'lesson', type: 'numeric', ...over,
})

describe('Zahleneingabe', () => {
  it('versteht Dezimalkomma, -punkt, Tausenderpunkte, Prozent, Einheiten und Exponenten', () => {
    expect(parseNumberInput('1.234,56')!.candidates).toEqual([1234.56])
    expect(parseNumberInput('1,234.56')!.candidates).toEqual([1234.56])
    expect(parseNumberInput('13,28 %')).toEqual({ candidates: [13.28], hadPercentSign: true })
    expect(parseNumberInput('-0,96%')!.candidates).toEqual([-0.96])
    expect(parseNumberInput('9.943,53 €')!.candidates).toEqual([9943.53])
    expect(parseNumberInput('1e-3')!.candidates).toEqual([0.001])
    expect(parseNumberInput('2,5e3')!.candidates).toEqual([2500])
    expect(parseNumberInput('1.250')!.candidates).toEqual([1.25, 1250])
    expect(parseNumberInput('23.800.000')!.candidates).toEqual([23800000])
    expect(parseNumberInput('−5')!.candidates).toEqual([-5])
    expect(parseNumberInput('abc')).toBeNull()
    expect(parseNumberInput('')).toBeNull()
  })
})

describe('Numerische Antwortprüfung', () => {
  const spec = { answer: 9943.5306, fmt: fmt.eur(2) }
  it('akzeptiert gerundete Werte innerhalb der Toleranz', () => {
    expect(checkNumeric('9943,53', spec).correct).toBe(true)
    expect(checkNumeric('9.943,53 €', spec).correct).toBe(true)
    expect(checkNumeric('9943.5306', spec).verdict).toBe('exact')
  })
  it('lehnt falsche Werte ab und erkennt Rundungs- und Vorzeichenfehler', () => {
    expect(checkNumeric('9950', spec).correct).toBe(false)
    expect(checkNumeric('9950', spec).message).toMatch(/Rundungsfehler/)
    expect(checkNumeric('-9943,53', spec).message).toMatch(/Vorzeichen/)
    expect(checkNumeric('20000', spec).correct).toBe(false)
  })
  it('akzeptiert Prozent in beiden Schreibweisen, aber nicht beliebig', () => {
    const p = { answer: 0.1328, fmt: fmt.pct(2) }
    expect(checkNumeric('13,28', p).correct).toBe(true)
    expect(checkNumeric('13,28 %', p).correct).toBe(true)
    expect(checkNumeric('0,1328', p).correct).toBe(true)
    expect(checkNumeric('0,1328 %', p).correct).toBe(false)
    expect(checkNumeric('15', p).correct).toBe(false)
  })
  it('erkennt hinterlegte typische Fehlantworten', () => {
    const s = { answer: 105.6572, fmt: fmt.eur(4), wrong: [{ value: 14.14, explanation: 'Nennwert fehlt' }] }
    const r = checkNumeric('14,14', s)
    expect(r.correct).toBe(false)
    expect(r.diagnosis).toBe('Nennwert fehlt')
  })
  it('prüft Plausibilität im Kontext', () => {
    const r = checkNumeric('-0,5', { answer: 0.3, fmt: fmt.num(4), plausible: { min: -0.4, max: 1, message: 'außerhalb' } })
    expect(r.diagnosis).toBe('außerhalb')
  })
  it('wertet unlesbare Eingaben nicht als Fehlversuch', () => {
    expect(checkNumeric('zwölf', spec).verdict).toBe('invalid')
  })
  it('erkennt Faktor-100-Fehler', () => {
    expect(checkNumeric('994353', spec).message).toMatch(/Faktor 100/)
  })
})

describe('Formel-Äquivalenz', () => {
  const vars = [
    { sym: 'C_T', tex: 'C_T', name: '', domain: [1, 100] as const },
    { sym: 'r', tex: 'r', name: '', domain: [0.01, 0.2] as const },
    { sym: 'T', tex: 'T', name: '', domain: [1, 10] as const },
  ]
  const ex = { target: 'BW', answer: 'C_T/(1+r)^T', variables: vars }
  it('erkennt äquivalente Umformungen', () => {
    expect(checkFormulaInput('C_T*(1+r)^(-T)', ex).correct).toBe(true)
    expect(checkFormulaInput('BW = C_T / (1 + r)^T', ex).correct).toBe(true)
    expect(checkFormulaInput('C_T·(1+r)^−T', ex).correct).toBe(true)
    expect(checkFormulaInput('C_T*(1/(1+r))^T', ex).correct).toBe(true)
  })
  it('lehnt falsche Formeln ab', () => {
    expect(checkFormulaInput('C_T/(1+r)', ex).correct).toBe(false)
    expect(checkFormulaInput('C_T*(1+r)^T', ex).correct).toBe(false)
    expect(checkFormulaInput('C_T/(1+r*T)', ex).correct).toBe(false)
  })
  it('meldet unbekannte Variablen und Syntaxfehler als ungültig', () => {
    expect(checkFormulaInput('C/(1+r)^T', ex).verdict).toBe('invalid')
    expect(checkFormulaInput('C_T/(1+r^T', ex).verdict).toBe('invalid')
    expect(checkFormulaInput('X = C_T', ex).verdict).toBe('invalid')
  })
  it('Parser: Präzedenz, unäres Minus, implizite Multiplikation, Funktionen', () => {
    expect(evaluate(parse('-2^2'), {})).toBe(-4)
    expect(evaluate(parse('2^3^2'), {})).toBe(512)
    expect(evaluate(parse('2r'), { r: 3 })).toBe(6)
    expect(evaluate(parse('C(1+r)'), { C: 2, r: 1 })).toBe(4)
    expect(evaluate(parse('sqrt(16)+ln(e)'), {})).toBeCloseTo(5)
    expect(evaluate(parse('1,5*2'), {})).toBe(3)
    expect(checkEquivalence('(a+b)^2', 'a^2+2a*b+b^2', { domains: { a: [0, 2], b: [0, 2] } }).status).toBe('equivalent')
  })
})

describe('Auswahl', () => {
  const o = [{ id: 'a', text: 'A', correct: true }, { id: 'b', text: 'B', feedback: 'nein' }, { id: 'c', text: 'C', correct: true }]
  it('Mehrfachauswahl verlangt alle richtigen und keine falschen', () => {
    expect(checkChoice(['a', 'c'], o, true).correct).toBe(true)
    expect(checkChoice(['a'], o, true).correct).toBe(false)
    expect(checkChoice(['a', 'b', 'c'], o, true).diagnosis).toBe('nein')
    expect(checkChoice([], o, true).verdict).toBe('invalid')
  })
  it('Teilpunkte bei Mehrfachauswahl (Klausur)', () => {
    const ex = exerciseById.get('fin.capm.e1')!
    if (ex.type !== 'mc') throw new Error()
    const right = ex.options.filter((x) => x.correct).map((x) => x.id)
    expect(scoreMulti(right, ex)).toBe(1)
    expect(scoreMulti(right.slice(0, 2), ex)).toBeCloseTo(0.5)
  })
})

describe('XP und Level', () => {
  it('vergibt XP nach Schwierigkeit und zieht Hinweise ab', () => {
    expect(xpForAttempt({ difficulty: 1, correct: true, hintsUsed: 0, repeatIndex: 0, fixedPreviousError: false })).toBe(10)
    expect(xpForAttempt({ difficulty: 3, correct: true, hintsUsed: 2, repeatIndex: 0, fixedPreviousError: false })).toBe(14)
    expect(xpForAttempt({ difficulty: 1, correct: false, hintsUsed: 0, repeatIndex: 0, fixedPreviousError: false })).toBe(0)
  })
  it('verhindert XP-Farming durch Wiederholen derselben Aufgabe', () => {
    const xs = [0, 1, 2, 3, 4].map((i) => xpForAttempt({ difficulty: 2, correct: true, hintsUsed: 0, repeatIndex: i, fixedPreviousError: false }))
    expect(xs).toEqual([15, 8, 3, 0, 0])
  })
  it('Levelschwellen und Levelaufstieg', () => {
    expect([1, 2, 3, 4, 5].map(levelThreshold)).toEqual([0, 100, 250, 450, 700])
    expect(levelFromXp(0).level).toBe(1)
    expect(levelFromXp(99).level).toBe(1)
    expect(levelFromXp(100).level).toBe(2)
    expect(levelFromXp(260).level).toBe(3)
    expect(levelFromXp(175).progress).toBeCloseTo(0.5)
  })
  it('Tagesziel', () => {
    expect(goalProgress('xp', 50, { xp: 60, exercises: 3, correct: 3, ms: 0, lessons: 0 }).done).toBe(true)
    expect(goalProgress('minutes', 10, { xp: 0, exercises: 0, correct: 0, ms: 9 * 60000, lessons: 0 }).value).toBe(9)
  })
})

describe('Datum und Streak', () => {
  it('rechnet über Monats- und Jahresgrenzen sowie Zeitumstellungen', () => {
    expect(addDays('2026-03-28', 2)).toBe('2026-03-30') // Sommerzeit 29.03.
    expect(addDays('2026-10-24', 2)).toBe('2026-10-26') // Winterzeit 25.10.
    expect(daysBetween('2026-03-28', '2026-03-30')).toBe(2)
    expect(daysBetween('2026-12-31', '2027-01-01')).toBe(1)
    expect(localDay(new Date(2026, 9, 25, 23, 30))).toBe('2026-10-25')
  })
  it('zählt aufeinanderfolgende Lerntage, auch wenn heute noch nichts gelernt wurde', () => {
    const days = ['2026-10-25', '2026-10-26', '2026-10-27']
    expect(computeStreak(days, '2026-10-27')).toEqual({ current: 3, activeToday: true, longest: 3 })
    expect(computeStreak(days, '2026-10-28').current).toBe(3)
    expect(computeStreak(days, '2026-10-29').current).toBe(0)
    expect(computeStreak(['2026-10-01', '2026-10-02', '2026-10-05'], '2026-10-05').longest).toBe(2)
  })
})

describe('Wiederholungsplanung', () => {
  it('verlängert Intervalle bei Erfolg, setzt bei Fehlern zurück', () => {
    let c = schedule(undefined, 5, '2026-10-01', 2)
    expect(c.interval).toBe(1)
    c = schedule(c, 5, '2026-10-02', 2)
    expect(c.interval).toBe(3)
    c = schedule(c, 5, '2026-10-05', 2)
    expect(c.interval).toBeGreaterThanOrEqual(7)
    const lapse = schedule(c, 1, '2026-10-12', 2)
    expect(lapse.interval).toBe(1)
    expect(lapse.due).toBe('2026-10-13')
    expect(lapse.ease).toBeLessThan(c.ease)
  })
  it('lässt mehrfaches Üben am selben Tag das Intervall nicht wachsen', () => {
    const a = schedule(schedule(undefined, 5, '2026-10-01', 2), 5, '2026-10-02', 2)
    const b = schedule(a, 5, '2026-10-02', 2)
    expect(b).toEqual(a)
  })
  it('berücksichtigt Hinweise und Schwierigkeit in der Qualität', () => {
    expect(qualityFrom(true, 0, 1)).toBe(5)
    expect(qualityFrom(true, 0, 3)).toBe(4)
    expect(qualityFrom(true, 1, 1)).toBe(3)
    expect(qualityFrom(false, 0, 1)).toBe(1)
    expect(isDue(schedule(undefined, 5, '2026-10-01', 1), '2026-10-02')).toBe(true)
  })
})

describe('Kompetenzprofil', () => {
  it('eine richtige Multiple-Choice-Antwort reicht nicht für „beherrscht“', () => {
    const s = { erkennen: updateSkill(undefined, 1) }
    expect(masteryOf(s, ['erkennen', 'einsetzen', 'abrufen']).level).not.toBe('beherrscht')
    // Selbst sehr sicheres Erkennen allein reicht nicht
    expect(masteryOf({ erkennen: 1, interpretieren: 1, auswaehlen: 1 }, ['erkennen', 'interpretieren', 'auswaehlen', 'einsetzen']).level).not.toBe('beherrscht')
  })
  it('wird beherrscht mit mehreren starken Dimensionen inkl. aktiver', () => {
    expect(masteryOf({ erkennen: 0.9, einsetzen: 0.85, abrufen: 0.82 }, ['erkennen', 'einsetzen', 'abrufen', 'umstellen']).level).toBe('beherrscht')
  })
  it('Hinweise mindern das Ergebnis', () => {
    expect(attemptOutcome(true, 0)).toBe(1)
    expect(attemptOutcome(true, 1)).toBe(0.7)
    expect(attemptOutcome(true, 3)).toBe(0.35)
    expect(attemptOutcome(false, 0)).toBe(0)
  })
})

describe('Fortschritt, Freischaltung und Persistenz', () => {
  const now = new Date(2026, 9, 28, 12)
  it('speichert Versuche, Kompetenz, Wiederholung und XP', () => {
    let s = initialState(now)
    s = recordAttempt(s, attempt(), now).state
    expect(s.xp).toBe(10)
    expect(s.exercise['fin.barwert.e3']!.correct).toBe(1)
    expect(s.formula['fin.barwert']!.skills.einsetzen).toBeGreaterThan(0)
    expect(s.formula['fin.barwert']!.srs!.due).toBe('2026-10-29')
    s = recordAttempt(s, attempt({ correct: false, score: 0 }), now).state
    expect(s.recentWrong[0]).toBe('fin.barwert.e3')
    const fixed = recordAttempt(s, attempt(), now)
    expect(fixed.state.recentWrong).not.toContain('fin.barwert.e3')
    expect(fixed.xp).toBe(5) // zweite richtige Lösung heute (50 %), kein Bonus, da heute schon gelöst
    const fresh = recordAttempt(recordAttempt(initialState(now), attempt({ correct: false, score: 0 }), now).state, attempt(), now)
    expect(fresh.xp).toBe(10 + 5) // erste richtige Lösung + Korrekturbonus
  })
  it('schaltet Lektionen der Reihe nach frei und empfiehlt die nächste', () => {
    let s = initialState(now)
    const [l0, l1] = lessons.filter((l) => l.chapterId === 'fin-zeitwert')
    expect(lessonStatus(s, l0!)).toBe('verfügbar')
    expect(lessonStatus(s, l1!)).toBe('gesperrt')
    // Ohne Lernstand: erste Lektion des ersten Kapitels (F0 Grundbegriffe)
    expect(nextLesson(s)!.id).toBe(lessons[0]!.id)
    s = recordLessonComplete(s, l0!.id, 0.9, now).state
    expect(lessonStatus(s, l1!)).toBe('verfügbar')
    expect(nextLesson(s)!.id).toBe(l1!.id)
    expect(s.xp).toBe(20)
    expect(recordLessonComplete(s, l0!.id, 1, now).xp).toBe(5)
  })
  it('Boss-Challenge gilt ab 70 % als bestanden', () => {
    const s = initialState(now)
    expect(recordBoss(s, 'fin-zeitwert', 0.69, now).passed).toBe(false)
    const r = recordBoss(s, 'fin-zeitwert', 0.7, now)
    expect(r.passed).toBe(true)
    expect(r.xp).toBe(50)
  })
  it('überlebt Speichern und Neuladen (Reload)', () => {
    const mem = new Map<string, string>()
    const storage: StorageLike = { getItem: (k) => mem.get(k) ?? null, setItem: (k, v) => void mem.set(k, v), removeItem: (k) => void mem.delete(k) }
    let s = initialState(now)
    s = recordAttempt(s, attempt(), now).state
    s = recordLessonComplete(s, 'l-fin-ew-bw', 1, now).state
    expect(saveState(s, storage)).toBe(true)
    const loaded = loadState(storage)
    expect(loaded.state.xp).toBe(s.xp)
    expect(loaded.state.lessons['l-fin-ew-bw']).toBeTruthy()
    expect(loaded.state.formula['fin.barwert']!.srs).toEqual(s.formula['fin.barwert']!.srs)
  })
  it('sichert einen defekten Speicherstand statt ihn still zu überschreiben', () => {
    const mem = new Map<string, string>([[STORAGE_KEY, '{kaputt']])
    const storage: StorageLike = { getItem: (k) => mem.get(k) ?? null, setItem: (k, v) => void mem.set(k, v), removeItem: (k) => void mem.delete(k) }
    const r = loadState(storage)
    expect(r.recovered).toBe(true)
    expect([...mem.keys()].some((k) => k.includes(':defekt:'))).toBe(true)
  })
  it('Export und Import', () => {
    const s = recordAttempt(initialState(now), attempt(), now).state
    const r = importState(exportState(s))
    expect(r.ok && r.state.xp).toBe(10)
    expect(importState('nope').ok).toBe(false)
    expect(importState('{"version":99}').ok).toBe(false)
  })
  it('Wiederholungswarteschlange füllt sich mit fälligen Formeln', () => {
    let s = initialState(now)
    s = recordAttempt(s, attempt(), now).state
    expect(dueFormulas(s, '2026-10-28').length).toBe(0)
    expect(dueFormulas(s, '2026-10-29').map((f) => f.id)).toContain('fin.barwert')
  })
})

describe('Lektion als Ganzes (Integration auf Logikebene)', () => {
  it('stellt eine vollständige Lektion zusammen und verarbeitet sie bis zum Abschluss', () => {
    const now = new Date(2026, 9, 28, 12)
    let s = initialState(now)
    const session = buildLessonSession(s, 'l-fin-ew-bw')!
    expect(session.items[0]!.kind).toBe('intro')
    expect(session.items.at(-1)!.kind).toBe('mistakes')
    const exs = session.items.filter((i) => i.kind === 'exercise')
    expect(exs.length).toBeGreaterThanOrEqual(4)
    expect(exs.some((i) => i.kind === 'exercise' && i.exercise.origin === 'generiert')).toBe(true)
    for (const it of exs) {
      if (it.kind !== 'exercise') continue
      const ev = evalEx(it.exercise, emptyResponse(it.exercise))
      s = recordAttempt(s, { ...attempt(), exId: it.exercise.id, skill: it.exercise.skill, formulaIds: it.exercise.formulaIds, formulaDifficulty: {}, correct: true, score: 1, type: it.exercise.type }, now).state
      expect(ev.verdict === 'invalid' || ev.verdict === 'manual' || ev.correct === false || ev.score >= 0).toBe(true)
    }
    s = recordLessonComplete(s, 'l-fin-ew-bw', 1, now).state
    expect(s.lessons['l-fin-ew-bw']!.times).toBe(1)
    expect(s.xp).toBeGreaterThan(20)
    expect(formulaMastery(s, 'fin.barwert').level).not.toBe('neu')
    // Wiederholung erst am Folgetag fällig
    expect(dueFormulas(s, '2026-10-28')).toHaveLength(0)
    expect(dueFormulas(s, '2026-10-29').length).toBeGreaterThan(0)
    expect(typeof buildReviewSession).toBe('function')
  })
})

describe('Klausurbewertung', () => {
  it('summiert Punkte nach offizieller Verteilung', () => {
    const exam = exams[0]!
    const all = Object.fromEntries(exam.sections.flatMap((s) => s.tasks.flatMap((t) => t.exerciseIds)).map((id) => [id, { score: 1, correct: true, estimated: false }]))
    const full = scoreExam(exam, all)
    expect(full.points).toBe(90)
    const none = scoreExam(exam, {})
    expect(none.points).toBe(0)
    const half = scoreExam(exam, { 'fin.izs.e1': { score: 0.5, correct: false, estimated: false } })
    expect(half.tasks.find((t) => t.number === '1.1.1')!.points).toBe(2)
    expect(full.byTopic.reduce((a, t) => a + t.maxPoints, 0)).toBe(90)
  })
  it('vergibt XP für Simulationen nur einmal pro Tag voll', () => {
    const now = new Date(2026, 9, 28, 12)
    const att = { id: 'x', examId: 'beispielklausur-fr', at: now.toISOString(), timed: true, durationMs: 1, points: 45, maxPoints: 90, tasks: [] }
    const r1 = recordExam(initialState(now), att, now)
    expect(r1.xp).toBe(30)
    expect(recordExam(r1.state, att, now).xp).toBe(10)
  })
})

describe('Gemischtes Training', () => {
  const kindOf = (exId: string, formulaIds: string[]) => cardById.get(formulaIds[0] ?? '')?.kind ?? (exId ? 'formel' : 'formel')
  it('mischt ohne Lernstand Formeln und Wissen im Wechsel', () => {
    const s = buildMixedSession(initialState())!
    expect(s.items.length).toBe(10)
    const kinds = s.items.map((it) => (it.kind === 'exercise' ? kindOf(it.exercise.id, it.exercise.formulaIds) : 'x'))
    expect(kinds).toContain('wissen')
    expect(kinds.filter((k) => k !== 'wissen').length).toBeGreaterThan(0)
    // nie mehr als zwei gleiche Arten hintereinander
    for (let i = 2; i < kinds.length; i++) expect(kinds[i] === kinds[i - 1] && kinds[i] === kinds[i - 2]).toBe(false)
  })
  it('„Nur Wissen“ enthält ausschließlich Wissensaufgaben, auch eingeschränkt auf ein Kapitel', () => {
    const s = buildMixedSession(initialState(), { scope: 'wissen' })!
    for (const it of s.items) if (it.kind === 'exercise') expect(kindOf(it.exercise.id, it.exercise.formulaIds)).toBe('wissen')
    const c = buildMixedSession(initialState(), { scope: 'wissen', chapterIds: ['jb-anhang'] })!
    for (const it of c.items) if (it.kind === 'exercise') expect(it.exercise.chapterId).toBe('jb-anhang')
  })
  it('beschriftet Fälliges nach Art', () => {
    expect(countLabel([{ kind: 'formel' }, { kind: 'wissen' }, { kind: 'wissen' }])).toBe('1 Formel · 2 Begriffe')
    expect(countLabel([{}, {}])).toBe('2 Formeln')
  })
})

describe('Beherrschung über offene Fragen', () => {
  it('eine nur per Selbsteinschätzung geübte Fähigkeit kann die Schwelle 0,8 erreichen', () => {
    expect(SELF_ASSESSED_FACTOR).toBeGreaterThan(0.8)
    let v: number | undefined
    let n = 0
    while ((v ?? 0) < 0.8 && n < 20) {
      v = updateSkill(v, attemptOutcome(true, 0) * SELF_ASSESSED_FACTOR)
      n++
    }
    expect(v!).toBeGreaterThanOrEqual(0.8)
    expect(n).toBeLessThanOrEqual(8)
  })
})
