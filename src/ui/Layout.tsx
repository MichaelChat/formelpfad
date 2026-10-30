import { NavLink, Outlet, useLocation } from 'react-router'
import { BarChart3, BookOpenText, Home, Map, RefreshCcw, Settings, Swords } from 'lucide-react'
import { useStore } from '../state/store'
import { STATUS_LABELS, useCloud } from '../state/cloud'
import { dueFormulas } from '../lib/engine'
import { useMemo } from 'react'

const NAV = [
  { to: '/', label: 'Home', icon: Home, end: true },
  { to: '/lernpfad', label: 'Lernpfad', icon: Map },
  { to: '/formeln', label: 'Formeln', icon: BookOpenText },
  { to: '/wiederholen', label: 'Wiederholen', icon: RefreshCcw, badge: 'due' as const },
  { to: '/arena', label: 'Klausur-Arena', short: 'Arena', icon: Swords },
  { to: '/fortschritt', label: 'Fortschritt', icon: BarChart3, desktopOnly: true },
  { to: '/einstellungen', label: 'Einstellungen', icon: Settings, desktopOnly: true },
]

export function Logo({ className = '' }: { className?: string }) {
  return (
    <span className={`inline-flex items-center gap-2 font-display text-xl font-semibold ${className}`}>
      <svg viewBox="0 0 32 32" className="size-8" aria-hidden>
        <rect width="32" height="32" rx="9" fill="var(--color-ink)" />
        <path d="M9 22c3-1 4-4 5-8s2-7 6-7" stroke="var(--color-paper)" strokeWidth="2.6" fill="none" strokeLinecap="round" />
        <circle cx="9" cy="22" r="2.4" fill="var(--color-xp)" />
        <circle cx="20" cy="7" r="2.4" fill="var(--color-good)" />
        <path d="M11 15h8" stroke="var(--color-paper)" strokeWidth="2.2" strokeLinecap="round" />
      </svg>
      Formelpfad
    </span>
  )
}

export function Layout() {
  const { state, toasts, persistent } = useStore()
  const cloud = useCloud()
  const syncProblem = cloud && (cloud.status === 'offline' || cloud.status === 'error')
  const due = useMemo(() => dueFormulas(state).length, [state])
  const location = useLocation()
  const inSession = /^\/(lektion|boss|ueben|session|arena\/klausur|arena\/training|wiederholen\/start)/.test(location.pathname)

  return (
    <div className="min-h-dvh md:grid md:grid-cols-[15rem_1fr] lg:grid-cols-[17rem_1fr]">
      <a href="#main" className="sr-only focus:not-sr-only focus:absolute focus:left-3 focus:top-3 focus:z-50 focus:rounded-xl focus:bg-ink focus:px-4 focus:py-2 focus:text-paper">
        Zum Inhalt springen
      </a>
      {/* Desktop-Navigation */}
      <aside className={`sticky top-0 hidden h-dvh flex-col gap-1 border-r border-line bg-paper-2/40 p-4 md:flex ${inSession ? 'md:hidden' : ''}`}>
        <NavLink to="/" className="mb-6 px-2">
          <Logo />
        </NavLink>
        <nav aria-label="Hauptnavigation" className="flex flex-col gap-1">
          {NAV.map((n) => (
            <NavLink key={n.to} to={n.to} end={n.end} className={({ isActive }) => `flex min-h-12 items-center gap-3 rounded-2xl px-3 font-semibold transition ${isActive ? 'bg-ink text-paper' : 'text-ink-2 hover:bg-paper-2'}`}>
              <n.icon className="size-5" aria-hidden />
              <span className="flex-1">{n.label}</span>
              {n.badge === 'due' && due > 0 && <span className="rounded-full bg-flame px-2 text-xs text-white">{due}</span>}
            </NavLink>
          ))}
        </nav>
        <p className="mt-auto px-2 text-xs leading-relaxed text-ink-3">
          {cloud ? `Angemeldet${cloud.account.email ? ` als ${cloud.account.email}` : ''} · ${STATUS_LABELS[cloud.status]}` : persistent ? 'Fortschritt wird lokal in diesem Browser gespeichert.' : 'Speichern im Browser ist nicht möglich (z. B. privates Fenster). Fortschritt geht beim Schließen verloren.'}
        </p>
      </aside>

      <div className={`min-w-0 ${inSession && 'md:col-span-2'}`}>
        <main id="main" className={`mx-auto w-full max-w-5xl px-4 pt-4 sm:px-6 md:pt-8 ${inSession ? 'pb-10' : 'pb-28 md:pb-12'}`}>
          <Outlet />
        </main>
      </div>

      {/* Mobile-Navigation */}
      {!inSession && (
        <nav aria-label="Hauptnavigation" className="fixed inset-x-0 bottom-0 z-30 grid grid-cols-5 border-t border-line bg-paper/95 pb-[env(safe-area-inset-bottom)] backdrop-blur md:hidden">
          {NAV.filter((n) => !n.desktopOnly).map((n) => (
            <NavLink key={n.to} to={n.to} end={n.end} className={({ isActive }) => `relative flex min-h-16 flex-col items-center justify-center gap-0.5 text-[11px] font-semibold ${isActive ? 'text-ink' : 'text-ink-3'}`}>
              {({ isActive }) => (
                <>
                  <span className={`grid h-8 w-12 place-items-center rounded-full transition ${isActive ? 'bg-ink text-paper' : ''}`}>
                    <n.icon className="size-5" aria-hidden />
                  </span>
                  {n.short ?? n.label}
                  {n.badge === 'due' && due > 0 && <span className="absolute right-[18%] top-1.5 rounded-full bg-flame px-1.5 text-[10px] text-white">{due}</span>}
                </>
              )}
            </NavLink>
          ))}
        </nav>
      )}

      {syncProblem && (
        <div role="status" className="fixed left-1/2 top-2 z-40 -translate-x-1/2 rounded-full bg-paper-2 px-3 py-1 text-xs font-semibold text-ink-2 shadow-[var(--shadow-card)] md:hidden">
          {cloud.status === 'offline' ? 'Offline – wird später gespeichert' : 'Speichern fehlgeschlagen'}
        </div>
      )}

      <div className="pointer-events-none fixed inset-x-0 top-3 z-50 flex flex-col items-center gap-2 px-4" aria-live="polite">
        {toasts.map((t) => (
          <div key={t.id} className={`anim-pop pointer-events-auto rounded-2xl px-4 py-2 font-semibold shadow-[var(--shadow-lift)] ${t.kind === 'achievement' ? 'bg-xp text-ink' : 'bg-ink text-paper'}`}>
            {t.text}
          </div>
        ))}
      </div>
    </div>
  )
}
