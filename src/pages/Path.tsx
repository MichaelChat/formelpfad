import { useState } from 'react'
import { useNavigate } from 'react-router'
import { Check, Crown, Lightbulb, Lock, Play, Star, Timer } from 'lucide-react'
import { chapters, lessons } from '../content'
import { PARTS, type PartId } from '../content/types'
import { bossUnlocked, chapterProgress, lessonStatus, nextLesson } from '../lib/engine'
import { useStore } from '../state/store'
import { Button, Card, PageHeader, PartBadge, Progress, partTone } from '../ui/kit'

const OFFSETS = [0, 52, 78, 52, 0, -52, -78, -52]

export default function Path() {
  const { state, update } = useStore()
  const navigate = useNavigate()
  const next = nextLesson(state)
  const [locked, setLocked] = useState<{ id: string; title: string; prev: string } | null>(null)
  const [part, setPart] = useState<PartId | 'all'>('all')

  const shown = chapters.filter((c) => part === 'all' || c.part === part)

  return (
    <div>
      <PageHeader title="Lernpfad" subtitle="Kurze Lektionen, aufgebaut aus den Vorlesungskapiteln. Am Ende jedes Kapitels wartet eine Boss-Challenge." />
      <div className="mb-6 flex flex-wrap gap-2" role="tablist" aria-label="Teil auswählen">
        {(['all', 'fin', 'rw', 'jb'] as const).map((p) => (
          <button key={p} role="tab" aria-selected={part === p} onClick={() => setPart(p)} className={`min-h-10 rounded-full border-2 px-4 text-sm font-semibold ${part === p ? 'border-ink bg-ink text-paper' : 'border-line hover:border-ink-3'}`}>
            {p === 'all' ? 'Alle' : PARTS[p].title}
          </button>
        ))}
      </div>

      <div className="space-y-10">
        {shown.map((c) => {
          const cp = chapterProgress(state, c)
          const tone = partTone[c.part]
          const unlocked = bossUnlocked(state, c)
          return (
            <section key={c.id} aria-labelledby={`h-${c.id}`}>
              <Card className={`mb-6 p-5 ${tone.soft}`}>
                <div className="flex flex-wrap items-center gap-2">
                  <PartBadge part={c.part} />
                  <span className="text-sm font-bold text-ink-2">{c.number}</span>
                </div>
                <h2 id={`h-${c.id}`} className="mt-1 text-2xl font-semibold">
                  {c.title}
                </h2>
                <p className="text-ink-2">{c.description}</p>
                <div className="mt-3 flex items-center gap-3">
                  <Progress value={cp.done / cp.total} tone={c.part} label={`Fortschritt ${c.title}`} />
                  <span className="shrink-0 text-sm font-semibold">
                    {cp.done}/{cp.total}
                  </span>
                </div>
                {cp.formulas > 0 && <p className="mt-1 text-xs text-ink-3">{cp.mastered} von {cp.formulas} Themen beherrscht</p>}
              </Card>

              <ol className="flex flex-col items-center gap-5">
                {lessons
                  .filter((l) => l.chapterId === c.id)
                  .map((l, i) => {
                    const st = lessonStatus(state, l)
                    const isNext = next?.id === l.id
                    const offset = OFFSETS[i % OFFSETS.length]!
                    const prev = i > 0 ? c.lessons[i - 1]! : null
                    return (
                      <li key={l.id} style={{ transform: `translateX(${offset}px)` }} className="flex flex-col items-center">
                        <button
                          onClick={() => (st === 'gesperrt' && prev ? setLocked({ id: l.id, title: l.title, prev: prev.title }) : navigate(`/lektion/${l.id}`))}
                          aria-label={`${l.title}${l.knowledge ? ' (Wissen)' : ''} – ${st}${isNext ? ', empfohlen' : ''}`}
                          className={`relative grid size-[4.5rem] place-items-center rounded-full border-b-[6px] text-white transition active:translate-y-1 active:border-b-2 ${
                            st === 'abgeschlossen' ? `${tone.bg} border-black/25` : st === 'verfügbar' ? `${tone.bg} border-black/25 ${isNext ? 'ring-4 ring-xp ring-offset-4 ring-offset-paper' : ''}` : 'border-line bg-paper-2 text-ink-3'
                          }`}
                        >
                          {st === 'abgeschlossen' ? <Check className="size-8" strokeWidth={3} /> : st === 'gesperrt' ? <Lock className="size-7" /> : isNext ? <Play className="size-8 fill-white" /> : <Star className="size-8" />}
                          {state.lessons[l.id] && state.lessons[l.id]!.best >= 0.9 && <span className="absolute -right-1 -top-1 grid size-6 place-items-center rounded-full bg-xp text-[11px] font-bold text-ink">★</span>}
                          {l.knowledge && (
                            <span className="absolute -bottom-1 -left-1 grid size-7 place-items-center rounded-full border-2 border-paper bg-xp text-ink" title="Wissens-Lektion">
                              <Lightbulb className="size-4" aria-hidden />
                            </span>
                          )}
                        </button>
                        <span className="mt-2 max-w-40 text-center text-sm font-semibold">{l.title}</span>
                        {l.knowledge && <span className="text-[11px] font-semibold uppercase tracking-wide text-ink-3">Wissen</span>}
                        {isNext && <span className="text-xs font-bold uppercase tracking-wide text-xp">Als Nächstes</span>}
                      </li>
                    )
                  })}
                <li className="mt-2 flex flex-col items-center">
                  <div className={`grid size-20 place-items-center rounded-3xl border-b-[6px] ${unlocked ? 'border-black/25 bg-xp text-ink' : 'border-line bg-paper-2 text-ink-3'}`}>
                    <Crown className="size-9" aria-hidden />
                  </div>
                  <span className="mt-2 text-sm font-semibold">Boss-Challenge {c.number}</span>
                  {state.bosses[c.id]?.passed ? (
                    <span className="text-xs font-bold text-good">Bestanden · bestes Ergebnis {Math.round(state.bosses[c.id]!.best * 100)} %</span>
                  ) : (
                    <span className="max-w-60 text-center text-xs text-ink-3">{unlocked ? 'Kombiniert Theorie, Rechnen und Methodenwahl. Bestehen ab 70 %.' : 'Wird freigeschaltet, wenn alle Lektionen des Kapitels abgeschlossen sind.'}</span>
                  )}
                  {unlocked && (
                    <div className="mt-3 flex gap-2">
                      <Button size="sm" onClick={() => navigate(`/boss/${c.id}`)}>
                        Starten
                      </Button>
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => {
                          update((s) => ({ ...s, settings: { ...s.settings, bossTimer: true } }))
                          navigate(`/boss/${c.id}?timer=1`)
                        }}
                      >
                        <Timer className="size-4" aria-hidden /> Mit Zeitlimit
                      </Button>
                    </div>
                  )}
                </li>
              </ol>
            </section>
          )
        })}
      </div>

      {locked && (
        <div role="dialog" aria-modal="true" aria-labelledby="locked-title" className="fixed inset-0 z-40 grid place-items-end bg-black/40 p-4 sm:place-items-center" onClick={() => setLocked(null)}>
          <Card className="anim-pop w-full max-w-md p-6">
            <div onClick={(e) => e.stopPropagation()}>
              <h2 id="locked-title" className="text-2xl font-semibold">
                {locked.title}
              </h2>
              <p className="mt-2 text-ink-2">Diese Lektion baut auf „{locked.prev}“ auf. Empfohlen ist, die vorherige Lektion zuerst abzuschließen.</p>
              <div className="mt-5 flex gap-3">
                <Button variant="secondary" className="flex-1" onClick={() => setLocked(null)}>
                  Abbrechen
                </Button>
                <Button className="flex-1" onClick={() => navigate(`/lektion/${locked.id}`)}>
                  Trotzdem starten
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  )
}
