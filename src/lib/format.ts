/** Darstellungs- und Eingabeformate für Zahlen (deutsche Konventionen). */

export type NumKind = 'eur' | 'pct' | 'num' | 'int' | 'years' | 'unit'

export interface NumFmt {
  kind: NumKind
  /** Nachkommastellen in der Anzeige (Klausur: 4). */
  dec: number
  /** Einheit für kind = 'unit' (z. B. „Stück“, „€/h“). */
  unit?: string
}

export const fmt = {
  eur: (dec = 2): NumFmt => ({ kind: 'eur', dec }),
  pct: (dec = 2): NumFmt => ({ kind: 'pct', dec }),
  num: (dec = 4): NumFmt => ({ kind: 'num', dec }),
  int: (): NumFmt => ({ kind: 'int', dec: 0 }),
  years: (dec = 0): NumFmt => ({ kind: 'years', dec }),
  unit: (unit: string, dec = 2): NumFmt => ({ kind: 'unit', dec, unit }),
}

export function formatPlain(value: number, dec: number): string {
  return value.toLocaleString('de-DE', { minimumFractionDigits: dec, maximumFractionDigits: dec })
}

/** Formatiert einen Wert. Prozentwerte werden intern als Dezimalzahl gespeichert (0,05 = 5 %). */
export function formatNumber(value: number, f: NumFmt): string {
  switch (f.kind) {
    case 'eur':
      return `${formatPlain(value, f.dec)} €`
    case 'pct':
      return `${formatPlain(value * 100, f.dec)} %`
    case 'int':
      return formatPlain(Math.round(value), 0)
    case 'years':
      return `${formatPlain(value, f.dec)} ${Math.abs(value - 1) < 1e-9 ? 'Jahr' : 'Jahre'}`
    case 'unit':
      return `${formatPlain(value, f.dec)} ${f.unit ?? ''}`.trim()
    case 'num':
      return formatPlain(value, f.dec)
  }
}

export function unitLabel(f: NumFmt): string {
  switch (f.kind) {
    case 'eur':
      return '€'
    case 'pct':
      return '%'
    case 'years':
      return 'Jahre'
    case 'unit':
      return f.unit ?? ''
    default:
      return ''
  }
}

export interface ParsedNumber {
  /** Mögliche Lesarten der Eingabe (z. B. „1.250“ = 1250 oder 1,25). */
  candidates: number[]
  hadPercentSign: boolean
}

/**
 * Liest eine Zahleneingabe tolerant ein:
 * Dezimalkomma und -punkt, Tausenderpunkte, wissenschaftliche Schreibweise,
 * Einheiten (€, %, Stück), Leerzeichen und typografische Minuszeichen.
 * Gibt `null` zurück, wenn keine Zahl erkennbar ist.
 */
export function parseNumberInput(raw: string): ParsedNumber | null {
  let s = raw.trim().replace(/[−–—]/g, '-').replace(/\u00a0/g, ' ')
  const hadPercentSign = s.includes('%')
  s = s.replace(/%|€|eur(o)?|stück|stk\.?|jahre?|einheiten|\/h|h\b/gi, '').replace(/\s+/g, '')
  if (!s) return null
  let sign = 1
  if (s.startsWith('-')) {
    sign = -1
    s = s.slice(1)
  } else if (s.startsWith('+')) s = s.slice(1)

  let exp = 0
  const expMatch = s.match(/^(.*?)[eE]([+-]?\d+)$/)
  if (expMatch) {
    s = expMatch[1]!
    exp = Number(expMatch[2])
  }
  if (!/^[\d.,]+$/.test(s) || !/\d/.test(s)) return null

  const candidates: number[] = []
  const lastDot = s.lastIndexOf('.')
  const lastComma = s.lastIndexOf(',')
  const toNum = (intPart: string, frac: string) => Number(`${intPart || '0'}.${frac || '0'}`)

  if (lastDot >= 0 && lastComma >= 0) {
    // Beide vorhanden: das letzte Zeichen ist der Dezimaltrenner.
    const decSep = lastDot > lastComma ? '.' : ','
    const thouSep = decSep === '.' ? ',' : '.'
    const [i, f = ''] = s.split(decSep)
    if (s.split(decSep).length > 2) return null
    candidates.push(toNum(i!.split(thouSep).join(''), f))
  } else if (lastComma >= 0) {
    const parts = s.split(',')
    if (parts.length === 2) candidates.push(toNum(parts[0]!, parts[1]!))
    else if (parts.slice(1).every((p) => p.length === 3)) candidates.push(Number(parts.join('')))
    else return null
  } else if (lastDot >= 0) {
    const parts = s.split('.')
    const looksLikeThousands = parts.length >= 2 && parts.slice(1).every((p) => p.length === 3) && parts[0] !== '0' && parts[0] !== ''
    if (parts.length === 2) {
      candidates.push(toNum(parts[0]!, parts[1]!))
      if (looksLikeThousands) candidates.push(Number(parts.join('')))
    } else if (looksLikeThousands) {
      candidates.push(Number(parts.join('')))
    } else return null
  } else {
    candidates.push(Number(s))
  }

  const scaled = candidates.filter((c) => Number.isFinite(c)).map((c) => sign * c * Math.pow(10, exp))
  if (!scaled.length) return null
  return { candidates: [...new Set(scaled)], hadPercentSign }
}
