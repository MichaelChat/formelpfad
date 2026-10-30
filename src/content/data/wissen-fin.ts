/**
 * Wissen Finanzierung (Prof. Thimme): Grundbegriffe, Beurteilung der Verfahren, IPO, Ausschüttungspolitik.
 * Quellen: Vorlesungsfolien FIN-VL1, FIN-VL4, FIN-VL5.
 */
import { match, mc, opts, selfcheck, src, trueFalse, wissen } from '../helpers'
import type { Chapter, Exercise, Formula, Lesson } from '../types'

export const chapters: Chapter[] = [
  {
    id: 'fin-grundlagen',
    part: 'fin',
    number: 'F0',
    title: 'Grundbegriffe der Finanzierung',
    description: 'Ziel der Unternehmung, Investition und Finanzierung, Eigen- vs. Fremdkapital, Finanzierung vs. Rechnungswesen.',
    sources: [src('FIN-VL1', '6–24')],
    lessons: [{ id: 'l-fin-w-grundbegriffe', knowledge: true, title: 'Investition und Finanzierung', goal: 'Grundbegriffe sicher unterscheiden.', formulaIds: ['fin.w.grundbegriffe'] }],
  },
]

export const formulas: Formula[] = [
  wissen({
    id: 'fin.w.grundbegriffe',
    name: 'Investition, Finanzierung und Wertschöpfung',
    short: 'Investition vs. Finanzierung',
    chapterId: 'fin-grundlagen',
    definition: 'Eine Investition ist eine Entscheidung, die zunächst eine Auszahlung zur Folge hat (Mittelverwendung). Eine Finanzierung ist eine Entscheidung, die zunächst eine Einzahlung zur Folge hat (Mittelherkunft). Unternehmen zielen darauf ab, Wert zu schaffen.',
    keyPoints: [
      'Wertschöpfung: Transformation von Ressourcen in Güter und Dienstleistungen mit höherem Wert (meist über Preise gemessen – Vorsicht bei negativen Externalitäten).',
      'Wert durch Investition: Projekte umsetzen, deren Ertrag die Kosten der Finanzierung übersteigt – und Projekte ablehnen (oder abbrechen), bei denen es umgekehrt ist.',
      'Kapitalkosten orientieren sich am Risiko der finanzierten Investition.',
      'EK vs. FK: grundsätzliches Unterscheidungsmerkmal ist die Rechtsstellung der Kapitalgeber. Gläubiger haben im Insolvenzrecht Vorrang; FK-Verträge regeln meist konkrete Zahlungen.',
      'Typisch EK: nicht ausgeschüttete Gewinne, Ausgabe von Aktien bzw. Stammanteilen. Typisch FK: Kredite, Anleihen.',
      'Wert durch Finanzierung: institutionelle Verzerrungen nutzen (z. B. Steuern), riskante Strategien vermeiden, effizienzsteigernde Instrumente nutzen, Fehlinformationen/irrationales Verhalten von Investoren ausnutzen.',
      'Rechnungswesen: aktueller Wert von Aktiva und Passiva, abgegrenzte Periode. Finanzierung: zukünftige Zahlungsströme, gesamter Lebenszyklus.',
    ],
    mistakes: ['Investition und Finanzierung verwechseln (Verwendung vs. Herkunft).', 'EK und FK über die Laufzeit statt über die Rechtsstellung unterscheiden.'],
    related: ['fin.ek-fk', 'fin.kapitalwert'],
    sources: [src('FIN-VL1', '7, 10, 15, 16, 20, 24')],
  }),
  wissen({
    id: 'fin.w.verfahren',
    name: 'Investitionsrechenverfahren: Stärken und Schwächen',
    short: 'Verfahren beurteilen',
    chapterId: 'fin-invest',
    definition: 'Kapitalwertmethode, Amortisationsrechnung und interne Zinssatzmethode beantworten die Investitionsfrage unterschiedlich gut. Die Kapitalwertmethode gilt als Referenz; die anderen Verfahren haben typische Schwächen, aber auch praktische Vorteile.',
    keyPoints: [
      'Kapitalwertmethode – Vorteile: Zahlungen als Grundlage, Mehrperiodizität, risikoadäquate Renditen.',
      'Kapitalwertmethode – Problem: Bei knappem Kapital liefert sie keine unmittelbare Lösung des Auswahlproblems → kombinatorisch den maximalen Gesamtkapitalwert innerhalb der Budgetgrenze bestimmen.',
      'Amortisationsrechnung – Vorteile: schnell und einfach (operative, häufige, kleinere Entscheidungen), dient zur Managementbewertung (Prognosefehler werden sichtbar), geeignet bei schlechtem Kapitalmarktzugang, schneller Kapitalrückfluss eröffnet Reinvestitionsmöglichkeiten.',
      'Amortisationsrechnung – Probleme: ignoriert Zeitpunkte der Zahlungen und Zahlungen nach der Amortisationsdauer; die gewünschte Amortisationsdauer ist willkürlich.',
      'Interne Zinssatzmethode – Probleme: mehrere Vorzeichenwechsel, Größen- und Zeitproblem bei sich ausschließenden Projekten.',
    ],
    related: ['fin.kapitalwert', 'fin.amortisation', 'fin.izs-probleme', 'fin.kapitalwertrate'],
    sources: [src('FIN-VL4', '7, 11, 12, 16–25')],
  }),
  wissen({
    id: 'fin.w.ipo',
    name: 'Börsengang (IPO): Ablauf',
    short: 'IPO-Ablauf',
    chapterId: 'fin-aktien',
    definition: 'Beim Börsengang (Initial Public Offering) beschafft sich ein Unternehmen Eigenkapital am Kapitalmarkt. Der Prozess reicht von der Auswahl der Emissionsbanken bis zur Kurspflege nach dem ersten Handelstag.',
    keyPoints: [
      '1. Auswahl der Emissionsbank(en) („Beauty Contest“)',
      '2. Festsetzung der Transaktionscharakteristika',
      '3. Due Diligence und Finanzanalysen durch das Emissionskonsortium',
      '4. Entwicklung der Equity Story und des Börsenprospekts',
      '5. Road Show / Bookbuilding',
      '6. Preisfestsetzung und Zuteilung',
      '7. Erster Handelstag, danach Kurspflege und Lockup-Periode',
      'Emissionsbanken („Underwriter“) vermitteln zwischen Unternehmen und Investoren.',
    ],
    related: ['fin.ipo', 'fin.ek-fk'],
    sources: [src('FIN-VL5', '9')],
  }),
  wissen({
    id: 'fin.w.ausschuettungspolitik',
    name: 'Ausschüttungspolitik: Dividenden und Aktienrückkäufe',
    short: 'Ausschüttungspolitik',
    chapterId: 'fin-aktien',
    definition: 'Unternehmen können Gewinne als Dividende ausschütten oder eigene Aktien zurückkaufen. Im perfekten Kapitalmarkt (ohne Steuern) sind beide Wege äquivalent; in der Realität spielen Steuern, Signalwirkung und die Verbindlichkeit von Dividenden eine Rolle.',
    keyPoints: [
      'Dividende: Kurs sinkt ex Dividende um den Dividendenbetrag; Rückkauf: Kurs bleibt gleich, Aktienzahl sinkt.',
      'Dividenden sind steuerlich nicht abzugsfähig (aus Nachsteuererträgen) und können nicht zur Insolvenz führen (keine Zahlungsverpflichtung).',
      'Dividenden haben „verbindlichen“ Charakter → Unternehmen kürzen sie ungern → Dividend smoothing.',
      'Signalwirkung: Erhöhung = positive Zukunftserwartung (Kurs steigt bei Ankündigung), Senkung = negative (mit Ausnahmen).',
      'Steuern: Dividenden werden direkt besteuert (in Deutschland 25 % Kapitalertragsteuer); bei Rückkäufen erst beim Verkauf mit Kursgewinn – Anleger können den Zeitpunkt wählen.',
      '„Dividend puzzle“: Dividenden werden trotz steuerlichem Nachteil weiter verwendet. Klienteleffekt: Dividendenpolitik passt sich den Steuerpräferenzen der Aktionäre an.',
    ],
    related: ['fin.ausschuettung', 'fin.ddm'],
    sources: [src('FIN-VL5', '12, 14–18')],
  }),
]

