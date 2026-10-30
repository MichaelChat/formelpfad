import { describe, expect, it } from 'vitest'
import { chapters, exams, exerciseById, exercises, formulaById, formulas, lessons, officialChecks } from './index'
import { SOURCES } from './sources'
import { collectVariables, evaluate, parse } from '../lib/math/parser'
import { checkEquivalence } from '../lib/math/equivalence'
import { mulberry32 } from '../lib/math/random'
import { generateExercise } from '../lib/generator'
import { checkNumeric } from '../lib/validation'
import { formatPlain } from '../lib/format'

describe('Inhaltsdaten – Struktur', () => {
  it('hat eindeutige IDs', () => {
    const ids = [...formulas.map((f) => f.id), ...exercises.map((e) => e.id), ...lessons.map((l) => l.id), ...chapters.map((c) => c.id)]
    const dup = ids.filter((id, i) => ids.indexOf(id) !== i)
    expect(dup).toEqual([])
  })

  it('verweist nur auf existierende Formeln, Kapitel und Quellen', () => {
    for (const l of lessons) for (const fid of l.formulaIds) expect(formulaById.has(fid), `${l.id} → ${fid}`).toBe(true)
    for (const e of exercises) {
      expect(chapters.some((c) => c.id === e.chapterId), `${e.id} chapter ${e.chapterId}`).toBe(true)
      for (const fid of e.formulaIds) expect(formulaById.has(fid), `${e.id} → ${fid}`).toBe(true)
      for (const s of e.sources ?? []) expect(SOURCES[s.doc], `${e.id} source ${s.doc}`).toBeTruthy()
    }
    for (const f of formulas) {
      for (const s of f.sources) expect(SOURCES[s.doc], `${f.id} source ${s.doc}`).toBeTruthy()
      for (const r of f.related ?? []) expect(formulaById.has(r), `${f.id} related ${r}`).toBe(true)
      expect(chapters.some((c) => c.id === f.chapterId)).toBe(true)
      expect(f.sources.length, `${f.id} braucht eine Quelle`).toBeGreaterThan(0)
    }
  })

  it('jede Formel kommt in einer Lektion vor und hat Aufgaben', () => {
    const inLessons = new Set(lessons.flatMap((l) => l.formulaIds))
    for (const f of formulas) {
      expect(inLessons.has(f.id), `${f.id} in keiner Lektion`).toBe(true)
      const n = exercises.filter((e) => e.formulaIds.includes(f.id)).length
      expect(n + (f.generator ? 1 : 0), `${f.id} ohne Aufgaben`).toBeGreaterThan(0)
    }
  })

  it('Multiple-Choice hat mindestens eine richtige Option, Einfachauswahl genau eine', () => {
    for (const e of exercises) {
      if (e.type === 'mc') {
        const n = e.options.filter((o) => o.correct).length
        if (e.multi) expect(n, e.id).toBeGreaterThanOrEqual(1)
        else expect(n, e.id).toBe(1)
      }
      if (e.type === 'steps') for (const st of e.steps) if (st.kind === 'mc') expect(st.options.filter((o) => o.correct).length, `${e.id}: ${st.label}`).toBe(1)
      expect(e.hints.length, `${e.id} braucht Hinweise`).toBeGreaterThanOrEqual(2)
      expect(e.explanation.length, `${e.id} braucht eine Erklärung`).toBeGreaterThan(0)
    }
  })

  it('Klausuraufgaben verweisen auf existierende Aufgaben, Punkte summieren sich', () => {
    for (const exam of exams) {
      let sum = 0
      for (const s of exam.sections) {
        const secSum = s.tasks.reduce((a, t) => a + t.points, 0)
        expect(secSum, s.title).toBeCloseTo(s.points, 6)
        sum += secSum
        for (const t of s.tasks) for (const id of t.exerciseIds) expect(exerciseById.has(id), `${t.number} → ${id}`).toBe(true)
      }
      expect(sum).toBeCloseTo(exam.totalPoints, 6)
    }
  })
})

