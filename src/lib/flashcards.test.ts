import { describe, expect, it } from 'vitest'
import { exerciseById, formulas } from '../content'
import { allCards, buildDeck, cardsFromExercise } from './flashcards'
import { initialState, recordFlashcard } from './progress'

describe('Karteikarten: Inhalte', () => {
  const all = allCards({ kinds: ['formel', 'wissen', 'frage'] })

  it('gibt Karten aller drei Arten, jede mit Vorder- und Rückseite', () => {
    const kinds = new Set(all.map((c) => c.kind))
    expect([...kinds].sort()).toEqual(['formel', 'frage', 'wissen'])
    for (const c of all) {
      expect(c.front.title || c.front.text || c.front.tex, c.id).toBeTruthy()
      expect(c.back.title || c.back.text || c.back.tex || c.back.list?.length || c.back.pairs?.length, c.id).toBeTruthy()
    }
  })

  it('hat eindeutige IDs und je eine Karte pro Formel bzw. Begriff', () => {
    expect(new Set(all.map((c) => c.id)).size).toBe(all.length)
    expect(all.filter((c) => c.kind === 'wissen')).toHaveLength(formulas.filter((f) => f.kind === 'wissen').length)
  })

  it('zerlegt Richtig/Falsch-Serien in einzelne Aussagen mit Lösung', () => {
    const ex = exerciseById.get('jb.w.guv.e1')!
    const cards = cardsFromExercise(ex)
    expect(cards.length).toBe(7)
    expect(cards.map((c) => c.back.label).join('')).toBe('RichtigRichtigRichtigFalschFalschFalschRichtig')
    expect(cards[3]!.back.text).toMatch(/GKV/)
  })

  it('zeigt bei Zahlenaufgaben die formatierte Lösung', () => {
    const c = cardsFromExercise(exerciseById.get('jb.w.rap.e1')!)[0]!
    expect(c.back.title).toBe('8.000 €')
  })

  it('zeigt bei Auswahlfragen alle Möglichkeiten vorne (gemischt, stabil) und nur die richtige hinten', () => {
    const ex = exerciseById.get('rw.w.erfolg.e1')!
    const c = cardsFromExercise(ex)[0]!
    expect(ex.type === 'mc' && c.front.list?.length).toBe(ex.type === 'mc' && ex.options.length)
    expect(cardsFromExercise(ex)[0]!.front.list).toEqual(c.front.list)
    expect(c.back.list).toHaveLength(1)
    expect(c.back.list?.[0]).toMatch(/andere wertvolle Sachen/)
    expect(c.front.text).not.toMatch(/andere wertvolle Sachen/)
  })

  it('stellt Stapel nach Art, Kapitel und Größe zusammen; fällige zuerst', () => {
    const s = initialState()
    const deck = buildDeck(s, { kinds: ['wissen'], chapterIds: ['jb-anhang'], size: 3, seed: 1 })
    expect(deck.length).toBeLessThanOrEqual(3)
    for (const c of deck) expect(c.chapterId).toBe('jb-anhang')
    // ein Thema als fällig markieren → kommt zuerst
    const target = allCards({ kinds: ['formel'] })[5]!
    const due = { ...s, formula: { [target.formulaIds[0]!]: { skills: {}, attempts: 3, correct: 3, wrongLog: [], srs: { ease: 2.5, interval: 1, reps: 1, lapses: 0, due: '2000-01-01', lastReviewed: '1999-12-31' } } } }
    expect(buildDeck(due, { kinds: ['formel'], order: 'faellig', seed: 7 })[0]!.formulaIds[0]).toBe(target.formulaIds[0])
  })
})

describe('Karteikarten: Fortschritt', () => {
  const card = { key: 'karte:rw.w.erfolg', formulaIds: ['rw.w.erfolg'], formulaDifficulty: { 'rw.w.erfolg': 1 as const }, ms: 4000 }

  it('„Gewusst“ stärkt Abrufen und plant die Wiederholung, XP nur einmal pro Tag', () => {
    const now = new Date(2026, 10, 12, 10)
    let s = initialState(now)
    const r1 = recordFlashcard(s, { ...card, knew: true }, now)
    s = r1.state
    expect(r1.xp).toBe(2)
    expect(s.formula['rw.w.erfolg']!.skills.abrufen).toBeGreaterThan(0)
    expect(s.formula['rw.w.erfolg']!.srs!.due > '2026-11-12').toBe(true)
    const r2 = recordFlashcard(s, { ...card, knew: true }, now)
    expect(r2.xp).toBe(0)
    // Aufgabenstatistik und Fehlerliste bleiben unberührt
    expect(r2.state.exercise).toEqual({})
    expect(r2.state.recentWrong).toEqual([])
  })

  it('„Nochmal“ macht das Thema morgen wieder fällig', () => {
    const now = new Date(2026, 10, 12, 10)
    const s = recordFlashcard(initialState(now), { ...card, knew: false }, now).state
    expect(s.formula['rw.w.erfolg']!.srs!.due).toBe('2026-11-13')
    expect(s.recentWrong).toEqual([])
  })
})
