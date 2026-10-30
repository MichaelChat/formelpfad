import { useEffect, useRef, useState } from 'react'
import { BookOpen, CheckCircle2, Lightbulb, Sparkles, XCircle } from 'lucide-react'
import { formulaById } from '../../content'
import { isKnowledge, type Exercise } from '../../content/types'
import { SKILL_LABELS } from '../../content/types'
import { emptyResponse, evaluate, evaluateStep, type Evaluation, type Response } from '../../lib/evaluate'
import { stepWeights } from '../../lib/exam'
import { formatNumber } from '../../lib/format'
import type { CheckResult } from '../../lib/validation'
import { Button, OriginBadge, Pill, Sources } from '../kit'
import { Rich, TeX } from '../Math'
import { ExerciseInput } from './ExerciseInput'

const HINT_LABELS = ['Konzept', 'Methode', 'Konkreter Schritt']

export interface AnswerInfo {
  evaluation: Evaluation
  hintsUsed: number
  ms: number
}

export function ExerciseHeader({ exercise }: { exercise: Exercise }) {
  return (
    <div className="mb-3 flex flex-wrap items-center gap-2">
      <OriginBadge origin={exercise.origin} />
      <Pill className="bg-paper-2 text-ink-3">{SKILL_LABELS[exercise.skill]}</Pill>
      {exercise.type === 'mc' && exercise.variant === 'fehler' && <Pill className="bg-bad-soft text-bad">Fehler finden</Pill>}
      {exercise.type === 'selfcheck' && <Pill className="bg-xp/15 text-ink-2">Selbstkontrolle</Pill>}
    </div>
  )
}

export function ExercisePrompt({ exercise }: { exercise: Exercise }) {
  return (
    <div className="space-y-3">
      {exercise.context && (
        <div className="rounded-2xl bg-paper-2 p-4 text-sm leading-relaxed text-ink-2">
          <Rich text={exercise.context} />
        </div>
      )}
      <Rich as="p" text={exercise.prompt} className="text-lg leading-relaxed font-medium" />
      {exercise.type === 'mc' && exercise.display && <TeX tex={exercise.display} className="rounded-2xl bg-paper-2 px-3 text-xl" />}
    </div>
  )
}

