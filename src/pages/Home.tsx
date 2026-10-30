import { useMemo } from 'react'
import { Link } from 'react-router'
import { ArrowRight, BookOpenText, Flame, Lightbulb, RefreshCcw, Settings, Shuffle, Sparkles, Swords, Target, TriangleAlert, Zap } from 'lucide-react'
import { cardPath, cardsOfKind, chapterById } from '../content'
import { PARTS } from '../content/types'
import { dailyQuests } from '../lib/achievements'
import { localDay } from '../lib/dates'
import { chapterProgress, countLabel, currentChapter, dueFormulas, formulaMastery, nextLesson, weakFormulas } from '../lib/engine'
import { computeStreak, goalProgress, GOAL_LABELS, levelFromXp } from '../lib/gamification'
import { activeDays } from '../lib/progress'
import { useStore } from '../state/store'
import { Logo } from '../ui/Layout'
import { ButtonLink, Card, MasteryBadge, PartBadge, Progress, Ring, partTone } from '../ui/kit'

function greeting(name: string) {
  const h = new Date().getHours()
  const g = h < 11 ? 'Guten Morgen' : h < 18 ? 'Hallo' : 'Guten Abend'
  return name ? `${g}, ${name}!` : `${g}!`
}

export default function Home() {
  const { state } = useStore()
  const today = localDay()
  const lvl = levelFromXp(state.xp)
  const streak = computeStreak(activeDays(state), today)
  const goal = goalProgress(state.settings.dailyGoal.kind, state.settings.dailyGoal.target, state.daily[today])
  const next = nextLesson(state)
  const chapter = currentChapter(state)
  const cp = chapterProgress(state, chapter)
  const due = useMemo(() => dueFormulas(state), [state])
  const weak = useMemo(() => weakFormulas(state, 4), [state])
  const quests = useMemo(() => dailyQuests(state, today), [state, today])
  const fresh = state.log.length === 0
  const totalAnswered = state.log.length
  const accuracy = totalAnswered ? state.log.filter((r) => r.correct).length / totalAnswered : 0
  const tone = partTone[chapter.part]

  return (
    <div className="space-y-6">
      {/* Kopfbereich */}
      <header className="flex items-center justify-between gap-3">
        <div className="min-w-0 md:hidden">
          <Logo className="[&>svg]:size-7 text-lg max-[379px]:text-[0px]" />
        </div>
        <h1 className="hidden text-3xl font-semibold md:block">{greeting(state.settings.name)}</h1>
        <div className="flex shrink-0 items-center gap-1.5 sm:gap-3">
          <span className="flex items-center gap-1 rounded-full bg-paper-2 px-2.5 py-1.5 text-sm font-bold whitespace-nowrap" title={`${streak.current} Tage in Folge gelernt`}>
            <Flame className={`size-4 ${streak.activeToday ? 'text-flame' : 'text-ink-3'}`} aria-hidden />
            <span className="sr-only">Streak:</span>
            {streak.current}
          </span>
          <span className="flex items-center gap-1 rounded-full bg-paper-2 px-2.5 py-1.5 text-sm font-bold whitespace-nowrap" title="Erfahrungspunkte">
            <Zap className="size-4 text-xp" aria-hidden />
            <span className="sr-only">XP:</span>
            {state.xp}
          </span>
          <span className="whitespace-nowrap rounded-full bg-ink px-2.5 py-1.5 text-sm font-bold text-paper" title="Level">
            Lv {lvl.level}
          </span>
          <Link to="/einstellungen" aria-label="Einstellungen" className="grid size-9 place-items-center rounded-xl hover:bg-paper-2">
            <Settings className="size-5" />
          </Link>
        </div>
      </header>
      <p className="font-display text-2xl md:hidden">{greeting(state.settings.name)}</p>

      {/* Hauptaktion */}
      <Card className="overflow-hidden">
        <div className={`relative p-5 sm:p-7 ${tone.soft}`}>
          <div className="flex flex-wrap items-center gap-2">
            <PartBadge part={chapter.part} />
            <span className="text-sm font-semibold text-ink-2">
              {chapter.number} · {chapter.title}
            </span>
          </div>
          {fresh ? (
            <>
              <h2 className="mt-3 text-3xl font-semibold">Willkommen beim Formelpfad</h2>
              <p className="mt-2 max-w-xl text-ink-2">
                Kurze Lektionen zu Formeln und Wissen aus Finanzierung, Rechnungswesen sowie Jahresabschluss & Bewertung – mit Originalaufgaben aus Tutorien und Beispielklausur. Starte mit der ersten Lektion, sie dauert etwa fünf Minuten.
              </p>
            </>
          ) : (
            <>
              <p className="mt-3 text-sm font-semibold uppercase tracking-wide text-ink-3">Nächste Lektion</p>
              <h2 className="mt-1 text-3xl font-semibold">{next?.title ?? 'Alle Lektionen abgeschlossen'}</h2>
              {next && <p className="mt-1 text-ink-2">{next.goal}</p>}
            </>
          )}
          <div className="mt-5 flex flex-wrap items-center gap-4">
            {next ? (
              <ButtonLink to={`/lektion/${next.id}`} size="lg" className="min-w-56">
                {fresh ? 'Erste Lektion starten' : 'Weiterlernen'} <ArrowRight className="size-5" aria-hidden />
              </ButtonLink>
            ) : (
              <ButtonLink to="/arena" size="lg">
                Zur Klausur-Arena <Swords className="size-5" aria-hidden />
              </ButtonLink>
            )}
            <div className="min-w-48 flex-1">
              <div className="mb-1 flex justify-between text-sm text-ink-2">
                <span>Kapitelfortschritt</span>
                <span>
                  {cp.done}/{cp.total} Lektionen
                </span>
              </div>
              <Progress value={cp.done / cp.total} tone={chapter.part} label="Kapitelfortschritt" />
            </div>
          </div>
        </div>
      </Card>

      {/* Gemischtes Training */}
      <Card className="p-5">
        <div className="flex flex-wrap items-center gap-4">
          <div className="grid size-12 shrink-0 place-items-center rounded-2xl bg-xp-soft text-ink">
            <Shuffle className="size-6" aria-hidden />
          </div>
          <div className="min-w-0 flex-1 basis-56">
            <p className="font-semibold">Gemischtes Training</p>
            <p className="text-sm text-ink-2">10 Aufgaben, Formeln und Wissen im Wechsel – wie in der Klausur. Fällige und schwache Themen kommen zuerst.</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <ButtonLink to="/training?art=gemischt" size="sm">
              <Shuffle className="size-4" aria-hidden /> Gemischt
            </ButtonLink>
            <ButtonLink to="/training?art=wissen" variant="secondary" size="sm">
              <Lightbulb className="size-4" aria-hidden /> Nur Wissen
            </ButtonLink>
          </div>
        </div>
      </Card>

      <div className="grid gap-4 md:grid-cols-2">
        {/* Tagesziel */}
        <Card className="flex items-center gap-4 p-5">
          <Ring value={goal.value / goal.target} size={72} stroke={8} tone={goal.done ? 'var(--color-good)' : 'var(--color-xp)'}>
            {goal.done ? '✓' : `${Math.round((goal.value / goal.target) * 100)}%`}
          </Ring>
          <div className="min-w-0">
            <p className="font-semibold">Tagesziel</p>
            <p className="text-ink-2">
              {goal.value} / {goal.target} {GOAL_LABELS[state.settings.dailyGoal.kind]}
            </p>
            <p className="text-sm text-ink-3">{goal.done ? 'Geschafft – stark!' : streak.activeToday ? 'Weiter so!' : streak.current > 0 ? `Lerne heute, um deine ${streak.current}-Tage-Serie zu halten.` : 'Eine richtige Aufgabe startet deine Serie.'}</p>
          </div>
        </Card>

        {/* Wiederholung */}
        <Card className="p-5">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="flex items-center gap-2 font-semibold">
                <RefreshCcw className="size-5 text-fin" aria-hidden /> Zur Wiederholung
              </p>
              <p className="text-ink-2">{due.length === 0 ? (fresh ? 'Nach den ersten Lektionen plant die App hier deine Wiederholungen.' : 'Heute ist nichts fällig.') : `${countLabel(due)} heute fällig`}</p>
            </div>
            {due.length > 0 && (
              <ButtonLink to="/wiederholen/start?typ=faellig" size="sm">
                Starten
              </ButtonLink>
            )}
          </div>
          {due.length > 0 && (
            <ul className="mt-3 flex flex-wrap gap-2">
              {due.slice(0, 5).map((f) => (
                <li key={f.id}>
                  <Link to={cardPath(f)} className="inline-block rounded-full bg-paper-2 px-3 py-1 text-sm hover:bg-line">
                    {f.short ?? f.name}
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>

      {/* Quests */}
      <Card className="p-5">
        <p className="mb-3 flex items-center gap-2 font-semibold">
          <Target className="size-5 text-rw" aria-hidden /> Tägliche Quests
        </p>
        <ul className="grid gap-3 sm:grid-cols-3">
          {quests.map((q) => (
            <li key={q.id} className={`rounded-2xl border-2 p-3 ${q.progress >= q.target ? 'border-good bg-good-soft/50' : 'border-line'}`}>
              <p className="text-sm font-medium">{q.title}</p>
              <div className="mt-2 flex items-center gap-2">
                <Progress value={q.progress / q.target} tone={q.progress >= q.target ? 'good' : 'xp'} className="h-2" label={q.title} />
                <span className="text-xs font-bold text-ink-3">
                  {q.progress}/{q.target}
                </span>
              </div>
            </li>
          ))}
        </ul>
      </Card>

      <div className="grid gap-4 md:grid-cols-3">
        {/* Schwächen */}
        <Card className="p-5 md:col-span-2">
          <p className="mb-3 flex items-center gap-2 font-semibold">
            <TriangleAlert className="size-5 text-bad" aria-hidden /> Persönliche Schwächen
          </p>
          {weak.length === 0 ? (
            <p className="text-ink-3">{fresh ? 'Sobald du übst, erkennt die App, welche Formeln und Themen dir schwerfallen.' : 'Keine auffälligen Schwächen – weiter so.'}</p>
          ) : (
            <>
              <ul className="space-y-2">
                {weak.map((f) => (
                  <li key={f.id} className="flex items-center justify-between gap-3">
                    <Link to={cardPath(f)} className="min-w-0 truncate hover:underline">
                      {f.name}
                    </Link>
                    <MasteryBadge level={formulaMastery(state, f.id).level} />
                  </li>
                ))}
              </ul>
              <ButtonLink to="/wiederholen/start?typ=schwaechen" variant="secondary" size="sm" className="mt-4">
                Meine Schwächen trainieren
              </ButtonLink>
            </>
          )}
        </Card>

        {/* Statistik */}
        <Card className="p-5">
          <p className="mb-3 flex items-center gap-2 font-semibold">
            <Sparkles className="size-5 text-xp" aria-hidden /> Lernstatistik
          </p>
          <dl className="grid grid-cols-2 gap-3 text-center">
            <div className="rounded-2xl bg-paper-2 p-3">
              <dt className="text-xs text-ink-3">Aufgaben</dt>
              <dd className="text-xl font-bold">{totalAnswered}</dd>
            </div>
            <div className="rounded-2xl bg-paper-2 p-3">
              <dt className="text-xs text-ink-3">Trefferquote</dt>
              <dd className="text-xl font-bold">{totalAnswered ? `${Math.round(accuracy * 100)} %` : '–'}</dd>
            </div>
            <div className="col-span-2 rounded-2xl bg-paper-2 p-3 text-left">
              <dt className="mb-1 flex justify-between text-xs text-ink-3">
                <span>Level {lvl.level}</span>
                <span>
                  {state.xp - lvl.current}/{lvl.next - lvl.current} XP
                </span>
              </dt>
              <dd>
                <Progress value={lvl.progress} tone="xp" className="h-2" label="Fortschritt zum nächsten Level" />
              </dd>
            </div>
          </dl>
          <Link to="/fortschritt" className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-ink-2 hover:underline">
            Alle Details <ArrowRight className="size-4" aria-hidden />
          </Link>
        </Card>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Link to="/arena" className="group">
          <Card className="flex h-full items-center gap-4 p-5 transition group-hover:shadow-[var(--shadow-lift)]">
            <div className="grid size-12 place-items-center rounded-2xl bg-ink text-paper">
              <Swords className="size-6" aria-hidden />
            </div>
            <div>
              <p className="font-semibold">Klausur-Arena</p>
              <p className="text-sm text-ink-3">Beispielklausur simulieren oder Themen gezielt trainieren</p>
            </div>
          </Card>
        </Link>
        <Link to="/formeln" className="group">
          <Card className="flex h-full items-center gap-4 p-5 transition group-hover:shadow-[var(--shadow-lift)]">
            <div className="grid size-12 place-items-center rounded-2xl bg-fin text-white">
              <BookOpenText className="size-6" aria-hidden />
            </div>
            <div>
              <p className="font-semibold">Formelsammlung</p>
              <p className="text-sm text-ink-3">Alle Formeln mit Erklärung, Beispiel und Quellen</p>
            </div>
          </Card>
        </Link>
        <Link to="/wissen" className="group">
          <Card className="flex h-full items-center gap-4 p-5 transition group-hover:shadow-[var(--shadow-lift)]">
            <div className="grid size-12 place-items-center rounded-2xl bg-xp text-ink">
              <Lightbulb className="size-6" aria-hidden />
            </div>
            <div>
              <p className="font-semibold">Wissen</p>
              <p className="text-sm text-ink-3">Begriffe, Prinzipien und Begründungen</p>
            </div>
          </Card>
        </Link>
      </div>
      <p className="text-center text-xs text-ink-3">
        Inhalte: {PARTS.fin.title} ({PARTS.fin.lecturer}), {PARTS.rw.title} ({PARTS.rw.lecturer}), {PARTS.jb.title} ({PARTS.jb.lecturer}) · SoSe 2026 · {cardsOfKind('formel').length} Formeln und {cardsOfKind('wissen').length} Begriffe in {chapterById.size} Kapiteln
      </p>
    </div>
  )
}
