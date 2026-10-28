/**
 * Erzeugt aus einer Formel mit GeneratorSpec eine Rechenaufgabe mit Zufallswerten.
 *
 * Vorgehen:
 * 1. Eingangsgrößen (rechte Seite) zufällig im erlaubten Raster ziehen.
 * 2. Linke Seite ausrechnen → konsistente Belegung aller Variablen.
 * 3. Werte so runden, wie sie im Aufgabentext erscheinen.
 * 4. Die gesuchte Größe AUS DEN ANGEZEIGTEN (gerundeten) Werten neu berechnen –
 *    so stimmt die erwartete Lösung exakt mit dem überein, was man mit dem Aufgabentext rechnet.
 * Varianten, die Nebenbedingungen verletzen oder nicht endlich sind, werden verworfen.
 */
import type { Formula, GeneratorTarget, NumericExercise } from '../content/types'
import { formatNumber, type NumFmt } from './format'
import { evalExpr, type Env } from './math/parser'
import { mulberry32, pick } from './math/random'

function roundForDisplay(v: number, f: NumFmt): number {
  const dec = f.kind === 'pct' ? f.dec + 2 : f.dec
  const factor = Math.pow(10, dec)
  return Math.round(v * factor) / factor
}

function sampleInput(rng: () => number, min: number, max: number, step: number): number {
  const steps = Math.floor((max - min) / step + 1e-9)
  const k = Math.floor(rng() * (steps + 1))
  return Math.round((min + k * step) * 1e10) / 1e10
}

export interface GeneratedExercise extends NumericExercise {
  seed: number
}

export function generateExercise(formula: Formula, seed: number, targetSym?: string): GeneratedExercise | null {
  const spec = formula.generator
  if (!spec || !formula.lhs || !formula.rhs) return null
  const rng = mulberry32(seed)
  const target: GeneratorTarget = targetSym ? spec.targets.find((t) => t.sym === targetSym) ?? spec.targets[0]! : pick(rng, spec.targets)

  for (let attempt = 0; attempt < 40; attempt++) {
    const env: Env = {}
    for (const [sym, inp] of Object.entries(spec.inputs)) env[sym] = sampleInput(rng, inp.min, inp.max, inp.step)
    let lhsVal: number
    try {
      if (spec.constraint && !(evalExpr(spec.constraint, env) > 0)) continue
      lhsVal = evalExpr(formula.rhs, env)
    } catch {
      continue
    }
    if (!Number.isFinite(lhsVal)) continue
    env[formula.lhs] = lhsVal

    // Angezeigte Werte (gerundet)
    const fmts: Record<string, NumFmt> = { [formula.lhs]: spec.lhsFmt }
    for (const [sym, inp] of Object.entries(spec.inputs)) fmts[sym] = inp.fmt
    const shown: Env = {}
    for (const [sym, v] of Object.entries(env)) shown[sym] = roundForDisplay(v, fmts[sym] ?? { kind: 'num', dec: 4 })

    // Lösung aus angezeigten Werten neu berechnen
    let answer: number
    try {
      if (target.sym === formula.lhs) answer = evalExpr(formula.rhs, shown)
      else {
        const solvedExpr = formula.solved?.[target.sym]
        if (!solvedExpr) continue
        answer = evalExpr(solvedExpr, shown)
      }
    } catch {
      continue
    }
    if (!Number.isFinite(answer)) continue
    if (target.sym !== formula.lhs && spec.inputs[target.sym]) {
      // Plausibilität: Ergebnis sollte nahe am ursprünglich gezogenen Wert liegen
      const orig = env[target.sym]!
      if (Math.abs(answer - orig) > Math.max(1e-6, Math.abs(orig) * 0.05)) continue
    }
    // negative Mengen/Preise etc. vermeiden, wenn die Eingaben positiv sind
    if (target.fmt.kind !== 'num' && target.fmt.kind !== 'pct' && answer < 0 && formula.lhs !== 'E' && formula.lhs !== 'KW' && formula.lhs !== 'CF') continue

    const prompt = target.template.replace(/\{([A-Za-z0-9_]+)\}/g, (_, sym: string) => {
      const v = shown[sym]
      const f = fmts[sym]
      return v === undefined || !f ? `{${sym}}` : formatNumber(v, f)
    })

    const solvedTex = target.sym === formula.lhs ? formula.tex : formula.rearranged?.find((r) => r.tex.includes(target.sym.split('_')[0]!))?.tex
    const varName = formula.variables.find((v) => v.sym === target.sym)?.name ?? target.sym

    return {
      id: `gen:${formula.id}:${target.sym}:${seed}`,
      seed,
      type: 'numeric',
      chapterId: formula.chapterId,
      formulaIds: [formula.id],
      skill: target.skill,
      difficulty: target.difficulty,
      origin: 'generiert',
      status: formula.status === 'ungeprüft' ? 'ungeprüft' : 'abgeleitet',
      prompt,
      answer,
      fmt: target.fmt,
      relTol: 0.001,
      hints: [
        `Welche Formel passt? Es geht um: ${formula.name}.`,
        target.sym === formula.lhs ? `Setze die gegebenen Werte in $${formula.tex}$ ein.` : `Stelle die Formel nach ${varName} um${solvedTex ? `: $${solvedTex}$` : ''}.`,
        'Achte auf Prozentangaben als Dezimalzahl (z. B. 5 % = 0,05) und rechne ungerundet weiter.',
      ],
      explanation: [
        `Formel: $${formula.tex}$`,
        `Ergebnis: ${formatNumber(answer, target.fmt)} (aus den angezeigten Werten berechnet).`,
      ],
    }
  }
  return null
}

/** Alle Formeln mit Generator. */
export function generatorTargets(formula: Formula): GeneratorTarget[] {
  return formula.generator?.targets ?? []
}
