/**
 * Kleiner, abhängigkeitsfreier Parser für mathematische Ausdrücke.
 *
 * Unterstützt: + − * / ^, Klammern, unäres Minus, implizite Multiplikation
 * („2r“, „C(1+r)“, „(1+r)(1+g)“), Funktionen sqrt/ln/log/exp/abs und die
 * Konstante e. Bezeichner dürfen Buchstaben, Ziffern und „_“ enthalten
 * (z. B. C_T, mu_M, sigma_A).
 *
 * Bewusst getrennt von der Darstellung (KaTeX): Formeln werden einmal als
 * LaTeX (zum Anzeigen) und einmal als Ausdruck (zum Rechnen/Prüfen) gepflegt.
 */

export type Node =
  | { kind: 'num'; value: number }
  | { kind: 'var'; name: string }
  | { kind: 'neg'; arg: Node }
  | { kind: 'bin'; op: '+' | '-' | '*' | '/' | '^'; left: Node; right: Node }
  | { kind: 'call'; fn: FnName; arg: Node }

export const FUNCTIONS = ['sqrt', 'ln', 'log', 'exp', 'abs'] as const
export type FnName = (typeof FUNCTIONS)[number]

const FN_SET = new Set<string>(FUNCTIONS)

type Token =
  | { t: 'num'; v: number; pos: number }
  | { t: 'id'; v: string; pos: number }
  | { t: 'op'; v: '+' | '-' | '*' | '/' | '^'; pos: number }
  | { t: '('; pos: number }
  | { t: ')'; pos: number }

export class ParseError extends Error {
  readonly pos: number
  constructor(message: string, pos: number) {
    super(message)
    this.pos = pos
  }
}

/** Ersetzt typografische Zeichen durch ASCII-Entsprechungen. */
export function normalizeInput(src: string): string {
  return src
    .replace(/[−–—]/g, '-')
    .replace(/[·×⋅∙]/g, '*')
    .replace(/÷/g, '/')
    .replace(/²/g, '^2')
    .replace(/³/g, '^3')
    .replace(/√/g, 'sqrt')
    .replace(/\*\*/g, '^')
    .replace(/\[/g, '(')
    .replace(/\]/g, ')')
    .replace(/\{/g, '(')
    .replace(/\}/g, ')')
}

function tokenize(src: string): Token[] {
  const s = normalizeInput(src)
  const tokens: Token[] = []
  let i = 0
  while (i < s.length) {
    const c = s[i]!
    if (c === ' ' || c === '\t' || c === '\n') {
      i++
      continue
    }
    if (/[0-9]/.test(c) || ((c === '.' || c === ',') && /[0-9]/.test(s[i + 1] ?? ''))) {
      const start = i
      let raw = ''
      while (i < s.length && /[0-9.,]/.test(s[i]!)) {
        raw += s[i]
        i++
      }
      // Dezimalkomma oder -punkt; Tausendertrennzeichen sind in Formeln nicht vorgesehen.
      const normalized = raw.replace(',', '.')
      if ((normalized.match(/\./g) ?? []).length > 1) {
        throw new ParseError(`Ungültige Zahl „${raw}“`, start)
      }
      // wissenschaftliche Schreibweise 1e-3
      if ((s[i] === 'e' || s[i] === 'E') && /[0-9+-]/.test(s[i + 1] ?? '') && /[0-9]/.test(s[i + 1] === '+' || s[i + 1] === '-' ? (s[i + 2] ?? '') : (s[i + 1] ?? ''))) {
        let exp = s[i]!
        i++
        if (s[i] === '+' || s[i] === '-') {
          exp += s[i]
          i++
        }
        while (i < s.length && /[0-9]/.test(s[i]!)) {
          exp += s[i]
          i++
        }
        tokens.push({ t: 'num', v: Number(normalized + exp.replace('E', 'e')), pos: start })
        continue
      }
      tokens.push({ t: 'num', v: Number(normalized), pos: start })
      continue
    }
    if (/[A-Za-z_α-ωΑ-Ω]/.test(c)) {
      const start = i
      let id = ''
      while (i < s.length && /[A-Za-z0-9_α-ωΑ-Ω]/.test(s[i]!)) {
        id += s[i]
        i++
      }
      tokens.push({ t: 'id', v: id, pos: start })
      continue
    }
    if (c === '+' || c === '-' || c === '*' || c === '/' || c === '^') {
      tokens.push({ t: 'op', v: c, pos: i })
      i++
      continue
    }
    if (c === '(') {
      tokens.push({ t: '(', pos: i })
      i++
      continue
    }
    if (c === ')') {
      tokens.push({ t: ')', pos: i })
      i++
      continue
    }
    throw new ParseError(`Unerwartetes Zeichen „${c}“`, i)
  }
  return tokens
}

/**
 * Grammatik (Präzedenz aufsteigend):
 *   expr   := term (('+'|'-') term)*
 *   term   := unary (('*'|'/') unary | implicit unary)*
 *   unary  := '-' unary | '+' unary | power
 *   power  := atom ('^' unary)?           (rechtsassoziativ)
 *   atom   := num | id | id '(' expr ')' | '(' expr ')'
 */
