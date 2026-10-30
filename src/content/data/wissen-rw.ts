/**
 * Wissen Rechnungswesen (Prof. Wouters): Begriffe, Prinzipien und Begründungen.
 * Hauptquelle: „Diskussionsfragen und Antworten“ VL 1–7 (RW-D1…RW-D7). Die dort fett
 * markierte Antwort ist die offizielle Lösung; die zugehörige Frage steht auf der genannten
 * Folie der Vorlesung (RW-VL…).
 */
import { match, mc, opts, selfcheck, src, trueFalse, wissen } from '../helpers'
import type { Chapter, Exercise, Formula, Lesson } from '../types'

export const chapters: Chapter[] = []

export const formulas: Formula[] = [
  wissen({
    id: 'rw.w.erfolg',
    name: 'Wirtschaftlicher Erfolg und Gewinn',
    short: 'Erfolg ≠ Kassenzuwachs',
    chapterId: 'rw-grundlagen',
    definition: 'Der wirtschaftliche Erfolg einer Periode ist die Veränderung des Reinvermögens (Vermögen minus Schulden) – nicht die Veränderung des Kassenbestands. Gewinn ist nur der Teil der Eigenkapitalveränderung, der aus der gewöhnlichen Geschäftstätigkeit stammt.',
    keyPoints: [
      'Ein Kassenzuwachs sagt wenig: andere Vermögenswerte und Schulden bleiben dabei außer Betracht.',
      'Erfolg = Reinvermögen am Ende − Reinvermögen am Anfang.',
      'Schulden tilgen macht nicht reicher: Liquide Mittel und Schulden sinken um denselben Betrag, das EK bleibt gleich.',
      'Kapitalerhöhungen und Dividenden verändern das EK, sind aber kein Gewinn (Transaktionen mit Eigentümern).',
    ],
    example: {
      problem: 'Amsterdam Auto’s: Reinvermögen am Monatsanfang 202.700 €, am Monatsende 212.000 €. Kassenbestand +2.300 €.',
      steps: ['Erfolg = 212.000 − 202.700 = +9.300 €.', 'Die +2.300 € Kasse sind nicht der Erfolg – Autos, Gebäude, Werkzeuge und Schulden haben sich auch verändert.'],
      result: 'Erfolg im Monat: +9.300 €',
      source: src('RW-D1', '1', 'zu Folie 10 und 11'),
    },
    mistakes: ['Zunahme des Bargelds als Erfolg ansehen.', 'Eine Kapitalerhöhung als Gewinn zählen.', 'Glauben, die Tilgung eines Kredits verringere das Eigenkapital.'],
    related: ['rw.reinvermoegen', 'rw.gewinn', 'rw.bilanzgleichung'],
    sources: [src('RW-VL1', '10–11'), src('RW-D1', '1'), src('RW-VL23', '28, 35'), src('RW-D2', '1', 'zu Folie 28'), src('RW-D3', '1', 'zu Folie 35')],
  }),
  wissen({
    id: 'rw.w.aktivieren',
    name: 'Aktivieren oder sofort als Aufwand verbuchen',
    short: 'Aktivieren vs. Aufwand',
    chapterId: 'rw-bilanz',
    definition: 'Auszahlungen werden aktiviert (als Vermögensgegenstand in die Bilanz genommen), wenn sie einen zukünftigen ökonomischen Wert schaffen, der zuverlässig in Geld messbar ist. Sonst sind sie sofort Aufwand in der GuV.',
    keyPoints: [
      'Bedingung 1: Zukünftiger ökonomischer Wert, der dem Unternehmen zufließt.',
      'Bedingung 2: Zuverlässig in Geldeinheiten messbar.',
      'Einkaufs- und Produktionskosten werden bis zum Verkauf aktiviert – Aufwand werden sie erst in der Periode des Verkaufs (Matching).',
      'Bewertet wird zu Einkaufs-/Herstellungskosten, nicht zum (höheren) geschätzten Verkaufswert.',
      'Kernfrage bei Grenzfällen: Ist es sicher genug, dass die Ausgabe zu höheren Umsatzerlösen führt?',
    ],
    example: {
      problem: 'Amsterdam Auto’s kauft und repariert im Mai ein Auto für 10.000 € und verkauft es im August für 12.000 €.',
      steps: ['GuV Mai: 0 € Aufwand – das Auto ist noch nicht verkauft.', 'Bilanz Ende Mai: 10.000 € – Einkaufs- und Reparaturkosten sind aktiviert.', 'GuV August: Umsatzerlöse 12.000 €, Herstellungskosten 10.000 €.'],
      result: 'Aufwand entsteht erst im August.',
      source: src('RW-D2', '1', 'zu Folie 15'),
    },
    mistakes: ['Das Auto zum geschätzten Verkaufswert (12.000 €) in die Bilanz nehmen.', 'Einkaufskosten schon im Monat des Einkaufs als Aufwand zeigen.'],
    related: ['rw.matching', 'rw.worksheet', 'rw.vorsicht'],
    sources: [src('RW-VL23', '15, 21, 26'), src('RW-D2', '1'), src('RW-VL4', '16'), src('RW-D4', '2', 'zu Folie 16')],
  }),
  wissen({
    id: 'rw.w.erfolgswirksam',
    name: 'Erfolgswirksam oder erfolgsneutral buchen',
    short: 'Wann ändert sich das EK?',
    chapterId: 'rw-bilanz',
    definition: 'Ein Geschäftsvorfall ist erfolgswirksam, wenn er das Eigenkapital über Erträge oder Aufwendungen verändert (dann auch in der GuV). Erfolgsneutral ist er, wenn sich nur Vermögen und Schulden (oder zwei Vermögensposten) gegeneinander verändern.',
    keyPoints: [
      'Rechnung erhalten, später zahlen: zuerst Verbindlichkeit + und EK − (Aufwand); bei Zahlung Liquide Mittel − und Verbindlichkeit − (erfolgsneutral).',
      'Sofort bar bezahlt: Liquide Mittel − und EK − in einem Schritt.',
      'Verkauf auf Ziel statt bar: Forderung statt Liquider Mittel – die GuV ist gleich (Realisationsprinzip).',
      'Gewährleistung bei Verkauf: Rückstellung + und EK −; die spätere Reparatur verbraucht die Rückstellung (Liquide Mittel −, Rückstellung −).',
    ],
    mistakes: ['Bei Bezahlung einer Verbindlichkeit noch einmal Aufwand buchen.', 'Glauben, ein Verkauf auf Ziel ergebe weniger Umsatzerlöse als ein Barverkauf.'],
    related: ['rw.worksheet', 'rw.bilanzgleichung', 'rw.realisation', 'rw.rueckstellung'],
    sources: [src('RW-VL23', '35–41'), src('RW-D3', '1')],
  }),
  wissen({
    id: 'rw.w.abschreibung',
    name: 'Abschreibungen: Wahl der Methode und Wirkung',
    short: 'Abschreibungsmethoden',
    chapterId: 'rw-bewertung',
    definition: 'Abschreibungen verteilen die Anschaffungskosten einer Sachanlage über die Nutzungsdauer. Die Methode verschiebt Aufwand zwischen den Perioden, ändert aber nicht den Gesamtgewinn über die Nutzungsdauer.',
    keyPoints: [
      'Buchwert = Anfangswert − kumulierte Abschreibungen; zwischendurch darf er vom Marktwert abweichen (Fortführungsprinzip).',
      'Gesamter Gewinn über die Nutzungsdauer: unabhängig von der Methode – nur der Gewinn pro Periode ändert sich.',
      'Abschreibungen sind keine Zahlungen; Zahlungen sind nur Anschaffung (Anfangsbuchwert) und Verkaufserlös (Restwert).',
      'Leistungsabschreibung: wenn die Leistung je Periode unterschiedlich ist.',
      'Degressiv: gleiche Leistung, aber stark steigende Instandhaltungskosten.',
      'Linear: einfach, verständlich, wenig aufwendig.',
      'Methodenwechsel nur ausnahmsweise – dann gilt das Konsistenzprinzip.',
      'Abschreibung auf Wiederbeschaffungskosten ist im externen Rechnungswesen nicht erlaubt.',
    ],
    mistakes: ['Glauben, eine schnellere Abschreibung erhöhe oder senke den Gesamtgewinn.', 'Abschreibungen als Auszahlungen ansehen.'],
    related: ['rw.afa-linear', 'rw.afa-geo', 'rw.afa-leistung', 'rw.vorsicht'],
    sources: [src('RW-VL4', '6, 9, 12'), src('RW-D4', '1')],
  }),
  wissen({
    id: 'rw.w.kostenklassifikation',
    name: 'Kosten klassifizieren: Kostenobjekt und Kostentreiber',
    short: 'Kostenklassifikation',
    chapterId: 'rw-kosten',
    definition: 'Ob Kosten Einzel- oder Gemeinkosten sind, hängt vom Kostenobjekt ab (direkt zurechenbar oder nicht). Ob sie variabel oder fix sind, hängt vom Kostentreiber ab (ändern sie sich mit ihm oder nicht). Dieselben Kosten können je nach Bezugsgröße unterschiedlich eingeordnet werden.',
    keyPoints: [
      'Einzel-/Gemeinkosten: immer „in Bezug auf ein Kostenobjekt“ (z. B. ein Automodell).',
      'Variabel/fix: immer „im Verhältnis zu einem Kostentreiber“ (z. B. Produktionsvolumen).',
      'Zusätzlich: Produktions- vs. Nicht-Produktionskosten.',
      'Entwurfskosten sind variabel zur Anzahl neuer Motive, aber fix zum Produktionsvolumen.',
      'Umstellungskosten sind variabel zur Anzahl der Serien, aber fix zum Produktionsvolumen – kleinere Serien heißen höhere Kosten pro Stück.',
    ],
    example: {
      problem: 'Kostenobjekt Mercedes GLC, Kostentreiber Produktionsvolumen. Wohin gehören die Reifen und die Abschreibung der Produktionshalle?',
      steps: ['Reifen: direkt dem GLC zurechenbar und mengenabhängig → variable Einzelkosten.', 'Abschreibung der Halle (verschiedene Modelle): nicht direkt zurechenbar, unabhängig von der Menge → fixe Gemeinkosten.'],
      result: 'Reifen: variable Einzelkosten · Hallen-AfA: fixe Gemeinkosten',
      source: src('RW-VL5', '28'),
    },
    mistakes: ['Kosten ohne Angabe des Kostentreibers „fix“ nennen.', 'Einzel- und variable Kosten gleichsetzen (es gibt fixe Einzelkosten, z. B. Werkzeuge nur für ein Modell).'],
    related: ['rw.kostenarten', 'rw.kostenbegriffe'],
    sources: [src('RW-VL5', '27–29'), src('RW-D5', '1'), src('RW-VL7', '24–25'), src('RW-D7', '1–2')],
  }),
  wissen({
    id: 'rw.w.leistungsverrechnung',
    name: 'Innerbetriebliche Leistungsverrechnung verstehen',
    short: 'Leistungsverrechnung',
    chapterId: 'rw-kostenstellen',
    definition: 'Die Kosten der Vorkostenstellen werden auf die Endkostenstellen verteilt (Sekundärkostenverrechnung). Anbau-, Stufenleiter- und Gleichungsverfahren unterscheiden sich darin, ob und in welche Richtung Vorkostenstellen sich gegenseitig belasten.',
    keyPoints: [
      'Anbauverfahren: nur auf Endkostenstellen, keine Verrechnung zwischen Vorkostenstellen.',
      'Stufenleiterverfahren: auch auf andere Vorkostenstellen, aber nur in eine Richtung.',
      'Gleichungsverfahren: gegenseitige Belastung in beide Richtungen.',
      'Wahl des Verfahrens: Wie viel liefern die Vorkostenstellen untereinander? Sind die Daten vorhanden? Wird das Verfahren im Unternehmen verstanden?',
      'Verrechnungspreise im Anbauverfahren sind höher als „Kosten pro Leistungseinheit“, weil dieselben Kosten nur durch die Leistungen an Endkostenstellen geteilt werden.',
      'Welche Kostenarten man getrennt ausweist, entscheidet man selbst je nach Situation.',
    ],
    mistakes: ['Kosten pro Leistungseinheit mit Verrechnungspreisen verwechseln.', 'Annehmen, die Kostenarten müssten immer gleich detailliert aufgegliedert werden.'],
    related: ['rw.anbau', 'rw.stufenleiter', 'rw.gleichungsverfahren'],
    sources: [src('RW-VL6', '11–15, 29'), src('RW-D6', '1')],
  }),
  wissen({
    id: 'rw.w.kalkulationsgrenzen',
    name: 'Grenzen der Kalkulation',
    short: 'Wie genau sind Stückkosten?',
    chapterId: 'rw-kostentraeger',
    definition: 'Berechnete Kosten je Produkt sind nur eine Annäherung: Gemeinkosten werden mit Verteilungsschlüsseln auf Kostenstellen, von Vor- auf Endkostenstellen und weiter auf Produkte verteilt. Bei knappen Unterschieden zwischen Preis und berechneten Kosten lässt sich deshalb nicht sicher sagen, ob ein Verkauf gewinnbringend ist.',
    keyPoints: [
      'Ungenauigkeit entsteht auf drei Stufen: Kostenarten → Kostenstellen, Vor- → Endkostenstellen, Endkostenstellen → Produkte.',
      'Ein Lohnstundensatz enthält alle Kosten der Stelle (Löhne, Material, Abschreibung, Energie …) je Lohnstunde – er ist nicht der Stundenlohn der Mitarbeiter.',
      'Zuschlagskalkulation unterstellt, dass die Einzelkosten die Gemeinkosten proportional verursachen – das trifft nicht immer zu.',
      'Maschinen- und Lohnstundensatzkalkulation lassen sich kombinieren, wenn es beide Arten von Fertigungsgemeinkosten gibt.',
      'Mit den variablen Kosten pro Stück (Teilkostenrechnung) lässt sich beantworten, wie sich die Kosten ändern, wenn Menge steigt oder sinkt.',
    ],
    mistakes: ['Einen Verkauf knapp über den berechneten Kosten als sicher gewinnbringend bezeichnen.', 'Den Lohnstundensatz als Verdienst pro Stunde interpretieren.'],
    related: ['rw.zuschlagskalkulation', 'rw.maschinenstundensatz', 'rw.operatives-ergebnis'],
    sources: [src('RW-VL6', '8, 30–31'), src('RW-D6', '1–2'), src('RW-VL7', '9, 17, 18, 21'), src('RW-D7', '1')],
  }),
]

