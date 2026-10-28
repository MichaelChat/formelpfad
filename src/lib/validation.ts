/**
 * Antwortprüfung. Jede Prüfung liefert ein klar typisiertes Ergebnis:
 * - exact:       exakte Übereinstimmung (Auswahl, Zuordnung)
 * - tolerance:   numerisch innerhalb der zulässigen Toleranz
 * - equivalent:  mathematisch äquivalenter Ausdruck (numerisch an Stützstellen geprüft)
 * - wrong:       fachlich falsch (ggf. mit erkanntem typischem Fehler)
 * - invalid:     Eingabe nicht lesbar (wird NICHT als Fehlversuch gewertet)
 * - manual:      nicht zuverlässig automatisch prüfbar → Selbstkontrolle
 */
import type { FormulaInputExercise, McOption, NumericSpec } from '../content/types'
import { formatNumber, parseNumberInput } from './format'
import { checkEquivalence, stripTargetSide } from './math/equivalence'

export type Verdict = 'exact' | 'tolerance' | 'equivalent' | 'wrong' | 'invalid' | 'manual'

export interface CheckResult {
  verdict: Verdict
  correct: boolean
  /** Kurze Rückmeldung (Rich-Text). */
  message: string
  /** Erklärung eines erkannten Denkfehlers. */
  diagnosis?: string
}

export const DEFAULT_REL_TOL = 0.0005

function within(value: number, expected: number, relTol: number, absTol: number): boolean {
  return Math.abs(value - expected) <= Math.max(absTol, relTol * Math.abs(expected))
}

/** Prüft eine Zahleneingabe gegen die erwartete Lösung. */
export function checkNumeric(raw: string, spec: NumericSpec): CheckResult {
  const parsed = parseNumberInput(raw)
  if (!parsed) return { verdict: 'invalid', correct: false, message: 'Bitte gib eine Zahl ein (z. B. 1.234,56 oder 13,28 %).' }

  const relTol = spec.relTol ?? DEFAULT_REL_TOL
  // Absolute Toleranz: halbe Einheit der letzten angezeigten Stelle (Rundung erlaubt)
  const shownDec = spec.fmt.kind === 'pct' ? spec.fmt.dec + 2 : spec.fmt.dec
  const absTol = spec.absTol ?? 0.5 * Math.pow(10, -shownDec)

  // Lesarten: bei Prozentformat sowohl „13,28“ (Prozentpunkte) als auch „0,1328“ akzeptieren
  const readings: number[] = []
  for (const c of parsed.candidates) {
    if (spec.fmt.kind === 'pct') {
      if (parsed.hadPercentSign) readings.push(c / 100)
      else readings.push(c / 100, c)
    } else readings.push(c)
  }

  const hit = readings.find((v) => within(v, spec.answer, relTol, absTol))
  if (hit !== undefined) {
    const exact = Math.abs(hit - spec.answer) < 1e-12
    return { verdict: exact ? 'exact' : 'tolerance', correct: true, message: exact ? 'Richtig!' : `Richtig! (exakt: ${formatNumber(spec.answer, { ...spec.fmt, dec: Math.max(spec.fmt.dec, 4) })})` }
  }

  const primary = readings[0]!

  // Plausibilitätsprüfung im fachlichen Kontext
  if (spec.plausible) {
    const { min, max, message } = spec.plausible
    if ((min !== undefined && primary < min) || (max !== undefined && primary > max)) {
      return { verdict: 'wrong', correct: false, message: 'Das Ergebnis ist im Kontext nicht plausibel.', diagnosis: message }
    }
  }

  // Bekannte typische Fehlantworten
  for (const w of spec.wrong ?? []) {
    if (readings.some((v) => within(v, w.value, Math.max(relTol, 0.001), absTol))) {
      return { verdict: 'wrong', correct: false, message: 'Nicht richtig – das ist ein typischer Fehler.', diagnosis: w.explanation }
    }
  }

  // Vorzeichenfehler
  if (spec.answer !== 0 && readings.some((v) => within(-v, spec.answer, relTol, absTol))) {
    return { verdict: 'wrong', correct: false, message: 'Fast – aber das Vorzeichen stimmt nicht.', diagnosis: 'Prüfe, ob es sich um eine Ein- oder Auszahlung bzw. einen Gewinn oder Verlust handelt.' }
  }

  // Faktor-100-Fehler (Prozent ↔ Dezimal) bei Nicht-Prozent-Formaten
  if (spec.fmt.kind !== 'pct' && spec.answer !== 0 && readings.some((v) => within(v / 100, spec.answer, relTol, absTol) || within(v * 100, spec.answer, relTol, absTol))) {
    return { verdict: 'wrong', correct: false, message: 'Die Größenordnung stimmt nicht (Faktor 100).', diagnosis: 'Wahrscheinlich wurde ein Prozentsatz nicht in eine Dezimalzahl umgerechnet (5 % = 0,05) oder umgekehrt.' }
  }

  // Rundungsfehler: knapp daneben
  if (readings.some((v) => within(v, spec.answer, 0.01, absTol))) {
    return { verdict: 'wrong', correct: false, message: 'Knapp daneben – vermutlich ein Rundungsfehler.', diagnosis: 'Rechne mit ungerundeten Zwischenergebnissen (Taschenrechnerspeicher) und runde erst das Endergebnis auf vier Nachkommastellen.' }
  }

  return { verdict: 'wrong', correct: false, message: 'Leider nicht richtig.' }
}