export const extraLessons: { chapterId: string; lessons: Lesson[] }[] = [
  { chapterId: 'fin-invest', lessons: [{ id: 'l-fin-w-verfahren', knowledge: true, title: 'Verfahren beurteilen', goal: 'Stärken und Schwächen der Investitionsrechenverfahren benennen.', formulaIds: ['fin.w.verfahren'] }] },
  { chapterId: 'fin-aktien', lessons: [{ id: 'l-fin-w-ipo-ausschuettung', knowledge: true, title: 'Börsengang und Ausschüttungspolitik', goal: 'IPO-Ablauf und Wirkungen von Dividenden und Rückkäufen erklären.', formulaIds: ['fin.w.ipo', 'fin.w.ausschuettungspolitik'] }] },
]

const g = 'fin-grundlagen'
const inv = 'fin-invest'
const akt = 'fin-aktien'

export const exercises: Exercise[] = [
  // ------------------------------------------------------------ Grundbegriffe
  match({
    id: 'fin.w.grundbegriffe.e1', chapterId: g, formulaIds: ['fin.w.grundbegriffe'], skill: 'erkennen', difficulty: 1, origin: 'vorlesung',
    prompt: 'Ordne zu.',
    pairs: [
      { left: 'Investition', right: 'Entscheidung, die zunächst eine Auszahlung zur Folge hat (Mittelverwendung)' },
      { left: 'Finanzierung', right: 'Entscheidung, die zunächst eine Einzahlung zur Folge hat (Mittelherkunft)' },
      { left: 'Wertschöpfung', right: 'Transformation von Ressourcen in Güter und Dienstleistungen mit höherem Wert' },
      { left: 'Kapitalkosten', right: 'Kosten der Finanzierung, orientiert am Risiko der Investition' },
    ],
    hints: ['Was passiert zuerst – Geld raus oder rein?', 'Verwendung vs. Herkunft.', 'Kapitalkosten hängen am Risiko.'],
    explanation: ['Investition = Mittelverwendung (zunächst Auszahlung), Finanzierung = Mittelherkunft (zunächst Einzahlung).'],
    sources: [src('FIN-VL1', '7, 10, 15')],
  }),
  mc({
    id: 'fin.w.grundbegriffe.e2', chapterId: g, formulaIds: ['fin.w.grundbegriffe', 'fin.ek-fk'], skill: 'erkennen', difficulty: 1, origin: 'vorlesung', variant: 'theorie',
    prompt: 'Was ist laut Vorlesung das grundsätzliche Unterscheidungsmerkmal zwischen Eigen- und Fremdkapital?',
    options: opts('*Die Rechtsstellung der Kapitalgeber', ['Die Laufzeit des Kapitals', 'Nicht das grundsätzliche Merkmal.'], ['Die Höhe der Verzinsung', 'Nicht das grundsätzliche Merkmal.']),
    hints: ['Eigentümer oder Gläubiger?', 'Was passiert in der Insolvenz?', 'Rechtsstellung.'],
    explanation: ['Bei Fremdkapital ist der Kapitalgeber Gläubiger: Verletzt das Unternehmen den Vertrag, hat das insolvenzrechtliche Konsequenzen, und Gläubigeransprüche sind gegenüber Eigentümern vorrangig.'],
    sources: [src('FIN-VL1', '16')],
  }),
  mc({
    id: 'fin.w.grundbegriffe.e3', chapterId: g, formulaIds: ['fin.w.grundbegriffe'], skill: 'auswaehlen', difficulty: 1, origin: 'vorlesung',
    prompt: 'Welche Projekte schaffen laut Vorlesung Wert?',
    options: opts('*Projekte, deren Ertrag die Kosten der Finanzierung übersteigt', ['Alle Projekte mit positivem Gewinn im ersten Jahr', 'Maßstab sind die Kapitalkosten, nicht der Gewinn eines Jahres.'], ['Projekte mit dem größten Umsatz', 'Umsatz allein sagt nichts über Wertschöpfung.']),
    hints: ['Womit wird der Ertrag verglichen?', 'Kapitalkosten.', 'Umgekehrt: Projekte ablehnen oder abbrechen.'],
    explanation: ['Wert entsteht durch Projekte, deren Ertrag die Kosten der Finanzierung übersteigt; Projekte, bei denen es umgekehrt ist, sollten abgelehnt bzw. abgebrochen werden.'],
    sources: [src('FIN-VL1', '10')],
  }),
  trueFalse({
    id: 'fin.w.grundbegriffe.e4', chapterId: g, formulaIds: ['fin.w.grundbegriffe'], skill: 'interpretieren', difficulty: 2, origin: 'vorlesung',
    prompt: 'Richtig oder falsch? (Finanzierung vs. Rechnungswesen)',
    statements: [
      ['Das Rechnungswesen befasst sich mit dem aktuellen Wert von Aktiva und Passiva und bezieht sich auf eine abgegrenzte Periode.', true, 'So die Gegenüberstellung auf Folie 24.'],
      ['Die Finanzierung befasst sich mit zukünftigen Zahlungsströmen über den gesamten Lebenszyklus des Unternehmens.', true, 'So die Gegenüberstellung auf Folie 24.'],
      ['Nicht ausgeschüttete Gewinne sind eine Form der Fremdfinanzierung.', false, 'Sie sind eine typische Form der Eigenfinanzierung.'],
      ['Ein Weg zur Wertschöpfung durch Finanzierung ist das Ausnutzen institutioneller Verzerrungen, z. B. unterschiedlicher Besteuerung der Finanzierungsformen.', true, 'Steht so auf Folie 20.'],
    ],
    hints: ['Periode vs. Lebenszyklus.', 'Wem gehören einbehaltene Gewinne?', 'Steuern.'],
    sources: [src('FIN-VL1', '16, 20, 24')],
  }),

  // ------------------------------------------------------------ Verfahren beurteilen
  mc({
    id: 'fin.w.verfahren.e1', chapterId: inv, formulaIds: ['fin.w.verfahren', 'fin.kapitalwert'], skill: 'interpretieren', difficulty: 2, origin: 'vorlesung', variant: 'theorie',
    prompt: 'Das einzusetzende Kapital ist knapp; nicht alle Projekte mit positivem Kapitalwert können durchgeführt werden. Was gilt laut Vorlesung?',
    options: opts(
      '*Die Kapitalwertmethode liefert keine unmittelbare Lösung; man ermittelt kombinatorisch den maximalen Gesamtkapitalwert innerhalb der Budgetgrenze.',
      ['Man wählt einfach die Projekte mit dem höchsten Kapitalwert, bis das Budget erschöpft ist.', 'Das ist nicht immer optimal – entscheidend ist die beste Kombination innerhalb des Budgets.'],
      ['Man wechselt zur Amortisationsrechnung.', 'Das löst das Auswahlproblem nicht.'],
    ),
    hints: ['Budgetgrenze.', 'Welche Kombination ist am besten?', 'Maximaler Gesamtkapitalwert.'],
    explanation: ['Bei knappem Kapital: kombinatorische Ermittlung des maximalen Gesamtkapitalwerts innerhalb der Budgetgrenze.'],
    sources: [src('FIN-VL4', '7')],
  }),
  mc({
    id: 'fin.w.verfahren.e2', chapterId: inv, formulaIds: ['fin.w.verfahren', 'fin.amortisation'], skill: 'erkennen', difficulty: 1, origin: 'vorlesung', multi: true,
    prompt: 'Welche Vorteile der Amortisationsrechnung nennt die Vorlesung? (Mehrfachauswahl)',
    options: opts(
      '*Schnell und einfach anzuwenden, besonders bei häufigen, kleineren operativen Entscheidungen',
      '*Dient zur Managementbewertung: Prognosefehler werden mit Erreichen der maximalen Amortisationsdauer offenbar',
      '*Besonders geeignet für Unternehmen ohne guten Zugang zu Kapitalmärkten',
      ['Berücksichtigt alle Zahlungen nach der Amortisationsdauer', 'Gerade das ist ein Problem der Methode.'],
      ['Berücksichtigt die Zeitpunkte der Zahlungen exakt', 'Auch das ist ein Problem der Methode.'],
    ),
    hints: ['Folie „Amortisationsrechnung: Vorteile“.', 'Einfachheit, Kontrolle, Kapitalrückfluss.', 'Die Probleme stehen auf der nächsten Folie.'],
    explanation: ['Vorteile: einfach, Managementbewertung, geeignet bei schlechtem Kapitalmarktzugang, schneller Kapitalrückfluss (bessere Reinvestitionsmöglichkeiten). Zeitpunkte und spätere Zahlungen werden dagegen nicht berücksichtigt.'],
    sources: [src('FIN-VL4', '11–12')],
  }),
  match({
    id: 'fin.w.verfahren.e3', chapterId: inv, formulaIds: ['fin.w.verfahren'], skill: 'auswaehlen', difficulty: 2, origin: 'vorlesung',
    prompt: 'Welches Verfahren hat welche Eigenschaft?',
    pairs: [
      { left: 'Zahlungen als Grundlage, Mehrperiodizität, risikoadäquate Renditen', right: 'Kapitalwertmethode' },
      { left: 'Willkürliche Festlegung der gewünschten Dauer', right: 'Amortisationsrechnung' },
      { left: 'Mehrere Vorzeichenwechsel können mehrere Lösungen ergeben', right: 'Interne Zinssatzmethode' },
    ],
    hints: ['Welche Methode gilt als Referenz?', 'Welche hat eine „maximale Dauer“?', 'Welche sucht eine Nullstelle?'],
    explanation: ['Kapitalwertmethode: Vorteile siehe Folie 7. Amortisation: willkürliche maximale Dauer. IZS: Nullstellenproblem bei mehreren Vorzeichenwechseln.'],
    sources: [src('FIN-VL4', '7, 12, 17–18')],
  }),

  // ------------------------------------------------------------ IPO-Ablauf
  mc({
    id: 'fin.w.ipo.e1', chapterId: akt, formulaIds: ['fin.w.ipo'], skill: 'erkennen', difficulty: 2, origin: 'vorlesung',
    prompt: 'Was steht beim Börsengang am Anfang des Prozesses?',
    options: opts('*Auswahl der Emissionsbank(en) („Beauty Contest“)', ['Road Show / Bookbuilding', 'Kommt erst nach Due Diligence und Equity Story.'], ['Preisfestsetzung', 'Kommt nach dem Bookbuilding.'], ['Kurspflege', 'Kommt nach dem ersten Handelstag.']),
    hints: ['Wer begleitet den Börsengang?', 'Zuerst braucht man Partner.', 'Beauty Contest.'],
    explanation: ['Reihenfolge laut Folie: Auswahl der Emissionsbanken → Transaktionscharakteristika → Due Diligence → Equity Story/Prospekt → Road Show/Bookbuilding → Preisfestsetzung → Zuteilung → erster Handelstag → Kurspflege/Lockup.'],
    sources: [src('FIN-VL5', '9')],
  }),
  mc({
    id: 'fin.w.ipo.e2', chapterId: akt, formulaIds: ['fin.w.ipo'], skill: 'erkennen', difficulty: 2, origin: 'vorlesung',
    prompt: 'Was kommt beim Börsengang unmittelbar vor der Preisfestsetzung?',
    options: opts('*Road Show / Bookbuilding', ['Auswahl der Emissionsbanken', 'Das ist der erste Schritt.'], ['Erster Handelstag', 'Der kommt nach Preisfestsetzung und Zuteilung.']),
    hints: ['Woher kennt man die Nachfrage?', 'Investoren geben Gebote ab.', 'Bookbuilding.'],
    explanation: ['Im Bookbuilding wird die Nachfrage der Investoren gesammelt; darauf folgt die Preisfestsetzung.'],
    sources: [src('FIN-VL5', '9')],
  }),

  // ------------------------------------------------------------ Ausschüttungspolitik
  mc({
    id: 'fin.w.ausschuettungspolitik.e1', chapterId: akt, formulaIds: ['fin.w.ausschuettungspolitik'], skill: 'interpretieren', difficulty: 1, origin: 'vorlesung', variant: 'theorie',
    prompt: 'Ein Unternehmen kündigt eine Dividendenerhöhung an. Welche Wirkung erwartet man laut Vorlesung (Signalwirkung)?',
    options: opts(
      '*Positives Signal über die Zukunftserwartungen des Managements → positive Kursveränderung am Tag der Ankündigung.',
      ['Negatives Signal, weil weniger Geld im Unternehmen bleibt.', 'Laut Vorlesung signalisiert eine Erhöhung positive Erwartungen (Ausnahmen möglich).'],
      ['Keine Wirkung – Dividenden sind irrelevant.', 'Im perfekten Markt ja, aber bei asymmetrischer Information gibt es eine Signalwirkung.'],
    ),
    hints: ['Wer weiß mehr über die Zukunft?', 'Management.', 'Dividenden kürzt man ungern.'],
    explanation: ['Da das Management besser informiert ist, signalisiert eine Dividendenerhöhung positive Zukunftserwartungen; der Kurs steigt am Ankündigungstag. Vorsicht: Es gibt Ausnahmen.'],
    sources: [src('FIN-VL5', '16')],
  }),
  trueFalse({
    id: 'fin.w.ausschuettungspolitik.e2', chapterId: akt, formulaIds: ['fin.w.ausschuettungspolitik'], skill: 'interpretieren', difficulty: 2, origin: 'vorlesung',
    prompt: 'Richtig oder falsch? (Ausschüttungspolitik)',
    statements: [
      ['Dividenden können vom Unternehmen von der Steuer abgesetzt werden.', false, 'Nein – die Ausschüttung erfolgt aus Nachsteuererträgen.'],
      ['Dividenden können nicht zur Insolvenz führen, weil es keine Zahlungsverpflichtungen sind.', true, 'Steht so auf Folie 14.'],
      ['Unternehmen tun sich schwer, Dividenden zu kürzen; das führt zu möglichst stabilen Dividenden (Dividend smoothing).', true, 'Dividenden haben „verbindlichen“ Charakter.'],
      ['Bei Aktienrückkäufen fallen für den Anleger sofort 25 % Kapitalertragsteuer an.', false, 'Steuern fallen erst beim Verkauf der Aktien mit Kursgewinn an; der Anleger kann den Zeitpunkt selbst wählen.'],
      ['Klienteleffekt: Das Unternehmen passt seine Dividendenpolitik den Steuerpräferenzen seiner Aktionäre an.', true, 'Folie 18.'],
    ],
    hints: ['Nachsteuer?', 'Zahlungsverpflichtung?', 'Wann wird beim Rückkauf besteuert?'],
    sources: [src('FIN-VL5', '12, 14, 15, 18')],
  }),
  mc({
    id: 'fin.w.ausschuettungspolitik.e3', chapterId: akt, formulaIds: ['fin.w.ausschuettungspolitik'], skill: 'erkennen', difficulty: 2, origin: 'vorlesung', variant: 'theorie',
    prompt: 'Was versteht man unter dem „Dividend puzzle“?',
    options: opts(
      '*Dividenden bleiben trotz ihres steuerlichen Nachteils ein weiterhin verwendetes Mittel der Ausschüttungspolitik.',
      ['Niemand weiß, wann die Dividende gezahlt wird.', 'Darum geht es nicht.'],
      ['Dividenden und Rückkäufe führen immer zu unterschiedlichen Kursen.', 'Im perfekten Markt sind sie äquivalent.'],
    ),
    hints: ['Was ist rätselhaft an Dividenden?', 'Steuern.', 'Trotzdem werden sie gezahlt.'],
    explanation: ['Obwohl Dividenden in vielen Ländern höher besteuert werden als Kursgewinne, schütten Unternehmen weiterhin Dividenden aus.'],
    sources: [src('FIN-VL5', '18')],
  }),
  selfcheck({
    id: 'fin.w.ausschuettungspolitik.e4', chapterId: akt, formulaIds: ['fin.w.ausschuettungspolitik', 'fin.ausschuettung'], skill: 'abrufen', difficulty: 2, origin: 'vorlesung',
    prompt: 'Erkläre, warum Dividende und Aktienrückkauf im perfekten Kapitalmarkt äquivalent sind (Beispiel: 10 Mio. Aktien zu 10 €, 10 Mio. € liquide Mittel, 1 € Dividende bzw. Rückkauf von 10 % der Aktien).',
    modelAnswer: [
      'Dividende: Der Kurs sinkt ex Dividende von 10 € auf 9 €; eine Anlegerin mit 1 Mio. Aktien hat 9 Mio. € in Aktien und 1 Mio. € in bar.',
      'Rückkauf: Der Kurs bleibt bei 10 €, es gibt nur noch 9 Mio. Aktien; der Anlegerin gehört jetzt 1/9 statt 1/10 des Unternehmens.',
      'Verkauft sie 100.000 Aktien zu 10 €, gehört ihr wieder 1/10 und sie hat 1 Mio. € in bar – gleicher Effekt wie die Dividende. Umgekehrt kann sie eine Dividende in Aktien reinvestieren und so einen Rückkauf nachbilden.',
    ],
    keywords: ['Kurs sinkt ex Dividende', 'Kurs bleibt beim Rückkauf', 'Anteil 1/9', 'Aktien verkaufen / reinvestieren'],
    hints: ['Was passiert jeweils mit dem Kurs?', 'Wie groß ist der Anteil nach dem Rückkauf?', 'Kann der Anleger das Ergebnis selbst herstellen?'],
    sources: [src('FIN-VL5', '14, 17')],
  }),
]

export const officialChecks: { id: string; value: number; dec: number; note: string }[] = []
