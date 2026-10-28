import type { ButtonHTMLAttributes, ReactNode, Ref } from 'react'
import { Link } from 'react-router'
import { PARTS, type PartId, type ValidationStatus, type Origin, ORIGIN_LABELS } from '../content/types'
import { MASTERY_LABELS, type MasteryLevel } from '../lib/mastery'
import { SOURCES } from '../content/sources'
import type { SourceRef } from '../content/types'
import { FileText } from 'lucide-react'

type Variant = 'primary' | 'secondary' | 'ghost' | 'good' | 'bad'

const variants: Record<Variant, string> = {
  primary: 'bg-ink text-paper hover:brightness-110 shadow-[0_3px_0_rgb(0_0_0/0.25)] active:translate-y-[2px] active:shadow-none',
  secondary: 'bg-paper text-ink border-2 border-line hover:border-ink-3 shadow-[0_3px_0_var(--color-line)] active:translate-y-[2px] active:shadow-none',
  ghost: 'text-ink-2 hover:bg-paper-2',
  good: 'bg-good text-white shadow-[0_3px_0_rgb(0_0_0/0.2)] active:translate-y-[2px] active:shadow-none',
  bad: 'bg-bad text-white shadow-[0_3px_0_rgb(0_0_0/0.2)] active:translate-y-[2px] active:shadow-none',
}

export function Button({ variant = 'primary', className = '', size = 'md', ...rest }: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant; size?: 'md' | 'lg' | 'sm'; ref?: Ref<HTMLButtonElement> }) {
  const sz = size === 'lg' ? 'min-h-14 px-6 text-lg' : size === 'sm' ? 'min-h-9 px-3 text-sm' : 'min-h-12 px-5'
  return <button className={`inline-flex items-center justify-center gap-2 rounded-2xl font-semibold transition disabled:opacity-40 ${sz} ${variants[variant]} ${className}`} {...rest} />
}

export function ButtonLink({ to, variant = 'primary', className = '', size = 'md', children }: { to: string; variant?: Variant; className?: string; size?: 'md' | 'lg' | 'sm'; children: ReactNode }) {
  const sz = size === 'lg' ? 'min-h-14 px-6 text-lg' : size === 'sm' ? 'min-h-9 px-3 text-sm' : 'min-h-12 px-5'
  return (
    <Link to={to} className={`inline-flex items-center justify-center gap-2 rounded-2xl font-semibold transition ${sz} ${variants[variant]} ${className}`}>
      {children}
    </Link>
  )
}

export function Card({ children, className = '', as: As = 'div' }: { children: ReactNode; className?: string; as?: 'div' | 'section' | 'article' }) {
  return <As className={`rounded-[var(--radius-card)] border border-line bg-paper shadow-[var(--shadow-card)] ${className}`}>{children}</As>
}

export function Progress({ value, className = '', tone = 'ink', label }: { value: number; className?: string; tone?: 'ink' | 'good' | 'xp' | 'fin' | 'rw' | 'jb'; label?: string }) {
  const pct = Math.max(0, Math.min(1, value)) * 100
  const color = { ink: 'bg-ink', good: 'bg-good', xp: 'bg-xp', fin: 'bg-fin', rw: 'bg-rw', jb: 'bg-jb' }[tone]
  return (
    <div className={`h-3 w-full overflow-hidden rounded-full bg-paper-2 ${className}`} role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(pct)} aria-label={label}>
      <div className={`h-full rounded-full ${color} transition-[width] duration-500`} style={{ width: `${pct}%` }} />
    </div>
  )
}

