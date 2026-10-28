/**
 * Beispielklausur „Betriebswirtschaftslehre: Finanzwirtschaft und Rechnungswesen“ (mit Lösung).
 * Aufgabenstruktur, Reihenfolge und Punkte wie im Original (KLAUSUR-BSP, 16 Seiten).
 * Die Bearbeitungszeit ist im Dokument nicht angegeben → Vorschlag der App (gekennzeichnet).
 */
import { fmt } from '../../lib/format'
import { calc, mc, numeric, numStep, opts, src, steps } from '../helpers'
import type { Exam, Exercise } from '../types'

export const exercises: Exercise[] = [
  numeric({
    id: 'exam.bsp.1.1.2', chapterId: 'fin-invest', formulaIds: ['fin.kapitalwert'], skill: 'einsetzen', difficulty: 2, origin: 'klausur',
    prompt: 'Beispielklausur 1.1.2: Projekt P (Mio. €): −20; 5; 20. Kapitalwert bei einem geforderten Jahreszinssatz von 10 %? (2 Punkte)',
    answer: calc('-20+5/1.1+20/1.1^2'), fmt: fmt.num(4),
    wrong: [{ value: calc('5/1.1+20/1.1^2'), explanation: 'Die Anfangsauszahlung von 20 fehlt.' }],
    hints: ['KW = −AAZ + Barwerte.', '$5/1{,}1 + 20/1{,}21$', 'Minus 20'],
    explanation: ['$KW = -20 + 5/1{,}1 + 20/1{,}1^2 = 1{,}0744 > 0$ → P annehmen.'],
    sources: [src('KLAUSUR-BSP', '4')],
  }),
  steps({
    id: 'exam.bsp.1.1.4', chapterId: 'fin-invest', formulaIds: ['fin.amortisation'], skill: 'anwenden', difficulty: 1, origin: 'klausur',
    prompt: 'Beispielklausur 1.1.4: Amortisationsdauer von P (−20; 5; 20)? Annahme bei maximal 2 Jahren? (3 Punkte)',
    steps: [
      numStep('Amortisationsdauer (Jahre)', 2, fmt.years(), { points: 2.5 }),
      { kind: 'mc', label: 'Entscheidung', options: opts('*annehmen – AD ist nicht länger als die maximal gewünschte AD', 'ablehnen'), points: 0.5 },
    ],
    hints: ['Kumuliert: nach 1 Jahr 5, nach 2 Jahren 25.', 'Ab wann ≥ 20?', 'Nach 2 Jahren.'],
    explanation: ['Nach einem Jahr 5 < 20, nach zwei Jahren 25 > 20 → AD = 2 Jahre → annehmen.'],
    sources: [src('KLAUSUR-BSP', '4')],
  }),
  steps({
    id: 'exam.bsp.1.5', chapterId: 'fin-renten', formulaIds: ['fin.ewige-rente', 'fin.endliche-rente', 'fin.renten-endwert'], skill: 'anwenden', difficulty: 3, origin: 'klausur', estMinutes: 8,
    prompt: 'Beispielklausur 1.5 (4 Punkte): Eine Person zahlt 30 Jahre lang jährlich zum Jahresende einen konstanten Betrag auf ein Sparkonto (2 % p. a.), um ab dem 30. Jahr (einschließlich) eine ewige Rente von 1.400 € pro Jahr (jeweils am Jahresende) zu beziehen. Wie hoch muss der jährliche Sparbetrag sein?',
    steps: [
      numStep('Wert der ewigen Rente zum Ende der Ansparphase', calc('1400/0.02'), fmt.eur(2), { points: 1 }),
      numStep('Jährlicher Sparbetrag C', calc('70000/1.02^30*0.02/(1-1/1.02^30)'), fmt.eur(4), { points: 3 }),
    ],
    hints: ['Die ewige Rente beginnt im Jahr 30 – ihr Wert nach der Formel C/r bezieht sich auf das Ende der Ansparphase (so die offizielle Lösung).', 'Barwert der Ansparphase = Wert der ewigen Rente abgezinst um 30 Jahre.', '$C = \\frac{70.000/1{,}02^{30}\\cdot 0{,}02}{1 - 1{,}02^{-30}}$'],
    explanation: ['Wert der ewigen Rente: 1.400/0,02 = 70.000 €.', 'Gleichsetzen: $\\frac{C}{0{,}02}(1 - 1{,}02^{-30}) = 70.000\\cdot 1{,}02^{-30}$ ⇒ C = 1.725,4946 €.'],
    sources: [src('KLAUSUR-BSP', '9')],
  }),
  mc({
    id: 'exam.bsp.2.1a', chapterId: 'rw-bilanz', formulaIds: ['rw.ek-komponenten'], skill: 'erkennen', difficulty: 1, origin: 'klausur', variant: 'theorie',
    prompt: 'Beispielklausur 2.1a: Aus welchen drei Komponenten besteht das Eigenkapital in der Bilanz, und was sind ihre Quellen? (1,5 Punkte) Wähle die richtige Zuordnung.',
    options: opts('*Gezeichnetes Kapital und Kapitalrücklage: von Gesellschaftern eingezahlt; Gewinnrücklage: kumuliert aus bisherigen Gewinnen', ['Gezeichnetes Kapital: aus Gewinnen; Rückstellungen: von Gesellschaftern eingezahlt; Gewinnrücklage: Bankkredite', 'Rückstellungen sind Fremdkapital.'], ['Eigenkapital, Fremdkapital, Rückstellungen', 'Das sind keine Komponenten des EK.']),
    hints: ['Zwei Quellen: Einzahlungen und Gewinne.', 'Rücklage ≠ Rückstellung.', 'Gewinnrücklage = einbehaltene Gewinne.'],
    explanation: ['Gezeichnetes Kapital + Kapitalrücklage sind von den Gesellschaftern eingezahlt; die Gewinnrücklage ist aus bisherigen Gewinnen kumuliert.'],
    sources: [src('KLAUSUR-BSP', '11–12')],
  }),
]

