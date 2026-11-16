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

/** Abgesetzte Formel innerhalb von Fließtext (als span, damit sie auch in <p> stehen darf). */
const BlockTeX = memo(function BlockTeX({ tex }: { tex: string }) {
  const html = useMemo(() => render(tex, true), [tex])
  return <span className="math-block my-1 block" role="math" aria-label={tex} tabIndex={0} dangerouslySetInnerHTML={{ __html: html }} />
})

/** Fließtext: **fett** und Zeilenumbrüche (\n), sonst unverändert. */
function PlainText({ s }: { s: string }) {
  if (!s.includes('**') && !s.includes('\n')) return <span>{s}</span>
  const lines = s.split('\n')
  return (
    <>
      {lines.map((line, li) => (
        <span key={li}>
          {li > 0 && <br />}
          {line.split(/(\*\*[^*]+\*\*)/).map((seg, si) => (seg.startsWith('**') && seg.endsWith('**') && seg.length > 4 ? <strong key={si} className="font-semibold text-ink">{seg.slice(2, -2)}</strong> : seg))}
        </span>
      ))}
    </>
  )
}

/** Text mit Inline-Mathematik in $…$ und abgesetzter Mathematik in $$…$$ (z. B. Matrizen). */
export const Rich = memo(function Rich({ text, className, as: As = 'span' }: { text: string; className?: string; as?: 'span' | 'p' | 'div' | 'li' }) {
  const parts = useMemo(() => {
    const out: { math: false | 'inline' | 'block'; s: string }[] = []
    const re = /\$\$([\s\S]+?)\$\$|\$([^$]+)\$/g
    let last = 0
    let m: RegExpExecArray | null
    while ((m = re.exec(text))) {
      if (m.index > last) out.push({ math: false, s: text.slice(last, m.index) })
      out.push(m[1] !== undefined ? { math: 'block', s: m[1] } : { math: 'inline', s: m[2]! })
      last = m.index + m[0].length
    }
    if (last < text.length) out.push({ math: false, s: text.slice(last) })
    return out
  }, [text])
  return (
    <As className={className}>
      {parts.map((p, i) => (p.math === 'block' ? <BlockTeX key={i} tex={p.s} /> : p.math === 'inline' ? <InlineTeX key={i} tex={p.s} /> : <PlainText key={i} s={p.s} />))}
    </As>
  )
})