/** Prüft Multiple-Choice (Einfach- oder Mehrfachauswahl). */
export function checkChoice(selected: string[], options: McOption[], multi: boolean): CheckResult {
  if (selected.length === 0) return { verdict: 'invalid', correct: false, message: 'Bitte wähle eine Antwort aus.' }
  const correctIds = options.filter((o) => o.correct).map((o) => o.id)
  const sel = new Set(selected)
  const allRight = correctIds.every((id) => sel.has(id)) && selected.every((id) => correctIds.includes(id))
  if (allRight) return { verdict: 'exact', correct: true, message: 'Richtig!' }
  const wrongPicked = options.filter((o) => sel.has(o.id) && !o.correct)
  const feedback = wrongPicked.map((o) => o.feedback).filter(Boolean)
  if (multi) {
    const missing = correctIds.filter((id) => !sel.has(id)).length
    const parts: string[] = []
    if (wrongPicked.length) parts.push(`${wrongPicked.length} falsche Auswahl${wrongPicked.length > 1 ? 'en' : ''}`)
    if (missing) parts.push(`${missing} richtige Antwort${missing > 1 ? 'en' : ''} fehlt`)
    return { verdict: 'wrong', correct: false, message: `Nicht ganz: ${parts.join(', ')}.`, ...(feedback.length ? { diagnosis: feedback.join(' ') } : {}) }
  }
  return { verdict: 'wrong', correct: false, message: 'Leider nicht richtig.', ...(feedback[0] ? { diagnosis: feedback[0] } : {}) }
}

/** Anteil korrekt gesetzter Paare (für Teilpunkte). */
export function checkMatch(assignment: Record<number, number>, n: number): CheckResult & { score: number } {
  const placed = Object.keys(assignment).length
  if (placed < n) return { verdict: 'invalid', correct: false, message: 'Bitte ordne alle Begriffe zu.', score: 0 }
  let right = 0
  for (let i = 0; i < n; i++) if (assignment[i] === i) right++
  const score = right / n
  if (right === n) return { verdict: 'exact', correct: true, message: 'Alles richtig zugeordnet!', score }
  return { verdict: 'wrong', correct: false, message: `${right} von ${n} Zuordnungen stimmen.`, score }
}

/** Prüft eine eingegebene Formel auf mathematische Äquivalenz zur Referenz. */
export function checkFormulaInput(raw: string, ex: Pick<FormulaInputExercise, 'target' | 'answer' | 'variables'>): CheckResult {
  if (!raw.trim()) return { verdict: 'invalid', correct: false, message: 'Bitte gib einen Ausdruck ein.' }
  const stripped = stripTargetSide(raw, ex.target)
  if (!stripped.ok) return { verdict: 'invalid', correct: false, message: stripped.message }
  const domains = Object.fromEntries(ex.variables.map((v) => [v.sym, v.domain ?? ([0.5, 3] as const)]))
  const res = checkEquivalence(stripped.expr, ex.answer, { domains })
  switch (res.status) {
    case 'equivalent':
      return { verdict: 'equivalent', correct: true, message: 'Richtig – mathematisch äquivalent!' }
    case 'parse-error':
      return { verdict: 'invalid', correct: false, message: `Ausdruck nicht lesbar: ${res.message}.` }
    case 'unknown-variables':
      return { verdict: 'invalid', correct: false, message: `Unbekannte Variable(n): ${res.names.join(', ')}. Nutze die Variablen-Tasten unter dem Eingabefeld.` }
    case 'undetermined':
      return { verdict: 'invalid', correct: false, message: 'Der Ausdruck lässt sich nicht auswerten (z. B. Division durch 0). Bitte prüfe die Eingabe.' }
    case 'not-equivalent':
      return { verdict: 'wrong', correct: false, message: 'Nicht äquivalent zur gesuchten Formel.', diagnosis: 'Prüfe Klammern, Exponenten und ob Zähler und Nenner vertauscht sind. Tipp: Setze einfache Zahlen ein und vergleiche mit einem Beispiel.' }
  }
}
