import type { ReactNode } from 'react'
import { AlertTriangle, Compass, Lightbulb, ListChecks, Target } from 'lucide-react'
import { formulaById } from '../content'
import type { Formula } from '../content/types'
import { Rich, TeX } from './Math'
import { StatusBadge } from './kit'

export function VariableTable({ formula }: { formula: Formula }) {
  if (!formula.variables.length) return null
  return (
    <dl className="divide-y divide-line overflow-hidden rounded-2xl border border-line">
      {formula.variables.map((v) => (
        <div key={v.sym} className="grid grid-cols-[4.5rem_1fr] items-center gap-3 bg-paper px-3 py-2 sm:grid-cols-[6rem_1fr]">
          <dt className="overflow-x-auto">
            <TeX tex={v.tex} className="!p-0 text-center" label={v.name} />
          </dt>
          <dd className="text-sm">
            <Rich text={v.name} />
            {v.unit && <span className="text-ink-3"> · {v.unit}</span>}
          </dd>
        </div>
      ))}
    </dl>
  )
}

export function FormulaCard({ formulaId, showIntro = true }: { formulaId: string; showIntro?: boolean }) {
  const f = formulaById.get(formulaId)
  if (!f) return null
  return (
    <div className="space-y-4">
      <div>
        <div className="mb-1 flex flex-wrap items-center gap-2">
          <p className="text-sm font-semibold uppercase tracking-wide text-ink-3">Formel</p>
          <StatusBadge status={f.status} />
        </div>
        <h2 className="text-2xl font-semibold">{f.name}</h2>
      </div>
      <TeX tex={f.tex} className="rounded-2xl border border-line bg-paper-2/60 px-3 py-2 text-xl" label={f.name} />
      <VariableTable formula={f} />
      {showIntro && (
        <div className="grid gap-3">
          <InfoRow icon={<Lightbulb className="size-5 text-xp" />} title="Intuition" text={f.intuition} />
          <InfoRow icon={<Target className="size-5 text-fin" />} title="Wirtschaftliche Bedeutung" text={f.interpretation} />
          {f.selectionHint && <InfoRow icon={<Compass className="size-5 text-rw" />} title="Wann diese Formel?" text={f.selectionHint} />}
        </div>
      )}
      {f.supplement && <p className="rounded-xl bg-paper-2 px-3 py-2 text-xs text-ink-3">Ergänzung der App (nicht aus den Unterlagen): {f.supplement}</p>}
    </div>
  )
}

function InfoRow({ icon, title, text }: { icon: ReactNode; title: string; text: string }) {
  return (
    <div className="flex gap-3 rounded-2xl bg-paper-2/60 p-3">
      <div className="mt-0.5 shrink-0" aria-hidden>
        {icon}
      </div>
      <div>
        <p className="font-semibold">{title}</p>
        <Rich as="p" text={text} className="text-ink-2" />
      </div>
    </div>
  )
}

export function ExampleCard({ formulaId }: { formulaId: string }) {
  const f = formulaById.get(formulaId)
  if (!f?.example) return null
  const ex = f.example
  return (
    <div className="space-y-4">
      <p className="text-sm font-semibold uppercase tracking-wide text-ink-3">Gerechnetes Beispiel · {f.name}</p>
      <Rich as="p" text={ex.problem} className="text-lg font-medium" />
      <ol className="space-y-2">
        {ex.steps.map((s, i) => (
          <li key={i} className="flex gap-3 rounded-2xl border border-line p-3">
            <span className="grid size-7 shrink-0 place-items-center rounded-full bg-paper-2 text-sm font-bold">{i + 1}</span>
            <Rich text={s} className="min-w-0 overflow-x-auto" />
          </li>
        ))}
      </ol>
      <p className="rounded-2xl bg-good-soft px-4 py-3 font-semibold text-good">
        <Rich text={`Ergebnis: ${ex.result}`} />
      </p>
    </div>
  )
}

export function MistakesCard({ formulaIds }: { formulaIds: string[] }) {
  const fs = formulaIds.map((id) => formulaById.get(id)).filter((f): f is Formula => !!f)
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <AlertTriangle className="size-6 text-bad" aria-hidden />
        <h2 className="text-2xl font-semibold">Häufige Fehler</h2>
      </div>
      {fs.map((f) => (
        <div key={f.id}>
          <p className="mb-2 font-semibold">{f.name}</p>
          <ul className="space-y-2">
            {f.mistakes.map((m, i) => (
              <li key={i} className="flex gap-2 rounded-xl bg-bad-soft/60 px-3 py-2 text-sm">
                <span aria-hidden>✗</span>
                <Rich text={m} />
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  )
}

export function IntroCard({ title, text, formulaIds }: { title: string; text: string; formulaIds: string[] }) {
  return (
    <div className="space-y-4 text-center">
      <div className="mx-auto grid size-16 place-items-center rounded-3xl bg-ink text-paper">
        <ListChecks className="size-8" aria-hidden />
      </div>
      <p className="text-sm font-semibold uppercase tracking-wide text-ink-3">Lernziel</p>
      <h2 className="text-3xl font-semibold">{title}</h2>
      <Rich as="p" text={text} className="text-lg text-ink-2" />
      <ul className="mx-auto max-w-md space-y-2 text-left">
        {formulaIds.map((id) => {
          const f = formulaById.get(id)
          return f ? (
            <li key={id} className="rounded-2xl border border-line px-4 py-2">
              {f.name}
            </li>
          ) : null
        })}
      </ul>
    </div>
  )
}