export const extraLessons: { chapterId: string; lessons: Lesson[] }[] = [
  { chapterId: 'rw-grundlagen', lessons: [{ id: 'l-rw-w-erfolg', knowledge: true, title: 'Erfolg und Prinzipien im Alltag', goal: 'Erfolg richtig messen und Prinzipien an Fällen erkennen.', formulaIds: ['rw.w.erfolg'] }] },
  { chapterId: 'rw-bilanz', lessons: [{ id: 'l-rw-w-buchen', knowledge: true, title: 'Aktivieren und erfolgswirksam buchen', goal: 'Entscheiden, was in Bilanz und GuV gehört – und wann sich das EK ändert.', formulaIds: ['rw.w.aktivieren', 'rw.w.erfolgswirksam'] }] },
  { chapterId: 'rw-bewertung', lessons: [{ id: 'l-rw-w-abschreibung', knowledge: true, title: 'Abschreibungen verstehen', goal: 'Wirkung und Wahl der Abschreibungsmethode begründen.', formulaIds: ['rw.w.abschreibung'] }] },
  { chapterId: 'rw-kosten', lessons: [{ id: 'l-rw-w-klassifikation', knowledge: true, title: 'Kosten klassifizieren', goal: 'Einzel/Gemein und fix/variabel immer mit Bezugsgröße zuordnen.', formulaIds: ['rw.w.kostenklassifikation'] }] },
  { chapterId: 'rw-kostenstellen', lessons: [{ id: 'l-rw-w-verrechnung', knowledge: true, title: 'Leistungsverrechnung verstehen', goal: 'Verfahren unterscheiden und Verrechnungspreise deuten.', formulaIds: ['rw.w.leistungsverrechnung'] }] },
  { chapterId: 'rw-kostentraeger', lessons: [{ id: 'l-rw-w-grenzen', knowledge: true, title: 'Grenzen der Kalkulation', goal: 'Berechnete Stückkosten richtig einordnen.', formulaIds: ['rw.w.kalkulationsgrenzen'] }] },
]

const c1 = 'rw-grundlagen'
const c2 = 'rw-bilanz'
const c3 = 'rw-bewertung'
const c4 = 'rw-kosten'
const c5 = 'rw-kostenstellen'
const c6 = 'rw-kostentraeger'