export function ExercisePlayer({ exercise, onAnswered, onNext, nextLabel = 'Weiter' }: { exercise: Exercise; onAnswered: (info: AnswerInfo) => void; onNext: () => void; nextLabel?: string }) {
  const [response, setResponse] = useState<Response>(() => emptyResponse(exercise))
  const [hints, setHints] = useState(0)
  const [result, setResult] = useState<Evaluation | null>(null)
  const [invalid, setInvalid] = useState<string | null>(null)
  const [stepResults, setStepResults] = useState<(CheckResult | undefined)[]>([])
  const [selfRevealed, setSelfRevealed] = useState(false)
  const [shake, setShake] = useState(false)
  const started = useRef(Date.now())
  const nextRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    if (result) nextRef.current?.focus()
  }, [result])

  const finish = (ev: Evaluation) => {
    setResult(ev)
    if (!ev.correct) {
      setShake(true)
      setTimeout(() => setShake(false), 350)
    }
    onAnswered({ evaluation: ev, hintsUsed: hints, ms: Date.now() - started.current })
  }

  // Erster Schritt ohne Ergebnis (über die Schritte der Aufgabe, nicht über die bisher gefüllte Ergebnisliste)
  const activeStep = exercise.type === 'steps' ? exercise.steps.findIndex((_, i) => !stepResults[i]) : undefined
  const currentStep = activeStep === -1 ? undefined : activeStep

  const check = () => {
    if (result) return
    setInvalid(null)
    if (exercise.type === 'steps' && response.type === 'steps') {
      const i = currentStep ?? 0
      const r = evaluateStep(exercise.steps[i]!, response.steps[i])
      if (r.verdict === 'invalid') {
        setInvalid(r.message)
        return
      }
      const next = [...stepResults]
      next[i] = r
      setStepResults(next)
      if (next.filter(Boolean).length === exercise.steps.length) {
        const w = stepWeights(exercise)
        const score = next.reduce((s, x, j) => s + (x?.correct ? w[j]! : 0), 0)
        const correct = next.every((x) => x?.correct)
        const nRight = next.filter((x) => x?.correct).length
        finish({ verdict: correct ? 'exact' : 'wrong', correct, score, stepResults: next as CheckResult[], message: correct ? 'Alle Schritte richtig!' : `${nRight} von ${exercise.steps.length} Schritten auf Anhieb richtig.` })
      }
      return
    }
    if (exercise.type === 'selfcheck') {
      setSelfRevealed(true)
      return
    }
    const ev = evaluate(exercise, response)
    if (ev.verdict === 'invalid') {
      setInvalid(ev.message)
      return
    }
    finish(ev)
  }

  const selfAssess = (score: number) => {
    if (response.type !== 'selfcheck') return
    const r: Response = { ...response, selfScore: score }
    setResponse(r)
    finish(evaluate(exercise, r))
  }

  const canHint = !result && hints < exercise.hints.length
  const checkLabel = exercise.type === 'steps' ? (currentStep !== undefined && currentStep < exercise.steps.length - 1 ? 'Schritt prüfen' : 'Prüfen') : exercise.type === 'selfcheck' ? 'Musterlösung zeigen' : 'Prüfen'

  return (
    <div className="space-y-5">
      <div>
        <ExerciseHeader exercise={exercise} />
        <ExercisePrompt exercise={exercise} />
      </div>

      <div className={shake ? 'anim-shake' : ''}>
        <ExerciseInput exercise={exercise} response={response} onChange={setResponse} reveal={!!result} disabled={!!result || selfRevealed} stepResults={stepResults} activeStep={exercise.type === 'steps' ? currentStep ?? exercise.steps.length : undefined} onSubmit={check} />
      </div>

      {invalid && (
        <p role="alert" className="rounded-xl bg-xp/15 px-4 py-2 text-sm text-ink-2">
          {invalid}
        </p>
      )}

      {hints > 0 && (
        <div className="space-y-2" aria-live="polite">
          {exercise.hints.slice(0, hints).map((h, i) => (
            <div key={i} className="anim-up flex gap-3 rounded-2xl border border-xp/40 bg-xp/10 p-3 text-sm">
              <Lightbulb className="mt-0.5 size-4 shrink-0 text-xp" aria-hidden />
              <div>
                <span className="font-semibold">Hinweis {i + 1} · {HINT_LABELS[i] ?? 'Tipp'}: </span>
                <Rich text={h} />
              </div>
            </div>
          ))}
        </div>
      )}

      {exercise.type === 'selfcheck' && selfRevealed && !result && (
        <div className="anim-up space-y-3 rounded-2xl border-2 border-ink-3 p-4">
          <p className="font-semibold">Musterlösung</p>
          {exercise.modelAnswer.map((m, i) => (
            <Rich key={i} as="p" text={m} className="text-ink-2" />
          ))}
          {exercise.keywords && (
            <div className="flex flex-wrap gap-2">
              {exercise.keywords.map((k) => (
                <Pill key={k} className="bg-paper-2 text-ink-2">
                  {k}
                </Pill>
              ))}
            </div>
          )}
          <p className="text-sm text-ink-3">Wie gut deckt sich deine Antwort mit der Musterlösung?</p>
          <div className="grid grid-cols-3 gap-2">
            <Button variant="secondary" onClick={() => selfAssess(0)}>Nicht</Button>
            <Button variant="secondary" onClick={() => selfAssess(0.5)}>Teilweise</Button>
            <Button variant="good" onClick={() => selfAssess(1)}>Vollständig</Button>
          </div>
        </div>
      )}

      {result && <Feedback exercise={exercise} result={result} />}

      <div className="sticky bottom-0 -mx-4 flex gap-3 border-t border-line bg-paper/95 px-4 py-3 backdrop-blur sm:static sm:mx-0 sm:border-0 sm:bg-transparent sm:px-0 sm:py-0">
        {!result ? (
          <>
            <Button variant="secondary" onClick={() => setHints((h) => h + 1)} disabled={!canHint} aria-label="Hinweis anzeigen">
              <Lightbulb className="size-5" aria-hidden />
              <span className="hidden sm:inline">Hinweis</span>
              {exercise.hints.length > 0 && <span className="text-xs text-ink-3">{hints}/{exercise.hints.length}</span>}
            </Button>
            {!(exercise.type === 'selfcheck' && selfRevealed) && (
              <Button className="flex-1" onClick={check}>
                {checkLabel}
              </Button>
            )}
          </>
        ) : (
          <Button ref={nextRef} className="flex-1" size="lg" variant={result.correct ? 'good' : 'primary'} onClick={onNext}>
            {nextLabel}
          </Button>
        )}
      </div>
    </div>
  )
}

