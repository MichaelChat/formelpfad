/**
 * Karteikarten: Vorder- und Rückseiten aus Formeln, Wissenskarten und Aufgaben.
 *
 * Arten:
 * - `formel`: Name → Formel (oder umgekehrt: Formel → Name und Bedeutung)
 * - `wissen`: Begriff → Kernaussage und Merkliste
 * - `frage`:  Aufgabe aus Lektionen/Tutorien/Klausur → Lösung. Richtig/Falsch-Serien werden
 *             in einzelne Aussagen zerlegt; zufallsgenerierte Varianten sind nicht dabei.
 *
 * Inhalte werden nur umgeformt, nicht neu geschrieben: Rückseiten zeigen die Lösung, die
 * Musterantwort bzw. die erste Erklärungszeile der jeweiligen Aufgabe.
 */
import { chapterById, exercises, formulaById, formulas } from '../content'
import { isKnowledge, type Exercise, type Formula, type McOption, type SourceRef } from '../content/types'
import { formatNumber } from './format'
import { isDue } from './srs'
import { localDay } from './dates'
import { mulberry32, shuffle } from './math/random'
import type { AppState } from './progress'

export type FlashKind = 'formel' | 'wissen' | 'frage'

export interface FlashSide {
  /** Kleine Überschrift, z. B. „Formel“, „Richtig oder falsch?“ */
  label: string
  title?: string
  /** Fließtext (darf $…$-Formeln enthalten). */
  text?: string
  tex?: string
  list?: string[]
  pairs?: [string, string][]
}

export interface Flashcard {
  id: string
  kind: FlashKind
  chapterId: string
  formulaIds: string[]
  difficulty: 1 | 2 | 3
  front: FlashSide
  back: FlashSide
  sources?: SourceRef[]
}

const firstSentence = (s: string) => {
  const m = s.match(/^.*?[.!?](\s|$)/)
  return (m ? m[0] : s).trim()
}

function formulaCard(f: Formula, reverse: boolean): Flashcard {
  const vars = f.variables.slice(0, 6).map((v) => `$${v.tex}$: ${v.name}`)
  const base = { id: `karte:${reverse ? 'r:' : ''}${f.id}`, kind: 'formel' as const, chapterId: f.chapterId, formulaIds: [f.id], difficulty: f.difficulty, sources: f.sources }
  if (reverse)
    return {
      ...base,
      front: { label: 'Was beschreibt diese Formel?', tex: f.tex },
      back: { label: 'Formel', title: f.name, text: firstSentence(f.intuition) },
    }
  return {
    ...base,
    front: { label: 'Formel', title: f.name, text: f.short && f.short !== f.name ? `Wie lautet die Formel? (${f.short})` : 'Wie lautet die Formel?' },
    back: { label: f.name, tex: f.tex, ...(vars.length ? { list: vars } : {}) },
  }
}

function knowledgeCard(f: Formula): Flashcard {
  const points = (f.keyPoints ?? []).slice(0, 5)
  return {
    id: `karte:${f.id}`,
    kind: 'wissen',
    chapterId: f.chapterId,
    formulaIds: [f.id],
    difficulty: f.difficulty,
    sources: f.sources,
    front: { label: 'Begriff', title: f.name, text: 'Erkläre in eigenen Worten. Was ist die Kernaussage?' },
    back: { label: f.name, text: f.definition ?? f.intuition, ...(points.length ? { list: points } : {}) },
  }
}

const correctTexts = (opts: McOption[]) => opts.filter((o) => o.correct).map((o) => o.text)

/** Fester Seed je Karte, damit die Reihenfolge der Antwortmöglichkeiten stabil bleibt. */
const hashSeed = (id: string) => [...id].reduce((h, ch) => (Math.imul(h, 31) + ch.charCodeAt(0)) >>> 0, 7)

function isTrueFalse(ex: Exercise): boolean {
  return ex.type === 'steps' && ex.steps.length > 0 && ex.steps.every((s) => s.kind === 'mc' && s.options.length === 2 && s.options[0]?.text === 'Richtig')
}