export const exams: Exam[] = [
  {
    id: 'beispielklausur-fr',
    title: 'Beispielklausur Finanzwirtschaft & Rechnungswesen',
    source: src('KLAUSUR-BSP', '1–16'),
    totalPoints: 90,
    minutes: 90,
    minutesIsOfficial: false,
    intro: [
      'Struktur, Reihenfolge und Punkte wie in der Beispielklausur (Finanzwirtschaft 40 P., Rechnungswesen 50 P.).',
      'Hilfsmittel laut Deckblatt: nur nicht programmierbarer Taschenrechner.',
      'Endergebnisse auf vier Nachkommastellen runden; mit ungerundeten Zwischenergebnissen rechnen.',
      'Die Bearbeitungszeit ist im Dokument nicht angegeben. 90 Minuten sind ein Vorschlag der App.',
      'Offene Fragen (Erklären/Begründen) bewertest du nach der Abgabe selbst anhand der Musterlösung.',
    ],
    sections: [
      {
        title: 'Aufgabe 1 – Finanzwirtschaft',
        points: 40,
        tasks: [
          { id: 't111', number: '1.1.1', title: 'Interne Zinssatzmethode', points: 4, topic: 'Investitionsentscheidung', chapterId: 'fin-invest', exerciseIds: ['fin.izs.e1'] },
          { id: 't112', number: '1.1.2', title: 'Kapitalwertmethode', points: 2, topic: 'Investitionsentscheidung', chapterId: 'fin-invest', exerciseIds: ['exam.bsp.1.1.2'] },
          { id: 't113', number: '1.1.3', title: 'Kapitalwertrate', points: 2, topic: 'Investitionsentscheidung', chapterId: 'fin-invest', exerciseIds: ['fin.kapitalwertrate.e1'] },
          { id: 't114', number: '1.1.4', title: 'Amortisationsrechnung', points: 3, topic: 'Investitionsentscheidung', chapterId: 'fin-invest', exerciseIds: ['exam.bsp.1.1.4'] },
          { id: 't121', number: '1.2.1', title: 'Zerobond und Zinsänderung', points: 3, topic: 'Anleihen', chapterId: 'fin-anleihen', exerciseIds: ['fin.zerobond.e2'] },
          { id: 't122', number: '1.2.2', title: 'Kuponanleihe', points: 2, topic: 'Anleihen', chapterId: 'fin-anleihen', exerciseIds: ['fin.kuponanleihe.e1'] },
          { id: 't123', number: '1.2.3', title: 'Floater', points: 1, topic: 'Anleihen', chapterId: 'fin-anleihen', exerciseIds: ['fin.anleihearten.e1'] },
          { id: 't131', number: '1.3.1', title: 'Annahmen des CAPM', points: 2, topic: 'CAPM', chapterId: 'fin-portfolio', exerciseIds: ['fin.capm.e1'] },
          { id: 't132', number: '1.3.2', title: 'Zerlegung des Risikos', points: 2, topic: 'CAPM', chapterId: 'fin-portfolio', exerciseIds: ['fin.capm.e2'] },
          { id: 't134', number: '1.3.3–1.3.4', title: 'Marktrisikoprämie, Beta, Kovarianz', points: 4, topic: 'CAPM', chapterId: 'fin-portfolio', exerciseIds: ['fin.wml.e1'] },
          { id: 't14', number: '1.4', title: 'Dividend Discount Model', points: 5, topic: 'Aktien', chapterId: 'fin-aktien', exerciseIds: ['fin.ddm.e1'] },
          { id: 't15', number: '1.5', title: 'Ansparen für eine ewige Rente', points: 4, topic: 'Rentenformeln', chapterId: 'fin-renten', exerciseIds: ['exam.bsp.1.5'] },
          { id: 't16', number: '1.6', title: 'IPO-Phänomene', points: 6, topic: 'Aktien', chapterId: 'fin-aktien', exerciseIds: ['fin.ipo.e2'] },
        ],
      },
      {
        title: 'Aufgabe 2 – Rechnungswesen',
        points: 50,
        context: 'Werft (Kreuzfahrtschiffe, Familienbesitz seit 1895), curraxit AG (SSD-Tochter in Japan), mittelständisches Unternehmen mit Vor- und Endkostenstellen.',
        tasks: [
          { id: 't21a', number: '2.1a', title: 'Komponenten des Eigenkapitals', points: 1.5, topic: 'Bilanz', chapterId: 'rw-bilanz', exerciseIds: ['exam.bsp.2.1a'] },
          { id: 't21bd', number: '2.1b–d', title: 'Bilanzposten der Werft begründen', points: 10, topic: 'Bilanz', chapterId: 'rw-bilanz', exerciseIds: ['rw.ek.e1'] },
          { id: 't21e', number: '2.1e', title: 'Realisationsprinzip', points: 2, topic: 'Prinzipien', chapterId: 'rw-grundlagen', exerciseIds: ['rw.realisation.e1'] },
          { id: 't21f', number: '2.1f', title: 'Realisation bei der Werft', points: 1, topic: 'Prinzipien', chapterId: 'rw-grundlagen', exerciseIds: ['rw.realisation.e3'] },
          { id: 't21g', number: '2.1g', title: 'Matching Principle', points: 1, topic: 'Prinzipien', chapterId: 'rw-grundlagen', exerciseIds: ['rw.matching.e1'] },
          { id: 't21h', number: '2.1h', title: 'Matching bei Sachanlagen', points: 1.5, topic: 'Prinzipien', chapterId: 'rw-grundlagen', exerciseIds: ['rw.matching.e2'] },
          { id: 't21i', number: '2.1i', title: 'Geschäftsvorfälle verbuchen', points: 18, topic: 'Worksheet Approach', chapterId: 'rw-bilanz', exerciseIds: ['rw.worksheet.e1'] },
          { id: 't22', number: '2.2', title: 'Break-even-Analyse', points: 5, topic: 'Kosten', chapterId: 'rw-kosten', exerciseIds: ['rw.break-even.e2'] },
          { id: 't23a', number: '2.3a', title: 'Anbauverfahren', points: 2, topic: 'Kostenstellenrechnung', chapterId: 'rw-kostenstellen', exerciseIds: ['rw.anbau.e1'] },
          { id: 't23b', number: '2.3b', title: 'Stufenleiterverfahren', points: 3, topic: 'Kostenstellenrechnung', chapterId: 'rw-kostenstellen', exerciseIds: ['rw.stufenleiter.e1'] },
          { id: 't23c', number: '2.3c', title: 'Reihenfolge begründen', points: 1, topic: 'Kostenstellenrechnung', chapterId: 'rw-kostenstellen', exerciseIds: ['rw.stufenleiter.e2'] },
          { id: 't23d', number: '2.3d', title: 'Gleichungsverfahren aufstellen', points: 2, topic: 'Kostenstellenrechnung', chapterId: 'rw-kostenstellen', exerciseIds: ['rw.gleichung.e1'] },
          { id: 't23e', number: '2.3e', title: 'Stufenleiter in Gleichungen', points: 2, topic: 'Kostenstellenrechnung', chapterId: 'rw-kostenstellen', exerciseIds: ['rw.stufenleiter.e3'] },
        ],
      },
    ],
  },
]

/**
 * Hinweis zur Punkteverteilung von 2.3: In der Beispielklausur sind für 2.3a–e insgesamt 10 Punkte
 * angegeben, aber keine Aufteilung auf die Teilaufgaben. Die Aufteilung oben (2/3/1/2/2) ist eine
 * gleichmäßige Annahme der App und wird in der Auswertung als „geschätzt“ markiert.
 * Ebenso 2.1b–d (3 + 4 + 3 = 10 Punkte laut Klausur) ist zu einer Aufgabe zusammengefasst.
 */
export const estimatedPointTasks = new Set(['t23a', 't23b', 't23c', 't23d', 't23e'])
