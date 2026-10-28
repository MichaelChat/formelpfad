import type { ReactNode } from 'react'
import { useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router'
import { ArrowLeft, Ban, CheckCircle2, Heart, History, Play, Search } from 'lucide-react'
import { chapterById, chapters, exams, exerciseById, formulaById, formulas } from '../content'
import { PARTS, SKILL_LABELS, type Formula, type PartId } from '../content/types'
import { availableSkills, formulaMastery } from '../lib/engine'
import { relevance } from '../lib/exam'
import { MASTERY_LABELS, type MasteryLevel } from '../lib/mastery'
import { formatDayLong, localDay, daysBetween } from '../lib/dates'
import { toggleFavorite } from '../lib/progress'
import { useStore } from '../state/store'
import { ExampleCard, VariableTable } from '../ui/cards'
import { Button, Card, Empty, MasteryBadge, PageHeader, PartBadge, Progress, Sources, StatusBadge, partTone } from '../ui/kit'
import { Rich, TeX } from '../ui/Math'

function norm(s: string) {
  return s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[\\{}_^]/g, ' ')
}

function searchText(f: Formula): string {
  return norm([f.name, ...(f.aliases ?? []), f.short ?? '', f.tex, f.intuition, f.interpretation, ...f.useCases, ...f.variables.flatMap((v) => [v.sym, v.tex, v.name])].join(' '))
}

const index = new Map(formulas.map((f) => [f.id, searchText(f)]))