describe('Inhaltsdaten – Mathematik', () => {
  it('alle Rechenausdrücke sind parsebar und verwenden nur deklarierte Variablen', () => {
    for (const f of formulas) {
      if (!f.rhs) continue
      const vars = new Set(f.variables.map((v) => v.sym))
      for (const expr of [f.rhs, ...Object.values(f.solved ?? {})]) {
        const used = collectVariables(parse(expr))
        for (const v of used) expect(vars.has(v), `${f.id}: ${v} nicht deklariert in ${expr}`).toBe(true)
      }
      expect(vars.has(f.lhs!), `${f.id}: lhs ${f.lhs}`).toBe(true)
    }
  })

  it('umgestellte Formen sind mit lhs = rhs konsistent', () => {
    for (const f of formulas) {
      if (!f.rhs || !f.lhs || !f.solved) continue
      const rng = mulberry32(42)
      const rhsVars = [...collectVariables(parse(f.rhs))]
      let checked = 0
      for (let i = 0; i < 200 && checked < 8; i++) {
        const env: Record<string, number> = {}
        for (const v of rhsVars) {
          const gin = f.generator?.inputs[v]
          const dom = gin ? [gin.min, gin.max] : f.variables.find((x) => x.sym === v)?.domain ?? [0.5, 3]
          env[v] = dom[0]! + (dom[1]! - dom[0]!) * rng()
        }
        if (f.generator?.constraint && !(evaluate(parse(f.generator.constraint), env) > 0)) continue
        const lhsVal = evaluate(parse(f.rhs), env)
        if (!Number.isFinite(lhsVal)) continue
        env[f.lhs] = lhsVal
        for (const [sym, expr] of Object.entries(f.solved)) {
          const got = evaluate(parse(expr), env)
          expect(got, `${f.id}: ${sym} = ${expr}`).toBeCloseTo(env[sym]!, 6)
        }
        checked++
      }
      expect(checked, `${f.id}: keine gültigen Stichproben`).toBeGreaterThan(0)
    }
  })

  it('Referenzlösungen der Formel-Eingabeaufgaben sind konsistent mit der Formel (falls gleiche Zielgröße)', () => {
    for (const e of exercises) {
      if (e.type !== 'formula') continue
      // Referenz selbst muss parsebar sein und nur erlaubte Variablen nutzen
      const domains = Object.fromEntries(e.variables.map((v) => [v.sym, v.domain ?? ([0.5, 3] as const)]))
      expect(checkEquivalence(e.answer, e.answer, { domains }).status, e.id).toBe('equivalent')
      const f = formulaById.get(e.formulaIds[0]!)!
      if (f.lhs === e.target && f.rhs) {
        const vars = Object.fromEntries(f.variables.filter((v) => e.variables.some((x) => x.sym === v.sym)).map((v) => [v.sym, (e.variables.find((x) => x.sym === v.sym)!.domain ?? [0.5, 3]) as readonly [number, number]]))
        const res = checkEquivalence(e.answer, f.rhs, { domains: vars })
        expect(res.status, `${e.id} vs ${f.id}`).toBe('equivalent')
      }
    }
  })

  it('stimmt mit den offiziellen Lösungen aus Vorlesung, Tutorium und Klausur überein', () => {
    for (const c of officialChecks) {
      const ex = exerciseById.get(c.id)!
      expect(ex, c.id).toBeTruthy()
      const answer = ex.type === 'numeric' ? ex.answer : NaN
      const rounded = Math.round(answer * 10 ** c.dec) / 10 ** c.dec
      // Offizielle Lösungen runden teils Zwischenergebnisse: Abweichung von höchstens einer Einheit
      // der letzten Stelle ist zulässig (dokumentiert in docs/content-issues.md).
      expect(Math.abs(rounded - c.value), `${c.id} (${c.note}): ${rounded} vs. ${c.value}`).toBeLessThanOrEqual(1.01 * 10 ** -c.dec)
    }
  })

  it('Beispielklausur: zentrale Ergebnisse', () => {
    const step = (id: string, i: number) => {
      const e = exerciseById.get(id)!
      if (e.type !== 'steps') throw new Error(id)
      const s = e.steps[i]!
      if (s.kind !== 'numeric') throw new Error(`${id}#${i}`)
      return s.answer
    }
    const num = (id: string) => {
      const e = exerciseById.get(id)!
      if (e.type !== 'numeric') throw new Error(id)
      return e.answer
    }
    expect(step('fin.izs.e1', 1)).toBeCloseTo(0.1328, 4)
    expect(num('exam.bsp.1.1.2')).toBeCloseTo(1.0744, 4)
    expect(step('fin.zerobond.e2', 0)).toBeCloseTo(94.2596, 4)
    expect(step('fin.zerobond.e2', 1)).toBeCloseTo(93.3511, 4)
    expect(step('fin.zerobond.e2', 2)).toBeCloseTo(-0.0096, 4)
    expect(step('fin.wml.e1', 1)).toBeCloseTo(1.5, 6)
    expect(step('fin.wml.e1', 2)).toBeCloseTo(0.0938, 4)
    expect(step('fin.ddm.e1', 1)).toBeCloseTo(11.9, 6)
    expect(step('fin.ddm.e1', 2)).toBeCloseTo(23800000, 2)
    expect(step('exam.bsp.1.5', 1)).toBeCloseTo(1725.4946, 3)
    expect(step('rw.break-even.e2', 0)).toBeCloseTo(750000, 6)
    expect(step('rw.break-even.e2', 3)).toBeCloseTo(41.25, 6)
    expect(step('rw.break-even.e2', 4)).toBeCloseTo(62.25, 6)
    expect(step('rw.stufenleiter.e1', 1)).toBeCloseTo(1.6938, 4)
    expect(step('rw.worksheet.e1', 5)).toBeCloseTo(16, 6)
    expect(step('rw.worksheet.e1', 6)).toBeCloseTo(8.8, 6)
    expect(step('rw.worksheet.e1', 7)).toBeCloseTo(377.85, 6)
  })

  it('akzeptiert beim Stufenleiterverfahren sowohl den exakten als auch den offiziell gerundeten Wert (14,6333 / 14,6334)', () => {
    const e = exerciseById.get('rw.stufenleiter.e1')!
    if (e.type !== 'steps') throw new Error()
    const s = e.steps[2]!
    if (s.kind !== 'numeric') throw new Error()
    expect(checkNumeric('14,6333', s).correct).toBe(true)
    expect(checkNumeric('14,6334', s).correct).toBe(true)
    expect(checkNumeric('14,7', s).correct).toBe(false)
  })
})

