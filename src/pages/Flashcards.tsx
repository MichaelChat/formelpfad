/**
 * Karteikarten – für kurze Lernpausen am Handy.
 * /karteikarten          Stapel wählen (Art, Bereich, Anzahl, Reihenfolge)
 * /karteikarten/los?…    Karten durchgehen: antippen = umdrehen, dann „Nochmal“ oder „Gewusst“
 *                        (auch per Wischen nach links/rechts oder Tasten 1/2, Leertaste)
 */
import { useCallback, useEffect, useMemo, useRef, useState, type PointerEvent as ReactPointerEvent } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router'
import { ArrowLeftRight, Check, FileText, Layers, Lightbulb, MessageCircleQuestion, RotateCcw, Sigma, Sparkles, X } from 'lucide-react'
import { scopeOf, type SubjectScope } from '../content'
import { PARTS } from '../content/types'
import { sourceLabel } from '../content/sources'
import { allCards, buildDeck, cardChapterLabel, type FlashKind, type Flashcard, type FlashSide } from '../lib/flashcards'
import { recordFlashcard } from '../lib/progress'
import { useStore } from '../state/store'
import { Button, ButtonLink, Card, Empty, PageHeader, Progress } from '../ui/kit'
import { Rich, TeX } from '../ui/Math'

const KIND_INFO: Record<FlashKind, { label: string; icon: typeof Sigma; tone: string }> = {
  formel: { label: 'Formeln', icon: Sigma, tone: 'bg-fin-soft text-ink' },
  wissen: { label: 'Wissen', icon: Lightbulb, tone: 'bg-xp-soft text-ink' },
  frage: { label: 'Fragen', icon: MessageCircleQuestion, tone: 'bg-rw-soft text-ink' },
}

interface Setup {
  kinds: FlashKind[]
  bereich: string // 'alle' | PartId | chapterId
  size: number // 0 = alle
  order: 'faellig' | 'zufall'
  reverse: boolean
}

const DEFAULT_SETUP: Setup = { kinds: ['formel', 'wissen'], bereich: 'alle', size: 10, order: 'faellig', reverse: false }
const SETUP_KEY = 'formelpfad:karteikarten:auswahl'

function loadSetup(): Setup {
  try {
    const raw = localStorage.getItem(SETUP_KEY)
    if (raw) return { ...DEFAULT_SETUP, ...(JSON.parse(raw) as Partial<Setup>) }
  } catch {
    /* ohne Speicher: Standard */
  }
  return DEFAULT_SETUP
}

/**
 * Kapitel eines Bereichs, immer innerhalb des aktiven Fachs. Ein gespeicherter Bereich aus
 * einem anderen Fach fällt auf das ganze aktive Fach zurück. Nie leer (leer hieße „alles“).
 */
function chapterIdsFor(bereich: string, scope: SubjectScope): string[] {
  const all = scope.chapters.map((c) => c.id)
  let ids = all
  if ((scope.parts as string[]).includes(bereich)) ids = scope.chapters.filter((c) => c.part === bereich).map((c) => c.id)
  else if (scope.chapterIds.has(bereich)) ids = [bereich]
  return ids.length ? ids : ['__kein-kapitel__']
}

function toQuery(s: Setup): string {
  const p = new URLSearchParams({ art: s.kinds.join(','), bereich: s.bereich, anzahl: String(s.size), reihenfolge: s.order })
  if (s.reverse) p.set('umgekehrt', '1')
  return p.toString()
}

function fromQuery(p: URLSearchParams): Setup {
  const kinds = (p.get('art') ?? '').split(',').filter((k): k is FlashKind => k === 'formel' || k === 'wissen' || k === 'frage')
  const size = Number(p.get('anzahl'))
  return {
    kinds: kinds.length ? kinds : DEFAULT_SETUP.kinds,
    bereich: p.get('bereich') ?? (p.get('kapitel') || 'alle'),
    size: Number.isFinite(size) && size >= 0 ? size : 10,
    order: p.get('reihenfolge') === 'zufall' ? 'zufall' : 'faellig',
    reverse: p.get('umgekehrt') === '1',
  }
}

// ======================================================================== Auswahl