export const exercises: Exercise[] = [
  // ---------------------------------------------------------------- Erfolg (VL 1–3)
  mc({
    id: 'rw.w.erfolg.e1', chapterId: c1, formulaIds: ['rw.w.erfolg'], skill: 'interpretieren', difficulty: 1, origin: 'vorlesung', variant: 'theorie',
    prompt: 'Amsterdam Auto’s hat am Monatsende 2.300 € mehr Bargeld und Bankguthaben als am Anfang. Warum ist das nicht der wirtschaftliche Erfolg des Monats?',
    options: opts(
      '*Weil andere wertvolle Sachen (Autos, Gebäude, Werkzeuge) und die Schulden außer Betracht bleiben.',
      ['Weil Bargeld erst am Jahresende zählt.', 'Der Zeitpunkt ist nicht das Problem – es fehlen Vermögen und Schulden.'],
      ['Weil Umsatzerlöse nie in bar eingehen.', 'Das hat mit der Frage nichts zu tun.'],
    ),
    hints: ['Was gehört alles zum „Reichtum“ des Händlers?', 'Vermögen minus Schulden.', 'Autos, Gebäude, Werkzeuge, Bankschulden …'],
    explanation: ['Der Erfolg ist die Veränderung des Reinvermögens. Ein Blick nur auf die Kasse lässt andere Vermögenswerte und die Schulden außer Betracht.'],
    sources: [src('RW-VL1', '10'), src('RW-D1', '1', 'zu Folie 10')],
  }),
  mc({
    id: 'rw.w.erfolg.e2', chapterId: c1, formulaIds: ['rw.w.erfolg'], skill: 'interpretieren', difficulty: 1, origin: 'vorlesung', variant: 'theorie',
    prompt: 'Amsterdam Auto’s tilgt 18.000 € seines Bankdarlehens vom Firmenkonto. Warum wird das Unternehmen dadurch nicht reicher?',
    options: opts(
      '*Schulden und Liquide Mittel verändern sich um dieselbe Summe – das Eigenkapital bleibt unverändert.',
      ['Weil die Tilgung als Aufwand in die GuV geht.', 'Tilgung ist kein Aufwand; nur Zinsen wären Aufwand.'],
      ['Weil das Eigenkapital um 18.000 € sinkt.', 'Das EK bleibt gleich – Aktiva und Passiva sinken gleichermaßen.'],
    ),
    hints: ['Welche zwei Posten ändern sich?', 'Aktiva und Passiva sinken gleich stark.', 'EK = Vermögen − Schulden.'],
    explanation: ['Liquide Mittel −18.000 €, Bankdarlehen −18.000 €. Reinvermögen und EK bleiben unverändert (erfolgsneutral).'],
    sources: [src('RW-VL23', '35'), src('RW-D3', '1', 'zu Folie 35')],
  }),
  mc({
    id: 'rw.w.erfolg.e3', chapterId: c1, formulaIds: ['rw.w.erfolg'], skill: 'erkennen', difficulty: 2, origin: 'vorlesung', variant: 'theorie',
    prompt: 'Warum gilt nicht einfach: EK Schlussbilanz − EK Eröffnungsbilanz = Gewinn?',
    options: opts(
      '*Gewinn sind nur EK-Veränderungen aus der gewöhnlichen Geschäftstätigkeit; Kapitalerhöhungen oder Dividenden (Transaktionen mit Eigentümern) zählen nicht.',
      ['Weil das EK in der Schlussbilanz noch nicht bewertet ist.', 'Die Bewertung ist nicht das Problem.'],
      ['Weil der Gewinn immer kleiner ist als die EK-Veränderung.', 'Bei Dividenden ist der Gewinn sogar größer als die EK-Veränderung.'],
    ),
    hints: ['Wer kann das EK noch verändern außer dem Geschäft?', 'Eigentümer zahlen ein oder bekommen Geld.', 'Kapitalerhöhung, Dividende.'],
    explanation: ['Der Gewinn berechnet sich nur aus EK-Veränderungen durch die gewöhnliche Geschäftstätigkeit. Einlagen (z. B. Kapitalerhöhung) und Ausschüttungen (Dividenden) sind für den Gewinn nicht relevant.'],
    sources: [src('RW-VL23', '28'), src('RW-D2', '1', 'zu Folie 28')],
  }),
  selfcheck({
    id: 'rw.w.erfolg.e4', chapterId: c1, formulaIds: ['rw.w.erfolg'], skill: 'abrufen', difficulty: 2, origin: 'vorlesung',
    prompt: 'Erkläre in zwei bis drei Sätzen, wie man den wirtschaftlichen Erfolg einer Periode misst und welche Eigenkapitalveränderungen dabei nicht zum Gewinn zählen.',
    modelAnswer: [
      'Der Erfolg ist die Veränderung des Reinvermögens: Reinvermögen (Vermögen − Schulden) am Ende minus am Anfang der Periode.',
      'Nicht zum Gewinn zählen EK-Veränderungen durch Transaktionen mit Eigentümern, z. B. Kapitalerhöhungen oder Dividendenzahlungen.',
    ],
    keywords: ['Reinvermögen', 'Vermögen − Schulden', 'Ende minus Anfang', 'Eigentümer', 'Kapitalerhöhung / Dividende'],
    hints: ['Was ist Reinvermögen?', 'Vergleich zweier Zeitpunkte.', 'Was tun Eigentümer mit dem EK?'],
    sources: [src('RW-VL1', '11'), src('RW-D1', '1'), src('RW-D2', '1', 'zu Folie 28')],
  }),

  // ---------------------------------------------------------------- Realisationsprinzip (zusätzliche Fälle)
  mc({
    id: 'rw.realisation.e4', chapterId: c1, formulaIds: ['rw.realisation'], skill: 'anwenden', difficulty: 1, origin: 'vorlesung',
    prompt: 'Geschichte 1: Dein Onkel bittet dich, für ihn Kartons in Köln abzuholen, und bezahlt dich dafür. Ab welchem Moment kannst du sagen „Ich habe es verdient!“?',
    options: opts(
      ['Wenn dein Onkel anruft.', 'Da ist noch nichts geleistet – nur ein Auftrag.'],
      ['Wenn du am Samstagmorgen gut gelaunt abfährst.', 'Die Leistung hat gerade erst begonnen.'],
      ['Wenn du bei deiner Tante am Mittagstisch sitzt.', 'Die Kartons sind noch nicht zurück – die Leistung ist nicht abgeschlossen.'],
      '*Wenn du abends müde daheim bist.',
      ['Wenn dein Onkel dir das Geld gibt.', 'Der Zahlungszeitpunkt ist für die Realisation nicht entscheidend.'],
    ),
    hints: ['Wann ist die Leistung komplett erbracht?', 'Zahlung ist nicht der Maßstab.', 'Auftrag erledigt = Kartons sind da.'],
    explanation: ['Verdient ist es, wenn die Leistung vollständig erbracht ist – also abends nach der erledigten Fahrt. Nicht beim Auftrag, nicht unterwegs und nicht erst bei der Zahlung.'],
    examTip: 'Realisation ≠ Zahlung. Achte immer darauf, wann die Leistung komplett erbracht ist.',
    sources: [src('RW-VL1', '22'), src('RW-D1', '1', 'zu Folie 22')],
  }),
  mc({
    id: 'rw.realisation.e5', chapterId: c1, formulaIds: ['rw.realisation'], skill: 'anwenden', difficulty: 1, origin: 'vorlesung',
    prompt: 'Eine Firma beschafft Inputs, produziert und liefert Büromöbel im Jahr 2023. Der Kunde zahlt im Jahr 2024. Zu welchem Jahr gehören die Umsatzerlöse?',
    options: opts('*2023', ['2024', 'Der Zahlungsempfang bestimmt nicht den Zeitpunkt der Umsatzrealisierung.']),
    hints: ['Wann ist die Leistung erbracht?', 'Lieferung vs. Zahlung.', 'Lieferung 2023.'],
    explanation: ['Mit der Lieferung 2023 ist die Leistung erbracht, die Umsatzerlöse gehören zu 2023. Dass das Geld erst 2024 kommt, ändert daran nichts (bis dahin besteht eine Forderung).'],
    sources: [src('RW-VL1', '22'), src('RW-D1', '1', 'zu Folie 22')],
  }),
  mc({
    id: 'rw.realisation.e6', chapterId: c1, formulaIds: ['rw.realisation', 'rw.w.erfolgswirksam'], skill: 'interpretieren', difficulty: 2, origin: 'vorlesung', variant: 'theorie',
    prompt: 'Amsterdam Auto’s verkauft zwei Autos für 26.500 € und gewährt dem Käufer 30 Tage Zahlungsziel. Wie sähe die GuV aus, wenn der Käufer sofort in bar bezahlt hätte?',
    options: opts(
      ['Umsatzerlöse höher', 'Die Höhe der Umsatzerlöse hängt nicht von der Zahlungsweise ab.'],
      ['Herstellungskosten höher', 'Die Herstellungskosten sind der Einkaufswert der Autos – unabhängig von der Zahlung.'],
      ['Herstellungskosten niedriger', 'Siehe oben.'],
      '*Die GuV wäre nicht anders.',
    ),
    hints: ['Welches Prinzip bestimmt die Umsatzerlöse?', 'Spielt die Zahlung dafür eine Rolle?', 'Realisationsprinzip.'],
    explanation: ['Für die Anerkennung von Umsatzerlösen ist es nicht wichtig, ob man das Geld schon bekommen hat (Realisationsprinzip). In der Bilanz stünden Liquide Mittel statt einer Forderung aus Lieferungen und Leistungen – das EK ändert sich gleich.'],
    sources: [src('RW-VL23', '37'), src('RW-D3', '1', 'zu Folie 37'), src('RW-D2', '1', 'zu Folie 25')],
  }),
  mc({
    id: 'rw.w.erfolgswirksam.e1', chapterId: c2, formulaIds: ['rw.w.erfolgswirksam'], skill: 'anwenden', difficulty: 2, origin: 'vorlesung',
    prompt: 'Gleiche Situation (Verkauf für 26.500 € auf Ziel). Welche Konten der Bilanz wären anders, wenn der Käufer sofort in bar bezahlt hätte?',
    options: opts(
      ['Liquide Mittel höher', 'Unvollständig: Ein anderer Posten wäre dafür niedriger.'],
      '*Liquide Mittel höher, Forderungen aus Lieferungen und Leistungen niedriger',
      ['Liquide Mittel höher, EK höher', 'Das EK ändert sich in beiden Fällen gleich – der Gewinn hängt nicht von der Zahlung ab.'],
      ['Die Bilanz wäre nicht anders.', 'Doch: Statt einer Forderung stünden Liquide Mittel in der Bilanz.'],
    ),
    hints: ['Was steht bei einem Zielverkauf statt Geld in der Bilanz?', 'Forderung ↔ Liquide Mittel.', 'Das EK ändert sich gleich.'],
    explanation: ['Bei Barzahlung: Liquide Mittel + statt Forderung aus L&L +. Die EK-Änderung ist identisch.'],
    sources: [src('RW-VL23', '37'), src('RW-D3', '1', 'zu Folie 37')],
  }),
  match({
    id: 'rw.w.erfolgswirksam.e2', chapterId: c2, formulaIds: ['rw.w.erfolgswirksam'], skill: 'anwenden', difficulty: 2, origin: 'vorlesung',
    prompt: 'Ordne jedem Vorgang die richtige Buchung zu (Worksheet Approach, Amsterdam Auto’s).',
    pairs: [
      { left: 'Reparaturrechnung über 315 € wird nach 14 Tagen bezahlt (die Rechnung war bereits gebucht).', right: 'Liquide Mittel −, Verbindlichkeiten aus L&L −' },
      { left: 'Reparatur wird sofort in bar bezahlt.', right: 'Liquide Mittel −, EK −' },
      { left: 'Bereits gebuchte Löhne werden später ausgezahlt.', right: 'Liquide Mittel −, Lohnverbindlichkeiten −' },
      { left: 'Ein Kunde lässt eine Reparatur unter Gewährleistung durchführen (Rückstellung gebildet).', right: 'Liquide Mittel −, Rückstellung für Gewährleistung −' },
    ],
    hints: ['Wurde der Aufwand schon gebucht?', 'Wenn ja: nur noch Zahlung gegen Schuld.', 'Sofort bar = Aufwand und Zahlung in einem.'],
    explanation: ['Ist der Aufwand schon gebucht (Verbindlichkeit/Rückstellung), wird bei Zahlung nur die Schuld abgebaut – erfolgsneutral. Bei sofortiger Barzahlung sinken Liquide Mittel und EK direkt.'],
    sources: [src('RW-VL23', '39–41'), src('RW-D3', '1', 'zu Folie 39–41')],
  }),
  trueFalse({
    id: 'rw.w.erfolgswirksam.e3', chapterId: c2, formulaIds: ['rw.w.erfolgswirksam', 'rw.w.erfolg'], skill: 'interpretieren', difficulty: 2, origin: 'vorlesung',
    prompt: 'Richtig oder falsch? (Worksheet Approach)',
    statements: [
      ['Die Tilgung eines Bankdarlehens verringert das Eigenkapital.', false, 'Liquide Mittel und Schulden sinken um denselben Betrag; das EK bleibt unverändert.'],
      ['Beim Verkauf eines Autos mit Gewährleistung entstehen schon jetzt Gewährleistungskosten.', true, 'Sie werden durch die Umsatzerlöse dieser Periode verursacht (Matching Prinzip) und als Rückstellung gebucht.'],
      ['Wird eine Rechnung erst nach 14 Tagen bezahlt, entsteht der Aufwand erst am Zahlungstag.', false, 'Der Aufwand wird bei Erhalt der Rechnung gebucht (Verbindlichkeit +, EK −); die Zahlung ist erfolgsneutral.'],
      ['„Zwischendurch“, vor dem Periodenende, sind Bilanz und GuV nicht genau.', true, 'Erst am Periodenende werden z. B. Rechnungsabgrenzungen vorgenommen.'],
    ],
    hints: ['Was passiert jeweils mit dem EK?', 'Matching: Aufwand zu den Umsätzen.', 'RAP-Buchungen am Periodenende.'],
    sources: [src('RW-VL23', '35, 39, 41, 55'), src('RW-D3', '1–2')],
  }),

  // ---------------------------------------------------------------- Aktivieren
  mc({
    id: 'rw.w.aktivieren.e1', chapterId: c2, formulaIds: ['rw.w.aktivieren'], skill: 'anwenden', difficulty: 1, origin: 'vorlesung',
    prompt: 'Amsterdam Auto’s kauft und repariert im Mai ein Auto für 10.000 € und verkauft es im August für 12.000 €. Wie viel Einkaufs- und Reparaturkosten tauchen in der GuV von Mai auf?',
    options: opts(['10.000 €, weil das Auto im Mai gekauft und repariert wurde.', 'Die Kosten werden aktiviert und erst bei Verkauf Aufwand (Matching).'], '*0 €, weil das Auto im Mai nicht verkauft wird.'),
    hints: ['Wann werden Einkaufskosten zu Aufwand?', 'Bei Verkauf.', 'Matching Prinzip.'],
    explanation: ['Die Kosten werden aktiviert (Warenbestand) und erst im August, wenn das Auto verkauft wird, als Herstellungskosten Aufwand.'],
    sources: [src('RW-VL23', '15'), src('RW-D2', '1', 'zu Folie 15')],
  }),
  mc({
    id: 'rw.w.aktivieren.e2', chapterId: c2, formulaIds: ['rw.w.aktivieren'], skill: 'anwenden', difficulty: 1, origin: 'vorlesung',
    prompt: 'Gleicher Fall. Zu welchem Wert taucht das Auto Ende Mai in der Bilanz auf?',
    options: opts(
      ['12.000 € – so viel ist es nach der Reparatur wert.', 'Bewertet wird zu den Kosten, nicht zum erwarteten Verkaufswert.'],
      ['0 € – es ist noch nicht verkauft.', 'Es ist ein Vermögensgegenstand und steht deshalb in der Bilanz.'],
      '*10.000 € – die Einkaufs- und Produktionskosten werden bis zum Verkauf aktiviert.',
    ),
    hints: ['Steht das Auto in der Bilanz?', 'Zu welchem Wert – Kosten oder Verkaufswert?', 'Aktivierte Kosten.'],
    explanation: ['Bis zum Verkauf werden die Einkaufs- und Reparaturkosten aktiviert: 10.000 €.'],
    sources: [src('RW-VL23', '15'), src('RW-D2', '1', 'zu Folie 15')],
  }),
  mc({
    id: 'rw.w.aktivieren.e3', chapterId: c2, formulaIds: ['rw.w.aktivieren', 'rw.vorsicht'], skill: 'anwenden', difficulty: 2, origin: 'vorlesung',
    prompt: 'Warenbestand: VW Polo, eingekauft für 6.000 € (geschätzter Verkaufswert 7.500 €), und Audi A6, eingekauft für 9.000 € und repariert für 3.000 € (geschätzter Verkaufswert 12.500 €). Wie ist der Warenbestand „Autos“ zu bewerten?',
    options: opts(
      '*18.000 €',
      ['20.000 €', 'Das sind die geschätzten Verkaufswerte – bewertet wird zu Kosten.'],
      ['15.000 €', 'Die Reparaturkosten des Audi gehören zu seinen aktivierten Kosten.'],
    ),
    hints: ['Kosten oder Verkaufswerte?', 'Reparatur gehört zu den Kosten des Audi.', '6.000 + 9.000 + 3.000'],
    explanation: ['6.000 + 9.000 + 3.000 = 18.000 €. Wäre der Verkaufswert des Audi nur 10.500 € (unter seinen Kosten von 12.000 €), müsste er niedriger bewertet werden: Warenbestand 16.500 €.'],
    sources: [src('RW-VL23', '21'), src('RW-D2', '1', 'zu Folie 21')],
  }),
  mc({
    id: 'rw.w.aktivieren.e4', chapterId: c2, formulaIds: ['rw.w.aktivieren', 'rw.vorsicht'], skill: 'anwenden', difficulty: 2, origin: 'vorlesung',
    prompt: 'Gleicher Warenbestand, aber der geschätzte Verkaufswert des reparierten Audi A6 beträgt nur 10.500 €. Wie ist der Warenbestand „Autos“ jetzt zu bewerten?',
    options: opts(
      '*16.500 €',
      ['18.000 €', 'Der Audi ist weniger wert als seine Kosten (12.000 €) – er muss niedriger bewertet werden.'],
      ['18.000 € und zusätzlich eine Rückstellung', 'Nein, der Vermögensgegenstand selbst wird niedriger bewertet.'],
    ),
    hints: ['Liegt der Verkaufswert des Audi unter seinen Kosten?', '10.500 < 12.000', 'Polo 6.000 + Audi 10.500'],
    explanation: ['Der Audi wird auf 10.500 € abgewertet, der Polo bleibt bei 6.000 €: 16.500 €.'],
    sources: [src('RW-VL23', '21'), src('RW-D2', '1', 'zu Folie 21')],
  }),
  selfcheck({
    id: 'rw.w.aktivieren.e5', chapterId: c2, formulaIds: ['rw.w.aktivieren', 'rw.matching'], skill: 'abrufen', difficulty: 2, origin: 'vorlesung',
    prompt: 'Ein Autohersteller entwickelt 2024 eine neue Batterie; das erste Modell damit wird voraussichtlich 2025 verkauft. Welches Prinzip spricht dafür, die Entwicklungskosten (14,9 Mio. €) zu aktivieren und später abzuschreiben, und welche Bedingungen müssen dafür erfüllt sein?',
    modelAnswer: [
      'Das Matching Prinzip: Die Aufwendungen sollen den Umsatzerlösen zugeordnet werden, die sie verursachen – hier den späteren Verkäufen der Fahrzeuge.',
      'Voraussetzung ist, dass die Entwicklung einen Vermögensgegenstand darstellt: Sie repräsentiert einen zukünftigen ökonomischen Wert, der dem Unternehmen zufließt (1. Bedingung), und ist zuverlässig in Geldeinheiten messbar (2. Bedingung).',
    ],
    keywords: ['Matching Prinzip', 'Vermögensgegenstand', 'zukünftiger ökonomischer Wert', 'zuverlässig messbar'],
    hints: ['Wann entstehen die Umsätze?', 'Welches Prinzip ordnet Aufwand den Umsätzen zu?', 'Zwei Bedingungen für einen Vermögensgegenstand.'],
    sources: [src('RW-VL4', '16'), src('RW-D4', '2', 'zu Folie 16')],
  }),
  mc({
    id: 'rw.w.aktivieren.e6', chapterId: c2, formulaIds: ['rw.w.aktivieren'], skill: 'interpretieren', difficulty: 2, origin: 'vorlesung', variant: 'theorie',
    prompt: 'Der Händler zahlt 300 € in bar für die Aufbereitung (Reinigung) der verbleibenden Autos und bucht sie als Aufwand. Eine Variante wäre: Liquide Mittel −300, Warenbestand Autos +300. Was ist die wichtigste Überlegung für diese Variante?',
    options: opts(
      '*Ist es sicher genug, dass die Reinigung zu 300 € mehr Umsatzerlösen führt?',
      ['Wurde die Reinigung bar bezahlt?', 'Die Zahlungsweise ist für die Aktivierung nicht entscheidend.'],
      ['Ist die Reinigung steuerlich absetzbar?', 'Darum geht es hier nicht.'],
    ),
    hints: ['Wann darf man Kosten aktivieren?', 'Zukünftiger ökonomischer Wert …', '… der sicher genug ist.'],
    explanation: ['Aktiviert werden darf nur, was hinreichend sicher einen zukünftigen ökonomischen Wert hat – hier: höhere Umsatzerlöse durch die Reinigung.'],
    sources: [src('RW-VL23', '26'), src('RW-D2', '1', 'zu Folie 26')],
  }),

  // ---------------------------------------------------------------- Prinzipien an Fällen (VL 3/4)
  mc({
    id: 'rw.matching.e4', chapterId: c1, formulaIds: ['rw.matching', 'rw.w.aktivieren'], skill: 'auswaehlen', difficulty: 2, origin: 'vorlesung',
    prompt: 'Lohnkosten für Stunden, in denen Mitarbeiter Autos für den späteren Verkauf repariert haben, werden – wie Ersatzteile – im Warenbestand aktiviert. Welches Prinzip steckt dahinter?',
    options: opts(['Realisationsprinzip', 'Es geht nicht darum, wann Umsatz entsteht, sondern wann der Aufwand gezeigt wird.'], '*Matching Prinzip', ['Vorsichtsprinzip', 'Vorsicht würde eher für sofortigen Aufwand sprechen.'], ['Fortführungsprinzip'], ['Konsistenzprinzip']),
    hints: ['Wann sollen die Lohnkosten Aufwand werden?', 'Wenn das Auto verkauft wird.', 'Aufwand zu den Umsatzerlösen.'],
    explanation: ['Die Lohnkosten sollen dann Aufwand werden, wenn die reparierten Autos verkauft werden – Aufwand folgt den Umsatzerlösen (Matching Prinzip).'],
    sources: [src('RW-VL23', '42'), src('RW-D3', '2', 'zu Folie 42')],
  }),
  mc({
    id: 'rw.matching.e5', chapterId: c1, formulaIds: ['rw.matching'], skill: 'anwenden', difficulty: 1, origin: 'vorlesung',
    prompt: 'Amsterdam Auto’s verkauft einen Peugeot mit 12 Monaten Gewährleistung und schätzt die Gewährleistungskosten auf 225 €. Warum entstehen die Gewährleistungskosten schon jetzt?',
    options: opts(
      '*Weil diese Aufwendungen durch Umsatzerlöse in dieser Periode verursacht worden sind (Matching Prinzip).',
      ['Weil der Kunde bar bezahlt hat.', 'Die Zahlung des Kunden ist dafür nicht entscheidend.'],
      ['Weil die Reparatur schon durchgeführt wurde.', 'Es gab noch keine Reparatur – es ist eine Schätzung.'],
    ),
    hints: ['Wodurch werden die Gewährleistungskosten verursacht?', 'Durch den Verkauf.', 'Matching.'],
    explanation: ['Die Gewährleistungskosten hängen am Verkauf dieser Periode und werden deshalb jetzt als Aufwand (mit Rückstellung) gebucht.'],
    sources: [src('RW-VL23', '41'), src('RW-D3', '1', 'zu Folie 41')],
  }),
  mc({
    id: 'rw.vorsicht.e3', chapterId: c1, formulaIds: ['rw.vorsicht', 'rw.w.abschreibung'], skill: 'auswaehlen', difficulty: 2, origin: 'vorlesung',
    prompt: 'Während der Nutzungsdauer darf der Buchwert einer Maschine vom Marktwert abweichen – die Firma hat gar nicht vor, sie vor Ende der Nutzungsdauer zu verkaufen. Welches Prinzip erkennst du?',
    options: opts(['Realisationsprinzip'], ['Matching Prinzip', 'Matching erklärt das Abschreiben überhaupt, aber nicht, warum der Buchwert vom Marktwert abweichen darf.'], ['Vorsichtsprinzip'], '*Fortführungsprinzip', ['Konsistenzprinzip', 'Das betrifft den Methodenwechsel.']),
    hints: ['Was nimmt man über die Zukunft des Unternehmens an?', 'Es wird weitergearbeitet, nicht verkauft.', 'Going Concern.'],
    explanation: ['Man geht davon aus, dass das Unternehmen weiter tätig ist und die Maschine nutzt (Fortführungsprinzip). Deshalb muss der Buchwert nicht jederzeit dem Marktwert entsprechen.'],
    sources: [src('RW-VL4', '6'), src('RW-D4', '1', 'zu Folie 6')],
  }),
  mc({
    id: 'rw.vorsicht.e4', chapterId: c1, formulaIds: ['rw.vorsicht', 'rw.w.abschreibung'], skill: 'auswaehlen', difficulty: 1, origin: 'vorlesung',
    prompt: 'Ein Unternehmen ändert ausnahmsweise seine Abschreibungsmethode. Welches Prinzip muss es dann beachten?',
    options: opts(['Realisationsprinzip'], ['Matching Prinzip'], ['Vorsichtsprinzip'], ['Fortführungsprinzip'], '*Konsistenzprinzip'),
    hints: ['Darf man beliebig zwischen Methoden wechseln?', 'Stetigkeit über die Perioden.', 'Konsistenz.'],
    explanation: ['Man kann nicht zwischen Abschreibungsmethoden hin und her wechseln – Konsistenzprinzip (Stetigkeit).'],
    sources: [src('RW-VL4', '6, 12'), src('RW-D4', '1', 'zu Folie 12')],
  }),

  // ---------------------------------------------------------------- Abschreibung
  mc({
    id: 'rw.w.abschreibung.e1', chapterId: c3, formulaIds: ['rw.w.abschreibung'], skill: 'interpretieren', difficulty: 2, origin: 'vorlesung', variant: 'theorie',
    prompt: 'Wie beeinflusst die Wahl der Abschreibungsmethode den gesamten Gewinn über die komplette Nutzungsdauer?',
    options: opts(
      ['Sie beeinflusst den Gesamtgewinn – ob positiv oder negativ, hängt von der Methode ab.', 'Über die ganze Nutzungsdauer wird immer derselbe Betrag abgeschrieben.'],
      '*Sie beeinflusst den gesamten Gewinn nicht, nur den Gewinn pro Periode.',
      ['Weder den gesamten Gewinn noch den Gewinn pro Periode.', 'Die Verteilung über die Perioden ändert sich sehr wohl.'],
      ['Abschreibungen beeinflussen den Gewinn nicht, weil sie keine Auszahlungen sind.', 'Abschreibungen sind Aufwand und senken den Gewinn, auch ohne Auszahlung.'],
    ),
    hints: ['Wie viel wird insgesamt abgeschrieben?', 'Anfangswert − Restwert.', 'Nur die zeitliche Verteilung ändert sich.'],
    explanation: ['Insgesamt wird immer Anfangswert minus Restwert abgeschrieben. Die Methode verteilt diesen Betrag nur unterschiedlich auf die Perioden.'],
    sources: [src('RW-VL4', '6'), src('RW-D4', '1', 'zu Folie 6')],
  }),
  mc({
    id: 'rw.w.abschreibung.e2', chapterId: c3, formulaIds: ['rw.w.abschreibung'], skill: 'erkennen', difficulty: 2, origin: 'vorlesung',
    prompt: 'Lineare Abschreibung: Anfangsbuchwert 100.000 €, jährlich 18.000 € Abschreibung, Buchwert am Ende von Jahr 5: 10.000 € (Verkauf zum Restwert). Welche Zahlen sind Zahlungen?',
    options: opts(
      ['Nur 100.000 € (Anfangsbuchwert)', 'Auch der Verkauf am Ende führt zu einer Zahlung.'],
      ['Nur 10.000 € (Buchwert Ende Jahr 5)', 'Auch die Anschaffung ist eine Zahlung.'],
      '*100.000 € (Anfangsbuchwert) und 10.000 € (Buchwert Ende Jahr 5)',
      ['Die Abschreibungen in den Jahren 1 bis 5', 'Abschreibungen sind Aufwand, aber keine Zahlungen.'],
      ['Alle: Anfangsbuchwert, Endbuchwert und Abschreibungen', 'Abschreibungen sind keine Zahlungen.'],
    ),
    hints: ['Wann fließt tatsächlich Geld?', 'Kauf und Verkauf.', 'Abschreibung = Verteilung, kein Geldfluss.'],
    explanation: ['Gezahlt wird bei der Anschaffung (100.000 €) und beim Verkauf am Ende der Nutzungsdauer (10.000 €). Die Abschreibungen sind Aufwand ohne Zahlung.'],
    sources: [src('RW-VL4', '9'), src('RW-D4', '1', 'zu Folie 9')],
  }),
  match({
    id: 'rw.w.abschreibung.e3', chapterId: c3, formulaIds: ['rw.w.abschreibung'], skill: 'auswaehlen', difficulty: 2, origin: 'vorlesung',
    prompt: 'Welche Überlegung spricht für welche Abschreibungsmethode?',
    pairs: [
      { left: 'Die Maschine erbringt in den einzelnen Perioden sehr unterschiedlich viel Leistung.', right: 'Leistungsabschreibung' },
      { left: 'Gleiche Leistung über die Zeit, aber stark zunehmende Instandhaltungskosten.', right: 'Degressive Abschreibung' },
      { left: 'Einfache, verständliche und wenig aufwendige Buchführung.', right: 'Lineare Abschreibung' },
    ],
    hints: ['Was passt zu unterschiedlicher Leistung?', 'Hohe Abschreibung früh, hohe Instandhaltung spät …', 'Einfachheit.'],
    explanation: ['Unterschiedliche Leistung → Leistungsabschreibung; gleiche Leistung bei steigender Instandhaltung → degressiv (Gesamtaufwand je Periode gleichmäßiger); Einfachheit → linear.'],
    sources: [src('RW-VL4', '12'), src('RW-D4', '1', 'zu Folie 12')],
  }),
  trueFalse({
    id: 'rw.w.abschreibung.e4', chapterId: c3, formulaIds: ['rw.w.abschreibung'], skill: 'interpretieren', difficulty: 2, origin: 'vorlesung',
    prompt: 'Richtig oder falsch? (Abschreibungen)',
    statements: [
      ['Der Buchwert einer Maschine muss jederzeit ihrem Marktwert entsprechen.', false, 'Zwischendurch dürfen Buchwert und Marktwert abweichen; nur am Ende der Nutzungsdauer soll der Buchwert dem geschätzten Restwert entsprechen.'],
      ['Abschreibungen auf Basis von Wiederbeschaffungskosten sind im externen Rechnungswesen nicht erlaubt.', true, 'Steht so auf der Folie „Weitere Bemerkungen zu planmäßigen Abschreibungen“.'],
      ['Bei der progressiven Abschreibung steigen die Abschreibungsbeträge von Jahr zu Jahr; sie wird häufig angewendet.', false, 'Die Beträge steigen zwar, sie wird aber selten angewendet.'],
      ['Leistungsabschreibung: Kosten pro Leistungseinheit = gesamte Abschreibung ÷ geschätzte Gesamtzahl der Leistungseinheiten.', true, 'z. B. Stückzahl, km Fahrstrecke oder Maschinenstunden.'],
    ],
    hints: ['Fortführungsprinzip.', 'Externes Rechnungswesen: Anschaffungskosten als Basis.', '„selten angewendet“'],
    sources: [src('RW-VL4', '6, 12')],
  }),

  // ---------------------------------------------------------------- Rückstellungen, Vorräte, AC/VC (zusätzliche Fälle)
  mc({
    id: 'rw.rueckstellung.e5', chapterId: c3, formulaIds: ['rw.rueckstellung'], skill: 'anwenden', difficulty: 3, origin: 'vorlesung',
    prompt: 'Für einen Schadensersatzprozess wurde eine Rückstellung gebildet. Im Folgejahr zeigt sich, dass der Schaden höher ist als zurückgestellt. Wie wird der Mehrbetrag gebucht?',
    options: opts(
      ['Liquide Mittel − und EK −, in der GuV: Schadenkosten', 'Das ist nur eine der Möglichkeiten.'],
      ['Sonstige Verbindlichkeiten + und EK −, in der GuV: Schadenkosten', 'Das ist nur eine der Möglichkeiten.'],
      ['Rückstellungen + und EK −, in der GuV: Schadenkosten', 'Das ist nur eine der Möglichkeiten.'],
      '*Das hängt von den Umständen ab.',
    ),
    hints: ['Steht die Höhe schon fest? Wurde schon gezahlt?', 'Geschätzt, feststehend oder bezahlt?', 'Alle drei Varianten sind möglich.'],
    explanation: ['Alle drei Möglichkeiten können auftreten: Werden die höheren Kosten noch geschätzt → Rückstellung +; stehen sie fest, sind aber noch zu zahlen → sonstige Verbindlichkeit +; werden sie sofort bezahlt → Liquide Mittel −. In jedem Fall EK − und Schadenkosten in der GuV.'],
    sources: [src('RW-VL4', '20'), src('RW-D4', '2', 'zu Folie 20')],
  }),
  mc({
    id: 'rw.rueckstellung.e6', chapterId: c3, formulaIds: ['rw.rueckstellung'], skill: 'anwenden', difficulty: 2, origin: 'vorlesung',
    prompt: 'Gleicher Fall, aber der Schaden fällt niedriger aus als zurückgestellt. Wie wird der nicht benötigte Teil der Rückstellung gebucht?',
    options: opts(
      ['Liquide Mittel + und EK +, in der GuV: Sonstige Erträge', 'Es fließt kein Geld zu – die Rückstellung wird aufgelöst.'],
      ['Liquide Mittel + und EK +, in der GuV: negative Schadenkosten', 'Es fließt kein Geld zu.'],
      '*Rückstellungen − und EK +, in der GuV: Sonstige Erträge',
      ['Rückstellungen − und EK +, in der GuV: negative Schadenkosten', 'Die Auflösung wird als sonstiger Ertrag gezeigt, nicht als negativer Aufwand.'],
    ),
    hints: ['Fließt Geld?', 'Welcher Passivposten wird kleiner?', 'Ertrag oder negativer Aufwand?'],
    explanation: ['Der überschüssige Teil der Rückstellung wird aufgelöst: Rückstellungen −, EK +, in der GuV als Sonstige Erträge.'],
    sources: [src('RW-VL4', '20'), src('RW-D4', '2', 'zu Folie 20')],
  }),
  mc({
    id: 'rw.ac-vc.e4', chapterId: c3, formulaIds: ['rw.ac-vc'], skill: 'auswaehlen', difficulty: 2, origin: 'vorlesung',
    prompt: 'Welches Prinzip spricht für die Vollkostenrechnung (absorption costing, AC) bei der Bewertung der Herstellungskosten?',
    options: opts(['Realisationsprinzip'], '*Matching Prinzip', ['Vorsichtsprinzip', 'Vorsicht spräche eher für niedrigere Wertansätze (VC).'], ['Fortführungsprinzip'], ['Konsistenzprinzip']),
    hints: ['Was passiert bei AC mit den fixen Herstellungskosten?', 'Sie werden aktiviert …', '… und der Verkaufsperiode zugeordnet.'],
    explanation: ['Bei AC werden mehr Kosten (die fixen Herstellungskosten) der Verkaufsperiode zugeordnet – das entspricht dem Matching Prinzip.'],
    sources: [src('RW-VL4', '28'), src('RW-D4', '3', 'zu Folie 28')],
  }),
  mc({
    id: 'rw.ac-vc.e5', chapterId: c3, formulaIds: ['rw.ac-vc'], skill: 'interpretieren', difficulty: 2, origin: 'vorlesung', variant: 'theorie',
    prompt: 'Wann ist der Gewinn bei Vollkostenrechnung (AC) größer als bei Teilkostenrechnung (VC)?',
    options: opts(
      '*Wenn mehr produziert als verkauft wird (Vorräte steigen) – bei AC werden fixe Kosten aktiviert und in die Zukunft verschoben.',
      ['Wenn mehr verkauft als produziert wird (Vorräte sinken).', 'Dann ist der Gewinn bei VC größer: Bei AC kommen fixe Kosten aus früheren Perioden hinzu.'],
      ['Immer – AC führt grundsätzlich zu höheren Gewinnen.', 'Nein, es hängt von der Vorratsänderung ab.'],
    ),
    hints: ['Wohin gehen die fixen Herstellungskosten bei AC?', 'Teilweise in den Vorrat.', 'Vorräte steigen → weniger Aufwand.'],
    explanation: ['Steigen die Vorräte, werden bei AC fixe Herstellungskosten aktiviert → weniger Aufwand → höherer Gewinn als bei VC. Sinken die Vorräte, ist es umgekehrt. Gewinndifferenz = Vorratsänderung × fixe Herstellungskosten pro Stück.'],
    sources: [src('RW-VL4', '30'), src('RW-D4', '3', 'zu Folie 30')],
  }),

  // ---------------------------------------------------------------- Kostenklassifikation (VL 5, VL 7)
  match({
    id: 'rw.w.kostenklassifikation.e1', chapterId: c4, formulaIds: ['rw.w.kostenklassifikation'], skill: 'anwenden', difficulty: 2, origin: 'vorlesung',
    prompt: 'Produktionskosten – Kostenobjekt: Mercedes GLC, Kostentreiber: Produktionsvolumen. Ordne zu.',
    pairs: [
      { left: 'Materialkosten der verwendeten Reifen', right: 'variable Einzelkosten' },
      { left: 'Kosten der Werkzeuge nur für das Modell GLC', right: 'fixe Einzelkosten' },
      { left: 'Stromkosten der Produktionshalle, in der unterschiedliche Modelle produziert werden', right: 'variable Gemeinkosten' },
      { left: 'Jährliche Abschreibungskosten der Produktionshalle', right: 'fixe Gemeinkosten' },
    ],
    hints: ['Zwei Fragen je Posten: direkt dem GLC zurechenbar? Ändert er sich mit der Menge?', 'Werkzeuge nur für den GLC: zurechenbar, aber mengenunabhängig.', 'Strom für mehrere Modelle: nicht direkt zurechenbar, aber mengenabhängig.'],
    explanation: ['Reifen (1): variabel/Einzel · Werkzeuge nur GLC (3): fix/Einzel · Strom der Halle (6): variabel/Gemein · Abschreibung der Halle (7): fix/Gemein.'],
    sources: [src('RW-VL5', '28'), src('RW-D5', '1', 'zu Folie 28 und 29')],
  }),
  match({
    id: 'rw.w.kostenklassifikation.e2', chapterId: c4, formulaIds: ['rw.w.kostenklassifikation'], skill: 'anwenden', difficulty: 2, origin: 'vorlesung',
    prompt: 'Nicht-Produktionskosten – Kostenobjekt: Mercedes GLC, Kostentreiber: Produktionsvolumen. Ordne zu.',
    pairs: [
      { left: 'Gewährleistungskosten für jedes verkaufte Auto', right: 'variable Einzelkosten' },
      { left: 'Kosten der technischen Dokumentation für das Modell GLC', right: 'fixe Einzelkosten' },
      { left: 'Distributionskosten aller Autos', right: 'variable Gemeinkosten' },
      { left: 'Entwicklungskosten für ein 9-Gang-Automatikgetriebe', right: 'fixe Gemeinkosten' },
    ],
    hints: ['Gilt der Posten nur für den GLC?', 'Steigt er mit jedem verkauften Auto?', 'Das Getriebe wird in mehreren Modellen verwendet.'],
    explanation: ['Gewährleistung je Auto (8): variabel/Einzel · Dokumentation GLC (4): fix/Einzel · Distribution aller Autos (5): variabel/Gemein · Getriebeentwicklung (2): fix/Gemein.'],
    sources: [src('RW-VL5', '29'), src('RW-D5', '1', 'zu Folie 28 und 29')],
  }),
  mc({
    id: 'rw.w.kostenklassifikation.e3', chapterId: c4, formulaIds: ['rw.w.kostenklassifikation'], skill: 'interpretieren', difficulty: 2, origin: 'vorlesung', variant: 'theorie',
    prompt: 'Henk lässt Motive für Autoaufkleber entwerfen. Die Entwurfskosten hängen davon ab, wie viele neue Motive es gibt – nicht davon, wie viele Aufkleber produziert werden. Sind Entwurfskosten fix oder variabel?',
    options: opts(
      ['Variabel im Verhältnis zur Anzahl neuer Motive.', 'Stimmt, aber unvollständig.'],
      ['Fix, z. B. im Verhältnis zum Produktionsvolumen der Autoaufkleber.', 'Stimmt, aber unvollständig.'],
      '*Sowohl variabel (zur Anzahl neuer Motive) als auch fix (z. B. zum Produktionsvolumen).',
      ['Ohne weitere Information nicht zu beantworten.', 'Doch – wenn man den Kostentreiber jeweils angibt.'],
    ),
    hints: ['Fix/variabel immer im Verhältnis zu …?', 'Es gibt zwei mögliche Kostentreiber.', 'Beides gleichzeitig.'],
    explanation: ['„Fix“ oder „variabel“ gilt immer im Verhältnis zu einem Kostentreiber: variabel zur Anzahl neuer Motive, fix zum Produktionsvolumen.'],
    sources: [src('RW-VL7', '24'), src('RW-D7', '1', 'zu Folie 24')],
  }),
  trueFalse({
    id: 'rw.w.kostenklassifikation.e4', chapterId: c4, formulaIds: ['rw.w.kostenklassifikation'], skill: 'interpretieren', difficulty: 2, origin: 'vorlesung',
    prompt: 'Richtig oder falsch? (Umstellungskosten in der Lackiererei)',
    statements: [
      ['Umstellungskosten sind variabel im Verhältnis zur Anzahl der Serien.', true, 'Für jede Serie muss die Kabine umgerüstet und gereinigt werden.'],
      ['Umstellungskosten sind variabel im Verhältnis zum Produktionsvolumen.', false, 'Wie viele Stücke eine Serie hat, ist für diese Kosten unwichtig – sie sind fix zum Produktionsvolumen.'],
      ['Kleinere Seriengrößen senken die Kosten pro Stück.', false, 'Umgekehrt: Kleinere Serien bedeuten mehr Umstellungen je Stück, die Kosten pro Stück steigen.'],
    ],
    hints: ['Wovon hängen die Umstellungskosten ab?', 'Anzahl der Serien.', 'Fixer Betrag je Serie auf weniger Stück verteilt.'],
    sources: [src('RW-VL7', '25'), src('RW-D7', '2', 'zu Folie 25')],
  }),

  // ---------------------------------------------------------------- Leistungsverrechnung (VL 6)
  mc({
    id: 'rw.w.leistungsverrechnung.e1', chapterId: c5, formulaIds: ['rw.w.leistungsverrechnung'], skill: 'interpretieren', difficulty: 2, origin: 'vorlesung', variant: 'theorie',
    prompt: 'Im Anbauverfahren kostet ein Essen der Kantine 2,79 € (46.000 € ÷ 16.500 Essen an Endkostenstellen). Vorher wurden als „Kosten pro Leistungseinheit“ niedrigere Werte berechnet. Warum weichen die Verrechnungspreise ab?',
    options: opts(
      '*Die gleichen Kosten werden jetzt durch weniger Leistungseinheiten geteilt – nur durch die Leistungen an die Endkostenstellen.',
      ['Weil im Anbauverfahren zusätzliche Kosten hinzukommen.', 'Die Kosten sind dieselben; nur der Nenner ist kleiner.'],
      ['Weil der Verrechnungspreis einen Gewinnzuschlag enthält.', 'Verrechnungspreise enthalten keinen Gewinnaufschlag.'],
    ),
    hints: ['Was steht im Zähler, was im Nenner?', 'Welche Leistungen zählt das Anbauverfahren?', 'Nur Endkostenstellen.'],
    explanation: ['Beim Anbauverfahren werden die Leistungen an andere Vorkostenstellen (und der Eigenverbrauch) nicht berücksichtigt. Dieselben Kosten verteilen sich auf weniger Einheiten → höherer Verrechnungspreis.'],
    sources: [src('RW-VL6', '15'), src('RW-D6', '1', 'zu Folie 15')],
  }),
  mc({
    id: 'rw.w.leistungsverrechnung.e2', chapterId: c5, formulaIds: ['rw.w.leistungsverrechnung'], skill: 'erkennen', difficulty: 2, origin: 'vorlesung',
    prompt: 'Amsterdam Auto’s verteilt die Kosten von Verwaltung, Kita + Kantine und Lager nacheinander: Die Verwaltung belastet auch die beiden anderen Vorkostenstellen, die Kantine auch das Lager, das Lager nur noch Endkostenstellen. Welches Verfahren ist das?',
    options: opts(['Anbauverfahren', 'Beim Anbauverfahren belasten sich Vorkostenstellen nicht gegenseitig.'], '*Stufenleiterverfahren', ['Gleichungsverfahren', 'Beim Gleichungsverfahren wäre auch eine Belastung in Gegenrichtung möglich.']),
    hints: ['Belasten sich Vorkostenstellen gegenseitig?', 'In eine oder in beide Richtungen?', 'Nur „nach unten“.'],
    explanation: ['Verrechnung auch zwischen Vorkostenstellen, aber nur in eine Richtung: Stufenleiterverfahren.'],
    sources: [src('RW-VL6', '11, 29'), src('RW-D6', '1', 'zu Folie 29')],
  }),
  mc({
    id: 'rw.w.leistungsverrechnung.e3', chapterId: c5, formulaIds: ['rw.w.leistungsverrechnung'], skill: 'interpretieren', difficulty: 1, origin: 'vorlesung', variant: 'theorie',
    prompt: 'Im Betriebsabrechnungsbogen von Amsterdam Auto’s werden die Kostenarten Lohnkosten, Sachkosten, Abschreibungen und kalkulatorische Zinsen sowie Versicherungen getrennt ausgewiesen. Werden diese Kostenarten immer so aufgegliedert?',
    options: opts(
      ['Ja, diese Kostenarten werden fast immer aufgegliedert.', 'Welche Kostenarten relevant sind, hängt von der Situation ab.'],
      '*Nein, nicht unbedingt.',
      ['Das kann man so nicht sagen, dazu wäre mehr Information nötig.', 'Die offizielle Antwort ist eindeutig: nicht unbedingt.'],
    ),
    hints: ['Muss man Versicherungen im Detail kennen?', 'Sachkosten möchte man vielleicht genauer verstehen.', 'Situationsabhängig.'],
    explanation: ['Versicherungen braucht man hier nicht im Detail separat auszuweisen; Sachkosten und Abschreibungen möchte man dagegen genauer verstehen. Die relevanten Kostenarten muss man in jeder Situation selbst bestimmen.'],
    sources: [src('RW-VL6', '11'), src('RW-D6', '1', 'zu Folie 11')],
  }),
  selfcheck({
    id: 'rw.w.leistungsverrechnung.e4', chapterId: c5, formulaIds: ['rw.w.leistungsverrechnung', 'rw.anbau', 'rw.stufenleiter', 'rw.gleichungsverfahren'], skill: 'abrufen', difficulty: 2, origin: 'vorlesung',
    prompt: 'Nenne Überlegungen, die bei der Wahl zwischen Anbau-, Stufenleiter- und Gleichungsverfahren eine Rolle spielen.',
    modelAnswer: [
      'Wie viel liefern die Vorkostenstellen untereinander? (Bei viel gegenseitiger Lieferung wird das Anbauverfahren ungenau.)',
      'Sind alle Daten für eine ausführlichere Methode vorhanden?',
      'Das Gleichungsverfahren wird im Unternehmen vielleicht weniger gut verstanden – das ist ein Nachteil.',
    ],
    keywords: ['Lieferungen zwischen Vorkostenstellen', 'Datenverfügbarkeit', 'Verständlichkeit'],
    hints: ['Wie stark sind die Vorkostenstellen verflochten?', 'Woher kommen die Daten?', 'Wer muss das Ergebnis verstehen?'],
    sources: [src('RW-VL6', '12'), src('RW-D6', '1', 'zu Folie 12')],
  }),

  // ---------------------------------------------------------------- Grenzen der Kalkulation (VL 6/7)
  mc({
    id: 'rw.w.kalkulationsgrenzen.e1', chapterId: c6, formulaIds: ['rw.w.kalkulationsgrenzen'], skill: 'interpretieren', difficulty: 1, origin: 'vorlesung',
    prompt: 'Ein Passat wurde für 14.560 € eingekauft und wird für 18.200 € verkauft. Werkstattstunden und Autoteile wurden noch nicht bewertet (die Gemeinkosten sind noch nicht verteilt). Ist der Verkauf gewinnbringend?',
    options: opts(
      ['Ja, 18.200 € ist klar mehr als 14.560 €.', 'Es fehlen noch Kosten.'],
      ['Ja, 18.200 € ist klar mehr als 14.560 € + 452 € (Autoteile).', 'Auch die Werkstattstunden kosten etwas.'],
      ['Nein, 18.200 € reichen nicht, wenn die Werkstattstunden mitgerechnet werden.', 'Das weiß man noch nicht.'],
      '*Das kann jetzt noch nicht festgestellt werden, weil die Daten dafür nicht ausreichen.',
    ),
    hints: ['Sind alle Kosten bekannt?', 'Was kostet eine Werkstattstunde?', 'Erst Kostenstellenrechnung, dann Urteil.'],
    explanation: ['Ohne Kosten für Werkstattstunden (die erst über die Kostenstellenrechnung bestimmt werden) lässt sich noch nicht sagen, ob der Verkauf gewinnbringend ist.'],
    sources: [src('RW-VL6', '8'), src('RW-D6', '1', 'zu Folie 8')],
  }),
  mc({
    id: 'rw.w.kalkulationsgrenzen.e2', chapterId: c6, formulaIds: ['rw.w.kalkulationsgrenzen'], skill: 'interpretieren', difficulty: 2, origin: 'vorlesung',
    prompt: 'Nach der vollständigen Kalkulation betragen die berechneten Kosten des Passats 15.866 €. Er wird für 18.200 € verkauft. Ist der Verkauf gewinnbringend?',
    options: opts(
      '*Ja, der Verkaufspreis von 18.200 € liegt über den berechneten Kosten von 15.866 €.',
      ['Nein bzw. unklar, weil die berechneten Kosten zu ungenau sind.', 'Bei einem so großen Abstand (über 2.300 €) ist das Urteil eindeutig.'],
      ['Zu früh – zuerst müssen alle Kosten den Kostenträgern zugerechnet werden.', 'Das ist jetzt bereits geschehen.'],
    ),
    hints: ['Wie groß ist der Abstand zwischen Preis und Kosten?', 'Über 2.300 €.', 'Ungenauigkeit spielt erst bei knappen Abständen eine Rolle.'],
    explanation: ['Der Preis liegt deutlich über den berechneten Kosten – trotz aller Näherungen ist der Verkauf gewinnbringend.'],
    sources: [src('RW-VL6', '31'), src('RW-D6', '2', 'zu Folie 31')],
  }),
  mc({
    id: 'rw.w.kalkulationsgrenzen.e3', chapterId: c6, formulaIds: ['rw.w.kalkulationsgrenzen'], skill: 'interpretieren', difficulty: 2, origin: 'vorlesung',
    prompt: 'Und wenn der Passat (berechnete Kosten 15.866 €) für 15.900 € verkauft wird – ist der Verkauf gewinnbringend?',
    options: opts(
      ['Ja, 15.900 € liegen über den berechneten Kosten von 15.866 €.', 'Der Abstand ist so klein, dass die Ungenauigkeit der Kalkulation entscheidet.'],
      '*Nein bzw. unklar: Die berechneten Kosten sind zu ungenau, um sicher sagen zu können, ob der Preis höher ist.',
      ['Zu früh – zuerst müssen alle Kosten den Kostenträgern zugerechnet werden.', 'Das ist bereits geschehen.'],
    ),
    hints: ['Wie genau sind 15.866 €?', 'Viele Annahmen und Näherungen.', 'Abstand nur 34 €.'],
    explanation: ['Bei der Berechnung wurden viele Annahmen und Näherungen gemacht; 15.865,76 € ist ein grobes Ergebnis. Bei 34 € Abstand lässt sich nicht eindeutig feststellen, ob der Verkauf gewinnbringend ist.'],
    examTip: 'Bei „Ist der Verkauf gewinnbringend?“ immer prüfen, wie groß der Abstand im Verhältnis zur Ungenauigkeit ist.',
    sources: [src('RW-VL6', '31'), src('RW-D6', '2', 'zu Folie 31')],
  }),
  mc({
    id: 'rw.w.kalkulationsgrenzen.e4', chapterId: c6, formulaIds: ['rw.w.kalkulationsgrenzen'], skill: 'interpretieren', difficulty: 1, origin: 'vorlesung', variant: 'theorie',
    prompt: '„Die Mitarbeiter in der Werkstatt verdienen etwa 47 € pro Stunde“ – so könnte man den Lohnstundensatz Werkstatt von 46,85 € deuten. Warum ist das falsch?',
    options: opts(
      '*Alle Kosten der Werkstatt (Löhne, Büromaterial, Abschreibung, Wartung, Energie, Wasser …) wurden durch die Lohnstunden geteilt.',
      ['Weil der Stundensatz Sozialabgaben nicht enthält.', 'Im Gegenteil: Er enthält viel mehr als nur Lohnkosten.'],
      ['Weil der Satz nur für Überstunden gilt.', 'Das hat damit nichts zu tun.'],
    ),
    hints: ['Was steht im Zähler des Lohnstundensatzes?', 'Nur Löhne?', 'Alle Kosten der Kostenstelle.'],
    explanation: ['Der Lohnstundensatz ist „alle Kosten der Werkstatt ÷ Lohnstunden“. Er ist deshalb kein Stundenlohn.'],
    sources: [src('RW-VL6', '30'), src('RW-D6', '1', 'zu Folie 30')],
  }),
  mc({
    id: 'rw.w.kalkulationsgrenzen.e5', chapterId: c6, formulaIds: ['rw.w.kalkulationsgrenzen', 'rw.zuschlagskalkulation'], skill: 'interpretieren', difficulty: 2, origin: 'vorlesung', variant: 'theorie',
    prompt: 'Die Zuschlagskalkulation verteilt Materialgemeinkosten z. B. mit „immer 30 % der Materialeinkaufskosten“. Wann trifft diese Annahme nicht zu?',
    options: opts(
      '*Wenn teure Materialien in der Verwaltung (Beschaffung, Kontrolle, Lagerhaltung) wenig Aufwand machen, billige Materialien aber viel.',
      ['Wenn die Materialpreise im Jahr steigen.', 'Die Preisentwicklung ist hier nicht der Punkt.'],
      ['Wenn das Unternehmen nur ein Produkt herstellt.', 'Dann bräuchte man keine Zuschlagskalkulation – das ist aber kein Gegenbeispiel zur Annahme.'],
    ),
    hints: ['Welche Annahme steckt in „immer 30 %“?', 'Einzelkosten verursachen Gemeinkosten proportional.', 'Gegenbeispiel: billig, aber aufwendig.'],
    explanation: ['Die Zuschlagskalkulation unterstellt, dass die Höhe der Einzelkosten die Gemeinkosten proportional verursacht. Machen billige Materialien viel und teure wenig Verwaltungsaufwand, stimmt das nicht.'],
    sources: [src('RW-VL7', '9'), src('RW-D7', '1', 'zu Folie 9')],
  }),
  selfcheck({
    id: 'rw.w.kalkulationsgrenzen.e6', chapterId: c6, formulaIds: ['rw.w.kalkulationsgrenzen'], skill: 'abrufen', difficulty: 2, origin: 'vorlesung',
    prompt: 'Nenne Gründe, warum die berechneten Kosten eines Produkts (z. B. des Passats bei Amsterdam Auto’s) nur eine Annäherung sind.',
    modelAnswer: [
      'Die Zuordnung der Kostenstellen-Gemeinkosten auf Kostenstellen basierte nicht immer auf genauen Daten (Verteilungsschlüssel).',
      'Das Gleiche gilt für die Verteilung der Kosten der Vorkostenstellen auf die Endkostenstellen.',
      'Und für die weitere Verteilung der Kosten auf die Produkte (Kostenträger).',
    ],
    keywords: ['Verteilungsschlüssel', 'Gemeinkosten auf Kostenstellen', 'Vor- auf Endkostenstellen', 'auf Kostenträger'],
    hints: ['Drei Verteilungsschritte.', 'Wie genau sind Verteilungsschlüssel?', 'Kostenarten → Kostenstellen → Kostenträger.'],
    sources: [src('RW-VL7', '21'), src('RW-D7', '1', 'zu Folie 21')],
  }),
  trueFalse({
    id: 'rw.w.kalkulationsgrenzen.e7', chapterId: c6, formulaIds: ['rw.w.kalkulationsgrenzen'], skill: 'interpretieren', difficulty: 2, origin: 'vorlesung',
    prompt: 'Richtig oder falsch? (Kalkulationsverfahren)',
    statements: [
      ['Maschinenstundensatz- und Lohnstundensatzkalkulation lassen sich kombinieren.', true, 'Ja, wenn es sowohl maschinen- als auch lohnabhängige Fertigungsgemeinkosten gibt.'],
      ['Mit den variablen Kosten pro Stück lässt sich beantworten, wie sich die Kosten ändern, wenn Produktions- und Verkaufsmenge etwas steigt oder sinkt.', true, 'Das ist die Frage, die erst die Teilkostenrechnung beantworten kann.'],
      ['Lohnkosten und Abschreibungen werden immer direkt den Produkten zugeordnet.', false, 'Sie werden Kostenstellen zugeordnet (wenn Personen und Sachmittel nur dort arbeiten) bzw. auf Kostenstellen verteilt; den Produkten direkt zugeordnet werden z. B. Materialkosten, Autoteile und Einkaufspreise der Autos.'],
    ],
    hints: ['Gibt es Gemeinkosten beider Art?', 'Teil- vs. Vollkostenrechnung.', 'Was sind hier Einzelkosten der Produkte?'],
    sources: [src('RW-VL7', '17, 18, 22'), src('RW-D7', '1')],
  }),
]

export const officialChecks: { id: string; value: number; dec: number; note: string }[] = []