describe('Generator', () => {
  it('erzeugt für jede Formel mit Generator gültige, prüfbare Aufgaben', () => {
    for (const f of formulas) {
      if (!f.generator) continue
      for (const t of f.generator.targets) {
        let ok = 0
        for (let seed = 1; seed <= 15; seed++) {
          const g = generateExercise(f, seed * 7919, t.sym)
          if (!g) continue
          ok++
          expect(Number.isFinite(g.answer), `${f.id}:${t.sym}`).toBe(true)
          expect(g.prompt.includes('{'), `${f.id}:${t.sym} Platzhalter übrig: ${g.prompt}`).toBe(false)
          expect(g.origin).toBe('generiert')
          // Die eigene Lösung (wie angezeigt gerundet) muss als richtig erkannt werden
          const shownDec = Math.max(g.fmt.dec, 4)
          const shown = g.fmt.kind === 'pct' ? `${formatPlain(g.answer * 100, shownDec)} %` : formatPlain(g.answer, shownDec)
          expect(checkNumeric(shown, g).correct, `${f.id}:${t.sym} ${shown}`).toBe(true)
        }
        expect(ok, `${f.id}:${t.sym} erzeugt keine Aufgaben`).toBeGreaterThan(5)
      }
    }
  })

  it('ist deterministisch für denselben Seed', () => {
    const f = formulaById.get('fin.barwert')!
    expect(generateExercise(f, 123)?.prompt).toBe(generateExercise(f, 123)?.prompt)
  })
})

describe('Wissenskarten', () => {
  const knowledge = formulas.filter((f) => f.kind === 'wissen')
  const ACTIVE = ['abrufen', 'einsetzen', 'umstellen', 'anwenden']

  it('es gibt einen nennenswerten Wissensbereich in allen drei Teilen', () => {
    expect(knowledge.length).toBeGreaterThanOrEqual(35)
    const parts = new Set(knowledge.map((f) => chapters.find((c) => c.id === f.chapterId)!.part))
    expect([...parts].sort()).toEqual(['fin', 'jb', 'rw'])
  })

  it('jede neue Wissenskarte hat Kernaussage, Merkliste und Quelle', () => {
    for (const f of knowledge.filter((x) => x.id.includes('.w.'))) {
      expect(f.definition?.length, f.id).toBeGreaterThan(40)
      expect(f.keyPoints?.length, f.id).toBeGreaterThanOrEqual(3)
      expect(f.sources.length, f.id).toBeGreaterThan(0)
    }
  })

  it('jede Wissenskarte hat mindestens drei Aufgaben, davon eine aktive (abrufen/anwenden)', () => {
    for (const f of knowledge) {
      const ex = exercises.filter((e) => e.formulaIds.includes(f.id))
      expect(ex.length, f.id).toBeGreaterThanOrEqual(3)
      expect(ex.some((e) => ACTIVE.includes(e.skill)), `${f.id} braucht eine aktive Aufgabe`).toBe(true)
    }
  })

  it('jede Wissensaufgabe nennt eine Fundstelle', () => {
    const ids = new Set(knowledge.map((f) => f.id))
    for (const e of exercises.filter((x) => ids.has(x.formulaIds[0]!))) expect(e.sources?.length ?? 0, e.id).toBeGreaterThan(0)
  })

  it('Richtig/Falsch-Aufgaben haben pro Aussage genau eine richtige Antwort', () => {
    for (const e of exercises) {
      if (e.type !== 'steps') continue
      for (const st of e.steps) if (st.kind === 'mc' && st.options.some((o) => o.text === 'Richtig')) expect(st.options.filter((o) => o.correct)).toHaveLength(1)
    }
  })

  it('Wissenslektionen enthalten nur Wissenskarten', () => {
    for (const l of lessons.filter((x) => x.knowledge)) for (const id of l.formulaIds) expect(formulaById.get(id)?.kind, `${l.id}: ${id}`).toBe('wissen')
  })
})
