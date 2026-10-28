import { describe, expect, it, beforeEach } from 'vitest'
import { act, cleanup, fireEvent, render, screen, within } from '@testing-library/react'
import { HashRouter } from 'react-router'
import { StoreProvider } from '../state/store'
import { AppRoutes } from '../App'
import type { StorageLike } from '../lib/persistence'

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
})
