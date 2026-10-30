import { useRef, useState } from 'react'
import { Cloud, CloudOff, Download, LogOut, RefreshCw, Upload, Trash2, UserX } from 'lucide-react'
import { GOAL_LABELS, XP_RULES, type GoalKind } from '../lib/gamification'
import { exportState, importState } from '../lib/persistence'
import { useStore } from '../state/store'
import { STATUS_LABELS, useCloud } from '../state/cloud'
import { Button, Card, PageHeader } from '../ui/kit'
import { Logo } from '../ui/Layout'

const GOAL_PRESETS: Record<GoalKind, number[]> = { xp: [30, 50, 100, 150], exercises: [5, 10, 20, 30], minutes: [10, 15, 30, 45] }

export default function Settings() {
  const { state, update, replace, reset, persistent, pushToast } = useStore()
  const cloud = useCloud()
  const [accountBusy, setAccountBusy] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)
  const [importError, setImportError] = useState<string | null>(null)
  const s = state.settings
  const set = (patch: Partial<typeof s>) => update((st) => ({ ...st, settings: { ...st.settings, ...patch } }))

  const doExport = () => {
    const blob = new Blob([exportState(state)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `formelpfad-lernstand-${new Date().toISOString().slice(0, 10)}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  const doImport = async (file: File) => {
    const res = importState(await file.text())
    if (!res.ok) {
      setImportError(res.error)
      return
    }
    if (confirm('Den aktuellen Lernstand durch die Datei ersetzen? Der bisherige Stand geht dabei verloren (exportiere ihn vorher, falls du ihn behalten möchtest).')) {
      replace(res.state)
      setImportError(null)
      pushToast({ kind: 'info', text: 'Lernstand importiert' })
    }
  }

  return (
    <div className="mx-auto max-w-2xl space-y-5">
      <PageHeader title="Einstellungen" />

      {cloud && (
        <Card className="space-y-4 p-5">
          <h2 className="text-xl font-semibold">Konto</h2>
          <div>
            <p className="font-semibold">{cloud.account.name ?? 'Angemeldet'}</p>
            {cloud.account.email && <p className="text-sm text-ink-2">{cloud.account.email}</p>}
          </div>
          <p className="flex items-center gap-2 text-sm" role="status">
            {cloud.status === 'offline' || cloud.status === 'error' ? <CloudOff className="size-4 text-bad" aria-hidden /> : <Cloud className="size-4 text-good" aria-hidden />}
            {STATUS_LABELS[cloud.status]}
          </p>
          <div className="flex flex-wrap gap-2">
            <Button variant="secondary" disabled={accountBusy} onClick={() => void cloud.syncNow()}>
              <RefreshCw className="size-5" aria-hidden /> Jetzt abgleichen
            </Button>
            <Button
              variant="secondary"
              disabled={accountBusy}
              onClick={async () => {
                setAccountBusy(true)
                try {
                  await cloud.signOut()
                } finally {
                  setAccountBusy(false)
                }
              }}
            >
              <LogOut className="size-5" aria-hidden /> Abmelden
            </Button>
            <Button
              variant="bad"
              disabled={accountBusy}
              onClick={async () => {
                if (!confirm('Konto und gesamten Lernstand endgültig löschen? Das kann nicht rückgängig gemacht werden. Tipp: Vorher unten „Exportieren“, wenn du den Stand behalten möchtest.')) return
                setAccountBusy(true)
                try {
                  await cloud.deleteAccount()
                } catch {
                  pushToast({ kind: 'info', text: 'Löschen fehlgeschlagen – bitte erneut versuchen' })
                } finally {
                  setAccountBusy(false)
                }
              }}
            >
              <UserX className="size-5" aria-hidden /> Konto löschen
            </Button>
          </div>
          <p className="text-xs text-ink-3">Beim Abmelden wird der Zwischenspeicher in diesem Browser gelöscht. Dein Fortschritt bleibt in deinem Konto.</p>
        </Card>
      )}

      <Card className="space-y-4 p-5">
        <h2 className="text-xl font-semibold">Profil</h2>
        <label className="block">
          <span className="mb-1 block text-sm font-medium">Vorname für die Begrüßung (optional)</span>
          <input value={s.name} onChange={(e) => set({ name: e.target.value.slice(0, 30) })} className="min-h-12 w-full rounded-2xl border-2 border-line bg-paper px-3 outline-none focus:border-ink-3" placeholder="z. B. Alex" />
        </label>
      </Card>

      <Card className="space-y-4 p-5">
        <h2 className="text-xl font-semibold">Tagesziel</h2>
        <div className="flex flex-wrap gap-2" role="radiogroup" aria-label="Art des Tagesziels">
          {(Object.keys(GOAL_PRESETS) as GoalKind[]).map((k) => (
            <button key={k} role="radio" aria-checked={s.dailyGoal.kind === k} onClick={() => set({ dailyGoal: { kind: k, target: GOAL_PRESETS[k][1]! } })} className={`min-h-10 rounded-full border-2 px-4 text-sm font-semibold ${s.dailyGoal.kind === k ? 'border-ink bg-ink text-paper' : 'border-line'}`}>
              {GOAL_LABELS[k]}
            </button>
          ))}
        </div>
        <div className="flex flex-wrap gap-2" role="radiogroup" aria-label="Höhe des Tagesziels">
          {GOAL_PRESETS[s.dailyGoal.kind].map((v) => (
            <button key={v} role="radio" aria-checked={s.dailyGoal.target === v} onClick={() => set({ dailyGoal: { ...s.dailyGoal, target: v } })} className={`min-h-12 rounded-2xl border-2 px-5 font-semibold ${s.dailyGoal.target === v ? 'border-ink bg-paper-2' : 'border-line'}`}>
              {v} {GOAL_LABELS[s.dailyGoal.kind]}
            </button>
          ))}
        </div>
      </Card>

      <Card className="space-y-4 p-5">
        <h2 className="text-xl font-semibold">Darstellung</h2>
        <div className="flex flex-wrap gap-2" role="radiogroup" aria-label="Farbschema">
          {(['system', 'light', 'dark'] as const).map((t) => (
            <button key={t} role="radio" aria-checked={s.theme === t} onClick={() => set({ theme: t })} className={`min-h-10 rounded-full border-2 px-4 text-sm font-semibold ${s.theme === t ? 'border-ink bg-ink text-paper' : 'border-line'}`}>
              {t === 'system' ? 'Wie System' : t === 'light' ? 'Hell' : 'Dunkel'}
            </button>
          ))}
        </div>
        <label className="flex min-h-12 items-center gap-3">
          <input type="checkbox" checked={s.reduceMotion} onChange={(e) => set({ reduceMotion: e.target.checked })} className="size-5" />
          Animationen reduzieren
        </label>
      </Card>

      <Card className="space-y-3 p-5">
        <h2 className="text-xl font-semibold">Lernstand</h2>
        <p className="text-sm text-ink-2">{cloud ? 'Dein Fortschritt wird in deinem Konto gespeichert und auf allen Geräten abgeglichen, auf denen du angemeldet bist. Zusätzlich kannst du ihn als Datei sichern.' : persistent ? 'Dein Fortschritt wird nur lokal in diesem Browser gespeichert. Es gibt keine automatische Synchronisation zwischen Geräten – mit Export und Import kannst du den Stand manuell übertragen.' : 'In diesem Browser kann nichts gespeichert werden (z. B. privates Fenster). Exportiere deinen Stand vor dem Schließen.'}</p>
        <div className="flex flex-wrap gap-2">
          <Button variant="secondary" onClick={doExport}>
            <Download className="size-5" aria-hidden /> Exportieren
          </Button>
          <Button variant="secondary" onClick={() => fileRef.current?.click()}>
            <Upload className="size-5" aria-hidden /> Importieren
          </Button>
          <input ref={fileRef} type="file" accept="application/json,.json" className="hidden" onChange={(e) => e.target.files?.[0] && doImport(e.target.files[0])} />
          <Button
            variant="bad"
            onClick={() => {
              if (confirm(cloud ? 'Wirklich den gesamten Lernstand löschen – auf allen Geräten? Das kann nicht rückgängig gemacht werden.' : 'Wirklich den gesamten Lernstand löschen? Das kann nicht rückgängig gemacht werden.')) {
                reset()
                pushToast({ kind: 'info', text: 'Lernstand zurückgesetzt' })
              }
            }}
          >
            <Trash2 className="size-5" aria-hidden /> Zurücksetzen
          </Button>
        </div>
        {importError && (
          <p role="alert" className="text-sm text-bad">
            {importError}
          </p>
        )}
      </Card>

      <Card className="space-y-2 p-5 text-sm text-ink-2">
        <h2 className="text-xl font-semibold text-ink">So funktionieren XP und Streak</h2>
        <ul className="list-disc space-y-1 pl-5">
          <li>Richtige Aufgabe: {XP_RULES.correct[1]} / {XP_RULES.correct[2]} / {XP_RULES.correct[3]} XP je nach Schwierigkeit, −{XP_RULES.perHint} XP je Hinweis.</li>
          <li>Dieselbe Aufgabe am selben Tag erneut: 50 %, dann 20 %, danach keine XP mehr.</li>
          <li>Früheren Fehler korrigiert: +{XP_RULES.fixBonus} XP · Lektion: +{XP_RULES.lessonFirst} XP (Wiederholung +{XP_RULES.lessonRepeat}) · Boss bestanden: +{XP_RULES.bossFirst} XP.</li>
          <li>Klausursimulation: 0,6 XP je erreichtem Prozentpunkt (einmal pro Tag und Klausur voll).</li>
          <li>Ein Tag zählt für die Streak, sobald du mindestens eine Aufgabe richtig löst (lokales Datum).</li>
        </ul>
      </Card>

      <div className="flex flex-col items-center gap-1 pt-2 text-center text-xs text-ink-3">
        <Logo className="text-base" />
        <p>Lernhilfe auf Basis der Vorlesungsunterlagen SoSe 2026. Keine offizielle Veranstaltung des KIT.</p>
      </div>
    </div>
  )
}