export function parse(src: string): Node {
  const tokens = tokenize(src)
  if (tokens.length === 0) throw new ParseError('Leere Eingabe', 0)
  let p = 0
  const peek = () => tokens[p]
  const endPos = () => (tokens.length ? tokens[tokens.length - 1]!.pos + 1 : 0)

  function expr(): Node {
    let left = term()
    for (;;) {
      const tk = peek()
      if (tk && tk.t === 'op' && (tk.v === '+' || tk.v === '-')) {
        p++
        left = { kind: 'bin', op: tk.v, left, right: term() }
      } else return left
    }
  }

  function startsAtom(tk: Token | undefined): boolean {
    return !!tk && (tk.t === 'num' || tk.t === 'id' || tk.t === '(')
  }

  function term(): Node {
    let left = unary()
    for (;;) {
      const tk = peek()
      if (tk && tk.t === 'op' && (tk.v === '*' || tk.v === '/')) {
        p++
        left = { kind: 'bin', op: tk.v, left, right: unary() }
      } else if (startsAtom(tk)) {
        // implizite Multiplikation, z. B. „2r“ oder „C(1+r)“
        left = { kind: 'bin', op: '*', left, right: power() }
      } else return left
    }
  }

  function unary(): Node {
    const tk = peek()
    if (tk && tk.t === 'op' && tk.v === '-') {
      p++
      return { kind: 'neg', arg: unary() }
    }
    if (tk && tk.t === 'op' && tk.v === '+') {
      p++
      return unary()
    }
    return power()
  }

  function power(): Node {
    const base = atom()
    const tk = peek()
    if (tk && tk.t === 'op' && tk.v === '^') {
      p++
      return { kind: 'bin', op: '^', left: base, right: unary() }
    }
    return base
  }

  function atom(): Node {
    const tk = peek()
    if (!tk) throw new ParseError('Ausdruck endet unerwartet', endPos())
    if (tk.t === 'num') {
      p++
      return { kind: 'num', value: tk.v }
    }
    if (tk.t === 'id') {
      p++
      const next = peek()
      if (FN_SET.has(tk.v) && next && next.t === '(') {
        p++
        const arg = expr()
        expect(')')
        return { kind: 'call', fn: tk.v as FnName, arg }
      }
      if (FN_SET.has(tk.v)) throw new ParseError(`Nach „${tk.v}“ wird „(“ erwartet`, tk.pos)
      if (tk.v === 'e') return { kind: 'num', value: Math.E }
      return { kind: 'var', name: tk.v }
    }
    if (tk.t === '(') {
      p++
      const inner = expr()
      expect(')')
      return inner
    }
    throw new ParseError(`Unerwartetes „${tk.t === 'op' ? tk.v : tk.t}“`, tk.pos)
  }

  function expect(t: ')') {
    const tk = peek()
    if (!tk || tk.t !== t) throw new ParseError('Schließende Klammer „)“ fehlt', tk ? tk.pos : endPos())
    p++
  }

  const result = expr()
  if (p < tokens.length) {
    const tk = tokens[p]!
    throw new ParseError(tk.t === ')' ? 'Zu viele schließende Klammern' : 'Unerwartetes Zeichen im Ausdruck', tk.pos)
  }
  return result
}

export type Env = Record<string, number>

export function evaluate(node: Node, env: Env): number {
  switch (node.kind) {
    case 'num':
      return node.value
    case 'var': {
      const v = env[node.name]
      if (v === undefined) throw new Error(`Unbekannte Variable ${node.name}`)
      return v
    }
    case 'neg':
      return -evaluate(node.arg, env)
    case 'bin': {
      const a = evaluate(node.left, env)
      const b = evaluate(node.right, env)
      switch (node.op) {
        case '+':
          return a + b
        case '-':
          return a - b
        case '*':
          return a * b
        case '/':
          return a / b
        case '^':
          return Math.pow(a, b)
      }
      break
    }
    case 'call': {
      const a = evaluate(node.arg, env)
      switch (node.fn) {
        case 'sqrt':
          return Math.sqrt(a)
        case 'ln':
          return Math.log(a)
        case 'log':
          return Math.log10(a)
        case 'exp':
          return Math.exp(a)
        case 'abs':
          return Math.abs(a)
      }
    }
  }
  throw new Error('Unbekannter Knoten')
}

export function collectVariables(node: Node, out = new Set<string>()): Set<string> {
  switch (node.kind) {
    case 'var':
      out.add(node.name)
      break
    case 'neg':
    case 'call':
      collectVariables(node.arg, out)
      break
    case 'bin':
      collectVariables(node.left, out)
      collectVariables(node.right, out)
      break
    case 'num':
      break
  }
  return out
}

/** Bequemlichkeit: Ausdruck parsen und direkt auswerten. */
export function evalExpr(src: string, env: Env): number {
  return evaluate(parse(src), env)
}
