/**
 * Fächerübersicht (/faecher): Fach wählen. Jedes Fach hat einen eigenen Lernpfad,
 * eigene Wiederholungen, Karteikarten und Klausuren. Das gewählte Fach steht in den
 * Einstellungen und wird mit dem übrigen Lernstand gespeichert bzw. synchronisiert.
 */
import { useNavigate } from 'react-router'
import { Check, Clock, GraduationCap } from 'lucide-react'
import { activeSubjectId, scopeFor } from '../content'
import { SUBJECTS, type SubjectId } from '../content/types'
import { localDay } from '../lib/dates'
import { isDue } from '../lib/srs'
import type { AppState } from '../lib/progress'
import { useStore } from '../state/store'
import { Card, PageHeader, Progress } from '../ui/kit'

function subjectStats(state: AppState, id: SubjectId) {
  const scope = scopeFor(id)
  const today = localDay()
  return {
    chapters: scope.chapters.length,
    cards: scope.formulas.length,
    lessonsDone: scope.lessons.filter((l) => state.lessons[l.id]).length,
    lessonsTotal: scope.lessons.length,
    due: scope.formulas.filter((f) => isDue(state.formula[f.id]?.srs, today)).length,
  }
}

export default function Subjects() {
  const { state, update } = useStore()
  const navigate = useNavigate()
  const active = activeSubjectId(state)
  const ids = Object.keys(SUBJECTS) as SubjectId[]

  const choose = (id: SubjectId) => {
    if (id !== active) update((s) => ({ ...s, settings: { ...s.settings, subject: id } }))
    navigate('/')
  }

  return (
    <div>
      <PageHeader title="Fächer" subtitle="Jedes Fach hat einen eigenen Lernpfad, eigene Wiederholungen, Karteikarten und Klausuren. XP, Level und Serie zählen fachübergreifend." />
      <ul className="grid gap-4 sm:grid-cols-2">
        {ids.map((id) => {
          const s = SUBJECTS[id]
          const isActive = id === active
          if (!s.available)
            return (
              <li key={id}>
                <Card className="flex h-full flex-col gap-2 border-dashed p-5 opacity-60">
                  <div className="flex items-center justify-between gap-2">
                    <h2 className="text-xl font-semibold">{s.title}</h2>
                    <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-paper-2 px-2.5 py-1 text-xs font-semibold text-ink-2">
                      <Clock className="size-3.5" aria-hidden /> In Vorbereitung
                    </span>
                  </div>
                  <p className="text-sm text-ink-2">{s.description}</p>
                </Card>
              </li>
            )
          const st = subjectStats(state, id)
          return (
            <li key={id}>
              <button
                type="button"
                onClick={() => choose(id)}
                aria-current={isActive ? 'true' : undefined}
                className={`block h-full w-full rounded-[var(--radius-card)] text-left transition hover:-translate-y-0.5 focus-visible:outline-offset-4 ${isActive ? 'ring-4 ring-ink' : ''}`}
              >
                <Card className="flex h-full flex-col gap-3 p-5">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex min-w-0 items-center gap-3">
                      <span className="grid size-11 shrink-0 place-items-center rounded-2xl bg-ink text-paper">
                        <GraduationCap className="size-6" aria-hidden />
                      </span>
                      <div className="min-w-0">
                        <h2 className="text-xl font-semibold">{s.title}</h2>
                        {s.term && <p className="text-xs text-ink-3">{s.term}</p>}
                      </div>
                    </div>
                    {isActive && (
                      <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-ink px-2.5 py-1 text-xs font-semibold text-paper">
                        <Check className="size-3.5" aria-hidden /> Aktiv
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-ink-2">{s.description}</p>
                  <div className="mt-auto space-y-1.5">
                    <Progress value={st.lessonsTotal ? st.lessonsDone / st.lessonsTotal : 0} label={`Lektionen ${s.title}`} />
                    <p className="text-xs text-ink-3">
                      {st.lessonsDone}/{st.lessonsTotal} Lektionen · {st.chapters} Kapitel · {st.cards} Karten
                      {st.due > 0 ? ` · ${st.due} fällig` : ''}
                    </p>
                  </div>
                </Card>
              </button>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