export default function FlashcardsSetup() {
  const navigate = useNavigate()
  const { state } = useStore()
  const scope = scopeOf(state)
  const [setup, setSetup] = useState<Setup>(loadSetup)
  const available = useMemo(() => allCards({ kinds: setup.kinds, chapterIds: chapterIdsFor(setup.bereich, scope) }).length, [setup.kinds, setup.bereich, scope])
  const counts = useMemo(() => Object.fromEntries((['formel', 'wissen', 'frage'] as FlashKind[]).map((k) => [k, allCards({ kinds: [k], chapterIds: chapterIdsFor(setup.bereich, scope) }).length])), [setup.bereich, scope])

  const set = (patch: Partial<Setup>) => setSetup((s) => ({ ...s, ...patch }))
  const toggleKind = (k: FlashKind) => set({ kinds: setup.kinds.includes(k) ? setup.kinds.filter((x) => x !== k) : [...setup.kinds, k] })

  const start = (s: Setup) => {
    try {
      localStorage.setItem(SETUP_KEY, JSON.stringify(s))
    } catch {
      /* egal */
    }
    navigate(`/karteikarten/los?${toQuery(s)}`)
  }

  return (
    <div className="space-y-5">
      <PageHeader title="Karteikarten" subtitle="Kurz Zeit? Karte antippen, umdrehen, ehrlich einschätzen – fertig." />

      <Card className="flex flex-wrap items-center gap-4 p-5">
        <div className="grid size-12 shrink-0 place-items-center rounded-2xl bg-ink text-paper">
          <Sparkles className="size-6" aria-hidden />
        </div>
        <div className="min-w-0 flex-1 basis-48">
          <p className="font-semibold">Schnellrunde</p>
          <p className="text-sm text-ink-2">10 Karten aus Formeln und Wissen, fällige Themen zuerst.</p>
        </div>
        <Button onClick={() => start({ ...DEFAULT_SETUP })} className="w-full sm:w-auto">
          <Layers className="size-5" aria-hidden /> Los
        </Button>
      </Card>

      <Card className="space-y-5 p-5">
        <h2 className="text-xl font-semibold">Eigener Stapel</h2>

        <fieldset>
          <legend className="mb-2 text-sm font-semibold text-ink-2">Was möchtest du lernen?</legend>
          <div className="grid grid-cols-3 gap-2">
            {(['formel', 'wissen', 'frage'] as FlashKind[]).map((k) => {
              const { label, icon: Icon } = KIND_INFO[k]
              const on = setup.kinds.includes(k)
              return (
                <button key={k} type="button" aria-pressed={on} onClick={() => toggleKind(k)} className={`flex min-h-20 flex-col items-center justify-center gap-1 rounded-2xl border-2 px-2 text-sm font-semibold transition ${on ? 'border-ink bg-ink text-paper' : 'border-line text-ink-2 hover:border-ink-3'}`}>
                  <Icon className="size-5" aria-hidden />
                  {label}
                  <span className={`text-xs font-normal ${on ? 'text-paper/80' : 'text-ink-3'}`}>{counts[k]} Karten</span>
                </button>
              )
            })}
          </div>
        </fieldset>

        <label className="block">
          <span className="mb-2 block text-sm font-semibold text-ink-2">Bereich</span>
          <select value={setup.bereich === 'alle' || (scope.parts as string[]).includes(setup.bereich) || scope.chapterIds.has(setup.bereich) ? setup.bereich : 'alle'} onChange={(e) => set({ bereich: e.target.value })} className="min-h-12 w-full rounded-xl border-2 border-line bg-paper px-3">
            <option value="alle">Ganz {scope.subject.short}</option>
            {scope.parts.map((p) => (
              <optgroup key={p} label={PARTS[p].title}>
                <option value={p}>Ganz {PARTS[p].title}</option>
                {scope.chapters
                  .filter((c) => c.part === p)
                  .map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.number} · {c.title}
                    </option>
                  ))}
              </optgroup>
            ))}
          </select>
        </label>

        <fieldset>
          <legend className="mb-2 text-sm font-semibold text-ink-2">Anzahl</legend>
          <div className="grid grid-cols-4 gap-2">
            {[10, 20, 50, 0].map((n) => (
              <button key={n} type="button" aria-pressed={setup.size === n} onClick={() => set({ size: n })} className={`min-h-11 rounded-xl border-2 text-sm font-semibold ${setup.size === n ? 'border-ink bg-ink text-paper' : 'border-line'}`}>
                {n === 0 ? 'Alle' : n}
              </button>
            ))}
          </div>
        </fieldset>

        <fieldset>
          <legend className="mb-2 text-sm font-semibold text-ink-2">Reihenfolge</legend>
          <div className="grid grid-cols-2 gap-2">
            {(
              [
                ['faellig', 'Fällige zuerst'],
                ['zufall', 'Zufällig'],
              ] as const
            ).map(([v, l]) => (
              <button key={v} type="button" aria-pressed={setup.order === v} onClick={() => set({ order: v })} className={`min-h-11 rounded-xl border-2 text-sm font-semibold ${setup.order === v ? 'border-ink bg-ink text-paper' : 'border-line'}`}>
                {l}
              </button>
            ))}
          </div>
        </fieldset>

        {setup.kinds.includes('formel') && (
          <label className="flex min-h-11 items-center gap-3 text-sm">
            <input type="checkbox" checked={setup.reverse} onChange={(e) => set({ reverse: e.target.checked })} className="size-5 accent-[var(--color-ink)]" />
            <span>
              <ArrowLeftRight className="mr-1 inline size-4" aria-hidden />
              Formeln umgekehrt abfragen (Formel sehen → Name und Bedeutung nennen)
            </span>
          </label>
        )}

        <Button size="lg" className="w-full" disabled={!setup.kinds.length || available === 0} onClick={() => start(setup)}>
          <Layers className="size-5" aria-hidden />
          {setup.kinds.length === 0 ? 'Bitte eine Art wählen' : `${setup.size === 0 ? available : Math.min(setup.size, available)} Karten lernen`}
        </Button>
      </Card>

      <p className="text-center text-xs text-ink-3">
        Deine Einschätzung fließt in die Wiederholungsplanung ein: „Gewusst“ verschiebt das Thema nach hinten, „Nochmal“ holt es morgen zurück.
      </p>
    </div>
  )
}

