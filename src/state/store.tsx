import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { evaluateAchievements, type Achievement } from '../lib/achievements'
import { loadState, saveState, type StorageLike } from '../lib/persistence'
import { initialState, type AppState } from '../lib/progress'

export interface Toast {
  id: number
  kind: 'xp' | 'achievement' | 'info'
  text: string
}

interface StoreValue {
  state: AppState
  /** Wendet eine reine Update-Funktion an, prüft Erfolge und speichert. */
  update: (fn: (s: AppState) => AppState) => void
  /** Wie update, gibt zusätzlich einen Wert aus der Update-Funktion zurück. */
  apply: <T>(fn: (s: AppState) => { state: AppState } & T) => T
  replace: (s: AppState) => void
  reset: () => void
  persistent: boolean
  toasts: Toast[]
  pushToast: (t: Omit<Toast, 'id'>) => void
}

const StoreContext = createContext<StoreValue | null>(null)

export function StoreProvider({ children, storage }: { children: ReactNode; storage?: StorageLike | null }) {
  const [{ initial, persistent }] = useState(() => {
    const r = storage === undefined ? loadState() : loadState(storage)
    return { initial: r.state, persistent: r.persistent }
  })
  const [state, setState] = useState<AppState>(initial)
  const stateRef = useRef(state)
  const [toasts, setToasts] = useState<Toast[]>([])
  const toastId = useRef(0)

  const pushToast = useCallback((t: Omit<Toast, 'id'>) => {
    const id = ++toastId.current
    setToasts((ts) => [...ts.slice(-2), { ...t, id }])
    setTimeout(() => setToasts((ts) => ts.filter((x) => x.id !== id)), 3200)
  }, [])

  const commit = useCallback(
    (next: AppState) => {
      const { state: withAch, unlocked } = evaluateAchievements(next)
      stateRef.current = withAch
      setState(withAch)
      if (storage === undefined) saveState(withAch)
      else saveState(withAch, storage)
      unlocked.forEach((a: Achievement) => pushToast({ kind: 'achievement', text: `Erfolg: ${a.title}` }))
    },
    [pushToast, storage],
  )

  const update = useCallback((fn: (s: AppState) => AppState) => commit(fn(stateRef.current)), [commit])

  const apply = useCallback(
    <T,>(fn: (s: AppState) => { state: AppState } & T): T => {
      const res = fn(stateRef.current)
      commit(res.state)
      return res
    },
    [commit],
  )

  const replace = useCallback((s: AppState) => commit(s), [commit])
  const reset = useCallback(() => commit(initialState()), [commit])

  // Darstellung (Dark Mode, reduzierte Animationen)
  useEffect(() => {
    const root = document.documentElement
    const mq = window.matchMedia?.('(prefers-color-scheme: dark)')
    const applyTheme = () => {
      const dark = state.settings.theme === 'dark' || (state.settings.theme === 'system' && !!mq?.matches)
      root.classList.toggle('dark', dark)
      root.classList.toggle('reduce-motion', state.settings.reduceMotion)
    }
    applyTheme()
    mq?.addEventListener?.('change', applyTheme)
    return () => mq?.removeEventListener?.('change', applyTheme)
  }, [state.settings.theme, state.settings.reduceMotion])

  const value = useMemo(() => ({ state, update, apply, replace, reset, persistent, toasts, pushToast }), [state, update, apply, replace, reset, persistent, toasts, pushToast])
  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>
}

export function useStore(): StoreValue {
  const v = useContext(StoreContext)
  if (!v) throw new Error('useStore außerhalb von StoreProvider')
  return v
}