export default function Formulas() {
  const { state } = useStore()
  const [q, setQ] = useState('')
  const [chapter, setChapter] = useState('alle')
  const [level, setLevel] = useState<MasteryLevel | 'alle'>('alle')
  const [view, setView] = useState<'alle' | 'favoriten' | 'zuletzt'>('alle')

  const results = useMemo(() => {
    const terms = norm(q).split(/\s+/).filter(Boolean)
    let list = formulas.filter((f) => terms.every((t) => index.get(f.id)!.includes(t)))
    if (chapter !== 'alle') list = list.filter((f) => f.chapterId === chapter)
    if (level !== 'alle') list = list.filter((f) => formulaMastery(state, f.id).level === level)
    if (view === 'favoriten') list = list.filter((f) => state.favorites.includes(f.id))
    if (view === 'zuletzt') list = list.filter((f) => state.formula[f.id]?.lastAt).sort((a, b) => (state.formula[b.id]!.lastAt! > state.formula[a.id]!.lastAt! ? 1 : -1))
    return list
  }, [q, chapter, level, view, state])

  return (
    <div>
      <PageHeader title="Formelsammlung" subtitle={`${formulas.length} Formeln und Konzepte mit Erklärung, Beispiel und Fundstelle`} />
      <div className="mb-4 space-y-3">
        <label className="flex items-center gap-2 rounded-2xl border-2 border-line bg-paper px-3 focus-within:border-ink-3">
          <Search className="size-5 text-ink-3" aria-hidden />
          <span className="sr-only">Formeln durchsuchen</span>
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Suche nach Name, Symbol (z. B. beta, C_T) oder Begriff" className="min-h-12 w-full bg-transparent outline-none" type="search" />
        </label>
        <div className="flex flex-wrap gap-2">
          <select aria-label="Kapitel filtern" value={chapter} onChange={(e) => setChapter(e.target.value)} className="min-h-10 rounded-xl border-2 border-line bg-paper px-3 text-sm">
            <option value="alle">Alle Kapitel</option>
            {chapters.map((c) => (
              <option key={c.id} value={c.id}>
                {c.number} · {c.title}
              </option>
            ))}
          </select>
          <select aria-label="Kompetenzstatus filtern" value={level} onChange={(e) => setLevel(e.target.value as MasteryLevel | 'alle')} className="min-h-10 rounded-xl border-2 border-line bg-paper px-3 text-sm">
            <option value="alle">Jeder Status</option>
            {(Object.keys(MASTERY_LABELS) as MasteryLevel[]).map((l) => (
              <option key={l} value={l}>
                {MASTERY_LABELS[l]}
              </option>
            ))}
          </select>
          {(['alle', 'favoriten', 'zuletzt'] as const).map((v) => (
            <button key={v} onClick={() => setView(v)} aria-pressed={view === v} className={`min-h-10 rounded-full border-2 px-4 text-sm font-semibold ${view === v ? 'border-ink bg-ink text-paper' : 'border-line'}`}>
              {v === 'alle' ? 'Alle' : v === 'favoriten' ? 'Favoriten' : 'Zuletzt geübt'}
            </button>
          ))}
        </div>
      </div>

      {results.length === 0 ? (
        <Empty title="Keine Treffer" text={view === 'favoriten' ? 'Markiere Formeln mit dem Herz, um sie hier zu sammeln.' : view === 'zuletzt' ? 'Du hast noch keine Formeln geübt.' : 'Versuche einen anderen Suchbegriff.'} />
      ) : (
        <ul className="grid gap-3 md:grid-cols-2">
          {results.map((f) => {
            const ch = chapterById.get(f.chapterId)!
            const m = formulaMastery(state, f.id)
            return (
              <li key={f.id}>
                <Link to={`/formeln/${encodeURIComponent(f.id)}`} className="group block h-full">
                  <Card className={`flex h-full flex-col gap-2 border-l-4 p-4 transition group-hover:shadow-[var(--shadow-lift)] ${partTone[ch.part].border}`}>
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="text-xs font-semibold text-ink-3">
                          {ch.number} · {ch.title}
                        </p>
                        <p className="font-semibold">{f.name}</p>
                      </div>
                      <div className="flex shrink-0 items-center gap-1">
                        {state.favorites.includes(f.id) && <Heart className="size-4 fill-bad text-bad" aria-label="Favorit" />}
                        <MasteryBadge level={m.level} />
                      </div>
                    </div>
                    <TeX tex={f.tex} className="pointer-events-none text-sm" label={f.name} />
                  </Card>
                </Link>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}

const relevanceMap = relevance(exams)

export function FormulaDetail() {
  const { id = '' } = useParams()
  const navigate = useNavigate()
  const { state, update } = useStore()
  const f = formulaById.get(decodeURIComponent(id))
  if (!f) return <Empty title="Formel nicht gefunden" text="Diese Formel gibt es nicht." />
  const ch = chapterById.get(f.chapterId)!
  const fp = state.formula[f.id]
  const m = formulaMastery(state, f.id)
  const skills = availableSkills(f.id)
  const fav = state.favorites.includes(f.id)
  const rel = relevanceMap.get(f.id)
  const today = localDay()
  const part: PartId = ch.part

  return (
    <article className="mx-auto max-w-3xl space-y-5">
      <button onClick={() => navigate(-1)} className="inline-flex min-h-10 items-center gap-2 rounded-xl px-2 text-ink-2 hover:bg-paper-2">
        <ArrowLeft className="size-5" aria-hidden /> Zurück
      </button>

      {/* 1. Name + 2. Ausdruck */}
      <header className="space-y-3">
        <div className="flex flex-wrap items-center gap-2">
          <PartBadge part={part} />
          <span className="text-sm font-semibold text-ink-2">
            {ch.number} · {ch.title}
          </span>
          <StatusBadge status={f.status} />
        </div>
        <div className="flex items-start justify-between gap-3">
          <h1 className="text-3xl font-semibold">{f.name}</h1>
          <button onClick={() => update((s) => toggleFavorite(s, f.id))} aria-pressed={fav} aria-label={fav ? 'Aus Favoriten entfernen' : 'Zu Favoriten hinzufügen'} className="grid size-11 shrink-0 place-items-center rounded-xl border-2 border-line hover:border-ink-3">
            <Heart className={`size-5 ${fav ? 'fill-bad text-bad' : ''}`} />
          </button>
        </div>
        {f.aliases && <p className="text-sm text-ink-3">Auch: {f.aliases.join(', ')}</p>}
        <Card className="p-4">
          <TeX tex={f.tex} className="text-xl" label={f.name} />
        </Card>
        {f.statusNote && <p className="rounded-xl bg-paper-2 px-3 py-2 text-sm text-ink-2">Hinweis zur Quelle: {f.statusNote}</p>}
      </header>

      {/* 3. Variablen */}
      {f.variables.length > 0 && (
        <Section title="Variablen">
          <VariableTable formula={f} />
        </Section>
      )}

      {/* 4. Voraussetzungen */}
      {f.assumptions.length > 0 && (
        <Section title="Voraussetzungen und Annahmen">
          <ul className="list-disc space-y-1 pl-5 text-ink-2">
            {f.assumptions.map((a, i) => (
              <li key={i}>
                <Rich text={a} />
              </li>
            ))}
          </ul>
        </Section>
      )}

      {/* 5. Intuition */}
      <Section title="Intuitive Bedeutung">
        <Rich as="p" text={f.intuition} className="text-ink-2" />
        <Rich as="p" text={f.interpretation} className="mt-2 text-ink-2" />
      </Section>

      {/* 6. Wann anwenden / 7. Wann nicht */}
      <div className="grid gap-4 sm:grid-cols-2">
        <Section title="Wann anwenden?" icon={<CheckCircle2 className="size-5 text-good" />}>
          <ul className="space-y-1 text-ink-2">
            {f.useCases.map((u, i) => (
              <li key={i}>
                <Rich text={u} />
              </li>
            ))}
            {f.selectionHint && <Rich as="li" text={f.selectionHint} className="font-medium text-ink" />}
          </ul>
        </Section>
        <Section title="Wann nicht?" icon={<Ban className="size-5 text-bad" />}>
          {f.whenNot?.length ? (
            <ul className="space-y-1 text-ink-2">
              {f.whenNot.map((u, i) => (
                <li key={i}>
                  <Rich text={u} />
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-ink-3">Keine besonderen Einschränkungen über die Voraussetzungen hinaus.</p>
          )}
        </Section>
      </div>

      {f.rearranged && (
        <Section title="Umgestellte Varianten">
          <div className="space-y-2">
            {f.rearranged.map((r, i) => (
              <div key={i} className="rounded-2xl bg-paper-2/60 px-3">
                <TeX tex={r.tex} />
                {r.note && <p className="pb-2 text-sm text-ink-3">{r.note}</p>}
              </div>
            ))}
          </div>
        </Section>
      )}

      {/* 8. Beispiel */}
      {f.example && (
        <Card className="p-5">
          <ExampleCard formulaId={f.id} />
          {f.example.source && (
            <div className="mt-3">
              <Sources sources={[f.example.source]} />
            </div>
          )}
        </Card>
      )}

      {/* 9. Fehler */}
      <Section title="Häufige Fehler">
        <ul className="space-y-2">
          {f.mistakes.map((m2, i) => (
            <li key={i} className="rounded-xl bg-bad-soft/60 px-3 py-2 text-sm">
              <Rich text={m2} />
            </li>
          ))}
        </ul>
      </Section>

      {f.supplement && <p className="rounded-xl bg-paper-2 px-3 py-2 text-sm text-ink-3">Ergänzung der App (nicht wörtlich aus den Unterlagen): {f.supplement}</p>}

      {/* 10. Quellen */}
      <Section title="Quellen und Fundstellen">
        <Sources sources={f.sources} />
        {rel && (
          <p className="mt-2 text-sm text-ink-2">
            In der ausgewerteten Beispielklausur: {rel.tasks} Teilaufgabe{rel.tasks === 1 ? '' : 'n'}, rund {Math.round(rel.points * 10) / 10} Punkte.
          </p>
        )}
      </Section>

      {f.related && f.related.length > 0 && (
        <Section title="Verwandte Formeln">
          <ul className="flex flex-wrap gap-2">
            {f.related.map((r) => (
              <li key={r}>
                <Link to={`/formeln/${encodeURIComponent(r)}`} className="inline-block rounded-full bg-paper-2 px-3 py-1 text-sm hover:bg-line">
                  {formulaById.get(r)?.name ?? r}
                </Link>
              </li>
            ))}
          </ul>
        </Section>
      )}

      {/* 11. Lernstatus */}
      <Section title="Dein Lernstatus">
        <div className="mb-3 flex flex-wrap items-center gap-3">
          <MasteryBadge level={m.level} />
          {fp?.srs && <span className="text-sm text-ink-2">Nächste Wiederholung: {daysBetween(fp.srs.due, today) >= 0 ? 'heute fällig' : formatDayLong(fp.srs.due)}</span>}
          {fp && <span className="text-sm text-ink-3">{fp.correct}/{fp.attempts} richtig</span>}
        </div>
        <div className="grid gap-2">
          {skills.map((s) => (
            <div key={s} className="grid grid-cols-[minmax(0,12rem)_1fr_3rem] items-center gap-2 text-sm">
              <span className="truncate">{SKILL_LABELS[s]}</span>
              <Progress value={fp?.skills[s] ?? 0} tone={part} className="h-2" label={SKILL_LABELS[s]} />
              <span className="text-right text-ink-3">{Math.round((fp?.skills[s] ?? 0) * 100)}%</span>
            </div>
          ))}
        </div>
        {fp && fp.wrongLog.length > 0 && (
          <div className="mt-4">
            <p className="mb-2 flex items-center gap-2 text-sm font-semibold">
              <History className="size-4" aria-hidden /> Deine Fehlerhistorie
            </p>
            <ul className="space-y-1 text-sm text-ink-2">
              {[...fp.wrongLog].reverse().slice(0, 5).map((w, i) => {
                const ex = exerciseById.get(w.exId)
                return (
                  <li key={i} className="truncate">
                    {formatDayLong(w.at.slice(0, 10))}: {ex ? <Rich text={ex.prompt.slice(0, 90) + (ex.prompt.length > 90 ? '…' : '')} /> : 'generierte Übung'}
                  </li>
                )
              })}
            </ul>
          </div>
        )}
      </Section>

      {/* 12. Jetzt üben */}
      <div className="sticky bottom-20 z-10 md:bottom-4">
        <Button size="lg" className="w-full" onClick={() => navigate(`/ueben/${encodeURIComponent(f.id)}`)}>
          <Play className="size-5" aria-hidden /> Jetzt üben
        </Button>
      </div>
      <p className="text-center text-xs text-ink-3">{PARTS[part].title} · {PARTS[part].lecturer}</p>
    </article>
  )
}

function Section({ title, children, icon }: { title: string; children: ReactNode; icon?: ReactNode }) {
  return (
    <Card as="section" className="p-5">
      <h2 className="mb-3 flex items-center gap-2 text-xl font-semibold">
        {icon}
        {title}
      </h2>
      {children}
    </Card>
  )
}
