import { useMemo, useRef } from 'react'
import { Check, X } from 'lucide-react'
import type { Exercise, McOption, Step } from '../../content/types'
import type { Response, StepResponse } from '../../lib/evaluate'
import type { CheckResult } from '../../lib/validation'
import { formatNumber, unitLabel, type NumFmt } from '../../lib/format'
import { parse } from '../../lib/math/parser'
import { toTex } from '../../lib/math/totex'
import { hashString, mulberry32, shuffle } from '../../lib/math/random'
import { Rich, TeX } from '../Math'

interface Props {
  exercise: Exercise
  response: Response
  onChange: (r: Response) => void
  /** Nach dem Prüfen: Lösung markieren, Eingaben sperren. */
  reveal?: boolean
  disabled?: boolean
  /** Schrittaufgaben im Lernmodus: Ergebnisse je Schritt und aktiver Schritt. */
  stepResults?: (CheckResult | undefined)[]
  activeStep?: number
  onSubmit?: () => void
}

export function ExerciseInput(p: Props) {
  const ex = p.exercise
  switch (ex.type) {
    case 'mc':
      return <McInput options={ex.options} multi={!!ex.multi} selected={p.response.type === 'mc' ? p.response.selected : []} onChange={(selected) => p.onChange({ type: 'mc', selected })} reveal={p.reveal} disabled={p.disabled} name={ex.id} />
    case 'match':
      return <MatchInput exercise={ex} assignment={p.response.type === 'match' ? p.response.assignment : {}} onChange={(assignment) => p.onChange({ type: 'match', assignment })} reveal={p.reveal} disabled={p.disabled} />
    case 'numeric':
      return <NumberInput value={p.response.type === 'numeric' ? p.response.text : ''} onChange={(text) => p.onChange({ type: 'numeric', text })} unit={unitLabel(ex.fmt)} disabled={p.disabled} onSubmit={p.onSubmit} label="Deine Antwort" />
    case 'formula':
      return <FormulaInput exercise={ex} value={p.response.type === 'formula' ? p.response.text : ''} onChange={(text) => p.onChange({ type: 'formula', text })} disabled={p.disabled} onSubmit={p.onSubmit} />
    case 'steps': {
      const steps = p.response.type === 'steps' ? p.response.steps : []
      return (
        <ol className="space-y-4">
          {ex.steps.map((st, i) => {
            const res = p.stepResults?.[i]
            const active = p.activeStep === undefined || p.activeStep === i
            const locked = p.disabled || !!res || (p.activeStep !== undefined && i > p.activeStep)
            return (
              <li key={i} className={`rounded-2xl border p-4 transition ${res ? (res.correct ? 'border-good bg-good-soft/40' : 'border-bad bg-bad-soft/40') : active ? 'border-ink-3 bg-paper' : 'border-line bg-paper-2/40 opacity-60'}`}>
                <div className="mb-3 flex items-start gap-3">
                  <span className="grid size-7 shrink-0 place-items-center rounded-full bg-ink text-sm font-bold text-paper">{i + 1}</span>
                  <Rich text={st.label} className="pt-0.5 font-medium" />
                  {st.points !== undefined && <span className="ml-auto shrink-0 text-xs text-ink-3">{st.points} P.</span>}
                </div>
                <StepInput step={st} value={steps[i]} onChange={(v) => p.onChange({ type: 'steps', steps: steps.map((s, j) => (j === i ? v : s)) })} disabled={locked} reveal={!!res || p.reveal} name={`${ex.id}-s${i}`} onSubmit={p.onSubmit} />
                {res && !res.correct && step_solution(st)}
              </li>
            )
          })}
        </ol>
      )
    }
    case 'selfcheck':
      return (
        <label className="block">
          <span className="mb-2 block text-sm font-medium text-ink-2">Deine Antwort (Notizen – wird nicht automatisch bewertet)</span>
          <textarea
            className="min-h-32 w-full rounded-2xl border-2 border-line bg-paper p-3 text-base outline-none focus:border-ink-3"
            value={p.response.type === 'selfcheck' ? p.response.text : ''}
            onChange={(e) => p.onChange({ type: 'selfcheck', text: e.target.value, selfScore: p.response.type === 'selfcheck' ? p.response.selfScore : null })}
            disabled={p.disabled}
          />
        </label>
      )
  }
}

function step_solution(st: Step) {
  if (st.kind === 'numeric') return <p className="mt-2 text-sm text-ink-2">Richtig wäre: <strong>{formatAnswer(st.answer, st.fmt)}</strong></p>
  const right = st.options.find((o) => o.correct)
  return right ? <p className="mt-2 text-sm text-ink-2">Richtig wäre: <Rich text={right.text} className="font-semibold" /></p> : null
}

function formatAnswer(v: number, f: NumFmt) {
  return formatNumber(v, { ...f, dec: Math.max(f.dec, f.kind === 'int' ? 0 : 2) })
}

