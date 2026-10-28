import { collectVariables, evaluate, parse, ParseError, type Env, type Node } from './parser'
import { mulberry32 } from './random'

export type Domain = readonly [number, number]

export type EquivalenceResult =
  | { status: 'equivalent' }
  | { status: 'not-equivalent'; sample?: Env; expected?: number; got?: number }
  | { status: 'parse-error'; message: string; pos: number }
  | { status: 'unknown-variables'; names: string[] }
  | { status: 'undetermined'; message: string }

export interface EquivalenceOptions {
  /** Erlaubte Variablen mit Stichproben-Intervall. */
  domains: Record<string, Domain>
  /** Anzahl der Stützstellen. */
  samples?: number
  /** Relative Toleranz für Gleitkommavergleiche. */
  relTol?: number
  seed?: number
}

/**
 * Prüft zwei Ausdrücke auf mathematische Äquivalenz, indem beide an zufälligen
 * Stützstellen ausgewertet werden. Für die hier verwendeten Formeln (rationale
 * Funktionen, Potenzen, Wurzeln, Logarithmen) ist das in der Praxis sehr
 * zuverlässig: Zwei verschiedene Ausdrücke stimmen nur mit verschwindend
 * geringer Wahrscheinlichkeit an allen zufälligen Stellen überein.
 * Es handelt sich dennoch um einen numerischen und keinen symbolischen Beweis.
 */
export function checkEquivalence(input: string | Node, reference: string | Node, opts: EquivalenceOptions): EquivalenceResult {
  let a: Node
  try {
    a = typeof input === 'string' ? parse(input) : input
  } catch (e) {
    if (e instanceof ParseError) return { status: 'parse-error', message: e.message, pos: e.pos }
    throw e
  }
  const b = typeof reference === 'string' ? parse(reference) : reference

  const allowed = new Set(Object.keys(opts.domains))
  const unknown = [...collectVariables(a)].filter((v) => !allowed.has(v))
  if (unknown.length) return { status: 'unknown-variables', names: unknown }

  const rng = mulberry32(opts.seed ?? 12345)
  const n = opts.samples ?? 12
  const relTol = opts.relTol ?? 1e-7
  let compared = 0
  let tries = 0
  while (compared < n && tries < n * 6) {
    tries++
    const env: Env = {}
    for (const [name, [lo, hi]] of Object.entries(opts.domains)) env[name] = lo + (hi - lo) * rng()
    let va: number
    let vb: number
    try {
      vb = evaluate(b, env)
      va = evaluate(a, env)
    } catch {
      continue
    }
    if (!Number.isFinite(vb)) continue
    if (!Number.isFinite(va)) return { status: 'not-equivalent', sample: env, expected: vb, got: va }
    const scale = Math.max(1, Math.abs(vb))
    if (Math.abs(va - vb) > relTol * scale) return { status: 'not-equivalent', sample: env, expected: vb, got: va }
    compared++
  }
  if (compared < Math.min(4, n)) return { status: 'undetermined', message: 'Ausdruck konnte nicht ausreichend oft ausgewertet werden.' }
  return { status: 'equivalent' }
}

/**
 * Teilt eine Eingabe wie „BW = C/(1+r)^T“ in linke und rechte Seite auf.
 * Steht die Zielvariable allein auf einer Seite, wird die andere Seite
 * zurückgegeben. Ohne „=“ wird die Eingabe unverändert zurückgegeben.
 */
export function stripTargetSide(input: string, target: string): { ok: true; expr: string } | { ok: false; message: string } {
  const parts = input.split('=')
  if (parts.length === 1) return { ok: true, expr: input }
  if (parts.length > 2) return { ok: false, message: 'Bitte nur ein Gleichheitszeichen verwenden.' }
  const [l, r] = parts.map((s) => s.trim()) as [string, string]
  if (l.replace(/\s/g, '') === target) return { ok: true, expr: r }
  if (r.replace(/\s/g, '') === target) return { ok: true, expr: l }
  return { ok: false, message: `Auf einer Seite des Gleichheitszeichens muss genau ${target} stehen.` }
}