export function Ring({ value, size = 56, stroke = 6, tone = 'var(--color-good)', children }: { value: number; size?: number; stroke?: number; tone?: string; children?: ReactNode }) {
  const r = (size - stroke) / 2
  const c = 2 * Math.PI * r
  const v = Math.max(0, Math.min(1, value))
  return (
    <div className="relative inline-grid place-items-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90" aria-hidden>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--color-paper-2)" strokeWidth={stroke} />
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={tone} strokeWidth={stroke} strokeLinecap="round" strokeDasharray={c} strokeDashoffset={c * (1 - v)} style={{ transition: 'stroke-dashoffset .6s ease' }} />
      </svg>
      <div className="absolute inset-0 grid place-items-center text-sm font-bold">{children}</div>
    </div>
  )
}

export function Pill({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold ${className}`}>{children}</span>
}

export const partTone: Record<PartId, { text: string; bg: string; soft: string; border: string; varColor: string }> = {
  fin: { text: 'text-fin', bg: 'bg-fin', soft: 'bg-fin-soft', border: 'border-fin', varColor: 'var(--color-fin)' },
  rw: { text: 'text-rw', bg: 'bg-rw', soft: 'bg-rw-soft', border: 'border-rw', varColor: 'var(--color-rw)' },
  jb: { text: 'text-jb', bg: 'bg-jb', soft: 'bg-jb-soft', border: 'border-jb', varColor: 'var(--color-jb)' },
}

export function PartBadge({ part }: { part: PartId }) {
  const t = partTone[part]
  return <Pill className={`${t.soft} ${t.text}`}>{PARTS[part].title}</Pill>
}

export function StatusBadge({ status }: { status: ValidationStatus }) {
  if (status === 'geprüft') return <Pill className="bg-good-soft text-good">geprüft</Pill>
  if (status === 'abgeleitet') return <Pill className="bg-paper-2 text-ink-2">abgeleitet</Pill>
  return <Pill className="bg-bad-soft text-bad">ungeprüft</Pill>
}

export function OriginBadge({ origin }: { origin: Origin }) {
  const cls = origin === 'klausur' ? 'bg-ink text-paper' : origin === 'tutorium' ? 'bg-fin-soft text-fin' : origin === 'generiert' ? 'bg-xp/15 text-ink-2' : 'bg-paper-2 text-ink-2'
  return <Pill className={cls}>{ORIGIN_LABELS[origin]}</Pill>
}

export function MasteryBadge({ level }: { level: MasteryLevel }) {
  const cls = level === 'beherrscht' ? 'bg-good text-white' : level === 'gefestigt' ? 'bg-good-soft text-good' : level === 'lernend' ? 'bg-xp/20 text-ink-2' : 'bg-paper-2 text-ink-3'
  return <Pill className={cls}>{MASTERY_LABELS[level]}</Pill>
}

export function Sources({ sources }: { sources: SourceRef[] }) {
  if (!sources.length) return null
  return (
    <ul className="space-y-1 text-sm text-ink-3">
      {sources.map((s, i) => (
        <li key={i} className="flex items-start gap-2">
          <FileText className="mt-0.5 size-4 shrink-0" aria-hidden />
          <span>
            {SOURCES[s.doc]?.title ?? s.doc}, {s.pages.includes('–') || s.pages.includes(',') ? 'S.' : 'S.'} {s.pages}
            {s.note ? ` – ${s.note}` : ''}
          </span>
        </li>
      ))}
    </ul>
  )
}

export function PageHeader({ title, subtitle, children }: { title: string; subtitle?: string; children?: ReactNode }) {
  return (
    <header className="mb-6 flex flex-wrap items-end justify-between gap-3">
      <div>
        <h1 className="text-3xl font-semibold sm:text-4xl">{title}</h1>
        {subtitle && <p className="mt-1 text-ink-3">{subtitle}</p>}
      </div>
      {children}
    </header>
  )
}

export function Empty({ title, text, action }: { title: string; text: string; action?: ReactNode }) {
  return (
    <div className="rounded-[var(--radius-card)] border-2 border-dashed border-line p-6 text-center">
      <p className="font-display text-xl">{title}</p>
      <p className="mt-1 text-ink-3">{text}</p>
      {action && <div className="mt-4">{action}</div>}
    </div>
  )
}
