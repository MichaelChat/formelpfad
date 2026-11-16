/**
 * Numerische Mathematik – Kapitel 1: Gleitpunktrechnung, Fehlerquellen, Kondition, Stabilität.
 * Quellen: Skript (Stand 9.7.2026, Seitenangaben = PDF-Seite), Übungsblatt 2, Altklausuren.
 * Papier-Aufgaben stehen am Ende der jeweiligen Lektion (Lesson.paperTaskIds).
 */
import { fmt } from '../../lib/format'
import { mc, numeric, opts, paper, src, trueFalse, wissen } from '../helpers'
import type { Chapter, Exercise, Formula, Variable } from '../types'

const t = String.raw
const ch = 'num-gleitpunkt'

const vB: Variable = { sym: 'B', tex: 'B', name: 'Basis (z. B. 2 oder 10)', domain: [2, 16] }
const vLm: Variable = { sym: 'L_m', tex: 'L_m', name: 'Mantissenlänge (Anzahl der Mantissenstellen)', domain: [1, 12] }
const vemax: Variable = { sym: 'e_max', tex: 'e_{\\max}', name: 'größter Exponent', domain: [1, 10] }
const vepsN: Variable = { sym: 'eps', tex: '\\mathrm{eps}', name: 'relative Maschinengenauigkeit' }
const vmaxFL: Variable = { sym: 'maxFL', tex: '\\max \\mathrm{FL}', name: 'größte Gleitpunktzahl' }

export const chapters: Chapter[] = [
  {
    id: ch,
    part: 'num',
    number: '1',
    title: 'Gleitpunktzahlen, Kondition und Stabilität',
    description: 'Wie der Computer reelle Zahlen speichert, woher Fehler kommen und warum man zwischen der Kondition eines Problems und der Stabilität eines Algorithmus unterscheidet.',
    sources: [src('NUM-SKRIPT', '10–18'), src('NUM-VL03', '1–31')],
    lessons: [
      {
        id: 'l-num-fehler',
        knowledge: true,
        title: 'Worum geht es in der Numerik?',
        goal: 'Die drei Fehlerquellen benennen: gestörte Daten, Verfahrensfehler, Rundung.',
        formulaIds: ['num.w.fehlerquellen'],
      },
      {
        id: 'l-num-gleitpunkt',
        title: 'Gleitpunktzahlen',
        goal: 'Verstehen, wie eine normalisierte Gleitpunktzahl aufgebaut ist, und die größte und kleinste Zahl bestimmen.',
        formulaIds: ['num.w.gleitpunkt', 'num.fl-grenzen'],
        paperTaskIds: ['num.p.ub2-1b', 'num.p.ss19-6a', 'num.p.ss20-6b'],
      },
      {
        id: 'l-num-eps',
        title: 'Maschinengenauigkeit eps',
        goal: 'eps herleiten, als relativen Rundungsfehler deuten und für IEEE double kennen.',
        formulaIds: ['num.eps'],
        paperTaskIds: ['num.p.ss17-6a', 'num.p.ss24-1'],
      },
      {
        id: 'l-num-kondition',
        knowledge: true,
        title: 'Kondition und Auslöschung',
        goal: 'Erklären, was Kondition misst, und Auslöschung erkennen und durch Umformen vermeiden.',
        formulaIds: ['num.w.kondition', 'num.w.ausloeschung'],
        paperTaskIds: ['num.p.ub2-1c', 'num.p.ws1920-6e'],
      },
      {
        id: 'l-num-stabilitaet',
        knowledge: true,
        title: 'Stabilität eines Algorithmus',
        goal: 'Stabile und instabile Rechenwege unterscheiden und begründen, warum ein Algorithmus instabil ist.',
        formulaIds: ['num.w.stabilitaet'],
        paperTaskIds: ['num.p.ws2021-6a'],
      },
    ],
  },
]

