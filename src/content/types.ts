/**
 * Typisiertes Inhaltsmodell. Die Inhalte (Kapitel, Formeln, Aufgaben, Klausuren)
 * liegen getrennt von der Oberfläche in src/content/data/*. Neue PDFs werden
 * ergänzt, indem dort weitere Einträge angelegt werden – die UI liest alles
 * generisch aus diesem Modell.
 *
 * Texte dürfen Inline-Mathematik in $…$ enthalten (wird mit KaTeX gerendert).
 */
import type { NumFmt } from '../lib/format'
import type { Domain } from '../lib/math/equivalence'

/** Kennung eines Quelldokuments (siehe sources.ts). */
export type DocId = string

export interface SourceRef {
  doc: DocId
  /** Seiten bzw. Folien, z. B. "29" oder "29–30". */
  pages: string
  note?: string
}

/**
 * - `geprüft`: steht so in den Unterlagen und wurde nachgerechnet.
 * - `abgeleitet`: von der App ergänzt (z. B. Umstellung einer Formel), mathematisch geprüft,
 *    steht aber nicht wörtlich in den Unterlagen.
 * - `ungeprüft`: unklar, widersprüchlich oder schlecht extrahiert – siehe docs/content-issues.md.
 *    Ungeprüfte Inhalte werden nicht in bewerteten Simulationen verwendet.
 */
export type ValidationStatus = 'geprüft' | 'abgeleitet' | 'ungeprüft'

/** Kompetenzdimensionen, die getrennt verfolgt werden. */
export type Skill = 'erkennen' | 'abrufen' | 'auswaehlen' | 'einsetzen' | 'umstellen' | 'interpretieren' | 'anwenden'

export const SKILLS: readonly Skill[] = ['erkennen', 'abrufen', 'auswaehlen', 'einsetzen', 'umstellen', 'interpretieren', 'anwenden']

export const SKILL_LABELS: Record<Skill, string> = {
  erkennen: 'Formel erkennen',
  abrufen: 'Aus dem Gedächtnis abrufen',
  auswaehlen: 'Passende Methode wählen',
  einsetzen: 'Werte einsetzen',
  umstellen: 'Formel umstellen',
  interpretieren: 'Ergebnis interpretieren',
  anwenden: 'In komplexer Aufgabe anwenden',
}

export interface Variable {
  /** Bezeichner im Rechenausdruck (z. B. "C_T", "mu_M"). */
  sym: string
  /** LaTeX-Darstellung (z. B. "C_T", "\\mu_M"). */
  tex: string
  name: string
  unit?: string
  /** Stichproben-Intervall für die Äquivalenzprüfung. */
  domain?: Domain
}

export interface WorkedExample {
  problem: string
  steps: string[]
  result: string
  source?: SourceRef
}

export interface GeneratorInput {
  min: number
  max: number
  step: number
  fmt: NumFmt
}

export interface GeneratorTarget {
  /** Gesuchte Variable (lhs oder Schlüssel in `solved`). */
  sym: string
  /** Aufgabentext mit Platzhaltern {sym} für formatierte Werte. */
  template: string
  fmt: NumFmt
  difficulty: 1 | 2 | 3
  skill: 'einsetzen' | 'umstellen' | 'anwenden'
}

export interface GeneratorSpec {
  /** Frei gewählte Eingangsgrößen (Variablen der rechten Seite). */
  inputs: Record<string, GeneratorInput>
  /** Format für die linke Seite, wenn sie als gegebene Größe erscheint. */
  lhsFmt: NumFmt
  targets: GeneratorTarget[]
  /** Ausdruck, der für gültige Werte > 0 sein muss (z. B. "r - g"). */
  constraint?: string
}

/**
 * Art einer Lernkarte:
 * - `formel`: Rechenformel bzw. formaler Zusammenhang (Formelsammlung)
 * - `wissen`: Begriff, Prinzip, Konzept, Begründung (Wissensbereich)
 * Beide laufen durch dieselbe Lernlogik (Lektionen, Wiederholung, Beherrschung).
 */