/** Karten aus einer Aufgabe (eine; bei Richtig/Falsch-Serien eine pro Aussage). */
export function cardsFromExercise(ex: Exercise): Flashcard[] {
  if (ex.status === 'ungeprüft' || ex.id.startsWith('gen:')) return []
  const base = { chapterId: ex.chapterId, formulaIds: ex.formulaIds, difficulty: ex.difficulty, ...(ex.sources ? { sources: ex.sources } : {}) }
  const why = ex.explanation[0]
  switch (ex.type) {
    case 'mc': {
      const right = correctTexts(ex.options)
      if (!right.length) return []
      return [
        {
          ...base,
          id: `karte:${ex.id}`,
          kind: 'frage',
          front: { label: ex.multi ? 'Frage · mehrere richtig' : 'Frage', text: ex.prompt, ...(ex.display ? { tex: ex.display } : {}), list: shuffle(mulberry32(hashSeed(ex.id)), ex.options).map((o) => o.text) },
          back: { label: right.length > 1 ? 'Richtige Antworten' : 'Richtige Antwort', list: right, ...(why ? { text: why } : {}) },
        },
      ]
    }
    case 'steps': {
      if (isTrueFalse(ex))
        return ex.steps.map((st, i) => {
          if (st.kind !== 'mc') throw new Error('unreachable')
          const isTrue = !!st.options[0]?.correct
          const reason = st.options.find((o) => !o.correct)?.feedback
          return {
            ...base,
            id: `karte:${ex.id}:${i + 1}`,
            kind: 'frage' as const,
            front: { label: 'Richtig oder falsch?', text: st.label },
            back: { label: isTrue ? 'Richtig' : 'Falsch', ...(reason ? { text: reason } : {}) },
          }
        })
      const lines = ex.steps.map((st) => (st.kind === 'numeric' ? `${st.label}: ${formatNumber(st.answer, st.fmt)}` : `${st.label}: ${correctTexts(st.options).join(' / ')}`))
      return [{ ...base, id: `karte:${ex.id}`, kind: 'frage', front: { label: 'Aufgabe', text: ex.prompt }, back: { label: 'Lösung', list: lines, ...(why ? { text: why } : {}) } }]
    }
    case 'numeric':
      return [{ ...base, id: `karte:${ex.id}`, kind: 'frage', front: { label: 'Aufgabe', text: ex.prompt }, back: { label: 'Lösung', title: formatNumber(ex.answer, ex.fmt), ...(why ? { text: why } : {}) } }]
    case 'selfcheck':
      return [{ ...base, id: `karte:${ex.id}`, kind: 'frage', front: { label: 'Erklären', text: ex.prompt }, back: { label: 'Musterantwort', list: ex.modelAnswer } }]
    case 'match':
      return [{ ...base, id: `karte:${ex.id}`, kind: 'frage', front: { label: 'Zuordnen', text: `${ex.prompt}\n\n${ex.pairs.map((p) => `• ${p.left}`).join('\n')}` }, back: { label: 'Zuordnung', pairs: ex.pairs.map((p) => [p.left, p.right]) } }]
    case 'formula':
      return [{ ...base, id: `karte:${ex.id}`, kind: 'frage', front: { label: 'Formel aufstellen', text: ex.prompt }, back: { label: 'Lösung', tex: ex.answerTex, ...(why ? { text: why } : {}) } }]
  }
}

let allQuestionCards: Flashcard[] | null = null
function questionCards(): Flashcard[] {
  allQuestionCards ??= exercises.flatMap(cardsFromExercise)
  return allQuestionCards
}

export interface DeckOptions {
  kinds: FlashKind[]
  /** Leer = alle Kapitel. */
  chapterIds?: string[]
  /** Formelkarten umgekehrt abfragen (Formel → Name). */
  reverse?: boolean
  /** `faellig`: fällige und schwache Themen zuerst, sonst zufällig. */
  order?: 'faellig' | 'zufall'
  size?: number
  seed?: number
}

export function allCards(opts: Pick<DeckOptions, 'kinds' | 'chapterIds' | 'reverse'>): Flashcard[] {
  const inChapter = (c: { chapterId: string }) => !opts.chapterIds?.length || opts.chapterIds.includes(c.chapterId)
  const out: Flashcard[] = []
  if (opts.kinds.includes('formel')) out.push(...formulas.filter((f) => !isKnowledge(f) && f.tex && inChapter(f)).map((f) => formulaCard(f, !!opts.reverse)))
  if (opts.kinds.includes('wissen')) out.push(...formulas.filter((f) => isKnowledge(f) && inChapter(f)).map(knowledgeCard))
  if (opts.kinds.includes('frage')) out.push(...questionCards().filter(inChapter))
  return out
}

/** Stellt einen Stapel zusammen. „Fällig zuerst“: Karten zu fälligen Themen, dann zu schwachen, dann der Rest gemischt. */
export function buildDeck(state: AppState, opts: DeckOptions): Flashcard[] {
  const cards = allCards(opts)
  const rng = mulberry32(opts.seed ?? Date.now())
  const shuffled = shuffle(rng, cards)
  if (opts.order === 'zufall') return shuffled.slice(0, opts.size ?? shuffled.length)
  const today = localDay()
  const priority = (c: Flashcard) => {
    const fp = state.formula[c.formulaIds[0] ?? '']
    if (fp && isDue(fp.srs, today)) return 0
    if (!fp) return 2 // noch nie geübt
    const acc = fp.attempts ? fp.correct / fp.attempts : 1
    return acc < 0.7 ? 1 : 3
  }
  const sorted = shuffled.map((c, i) => ({ c, p: priority(c), i })).sort((a, b) => a.p - b.p || a.i - b.i).map((x) => x.c)
  return sorted.slice(0, opts.size ?? sorted.length)
}

export function cardChapterLabel(c: Flashcard): string {
  const ch = chapterById.get(c.chapterId)
  return ch ? `${ch.number} · ${ch.title}` : ''
}

export function cardTopic(c: Flashcard): Formula | undefined {
  return formulaById.get(c.formulaIds[0] ?? '')
}
