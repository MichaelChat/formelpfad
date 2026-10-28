import type { ReactNode } from 'react'
import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router'
import { Clock, Flame, RotateCcw, Trophy, X, Zap } from 'lucide-react'
import { formulaById } from '../../content'
import type { Exercise } from '../../content/types'
import { emptyResponse, evaluate, type Evaluation, type Response } from '../../lib/evaluate'
import { BOSS_PASS, type Session, type SessionItem } from '../../lib/engine'
import { recordAttempt, recordBoss, recordLessonComplete, recordReviewSession, type Mode, activeDays } from '../../lib/progress'
import { computeStreak } from '../../lib/gamification'
import { localDay } from '../../lib/dates'
import { useStore } from '../../state/store'
import { ExampleCard, FormulaCard, IntroCard, MistakesCard } from '../cards'
import { ExerciseHeader, ExercisePlayer, ExercisePrompt, Feedback, type AnswerInfo } from '../exercise/ExercisePlayer'
import { ExerciseInput } from '../exercise/ExerciseInput'
import { Button, Card, Progress } from '../kit'

interface Outcome {
  exercise: Exercise
  evaluation: Evaluation
  hints: number
}

function formulaDifficulties(ex: Exercise): Record<string, 1 | 2 | 3> {
  return Object.fromEntries(ex.formulaIds.map((id) => [id, formulaById.get(id)?.difficulty ?? 2]))
}