function StepInput({ step, value, onChange, disabled, reveal, name, onSubmit }: { step: Step; value: StepResponse | undefined; onChange: (v: StepResponse) => void; disabled?: boolean; reveal?: boolean; name: string; onSubmit?: () => void }) {
  if (step.kind === 'numeric') return <NumberInput value={typeof value === 'string' ? value : ''} onChange={onChange} unit={unitLabel(step.fmt)} disabled={disabled} onSubmit={onSubmit} label={step.label} compact />
  return <McInput options={step.options} multi={false} selected={Array.isArray(value) ? value : []} onChange={onChange} disabled={disabled} reveal={reveal} name={name} />
}

export function McInput({ options, multi, selected, onChange, reveal, disabled, name }: { options: McOption[]; multi: boolean; selected: string[]; onChange: (s: string[]) => void; reveal?: boolean; disabled?: boolean; name: string }) {
  const toggle = (id: string) => {
    if (disabled) return
    if (multi) onChange(selected.includes(id) ? selected.filter((x) => x !== id) : [...selected, id])
    else onChange([id])
  }
  return (
    <div role={multi ? 'group' : 'radiogroup'} aria-label="Antwortmöglichkeiten" className="grid gap-2.5">
      {multi && <p className="text-sm text-ink-3">Mehrere Antworten können richtig sein.</p>}
      {options.map((o, i) => {
        const isSel = selected.includes(o.id)
        let state = isSel ? 'border-ink bg-paper-2' : 'border-line bg-paper hover:border-ink-3'
        if (reveal) state = o.correct ? 'border-good bg-good-soft' : isSel ? 'border-bad bg-bad-soft' : 'border-line bg-paper opacity-70'
        return (
          <button
            key={o.id}
            type="button"
            role={multi ? 'checkbox' : 'radio'}
            aria-checked={isSel}
            name={name}
            disabled={disabled}
            onClick={() => toggle(o.id)}
            className={`flex min-h-14 w-full items-center gap-3 rounded-2xl border-2 px-4 py-3 text-left transition ${state}`}
          >
            <span className={`grid size-7 shrink-0 place-items-center rounded-lg border-2 text-sm font-bold ${isSel ? 'border-ink bg-ink text-paper' : 'border-line text-ink-3'}`}>
              {reveal && o.correct ? <Check className="size-4" /> : reveal && isSel ? <X className="size-4" /> : String.fromCharCode(65 + i)}
            </span>
            <Rich text={o.text} className="min-w-0 break-words" />
          </button>
        )
      })}
    </div>
  )
}

function MatchInput({ exercise, assignment, onChange, reveal, disabled }: { exercise: Extract<Exercise, { type: 'match' }>; assignment: Record<number, number>; onChange: (a: Record<number, number>) => void; reveal?: boolean; disabled?: boolean }) {
  const order = useMemo(() => shuffle(mulberry32(hashString(exercise.id)), exercise.pairs.map((_, i) => i)), [exercise])
  return (
    <div className="grid gap-3">
      {exercise.pairs.map((pair, i) => {
        const val = assignment[i]
        const ok = reveal ? val === i : undefined
        return (
          <div key={i} className={`grid gap-2 rounded-2xl border-2 p-3 sm:grid-cols-[minmax(0,2fr)_minmax(0,3fr)] sm:items-center ${ok === undefined ? 'border-line' : ok ? 'border-good bg-good-soft/50' : 'border-bad bg-bad-soft/50'}`}>
            <Rich text={pair.left} className="font-medium" />
            <div>
              <select
                aria-label={`Zuordnung für ${pair.left}`}
                className="min-h-12 w-full rounded-xl border-2 border-line bg-paper px-3 text-base outline-none focus:border-ink-3"
                value={val ?? ''}
                disabled={disabled}
                onChange={(e) => {
                  const next = { ...assignment }
                  if (e.target.value === '') delete next[i]
                  else next[i] = Number(e.target.value)
                  onChange(next)
                }}
              >
                <option value="">– auswählen –</option>
                {order.map((j) => (
                  <option key={j} value={j}>
                    {exercise.pairs[j]!.right}
                  </option>
                ))}
              </select>
              {reveal && !ok && <p className="mt-1 text-sm text-ink-2">Richtig: {pair.right}</p>}
            </div>
          </div>
        )
      })}
    </div>
  )
}

export function NumberInput({ value, onChange, unit, disabled, onSubmit, label, compact }: { value: string; onChange: (v: string) => void; unit: string; disabled?: boolean; onSubmit?: () => void; label: string; compact?: boolean }) {
  return (
    <div className={`flex items-stretch overflow-hidden rounded-2xl border-2 border-line bg-paper focus-within:border-ink-3 ${compact ? '' : 'text-lg'}`}>
      <input
        aria-label={label}
        className="min-h-12 w-full min-w-0 bg-transparent px-4 py-2 font-mono outline-none disabled:opacity-60"
        inputMode="decimal"
        autoComplete="off"
        autoCorrect="off"
        spellCheck={false}
        placeholder="z. B. 1.234,5678"
        value={value}
        disabled={disabled}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' && onSubmit) {
            e.preventDefault()
            onSubmit()
          }
        }}
      />
      {unit && <span className="grid place-items-center bg-paper-2 px-4 text-ink-2">{unit}</span>}
    </div>
  )
}

