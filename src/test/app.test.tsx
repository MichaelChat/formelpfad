import { describe, expect, it, beforeEach } from 'vitest'
import { act, cleanup, fireEvent, render, screen, within } from '@testing-library/react'
import { HashRouter } from 'react-router'
import { StoreProvider } from '../state/store'
import { AppRoutes } from '../App'
import type { StorageLike } from '../lib/persistence'
import { CloudContext, type CloudValue } from '../state/cloud'
import { initialState } from '../lib/progress'

function memoryStorage(): StorageLike & { map: Map<string, string> } {
  const map = new Map<string, string>()
  return { map, getItem: (k) => map.get(k) ?? null, setItem: (k, v) => void map.set(k, v), removeItem: (k) => void map.delete(k) }
}

function mount(storage: StorageLike, hash = '#/') {
  window.location.hash = hash
  return render(
    <StoreProvider storage={storage}>
      <HashRouter>
        <AppRoutes />
      </HashRouter>
    </StoreProvider>,
  )
}

beforeEach(() => {
  cleanup()
  window.scrollTo = () => {}
  window.matchMedia = ((q: string) => ({ matches: false, media: q, addEventListener() {}, removeEventListener() {} })) as unknown as typeof window.matchMedia
})

describe('App – Lernzyklus', () => {
  it('Startseite zeigt einen sinnvollen Einstiegszustand', () => {
    mount(memoryStorage())
    expect(screen.getByText('Willkommen beim Formelpfad')).toBeTruthy()
    expect(screen.getByRole('link', { name: /Erste Lektion starten/ })).toBeTruthy()
  })

  it('Lektion: Erklärung → Aufgabe → Feedback → XP → Fortschritt nach Reload', async () => {
    const storage = memoryStorage()
    mount(storage, '#/lektion/l-fin-ew-bw')
    fireEvent.click(await screen.findByRole('button', { name: /Los geht/ }))
    // Formelkarte Endwert
    expect(screen.getByRole('heading', { name: 'Endwert (mehrperiodig)' })).toBeTruthy()
    fireEvent.click(screen.getByRole('button', { name: 'Weiter' }))
    // Beispiel
    expect(screen.getByText(/Gerechnetes Beispiel/)).toBeTruthy()
    fireEvent.click(screen.getByRole('button', { name: 'Weiter' }))
    // Erste Aufgabe: Formel erkennen (Multiple Choice) – richtige Option ist A
    const options = screen.getAllByRole('radio')
    fireEvent.click(options[0]!)
    fireEvent.click(screen.getByRole('button', { name: 'Prüfen' }))
    expect(await screen.findByText('Richtig!')).toBeTruthy()
    // XP wurden gespeichert
    const saved = JSON.parse(storage.map.get('formelpfad:state:v1')!)
    expect(saved.xp).toBe(10)
    expect(saved.log).toHaveLength(1)

    // Zweite Aufgabe absichtlich falsch → konkretes Feedback
    fireEvent.click(screen.getByRole('button', { name: 'Weiter' }))
    const input = screen.queryByLabelText('Deine Antwort') as HTMLInputElement | null
    if (input) {
      fireEvent.change(input, { target: { value: '1' } })
      fireEvent.click(screen.getByRole('button', { name: 'Prüfen' }))
      expect(await screen.findByText(/Lösungsweg/)).toBeTruthy()
    }

    // „Reload“: neu mounten mit demselben Speicher
    cleanup()
    mount(storage, '#/')
    const header = screen.getByTitle('Erfahrungspunkte')
    expect(within(header).getByText(/\d+/).textContent).not.toBe('0')
    expect(screen.queryByText('Willkommen beim Formelpfad')).toBeNull()
  })

  it('Formelsammlung: Suche nach Symbol und Detailansicht', async () => {
    mount(memoryStorage(), '#/formeln')
    const search = screen.getByPlaceholderText(/Suche nach Name/)
    await act(async () => {
      fireEvent.change(search, { target: { value: 'beta' } })
    })
    expect(screen.getAllByText('Beta-Faktor').length).toBeGreaterThan(0)
    fireEvent.click(screen.getAllByText('Beta-Faktor')[0]!)
    expect(await screen.findByRole('heading', { name: 'Beta-Faktor' })).toBeTruthy()
    expect(screen.getByText('Quellen und Fundstellen')).toBeTruthy()
    expect(screen.getByRole('button', { name: /Jetzt üben/ })).toBeTruthy()
  })

  it('Klausur-Arena zeigt die Originalklausur mit 90 Punkten', () => {
    mount(memoryStorage(), '#/arena')
    expect(screen.getByText(/90 Punkte/)).toBeTruthy()
    expect(screen.getByRole('button', { name: /Mit Zeitlimit simulieren/ })).toBeTruthy()
  })

  it('Konto-Bereich (angemeldet): Status, Abgleich und Abmelden; Änderungen gehen an die Synchronisation', async () => {
    const calls: string[] = []
    const commits: unknown[] = []
    const cloud: CloudValue = {
      account: { uid: 'u1', email: 'michael@example.com', name: 'Michael' },
      status: 'synced',
      hasUnsyncedChanges: () => false,
      syncNow: async () => void calls.push('sync'),
      signOut: async () => void calls.push('signOut'),
      deleteAccount: async () => void calls.push('delete'),
    }
    window.location.hash = '#/einstellungen'
    render(
      <CloudContext.Provider value={cloud}>
        <StoreProvider initialState={initialState()} onCommit={(st) => commits.push(st)}>
          <HashRouter>
            <AppRoutes />
          </HashRouter>
        </StoreProvider>
      </CloudContext.Provider>,
    )
    expect(screen.getByText('michael@example.com')).toBeTruthy()
    expect(screen.getAllByText('Gespeichert').length).toBeGreaterThan(0)
    fireEvent.click(screen.getByRole('button', { name: /Jetzt abgleichen/ }))
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /Abmelden/ }))
    })
    expect(calls).toEqual(['sync', 'signOut'])
    fireEvent.change(screen.getByPlaceholderText('z. B. Alex'), { target: { value: 'Mia' } })
    expect(commits).toHaveLength(1)
    expect((commits[0] as { settings: { name: string } }).settings.name).toBe('Mia')
  })
})

