import { evalExpr, type Env } from '../lib/math/parser'
import type { NumFmt } from '../lib/format'
import type {
  Exercise,
  ExerciseBase,
  Formula,
  FormulaInputExercise,
  MatchExercise,
  McExercise,
  McOption,
  NumericExercise,
  SelfCheckExercise,
  SourceRef,
  Step,
  StepsExercise,
  Variable,
} from './types'

/** Rechnet einen Ausdruck aus – damit stehen in den Inhalten Rechenwege statt abgetippter Ergebnisse. */
export function calc(expr: string, env: Env = {}): number {
  const v = evalExpr(expr, env)
  if (!Number.isFinite(v)) throw new Error(`calc(${expr}) ist nicht endlich`)
  return v
}

/** Rundet wie in der Klausur verlangt (Standard: 4 Nachkommastellen). */
export function round(v: number, dec = 4): number {
  const f = Math.pow(10, dec)
  return Math.round(v * f) / f
}

export const src = (doc: string, pages: string, note?: string): SourceRef => ({ doc, pages, ...(note ? { note } : {}) })

type Base = Omit<ExerciseBase, 'status' | 'hints' | 'explanation'> &
  Partial<Pick<ExerciseBase, 'status' | 'hints' | 'explanation'>>

function base(b: Base): ExerciseBase {
  return { status: 'geprüft', hints: [], explanation: [], ...b }
}

/** Kurzschreibweise für Antwortoptionen: Text mit führendem "*" ist richtig; [Text, Feedback] für gezieltes Feedback. */
export function opts(...items: (string | [string] | [string, string])[]): McOption[] {
  return items.map((it, i) => {
    const [raw, feedback] = Array.isArray(it) ? [it[0], it[1]] : [it, undefined]
    const correct = raw.startsWith('*')
    return { id: `o${i}`, text: correct ? raw.slice(1) : raw, ...(correct ? { correct: true } : {}), ...(feedback ? { feedback } : {}) }
  })
}

export function mc(b: Base & Pick<McExercise, 'prompt' | 'options'> & Partial<Pick<McExercise, 'multi' | 'variant' | 'display'>>): McExercise {
  return { ...base(b), type: 'mc', prompt: b.prompt, options: b.options, ...(b.multi ? { multi: true } : {}), ...(b.variant ? { variant: b.variant } : {}), ...(b.display ? { display: b.display } : {}) }
}

export function match(b: Base & Pick<MatchExercise, 'prompt' | 'pairs'>): MatchExercise {
  return { ...base(b), type: 'match', prompt: b.prompt, pairs: b.pairs }
}

export function formulaInput(
  b: Base & Pick<FormulaInputExercise, 'prompt' | 'target' | 'targetTex' | 'answer' | 'answerTex'> & { variables: Variable[] },
): FormulaInputExercise {
  return { ...base(b), type: 'formula', prompt: b.prompt, target: b.target, targetTex: b.targetTex, answer: b.answer, answerTex: b.answerTex, variables: b.variables }
}

export function numeric(
  b: Base & { prompt: string; answer: number; fmt: NumFmt } & Partial<Pick<NumericExercise, 'relTol' | 'absTol' | 'wrong' | 'plausible'>>,
): NumericExercise {
  const { prompt, answer, fmt, relTol, absTol, wrong, plausible, ...rest } = b
  return {
    ...base(rest),
    type: 'numeric',
    prompt,
    answer,
    fmt,
    ...(relTol !== undefined ? { relTol } : {}),
    ...(absTol !== undefined ? { absTol } : {}),
    ...(wrong ? { wrong } : {}),
    ...(plausible ? { plausible } : {}),
  }
}

export function steps(b: Base & { prompt: string; steps: Step[] }): StepsExercise {
  const { prompt, steps: st, ...rest } = b
  return { ...base(rest), type: 'steps', prompt, steps: st }
}

export function selfcheck(b: Base & { prompt: string; modelAnswer: string[]; keywords?: string[] }): SelfCheckExercise {
  const { prompt, modelAnswer, keywords, ...rest } = b
  const explanation = rest.explanation?.length ? rest.explanation : ['Vergleiche deine Antwort Punkt für Punkt mit der Musterlösung. Für volle Punkte sollten die Stichworte vorkommen.']
  return { ...base({ ...rest, explanation }), type: 'selfcheck', prompt, modelAnswer, ...(keywords ? { keywords } : {}) }
}

export function numStep(label: string, answer: number, f: NumFmt, extra: Partial<Omit<Extract<Step, { kind: 'numeric' }>, 'kind' | 'label' | 'answer' | 'fmt'>> = {}): Step {
  return { kind: 'numeric', label, answer, fmt: f, ...extra }
}

export function mcStep(label: string, options: McOption[], points?: number): Step {
  return { kind: 'mc', label, options, ...(points !== undefined ? { points } : {}) }
}

/**
 * Wissenskarte (Begriff, Prinzip, Konzept). Felder wie bei einer Formel, aber ohne Rechenlogik.
 * `tex` ist optional (kurze Merkformel, falls es eine gibt).
 */
export function wissen(
  c: Pick<Formula, 'id' | 'name' | 'chapterId' | 'sources'> & {
    definition: string
    keyPoints: string[]
  } & Partial<Pick<Formula, 'aliases' | 'short' | 'subchapter' | 'tex' | 'example' | 'mistakes' | 'related' | 'difficulty' | 'status' | 'statusNote' | 'supplement' | 'examTip' | 'useCases' | 'whenNot' | 'assumptions'>>,
): Formula {
  return {
    kind: 'wissen',
    tex: '',
    variables: [],
    assumptions: [],
    intuition: c.definition,
    interpretation: '',
    useCases: [],
    mistakes: [],
    difficulty: 1,
    status: 'geprüft',
    ...c,
  }
}

/**
 * „Richtig oder falsch?“ – mehrere Aussagen, je eine Entscheidung. Technisch eine Schritt-Aufgabe
 * mit Auswahlschritten; jede Aussage zählt gleich viel.
 * statements: [Aussage, richtig?, Begründung]
 */
export function trueFalse(b: Base & { prompt: string; statements: [string, boolean, string][] }): StepsExercise {
  const { prompt, statements, ...rest } = b
  const st: Step[] = statements.map(([text, isTrue, why]) => ({
    kind: 'mc',
    label: text,
    options: [
      { id: 'r', text: 'Richtig', ...(isTrue ? { correct: true } : { feedback: why }) },
      { id: 'f', text: 'Falsch', ...(!isTrue ? { correct: true } : { feedback: why }) },
    ],
    points: 1,
  }))
  return {
    ...base({ ...rest, explanation: rest.explanation?.length ? rest.explanation : statements.map(([text, isTrue, why]) => `${isTrue ? '✔ Richtig' : '✘ Falsch'}: ${text} – ${why}`) }),
    type: 'steps',
    prompt,
    steps: st,
  }
}

export type { Exercise }