export type CardKind = 'formel' | 'wissen'

export interface Formula {
  id: string
  /** Standard: `formel`. */
  kind?: CardKind
  name: string
  aliases?: string[]
  chapterId: string
  subchapter?: string
  /** Darstellung (KaTeX). */
  tex: string
  /** Rechenlogik: lhs = rhs. Fehlt bei rein begrifflichen Zusammenhängen. */
  lhs?: string
  rhs?: string
  /** Nach anderen Variablen aufgelöste Formen (Variable → Ausdruck). */
  solved?: Record<string, string>
  variables: Variable[]
  assumptions: string[]
  intuition: string
  interpretation: string
  useCases: string[]
  whenNot?: string[]
  selectionHint?: string
  mistakes: string[]
  rearranged?: { tex: string; note?: string }[]
  example?: WorkedExample
  related?: string[]
  difficulty: 1 | 2 | 3
  sources: SourceRef[]
  status: ValidationStatus
  statusNote?: string
  /** Ergänzende Erklärung, die NICHT aus den Unterlagen stammt. */
  supplement?: string
  generator?: GeneratorSpec
  /** Kurzes Stichwort für Karten und Auswahlaufgaben. */
  short?: string
  /** Wissenskarten: Kernaussage in einem bis zwei Sätzen. */
  definition?: string
  /** Wissenskarten: die wichtigsten Punkte (Merkliste). */
  keyPoints?: string[]
  /** Hinweis, wie das Thema in der Klausur abgefragt wird. */
  examTip?: string
}

/** Lernkarte = Formel oder Wissenskarte. */
export type Card = Formula

export const isKnowledge = (f: Pick<Formula, 'kind'>): boolean => f.kind === 'wissen'

export const KIND_LABELS: Record<CardKind, { one: string; many: string; collection: string }> = {
  formel: { one: 'Formel', many: 'Formeln', collection: 'Formelsammlung' },
  wissen: { one: 'Begriff', many: 'Begriffe', collection: 'Wissen' },
}

export type Origin =
  | 'klausur' // Originalaufgabe aus einer (Beispiel-)Klausur
  | 'tutorium' // Originalaufgabe aus einem Tutorium/Aufgabenblatt
  | 'vorlesung' // Beispiel oder Frage aus den Vorlesungsfolien
  | 'app' // von der App formulierte, fachlich geprüfte Übung
  | 'generiert' // automatisch mit Zufallswerten erzeugte Variante

export const ORIGIN_LABELS: Record<Origin, string> = {
  klausur: 'Originalaufgabe Klausur',
  tutorium: 'Originalaufgabe Tutorium',
  vorlesung: 'Beispiel aus der Vorlesung',
  app: 'Übung (App)',
  generiert: 'Generierte Übung',
}

export interface ExerciseBase {
  id: string
  chapterId: string
  formulaIds: string[]
  skill: Skill
  difficulty: 1 | 2 | 3
  /** Gestufte Hinweise: konzeptionell → methodisch → konkret. */
  hints: string[]
  /** Lösungsweg/Erklärung (Rich-Text-Absätze). */
  explanation: string[]
  /** Kurzer Tipp, wie man den Fehler in der Klausur vermeidet. */
  examTip?: string
  origin: Origin
  sources?: SourceRef[]
  status: ValidationStatus
  learningGoal?: string
  estMinutes?: number
  /** Kurzer Aufgabenkontext, der vor der Frage angezeigt wird. */
  context?: string
}

export interface McOption {
  id: string
  text: string
  correct?: boolean
  /** Spezifisches Feedback, wenn diese (falsche) Option gewählt wurde. */
  feedback?: string
}