export function SessionPlayer({ session, exitTo = '/' }: { session: Session; exitTo?: string }) {
  const navigate = useNavigate()
  const { apply, state } = useStore()
  const [queue, setQueue] = useState<SessionItem[]>(session.items)
  const [index, setIndex] = useState(0)
  const [outcomes, setOutcomes] = useState<Outcome[]>([])
  const [xpEarned, setXpEarned] = useState(0)
  const [done, setDone] = useState(false)
  const [finalInfo, setFinalInfo] = useState<{ bonusXp: number; passed?: boolean } | null>(null)
  const [retried] = useState(() => new Set<string>())
  const [deferred, setDeferred] = useState<Record<number, Response>>({})
  const [remaining, setRemaining] = useState<number | null>(session.timeLimit ?? null)
  const startedAt = useRef(Date.now())
  const mode: Mode = session.mode

  const total = queue.length
  const item = queue[index]
  const exerciseCount = queue.filter((i) => i.kind === 'exercise').length

  // Zeitlimit
  useEffect(() => {
    if (remaining === null || done) return
    if (remaining <= 0) {
      finishSession()
      return
    }
    const t = setTimeout(() => setRemaining((r) => (r === null ? r : r - 1)), 1000)
    return () => clearTimeout(t)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [remaining, done])

  const record = (ex: Exercise, ev: Evaluation, hints: number, ms: number) => {
    const res = apply((s) =>
      recordAttempt(s, {
        exId: ex.id,
        skill: ex.skill,
        difficulty: ex.difficulty,
        formulaIds: ex.formulaIds,
        formulaDifficulty: formulaDifficulties(ex),
        correct: ev.correct,
        score: ev.score,
        hintsUsed: hints,
        ms,
        mode,
        type: ex.type,
        selfAssessed: ex.type === 'selfcheck',
      }),
    )
    setXpEarned((x) => x + res.xp)
    setOutcomes((o) => [...o, { exercise: ex, evaluation: ev, hints }])
  }

  const onAnswered = (ex: Exercise, info: AnswerInfo) => {
    record(ex, info.evaluation, info.hintsUsed, info.ms)
    // Falsch beantwortete Aufgaben kommen im Lernmodus einmal am Ende erneut (nicht bei generierten Varianten).
    if (!info.evaluation.correct && !retried.has(ex.id) && (mode === 'lesson' || mode === 'review' || mode === 'weakness') && ex.type !== 'selfcheck') {
      retried.add(ex.id)
      setQueue((q) => [...q, { kind: 'exercise', exercise: ex }])
    }
  }

  function finishSession() {
    if (done) return
    let bonus = 0
    let passed: boolean | undefined
    // Aufgeschobene Antworten (Prüfungsmodus) jetzt auswerten
    if (session.deferFeedback) {
      queue.forEach((it, i) => {
        if (it.kind !== 'exercise') return
        const r = deferred[i] ?? emptyResponse(it.exercise)
        const ev = evaluate(it.exercise, r)
        record(it.exercise, ev.verdict === 'invalid' ? { ...ev, correct: false, score: 0 } : ev, 0, 0)
      })
    }
    const answered = session.deferFeedback ? exerciseCount : outcomes.length
    const scoreSum = session.deferFeedback ? 0 : outcomes.reduce((s, o) => s + o.evaluation.score, 0)
    if (session.mode === 'lesson' && session.lessonId) {
      const score = answered ? scoreSum / answered : 0
      bonus = apply((s) => recordLessonComplete(s, session.lessonId!, score)).xp
    } else if (session.mode === 'boss' && session.chapterId) {
      const firstTry = outcomes.slice(0, exerciseCount)
      const score = exerciseCount ? firstTry.reduce((s, o) => s + o.evaluation.score, 0) / exerciseCount : 0
      const r = apply((s) => recordBoss(s, session.chapterId!, score))
      bonus = r.xp
      passed = r.passed
    } else if ((session.mode === 'review' || session.mode === 'weakness') && outcomes.length > 0) {
      bonus = apply((s) => recordReviewSession(s)).xp
    }
    setFinalInfo({ bonusXp: bonus, ...(passed !== undefined ? { passed } : {}) })
    setDone(true)
  }

  const next = () => {
    if (index + 1 >= queue.length) finishSession()
    else setIndex((i) => i + 1)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const progress = done ? 1 : index / Math.max(1, total)

  if (done) {
    return <Summary session={session} outcomes={outcomes} xp={xpEarned + (finalInfo?.bonusXp ?? 0)} passed={finalInfo?.passed} ms={Date.now() - startedAt.current} exitTo={exitTo} deferredCount={session.deferFeedback ? exerciseCount : 0} />
  }

  return (
    <div className="mx-auto max-w-2xl">
      <div className="sticky top-0 z-20 -mx-4 mb-5 flex items-center gap-3 bg-paper/95 px-4 py-3 backdrop-blur">
        <button aria-label="Sitzung beenden" onClick={() => navigate(exitTo)} className="grid size-10 place-items-center rounded-xl hover:bg-paper-2">
          <X className="size-6" />
        </button>
        <Progress value={progress} tone="good" label="Fortschritt der Sitzung" />
        {remaining !== null ? (
          <span className={`flex items-center gap-1 font-mono text-sm font-bold ${remaining < 60 ? 'text-bad' : 'text-ink-2'}`} aria-live="off">
            <Clock className="size-4" aria-hidden />
            {Math.floor(remaining / 60)}:{String(remaining % 60).padStart(2, '0')}
          </span>
        ) : (
          <span className="flex items-center gap-1 text-sm font-bold text-xp">
            <Zap className="size-4" aria-hidden />
            {xpEarned}
          </span>
        )}
      </div>

      <Card className="p-5 sm:p-7">
        <div key={`${index}-${item?.kind}`} className="anim-up">
          {item?.kind === 'intro' && <IntroCard title={item.title} text={item.text} formulaIds={item.formulaIds} />}
          {item?.kind === 'formula' && <FormulaCard formulaId={item.formulaId} />}
          {item?.kind === 'example' && <ExampleCard formulaId={item.formulaId} />}
          {item?.kind === 'mistakes' && <MistakesCard formulaIds={item.formulaIds} />}
          {item?.kind === 'exercise' && !session.deferFeedback && <ExercisePlayer key={`${index}-${item.exercise.id}`} exercise={item.exercise} onAnswered={(info) => onAnswered(item.exercise, info)} onNext={next} nextLabel={index + 1 >= queue.length ? 'Abschließen' : 'Weiter'} />}
          {item?.kind === 'exercise' && session.deferFeedback && (
            <div className="space-y-5">
              <div>
                <ExerciseHeader exercise={item.exercise} />
                <ExercisePrompt exercise={item.exercise} />
              </div>
              <ExerciseInput exercise={item.exercise} response={deferred[index] ?? emptyResponse(item.exercise)} onChange={(r) => setDeferred((d) => ({ ...d, [index]: r }))} />
              <div className="flex gap-3">
                <Button variant="secondary" disabled={index === 0} onClick={() => setIndex((i) => i - 1)}>
                  Zurück
                </Button>
                <Button className="flex-1" onClick={next}>
                  {index + 1 >= queue.length ? 'Abgeben' : 'Speichern & weiter'}
                </Button>
              </div>
            </div>
          )}
        </div>
        {item && item.kind !== 'exercise' && (
          <div className="mt-6">
            <Button className="w-full" size="lg" onClick={next}>
              {item.kind === 'intro' ? 'Los geht’s' : 'Weiter'}
            </Button>
          </div>
        )}
      </Card>
      {state.settings.name === '' && index === 0 && session.mode === 'lesson' && <p className="mt-4 text-center text-sm text-ink-3">Tipp: Antworten mit Enter bestätigen. Dezimalkomma und Punkt werden beide verstanden.</p>}
    </div>
  )
}

function Summary({ session, outcomes, xp, passed, ms, exitTo, deferredCount }: { session: Session; outcomes: Outcome[]; xp: number; passed?: boolean; ms: number; exitTo: string; deferredCount: number }) {
  const navigate = useNavigate()
  const { state } = useStore()
  const graded = outcomes.length
  const correct = outcomes.filter((o) => o.evaluation.correct).length
  const accuracy = graded ? outcomes.reduce((s, o) => s + o.evaluation.score, 0) / graded : 0
  const streak = useMemo(() => computeStreak(activeDays(state), localDay()), [state])
  const wrong = outcomes.filter((o) => !o.evaluation.correct)
  const isBoss = session.mode === 'boss'
  return (
    <div className="mx-auto max-w-2xl space-y-5">
      <Card className="anim-pop p-6 text-center sm:p-8">
        <div className={`mx-auto mb-4 grid size-20 place-items-center rounded-3xl ${isBoss ? (passed ? 'bg-xp text-white' : 'bg-paper-2 text-ink-2') : 'bg-good text-white'}`}>
          <Trophy className="size-10" aria-hidden />
        </div>
        <h1 className="text-3xl font-semibold">{isBoss ? (passed ? 'Boss besiegt!' : 'Noch nicht ganz') : session.mode === 'lesson' ? 'Lektion abgeschlossen' : 'Runde abgeschlossen'}</h1>
        <p className="mt-1 text-ink-3">{session.title}</p>
        {isBoss && !passed && <p className="mt-2 text-ink-2">Zum Bestehen brauchst du mindestens {Math.round(BOSS_PASS * 100)} %. Wiederhole die schwachen Formeln und versuche es erneut.</p>}
        <div className="mt-6 grid grid-cols-3 gap-3">
          <Stat label="XP" value={`+${xp}`} tone="text-xp" icon={<Zap className="size-5" />} />
          <Stat label="Treffer" value={deferredCount ? `${correct}/${deferredCount}` : `${Math.round(accuracy * 100)} %`} tone="text-good" />
          <Stat label="Streak" value={`${streak.current}`} tone="text-flame" icon={<Flame className="size-5" />} />
        </div>
        <p className="mt-4 text-sm text-ink-3">Dauer: {Math.max(1, Math.round(ms / 60000))} min · {correct} von {graded} Aufgaben richtig</p>
      </Card>

      {wrong.length > 0 && (
        <Card className="p-5">
          <h2 className="mb-3 text-xl font-semibold">Das solltest du dir noch einmal ansehen</h2>
          <div className="space-y-4">
            {wrong.slice(0, 6).map((o, i) => (
              <div key={i} className="space-y-2">
                <ExercisePrompt exercise={o.exercise} />
                <Feedback exercise={o.exercise} result={o.evaluation} compact={!session.deferFeedback} />
              </div>
            ))}
          </div>
        </Card>
      )}

      <div className="flex flex-col gap-3 sm:flex-row">
        {wrong.length > 0 && (
          <Button variant="secondary" className="flex-1" onClick={() => navigate('/wiederholen?fehler=1')}>
            <RotateCcw className="size-5" aria-hidden /> Fehler trainieren
          </Button>
        )}
        <Button className="flex-1" size="lg" onClick={() => navigate(exitTo)}>
          Fertig
        </Button>
      </div>
    </div>
  )
}

function Stat({ label, value, tone, icon }: { label: string; value: string; tone: string; icon?: ReactNode }) {
  return (
    <div className="rounded-2xl border-2 border-line p-3">
      <p className="text-xs font-semibold uppercase tracking-wide text-ink-3">{label}</p>
      <p className={`mt-1 flex items-center justify-center gap-1 text-2xl font-bold ${tone}`}>
        {icon}
        {value}
      </p>
    </div>
  )
}