export function correctAnswerText(exercise: Exercise): string | null {
  switch (exercise.type) {
    case 'numeric':
      return formatNumber(exercise.answer, { ...exercise.fmt, dec: Math.max(exercise.fmt.dec, exercise.fmt.kind === 'int' ? 0 : 4) })
    case 'formula':
      return `$${exercise.targetTex} = ${exercise.answerTex}$`
    default:
      return null
  }
}

export function Feedback({ exercise, result, compact }: { exercise: Exercise; result: Evaluation; compact?: boolean }) {
  const good = result.correct
  const formula = formulaById.get(exercise.formulaIds[0] ?? '')
  const answer = correctAnswerText(exercise)
  return (
    <section aria-live="polite" className={`anim-pop space-y-3 rounded-2xl border-2 p-4 ${good ? 'border-good bg-good-soft' : result.verdict === 'manual' ? 'border-xp bg-xp/10' : 'border-bad bg-bad-soft'}`}>
      <div className="flex items-center gap-2 text-lg font-bold">
        {good ? <CheckCircle2 className="size-6 text-good" aria-hidden /> : result.verdict === 'manual' ? <Sparkles className="size-6 text-xp" aria-hidden /> : <XCircle className="size-6 text-bad" aria-hidden />}
        <Rich text={result.message} />
      </div>
      {!good && result.diagnosis && (
        <p className="text-ink-2">
          <span className="font-semibold">Wahrscheinlicher Denkfehler: </span>
          <Rich text={result.diagnosis} />
        </p>
      )}
      {!good && answer && (
        <p>
          <span className="font-semibold">Richtige Lösung: </span>
          <Rich text={answer} />
        </p>
      )}
      {!compact && (
        <details open={!good} className="group">
          <summary className="flex cursor-pointer items-center gap-2 font-semibold">
            <BookOpen className="size-4" aria-hidden /> Lösungsweg
          </summary>
          <div className="mt-2 space-y-2 text-ink-2">
            {exercise.explanation.map((e, i) => (
              <Rich key={i} as="p" text={e} />
            ))}
            {!good && formula && isKnowledge(formula) && (
              <div className="rounded-xl bg-xp-soft/50 px-3 py-2">
                <p className="text-sm font-semibold">Zum Nachlesen: {formula.name}</p>
                <Rich as="p" className="text-sm" text={formula.definition ?? formula.intuition} />
              </div>
            )}
            {!good && formula?.tex && !isKnowledge(formula) && (
              <div>
                <p className="text-sm font-semibold">Relevante Formel: {formula.name}</p>
                <TeX tex={formula.tex} />
                {formula.assumptions[0] && <Rich as="p" className="text-sm" text={`Voraussetzung: ${formula.assumptions[0]}`} />}
              </div>
            )}
            {exercise.examTip && <Rich as="p" className="text-sm" text={`Klausurtipp: ${exercise.examTip}`} />}
            {!good && !exercise.examTip && formula?.mistakes[0] && <Rich as="p" className="text-sm" text={`So vermeidest du den Fehler in der Klausur: ${formula.mistakes[0]}`} />}
            {exercise.sources && <Sources sources={exercise.sources} />}
          </div>
        </details>
      )}
    </section>
  )
}
