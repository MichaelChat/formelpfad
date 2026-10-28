import type { Exercise, Step } from '../content/types'
import { scoreMulti, stepWeights } from './exam'
import { checkChoice, checkFormulaInput, checkMatch, checkNumeric, type CheckResult } from './validation'

export type StepResponse = string | string[]

export type Response =
  | { type: 'mc'; selected: string[] }
  | { type: 'match'; assignment: Record<number, number> }
  | { type: 'formula'; text: string }
  | { type: 'numeric'; text: string }
  | { type: 'steps'; steps: StepResponse[] }
  | { type: 'selfcheck'; text: string; selfScore: number | null }

export interface Evaluation extends CheckResult {
  /** 0–1 (Teilpunkte). */
  score: number
  /** Ergebnisse je Schritt (nur bei Schrittaufgaben). */
  stepResults?: CheckResult[]
  /** Bewertung ist geschätzt (Selbsteinschätzung, Teilpunkte bei Mehrfachauswahl). */
  estimated?: boolean
}

export function evaluateStep(step: Step, r: StepResponse | undefined): CheckResult {
  if (step.kind === 'numeric') return checkNumeric(typeof r === 'string' ? r : '', step)
  return checkChoice(Array.isArray(r) ? r : [], step.options, false)
}

export function evaluate(ex: Exercise, response: Response): Evaluation {
  switch (ex.type) {
    case 'mc': {
      const sel = response.type === 'mc' ? response.selected : []
      const res = checkChoice(sel, ex.options, !!ex.multi)
      const score = res.verdict === 'invalid' ? 0 : res.correct ? 1 : ex.multi ? scoreMulti(sel, ex) : 0
      return { ...res, score, ...(ex.multi && !res.correct && score > 0 ? { estimated: true } : {}) }
    }
    case 'match': {
      const a = response.type === 'match' ? response.assignment : {}
      const res = checkMatch(a, ex.pairs.length)
      return { ...res }
    }
    case 'formula': {
      const res = checkFormulaInput(response.type === 'formula' ? response.text : '', ex)
      return { ...res, score: res.correct ? 1 : 0 }
    }
    case 'numeric': {
      const res = checkNumeric(response.type === 'numeric' ? response.text : '', ex)
      return { ...res, score: res.correct ? 1 : 0 }
    }
    case 'steps': {
      const rs = response.type === 'steps' ? response.steps : []
      const stepResults = ex.steps.map((st, i) => evaluateStep(st, rs[i]))
      const w = stepWeights(ex)
      const score = stepResults.reduce((s, r, i) => s + (r.correct ? w[i]! : 0), 0)
      const correct = stepResults.every((r) => r.correct)
      const nRight = stepResults.filter((r) => r.correct).length
      return { verdict: correct ? 'exact' : 'wrong', correct, score, stepResults, message: correct ? 'Alle Schritte richtig!' : `${nRight} von ${ex.steps.length} Schritten richtig.` }
    }
    case 'selfcheck': {
      const s = response.type === 'selfcheck' ? response.selfScore : null
      if (s === null) return { verdict: 'manual', correct: false, score: 0, message: 'Bitte vergleiche mit der Musterlösung und schätze dich selbst ein.', estimated: true }
      return { verdict: 'manual', correct: s >= 1, score: s, message: s >= 1 ? 'Selbsteinschätzung: vollständig richtig.' : s > 0 ? 'Selbsteinschätzung: teilweise richtig.' : 'Selbsteinschätzung: nicht richtig.', estimated: true }
    }
  }
}

export function emptyResponse(ex: Exercise): Response {
  switch (ex.type) {
    case 'mc':
      return { type: 'mc', selected: [] }
    case 'match':
      return { type: 'match', assignment: {} }
    case 'formula':
      return { type: 'formula', text: '' }
    case 'numeric':
      return { type: 'numeric', text: '' }
    case 'steps':
      return { type: 'steps', steps: ex.steps.map((s) => (s.kind === 'numeric' ? '' : [])) }
    case 'selfcheck':
      return { type: 'selfcheck', text: '', selfScore: null }
  }
}
