/**
 * Cloud-Modus: Anmeldung mit Google, danach Lernstand aus Firestore (mit Browser-Cache).
 * Firebase wird erst hier dynamisch geladen.
 */
import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { CloudOff, Loader2, LogIn } from 'lucide-react'
import { firebaseConfig } from '../lib/cloud/config'
import { SyncController, type SyncStatus } from '../lib/cloud/sync'
import { defaultStorage } from '../lib/persistence'
import type { AppState } from '../lib/progress'
import { Button } from '../ui/kit'
import { Logo } from '../ui/Layout'
import { CloudContext, type CloudAccount, type CloudValue } from './cloud'
import { StoreProvider } from './store'

type FirebaseModule = typeof import('../lib/cloud/firebase')

let fbPromise: Promise<FirebaseModule> | null = null
function loadFirebase(): Promise<FirebaseModule> {
  fbPromise ??= import('../lib/cloud/firebase').then((m) => {
    m.init(firebaseConfig!)
    return m
  })
  return fbPromise
}

type Phase =
  | { kind: 'init' }
  | { kind: 'signedOut'; error?: string }
  | { kind: 'loading'; account: CloudAccount }
  | { kind: 'ready'; account: CloudAccount; ctrl: SyncController; initial: AppState }
  | { kind: 'failed'; message: string }

