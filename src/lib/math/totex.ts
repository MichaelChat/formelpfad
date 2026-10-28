import type { Node } from './parser'

/** Wandelt einen geparsten Ausdruck in LaTeX um (Live-Vorschau der Formeleingabe). */
export function toTex(node: Node, varTex: Record<string, string> = {}): string {
  const prec = (n: Node): number => {
    if (n.kind === 'bin') return n.op === '+' || n.op === '-' ? 1 : n.op === '*' ? 2 : n.op === '/' ? 3 : 4
    if (n.kind === 'neg') return 1.5
    return 5
  }
  const wrap = (n: Node, min: number) => (prec(n) < min ? `\\left(${toTex(n, varTex)}\\right)` : toTex(n, varTex))
  switch (node.kind) {
    case 'num':
      return Math.abs(node.value - Math.E) < 1e-15 ? 'e' : String(node.value).replace('.', '{,}')
    case 'var':
      return varTex[node.name] ?? node.name.replace(/_(\w+)/, '_{$1}')
    case 'neg':
      return `-${wrap(node.arg, 2)}`
    case 'call':
      if (node.fn === 'sqrt') return `\\sqrt{${toTex(node.arg, varTex)}}`
      if (node.fn === 'exp') return `e^{${toTex(node.arg, varTex)}}`
      if (node.fn === 'abs') return `\\left|${toTex(node.arg, varTex)}\\right|`
      return `\\${node.fn}\\left(${toTex(node.arg, varTex)}\\right)`
    case 'bin':
      switch (node.op) {
        case '+':
          return `${toTex(node.left, varTex)} + ${wrap(node.right, 1)}`
        case '-':
          return `${toTex(node.left, varTex)} - ${wrap(node.right, 2)}`
        case '*':
          return `${wrap(node.left, 2)} \\cdot ${wrap(node.right, 2)}`
        case '/':
          return `\\frac{${toTex(node.left, varTex)}}{${toTex(node.right, varTex)}}`
        case '^':
          return `{${wrap(node.left, 5)}}^{${toTex(node.right, varTex)}}`
      }
  }
}