export const formulas: Formula[] = [
  wissen({
    id: 'num.w.fehlerquellen',
    name: 'Fehlerquellen beim numerischen Lösen',
    short: 'Daten · Verfahren · Rundung',
    chapterId: ch,
    definition: 'Numerische Mathematik entwickelt Verfahren für Probleme ohne bekannte analytische Lösung und untersucht die dabei entstehenden Fehler. Fehler entstehen an drei Stellen: in den Eingabedaten, im Verfahren selbst (Approximation) und durch Rundung in der Gleitpunktarithmetik.',
    keyPoints: [
      'Ablauf: Praktisches Problem → (Modellbildung) → mathematisches Problem → (numerisches Verfahren) → Resultat.',
      'Approximationsfehler: Das Verfahren liefert oft nur eine Näherung, z. B. weil eine Iteration abgebrochen wird.',
      'Rundungsfehler: Der Computer kann nur endlich viele Zahlen darstellen; jede Rechnung wird gerundet.',
      'Datenfehler: Messfehler, verrauschte Daten oder schon die Rundung der Eingabe. Sie sind kaum beeinflussbar.',
      'Wie stark wirken sich Datenfehler aus? → Kondition des Problems. Wie stark wirken sich Fehler im Verfahren aus? → Stabilität des Algorithmus.',
    ],
    mistakes: ['Kondition und Stabilität verwechseln: Kondition gehört zum Problem, Stabilität zum Algorithmus.'],
    examTip: 'Merksatz für Erklär-Aufgaben: „Kondition = Problem, Stabilität = Verfahren“.',
    related: ['num.w.kondition', 'num.w.stabilitaet'],
    sources: [src('NUM-SKRIPT', '10, 16')],
  }),
  wissen({
    id: 'num.w.gleitpunkt',
    name: 'Normalisierte Gleitpunktzahlen',
    short: 'm · Bᵉ',
    chapterId: ch,
    tex: t`x = m \cdot B^e,\quad m = \pm\sum_{l=1}^{L_m} a_l B^{-l},\ a_1 \neq 0`,
    definition: 'Der Computer stellt eine Zahl als Mantisse mal Basis hoch Exponent dar: x = m · Bᵉ. Die Mantisse hat L_m Stellen a₁ … a_{L_m} zur Basis B, der Exponent liegt zwischen e_min und e_max. „Normalisiert“ heißt: die erste Mantissenstelle ist nicht 0, also B⁻¹ ≤ |m| < 1. Dadurch ist die Darstellung eindeutig.',
    keyPoints: [
      'Basis $B \\geq 2$, meist 2. Mantisse: $B^{-1} \\le |m| < 1$ (wegen $a_1 \\neq 0$).',
      'Exponent: $e = e_{\\min} + \\sum_{l=0}^{L_e-1} c_l B^l$ mit $L_e$ Stellen, also $e_{\\max} = e_{\\min} + B^{L_e} - 1$.',
      'FL ist endlich und besteht nur aus rationalen Zahlen. Die Zahlen liegen nicht gleichmäßig verteilt: nahe 0 dicht, für große Zahlen weit auseinander.',
      'Pro Exponent gibt es $(B-1)\\,B^{L_m-1}$ positive Mantissen (erste Stelle $1 \\dots B-1$, Rest beliebig).',
      'Runden: $\\mathrm{fl}(x)$ ist die nächstgelegene Gleitpunktzahl (bei $a_{L_m+1} \\ge B/2$ wird aufgerundet).',
      'Kleiner als $\\min \\mathrm{FL}^+$ → Unterlauf ($\\mathrm{fl}(x)=0$); größer als $\\max \\mathrm{FL}$ → Überlauf ($\\pm\\infty$).',
    ],
    example: {
      problem: 'Stelle 10,75 normalisiert zur Basis 10 (L_m = 5) und zur Basis 2 (L_m = 6) dar.',
      steps: [
        'Basis 10: $10{,}75 = 0{,}10750 \\cdot 10^2$, also Mantisse $0{,}10750$, Exponent $e = 2$.',
        'Basis 2: $10{,}75 = 2^3 + 2^1 + 2^{-1} + 2^{-2} = 1010{,}11_2$.',
        'Komma so verschieben, dass die erste Nachkommastelle 1 ist: $1010{,}11_2 = 0{,}101011_2 \\cdot 2^4$.',
      ],
      result: '0,10750 · 10² bzw. 0,101011₂ · 2⁴',
      source: src('NUM-SKRIPT', '13', 'Beispiel 4'),
    },
    mistakes: [
      'Mantisse $\\ge 1$ wählen (z. B. $1{,}0101 \\cdot 2^3$): Im Skript liegt die Mantisse in $[B^{-1}, 1)$.',
      'Vergessen, dass $a_1 \\neq 0$ gelten muss. Deshalb ist die kleinste Mantisse $B^{-1}$, nicht 0.',
    ],
    related: ['num.fl-grenzen', 'num.eps'],
    sources: [src('NUM-SKRIPT', '13–15'), src('NUM-UB02', '1–2', 'Aufgabe 1')],
  }),
  {
    id: 'num.fl-grenzen',
    name: 'Größte und kleinste Gleitpunktzahl',
    short: 'max FL, min FL⁺',
    chapterId: ch,
    tex: t`\max \mathrm{FL} = B^{e_{\max}}\left(1 - B^{-L_m}\right),\qquad \min \mathrm{FL}^+ = B^{e_{\min}-1}`,
    lhs: 'maxFL',
    rhs: 'B^e_max*(1-B^(-L_m))',
    variables: [vmaxFL, vB, vemax, vLm],
    assumptions: ['Normalisierte Gleitpunktzahlen nach Definition 1 des Skripts.', '$e_{\\max} = e_{\\min} + B^{L_e} - 1$.'],
    intuition: 'Größte Zahl: größte Mantisse (alle Stellen B − 1, das ergibt 1 − B^{−L_m}) mal größter Exponent. Kleinste positive Zahl: kleinste Mantisse B⁻¹ (nur a₁ = 1) mal kleinster Exponent.',
    interpretation: 'Außerhalb von [min FL⁺, max FL] gibt es Unter- bzw. Überlauf. Bei IEEE double liegen die Grenzen bei etwa 10⁻³⁰⁸ und 10³⁰⁸.',
    useCases: ['Wertebereich einer Gleitpunktarithmetik angeben', 'Erklären, warum ein Produkt vieler kleiner Zahlen zu 0 wird (Unterlauf)'],
    mistakes: [
      '$e_{\\max} = e_{\\min} + B^{L_e}$ statt $e_{\\min} + B^{L_e} - 1$ (die Ziffern laufen nur bis $B-1$).',
      'Für $\\min \\mathrm{FL}^+$ die Mantisse $B^{-L_m}$ statt $B^{-1}$ nehmen: Normalisierung verlangt $a_1 \\neq 0$.',
    ],
    example: {
      problem: 'B = 2, e_min = −1, L_m = 2, L_e = 3: Bestimme e_max, max FL und min FL⁺.',
      steps: ['$e_{\\max} = -1 + 2^3 - 1 = 6$', '$\\max \\mathrm{FL} = 2^6 (1 - 2^{-2}) = 64 \\cdot 0{,}75 = 48$', '$\\min \\mathrm{FL}^+ = 2^{-1-1} = 0{,}25$'],
      result: 'e_max = 6, max FL = 48, min FL⁺ = 1/4',
      source: src('NUM-UB02', '1–2', 'Aufgabe 1 b)'),
    },
    related: ['num.w.gleitpunkt', 'num.eps'],
    difficulty: 1,
    sources: [src('NUM-SKRIPT', '13'), src('NUM-UB02', '1–2', 'Aufgabe 1 a)')],
    status: 'geprüft',
  },
  {
    id: 'num.eps',
    name: 'Maschinengenauigkeit eps',
    short: 'eps = ½ B^{1−L_m}',
    chapterId: ch,
    tex: t`\mathrm{eps} = \tfrac{1}{2} B^{1-L_m},\qquad \mathrm{fl}(x) = x(1+\epsilon),\ |\epsilon| \le \mathrm{eps}`,
    lhs: 'eps',
    rhs: 'B^(1-L_m)/2',
    variables: [vepsN, vB, vLm],
    assumptions: ['Runden zur nächstgelegenen Gleitpunktzahl.', 'Kein Über- oder Unterlauf: $\\min \\mathrm{FL}^+ \\le |x| \\le \\max \\mathrm{FL}$.'],
    intuition: 'Beim Runden auf L_m Stellen ist der absolute Fehler höchstens eine halbe Einheit der letzten Stelle, also ½ B^{e−L_m}. Teilt man durch |x| ≥ B^{e−1}, bleibt ½ B^{1−L_m}. Die Genauigkeit hängt also nur von der Mantissenlänge ab, nicht von der Größe der Zahl.',
    interpretation: 'eps ist eine Schranke für den relativen Rundungsfehler. Auch jede Grundoperation erfüllt x ⊙ y = (x ∘ y)(1 + ε) mit |ε| ≤ eps. IEEE double: eps = 2⁻⁵² ≈ 2,2 · 10⁻¹⁶, also etwa 16 Dezimalstellen.',
    useCases: ['Relative Genauigkeit einer Gleitpunktarithmetik angeben', 'Entscheiden, ob 1 + y in Gleitpunktarithmetik noch größer als 1 ist'],
    whenNot: ['Bei Unter- oder Überlauf gilt die Abschätzung nicht.'],
    mistakes: [
      'eps mit $\\min \\mathrm{FL}^+$ verwechseln: eps ist ein relativer Fehler, $\\min \\mathrm{FL}^+$ die kleinste positive Zahl.',
      'Den Faktor ½ vergessen. Der Abstand von 1 zur nächstgrößeren Zahl ist $2\\,\\mathrm{eps} = B^{1-L_m}$ (bei IEEE mit verstecktem Bit: eps).',
    ],
    rearranged: [{ tex: t`1 \mathbin{\hat{+}} y = 1 \ \text{ für } |y| < \mathrm{eps}`, note: 'kleine Summanden „verschwinden“' }],
    example: {
      problem: 'Wie groß ist eps für B = 10 und L_m = 16? Was bedeutet das für fl(π)?',
      steps: ['$\\mathrm{eps} = \\tfrac{1}{2} \\cdot 10^{1-16} = 5 \\cdot 10^{-16}$', '$\\pi = 0{,}3141592653589793\\,23\\ldots \\cdot 10^1$, gerundet auf 16 Stellen: $\\mathrm{fl}(\\pi) = 0{,}3141592653589793 \\cdot 10^1$.', 'Der relative Fehler $|\\pi - \\mathrm{fl}(\\pi)|/\\pi$ liegt unter eps.'],
      result: 'eps = 5 · 10⁻¹⁶',
      source: src('NUM-SKRIPT', '15', 'Beispiel 5'),
    },
    related: ['num.w.gleitpunkt', 'num.fl-grenzen', 'num.w.ausloeschung'],
    difficulty: 2,
    sources: [src('NUM-SKRIPT', '15–16', '(1.3), (1.4), Bemerkungen 1')],
    status: 'geprüft',
  },
  wissen({
    id: 'num.w.kondition',
    name: 'Kondition eines Problems',
    short: 'Fehlerverstärkung der Daten',
    chapterId: ch,
    definition: 'Die Kondition beschreibt, wie stark sich Störungen der Eingabedaten auf das Ergebnis auswirken, unabhängig vom gewählten Algorithmus. Sie misst also die unvermeidbare Fehlerverstärkung, selbst bei einem optimalen Lösungsverfahren. Ein Problem ist schlecht konditioniert, wenn kleine Datenfehler große Ergebnisfehler verursachen.',
    keyPoints: [
      'Kondition ist eine Eigenschaft des Problems, nicht des Rechenwegs. Kein Algorithmus kann sie verbessern.',
      'Beispiel LGS: $A = \\begin{pmatrix} 1 & 1 \\\\ 1 & 1-\\varepsilon \\end{pmatrix}$, $b=(4, 4-\\varepsilon)^\\top$ hat Lösung $(3,1)^\\top$. Mit $\\tilde b = (4+\\varepsilon, 4-2\\varepsilon)^\\top$ erhält man $(1+\\varepsilon, 3)^\\top$: winzige Störung, völlig andere Lösung.',
      'Summe mit relativ gestörten Daten: $\\dfrac{|\\tilde x + \\tilde y - (x+y)|}{|x+y|} \\le \\varepsilon\\,\\dfrac{|x|+|y|}{|x+y|}$.',
      'Gleiche Vorzeichen: Faktor $= 1$, gut konditioniert. Für $x \\approx -y$ wird der Faktor riesig: schlecht konditioniert.',
      'Für lineare Gleichungssysteme wird die Kondition später über die Konditionszahl $\\mathrm{cond}(A) = \\|A\\|\\|A^{-1}\\|$ gemessen (Kapitel 2.4).',
    ],
    mistakes: ['Behaupten, ein besserer Algorithmus mache ein schlecht konditioniertes Problem gut konditioniert.', 'Den Verstärkungsfaktor der Summe mit $|x+y|$ im Zähler statt im Nenner aufschreiben.'],
    examTip: 'Bei „Schätzen Sie die relative Abweichung ab“: gestörte Größen einsetzen, Dreiecksungleichung, Faktor $(|x|+|y|)/|x+y|$ ablesen und interpretieren.',
    related: ['num.w.ausloeschung', 'num.w.stabilitaet', 'num.w.fehlerquellen'],
    sources: [src('NUM-SKRIPT', '17', 'Abschnitt 1.4, Beispiele 7')],
  }),
  wissen({
    id: 'num.w.ausloeschung',
    name: 'Auslöschung',
    short: 'x − y mit x ≈ y',
    chapterId: ch,
    definition: 'Werden zwei fast gleich große Zahlen voneinander abgezogen (bzw. betraglich fast gleich große Zahlen mit verschiedenem Vorzeichen addiert), heben sich die führenden, vertrauenswürdigen Stellen der Mantisse weg. Übrig bleiben die hinteren Stellen, die schon Rundungsfehler tragen. Der relative Fehler wird dadurch stark vergrößert.',
    keyPoints: [
      'Die Subtraktion $x - y$ mit $x \\approx y$ ist schlecht konditioniert (Faktor $(|x|+|y|)/|x-y|$ groß).',
      'Die Gleitpunktsubtraktion selbst ist trotzdem stabil. Das Problem: sie verstärkt Fehler, die vorher schon entstanden sind.',
      'Abhilfe: algebraisch umformen, sodass keine Differenz fast gleicher Zahlen mehr auftritt (Hauptnenner bilden, mit dem „konjugierten“ Ausdruck erweitern, z. B. $(a-b)(a+b)=a^2-b^2$).',
      'Beispiel: $\\sqrt{x+1}-\\sqrt{x} = \\dfrac{1}{\\sqrt{x+1}+\\sqrt{x}}$ für große $x$.',
      'Bei Householder-Vektoren wird das Vorzeichen von $\\sigma$ genau so gewählt, dass keine Auslöschung entsteht.',
    ],
    example: {
      problem: 'Warum ist $\\dfrac{1}{1+2x} - \\dfrac{1-x}{1+x}$ für $|x| \\ll 1$ problematisch, und wie formt man um?',
      steps: [
        'Für kleine $|x|$ sind beide Brüche ungefähr 1. Die Differenz fast gleicher Zahlen führt zu Auslöschung.',
        'Hauptnenner bilden: $\\dfrac{(1+x) - (1-x)(1+2x)}{(1+2x)(1+x)}$.',
        'Zähler ausmultiplizieren: $1 + x - (1 + 2x - x - 2x^2) = 2x^2$.',
        'Ergebnis: $\\dfrac{2x^2}{(1+2x)(1+x)}$. Hier wird nichts Fast-Gleiches mehr subtrahiert.',
      ],
      result: '2x² / ((1+2x)(1+x))',
      source: src('NUM-UB02', '1–2', 'Aufgabe 1 c)'),
    },
    mistakes: ['Glauben, die Gleitpunktsubtraktion sei instabil. Sie ist stabil, aber schlecht konditioniert.', 'Nur den Zähler umformen und dabei wieder eine Differenz fast gleicher Zahlen erzeugen.'],
    related: ['num.w.kondition', 'num.w.stabilitaet'],
    sources: [src('NUM-SKRIPT', '17–18'), src('NUM-UB02', '1–2', 'Aufgabe 1 c)')],
  }),
  wissen({
    id: 'num.w.stabilitaet',
    name: 'Stabilität eines Algorithmus',
    short: 'Fehler im Verfahren',
    chapterId: ch,
    definition: 'Ein Algorithmus heißt stabil, wenn die Fehler, die er selbst erzeugt (v. a. Rundungsfehler), nicht viel größer sind als der unvermeidbare Einfluss der Datenstörungen, der durch die Kondition des Problems gegeben ist. Instabil ist er, wenn er Fehler im Lauf der Rechnung immer weiter verstärkt.',
    keyPoints: [
      'Die Grundoperationen $+,-,\\cdot,/$ in Gleitpunktarithmetik sind stabil: relativer Fehler $\\le$ eps.',
      'Ein Algorithmus wird instabil, wenn er schlecht konditionierte Teilschritte enthält (z. B. Auslöschung), die frühere Fehler verstärken.',
      'π-Beispiel: $g_{2n} = \\sqrt{2 - \\sqrt{4 - g_n^2}}$ ist instabil (Auslöschung $2 - \\sqrt{4-g_n^2}$ für kleine $g_n$).',
      'Stabile Variante durch Erweitern: $g_{2n} = \\dfrac{g_n}{\\sqrt{2 + \\sqrt{4 - g_n^2}}}$, nur noch Summen positiver Zahlen.',
      'Integral-Beispiel: $I_n = n I_{n-1} - e^{-1}$ multipliziert Fehler mit $n$ (insgesamt mit $n!$) → instabil. Rückwärts $I_{n-1} = (I_n + e^{-1})/n$ dämpft Fehler mit $1/n$ → stabil.',
    ],
    mistakes: ['Stabilität und Kondition verwechseln: Ein stabiler Algorithmus kann ein schlecht konditioniertes Problem nicht „retten“.', 'Annehmen, eine mathematisch richtige Formel sei automatisch numerisch stabil.'],
    examTip: 'Typische Klausurfrage: „Konvergiert die berechnete Folge? Begründen Sie und schlagen Sie eine Alternative vor.“ Antwort: Auslöschung benennen, Fehlerverstärkung beschreiben, Formel durch Erweitern umschreiben.',
    related: ['num.w.kondition', 'num.w.ausloeschung'],
    sources: [src('NUM-SKRIPT', '10–12, 18', 'Beispiele 2, 3, 8, 9')],
  }),
]