describe('Schritt-Aufgaben', () => {
  it('lassen sich Schritt für Schritt bis zum Ende prüfen (Richtig/Falsch mit 4 Aussagen)', async () => {
    const { ExercisePlayer } = await import('../ui/exercise/ExercisePlayer')
    const { exerciseById } = await import('../content')
    const ex = exerciseById.get('rw.w.erfolgswirksam.e3')!
    expect(ex.type).toBe('steps')
    const answered: unknown[] = []
    render(<ExercisePlayer exercise={ex} onAnswered={(a) => answered.push(a)} onNext={() => {}} />)
    const n = ex.type === 'steps' ? ex.steps.length : 0
    for (let i = 0; i < n; i++) {
      const groups = screen.getAllByRole('radiogroup')
      fireEvent.click(within(groups[i]!).getAllByRole('radio')[0]!)
      fireEvent.click(screen.getByRole('button', { name: i < n - 1 ? 'Schritt prüfen' : 'Prüfen' }))
    }
    expect(answered).toHaveLength(1)
    expect(screen.getByText(/von 4 Schritten auf Anhieb richtig|Alle Schritte richtig/)).toBeTruthy()
  })
})

describe('Karteikarten', () => {
  it('Stapel wählen → umdrehen → bewerten → Abschluss; Ergebnis wird gespeichert', async () => {
    const storage = memoryStorage()
    mount(storage, '#/karteikarten')
    // Auswahl: nur Fragen, 10 Karten, aus Kapitel jb-guv
    fireEvent.click(screen.getByRole('button', { name: /^Formeln/ }))
    fireEvent.click(screen.getByRole('button', { name: /^Wissen/ }))
    fireEvent.click(screen.getByRole('button', { name: /^Fragen/ }))
    expect(screen.getByRole('button', { name: /^Fragen/ }).getAttribute('aria-pressed')).toBe('true')
    fireEvent.click(screen.getByRole('button', { name: /^10$/ }))
    fireEvent.click(screen.getByRole('button', { name: /Karten lernen$/ }))

    expect(window.location.hash).toMatch(/karteikarten\/los\?art=frage/)
    expect(await screen.findByText(/1\/10/)).toBeTruthy()
    // Vor dem Umdrehen gibt es keine Bewertungsknöpfe
    expect(screen.queryByRole('button', { name: /Gewusst/ })).toBeNull()
    fireEvent.click(screen.getByRole('button', { name: 'Antwort zeigen' }))
    fireEvent.click(screen.getByRole('button', { name: /Gewusst/ }))
    let saved = JSON.parse(storage.map.get('formelpfad:state:v1')!)
    expect(saved.xp).toBe(2)
    expect(saved.log.at(-1).mode).toBe('flashcard')

    // Zweite Karte: per Tastatur umdrehen und „Nochmal“ → kommt später erneut, Stapel wächst auf 11
    fireEvent.keyDown(window, { key: ' ' })
    fireEvent.keyDown(window, { key: '1' })
    expect(screen.getByText(/3\/11/)).toBeTruthy()

    // Rest durchgehen
    for (let i = 0; i < 20 && !screen.queryByText('Runde geschafft'); i++) {
      fireEvent.click(screen.getByRole('button', { name: 'Antwort zeigen' }))
      fireEvent.click(screen.getByRole('button', { name: /Gewusst/ }))
    }
    expect(screen.getByText('Runde geschafft')).toBeTruthy()
    expect(screen.getByText(/9 von 10 Karten gewusst/)).toBeTruthy()
    expect(screen.getByText('Noch nicht sicher')).toBeTruthy()
    saved = JSON.parse(storage.map.get('formelpfad:state:v1')!)
    // Nur die erste Bewertung je Karte zählt: 10 Einträge, nicht 11
    expect(saved.log.filter((l: { mode: string }) => l.mode === 'flashcard')).toHaveLength(10)
  })
})