export interface McExercise extends ExerciseBase {
  type: 'mc'
  prompt: string
  options: McOption[]
  /** Mehrfachauswahl: alle korrekten Optionen müssen gewählt werden. */
  multi?: boolean
  /** „Fehler finden“-Aufgaben werden besonders gekennzeichnet. */
  variant?: 'fehler' | 'auswahl' | 'theorie' | 'luecke'
  /** Optional: Darstellung (z. B. Formel mit Lücke oder fehlerhafte Rechnung). */
  display?: string
}

export interface MatchExercise extends ExerciseBase {
  type: 'match'
  prompt: string
  /** left: Symbol/Begriff (Rich-Text), right: Bedeutung. */
  pairs: { left: string; right: string }[]
}

export interface FormulaInputExercise extends ExerciseBase {
  type: 'formula'
  prompt: string
  /** Gesuchte Größe, z. B. "BW". */
  target: string
  targetTex: string
  /** Referenzausdruck (Rechenlogik) für die Äquivalenzprüfung. */
  answer: string
  /** Erlaubte Variablen mit Stichproben-Intervall. */
  variables: Variable[]
  answerTex: string
}

export interface WrongAnswer {
  value: number
  /** Erklärung des typischen Denkfehlers. */
  explanation: string
}

export interface NumericSpec {
  answer: number
  fmt: NumFmt
  /** Relative Toleranz (Standard 0,05 %). */
  relTol?: number
  absTol?: number
  wrong?: WrongAnswer[]
  plausible?: { min?: number; max?: number; message: string }
}

export interface NumericExercise extends ExerciseBase, NumericSpec {
  type: 'numeric'
  prompt: string
}

export type Step =
  | ({ kind: 'numeric'; label: string; points?: number } & NumericSpec)
  | { kind: 'mc'; label: string; options: McOption[]; points?: number }

export interface StepsExercise extends ExerciseBase {
  type: 'steps'
  prompt: string
  steps: Step[]
}

/** Offene Aufgabe: nicht automatisch bewertbar, Selbstkontrolle anhand Musterlösung. */
export interface SelfCheckExercise extends ExerciseBase {
  type: 'selfcheck'
  prompt: string
  modelAnswer: string[]
  /** Stichworte, die in einer guten Antwort vorkommen sollten. */
  keywords?: string[]
}

export type Exercise = McExercise | MatchExercise | FormulaInputExercise | NumericExercise | StepsExercise | SelfCheckExercise

export interface Lesson {
  id: string
  /** Wissens-Lektion (wird im Lernpfad gekennzeichnet). */
  knowledge?: boolean
  title: string
  goal: string
  formulaIds: string[]
  /** Zusätzliche Aufgaben, die nicht über formulaIds gefunden werden. */
  extraExerciseIds?: string[]
}

export interface Chapter {
  id: string
  part: PartId
  number: string
  title: string
  description: string
  sources: SourceRef[]
  lessons: Lesson[]
}

export type PartId = 'fin' | 'rw' | 'jb'

export const PARTS: Record<PartId, { title: string; lecturer: string; color: string }> = {
  fin: { title: 'Finanzierung', lecturer: 'Prof. Dr. Julian Thimme', color: 'fin' },
  rw: { title: 'Rechnungswesen', lecturer: 'Prof. Dr. Marc Wouters', color: 'rw' },
  jb: { title: 'Jahresabschluss & Bewertung', lecturer: 'Dr. Torsten Lüdecke', color: 'jb' },
}

export interface ExamTask {
  id: string
  /** z. B. "1.1.1" */
  number: string
  title: string
  points: number
  topic: string
  chapterId: string
  /** Aufgaben-IDs, die in der Simulation gestellt werden. */
  exerciseIds: string[]
}

export interface Exam {
  id: string
  title: string
  source: SourceRef
  totalPoints: number
  /** Bearbeitungszeit in Minuten, falls angegeben; sonst Vorschlag (gekennzeichnet). */
  minutes: number
  minutesIsOfficial: boolean
  intro: string[]
  sections: { title: string; points: number; context?: string; tasks: ExamTask[] }[]
}