const KEYS: { label: string; insert: string; aria: string }[] = [
  { label: '+', insert: '+', aria: 'plus' },
  { label: '−', insert: '-', aria: 'minus' },
  { label: '·', insert: '*', aria: 'mal' },
  { label: '/', insert: '/', aria: 'geteilt durch' },
  { label: 'xʸ', insert: '^', aria: 'hoch' },
  { label: '(', insert: '(', aria: 'Klammer auf' },
  { label: ')', insert: ')', aria: 'Klammer zu' },
  { label: '√', insert: 'sqrt(', aria: 'Wurzel' },
  { label: 'ln', insert: 'ln(', aria: 'natürlicher Logarithmus' },
  { label: 'eˣ', insert: 'exp(', aria: 'Exponentialfunktion' },
  { label: '1', insert: '1', aria: 'eins' },
  { label: '2', insert: '2', aria: 'zwei' },
]

function FormulaInput({ exercise, value, onChange, disabled, onSubmit }: { exercise: Extract<Exercise, { type: 'formula' }>; value: string; onChange: (v: string) => void; disabled?: boolean; onSubmit?: () => void }) {
  const ref = useRef<HTMLInputElement>(null)
  const varTex = useMemo(() => Object.fromEntries(exercise.variables.map((v) => [v.sym, v.tex])), [exercise])
  const preview = useMemo(() => {
    if (!value.trim()) return null
    try {
      const rhs = value.includes('=') ? value.split('=').pop()! : value
      return toTex(parse(rhs), varTex)
    } catch {
      return null
    }
  }, [value, varTex])

  const insert = (s: string) => {
    const el = ref.current
    if (!el || disabled) return
    const start = el.selectionStart ?? value.length
    const end = el.selectionEnd ?? value.length
    const next = value.slice(0, start) + s + value.slice(end)
    onChange(next)
    requestAnimationFrame(() => {
      el.focus()
      el.setSelectionRange(start + s.length, start + s.length)
    })
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 rounded-2xl border-2 border-line bg-paper px-3 focus-within:border-ink-3">
        <span className="shrink-0 font-semibold">
          <TeX tex={`${exercise.targetTex} =`} className="!p-0" />
        </span>
        <input
          ref={ref}
          aria-label={`Formel für ${exercise.target}`}
          className="min-h-12 w-full min-w-0 bg-transparent py-2 font-mono text-lg outline-none"
          autoCapitalize="off"
          autoComplete="off"
          autoCorrect="off"
          spellCheck={false}
          placeholder="Ausdruck eingeben"
          value={value}
          disabled={disabled}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && onSubmit) {
              e.preventDefault()
              onSubmit()
            }
          }}
        />
      </div>
      <div className="min-h-12 rounded-xl bg-paper-2 px-3 py-1" aria-live="polite">
        {preview ? <TeX tex={`${exercise.targetTex} = ${preview}`} /> : <p className="py-2 text-sm text-ink-3">Vorschau erscheint hier. Variablen über die Tasten einfügen.</p>}
      </div>
      <div className="flex flex-wrap gap-2" aria-label="Variablen">
        {exercise.variables.map((v) => (
          <button key={v.sym} type="button" disabled={disabled} onClick={() => insert(v.sym)} title={v.name} className="min-h-11 rounded-xl border-2 border-fin/40 bg-fin-soft px-3 text-fin">
            <TeX tex={v.tex} className="!p-0" label={v.name} />
          </button>
        ))}
      </div>
      <div className="grid grid-cols-6 gap-2" aria-label="Rechenzeichen">
        {KEYS.map((k) => (
          <button key={k.label} type="button" aria-label={k.aria} disabled={disabled} onClick={() => insert(k.insert)} className="min-h-11 rounded-xl border-2 border-line bg-paper font-mono text-lg hover:border-ink-3">
            {k.label}
          </button>
        ))}
      </div>
      <details className="text-sm text-ink-3">
        <summary className="cursor-pointer">Wie wird geprüft?</summary>
        <Rich as="p" className="mt-1" text="Deine Formel wird an vielen zufälligen Zahlenwerten mit der Musterlösung verglichen. So werden auch umgeformte, aber gleichwertige Ausdrücke erkannt (z. B. $C/(1+r)^T$ und $C\cdot(1+r)^{-T}$). Das ist ein numerischer Test, kein symbolischer Beweis. Schreibweise: * für mal, / für geteilt, ^ für hoch, sqrt( ) für Wurzel." />
      </details>
    </div>
  )
}
