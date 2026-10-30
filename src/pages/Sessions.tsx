import { useState } from 'react'
import { useParams, useSearchParams } from 'react-router'
import { cardPath, chapters, formulaById } from '../content'
import { buildArenaSession, buildBossSession, buildLessonSession, buildMixedSession, buildPracticeSession, buildReviewSession, buildWeaknessSession, type MixScope, type Session } from '../lib/engine'
import { useStore } from '../state/store'
import { SessionPlayer } from '../ui/session/SessionPlayer'
import { ButtonLink, Empty } from '../ui/kit'

function useOnce(build: () => Session | null) {
  // Sitzung wird einmal beim Öffnen zusammengestellt und bleibt danach stabil.
  const [session] = useState(build)
  return session
}

export function LessonPage() {
  const { id = '' } = useParams()
  const { state } = useStore()
  const session = useOnce(() => buildLessonSession(state, id))
  if (!session) return <NotFound />
  return <SessionPlayer session={session} exitTo="/lernpfad" />
}

export function BossPage() {
  const { chapterId = '' } = useParams()
  const [params] = useSearchParams()
  const { state } = useStore()
  const session = useOnce(() => buildBossSession(state, chapterId, params.get('timer') === '1'))
  if (!session) return <NotFound />
  return <SessionPlayer session={session} exitTo="/lernpfad" />
}

export function PracticePage() {
  const { formulaId = '' } = useParams()
  const { state } = useStore()
  const session = useOnce(() => buildPracticeSession(state, decodeURIComponent(formulaId)))
  if (!session) return <NotFound />
  const f = formulaById.get(decodeURIComponent(formulaId))
  return <SessionPlayer session={session} exitTo={f ? cardPath(f) : '/formeln'} />
}

/** Gemischtes Training: /training?art=gemischt|wissen|formel&kapitel=… */
export function MixedTrainingPage() {
  const [params] = useSearchParams()
  const { state } = useStore()
  const art = params.get('art')
  const scope: MixScope = art === 'wissen' || art === 'formel' ? art : 'gemischt'
  const ids = (params.get('kapitel') ?? '').split(',').filter((id) => chapters.some((c) => c.id === id))
  const session = useOnce(() => buildMixedSession(state, { scope, ...(ids.length ? { chapterIds: ids } : {}) }))
  const back = scope === 'wissen' ? '/wissen' : scope === 'formel' ? '/formeln' : '/'
  if (!session) return <Empty title="Keine passenden Aufgaben" text="Für diese Auswahl gibt es noch keine Aufgaben." action={<ButtonLink to={back}>Zurück</ButtonLink>} />
  return <SessionPlayer session={session} exitTo={back} />
}

export function ReviewStartPage() {
  const [params] = useSearchParams()
  const { state } = useStore()
  const typ = params.get('typ')
  const session = useOnce(() => (typ === 'schwaechen' ? buildWeaknessSession(state) : buildReviewSession(state)))
  if (!session)
    return (
      <Empty
        title={typ === 'schwaechen' ? 'Keine Schwächen gefunden' : 'Heute ist nichts fällig'}
        text={typ === 'schwaechen' ? 'Bearbeite zuerst ein paar Lektionen – danach erkennt die App, wo du noch unsicher bist.' : 'Deine nächsten Wiederholungen siehst du im Bereich „Wiederholen“.'}
        action={<ButtonLink to="/wiederholen">Zurück</ButtonLink>}
      />
    )
  return <SessionPlayer session={session} exitTo="/wiederholen" />
}

export function ArenaTrainingPage() {
  const [params] = useSearchParams()
  const { state } = useStore()
  const ids = (params.get('kapitel') ?? '').split(',').filter((id) => chapters.some((c) => c.id === id))
  const n = Math.max(3, Math.min(20, Number(params.get('n') ?? 8)))
  const session = useOnce(() => buildArenaSession(state, ids.length ? ids : chapters.map((c) => c.id), n, params.get('timer') === '1'))
  if (!session) return <NotFound />
  return <SessionPlayer session={session} exitTo="/arena" />
}

function NotFound() {
  return <Empty title="Nicht gefunden" text="Diese Lektion oder Übung gibt es nicht (mehr)." action={<ButtonLink to="/">Zur Startseite</ButtonLink>} />
}