// ======================================================================== Durchgehen

function Face({ side, card, back }: { side: FlashSide; card: Flashcard; back: boolean }) {
  const info = KIND_INFO[card.kind]
  const Icon = info.icon
  return (
    <div className="flex min-h-[22rem] flex-col gap-3 rounded-3xl border-2 border-line bg-paper p-5 shadow-[var(--shadow-lift)] sm:p-7">
      <div className="flex items-center justify-between gap-2">
        <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${info.tone}`}>
          <Icon className="size-3.5" aria-hidden /> {side.label}
        </span>
        <span className="min-w-0 truncate text-xs text-ink-3">{cardChapterLabel(card)}</span>
      </div>
      <div className="flex min-w-0 flex-1 flex-col justify-center gap-3 break-words">
        {side.title && <p className={`font-semibold ${back ? 'text-2xl' : 'text-2xl sm:text-3xl'}`}>{side.title}</p>}
        {side.tex && <TeX tex={side.tex} className="max-w-full overflow-x-auto text-lg" label={side.title ?? side.label} />}
        {side.text && <Rich as="p" text={side.text} className={`whitespace-pre-line ${side.title || side.tex ? 'text-ink-2' : 'text-lg'}`} />}
        {side.list && (
          <ul className="space-y-1.5">
            {side.list.map((l, i) => (
              <li key={i} className={`flex gap-2 ${back ? '' : 'rounded-xl border border-line px-3 py-2'}`}>
                {back ? <span className="mt-2 size-1.5 shrink-0 rounded-full bg-ink-3" aria-hidden /> : <span className="shrink-0 font-semibold text-ink-3">{String.fromCharCode(65 + i)}</span>}
                <Rich text={l} className="min-w-0" />
              </li>
            ))}
          </ul>
        )}
        {side.pairs && (
          <dl className="space-y-2">
            {side.pairs.map(([l, r], i) => (
              <div key={i} className="rounded-xl bg-paper-2/70 px-3 py-2">
                <dt className="text-sm text-ink-3">
                  <Rich text={l} />
                </dt>
                <dd className="font-semibold">
                  <Rich text={r} />
                </dd>
              </div>
            ))}
          </dl>
        )}
      </div>
      {back && card.sources?.[0] && (
        <p className="flex items-start gap-1.5 text-xs text-ink-3">
          <FileText className="mt-0.5 size-3.5 shrink-0" aria-hidden />
          <span>
            {sourceLabel(card.sources[0].doc)}, S. {card.sources[0].pages}
          </span>
        </p>
      )}
      {!back && <p className="text-center text-sm text-ink-3">Antippen zum Umdrehen</p>}
    </div>
  )
}

const SWIPE = 90

export function FlashcardsPlay() {
  const [round, setRound] = useState(0)
  const [params] = useSearchParams()
  return <Player key={`${params.toString()}#${round}`} onRestart={() => setRound((r) => r + 1)} />
}

function Player({ onRestart }: { onRestart: () => void }) {
  const [params] = useSearchParams()
  const { state, apply } = useStore()
  const navigate = useNavigate()
  const setup = useMemo(() => fromQuery(params), [params])
  const [deck] = useState<Flashcard[]>(() => {
    const ids = chapterIdsFor(setup.bereich, scopeOf(state))
    return buildDeck(state, { kinds: setup.kinds, chapterIds: ids, reverse: setup.reverse, order: setup.order, ...(setup.size ? { size: setup.size } : {}) })
  })
  const [queue, setQueue] = useState<Flashcard[]>(deck)
  const [index, setIndex] = useState(0)
  const [flipped, setFlipped] = useState(false)
  const [rated, setRated] = useState<Record<string, boolean>>({})
  const [xp, setXp] = useState(0)
  const requeued = useRef<Record<string, number>>({})
  const shownAt = useRef(Date.now())
  const [drag, setDrag] = useState(0)
  const dragStart = useRef<{ x: number; y: number; moved: boolean } | null>(null)

  const card = queue[index]
  const done = index >= queue.length

  const rate = useCallback(
    (knew: boolean) => {
      if (!card) return
      if (rated[card.id] === undefined) {
        const ms = Date.now() - shownAt.current
        const gained = apply((s) => {
          const r = recordFlashcard(s, { key: card.id, formulaIds: card.formulaIds, formulaDifficulty: Object.fromEntries(card.formulaIds.map((id) => [id, card.difficulty])), knew, ms })
          return { state: r.state, xp: r.xp }
        }).xp
        setXp((x) => x + gained)
        setRated((r) => ({ ...r, [card.id]: knew }))
      }
      // „Nochmal“: Karte ein paar Plätze später erneut zeigen (höchstens zweimal pro Runde)
      if (!knew && (requeued.current[card.id] ?? 0) < 2) {
        requeued.current[card.id] = (requeued.current[card.id] ?? 0) + 1
        setQueue((q) => {
          const at = Math.min(q.length, index + 4)
          return [...q.slice(0, at), card, ...q.slice(at)]
        })
      }
      setFlipped(false)
      setDrag(0)
      setIndex((i) => i + 1)
      shownAt.current = Date.now()
    },
    [card, rated, apply, index],
  )

  // Tastatur: Leertaste/Enter = umdrehen, 1/← = Nochmal, 2/→ = Gewusst
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const t = e.target instanceof Element ? e.target : null
      if (done || t?.closest('input, select, textarea') || (t?.closest('button, a') && !t.closest('[data-flip]'))) return
      if (e.key === ' ' || e.key === 'Enter') {
        e.preventDefault()
        setFlipped((f) => !f)
      } else if (flipped && (e.key === '1' || e.key === 'ArrowLeft')) rate(false)
      else if (flipped && (e.key === '2' || e.key === 'ArrowRight')) rate(true)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [flipped, rate, done])

  if (!deck.length)
    return <Empty title="Keine Karten für diese Auswahl" text="Wähle eine andere Art oder einen anderen Bereich." action={<ButtonLink to="/karteikarten">Zur Auswahl</ButtonLink>} />

  if (done) {
    const ids = Object.keys(rated)
    const knew = ids.filter((id) => rated[id]).length
    const again = deck.filter((c) => rated[c.id] === false)
    return (
      <div className="mx-auto max-w-xl space-y-5 py-4 text-center">
        <div className="mx-auto grid size-20 place-items-center rounded-full bg-good-soft">
          <Check className="size-10 text-good" aria-hidden />
        </div>
        <h1 className="text-3xl font-semibold">Runde geschafft</h1>
        <p className="text-lg text-ink-2">
          {knew} von {ids.length} Karten gewusst{xp > 0 ? ` · +${xp} XP` : ''}
        </p>
        {again.length > 0 && (
          <Card className="p-4 text-left">
            <p className="mb-2 font-semibold">Noch nicht sicher</p>
            <ul className="space-y-1 text-sm text-ink-2">
              {again.slice(0, 8).map((c) => (
                <li key={c.id} className="truncate">
                  • <Rich text={c.front.title ?? c.front.text ?? c.front.label} />
                </li>
              ))}
              {again.length > 8 && <li className="text-ink-3">… und {again.length - 8} weitere</li>}
            </ul>
            <p className="mt-2 text-xs text-ink-3">Diese Themen kommen morgen in der Wiederholung wieder.</p>
          </Card>
        )}
        <div className="flex flex-col gap-2 sm:flex-row sm:justify-center">
          <Button size="lg" onClick={onRestart}>
            <RotateCcw className="size-5" aria-hidden /> Neue Runde
          </Button>
          <ButtonLink to="/karteikarten" variant="secondary" size="lg">
            Andere Auswahl
          </ButtonLink>
        </div>
        <Link to="/" className="inline-block text-sm text-ink-3 underline">
          Zur Startseite
        </Link>
      </div>
    )
  }

  const onPointerDown = (e: ReactPointerEvent) => {
    dragStart.current = { x: e.clientX, y: e.clientY, moved: false }
  }
  const onPointerMove = (e: ReactPointerEvent) => {
    const d = dragStart.current
    if (!d || !flipped) return
    const dx = e.clientX - d.x
    if (Math.abs(dx) > 10 && Math.abs(dx) > Math.abs(e.clientY - d.y)) {
      d.moved = true
      setDrag(dx)
    }
  }
  const onPointerUp = () => {
    const d = dragStart.current
    dragStart.current = null
    if (d?.moved) {
      if (drag <= -SWIPE) rate(false)
      else if (drag >= SWIPE) rate(true)
      else setDrag(0)
      return
    }
    setFlipped((f) => !f)
  }

  const total = queue.length
  return (
    <div className="mx-auto flex min-h-[calc(100dvh-2rem)] max-w-xl flex-col gap-4 pb-4">
      <div className="flex items-center gap-3">
        <button onClick={() => navigate('/karteikarten')} className="grid size-11 shrink-0 place-items-center rounded-full hover:bg-paper-2" aria-label="Karteikarten beenden">
          <X className="size-6" aria-hidden />
        </button>
        <Progress value={index / total} label="Fortschritt der Runde" />
        <span className="shrink-0 text-sm tabular-nums text-ink-3">
          {index + 1}/{total}
        </span>
      </div>

      <div
        className={`flip relative flex-1 touch-pan-y select-none ${flipped ? 'is-flipped' : ''}`}
        style={drag ? { transform: `translateX(${drag}px) rotate(${drag / 25}deg)`, transition: 'none' } : undefined}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={() => {
          dragStart.current = null
          setDrag(0)
        }}
      >
        <button type="button" data-flip className="absolute inset-0 z-10 rounded-3xl focus-visible:outline-4" aria-label={flipped ? 'Karte zurückdrehen' : 'Karte umdrehen'} onClick={(e) => e.preventDefault()} />
        <div className="flip-inner">
          <div className="flip-face" aria-hidden={flipped}>
            <Face side={card!.front} card={card!} back={false} />
          </div>
          <div className="flip-face flip-back" aria-hidden={!flipped} role="region" aria-label="Rückseite">
            <Face side={card!.back} card={card!} back />
          </div>
        </div>
        {drag !== 0 && (
          <span className={`pointer-events-none absolute top-5 z-20 rounded-full px-3 py-1 text-sm font-bold text-white ${drag < 0 ? 'right-5 bg-bad' : 'left-5 bg-good'}`} style={{ opacity: Math.min(1, Math.abs(drag) / SWIPE) }}>
            {drag < 0 ? 'Nochmal' : 'Gewusst'}
          </span>
        )}
      </div>

      {flipped ? (
        <div className="grid grid-cols-2 gap-3">
          <Button variant="bad" size="lg" onClick={() => rate(false)}>
            <RotateCcw className="size-5" aria-hidden /> Nochmal
          </Button>
          <Button variant="good" size="lg" onClick={() => rate(true)}>
            <Check className="size-5" aria-hidden /> Gewusst
          </Button>
        </div>
      ) : (
        <Button variant="secondary" size="lg" onClick={() => setFlipped(true)}>
          Antwort zeigen
        </Button>
      )}
      <p className="hidden text-center text-xs text-ink-3 md:block">Leertaste: umdrehen · 1 / ←: Nochmal · 2 / →: Gewusst</p>
      {flipped && <p className="text-center text-xs text-ink-3 md:hidden">Tipp: nach links wischen = Nochmal, nach rechts = Gewusst</p>}
    </div>
  )
}