const sk = (pages: string, note?: string) => src('NUM-SKRIPT', pages, note)

export const exercises: Exercise[] = [
  // ------------------------------------------------------------ Fehlerquellen
  mc({
    id: 'num.w.fehlerquellen.e1', chapterId: ch, formulaIds: ['num.w.fehlerquellen'], skill: 'abrufen', difficulty: 1, origin: 'app',
    prompt: 'Welche Frage beantwortet die **Kondition** eines Problems?',
    options: opts(
      '*Wie stark wirken sich Störungen der Eingabedaten auf das Ergebnis aus, unabhängig vom Algorithmus?',
      ['Wie stark verstärkt ein bestimmter Algorithmus seine eigenen Rundungsfehler?', 'Das ist die Stabilität eines Algorithmus.'],
      ['Wie viele Operationen braucht ein Verfahren?', 'Das ist der Aufwand.'],
      ['Wie genau kann der Computer eine einzelne Zahl speichern?', 'Das beschreibt die Maschinengenauigkeit eps.'],
    ),
    hints: ['Kondition gehört zum Problem, nicht zum Verfahren.', 'Es geht um Fehler in den Daten.'],
    explanation: ['Kondition: Einfluss von Datenstörungen auf das Ergebnis bei optimalem Verfahren. Stabilität: Einfluss der Fehler innerhalb des Verfahrens.'],
    sources: [sk('16–17')],
  }),
  trueFalse({
    id: 'num.w.fehlerquellen.e2', chapterId: ch, formulaIds: ['num.w.fehlerquellen'], skill: 'erkennen', difficulty: 1, origin: 'app',
    prompt: 'Richtig oder falsch?',
    statements: [
      ['Das Ergebnis eines numerischen Verfahrens ist oft nur eine Näherung der exakten Lösung.', true, 'Daher kommt der Approximationsfehler.'],
      ['Fehler in den Eingabedaten lassen sich durch einen guten Algorithmus vollständig beseitigen.', false, 'Datenfehler sind kaum beeinflussbar; ihre Wirkung bestimmt die Kondition.'],
      ['Rundungsfehler entstehen, weil der Computer nur endlich viele Zahlen darstellen kann.', true, 'FL ist eine endliche Teilmenge von ℚ.'],
    ],
    hints: ['Denke an die drei Fehlerquellen.', 'Welche Fehler kann der Algorithmus beeinflussen, welche nicht?'],
    sources: [sk('16')],
  }),
  mc({
    id: 'num.w.fehlerquellen.e3', chapterId: ch, formulaIds: ['num.w.fehlerquellen'], skill: 'interpretieren', difficulty: 2, origin: 'app',
    prompt: 'Ein Messgerät liefert die rechte Seite $b$ eines Gleichungssystems nur auf 3 Stellen genau. Mit welchem Begriff untersuchst du, wie stark das die Lösung verfälscht?',
    options: opts('*Kondition des Problems', ['Stabilität des Algorithmus', 'Stabilität betrifft Fehler, die im Verfahren entstehen, nicht in den Messdaten.'], ['Maschinengenauigkeit', 'eps beschreibt die Rundung im Computer, nicht die Messungenauigkeit.'], ['Aufwand', 'Aufwand zählt Operationen.']),
    hints: ['Woher kommt der Fehler: aus den Daten oder aus dem Verfahren?', 'Datenfehler → …'],
    explanation: ['Messfehler sind Störungen der Eingabedaten. Ihre Auswirkung auf die Lösung beschreibt die Kondition.'],
    sources: [sk('16–17')],
  }),

  // ------------------------------------------------------------ Gleitpunkt
  mc({
    id: 'num.w.gleitpunkt.e1', chapterId: ch, formulaIds: ['num.w.gleitpunkt'], skill: 'abrufen', difficulty: 1, origin: 'app',
    prompt: 'Was bedeutet „normalisiert“ bei einer Gleitpunktzahl $m \\cdot B^e$?',
    options: opts(
      '*Die erste Mantissenstelle ist nicht 0, also $B^{-1} \\le |m| < 1$.',
      ['Die Mantisse ist genau 1.', 'Die Mantisse liegt in einem Intervall, sie ist nicht fest.'],
      ['Der Exponent ist 0.', 'Der Exponent kann jeden Wert zwischen $e_{\\min}$ und $e_{\\max}$ haben.'],
      ['Die Zahl liegt zwischen 0 und 1.', 'Das gilt nur für die Mantisse, nicht für die Zahl.'],
    ),
    hints: ['Es geht um die Eindeutigkeit der Darstellung.', 'Welche Ziffer darf nicht 0 sein?'],
    explanation: ['Mit $a_1 \\neq 0$ ist jede Zahl eindeutig darstellbar; daraus folgt $B^{-1} \\le |m| < 1$.'],
    sources: [sk('13')],
  }),
  numeric({
    id: 'num.w.gleitpunkt.e2', chapterId: ch, formulaIds: ['num.w.gleitpunkt'], skill: 'anwenden', difficulty: 2, origin: 'app',
    prompt: 'Wie viele **positive** normalisierte Mantissen gibt es für $B = 3$ und $L_m = 4$?',
    answer: 54, fmt: fmt.int(),
    wrong: [{ value: 81, explanation: 'Das sind alle $3^4$ Ziffernfolgen. Normalisiert muss aber $a_1 \\neq 0$ sein.' }, { value: 27, explanation: 'Für $a_1$ gibt es $B-1 = 2$ Möglichkeiten, nicht nur eine.' }],
    hints: ['Die erste Stelle darf nicht 0 sein.', '$a_1 \\in \\{1, 2\\}$, die übrigen 3 Stellen beliebig aus $\\{0,1,2\\}$.', '$(B-1) \\cdot B^{L_m - 1}$'],
    explanation: ['$(B-1)\\,B^{L_m-1} = 2 \\cdot 3^3 = 54$.'],
    sources: [src('NUM-K-SS19', '3', 'Aufgabe 6 a), Teilschritt')],
  }),
  trueFalse({
    id: 'num.w.gleitpunkt.e3', chapterId: ch, formulaIds: ['num.w.gleitpunkt'], skill: 'interpretieren', difficulty: 2, origin: 'app',
    prompt: 'Richtig oder falsch?',
    statements: [
      ['Die Gleitpunktzahlen liegen auf dem Zahlenstrahl gleichmäßig verteilt.', false, 'Pro Exponent gibt es gleich viele Zahlen, die Abstände wachsen aber mit $B^e$: nahe 0 dicht, außen weit.'],
      ['Die Menge FL ist endlich und enthält nur rationale Zahlen.', true, 'Endlich viele Ziffern und Exponenten, jede Zahl ist ein Bruch.'],
      ['Ist $|x|$ kleiner als $\\min \\mathrm{FL}^+$, so wird $\\mathrm{fl}(x) = 0$ (Unterlauf).', true, 'Exponentenunterlauf (underflow).'],
    ],
    hints: ['Denke an das Bild mit den Strichen auf dem Zahlenstrahl.', 'Abstände benachbarter Zahlen: $B^{e-L_m}$.'],
    sources: [sk('13–15', 'Folgerungen, Abbildung 1.1')],
  }),
  numeric({
    id: 'num.fl-grenzen.e1', chapterId: ch, formulaIds: ['num.fl-grenzen'], skill: 'einsetzen', difficulty: 1, origin: 'tutorium',
    prompt: 'Sei $B = 2$, $e_{\\min} = -1$, $L_m = 2$, $L_e = 3$. Berechne $\\max \\mathrm{FL}$.',
    answer: 48, fmt: fmt.num(2),
    wrong: [{ value: 96, explanation: 'Mit $e_{\\max} = e_{\\min} + B^{L_e} = 7$ ist der Exponent um 1 zu groß: richtig ist $e_{\\max} = -1 + 8 - 1 = 6$.' }, { value: 64, explanation: 'Der Faktor $(1 - B^{-L_m}) = 0{,}75$ fehlt.' }],
    hints: ['Erst $e_{\\max}$ bestimmen.', '$e_{\\max} = e_{\\min} + B^{L_e} - 1 = 6$.', '$2^6 \\cdot (1 - 2^{-2})$'],
    explanation: ['$e_{\\max} = -1 + 2^3 - 1 = 6$, also $\\max \\mathrm{FL} = 2^6 \\cdot 0{,}75 = 48$.'],
    sources: [src('NUM-UB02', '1–2', 'Aufgabe 1 b) (iii)')],
  }),
  numeric({
    id: 'num.fl-grenzen.e2', chapterId: ch, formulaIds: ['num.fl-grenzen'], skill: 'einsetzen', difficulty: 1, origin: 'tutorium',
    prompt: 'Sei $B = 2$, $e_{\\min} = -1$, $L_m = 2$, $L_e = 3$. Berechne $\\min \\mathrm{FL}^+$.',
    answer: 0.25, fmt: fmt.num(4),
    wrong: [{ value: 0.125, explanation: 'Mantisse $B^{-L_m}$ genommen. Normalisiert ist die kleinste Mantisse aber $B^{-1}$.' }, { value: 0.5, explanation: 'Das ist $B^{e_{\\min}}$; die Mantisse $B^{-1}$ fehlt.' }],
    hints: ['Kleinste Mantisse und kleinster Exponent.', 'Kleinste normalisierte Mantisse: $0{,}1_2 = 2^{-1}$.', '$2^{-1} \\cdot 2^{-1}$'],
    explanation: ['$\\min \\mathrm{FL}^+ = B^{e_{\\min}-1} = 2^{-2} = 0{,}25$.'],
    sources: [src('NUM-UB02', '1–2', 'Aufgabe 1 b) (iii)')],
  }),
  mc({
    id: 'num.fl-grenzen.e3', chapterId: ch, formulaIds: ['num.fl-grenzen'], skill: 'erkennen', difficulty: 1, origin: 'app',
    prompt: 'Welche Formel gibt $\\min \\mathrm{FL}^+$ an?',
    options: opts(t`*$B^{e_{\min}-1}$`, [t`$B^{e_{\min}}$`, 'Die Mantisse ist höchstens $B^{-1}$ klein, nicht 1.'], [t`$B^{e_{\min}-L_m}$`, 'Das wäre eine nicht normalisierte Mantisse $B^{-L_m}$.'], [t`$\tfrac12 B^{1-L_m}$`, 'Das ist eps.']),
    hints: ['Kleinste normalisierte Mantisse mal kleinster Exponent.', 'Kleinste Mantisse $= B^{-1}$.'],
    explanation: [t`$B^{-1} \cdot B^{e_{\min}} = B^{e_{\min}-1}$.`],
    sources: [sk('13')],
  }),

  // ------------------------------------------------------------ eps
  mc({
    id: 'num.eps.e1', chapterId: ch, formulaIds: ['num.eps'], skill: 'erkennen', difficulty: 1, origin: 'app',
    prompt: 'Welche Formel beschreibt die relative Maschinengenauigkeit?',
    options: opts(t`*$\mathrm{eps} = \tfrac12 B^{1-L_m}$`, [t`$\mathrm{eps} = B^{e_{\min}-1}$`, 'Das ist die kleinste positive Gleitpunktzahl.'], [t`$\mathrm{eps} = B^{-L_m}$`, 'Bis auf den Faktor ähnlich, aber nach der Herleitung ist $\\mathrm{eps} = \\tfrac{B}{2} B^{-L_m}$.'], [t`$\mathrm{eps} = \tfrac12 B^{-L_e}$`, 'eps hängt von der Mantissenlänge ab, nicht von der Exponentenlänge.']),
    hints: ['Die Genauigkeit hängt an der Mantissenlänge.', 'Halbe Einheit der letzten Stelle, relativ zu $|m| \\ge B^{-1}$.'],
    explanation: [t`$\frac{|x - \mathrm{fl}(x)|}{|x|} \le \frac{\frac{B}{2}B^{-(L_m+1)}}{|m|} \le \frac{B}{2}B^{-L_m} = \tfrac12 B^{1-L_m}$.`],
    sources: [sk('15', '(1.3)')],
  }),
  numeric({
    id: 'num.eps.e2', chapterId: ch, formulaIds: ['num.eps'], skill: 'einsetzen', difficulty: 1, origin: 'app',
    prompt: 'Berechne eps für $B = 2$ und $L_m = 2$.',
    answer: 0.25, fmt: fmt.num(4),
    wrong: [{ value: 0.5, explanation: 'Der Faktor ½ fehlt: $B^{1-L_m} = 0{,}5$ ist $2\\,\\mathrm{eps}$.' }],
    hints: ['$\\mathrm{eps} = \\tfrac12 B^{1-L_m}$', '$2^{1-2} = 0{,}5$'],
    explanation: ['$\\tfrac12 \\cdot 2^{-1} = 0{,}25$.'],
    sources: [sk('15')],
  }),
  mc({
    id: 'num.eps.e3', chapterId: ch, formulaIds: ['num.eps'], skill: 'abrufen', difficulty: 1, origin: 'klausur',
    prompt: 'Welche Größenordnung hat eps im IEEE-Standard (double precision)?',
    options: opts('*$\\approx 2{,}2 \\cdot 10^{-16}$', ['$\\approx 10^{-308}$', 'Das ist ungefähr $\\min \\mathrm{FL}^+$.'], ['$\\approx 10^{-8}$', 'Das ist etwa die Wurzel aus eps (z. B. Fehler nach Wurzelziehen).'], ['$\\approx 10^{308}$', 'Das ist ungefähr $\\max \\mathrm{FL}$.']),
    hints: ['52 Bit Mantisse.', '$2^{-52}$'],
    explanation: ['Double precision: $\\mathrm{eps} = 2^{-52} \\approx 2{,}2 \\cdot 10^{-16}$, also etwa 16 Dezimalstellen. Zahlenbereich ungefähr $10^{-308}$ bis $10^{308}$.'],
    sources: [sk('15', 'Beispiel 6'), src('NUM-K-SS20', '4', 'Aufgabe 6 a)')],
  }),
  trueFalse({
    id: 'num.eps.e4', chapterId: ch, formulaIds: ['num.eps'], skill: 'interpretieren', difficulty: 2, origin: 'app',
    prompt: 'Gleitpunktarithmetik mit eps: Richtig oder falsch?',
    statements: [
      ['Für jede Grundoperation gilt $x \\mathbin{\\hat\\circ} y = (x \\circ y)(1+\\epsilon)$ mit $|\\epsilon| \\le \\mathrm{eps}$.', true, 'So ist die Gleitpunktoperation definiert: exakt rechnen, dann runden.'],
      ['Gleitpunktaddition ist assoziativ.', false, 'Die Reihenfolge der Operationen spielt eine Rolle.'],
      ['Ist $|y| < \\mathrm{eps}$, so gilt $1 \\mathbin{\\hat+} y = 1$.', true, 'Die nächste Gleitpunktzahl nach 1 ist $1 + 2\\,\\mathrm{eps}$; alles darunter wird auf 1 gerundet.'],
    ],
    hints: ['$\\mathrm{fl}(x) = x(1+\\epsilon)$ gilt für jedes Rechenergebnis.', 'Abstand von 1 zur nächsten Zahl: $B^{1-L_m}$.'],
    sources: [sk('15–16', 'Bemerkungen 1')],
  }),

  // ------------------------------------------------------------ Kondition
  mc({
    id: 'num.w.kondition.e1', chapterId: ch, formulaIds: ['num.w.kondition'], skill: 'abrufen', difficulty: 1, origin: 'app',
    prompt: 'Für welche Daten ist die Summe $x + y$ **schlecht** konditioniert?',
    options: opts('*$x \\approx -y$', ['$x$ und $y$ haben dasselbe Vorzeichen', 'Dann ist der Faktor $(|x|+|y|)/|x+y| = 1$: gut konditioniert.'], ['$x$ und $y$ sind sehr groß', 'Die Größe allein spielt für den relativen Fehler keine Rolle.'], ['$y = 0$', 'Dann ist der Faktor 1.']),
    hints: ['Schau dir den Faktor $(|x|+|y|)/|x+y|$ an.', 'Wann wird der Nenner klein, der Zähler aber nicht?'],
    explanation: ['Für $x \\approx -y$ ist $|x+y|$ klein, $|x|+|y|$ aber nicht: große Fehlerverstärkung (Auslöschung).'],
    sources: [sk('17', 'Beispiele 7 (b)')],
  }),
  numeric({
    id: 'num.w.kondition.e2', chapterId: ch, formulaIds: ['num.w.kondition'], skill: 'anwenden', difficulty: 2, origin: 'app',
    prompt: 'Wie groß ist der Verstärkungsfaktor $\\dfrac{|x|+|y|}{|x+y|}$ für $x = 1{,}001$ und $y = -1$?',
    answer: 2001, fmt: fmt.num(0), relTol: 0.001,
    hints: ['Zähler: $1{,}001 + 1$.', 'Nenner: $|1{,}001 - 1| = 0{,}001$.'],
    explanation: ['$\\dfrac{2{,}001}{0{,}001} = 2001$. Ein relativer Datenfehler von $10^{-16}$ kann im Ergebnis also etwa $2 \\cdot 10^{-13}$ werden.'],
    sources: [sk('17', 'Beispiele 7 (b)')],
  }),
  trueFalse({
    id: 'num.w.kondition.e3', chapterId: ch, formulaIds: ['num.w.kondition'], skill: 'interpretieren', difficulty: 2, origin: 'app',
    prompt: 'Richtig oder falsch?',
    statements: [
      ['Die Kondition misst die unvermeidbare Fehlerverstärkung bei optimalem Lösungsverfahren.', true, 'Genau so ist sie im Skript formuliert.'],
      ['Ein schlecht konditioniertes Problem wird durch einen stabileren Algorithmus gut konditioniert.', false, 'Die Kondition hängt nur vom Problem ab.'],
      ['Beim LGS mit $A = \\begin{pmatrix} 1 & 1 \\\\ 1 & 1-\\varepsilon\\end{pmatrix}$ können winzige Änderungen von $b$ die Lösung völlig verändern.', true, 'Die beiden Geraden sind fast parallel, der Schnittpunkt wandert stark.'],
    ],
    hints: ['Problem oder Verfahren?', 'Denke an die fast parallelen Geraden.'],
    sources: [sk('17, 34', 'Beispiele 7 (a), Abbildung 2.1')],
  }),

  // ------------------------------------------------------------ Auslöschung
  mc({
    id: 'num.w.ausloeschung.e1', chapterId: ch, formulaIds: ['num.w.ausloeschung'], skill: 'erkennen', difficulty: 1, origin: 'app',
    prompt: 'In welchem Ausdruck tritt für sehr große $x > 0$ Auslöschung auf?',
    options: opts('*$\\sqrt{x+1} - \\sqrt{x}$', ['$\\sqrt{x+1} + \\sqrt{x}$', 'Summe zweier positiver Zahlen: keine Auslöschung.'], ['$\\dfrac{1}{\\sqrt{x+1}+\\sqrt{x}}$', 'Das ist genau die auslöschungsfreie Umformung.'], ['$x^2 + 1$', 'Keine Differenz fast gleicher Zahlen.']),
    hints: ['Suche eine Differenz fast gleich großer Zahlen.', 'Für große $x$ ist $\\sqrt{x+1} \\approx \\sqrt{x}$.'],
    explanation: ['$\\sqrt{x+1} - \\sqrt{x}$ zieht fast gleiche Zahlen ab. Erweitern mit $\\sqrt{x+1}+\\sqrt{x}$ ergibt $1/(\\sqrt{x+1}+\\sqrt{x})$.'],
    sources: [sk('17–18')],
  }),
  mc({
    id: 'num.w.ausloeschung.e2', chapterId: ch, formulaIds: ['num.w.ausloeschung'], skill: 'anwenden', difficulty: 2, origin: 'app',
    prompt: 'Welche Umformung von $1 - \\cos x$ vermeidet Auslöschung für $|x| \\ll 1$?',
    options: opts('*$\\dfrac{\\sin^2 x}{1 + \\cos x}$', ['$1 - \\sqrt{1 - \\sin^2 x}$', 'Hier wird weiterhin $1 - (\\text{fast }1)$ gerechnet.'], ['$(1-\\cos x)\\cdot \\dfrac{1}{1}$', 'Das ändert nichts.'], ['$\\cos x - 1$ mit Vorzeichenwechsel', 'Gleiche Differenz, gleiche Auslöschung.']),
    hints: ['Erweitere mit dem „konjugierten“ Ausdruck $1 + \\cos x$.', '$(1-\\cos x)(1+\\cos x) = 1 - \\cos^2 x = \\sin^2 x$.'],
    explanation: ['$1 - \\cos x = \\dfrac{(1-\\cos x)(1+\\cos x)}{1+\\cos x} = \\dfrac{\\sin^2 x}{1+\\cos x}$. Im Nenner werden zwei positive Zahlen addiert.'],
    status: 'abgeleitet',
    sources: [sk('17–18', 'Prinzip; eigenes Beispiel')],
  }),
  trueFalse({
    id: 'num.w.ausloeschung.e3', chapterId: ch, formulaIds: ['num.w.ausloeschung'], skill: 'interpretieren', difficulty: 2, origin: 'app',
    prompt: 'Richtig oder falsch?',
    statements: [
      ['Die Gleitpunktsubtraktion zweier fast gleich großer Zahlen ist stabil.', true, 'Ihr relativer Fehler ist $\\le$ eps (Beispiel 8). Problematisch ist ihre schlechte Kondition.'],
      ['Auslöschung verstärkt Fehler, die schon vor der Subtraktion in den Zahlen steckten.', true, 'Die vorderen, korrekten Stellen fallen weg; die fehlerbehafteten rücken nach vorn.'],
      ['Auslöschung kann man durch mehr Nachkommastellen in der Ausgabe beheben.', false, 'Die verlorenen Stellen sind verloren. Man muss den Rechenweg umformen.'],
    ],
    hints: ['Unterscheide Stabilität der Operation und Kondition.', 'Was passiert mit den führenden Stellen?'],
    sources: [sk('18', 'Beispiel 8 und Text danach')],
  }),

  // ------------------------------------------------------------ Stabilität
  mc({
    id: 'num.w.stabilitaet.e1', chapterId: ch, formulaIds: ['num.w.stabilitaet'], skill: 'abrufen', difficulty: 1, origin: 'app',
    prompt: 'Wann heißt ein numerisches Verfahren **stabil**?',
    options: opts(
      '*Wenn die Fehler im Verfahren nicht viel größer sind als der unvermeidbare Einfluss der Datenstörungen (Kondition).',
      ['Wenn es immer das exakte Ergebnis liefert.', 'Stabil heißt nicht fehlerfrei.'],
      ['Wenn das Problem gut konditioniert ist.', 'Kondition ist eine Eigenschaft des Problems, nicht des Verfahrens.'],
      ['Wenn es nur Additionen verwendet.', 'Auch Additionen können durch Auslöschung problematisch werden.'],
    ),
    hints: ['Vergleichsmaßstab ist die Kondition.', '„Nicht viel größer als …“'],
    explanation: ['Stabil: Der Algorithmus fügt dem unvermeidbaren Fehler (Kondition) nicht viel eigenen Fehler hinzu.'],
    sources: [sk('18', 'Abschnitt 1.5')],
  }),
  mc({
    id: 'num.w.stabilitaet.e2', chapterId: ch, formulaIds: ['num.w.stabilitaet'], skill: 'anwenden', difficulty: 2, origin: 'vorlesung',
    prompt: 'Die Integrale $I_n = \\int_0^1 x^n e^{-x}\\,dx$ erfüllen $I_n = n I_{n-1} - e^{-1}$. Warum liefert die Vorwärtsrechnung ab $I_0$ für $n \\approx 20$ Unsinn?',
    options: opts(
      '*Ein Fehler in $I_{n-1}$ wird mit $n$ multipliziert, insgesamt also mit etwa $n!$ verstärkt.',
      ['Die Formel ist mathematisch falsch.', 'Die Rekursion folgt exakt aus partieller Integration.'],
      ['Es tritt Überlauf auf, weil $I_n$ sehr groß wird.', 'Die echten $I_n$ werden kleiner, nicht größer.'],
      ['$e^{-1}$ ist nicht exakt darstellbar, deshalb ist jede Rechnung damit instabil.', 'Ein einzelner Rundungsfehler von eps wäre harmlos; schlimm ist die Verstärkung.'],
    ),
    hints: ['Verfolge, was mit einem kleinen Fehler $\\delta$ in $I_0$ passiert.', '$\\delta \\to 1\\cdot\\delta \\to 2\\cdot\\delta \\to 6\\cdot\\delta \\to \\dots$'],
    explanation: ['Fehler werden mit $n$ multipliziert: nach 20 Schritten $20! \\cdot 10^{-16} \\approx 243$. Rückwärts $I_{n-1} = (I_n + e^{-1})/n$ teilt den Fehler jeweils durch $n$ und ist stabil.'],
    sources: [sk('12, 18', 'Beispiel 3, Beispiele 9 (b)')],
  }),
  trueFalse({
    id: 'num.w.stabilitaet.e3', chapterId: ch, formulaIds: ['num.w.stabilitaet'], skill: 'interpretieren', difficulty: 2, origin: 'vorlesung',
    prompt: 'π-Näherung über eingeschriebene Dreiecke: Richtig oder falsch?',
    statements: [
      ['$g_{2n} = \\sqrt{2 - \\sqrt{4 - g_n^2}}$ ist instabil, weil für kleine $g_n$ fast gleich große Zahlen subtrahiert werden.', true, '$\\sqrt{4 - g_n^2} \\approx 2$: Auslöschung.'],
      ['$g_{2n} = g_n \\big/ \\sqrt{2 + \\sqrt{4 - g_n^2}}$ ist mathematisch dieselbe Folge.', true, 'Durch Erweitern mit $2 + \\sqrt{4-g_n^2}$ entsteht kein neuer Wert, nur ein anderer Rechenweg.'],
      ['Die instabile Variante wird mit mehr Iterationen immer genauer.', false, 'Sie wird erst besser, dann wieder schlechter, am Ende liefert sie 0.'],
    ],
    hints: ['Wo steht eine Differenz?', 'Was macht $(a-b)(a+b)$?'],
    sources: [sk('10–12, 18', 'Beispiel 2, Beispiele 9 (a)')],
  }),

  // ======================================================== Papier-Aufgaben
  paper({
    id: 'num.p.ub2-1b', chapterId: ch, formulaIds: ['num.fl-grenzen', 'num.w.gleitpunkt'], difficulty: 2, origin: 'tutorium', estMinutes: 15,
    prompt: t`**Übungsblatt 2, Aufgabe 1 b)** · Sei $B = 2$, $e_{\min} = -1$, $L_m = 2$ und $L_e = 3$.
(i) Gib alle möglichen Mantissen in Binärdarstellung und als Dezimalzahl an und begründe kurz.
(ii) Gib alle möglichen Exponenten an.
(iii) Berechne $\max \mathrm{FL}$ und $\min \mathrm{FL}^+$.
(iv) Zeichne die Elemente von $\mathrm{FL}^+$ auf einem Zahlenstrahl ein.`,
    hints: ['Wegen der Normalisierung ist $a_1 = 1$ fest.', 'Exponent: $e = -1 + c_0 + 2c_1 + 4c_2$ mit $c_l \\in \\{0,1\\}$.', 'Jede Mantisse mit jedem Exponenten kombinieren.'],
    modelAnswer: [
      '(i) Wegen $a_1 \\neq 0$ ist $a_1 = 1$; nur $a_2 \\in \\{0, 1\\}$ ist frei. Mantissen: $\\pm 0{,}10_2 = \\pm 0{,}5$ und $\\pm 0{,}11_2 = \\pm 0{,}75$.',
      '(ii) $e = -1 + c_0 \\cdot 1 + c_1 \\cdot 2 + c_2 \\cdot 4$ mit $c_l \\in \\{0,1\\}$ ergibt alle ganzen Zahlen von $-1$ bis $6$.',
      '(iii) $\\max \\mathrm{FL} = 2^6 (1 - 2^{-2}) = 0{,}75 \\cdot 64 = 48$ und $\\min \\mathrm{FL}^+ = 2^{-1-1} = 0{,}25$.',
      '(iv) $\\mathrm{FL}^+ = \\{0{,}5 \\cdot 2^e,\\ 0{,}75 \\cdot 2^e : e = -1,\\dots,6\\} = \\{\\tfrac14, \\tfrac38, \\tfrac12, \\tfrac34, 1, \\tfrac32, 2, 3, 4, 6, 8, 12, 16, 24, 32, 48\\}$.',
      'Auf dem Zahlenstrahl: nahe 0 liegen die Zahlen dicht, nach außen werden die Abstände immer größer (sie verdoppeln sich mit jedem Exponenten).',
    ],
    keywords: ['a₁ = 1', 'e = −1 … 6', 'max FL = 48', 'min FL⁺ = 1/4', 'Dichte nahe 0'],
    sources: [src('NUM-UB02', '1–2', 'Aufgabe 1 b) mit Lösung')],
  }),
  paper({
    id: 'num.p.ss19-6a', chapterId: ch, formulaIds: ['num.w.gleitpunkt', 'num.fl-grenzen'], difficulty: 3, origin: 'klausur', estMinutes: 8, status: 'abgeleitet',
    prompt: t`**Klausur SoSe 2019, Aufgabe 6 a)** · Sei $B = 3$, $L_m = 4$, $e_{\min} = -4$ und $L_e = 2$. Bestimme das Verhältnis der Anzahl der normalisierten Gleitpunktzahlen in $(0, 1)$ zur Anzahl derer in $[1, B)$.`,
    hints: ['Wie viele positive Mantissen gibt es pro Exponent?', 'Eine Zahl $m \\cdot 3^e$ mit $\\tfrac13 \\le m < 1$ liegt in $[3^{e-1}, 3^e)$.', 'Welche Exponenten liefern Zahlen kleiner 1, welcher Zahlen in $[1, 3)$?'],
    modelAnswer: [
      'Exponenten: $e_{\\max} = e_{\\min} + B^{L_e} - 1 = -4 + 9 - 1 = 4$, also $e \\in \\{-4, \\dots, 4\\}$.',
      'Positive Mantissen pro Exponent: $(B-1)\\,B^{L_m - 1} = 2 \\cdot 27 = 54$.',
      'Mit $\\tfrac13 \\le m < 1$ liegt $m \\cdot 3^e$ in $[3^{e-1}, 3^e)$. In $(0,1)$ liegen also genau die Zahlen mit $e \\le 0$: 5 Exponenten, $5 \\cdot 54 = 270$ Zahlen.',
      'In $[1, 3)$ liegen genau die Zahlen mit $e = 1$: $54$ Zahlen.',
      'Verhältnis: $270 : 54 = 5 : 1$.',
    ],
    keywords: ['54 Mantissen pro Exponent', 'e = −4 … 4', '270 : 54', '5 : 1'],
    statusNote: 'Zu dieser Klausur liegt keine offizielle Lösung vor. Lösung von der App hergeleitet und nachgezählt.',
    sources: [src('NUM-K-SS19', '3', 'Aufgabe 6 a)')],
  }),
  paper({
    id: 'num.p.ss20-6b', chapterId: ch, formulaIds: ['num.fl-grenzen', 'num.w.gleitpunkt'], difficulty: 2, origin: 'klausur', estMinutes: 5, status: 'abgeleitet',
    prompt: t`**Klausur SoSe 2020, Aufgabe 6 b)** · Die Diagonalmatrix $A = \tfrac{1}{10} I_N = \mathrm{diag}(\tfrac{1}{10}, \dots, \tfrac{1}{10}) \in \mathbb{R}^{N \times N}$ mit $N = 500$ wird im IEEE-double-Format gespeichert. Der Computer berechnet die Determinante als Produkt der Diagonalelemente und den Rang als Anzahl der von Null verschiedenen Diagonaleinträge. Er erhält $\det(A) = 0$ und $\mathrm{Rang}(A) = 500$. Erkläre beide Ergebnisse.`,
    hints: ['Wie groß ist $\\det(A)$ exakt?', 'Vergleiche mit $\\min \\mathrm{FL}^+ \\approx 10^{-308}$.', 'Ist $0{,}1$ selbst darstellbar (zumindest gerundet, ungleich 0)?'],
    modelAnswer: [
      'Exakt gilt $\\det(A) = (1/10)^{500} = 10^{-500}$. Das ist viel kleiner als $\\min \\mathrm{FL}^+ \\approx 10^{-308}$.',
      'Beim fortlaufenden Multiplizieren fällt das Zwischenergebnis irgendwann unter den kleinsten darstellbaren Wert: Exponentenunterlauf, $\\mathrm{fl} = 0$. Deshalb liefert der Computer $\\det(A) = 0$.',
      'Jeder Diagonaleintrag $\\mathrm{fl}(0{,}1)$ ist dagegen eine gut darstellbare Zahl ungleich 0 (nur leicht gerundet). Alle 500 Einträge sind $\\neq 0$, also Rang $500$.',
      'Lehre: $\\det(A) \\approx 0$ ist kein brauchbares Kriterium für Singularität. Die Matrix ist sogar sehr gut konditioniert ($\\mathrm{cond}(A) = 1$).',
    ],
    keywords: ['10⁻⁵⁰⁰', 'Unterlauf', 'min FL⁺ ≈ 10⁻³⁰⁸', 'Einträge ≠ 0'],
    statusNote: 'Offizielle Lösung nur als Scan vorhanden; Lösung nach Skript (Unterlauf, Beispiel 6) hergeleitet.',
    sources: [src('NUM-K-SS20', '4', 'Aufgabe 6 b)'), sk('15', 'Unterlauf, Beispiel 6')],
  }),
  paper({
    id: 'num.p.ss17-6a', chapterId: ch, formulaIds: ['num.eps'], difficulty: 2, origin: 'klausur', estMinutes: 5, status: 'abgeleitet',
    prompt: t`**Klausur SoSe 2017, Aufgabe 6 a)** · Ein Rechner mit Gleitkommaarithmetik hat die relative Maschinengenauigkeit $\mathrm{eps} = 10^{-10}$; die Zahlen $1$, $10^{-7}$ und $10^{-14}$ seien exakt darstellbar. Ist das Ergebnis auf diesem Rechner kleiner, größer oder gleich 1? Begründe kurz.
(i) $1 + 10^{-7} \cdot 10^{-7}$
(ii) $1 + 10^{-7}$`,
    hints: ['Erst wird das Produkt berechnet und gerundet, dann addiert.', 'Vergleiche den Summanden mit eps.', 'Für $|y| < \\mathrm{eps}$ gilt $1 \\mathbin{\\hat+} y = 1$.'],
    modelAnswer: [
      '(i) Zuerst $10^{-7} \\mathbin{\\hat\\cdot} 10^{-7} = 10^{-14}$ (laut Aufgabe exakt darstellbar). Dann $1 \\mathbin{\\hat+} 10^{-14}$: Da $10^{-14} < \\mathrm{eps} = 10^{-10}$, liegt $1 + 10^{-14}$ näher an 1 als an der nächstgrößeren Gleitpunktzahl. Ergebnis: **gleich 1**.',
      '(ii) $10^{-7} > \\mathrm{eps} = 10^{-10}$. Der relative Abstand von $1 + 10^{-7}$ zu 1 ist viel größer als die Rundungsgenauigkeit, also wird nicht auf 1 gerundet. Ergebnis: **größer als 1** (etwa $1 + 10^{-7}$).',
    ],
    keywords: ['erst Produkt, dann Summe', '10⁻¹⁴ < eps → = 1', '10⁻⁷ > eps → > 1'],
    statusNote: 'Offizielle Lösung nur als Scan vorhanden; Lösung mit Bemerkung 1 2) des Skripts hergeleitet.',
    sources: [src('NUM-K-SS17', '3', 'Aufgabe 6 a)'), sk('16', 'Bemerkungen 1 2)')],
  }),
  paper({
    id: 'num.p.ss24-1', chapterId: ch, formulaIds: ['num.eps', 'num.fl-grenzen', 'num.w.gleitpunkt'], difficulty: 3, origin: 'klausur', estMinutes: 20,
    prompt: t`**Klausur SoSe 2024, Aufgabe 1** · Seien eine Basis $B \ge 2$, ein minimaler Exponent $e_{\min} \in \mathbb{Z}$ und Längen $L_m, L_e \in \mathbb{N}$ gegeben.
(a) Formuliere die Definition der Menge $\mathrm{FL}^+$ der normalisierten positiven Gleitpunktzahlen.
(b) Bestimme $\max \mathrm{FL}^+$ und $\min \mathrm{FL}^+$.
(c) Sei $x \in \mathrm{FL}^+$ und $y \in \mathrm{FL}^+$ eine zu $x$ direkt benachbarte Gleitpunktzahl. Zeige $2\,\mathrm{eps}\,B^{-1} < \dfrac{|x-y|}{|x|} \le 2\,\mathrm{eps}$.
(d) Nenne den Vorteil der Wahl $B = 2$ für die Darstellung und formuliere die analoge Abschätzung zu (c), wenn man ihn nutzt.`,
    hints: ['(b) Größte Mantisse: alle Ziffern $B-1$; geometrische Summe.', '(c) Benachbart heißt: Mantisse unterscheidet sich um eine Einheit der letzten Stelle, $y = (m \\pm B^{-L_m})B^e$.', '(c) Verwende $B^{-1} \\le m < 1$ und $\\mathrm{eps} = \\tfrac12 B^{1-L_m}$.'],
    modelAnswer: [
      '(a) $\\mathrm{FL}^+ = \\Big\\{ B^e \\sum_{l=1}^{L_m} a_l B^{-l} : e = e_{\\min} + \\sum_{l=0}^{L_e-1} c_l B^l,\\ a_l, c_l \\in \\{0,\\dots,B-1\\},\\ a_1 \\neq 0 \\Big\\}$.',
      t`(b) Größte Mantisse: $\sum_{l=1}^{L_m} (B-1)B^{-l} = \sum_{l=1}^{L_m} (B^{-l+1} - B^{-l}) = 1 - B^{-L_m}$ (Teleskopsumme). Größter Exponent: $e_{\max} = e_{\min} + \sum_{l=0}^{L_e-1}(B-1)B^l = e_{\min} + B^{L_e} - 1$. Also $\max \mathrm{FL}^+ = (1 - B^{-L_m})\,B^{e_{\min} + B^{L_e} - 1}$. Kleinste Mantisse $B^{-1}$ mit $e_{\min}$: $\min \mathrm{FL}^+ = B^{e_{\min}-1}$.`,
      t`(c) Sei $x = m B^e$. Direkt benachbart ist $y = (m \pm B^{-L_m}) B^e$. Dann $\dfrac{|x-y|}{|x|} = \dfrac{B^{-L_m} B^e}{m B^e} = \dfrac{B^{-L_m}}{m}$. Mit $B^{-1} \le m < 1$ folgt $B^{-L_m} < \dfrac{|x-y|}{|x|} \le B^{1-L_m}$. Wegen $\mathrm{eps} = \tfrac12 B^{1-L_m}$ ist $B^{1-L_m} = 2\,\mathrm{eps}$ und $B^{-L_m} = 2\,\mathrm{eps}\,B^{-1}$.`,
      t`(d) Bei $B = 2$ ist $a_1 = 1$ immer gleich, muss also nicht gespeichert werden. Man gewinnt eine zusätzliche Mantissenstelle: Nachbar ist $y = (m \pm B^{-(L_m+1)})B^e$. Damit $\tfrac12\,\mathrm{eps} = 2B^{-2}\mathrm{eps} < \dfrac{|x-y|}{|x|} \le 2B^{-1}\mathrm{eps} = \mathrm{eps}$.`,
    ],
    keywords: ['a₁ ≠ 0', '1 − B^{−L_m}', 'e_max = e_min + B^{L_e} − 1', 'y = (m ± B^{−L_m})Bᵉ', 'verstecktes Bit'],
    sources: [src('NUM-K-SS24', '1', 'Aufgabe 1 mit Lösungsskizze')],
  }),
  paper({
    id: 'num.p.ub2-1c', chapterId: ch, formulaIds: ['num.w.ausloeschung'], difficulty: 2, origin: 'tutorium', estMinutes: 8,
    prompt: t`**Übungsblatt 2, Aufgabe 1 c)** · Erkläre, warum es bei der Auswertung von $\dfrac{1}{1+2x} - \dfrac{1-x}{1+x}$ für $|x| \ll 1$ in Gleitpunktarithmetik zu Auslöschung kommen kann, und löse das Problem durch algebraische Umformung.`,
    hints: ['Wie groß sind beide Brüche für $x \\approx 0$?', 'Bilde den Hauptnenner.', 'Multipliziere den Zähler vollständig aus.'],
    modelAnswer: [
      'Für $|x| \\ll 1$ sind beide Brüche ungefähr 1. Ihre Differenz ist eine Subtraktion fast gleich großer Zahlen → Auslöschung und damit mögliche Fehlerverstärkung.',
      t`Umformen: $\dfrac{1}{1+2x} - \dfrac{1-x}{1+x} = \dfrac{(1+x) - (1-x)(1+2x)}{(1+2x)(1+x)} = \dfrac{1 + x - 1 - x + 2x^2}{(1+2x)(1+x)} = \dfrac{2x^2}{(1+2x)(1+x)}$.`,
      'In dieser Form tritt für $|x| \\ll 1$ keine Differenz fast gleich großer Zahlen mehr auf.',
    ],
    keywords: ['beide ≈ 1', 'Auslöschung', 'Hauptnenner', '2x² / ((1+2x)(1+x))'],
    sources: [src('NUM-UB02', '1–2', 'Aufgabe 1 c) mit Lösung')],
  }),
  paper({
    id: 'num.p.ws1920-6e', chapterId: ch, formulaIds: ['num.w.kondition'], difficulty: 2, origin: 'klausur', estMinutes: 8, status: 'abgeleitet',
    prompt: t`**Klausur WiSe 2019/20, Aufgabe 6 e)** · Seien die relativ gestörten Eingabedaten $\tilde x = x(1+\varepsilon_x)$ und $\tilde y = y(1+\varepsilon_y)$ für $x, y \in \mathbb{R}$ mit $x + y \neq 0$ und $|\varepsilon_x|, |\varepsilon_y| \le \mathrm{eps}$ gegeben. Schätze die relative Abweichung $\dfrac{|(\tilde x + \tilde y) - (x+y)|}{|x+y|}$ nach oben ab und erkläre, wann das Problem schlecht konditioniert ist.`,
    hints: ['Setze $\\tilde x$ und $\\tilde y$ ein, $x + y$ kürzt sich im Zähler weg.', 'Dreiecksungleichung im Zähler.', 'Der Faktor vor eps ist die Konditionszahl der Addition.'],
    modelAnswer: [
      t`$(\tilde x + \tilde y) - (x+y) = x\varepsilon_x + y\varepsilon_y$.`,
      t`Also $\dfrac{|x\varepsilon_x + y\varepsilon_y|}{|x+y|} \le \dfrac{|x||\varepsilon_x| + |y||\varepsilon_y|}{|x+y|} \le \mathrm{eps}\,\dfrac{|x| + |y|}{|x+y|}$.`,
      'Haben $x$ und $y$ dasselbe Vorzeichen, ist $|x|+|y| = |x+y|$ und der Faktor 1: gut konditioniert.',
      'Für $x \\approx -y$ ist $|x+y|$ sehr klein, $|x|+|y|$ aber nicht: Der Faktor wird sehr groß, das Problem ist schlecht konditioniert (Auslöschung).',
    ],
    keywords: ['xε_x + yε_y', 'Dreiecksungleichung', '(|x|+|y|)/|x+y|', 'x ≈ −y'],
    statusNote: 'Offizielle Lösung nur als Scan vorhanden; Lösung entspricht Beispiele 7 (b) des Skripts.',
    sources: [src('NUM-K-WS1920', '4', 'Aufgabe 6 e)'), sk('17', 'Beispiele 7 (b)')],
  }),
  paper({
    id: 'num.p.ws2021-6a', chapterId: ch, formulaIds: ['num.w.stabilitaet', 'num.w.ausloeschung'], difficulty: 2, origin: 'klausur', estMinutes: 10,
    prompt: t`**Klausur WiSe 2020/21, Aufgabe 6 a)** · Wir betrachten die Näherungen $\pi_n = n\,g_{2n}$ von $\pi$ für $n = 6, 12, 24, \dots$, wobei $g_{2n} = \sqrt{2 - \sqrt{4 - g_n^2}}$ mit Startwert $g_6 = 1$ im IEEE-double-Format berechnet wird. Stelle eine Vermutung auf, ob die berechnete Folge gegen $\pi$ konvergiert. Begründe und schlage gegebenenfalls eine alternative Berechnung von $g_{2n}$ vor.`,
    hints: ['Was passiert mit $g_n$, wenn $n$ wächst?', 'Wie groß ist dann $\\sqrt{4 - g_n^2}$ im Vergleich zu 2?', 'Erweitere mit $2 + \\sqrt{4 - g_n^2}$.'],
    modelAnswer: [
      'Vermutung: Die berechnete Folge konvergiert **nicht** gegen $\\pi$. Sie wird zunächst besser, dann wieder schlechter und ist am Ende unbrauchbar.',
      'Begründung: $g_n \\to 0$, also $\\sqrt{4 - g_n^2} \\approx 2$. In $2 - \\sqrt{4 - g_n^2}$ werden fast gleich große Zahlen subtrahiert → Auslöschung. Rundungsfehler der Größe eps (nach der Wurzel etwa $10^{-8}$) bestimmen das Ergebnis; schließlich wird die Differenz 0. Der Algorithmus ist instabil.',
      t`Alternative: mit $2 + \sqrt{4 - g_n^2}$ erweitern: $g_{2n}^2 = \dfrac{(2 - \sqrt{4-g_n^2})(2 + \sqrt{4-g_n^2})}{2 + \sqrt{4-g_n^2}} = \dfrac{g_n^2}{2 + \sqrt{4-g_n^2}}$, also $g_{2n} = \dfrac{g_n}{\sqrt{2 + \sqrt{4 - g_n^2}}}$.`,
      'Hier werden nur positive Zahlen addiert, es gibt keine Auslöschung: Die Variante ist stabil und liefert $\\pi$ bis auf Maschinengenauigkeit.',
    ],
    keywords: ['konvergiert nicht', 'g_n → 0', 'Auslöschung', 'erweitern', 'g_n / √(2 + √(4 − g_n²))'],
    sources: [src('NUM-K-WS2021', '3', 'Aufgabe 6 a) mit Lösungsskizze'), sk('10–12', 'Beispiel 2')],
  }),
]

/** Offizielle Zahlenwerte (Übungsblatt 2, Lösung) für den Inhaltstest. */
export const officialChecks = [
  { id: 'num.fl-grenzen.e1', value: 48, dec: 2, note: 'UB 2, Aufgabe 1 b) (iii): max FL = 48' },
  { id: 'num.fl-grenzen.e2', value: 0.25, dec: 4, note: 'UB 2, Aufgabe 1 b) (iii): min FL⁺ = 0,25' },
]