describe('App – Fächer', () => {
  it('Fächerübersicht zeigt das aktive Fach und geplante Fächer; Auswahl führt zur Startseite', async () => {
    mount(memoryStorage(), '#/faecher')
    expect(screen.getByRole('heading', { name: 'Fächer' })).toBeTruthy()
    const active = screen.getByRole('button', { name: /Wirtschaftswissenschaften 1/ })
    expect(active.getAttribute('aria-current')).toBe('true')
    expect(screen.getByRole('heading', { name: 'Lineare Algebra 2' })).toBeTruthy()
    expect(screen.getAllByText('In Vorbereitung').length).toBeGreaterThan(0)
    fireEvent.click(active)
    expect(await screen.findByText('Willkommen beim Formelpfad')).toBeTruthy()
  })

  it('Wechsel zu Numerik: eigener Lernpfad, Auswahl wird gespeichert, zurück zu WiWi 1', async () => {
    const storage = memoryStorage()
    mount(storage, '#/faecher')
    fireEvent.click(screen.getByRole('button', { name: /Numerische Mathematik/ }))
    await screen.findByText('Willkommen beim Formelpfad')
    expect(JSON.parse(storage.map.get('formelpfad:state:v1')!).settings.subject).toBe('numerik')
    cleanup()
    mount(storage, '#/lernpfad')
    expect(screen.getByRole('heading', { name: 'Gleitpunktzahlen, Kondition und Stabilität' })).toBeTruthy()
    expect(screen.getByRole('heading', { name: 'LR- und Cholesky-Zerlegung' })).toBeTruthy()
    expect(screen.queryByRole('heading', { name: /Grundbegriffe der Finanzierung/ })).toBeNull()
    cleanup()
    mount(storage, '#/faecher')
    fireEvent.click(screen.getByRole('button', { name: /Wirtschaftswissenschaften 1/ }))
    await screen.findByText('Willkommen beim Formelpfad')
    expect(JSON.parse(storage.map.get('formelpfad:state:v1')!).settings.subject).toBe('wiwi1')
  })

  it('Papier-Aufgabe am Ende einer Numerik-Lektion: Musterlösung aufdecken und selbst bewerten', async () => {
    const storage = memoryStorage()
    mount(storage, '#/faecher')
    fireEvent.click(screen.getByRole('button', { name: /Numerische Mathematik/ }))
    await screen.findByText('Willkommen beim Formelpfad')
    cleanup()
    mount(storage, '#/lektion/l-num-substitution')
    fireEvent.click(await screen.findByRole('button', { name: /Los geht/ }))
    // Durch die Lektion klicken, bis die Papier-Aufgabe kommt (Antworten sind hier egal)
    for (let i = 0; i < 40 && !screen.queryByText('Papier-Aufgabe'); i++) {
      const btn = screen.queryByRole('button', { name: /^(Weiter|Prüfen|Schritt prüfen|Musterlösung zeigen)$/ })
      const radio = screen.queryAllByRole('radio').find((r) => !r.hasAttribute('disabled') && r.getAttribute('aria-disabled') !== 'true')
      if (radio) fireEvent.click(radio)
      const input = screen.queryAllByRole('textbox')[0]
      if (input && !(input as HTMLInputElement).value) fireEvent.change(input, { target: { value: '1' } })
      const vollst = screen.queryByRole('button', { name: 'Vollständig' })
      if (vollst) fireEvent.click(vollst)
      else if (btn) fireEvent.click(btn)
    }
    expect(screen.getByText('Papier-Aufgabe')).toBeTruthy()
    expect(screen.getByText(/Auf Papier lösen/)).toBeTruthy()
    expect(screen.queryByRole('textbox')).toBeNull()
    fireEvent.click(screen.getByRole('button', { name: 'Fertig – Musterlösung aufdecken' }))
    expect(screen.getByText('Musterlösung')).toBeTruthy()
    fireEvent.click(screen.getByRole('button', { name: 'Vollständig' }))
    expect(screen.queryByRole('button', { name: 'Vollständig' })).toBeNull()
  })

  it('Seitenleiste bzw. Startseite verlinken auf den Fachwechsel', () => {
    mount(memoryStorage())
    expect(screen.getAllByRole('link', { name: /Fach: Wirtschaftswissenschaften 1/ }).length).toBeGreaterThan(0)
  })
})
