import katex from 'katex'
import { memo, useMemo } from 'react'

const cache = new Map<string, string>()

function render(tex: string, display: boolean): string {
  const key = `${display ? 'D' : 'I'}:${tex}`
  let html = cache.get(key)
  if (!html) {
    html = katex.renderToString(tex, { displayMode: display, throwOnError: false, strict: false, output: 'htmlAndMathml' })
    cache.set(key, html)
  }
  return html
}

/** Abgesetzte Formel; lange Ausdrücke sind horizontal scrollbar statt abgeschnitten. */
export const TeX = memo(function TeX({ tex, className = '', label }: { tex: string; className?: string; label?: string }) {
  const html = useMemo(() => render(tex, true), [tex])
  return <div className={`math-block ${className}`} role="math" aria-label={label ?? tex} tabIndex={0} dangerouslySetInnerHTML={{ __html: html }} />
})

export const InlineTeX = memo(function InlineTeX({ tex }: { tex: string }) {
  const html = useMemo(() => render(tex, false), [tex])
  return <span dangerouslySetInnerHTML={{ __html: html }} />
})

/** Text mit Inline-Mathematik in $…$. */
export const Rich = memo(function Rich({ text, className, as: As = 'span' }: { text: string; className?: string; as?: 'span' | 'p' | 'div' | 'li' }) {
  const parts = useMemo(() => {
    const out: { math: boolean; s: string }[] = []
    const re = /\$([^$]+)\$/g
    let last = 0
    let m: RegExpExecArray | null
    while ((m = re.exec(text))) {
      if (m.index > last) out.push({ math: false, s: text.slice(last, m.index) })
      out.push({ math: true, s: m[1]! })
      last = m.index + m[0].length
    }
    if (last < text.length) out.push({ math: false, s: text.slice(last) })
    return out
  }, [text])
  return (
    <As className={className}>
      {parts.map((p, i) => (p.math ? <InlineTeX key={i} tex={p.s} /> : <span key={i}>{p.s}</span>))}
    </As>
  )
})
