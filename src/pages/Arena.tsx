import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate, useParams, useSearchParams } from 'react-router'
import { BarChart, Clock, FileText, Play, RotateCcw, Swords, Timer } from 'lucide-react'
import { chapters, examById, exams, formulaById } from '../content'
import { PARTS, type Exam, type Exercise } from '../content/types'
import { emptyResponse, evaluate, type Evaluation, type Response } from '../lib/evaluate'
import { examExercises, relevance, scoreExam, type ExerciseResult } from '../lib/exam'
import { recordAttempt, recordExam, type ExamAttempt } from '../lib/progress'
import { formatDayLong } from '../lib/dates'
import { buildRetrySession } from '../lib/engine'
import { useStore } from '../state/store'
import { ExerciseInput } from '../ui/exercise/ExerciseInput'
import { ExerciseHeader, ExercisePrompt, Feedback } from '../ui/exercise/ExercisePlayer'
import { Button, ButtonLink, Card, PageHeader, Pill, Progress, Sources } from '../ui/kit'
import { Rich } from '../ui/Math'
import { SessionPlayer } from '../ui/session/SessionPlayer'

export default function Arena() {
  const navigate = useNavigate()
  const { state } = useStore()
  const [selected, setSelected] = useState<string[]>([])
  const [n, setN] = useState(8)
  const [timed, setTimed] = useState(false)
  const rel = useMemo(() => relevance(exams), [])
  const topFormulas = [...rel.entries()].sort((a, b) => b[1].points - a[1].points).slice(0, 10)

  return (
    <div className="space-y-5">
      <PageHeader title="Klausur-Arena" subtitle="Gezielte Klausurvorbereitung: Originalklausur simulieren oder Themen trainieren." />

      {exams.map((exam) => {
        const attempts = state.exams.filter((a) => a.examId === exam.id)
        const best = attempts.reduce((m, a) => Math.max(m, a.points), 0)
        return (
          <Card key={exam.id} className="overflow-hidden">
            <div className="bg-ink p-5 text-paper sm:p-7">
              <div className="flex items-center gap-2 text-sm opacity-80">
                <FileText className="size-4" aria-hidden /> Originalklausur mit offizieller Lösung
              </div>
              <h2 className="mt-1 text-2xl font-semibold sm:text-3xl">{exam.title}</h2>
              <p className="mt-1 opacity-80">
                {exam.totalPoints} Punkte · {exam.sections.length} Aufgabenblöcke · {exam.minutes} min {exam.minutesIsOfficial ? '' : '(Vorschlag)'}
              </p>
            </div>
            <div className="space-y-4 p-5 sm:p-7">
              <ul className="list-disc space-y-1 pl-5 text-sm text-ink-2">
                {exam.intro.map((t, i) => (
                  <li key={i}>{t}</li>
                ))}
              </ul>
              {attempts.length > 0 && (
                <p className="text-sm text-ink-2">
                  {attempts.length} Versuch{attempts.length === 1 ? '' : 'e'} · bestes Ergebnis {best} / {exam.totalPoints} Punkte
                </p>
              )}
              <div className="flex flex-col gap-3 sm:flex-row">
                <Button size="lg" className="flex-1" onClick={() => navigate(`/arena/klausur/${exam.id}?timer=1`)}>
                  <Timer className="size-5" aria-hidden /> Mit Zeitlimit simulieren
                </Button>
                <Button size="lg" variant="secondary" className="flex-1" onClick={() => navigate(`/arena/klausur/${exam.id}`)}>
                  Ohne Zeitdruck
                </Button>
              </div>
            </div>
          </Card>
        )
      })}

      <Card className="p-5 sm:p-7">
        <h2 className="flex items-center gap-2 text-xl font-semibold">
          <Swords className="size-5" aria-hidden /> Themen-Training
        </h2>
        <p className="mb-4 text-ink-2">Gemischte Aufgaben (Rechnen und Theorie) aus den gewählten Kapiteln – ohne Auswahl aus allen.</p>
        <div className="mb-4 grid gap-2 sm:grid-cols-2">
          {chapters.map((c) => {
            const on = selected.includes(c.id)
            return (
              <label key={c.id} className={`flex min-h-12 cursor-pointer items-center gap-3 rounded-2xl border-2 px-3 ${on ? 'border-ink bg-paper-2' : 'border-line'}`}>
                <input type="checkbox" checked={on} onChange={() => setSelected((s) => (on ? s.filter((x) => x !== c.id) : [...s, c.id]))} className="size-5 accent-[var(--color-ink)]" />
                <span className="text-sm">
                  <span className="font-semibold">{c.number}</span> {c.title} <span className="text-ink-3">· {PARTS[c.part].title}</span>
                </span>
              </label>
            )
          })}
        </div>
        <div className="flex flex-wrap items-center gap-4">
          <label className="flex items-center gap-2 text-sm">
            Anzahl
            <select value={n} onChange={(e) => setN(Number(e.target.value))} className="min-h-10 rounded-xl border-2 border-line bg-paper px-2">
              {[5, 8, 12, 16].map((x) => (
                <option key={x}>{x}</option>
              ))}
            </select>
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={timed} onChange={(e) => setTimed(e.target.checked)} className="size-5" /> Zeitlimit & Auswertung erst am Ende
          </label>
          <Button onClick={() => navigate(`/arena/training?kapitel=${selected.join(',')}&n=${n}${timed ? '&timer=1' : ''}`)}>
            <Play className="size-5" aria-hidden /> Training starten
          </Button>
        </div>
      </Card>

      <Card className="p-5 sm:p-7">
        <h2 className="flex items-center gap-2 text-xl font-semibold">
          <BarChart className="size-5" aria-hidden /> Was kam in der Klausur vor?
        </h2>
        <p className="mb-3 text-sm text-ink-2">
          Systematisch ausgewertet: {exams.length} Beispielklausur. Angegeben sind Anzahl der Teilaufgaben und anteilige Punkte je Formel. Aus einer einzigen Klausur lassen sich keine Wahrscheinlichkeiten für die nächste Prüfung ableiten.
        </p>
        <ul className="space-y-2">
          {topFormulas.map(([fid, r]) => (
            <li key={fid} className="grid grid-cols-[1fr_auto] items-center gap-3 text-sm">
              <div className="min-w-0">
                <p className="truncate font-medium">{formulaById.get(fid)?.name ?? fid}</p>
                <div className="h-2 rounded-full bg-paper-2">
                  <div className="h-2 rounded-full bg-ink" style={{ width: `${Math.min(100, (r.points / 18) * 100)}%` }} />
                </div>
              </div>
              <span className="text-ink-3">
                {r.tasks} TA · {Math.round(r.points * 10) / 10} P.
              </span>
            </li>
          ))}
        </ul>
      </Card>

      {state.exams.length > 0 && (
        <Card className="p-5">
          <h2 className="mb-3 text-xl font-semibold">Bisherige Simulationen</h2>
          <ul className="divide-y divide-line text-sm">
            {[...state.exams].reverse().map((a) => (
              <li key={a.id} className="flex justify-between py-2">
                <span>
                  {formatDayLong(a.at.slice(0, 10))} · {a.timed ? 'mit Zeitlimit' : 'ohne Zeitdruck'}
                </span>
                <span className="font-semibold">
                  {a.points} / {a.maxPoints} P.
                </span>
              </li>
            ))}
          </ul>
        </Card>
      )}
    </div>
  )
}