export function CloudRoot({ children }: { children: ReactNode }) {
  const [phase, setPhase] = useState<Phase>({ kind: 'init' })
  const [busy, setBusy] = useState(false)
  const ctrlRef = useRef<SyncController | null>(null)

  useEffect(() => {
    let unsub: (() => void) | undefined
    let alive = true
    loadFirebase()
      .then((fb) => {
        if (!alive) return
        unsub = fb.watchAccount(async (acc) => {
          ctrlRef.current?.stop(false)
          ctrlRef.current = null
          if (!acc) {
            setPhase((p) => (p.kind === 'signedOut' ? p : { kind: 'signedOut' }))
            return
          }
          const account: CloudAccount = { uid: acc.uid, email: acc.email, name: acc.name }
          setPhase({ kind: 'loading', account })
          const ctrl = new SyncController(acc.uid, fb.firestoreRemote(acc.uid), defaultStorage())
          ctrlRef.current = ctrl
          try {
            const initial = await ctrl.start()
            if (ctrlRef.current === ctrl) setPhase({ kind: 'ready', account, ctrl, initial })
          } catch (e) {
            if (ctrlRef.current === ctrl) setPhase({ kind: 'failed', message: e instanceof Error ? e.message : String(e) })
          }
        })
      })
      .catch(() => alive && setPhase({ kind: 'failed', message: 'Die Anmeldung konnte nicht geladen werden. Bitte prüfe deine Internetverbindung und lade die Seite neu.' }))
    return () => {
      alive = false
      unsub?.()
      ctrlRef.current?.stop(false)
    }
  }, [])

  // Vor dem Laden des Lernstands gibt es noch keine Einstellung → Systemeinstellung (hell/dunkel) verwenden.
  const ready = phase.kind === 'ready'
  useEffect(() => {
    if (ready) return
    const mq = window.matchMedia?.('(prefers-color-scheme: dark)')
    const apply = () => document.documentElement.classList.toggle('dark', !!mq?.matches)
    apply()
    mq?.addEventListener?.('change', apply)
    return () => mq?.removeEventListener?.('change', apply)
  }, [ready])

  const signIn = async () => {
    setBusy(true)
    try {
      const fb = await loadFirebase()
      await fb.signInWithGoogle()
    } catch (e) {
      const fb = await loadFirebase().catch(() => null)
      const msg = fb ? fb.authErrorMessage(e) : 'Keine Verbindung.'
      if (msg) setPhase({ kind: 'signedOut', error: msg })
    } finally {
      setBusy(false)
    }
  }

  if (phase.kind === 'ready') return <ReadyApp key={phase.account.uid} phase={phase}>{children}</ReadyApp>

  return (
    <div className="grid min-h-dvh place-items-center bg-paper px-4 py-10">
      <div className="w-full max-w-md space-y-6 text-center">
        <Logo className="justify-center text-2xl" />
        {phase.kind === 'init' || phase.kind === 'loading' ? (
          <p className="flex items-center justify-center gap-2 text-ink-2" role="status">
            <Loader2 className="size-5 animate-spin" aria-hidden />
            {phase.kind === 'loading' ? 'Dein Lernstand wird geladen …' : 'Einen Moment …'}
          </p>
        ) : phase.kind === 'failed' ? (
          <div className="space-y-4" role="alert">
            <p className="flex items-center justify-center gap-2 font-semibold">
              <CloudOff className="size-5" aria-hidden /> Laden fehlgeschlagen
            </p>
            <p className="text-sm text-ink-2">{phase.message}</p>
            <Button onClick={() => location.reload()}>Neu laden</Button>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="space-y-2">
              <h1 className="font-display text-3xl font-semibold">Formeln lernen wie Vokabeln</h1>
              <p className="text-ink-2">Finanzierung, Rechnungswesen und Jahresabschluss in kurzen Lektionen. Melde dich an, damit dein Fortschritt auf allen Geräten da ist.</p>
            </div>
            <Button size="lg" className="w-full" onClick={signIn} disabled={busy}>
              {busy ? <Loader2 className="size-5 animate-spin" aria-hidden /> : <LogIn className="size-5" aria-hidden />}
              Mit Google anmelden
            </Button>
            {phase.error && (
              <p role="alert" className="text-sm text-bad">
                {phase.error}
              </p>
            )}
            <p className="text-xs leading-relaxed text-ink-3">
              Gespeichert werden dein Name und deine E-Mail-Adresse aus dem Google-Konto (für die Anmeldung) sowie dein Lernfortschritt. Das läuft über Google Firebase. Kein Tracking, keine Werbung. In den Einstellungen kannst du alles wieder löschen.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

function ReadyApp({ phase, children }: { phase: Extract<Phase, { kind: 'ready' }>; children: ReactNode }) {
  const { ctrl, account, initial } = phase
  const [status, setStatus] = useState<SyncStatus>(ctrl.status)

  useEffect(() => ctrl.onStatus(setStatus), [ctrl])

  // Andere Geräte: beim Zurückkehren in den Tab abgleichen; beim Verlassen sofort speichern.
  useEffect(() => {
    const onVisibility = () => void (document.visibilityState === 'visible' ? ctrl.refresh() : ctrl.flush())
    const onOnline = () => void ctrl.refresh()
    const onHide = () => void ctrl.flush()
    document.addEventListener('visibilitychange', onVisibility)
    window.addEventListener('online', onOnline)
    window.addEventListener('pagehide', onHide)
    // Regelmäßig erneut versuchen, falls offline oder fehlgeschlagen
    const retry = setInterval(() => {
      if (ctrl.status === 'offline' || ctrl.status === 'error') void ctrl.refresh()
    }, 30_000)
    return () => {
      document.removeEventListener('visibilitychange', onVisibility)
      window.removeEventListener('online', onOnline)
      window.removeEventListener('pagehide', onHide)
      clearInterval(retry)
    }
  }, [ctrl])

  const onCommit = useCallback((s: AppState) => ctrl.commit(s), [ctrl])
  const subscribeExternal = useCallback((fn: (s: AppState) => void) => ctrl.onRemoteState(fn), [ctrl])

  const value = useMemo<CloudValue>(
    () => ({
      account,
      status,
      hasUnsyncedChanges: () => ctrl.hasUnsyncedChanges,
      syncNow: () => ctrl.refresh(),
      signOut: async () => {
        await Promise.race([ctrl.flush(), new Promise((r) => setTimeout(r, 5000))])
        if (ctrl.hasUnsyncedChanges && !confirm('Einige Änderungen sind noch nicht gespeichert (keine Verbindung). Trotzdem abmelden? Sie gehen dann verloren.')) return
        ctrl.stop(true)
        const fb = await loadFirebase()
        await fb.signOut()
      },
      deleteAccount: async () => {
        const fb = await loadFirebase()
        await ctrl.deleteEverything()
        try {
          await fb.deleteAuthUser()
        } finally {
          await fb.signOut().catch(() => {})
        }
      },
    }),
    [account, status, ctrl],
  )

  return (
    <CloudContext.Provider value={value}>
      <StoreProvider initialState={initial} onCommit={onCommit} subscribeExternal={subscribeExternal}>
        {children}
      </StoreProvider>
    </CloudContext.Provider>
  )
}
