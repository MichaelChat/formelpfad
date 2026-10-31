import { useMemo } from 'react'
import { Link, useSearchParams } from 'react-router'
import { CalendarClock, RefreshCcw, TriangleAlert, XCircle } from 'lucide-react'
import { cardPath, exerciseById, formulaById } from '../content'
import { formatDayLong, localDay } from '../lib/dates'
import { buildRetrySession, countLabel, dueFormulas, formulaMastery, upcomingReviews, weakFormulas } from '../lib/engine'
import { useStore } from '../state/store'
import { SessionPlayer } from '../ui/session/SessionPlayer'
import { ButtonLink, Card, Empty, MasteryBadge, PageHeader } from '../ui/kit'
import { Rich } from '../ui/Math'
import { useState } from 'react'

export default function Review() {
  const { state } = useStore()
  const [params] = useSearchParams()
  const due = useMemo(() => dueFormulas(state), [state])
  const weak = useMemo(() => weakFormulas(state, 8), [state])
  const upcoming = useMemo(() => upcomingReviews(state, 7), [state])
  const recentWrong = state.recentWrong.map((id) => exerciseById.get(id)).filter((e) => !!e).slice(0, 8)
  const [retry] = useState(() => (params.get('fehler') === '1' ? buildRetrySession(state.recentWrong.slice(0, 8)) : null))
  if (retry) return <SessionPlayer session={retry} exitTo="/wiederholen" />
  const today = localDay()
  const started = state.log.length > 0

  return (
    <div className="space-y-5">
      <PageHeader title="Wiederholen" subtitle="Zeitlich verteilte Wiederholung: Formeln und Begriffe kommen genau dann wieder, wenn du sie zu vergessen drohst." />

      <div className="grid gap-4 md:grid-cols-2">
        <Card className="p-5">
          <p className="flex items-center gap-2 text-lg font-semibold">
            <RefreshCcw className="size-5 text-fin" aria-hidden /> Heute fällig
          </p>
          <p className="mb-4 text-ink-2">{due.length ? `${countLabel(due)} – eine kurze Runde mit bis zu 8 Aufgaben.` : started ? 'Alles erledigt für heute.' : 'Nach deiner ersten Lektion plant die App hier Wiederholungen.'}</p>
          <ButtonLink to="/wiederholen/start?typ=faellig" className={due.length ? '' : 'pointer-events-none opacity-40'} size="lg">
            Wiederholung starten
          </ButtonLink>
        </Card>
        <Card className="p-5">
          <p className="flex items-center gap-2 text-lg font-semibold">
            <TriangleAlert className="size-5 text-bad" aria-hidden /> Meine Schwächen trainieren
          </p>
          <p className="mb-4 text-ink-2">{weak.length || state.recentWrong.length ? 'Frühere Fehler sowie Formeln und Begriffe mit niedrigem Kompetenzwert, gemischt.' : 'Noch keine Schwächen erkannt.'}</p>
          <ButtonLink to="/wiederholen/start?typ=schwaechen" variant="secondary" size="lg" className={weak.length || state.recentWrong.length ? '' : 'pointer-events-none opacity-40'}>
            Schwächen trainieren
          </ButtonLink>
        </Card>
      </div>

      {due.length > 0 && (
        <Card className="p-5">
          <h2 className="mb-3 text-xl font-semibold">Heute fällig</h2>
          <ul className="divide-y divide-line">
            {due.map((f) => (
              <li key={f.id} className="flex items-center justify-between gap-3 py-2">
                <Link to={cardPath(f)} className="min-w-0 truncate hover:underline">
                  {f.name}
                </Link>
                <MasteryBadge level={formulaMastery(state, f.id).level} />
              </li>
            ))}
          </ul>
        </Card>
      )}

      <div className="grid gap-4 md:grid-cols-2">
        <Card className="p-5">
          <h2 className="mb-3 flex items-center gap-2 text-xl font-semibold">
            <XCircle className="size-5 text-bad" aria-hidden /> Zuletzt falsch beantwortet
          </h2>
          {recentWrong.length === 0 ? (
            <p className="text-ink-3">Keine offenen Fehler.</p>
          ) : (
            <>
              <ul className="space-y-2 text-sm">
                {recentWrong.map((e) => (
                  <li key={e!.id} className="rounded-xl bg-paper-2 px-3 py-2">
                    <p className="text-xs font-semibold text-ink-3">{formulaById.get(e!.formulaIds[0]!)?.name}</p>
                    <Rich text={e!.prompt.length > 140 ? `${e!.prompt.slice(0, 140)}…` : e!.prompt} />
                  </li>
                ))}
              </ul>
              <ButtonLink to="/wiederholen?fehler=1" variant="secondary" className="mt-4">
                Diese Fehler erneut üben
              </ButtonLink>
            </>
          )}
        </Card>
        <Card className="p-5">
          <h2 className="mb-3 flex items-center gap-2 text-xl font-semibold">
            <CalendarClock className="size-5 text-rw" aria-hidden /> Die nächsten 7 Tage
          </h2>
          <p className="mb-3 text-sm text-ink-3">So viele Formeln und Begriffe werden an diesen Tagen wieder fällig. Die App plant das automatisch: Was du richtig beantwortest, kommt in wachsenden Abständen wieder (1 Tag, 3 Tage, dann länger), Fehler kommen schon am nächsten Tag.</p>
          {upcoming.every((u) => u.count === 0) ? (
            <p className="text-ink-3">Keine geplanten Wiederholungen.</p>
          ) : (
            <ul className="space-y-2">
              {upcoming.map((u) => (
                <li key={u.day} className="flex items-center gap-3 text-sm">
                  <span className="w-24 shrink-0 text-ink-2">{formatDayLong(u.day)}</span>
                  <span className="h-2 rounded-full bg-rw" style={{ width: `${Math.min(100, u.count * 12)}%`, minWidth: u.count ? 8 : 0 }} aria-hidden />
                  <span className="whitespace-nowrap text-ink-3">{u.count === 0 ? '–' : `${u.count} ${u.count === 1 ? 'Thema' : 'Themen'}`}</span>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>
      {!started && <Empty title="Noch keine Lernhistorie" text="Starte eine Lektion im Lernpfad – danach füllt sich dieser Bereich automatisch." action={<ButtonLink to="/lernpfad">Zum Lernpfad</ButtonLink>} />}
      <p className="text-center text-xs text-ink-3">Stand: {formatDayLong(today)}</p>
    </div>
  )
}