// ------------------------------------------------------------------ Simulation

export function ExamSimulation() {
  const { id = '' } = useParams()
  const [params] = useSearchParams()
  const exam = examById.get(id)
  const timed = params.get('timer') === '1'
  if (!exam) return <p>Klausur nicht gefunden.</p>
  return <ExamRunner exam={exam} timed={timed} />
}

function ExamRunner({ exam, timed }: { exam: Exam; timed: boolean }) {
  const navigate = useNavigate()
  const { apply } = useStore()
  const exList = useMemo(() => examExercises(exam), [exam])
  const [responses, setResponses] = useState<Record<string, Response>>({})
  const [results, setResults] = useState<Record<string, Evaluation> | null>(null)
  const [attempt, setAttempt] = useState<ExamAttempt | null>(null)
  const [remaining, setRemaining] = useState(timed ? exam.minutes * 60 : null)
  const [retry, setRetry] = useState<ReturnType<typeof buildRetrySession>>(null)
  const [selfGrading, setSelfGrading] = useState(false)
  const started = useRef(Date.now())
  const selfItems = exList.filter((e) => e.type === 'selfcheck')

  const requestSubmit = () => {
    if (selfItems.length && !selfGrading) {
      setSelfGrading(true)
      window.scrollTo({ top: 0 })
      return
    }
    submit()
  }

  const submit = () => {
    if (results) return
    const evals: Record<string, Evaluation> = {}
    const exResults: Record<string, ExerciseResult> = {}
    for (const ex of exList) {
      const ev = evaluate(ex, responses[ex.id] ?? emptyResponse(ex))
      const e2 = ev.verdict === 'invalid' ? { ...ev, correct: false, score: 0 } : ev
      evals[ex.id] = e2
      exResults[ex.id] = { score: e2.score, correct: e2.correct, estimated: !!e2.estimated }
    }
    const sc = scoreExam(exam, exResults)
    const att: ExamAttempt = {
      id: `exam:${Date.now()}`,
      examId: exam.id,
      at: new Date().toISOString(),
      timed,
      durationMs: Date.now() - started.current,
      points: sc.points,
      maxPoints: sc.maxPoints,
      tasks: sc.tasks.map((t) => ({ taskId: t.taskId, points: t.points, maxPoints: t.maxPoints, estimated: t.estimated })),
    }
    apply((s) => {
      let st = s
      for (const ex of exList) {
        const ev = evals[ex.id]!
        st = recordAttempt(st, { exId: ex.id, skill: ex.skill, difficulty: ex.difficulty, formulaIds: ex.formulaIds, formulaDifficulty: Object.fromEntries(ex.formulaIds.map((f) => [f, formulaById.get(f)?.difficulty ?? 2])), correct: ev.correct, score: ev.score, hintsUsed: 0, ms: 0, mode: 'exam', type: ex.type, awardXp: false, selfAssessed: ex.type === 'selfcheck' }).state
      }
      return recordExam(st, att)
    })
    setResults(evals)
    setAttempt(att)
    window.scrollTo({ top: 0 })
  }

  useEffect(() => {
    if (remaining === null || results) return
    if (selfGrading) return
    if (remaining <= 0) {
      requestSubmit()
      return
    }
    const t = setTimeout(() => setRemaining((r) => (r === null ? r : r - 1)), 1000)
    return () => clearTimeout(t)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [remaining, results, selfGrading])

  if (retry) return <SessionPlayer session={retry} exitTo="/arena" />

  const answered = exList.filter((ex) => responses[ex.id] && JSON.stringify(responses[ex.id]) !== JSON.stringify(emptyResponse(ex))).length

  if (selfGrading && !results) {
    const allGraded = selfItems.every((e) => {
      const r = responses[e.id]
      return r?.type === 'selfcheck' && r.selfScore !== null
    })
    return (
      <div className="mx-auto max-w-3xl space-y-5">
        <Card className="p-5">
          <h1 className="text-2xl font-semibold">Selbstbewertung der offenen Fragen</h1>
          <p className="mt-1 text-ink-2">Die Zeit ist angehalten. Vergleiche deine Notizen mit der Musterlösung und vergib ehrlich deine Punkte. Diese Punkte werden als „geschätzt“ markiert.</p>
        </Card>
        {selfItems.map((ex) => {
          const r = responses[ex.id] ?? emptyResponse(ex)
          if (r.type !== 'selfcheck' || ex.type !== 'selfcheck') return null
          return (
            <Card key={ex.id} className="space-y-3 p-5">
              <ExercisePrompt exercise={ex} />
              <div className="rounded-xl bg-paper-2 p-3 text-sm">
                <p className="font-semibold">Deine Notizen</p>
                <p className="whitespace-pre-wrap text-ink-2">{r.text || '– keine –'}</p>
              </div>
              <ModelAnswer exercise={ex} />
              <div className="grid grid-cols-3 gap-2">
                {[
                  [0, 'Nicht'],
                  [0.5, 'Teilweise'],
                  [1, 'Vollständig'],
                ].map(([v, label]) => (
                  <Button key={label} variant={r.selfScore === v ? 'primary' : 'secondary'} aria-pressed={r.selfScore === v} onClick={() => setResponses((rs) => ({ ...rs, [ex.id]: { ...r, selfScore: v as number } }))}>
                    {label}
                  </Button>
                ))}
              </div>
            </Card>
          )
        })}
        <Button size="lg" className="w-full" disabled={!allGraded} onClick={submit}>
          Auswertung anzeigen
        </Button>
      </div>
    )
  }

  if (results && attempt) {
    const sc = scoreExam(exam, Object.fromEntries(Object.entries(results).map(([k, v]) => [k, { score: v.score, correct: v.correct, estimated: !!v.estimated }])))
    const gaps = sc.tasks.filter((t) => t.points < t.maxPoints * 0.6)
    const wrongIds = exList.filter((ex) => !results[ex.id]!.correct && ex.type !== 'selfcheck').map((ex) => ex.id)
    const gapChapters = [...new Set(gaps.map((g) => g.chapterId))]
    return (
      <div className="mx-auto max-w-3xl space-y-5">
        <Card className="p-6 text-center">
          <p className="text-sm font-semibold uppercase tracking-wide text-ink-3">Ergebnis</p>
          <p className="mt-1 font-display text-5xl font-semibold">
            {sc.points} <span className="text-2xl text-ink-3">/ {sc.maxPoints}</span>
          </p>
          <p className="text-ink-2">{Math.round((sc.points / sc.maxPoints) * 100)} % · Dauer {Math.round(attempt.durationMs / 60000)} min</p>
          <Progress value={sc.points / sc.maxPoints} tone="good" className="mt-4" label="Klausurergebnis" />
          <p className="mt-3 text-xs text-ink-3">Mit „geschätzt“ markierte Punkte beruhen auf Teilpunkt-Annahmen der App oder auf deiner Selbsteinschätzung.</p>
        </Card>

        <Card className="p-5">
          <h2 className="mb-3 text-xl font-semibold">Nach Themengebiet</h2>
          <ul className="space-y-2">
            {sc.byTopic.map((t) => (
              <li key={t.topic} className="grid grid-cols-[minmax(0,10rem)_1fr_auto] items-center gap-3 text-sm">
                <span className="truncate">{t.topic}</span>
                <Progress value={t.points / t.maxPoints} tone={t.points / t.maxPoints >= 0.6 ? 'good' : 'xp'} className="h-2" label={t.topic} />
                <span className="text-ink-3">
                  {Math.round(t.points * 10) / 10}/{t.maxPoints}
                </span>
              </li>
            ))}
          </ul>
        </Card>

        {gaps.length > 0 && (
          <Card className="p-5">
            <h2 className="mb-2 text-xl font-semibold">Erkannte Wissenslücken & Empfehlung</h2>
            <p className="mb-3 text-ink-2">Unter 60 % der Punkte in: {gaps.map((g) => g.number).join(', ')}. Empfohlen: die zugehörigen Kapitel wiederholen.</p>
            <div className="flex flex-wrap gap-2">
              {gapChapters.map((cid) => {
                const c = chapters.find((x) => x.id === cid)!
                return (
                  <ButtonLink key={cid} to={`/lektion/${c.lessons[0]!.id}`} variant="secondary" size="sm">
                    {c.number} {c.title}
                  </ButtonLink>
                )
              })}
            </div>
          </Card>
        )}

        <div className="flex flex-col gap-3 sm:flex-row">
          {wrongIds.length > 0 && (
            <Button variant="secondary" className="flex-1" onClick={() => setRetry(buildRetrySession(wrongIds))}>
              <RotateCcw className="size-5" aria-hidden /> Falsche Aufgaben erneut üben
            </Button>
          )}
          <Button className="flex-1" onClick={() => navigate('/arena')}>
            Zur Arena
          </Button>
        </div>

        <h2 className="pt-2 text-2xl font-semibold">Lösungswege</h2>
        {exam.sections.map((section) => (
          <div key={section.title} className="space-y-4">
            <h3 className="text-lg font-semibold">{section.title}</h3>
            {section.tasks.map((task) => {
              const ts = sc.tasks.find((t) => t.taskId === task.id)!
              return (
                <Card key={task.id} className="space-y-3 p-5">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="font-semibold">
                      {task.number} {task.title}
                    </p>
                    <Pill className={ts.points >= task.points ? 'bg-good-soft text-good' : ts.points > 0 ? 'bg-xp/15 text-ink-2' : 'bg-bad-soft text-bad'}>
                      {ts.points} / {task.points} P.{ts.estimated ? ' (geschätzt)' : ''}
                    </Pill>
                  </div>
                  {task.exerciseIds.map((exId) => {
                    const ex = exList.find((e) => e.id === exId)!
                    return (
                      <div key={exId} className="space-y-2">
                        <ExercisePrompt exercise={ex} />
                        <Feedback exercise={ex} result={results[exId]!} />
                        {ex.type === 'selfcheck' && <ModelAnswer exercise={ex} />}
                      </div>
                    )
                  })}
                </Card>
              )
            })}
          </div>
        ))}
        <Sources sources={[exam.source]} />
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-3xl space-y-5">
      <div className="sticky top-0 z-20 -mx-4 flex items-center justify-between gap-3 bg-paper/95 px-4 py-3 backdrop-blur">
        <button onClick={() => navigate('/arena')} className="rounded-xl px-2 py-1 text-sm font-semibold text-ink-2 hover:bg-paper-2">
          Abbrechen
        </button>
        <span className="text-sm text-ink-2">
          {answered}/{exList.length} bearbeitet
        </span>
        {remaining !== null && (
          <span className={`flex items-center gap-1 font-mono font-bold ${remaining < 300 ? 'text-bad' : ''}`}>
            <Clock className="size-4" aria-hidden />
            {Math.floor(remaining / 60)}:{String(remaining % 60).padStart(2, '0')}
          </span>
        )}
      </div>
      <Card className="p-5">
        <h1 className="text-2xl font-semibold">{exam.title}</h1>
        <ul className="mt-2 list-disc pl-5 text-sm text-ink-2">
          {exam.intro.map((t, i) => (
            <li key={i}>{t}</li>
          ))}
        </ul>
        <p className="mt-2 text-sm font-semibold">Während der Simulation gibt es keine Hinweise und keine Rückmeldung. Die Auswertung folgt nach der Abgabe.</p>
      </Card>
      {exam.sections.map((section) => (
        <div key={section.title} className="space-y-4">
          <h2 className="text-xl font-semibold">
            {section.title} <span className="text-ink-3">({section.points} P.)</span>
          </h2>
          {section.context && <Rich as="p" className="text-sm text-ink-2" text={section.context} />}
          {section.tasks.map((task) => (
            <Card key={task.id} className="space-y-4 p-5">
              <div className="flex justify-between gap-3">
                <p className="font-semibold">
                  {task.number} {task.title}
                </p>
                <span className="shrink-0 text-sm text-ink-3">{task.points} P.</span>
              </div>
              {task.exerciseIds.map((exId) => {
                const ex = exList.find((e) => e.id === exId)!
                return <ExamItem key={exId} exercise={ex} response={responses[exId] ?? emptyResponse(ex)} onChange={(r) => setResponses((rs) => ({ ...rs, [exId]: r }))} />
              })}
            </Card>
          ))}
        </div>
      ))}
      <Button size="lg" className="w-full" onClick={() => (answered < exList.length ? confirm(`Noch ${exList.length - answered} Aufgabe(n) unbearbeitet. Trotzdem abgeben?`) && requestSubmit() : requestSubmit())}>
        Klausur abgeben
      </Button>
    </div>
  )
}

function ExamItem({ exercise, response, onChange }: { exercise: Exercise; response: Response; onChange: (r: Response) => void }) {
  return (
    <div className="space-y-3">
      <ExerciseHeader exercise={exercise} />
      <ExercisePrompt exercise={exercise} />
      <ExerciseInput exercise={exercise} response={response} onChange={onChange} />
      {exercise.type === 'selfcheck' && <p className="text-sm text-ink-3">Offene Frage: Nach der Abgabe vergleichst du deine Notizen mit der Musterlösung und bewertest dich selbst.</p>}
    </div>
  )
}

function ModelAnswer({ exercise }: { exercise: Exercise }) {
  if (exercise.type !== 'selfcheck') return null
  return (
    <div className="rounded-2xl border-2 border-ink-3 p-3 text-sm">
      <p className="font-semibold">Musterlösung</p>
      {exercise.modelAnswer.map((m, i) => (
        <Rich key={i} as="p" text={m} />
      ))}
    </div>
  )
}
