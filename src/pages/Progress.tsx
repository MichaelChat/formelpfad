import { useMemo } from 'react'
import { Link } from 'react-router'
import { Award, BookOpen, Brain, Crown, Flame, Lock, Scroll, Sparkles, Target, Trophy, Wrench } from 'lucide-react'
import { chapters, formulas } from '../content'
import { SKILL_LABELS, SKILLS, type Skill } from '../content/types'
import { ACHIEVEMENTS, type Achievement } from '../lib/achievements'
import { addDays, formatDayLong, localDay } from '../lib/dates'
import { availableSkills, chapterProgress, formulaMastery, weakFormulas } from '../lib/engine'
import { computeStreak, levelFromXp, levelThreshold } from '../lib/gamification'
import { activeDays } from '../lib/progress'
import { useStore } from '../state/store'
import { Card, Empty, MasteryBadge, PageHeader, Progress, partTone } from '../ui/kit'

const ICONS: Record<Achievement['icon'], typeof Award> = { sparkles: Sparkles, book: BookOpen, flame: Flame, brain: Brain, wrench: Wrench, crown: Crown, scroll: Scroll, target: Target, trophy: Trophy }

export default function ProgressPage() {
  const { state } = useStore()
  const today = localDay()
  const lvl = levelFromXp(state.xp)
  const streak = computeStreak(activeDays(state), today)
  const weak = useMemo(() => weakFormulas(state, 6), [state])

  const skillAvg = useMemo(() => {
    const out = {} as Record<Skill, { sum: number; n: number }>
    for (const s of SKILLS) out[s] = { sum: 0, n: 0 }
    for (const f of formulas) {
      const fp = state.formula[f.id]
      if (!fp) continue
      for (const s of availableSkills(f.id)) {
        if (fp.skills[s] !== undefined) {
          out[s].sum += fp.skills[s]!
          out[s].n++
        }
      }
    }
    return out
  }, [state])

  const levels = useMemo(() => {
    const c = { neu: 0, lernend: 0, gefestigt: 0, beherrscht: 0 }
    for (const f of formulas) c[formulaMastery(state, f.id).level]++
    return c
  }, [state])

  const days = Array.from({ length: 28 }, (_, i) => addDays(today, i - 27))
  const maxXp = Math.max(10, ...days.map((d) => state.daily[d]?.xp ?? 0))

  if (state.log.length === 0)
    return (
      <div>
        <PageHeader title="Fortschritt" />
        <Empty title="Noch keine Daten" text="Hier siehst du bald dein Kompetenzprofil, deine Lernhistorie, schwache Themen und Erfolge – alles aus deinem tatsächlichen Lernstand berechnet." />
        <AchievementsGrid unlocked={state.achievements} />
      </div>
    )

  return (
    <div className="space-y-5">
      <PageHeader title="Fortschritt" subtitle="Alle Werte werden aus deinem tatsächlichen Lernstand berechnet." />

      <div className="grid gap-4 sm:grid-cols-3">
        <Card className="p-5">
          <p className="text-sm text-ink-3">Level</p>
          <p className="font-display text-4xl font-semibold">{lvl.level}</p>
          <Progress value={lvl.progress} tone="xp" className="mt-2 h-2" label="Fortschritt zum nächsten Level" />
          <p className="mt-1 text-xs text-ink-3">
            {state.xp} XP · nächstes Level ab {levelThreshold(lvl.level + 1)} XP
          </p>
        </Card>
        <Card className="p-5">
          <p className="text-sm text-ink-3">Streak</p>
          <p className="flex items-center gap-2 font-display text-4xl font-semibold">
            <Flame className="size-8 text-flame" aria-hidden />
            {streak.current}
          </p>
          <p className="mt-1 text-xs text-ink-3">Längste Serie: {streak.longest} Tage · Ein Tag zählt ab einer richtig gelösten Aufgabe.</p>
        </Card>
        <Card className="p-5">
          <p className="text-sm text-ink-3">Formeln</p>
          <p className="font-display text-4xl font-semibold">
            {levels.beherrscht}
            <span className="text-xl text-ink-3"> / {formulas.length}</span>
          </p>
          <p className="mt-1 text-xs text-ink-3">
            beherrscht · {levels.gefestigt} gefestigt · {levels.lernend} am Lernen
          </p>
        </Card>
      </div>

      <Card className="p-5">
        <h2 className="mb-3 text-xl font-semibold">Kompetenzprofil</h2>
        <p className="mb-4 text-sm text-ink-3">Durchschnitt über alle geübten Formeln, getrennt nach Fähigkeit. „Beherrscht“ verlangt mehrere starke Dimensionen, nicht nur Wiedererkennen.</p>
        <div className="grid gap-3">
          {SKILLS.map((s) => {
            const v = skillAvg[s]
            const avg = v.n ? v.sum / v.n : 0
            return (
              <div key={s} className="grid grid-cols-[minmax(0,13rem)_1fr_3.5rem] items-center gap-3 text-sm">
                <span className="truncate">{SKILL_LABELS[s]}</span>
                <Progress value={avg} tone="good" className="h-2.5" label={SKILL_LABELS[s]} />
                <span className="text-right text-ink-3">{v.n ? `${Math.round(avg * 100)} %` : '–'}</span>
              </div>
            )
          })}
        </div>
      </Card>

      <Card className="p-5">
        <h2 className="mb-3 text-xl font-semibold">Lernhistorie (28 Tage)</h2>
        <div className="flex h-32 items-end gap-1" role="img" aria-label="XP pro Tag in den letzten 28 Tagen">
          {days.map((d) => {
            const xp = state.daily[d]?.xp ?? 0
            return <div key={d} title={`${formatDayLong(d)}: ${xp} XP`} className={`flex-1 rounded-t ${d === today ? 'bg-xp' : xp > 0 ? 'bg-ink-2' : 'bg-paper-2'}`} style={{ height: `${Math.max(4, (xp / maxXp) * 100)}%` }} />
          })}
        </div>
        <div className="mt-1 flex justify-between text-xs text-ink-3">
          <span>{formatDayLong(days[0]!)}</span>
          <span>heute</span>
        </div>
      </Card>

      <div className="grid gap-4 md:grid-cols-2">
        <Card className="p-5">
          <h2 className="mb-3 text-xl font-semibold">Kapitel</h2>
          <ul className="space-y-3">
            {chapters.map((c) => {
              const cp = chapterProgress(state, c)
              return (
                <li key={c.id}>
                  <div className="mb-1 flex justify-between text-sm">
                    <span className={`font-semibold ${partTone[c.part].text}`}>
                      {c.number} <span className="text-ink">{c.title}</span>
                    </span>
                    <span className="text-ink-3">
                      {cp.done}/{cp.total}
                      {cp.bossPassed ? ' · 👑' : ''}
                    </span>
                  </div>
                  <Progress value={cp.done / cp.total} tone={c.part} className="h-2" label={c.title} />
                </li>
              )
            })}
          </ul>
        </Card>
        <Card className="p-5">
          <h2 className="mb-3 text-xl font-semibold">Schwache Themen</h2>
          {weak.length === 0 ? (
            <p className="text-ink-3">Keine auffälligen Schwächen.</p>
          ) : (
            <ul className="space-y-2">
              {weak.map((f) => (
                <li key={f.id} className="flex items-center justify-between gap-2">
                  <Link to={`/formeln/${encodeURIComponent(f.id)}`} className="min-w-0 truncate hover:underline">
                    {f.name}
                  </Link>
                  <MasteryBadge level={formulaMastery(state, f.id).level} />
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>

      <AchievementsGrid unlocked={state.achievements} />
    </div>
  )
}

function AchievementsGrid({ unlocked }: { unlocked: Record<string, string> }) {
  return (
    <Card className="mt-5 p-5">
      <h2 className="mb-3 text-xl font-semibold">Erfolge</h2>
      <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {ACHIEVEMENTS.map((a) => {
          const at = unlocked[a.id]
          const Icon = ICONS[a.icon]
          return (
            <li key={a.id} className={`flex items-start gap-3 rounded-2xl border-2 p-3 ${at ? 'border-xp bg-xp/10' : 'border-line opacity-70'}`}>
              <div className={`grid size-10 shrink-0 place-items-center rounded-xl ${at ? 'bg-xp text-ink' : 'bg-paper-2 text-ink-3'}`}>{at ? <Icon className="size-5" aria-hidden /> : <Lock className="size-5" aria-hidden />}</div>
              <div>
                <p className="font-semibold">{a.title}</p>
                <p className="text-sm text-ink-3">{a.description}</p>
                {at && <p className="text-xs text-ink-3">{formatDayLong(at.slice(0, 10))}</p>}
              </div>
            </li>
          )
        })}
      </ul>
    </Card>
  )
}
