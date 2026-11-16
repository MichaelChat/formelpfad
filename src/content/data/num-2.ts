/**
 * Numerische Mathematik – Kapitel 2: Direkte Lösungsverfahren für lineare Gleichungssysteme.
 * 2.1–2.2 LR- und Cholesky-Zerlegung · 2.3 QR-Zerlegung/Householder · 2.4 Kondition · 2.5 Ausgleichsrechnung.
 * Quellen: Skript (Seitenangaben = PDF-Seite), Übungsblätter 3–4, Altklausuren. Alle Zahlenbeispiele
 * wurden mit exakter Bruchrechnung bzw. numpy nachgerechnet.
 */
import { fmt } from '../../lib/format'
import { mc, numeric, opts, paper, src, trueFalse, wissen } from '../helpers'
import type { Chapter, Exercise, Formula, Variable } from '../types'

const t = String.raw
const chLR = 'num-lr'
const chQR = 'num-qr'
const chK = 'num-kondition'
const chA = 'num-ausgleich'
const sk = (pages: string, note?: string) => src('NUM-SKRIPT', pages, note)

const vCond: Variable = { sym: 'cond', tex: '\\mathrm{cond}(A)', name: 'Konditionszahl der Matrix A' }
const vNA: Variable = { sym: 'nA', tex: '\\|A\\|', name: 'Norm der Matrix A (zugehörige Matrixnorm)', domain: [1, 100] }
const vNAi: Variable = { sym: 'nAi', tex: '\\|A^{-1}\\|', name: 'Norm der Inversen', domain: [0.01, 100] }

export const chapters: Chapter[] = [
  {
    id: chLR,
    part: 'num',
    number: '2.1',
    title: 'LR- und Cholesky-Zerlegung',
    description: 'Ein schwieriges Gleichungssystem in zwei Dreieckssysteme zerlegen: Vorwärts- und Rückwärtssubstitution, Gauß-Elimination mit Spaltenpivotwahl, Cholesky für spd-Matrizen.',
    sources: [sk('19–29'), src('NUM-VL02', '1–21'), src('NUM-VL04', '1–26')],
    lessons: [
      { id: 'l-num-substitution', title: 'Dreieckssysteme lösen', goal: 'Vorwärts- und Rückwärtssubstitution durchführen und ihren Aufwand begründen.', formulaIds: ['num.w.substitution'], paperTaskIds: ['num.p.ws1718-1a'] },
      { id: 'l-num-lr-idee', title: 'Idee der LR-Zerlegung', goal: 'Erklären, wie man mit PA = LR ein LGS löst, warum das richtig ist und was es kostet.', formulaIds: ['num.w.lr-idee'], paperTaskIds: ['num.p.ss26-1a'] },
      { id: 'l-num-lr-pivot', title: 'LR mit Spaltenpivotwahl rechnen', goal: 'Eine LR-Zerlegung mit Zeilentausch Schritt für Schritt von Hand berechnen.', formulaIds: ['num.w.lr-pivot'], paperTaskIds: ['num.p.ss26-1b'] },
      { id: 'l-num-cholesky', title: 'Cholesky-Zerlegung', goal: 'Wissen, wann A = LLᵀ existiert, den Faktor L berechnen und den Vorteil gegenüber LR nennen.', formulaIds: ['num.w.cholesky'], paperTaskIds: ['num.p.ws1920-6a', 'num.p.ws1718-1b'] },
    ],
  },
  {
    id: chQR,
    part: 'num',
    number: '2.3',
    title: 'QR-Zerlegung mit Householder',
    description: 'Orthogonale Spiegelungen, auslöschungsfreie Householder-Vektoren, QR-Zerlegung und ein Vergleich der Aufwände aller direkten Verfahren.',
    sources: [sk('29–32'), src('NUM-VL04', '1–26')],
    lessons: [
      { id: 'l-num-householder', title: 'Householder-Transformationen', goal: 'Q = I − 2wwᵀ verstehen, w auslöschungsfrei wählen und Qy effizient berechnen.', formulaIds: ['num.w.householder'], paperTaskIds: ['num.p.ws2223-6c', 'num.p.ws2425-3ab', 'num.p.ss26-5'] },
      { id: 'l-num-qr', title: 'QR-Zerlegung und Aufwände', goal: 'Die QR-Zerlegung aus Householder-Schritten aufbauen und die Aufwände von LR, Cholesky und QR vergleichen.', formulaIds: ['num.w.qr', 'num.w.aufwaende'], paperTaskIds: ['num.p.ub3-3', 'num.p.ub3-1'] },
    ],
  },
  {
    id: chK,
    part: 'num',
    number: '2.4',
    title: 'Kondition linearer Gleichungssysteme',
    description: 'Matrixnormen, Konditionszahl und die Störungsabschätzung: Wie stark reagiert die Lösung von Ax = b auf Fehler in A und b?',
    sources: [sk('32–39'), src('NUM-VL05', '1–17')],
    lessons: [
      { id: 'l-num-matrixnorm', title: 'Matrixnormen', goal: 'Zugehörige Matrixnormen kennen und ‖A‖₁, ‖A‖∞, ‖A‖₂ berechnen.', formulaIds: ['num.w.matrixnorm'], paperTaskIds: ['num.p.ub4-1d', 'num.p.ss19-6c', 'num.p.ws2425-2'] },
      { id: 'l-num-cond', title: 'Konditionszahl und Störungen', goal: 'cond(A) berechnen, die Störungsabschätzung herleiten und richtig interpretieren.', formulaIds: ['num.cond', 'num.w.stoerung'], paperTaskIds: ['num.p.ss24-4', 'num.p.ss26-2'] },
    ],
  },
  {
    id: chA,
    part: 'num',
    number: '2.5',
    title: 'Lineare Ausgleichsrechnung',
    description: 'Überbestimmte Systeme: Methode der kleinsten Quadrate, Normalengleichung, Lösung mit QR-Zerlegung und die Singulärwertzerlegung.',
    sources: [sk('40–47'), src('NUM-VL06', '1–20')],
    lessons: [
      { id: 'l-num-normalengl', title: 'Ausgleichsproblem und Normalengleichung', goal: 'Ein Ausgleichsproblem aufstellen und mit der Normalengleichung lösen.', formulaIds: ['num.w.ausgleich'], paperTaskIds: ['num.p.ss22-6a', 'num.p.ws1718-1c'] },
      { id: 'l-num-ausgleich-qr', title: 'Ausgleichsrechnung mit QR', goal: 'Mit einer QR-Zerlegung lösen, das Residuum ablesen und erklären, warum QR besser ist als die Normalengleichung.', formulaIds: ['num.w.ausgleich-qr'], paperTaskIds: ['num.p.ws1718-4'] },
      { id: 'l-num-svd', title: 'Singulärwertzerlegung', goal: 'Die SVD erklären, Singulärwerte über AᵀA bestimmen und ‖A‖₂ = σ₁ begründen.', formulaIds: ['num.w.svd'], paperTaskIds: ['num.p.ss20-1ab', 'num.p.ws2223-1ab'] },
    ],
  },
]

export const formulas: Formula[] = [
  // ================================================================ 2.1 LR
  wissen({
    id: 'num.w.substitution',
    name: 'Vorwärts- und Rückwärtssubstitution',
    short: 'Dreieckssysteme',
    chapterId: chLR,
    tex: t`x_n = \frac{1}{r_{nn}}\Big(y_n - \sum_{j=n+1}^{N} r_{nj}\,x_j\Big),\quad n = N, \dots, 1`,
    definition: 'Ein System mit oberer Dreiecksmatrix Rx = y löst man von unten nach oben (Rückwärtssubstitution): Die letzte Zeile enthält nur x_N, die vorletzte zusätzlich x_N usw. Ein System mit unterer Dreiecksmatrix Ly = b löst man entsprechend von oben nach unten (Vorwärtssubstitution). Voraussetzung: alle Diagonalelemente ≠ 0.',
    keyPoints: [
      t`Rückwärts: $x_N = y_N / r_{NN}$, dann $x_{N-1} = (y_{N-1} - r_{N-1,N}x_N)/r_{N-1,N-1}$, allgemein Formel oben.`,
      t`Vorwärts: $y_1 = b_1/\ell_{11}$, $y_n = \big(b_n - \sum_{j<n} \ell_{nj} y_j\big)/\ell_{nn}$. Bei der LR-Zerlegung ist $\ell_{nn} = 1$, die Division entfällt.`,
      t`Eine „Operation“ ist im Skript ein Paar aus Multiplikation und Addition.`,
      t`Aufwand: In Zeile $n$ ein Skalarprodukt der Länge $N-n$. Summe $\sum (N-1-n) \approx \tfrac12 N^2$ Operationen, für Vorwärts und Rückwärts gleich.`,
      t`Divisionen (nur $N$ Stück) werden beim Aufwand vernachlässigt; zählt nur der dominante Term.`,
    ],
    example: {
      problem: t`Löse $Ly = b$ mit $L = \begin{pmatrix} 2 & 0 & 0 \\ -2 & -1 & 0 \\ 3 & 2 & 1 \end{pmatrix}$ und $b = (4, -3, 6)^\top$.`,
      steps: [t`Zeile 1: $2y_1 = 4 \Rightarrow y_1 = 2$.`, t`Zeile 2: $-2 \cdot 2 - y_2 = -3 \Rightarrow y_2 = -1$.`, t`Zeile 3: $3 \cdot 2 + 2 \cdot (-1) + y_3 = 6 \Rightarrow y_3 = 2$.`],
      result: 'y = (2, −1, 2)ᵀ',
      source: src('NUM-K-WS1718', '1', 'Aufgabe 1 a) mit Lösung'),
    },
    mistakes: ['Bei der Rückwärtssubstitution oben anfangen.', 'Den Aufwand mit $N^2$ statt $\\tfrac12 N^2$ angeben (es wird nur das halbe Dreieck durchlaufen).'],
    related: ['num.w.lr-idee', 'num.w.cholesky'],
    sources: [sk('20–21', 'Abschnitt 2.1.2')],
  }),
  wissen({
    id: 'num.w.lr-idee',
    name: 'LR-Zerlegung: Idee, Existenz und Aufwand',
    short: 'PA = LR',
    chapterId: chLR,
    tex: t`PA = LR \;\Rightarrow\; Ly = Pb,\quad Rx = y`,
    definition: 'Man zerlegt A einmal in eine untere Dreiecksmatrix L (mit Einsen auf der Diagonalen) und eine obere Dreiecksmatrix R, gegebenenfalls nach Zeilenvertauschung P: PA = LR. Dann löst man Ax = b durch zwei billige Dreieckssysteme: erst Ly = Pb vorwärts, dann Rx = y rückwärts.',
    keyPoints: [
      t`Algorithmus: (1) $PA = LR$ berechnen ($\tfrac13 N^3$), (2) $Ly = Pb$ vorwärts ($\tfrac12 N^2$), (3) $Rx = y$ rückwärts ($\tfrac12 N^2$).`,
      t`Beweis: $Ax = P^\top P A x = P^\top L R x = P^\top L y = P^\top P b = b$ (Permutationsmatrizen sind orthogonal: $P^\top P = I$).`,
      t`Hauptaufwand ist die Zerlegung. Sie lohnt sich besonders, wenn man mehrere rechte Seiten $b$ mit derselben Matrix lösen muss.`,
      t`Ohne Zeilentausch (Satz 2): $A = LR$ existiert genau dann, wenn alle führenden Hauptuntermatrizen $A[1{:}n, 1{:}n]$ regulär sind. Dann ist die Zerlegung eindeutig ($\ell_{nn} = 1$).`,
      t`Gegenbeispiel: $\begin{pmatrix} 0 & 1 \\ 2 & 3 \end{pmatrix}$ ist regulär, hat aber keine Zerlegung $A = LR$ (erstes Pivot ist 0).`,
      t`Mit Zeilentausch (Satz 3): Für jede reguläre Matrix gibt es eine Permutation $P$ mit $PA = LR$.`,
      t`Die Inverse $A^{-1}$ wird in der Praxis nicht berechnet.`,
    ],
    mistakes: [
      'Im ersten Schritt $Ly = b$ statt $Ly = Pb$ lösen (die Permutation vergessen).',
      'Behaupten, jede reguläre Matrix habe eine Zerlegung $A = LR$ ohne Zeilentausch.',
      'Aufwand der Zerlegung mit $\\tfrac23 N^3$ angeben: Das ist der Aufwand der QR-Zerlegung.',
    ],
    examTip: 'Die Klausur SS26 fragt genau das: Algorithmus, kurzer Beweis über $P^\\top P = I$ und Aufwand. Diese drei Teile auswendig können.',
    related: ['num.w.lr-pivot', 'num.w.substitution', 'num.w.aufwaende'],
    sources: [sk('19–23', 'Abschnitte 2.1.1–2.1.5, Satz 2, Satz 3'), src('NUM-K-SS26', '1', 'Aufgabe 1 a)')],
  }),
  wissen({
    id: 'num.w.lr-pivot',
    name: 'Gauß-Elimination mit Spaltenpivotwahl',
    short: 'LR von Hand',
    chapterId: chLR,
    tex: t`\ell_{nk} = \frac{a^{(k-1)}_{nk}}{a^{(k-1)}_{kk}},\qquad |a^{(k-1)}_{kk}| = \max_{n \ge k} |a^{(k-1)}_{nk}|`,
    definition: 'Spalte für Spalte wird unterhalb der Diagonalen eliminiert. Vor jedem Schritt wird die Zeile mit dem betragsgrößten Element in der aktuellen Spalte nach oben getauscht (Spaltenpivotwahl). Die Eliminationsfaktoren ℓ werden an die Stelle der entstehenden Nullen geschrieben und bilden später L. Ein Vektor der Zeilennummern merkt sich die Vertauschungen und liefert P.',
    keyPoints: [
      t`Schritt $k$: In Spalte $k$ ab Zeile $k$ das betragsgrößte Element suchen und diese Zeile mit Zeile $k$ tauschen.`,
      t`Für jede Zeile $n > k$: $\ell_{nk} = a_{nk}/a_{kk}$ und „Zeile $n$ minus $\ell_{nk}$ mal Zeile $k$“.`,
      t`$\ell_{nk}$ an die Stelle der neuen Null schreiben. Bei späteren Vertauschungen werden diese gespeicherten $\ell$-Einträge mitgetauscht, die Einsen der Diagonale von L nicht.`,
      t`Zeilennummern-Vektor vor die Matrix schreiben und mittauschen. Die Zeilen von P sind die Einheitsvektoren $e_j^\top$ in dieser Reihenfolge.`,
      t`Es werden keine Zeilen skaliert, nur getauscht und Vielfache addiert. Deshalb hat L Einsen auf der Diagonalen.`,
      t`Spaltenpivotwahl liefert $|\ell_{nm}| \le 1$ und damit mehr Stabilität. Sie wird auch gemacht, wenn kein Pivot 0 ist.`,
      t`Probe am Ende: $PA = LR$ ausmultiplizieren.`,
    ],
    example: {
      problem: t`Berechne $PA = LR$ mit Spaltenpivotwahl für $A = \begin{pmatrix} -2 & 0 & 1 \\ 3 & 2 & 5 \\ 4 & 4 & 3 \end{pmatrix}$ und löse $Ax = b$ mit $b = (0, 11, 6)^\top$.`,
      steps: [
        t`Spalte 1: $|4|$ ist maximal (Zeile 3) → tausche Zeilen 1 und 3. Zeilenvektor $(3, 2, 1)$, Matrix $$\begin{pmatrix} 4 & 4 & 3 \\ 3 & 2 & 5 \\ -2 & 0 & 1 \end{pmatrix}$$`,
        t`$\ell_{21} = \tfrac34$: Zeile 2 $- \tfrac34 \cdot$ Zeile 1 $= (0, -1, \tfrac{11}{4})$. $\ell_{31} = -\tfrac12$: Zeile 3 $+ \tfrac12 \cdot$ Zeile 1 $= (0, 2, \tfrac52)$.`,
        t`Kompakt (ℓ an die Stelle der Nullen): $$\begin{pmatrix} 4 & 4 & 3 \\ \tfrac34 & -1 & \tfrac{11}{4} \\ -\tfrac12 & 2 & \tfrac52 \end{pmatrix}$$ Zeilen $(3, 2, 1)$.`,
        t`Spalte 2: $|2| > |-1|$ → tausche Zeilen 2 und 3, **samt der ℓ-Einträge**: $$\begin{pmatrix} 4 & 4 & 3 \\ -\tfrac12 & 2 & \tfrac52 \\ \tfrac34 & -1 & \tfrac{11}{4} \end{pmatrix}$$ Zeilen $(3, 1, 2)$.`,
        t`$\ell_{32} = -\tfrac12$: $(-1, \tfrac{11}{4}) + \tfrac12 (2, \tfrac52) = (0, 4)$.`,
        t`Ablesen: $$L = \begin{pmatrix} 1 & 0 & 0 \\ -\tfrac12 & 1 & 0 \\ \tfrac34 & -\tfrac12 & 1 \end{pmatrix}$$ $$R = \begin{pmatrix} 4 & 4 & 3 \\ 0 & 2 & \tfrac52 \\ 0 & 0 & 4 \end{pmatrix}$$ $$P = \begin{pmatrix} 0 & 0 & 1 \\ 1 & 0 & 0 \\ 0 & 1 & 0 \end{pmatrix}$$`,
        t`Lösen: $Pb = (6, 0, 11)^\top$. Vorwärts: $y = (6, 3, 8)^\top$. Rückwärts: $x_3 = 2$, $x_2 = (3 - \tfrac52 \cdot 2)/2 = -1$, $x_1 = (6 + 4 - 6)/4 = 1$.`,
      ],
      result: 'x = (1, −1, 2)ᵀ',
    },
    mistakes: [
      'Bei einem späteren Zeilentausch die schon berechneten ℓ-Einträge nicht mittauschen.',
      'Das Pivot nach Größe statt nach **Betrag** wählen ($-5$ schlägt $3$).',
      'ℓ mit falschem Vorzeichen in L eintragen. In L steht der Faktor, mit dem man die obere Zeile **abzieht**.',
      'P aus den Tauschschritten in falscher Reihenfolge zusammensetzen. Sicher ist: den Zeilenvektor mittauschen und am Ende ablesen.',
    ],
    examTip: 'Notation wie im Skript: Zeilennummern links neben die Matrix, nach jedem Schritt die kompakte Matrix mit ℓ in der unteren Hälfte notieren. Am Ende L, R, P explizit hinschreiben.',
    supplement: 'Das Rechenbeispiel ist ein eigenes Beispiel der App (exakt nachgerechnet). Das Beispiel aus dem Skript steht in Beispiel 10.',
    related: ['num.w.lr-idee', 'num.w.substitution'],
    sources: [sk('23–26', 'Beispiel 10, Abschnitt 2.1.6'), src('NUM-K-SS26', '1', 'Aufgabe 1 b)')],
  }),
  wissen({
    id: 'num.w.cholesky',
    name: 'Cholesky-Zerlegung',
    short: 'A = LLᵀ',
    chapterId: chLR,
    tex: t`\ell_{nn} = \sqrt{a_{nn} - \sum_{j<n} \ell_{nj}^2},\qquad \ell_{mn} = \frac{1}{\ell_{nn}}\Big(a_{mn} - \sum_{j<n} \ell_{mj}\ell_{nj}\Big)\ (m > n)`,
    definition: 'Eine reguläre Matrix besitzt genau dann eine Zerlegung A = LLᵀ mit unterer Dreiecksmatrix L, wenn sie symmetrisch und positiv definit (spd) ist. Man löst Ax = b dann über Ly = b (vorwärts) und Lᵀx = y (rückwärts). Die Zerlegung kostet nur etwa die Hälfte einer LR-Zerlegung.',
    keyPoints: [
      t`spd: $A = A^\top$ und $x^\top A x > 0$ für alle $x \neq 0$. Aus $A = LL^\top$ folgen beide Eigenschaften direkt.`,
      t`Anders als bei LR stehen auf der Diagonalen von L im Allgemeinen keine Einsen.`,
      t`Berechnung Zeile für Zeile (wie im Beweis): Für die neue Zeile $l_{21}$ löst man $L_{11} l_{21} = a_{21}$ vorwärts, dann $\ell_{22} = \sqrt{a_{22} - l_{21}^\top l_{21}}$.`,
      t`Der Ausdruck unter der Wurzel ist $\det A / \det A_{11} > 0$, also bei spd-Matrizen immer positiv.`,
      t`Keine Zeilenvertauschungen: Sie würden Symmetrie und positive Definitheit zerstören.`,
      t`Aufwand $\tfrac16 N^3$ (halb so viel wie LR, weil A symmetrisch ist). L kann in A gespeichert werden.`,
      t`Praktischer spd-Test: Läuft die Cholesky-Zerlegung ohne Probleme durch, ist die Matrix (in der Regel) positiv definit.`,
    ],
    example: {
      problem: t`Berechne den Cholesky-Faktor von $A = \begin{pmatrix} 4 & 2 & -2 \\ 2 & 10 & 2 \\ -2 & 2 & 6 \end{pmatrix}$.`,
      steps: [
        t`$\ell_{11} = \sqrt{4} = 2$.`,
        t`Zeile 2: $\ell_{21} = a_{21}/\ell_{11} = 1$, $\ell_{22} = \sqrt{10 - 1^2} = 3$.`,
        t`Zeile 3: $\ell_{31} = -2/2 = -1$, $\ell_{32} = (a_{32} - \ell_{31}\ell_{21})/\ell_{22} = (2 + 1)/3 = 1$, $\ell_{33} = \sqrt{6 - 1 - 1} = 2$.`,
        t`Probe: $LL^\top$ ergibt wieder $A$.`,
      ],
      result: 'L = ((2,0,0), (1,3,0), (−1,1,2))',
    },
    mistakes: ['Cholesky auf eine nicht symmetrische oder nicht positiv definite Matrix anwenden.', 'Mit Pivotisierung arbeiten wollen.', 'Den Aufwand mit $\\tfrac13 N^3$ angeben (das ist LR).'],
    supplement: 'Das Rechenbeispiel ist ein eigenes Beispiel der App (exakt nachgerechnet).',
    related: ['num.w.lr-idee', 'num.w.ausgleich'],
    sources: [sk('26–29', 'Abschnitt 2.2, Satz 4, Bemerkungen 7')],
  }),

  // ================================================================ 2.3 QR
  wissen({
    id: 'num.w.householder',
    name: 'Householder-Transformation',
    short: 'Q = I − 2wwᵀ',
    chapterId: chQR,
    tex: t`Q = I - 2ww^\top,\quad w = \frac{v - \sigma e^1}{\|v - \sigma e^1\|_2},\quad \sigma = \begin{cases} -\|v\|_2 & v_1 > 0 \\ \ \ \|v\|_2 & v_1 \le 0 \end{cases}`,
    definition: 'Zu einem normierten Vektor w (wᵀw = 1) ist Q = I − 2wwᵀ eine Spiegelung an der Hyperebene senkrecht zu w. Wählt man w wie oben, so spiegelt Q den Vektor v auf ein Vielfaches von e¹: Qv = σe¹. Das ist das Werkzeug, mit dem man in einer Spalte alle Einträge unterhalb der Diagonalen auf einmal zu 0 macht.',
    keyPoints: [
      t`Q ist symmetrisch ($Q^\top = Q$) und orthogonal ($Q^\top Q = Q^2 = I$, denn $w^\top w = 1$).`,
      t`Spiegelung: $Qw = -w$ und $Qy = y$ für alle $y$ mit $w^\top y = 0$.`,
      t`Wegen der Orthogonalität gilt $\|Qv\|_2 = \|v\|_2$, deshalb muss $|\sigma| = \|v\|_2$ sein. Nur das Vorzeichen ist frei.`,
      t`Vorzeichenwahl gegen Auslöschung: In $v_1 - \sigma$ werden durch $\sigma = -\mathrm{sign}(v_1)\|v\|_2$ nur Zahlen gleichen Vorzeichens addiert.`,
      t`Q nie als Matrix aufstellen: $Qy = y - 2(w^\top y)\,w$ kostet nur etwa $2M$ Operationen statt $M^2$.`,
      t`Speichern: nur den Vektor w (bzw. die Householder-Vektoren aller Schritte).`,
    ],
    example: {
      problem: t`Bestimme die auslöschungsfreie Householder-Transformation mit $Qv = \sigma e^1$ für $v = (2, 1, 2)^\top$.`,
      steps: [
        t`$\|v\|_2 = \sqrt{4 + 1 + 4} = 3$. Da $v_1 = 2 > 0$: $\sigma = -3$.`,
        t`$v - \sigma e^1 = (2 + 3, 1, 2)^\top = (5, 1, 2)^\top$, Norm $\sqrt{30}$.`,
        t`$w = \tfrac{1}{\sqrt{30}}(5, 1, 2)^\top$, $Q = I - 2ww^\top = I - \tfrac{1}{15}\begin{pmatrix} 25 & 5 & 10 \\ 5 & 1 & 2 \\ 10 & 2 & 4 \end{pmatrix}$.`,
        t`Probe: $Qv = v - 2(w^\top v)w = (2,1,2)^\top - 2 \cdot \tfrac{15}{30}(5,1,2)^\top = (-3, 0, 0)^\top$.`,
      ],
      result: 'σ = −3, w = (5, 1, 2)ᵀ/√30',
    },
    mistakes: [
      'σ mit dem gleichen Vorzeichen wie $v_1$ wählen: Dann entsteht in $v_1 - \\sigma$ Auslöschung.',
      'w nicht normieren (dann ist $I - 2ww^\\top$ nicht orthogonal).',
      'Q explizit als Matrix aufstellen und multiplizieren (Aufwand $M^2$ statt $2M$).',
    ],
    supplement: 'Das Rechenbeispiel ist ein eigenes Beispiel der App (nachgerechnet).',
    related: ['num.w.qr', 'num.w.ausloeschung'],
    sources: [sk('30–31', 'Abschnitt 2.3.2'), src('NUM-UB03', '2–3', 'Aufgabe 3')],
  }),
  wissen({
    id: 'num.w.qr',
    name: 'QR-Zerlegung',
    short: 'A = QR',
    chapterId: chQR,
    tex: t`Q_N \cdots Q_2 Q_1 A = R = \begin{pmatrix} \bar R \\ 0 \end{pmatrix},\qquad A = QR,\ Q = Q_1 \cdots Q_N`,
    definition: 'Jede Matrix A ∈ ℝ^{M×N} (M ≥ N) mit maximalem Rang lässt sich als A = QR schreiben: Q orthogonal, R oben eine reguläre Dreiecksmatrix R̄ und darunter Nullen. Man baut sie mit N Householder-Schritten auf, die Spalte für Spalte die Einträge unter der Diagonalen eliminieren.',
    keyPoints: [
      t`Schritt 1: $Q_1$ spiegelt die erste Spalte auf $r_{11}e^1$. Schritt 2: Householder auf die Restmatrix (ohne erste Zeile und Spalte), mit Nullen bzw. Einheitsblock aufgefüllt, usw.`,
      t`LGS lösen ($M = N$): $c = Q^\top b$ berechnen (wegen $Q^{-1} = Q^\top$), dann $Rx = c$ rückwärts.`,
      t`Beweis: $Ax = QRx = Qc = QQ^\top b = b$.`,
      t`Besonders stabil (orthogonale Transformationen verstärken keine Fehler), aber für $M = N$ etwa doppelt so teuer wie LR: $\tfrac23 N^3$.`,
      t`Allgemein: $MN^2 - \tfrac13 N^3$ Operationen. Die Spalten $Q_1 a_n = a_n - 2(w^\top a_n)w$ werden ohne Q berechnet.`,
      t`Speichern: R und die Householder-Vektoren passen (fast) in den Platz von A; nur die Diagonale $r_{nn}$ braucht einen Zusatzvektor.`,
      t`Anwendungen: Ausgleichsrechnung, Eigenwerte (QR-Algorithmus), GMRES.`,
    ],
    mistakes: ['$Qc = b$ mit Gauß lösen statt einfach $c = Q^\\top b$ zu berechnen.', 'Vergessen, dass R bei $M > N$ unten Nullzeilen hat.', 'QR für das Lösen eines gewöhnlichen LGS als billiger als LR bezeichnen.'],
    related: ['num.w.householder', 'num.w.aufwaende', 'num.w.ausgleich-qr'],
    sources: [sk('29–32', 'Abschnitte 2.3.1, 2.3.3, Satz 5, Bemerkungen 8 und 9')],
  }),
  wissen({
    id: 'num.w.aufwaende',
    name: 'Aufwände der direkten Verfahren',
    short: '⅓ · ⅙ · ⅔ N³',
    chapterId: chQR,
    definition: 'Der Aufwand wird in Operationen gezählt (eine Operation = Multiplikation plus Addition), und nur der dominante Term zählt. Die Zerlegung ist immer der teure Teil, die Substitutionen kosten nur quadratisch viel.',
    keyPoints: [
      t`LR-Zerlegung: $\tfrac13 N^3$ (Herleitung: $\sum_{n=1}^{N-1} n^2 \approx \tfrac13 N^3$).`,
      t`Cholesky-Zerlegung: $\tfrac16 N^3$, die Hälfte von LR (Symmetrie).`,
      t`QR-Zerlegung: $\tfrac23 N^3$ für $M = N$, allgemein $MN^2 - \tfrac13 N^3$.`,
      t`Vorwärts- bzw. Rückwärtssubstitution: je $\tfrac12 N^2$.`,
      t`$Q^\top b$ mit gespeicherten Householder-Vektoren: $\approx 2MN - N^2$ statt $M^2$.`,
      t`Ausgleichsrechnung: Normalengleichung + Cholesky $\tfrac12 MN^2 + \tfrac16 N^3$, QR $MN^2 - \tfrac13 N^3$. Für $M \gg N$ ist QR etwa doppelt so teuer, aber stabiler.`,
    ],
    mistakes: ['Aufwände von LR und QR vertauschen.', 'Den Aufwand der Substitutionen als Hauptaufwand nennen.'],
    examTip: 'Fast jede Klausur fragt einen Aufwand ab. Diese Liste und die Herleitung „erster Eliminationsschritt kostet $(N-1)^2$, Summe über alle Schritte“ sollte sitzen.',
    related: ['num.w.lr-idee', 'num.w.cholesky', 'num.w.qr'],
    sources: [sk('25–26, 28–29, 32, 43–44', 'Aufwandsangaben in 2.1.6, 2.2, 2.3, Satz 8')],
  }),

  // ================================================================ 2.4 Kondition
  wissen({
    id: 'num.w.matrixnorm',
    name: 'Zugehörige Matrixnormen',
    short: '‖A‖₁, ‖A‖₂, ‖A‖∞',
    chapterId: chK,
    tex: t`\|A\| = \sup_{x \neq 0} \frac{\|Ax\|}{\|x\|} = \max_{\|x\| = 1} \|Ax\|`,
    definition: 'Zu jeder Vektornorm gehört eine Matrixnorm: der größte Faktor, um den A einen Vektor verlängern kann. Sie ist die kleinste Zahl mit ‖Ax‖ ≤ ‖A‖‖x‖ für alle x und damit das passende Werkzeug für Fehlerabschätzungen.',
    keyPoints: [
      t`Eigenschaften: Norm, $\|Ax\| \le \|A\|\|x\|$, $\|I\| = 1$, submultiplikativ $\|AB\| \le \|A\|\|B\|$.`,
      t`$\|A\|_1 = \max_m \sum_n |a_{nm}|$: größte **Spalten**summe der Beträge.`,
      t`$\|A\|_\infty = \max_n \sum_m |a_{nm}|$: größte **Zeilen**summe der Beträge.`,
      t`$\|A\|_2 = \sqrt{\lambda_{\max}(A^\top A)}$ (Spektralnorm). Für symmetrisches A: $\max |\lambda|$.`,
      t`Orthogonale Matrizen erhalten Längen: $\|Ux\|_2 = \|x\|_2$, also $\|U\|_2 = 1$ und $\|AU\|_2 = \|A\|_2$.`,
      t`Merkhilfe: Die „1“ steht senkrecht wie eine Spalte, das „∞“ liegt waagerecht wie eine Zeile.`,
    ],
    example: {
      problem: t`Berechne $\|A\|_1$, $\|A\|_\infty$ und $\|A\|_2$ für $A = \begin{pmatrix} 1 & 2 \\ 3 & 6 \end{pmatrix}$.`,
      steps: [t`Spaltensummen: $1 + 3 = 4$, $2 + 6 = 8$ → $\|A\|_1 = 8$.`, t`Zeilensummen: $1 + 2 = 3$, $3 + 6 = 9$ → $\|A\|_\infty = 9$.`, t`$A^\top A = \begin{pmatrix} 10 & 20 \\ 20 & 40 \end{pmatrix} = 10\begin{pmatrix} 1 & 2 \\ 2 & 4 \end{pmatrix}$ hat die Eigenwerte 0 und 50 → $\|A\|_2 = \sqrt{50}$.`],
      result: '‖A‖₁ = 8, ‖A‖∞ = 9, ‖A‖₂ = √50 ≈ 7,07',
      source: src('NUM-UB04', '1–2', 'Aufgabe 1 d)'),
    },
    mistakes: ['Spalten- und Zeilensummennorm verwechseln.', 'Beträge vergessen: $\\|A\\|_\\infty$ summiert $|a_{nm}|$.', '$\\|A\\|_2$ als größten Eigenwert von A (statt Wurzel aus dem größten Eigenwert von $A^\\top A$) angeben.'],
    related: ['num.cond'],
    sources: [sk('32–33', 'Definition 3, Beispiele 11'), src('NUM-UB04', '1–2', 'Aufgabe 1')],
  }),
  {
    id: 'num.cond',
    name: 'Konditionszahl einer Matrix',
    short: 'cond(A) = ‖A‖‖A⁻¹‖',
    chapterId: chK,
    tex: t`\mathrm{cond}(A) = \|A\|\,\|A^{-1}\|,\qquad \frac{\|x - \tilde x\|}{\|x\|} \le \mathrm{cond}(A)\,\frac{\|b - \tilde b\|}{\|b\|}`,
    lhs: 'cond',
    rhs: 'nA*nAi',
    variables: [vCond, vNA, vNAi],
    assumptions: ['A regulär.', 'Zugehörige Matrixnorm zu einer Vektornorm.', 'Abschätzung rechts: nur die rechte Seite b ist gestört.'],
    intuition: 'Die relative Störung von b kann sich in der Lösung um bis zu den Faktor cond(A) vergrößern. Herleitung: x − x̃ = A⁻¹(b − b̃) gibt ‖x − x̃‖ ≤ ‖A⁻¹‖‖b − b̃‖, und ‖b‖ ≤ ‖A‖‖x‖ liefert den Rest.',
    interpretation: 'cond(A) ≥ 1 immer. Großes cond(A) heißt: Das LGS ist schlecht konditioniert, kleine Daten- oder Rundungsfehler können die Lösung stark verfälschen. Faustregel: Bei cond(A) ≈ 10^k verliert man bis zu k Dezimalstellen.',
    useCases: ['Empfindlichkeit eines LGS beurteilen', 'Erklären, warum die Normalengleichung problematisch ist (cond₂(AᵀA) = cond₂(A)²)'],
    whenNot: ['Die Abschätzung ist eine obere Schranke und oft zu pessimistisch, wenn Struktur von A und b bekannt ist (z. B. Diagonalmatrizen).'],
    selectionHint: 'Gefragt ist die Empfindlichkeit eines LGS gegenüber Datenfehlern → Konditionszahl.',
    mistakes: [
      'Annehmen, $\\mathrm{cond}(A)$ könne kleiner als 1 sein: $1 = \\|I\\| = \\|AA^{-1}\\| \\le \\|A\\|\\|A^{-1}\\|$.',
      'Eine kleine Determinante mit schlechter Kondition gleichsetzen: $\\mathrm{cond}(\\alpha A) = \\mathrm{cond}(A)$, $\\det(\\alpha A) = \\alpha^N \\det A$.',
    ],
    rearranged: [
      { tex: t`\mathrm{cond}_2(A) = \frac{\max |\lambda|}{\min |\lambda|}`, note: 'für symmetrisches A' },
      { tex: t`\mathrm{cond}(A) = \frac{\max_{\|y\|=1}\|Ay\|}{\min_{\|z\|=1}\|Az\|}`, note: 'auch für rechteckige Matrizen' },
    ],
    example: {
      problem: t`Kondition von $A = \begin{pmatrix} 1 & 1 \\ 1 & 1-\varepsilon \end{pmatrix}$ in der Zeilensummennorm.`,
      steps: [
        t`$A^{-1} = -\tfrac{1}{\varepsilon}\begin{pmatrix} 1-\varepsilon & -1 \\ -1 & 1 \end{pmatrix}$.`,
        t`$\|A\|_\infty = 2$, $\|A^{-1}\|_\infty = \tfrac{2}{\varepsilon}$ (für kleines $\varepsilon > 0$).`,
        t`$\mathrm{cond}_\infty(A) = \tfrac{4}{\varepsilon}$, für $\varepsilon = 0{,}01$ also 400.`,
      ],
      result: 'cond∞(A) = 4/ε',
      source: sk('34', 'Beispiel 12'),
    },
    related: ['num.w.matrixnorm', 'num.w.stoerung', 'num.w.kondition'],
    difficulty: 2,
    sources: [sk('33–35', 'Definition 4, Bemerkung 10, (2.2), (2.3)')],
    status: 'geprüft',
  },
  wissen({
    id: 'num.w.stoerung',
    name: 'Störung von A und b (Satz 6)',
    short: 'Störungssatz',
    chapterId: chK,
    tex: t`\frac{\|x - \tilde x\|}{\|x\|} \le \frac{\mathrm{cond}(A)}{1 - \varepsilon_A\,\mathrm{cond}(A)}\,(\varepsilon_A + \varepsilon_b)`,
    definition: 'Sind Matrix und rechte Seite relativ um höchstens ε_A bzw. ε_b gestört und gilt ε_A · cond(A) < 1, dann ist der relative Fehler der Lösung höchstens cond(A)/(1 − ε_A cond(A)) · (ε_A + ε_b). Für kleine Störungen ε heißt das ungefähr: relativer Fehler ≤ 2ε · cond(A).',
    keyPoints: [
      t`Voraussetzungen: $\|A - \tilde A\| \le \varepsilon_A\|A\|$, $\|b - \tilde b\| \le \varepsilon_b\|b\|$, $\varepsilon_A\,\mathrm{cond}(A) < 1$.`,
      t`Beweisidee: $b - \tilde b = A(x - \tilde x) + (A - \tilde A)\tilde x$, mit $A^{-1}$ multiplizieren, Normen abschätzen, $\|\tilde x\| \le \|x\| + \|x - \tilde x\|$ und $\|b\| \le \|A\|\|x\|$.`,
      t`Die Konditionszahl ist nur eine **obere Schranke**. Für gegebenes A gibt es Störungen, bei denen Gleichheit gilt, aber oft ist sie zu pessimistisch.`,
      t`Beispiel Diagonalmatrix $\mathrm{diag}(1, \delta)$: $\mathrm{cond}_\infty = 1/|\delta|$ riesig, obwohl die Gleichungen entkoppelt und harmlos sind.`,
      t`Gut konditioniert: $\alpha I$, orthogonale Matrizen ($\mathrm{cond}_2 = 1$), die Spline-Matrix $\mathrm{tridiag}(1, 4, 1)$ ($\mathrm{cond}_\infty \le 3$, unabhängig von $N$ und $h$).`,
      t`Schlecht konditioniert: Hilbert-Matrizen $a_{nm} = 1/(n+m-1)$; schon für $N = 10$ etwa $10^{13}$.`,
      t`Abschätzung über die Neumann-Reihe: Ist $A = c\,(I + C)$ mit $\|C\| < 1$, dann $\|(I+C)^{-1}\| \le \dfrac{1}{1 - \|C\|}$.`,
    ],
    mistakes: ['Die Voraussetzung $\\varepsilon_A \\mathrm{cond}(A) < 1$ weglassen.', 'Die Schranke als tatsächlichen Fehler interpretieren.'],
    examTip: 'Der Spezialfall „nur b gestört“ ist eine typische Beweisaufgabe (SoSe 2024, Aufgabe 4 c). Der Neumann-Reihen-Trick kam in der Klausur SoSe 2026 (Aufgabe 2).',
    related: ['num.cond', 'num.w.matrixnorm'],
    sources: [sk('35–39', 'Satz 6, Bemerkungen 11 und 12, Beispiele 13 und 14, Abschnitt 2.4.2')],
  }),

  // ================================================================ 2.5 Ausgleich
  wissen({
    id: 'num.w.ausgleich',
    name: 'Lineares Ausgleichsproblem und Normalengleichung',
    short: 'AᵀAx = Aᵀb',
    chapterId: chA,
    tex: t`\|Ax - b\|_2 = \min! \iff A^\top A x = A^\top b`,
    definition: 'Ist Ax = b überbestimmt (mehr Gleichungen als Unbekannte, z. B. Messdaten), sucht man das x, für das der Fehler ‖Ax − b‖₂ minimal wird (Methode der kleinsten Quadrate). Genau diese x lösen die Normalengleichung AᵀAx = Aᵀb. Geometrisch: Das Residuum b − Ax steht senkrecht auf dem Bild von A.',
    keyPoints: [
      t`Modell: Messdaten $(t_m, y_m)$, Ansatz $f(t) = \sum_n x_n \varphi_n(t)$. Dann $A_{mn} = \varphi_n(t_m)$, $b_m = y_m$.`,
      t`Ausgleichsgerade: $\varphi_1 = 1$, $\varphi_2 = t$. Polynomielle Regression: Monome $1, t, \dots, t^{N-1}$.`,
      t`Satz 7: x löst das Ausgleichsproblem genau dann, wenn $A^\top A x = A^\top b$. Die Normalengleichung ist immer lösbar.`,
      t`Eindeutig lösbar genau dann, wenn A maximalen Rang N hat. Dann ist $A^\top A$ spd und man kann Cholesky verwenden.`,
      t`Problem: $\mathrm{cond}_2(A^\top A) = \mathrm{cond}_2(A)^2$. Die Kondition wird quadriert, und schon das Berechnen von $A^\top A$ kann Information zerstören.`,
      t`Aufwand: $A^\top A$ kostet $\tfrac12 N^2 M$ (Symmetrie), Cholesky $\tfrac16 N^3$.`,
      t`Tikhonov-Regularisierung bei schlechter Kondition: $\|Ax - b\|_2^2 + \alpha\|x\|_2^2 = \min!$, also $(A^\top A + \alpha I)x = A^\top b$. Großes α: gute Kondition, aber größerer Approximationsfehler.`,
    ],
    example: {
      problem: 'Bestimme die Ausgleichsgerade f(t) = x₁ + x₂t durch die Punkte (0, 1), (1, 2), (2, 2).',
      steps: [
        t`$A = \begin{pmatrix} 1 & 0 \\ 1 & 1 \\ 1 & 2 \end{pmatrix}$, $b = (1, 2, 2)^\top$.`,
        t`$A^\top A = \begin{pmatrix} 3 & 3 \\ 3 & 5 \end{pmatrix}$, $A^\top b = (5, 6)^\top$.`,
        t`Lösen: $x = \tfrac16\begin{pmatrix} 5 & -3 \\ -3 & 3 \end{pmatrix}\begin{pmatrix} 5 \\ 6 \end{pmatrix} = (\tfrac76, \tfrac12)^\top$.`,
      ],
      result: 'f(t) = 7/6 + t/2',
    },
    mistakes: ['$AA^\\top$ statt $A^\\top A$ bilden (falsche Dimension $M \\times M$).', 'Behaupten, die Normalengleichung sei die stabilste Methode.', 'Spalten von A falsch aufstellen: Spalte n gehört zur Ansatzfunktion $\\varphi_n$, Zeile m zum Messpunkt m.'],
    supplement: 'Das Beispiel mit der Ausgleichsgeraden ist ein eigenes Beispiel der App (nachgerechnet).',
    related: ['num.w.ausgleich-qr', 'num.w.cholesky', 'num.cond'],
    sources: [sk('40–43', 'Beispiel 16, Definition 5, Satz 7, Bemerkungen 15, Lemma 1, Bemerkung 16')],
  }),
  wissen({
    id: 'num.w.ausgleich-qr',
    name: 'Ausgleichsrechnung mit QR-Zerlegung (Satz 8)',
    short: 'R̄x = c',
    chapterId: chA,
    tex: t`Q^\top A = \begin{pmatrix} \bar R \\ 0 \end{pmatrix},\quad Q^\top b = \begin{pmatrix} c \\ d \end{pmatrix},\quad x = \bar R^{-1}c,\quad \|b - Ax\|_2 = \|d\|_2`,
    definition: 'Mit einer QR-Zerlegung von A (voller Rang, M ≥ N) löst man das Ausgleichsproblem ohne die Normalengleichung: Man transformiert b mit Qᵀ, löst das obere Dreieckssystem R̄x = c und kann die Norm des Residuums direkt als ‖d‖₂ ablesen.',
    keyPoints: [
      t`Beweis: Q ist orthogonal, also $\|Ax - b\|_2^2 = \|Q^\top(Ax - b)\|_2^2 = \|\bar R x - c\|_2^2 + \|d\|_2^2 \ge \|d\|_2^2$. Gleichheit für $\bar R x = c$.`,
      t`Algorithmus: (1) QR mit Householder, (2) $Q^\top b = (c, d)$ über die Householder-Vektoren, (3) $\bar R x = c$ rückwärts.`,
      t`Lösbarkeit des überbestimmten Systems $Ax = b$: genau dann, wenn $d = 0$.`,
      t`Aufwand $MN^2 - \tfrac13 N^3$, für $M \gg N$ etwa doppelt so viel wie die Normalengleichung.`,
      t`Trotzdem meist besser: Die Kondition des Problems ist bei kleinem Residuum $\mathrm{cond}_2(A)$ statt $\mathrm{cond}_2(A)^2$, und QR ist stabiler.`,
      t`Beispiel 17 im Skript: Für $A = \begin{pmatrix} 1 & 1 \\ \varepsilon & 0 \\ 0 & \varepsilon \end{pmatrix}$ mit $\varepsilon^2 < \mathrm{eps}$ wird $A^\top A$ in Gleitpunktarithmetik singulär. Cholesky bricht ab, QR liefert die richtige Lösung.`,
    ],
    mistakes: ['$Q^\\top b$ vollständig verwenden statt nur die ersten N Komponenten c.', 'Vergessen, dass die Restkomponenten d direkt die Residuumsnorm liefern.'],
    related: ['num.w.ausgleich', 'num.w.qr', 'num.w.svd'],
    sources: [sk('42–45', 'Satz 8, Bemerkung 17, Beispiel 17')],
  }),
  wissen({
    id: 'num.w.svd',
    name: 'Singulärwertzerlegung (SVD)',
    short: 'A = UΣVᵀ',
    chapterId: chA,
    tex: t`U^\top A V = \Sigma = \begin{pmatrix} \Sigma_R & 0 \\ 0 & 0 \end{pmatrix},\quad \Sigma_R = \mathrm{diag}(\sigma_1, \dots, \sigma_R),\ \sigma_1 \ge \dots \ge \sigma_R > 0`,
    definition: 'Jede Matrix A ∈ ℝ^{M×N} mit Rang R lässt sich mit orthogonalen Matrizen U, V auf Diagonalgestalt bringen: A = UΣVᵀ. Die Diagonaleinträge σ₁ ≥ … ≥ σ_R > 0 heißen Singulärwerte. Sie sind die Wurzeln der Eigenwerte von AᵀA; die Spalten von V sind die zugehörigen Eigenvektoren.',
    keyPoints: [
      t`$A^\top A = V\,\mathrm{diag}(\sigma_1^2, \dots, \sigma_N^2)\,V^\top$: Singulärwerte $= \sqrt{\text{EW von } A^\top A}$.`,
      t`Spalten von U: $u^r = \tfrac{1}{\sigma_r} A v^r$ für $r = 1, \dots, R$, dann zu einer Orthonormalbasis ergänzen.`,
      t`Reduzierte Form: $A = \sum_{r=1}^R \sigma_r\, u^r (v^r)^\top$.`,
      t`$\|A\|_2 = \sigma_1$ und $\|A\|_F = \sqrt{\sigma_1^2 + \dots + \sigma_R^2}$.`,
      t`Pseudoinverse: $x = A^+ b = \sum_{r=1}^R \dfrac{(u^r)^\top b}{\sigma_r} v^r$ ist die Lösung des Ausgleichsproblems mit minimaler Norm (auch bei Rangdefekt).`,
      t`Beste Rang-k-Approximation: $A_k = \sum_{r=1}^k \sigma_r u^r (v^r)^\top$ (Frobenius- und Spektralnorm).`,
      t`Anwendungen: Bildkompression, Dimensionsreduktion, PCA.`,
    ],
    mistakes: ['Singulärwerte mit den Eigenwerten von A verwechseln (gilt nur bei symmetrischen, positiv semidefiniten Matrizen).', 'Die Wurzel vergessen: Eigenwerte von $A^\\top A$ sind $\\sigma_r^2$.'],
    related: ['num.w.ausgleich-qr', 'num.w.matrixnorm'],
    sources: [sk('45–47', 'Abschnitt 2.5.1, Definition 6, Bemerkungen 18')],
  }),
]

export const exercises: Exercise[] = [
  // ------------------------------------------------------------ Substitution
  numeric({
    id: 'num.w.substitution.e1', chapterId: chLR, formulaIds: ['num.w.substitution'], skill: 'anwenden', difficulty: 1, origin: 'app',
    prompt: t`Löse $Rx = y$ mit $R = \begin{pmatrix} 2 & 1 \\ 0 & 4 \end{pmatrix}$ und $y = (5, 8)^\top$ durch Rückwärtssubstitution. Wie groß ist $x_1$?`,
    answer: 1.5, fmt: fmt.num(2),
    wrong: [{ value: 2.5, explanation: 'Du hast $x_2$ nicht eingesetzt: $x_1 = (5 - 1 \\cdot 2)/2$.' }, { value: 2, explanation: 'Das ist $x_2$.' }],
    hints: ['Von unten anfangen: $x_2 = 8/4$.', '$x_1 = (5 - 1 \\cdot x_2)/2$.'],
    explanation: ['$x_2 = 2$, dann $x_1 = (5 - 2)/2 = 1{,}5$.'],
    sources: [sk('20', 'Abschnitt 2.1.2')],
  }),
  mc({
    id: 'num.w.substitution.e2', chapterId: chLR, formulaIds: ['num.w.substitution'], skill: 'abrufen', difficulty: 1, origin: 'app',
    prompt: 'Welchen Aufwand (dominanter Term) hat die Rückwärtssubstitution für eine $N \\times N$-Dreiecksmatrix?',
    options: opts('*$\\tfrac12 N^2$ Operationen', ['$N^2$ Operationen', 'Es wird nur das halbe Dreieck durchlaufen.'], ['$\\tfrac13 N^3$ Operationen', 'Das ist die LR-Zerlegung.'], ['$N$ Operationen', 'Das ist nur die Anzahl der Divisionen.']),
    hints: ['In Zeile $n$ fällt ein Skalarprodukt der Länge $N - n$ an.', '$\\sum_{n} (N - n) \\approx ?$'],
    explanation: ['$\\sum_{n=0}^{N-2} (N-1-n) = \\tfrac{(N-1)N}{2} \\approx \\tfrac12 N^2$.'],
    sources: [sk('20–21')],
  }),
  trueFalse({
    id: 'num.w.substitution.e3', chapterId: chLR, formulaIds: ['num.w.substitution'], skill: 'erkennen', difficulty: 1, origin: 'app',
    prompt: 'Richtig oder falsch?',
    statements: [
      ['Ein System mit unterer Dreiecksmatrix löst man von oben nach unten.', true, 'Vorwärtssubstitution: Die erste Zeile enthält nur $y_1$.'],
      ['Bei $Ly = b$ aus einer LR-Zerlegung muss man in jeder Zeile durch $\\ell_{nn}$ teilen.', false, 'Bei der LR-Zerlegung ist $\\ell_{nn} = 1$.'],
      ['Die Substitution funktioniert nur, wenn alle Diagonalelemente ungleich 0 sind.', true, 'Sonst müsste man durch 0 teilen; die Matrix wäre singulär.'],
    ],
    hints: ['Wo steht nur eine Unbekannte?', 'Welche Diagonale hat L bei der LR-Zerlegung?'],
    sources: [sk('20–21')],
  }),

  // ------------------------------------------------------------ LR-Idee
  mc({
    id: 'num.w.lr-idee.e1', chapterId: chLR, formulaIds: ['num.w.lr-idee'], skill: 'abrufen', difficulty: 1, origin: 'app',
    prompt: 'Gegeben ist $PA = LR$. In welcher Reihenfolge löst man $Ax = b$?',
    options: opts('*Erst $Ly = Pb$ vorwärts, dann $Rx = y$ rückwärts.', ['Erst $Ly = b$ vorwärts, dann $Rx = Py$ rückwärts.', 'Die Permutation gehört zu b, und zwar vor dem ersten Schritt.'], ['Erst $Rx = b$ rückwärts, dann $Ly = x$ vorwärts.', 'Reihenfolge vertauscht: L steht links von R.'], ['$x = R^{-1}L^{-1}b$ mit expliziten Inversen.', 'Inversen werden in der Praxis nicht berechnet.']),
    hints: ['$PAx = Pb$ und $PA = LR$.', 'Setze $y := Rx$.'],
    explanation: ['$LRx = Pb$: Mit $y = Rx$ ist erst $Ly = Pb$, dann $Rx = y$ zu lösen.'],
    sources: [sk('23', 'Abschnitt 2.1.5')],
  }),
  mc({
    id: 'num.w.lr-idee.e2', chapterId: chLR, formulaIds: ['num.w.lr-idee'], skill: 'abrufen', difficulty: 1, origin: 'app',
    prompt: 'Welchen Aufwand hat die LR-Zerlegung (dominanter Term)?',
    options: opts('*$\\tfrac13 N^3$', ['$\\tfrac16 N^3$', 'Das ist Cholesky.'], ['$\\tfrac23 N^3$', 'Das ist QR für $M = N$.'], ['$\\tfrac12 N^2$', 'Das ist eine Substitution.']),
    hints: ['Der erste Eliminationsschritt kostet $(N-1)^2$.', '$\\sum n^2 \\approx \\tfrac13 N^3$.'],
    explanation: ['$\\sum_{n=1}^{N-1} n^2 = \\tfrac{(N-1)N(2N-1)}{6} \\approx \\tfrac13 N^3$.'],
    sources: [sk('25–26')],
  }),
  trueFalse({
    id: 'num.w.lr-idee.e3', chapterId: chLR, formulaIds: ['num.w.lr-idee'], skill: 'interpretieren', difficulty: 2, origin: 'app',
    prompt: 'Existenz der LR-Zerlegung: Richtig oder falsch?',
    statements: [
      ['Jede reguläre Matrix besitzt eine Zerlegung $A = LR$ ohne Zeilentausch.', false, 'Gegenbeispiel $\\begin{pmatrix} 0 & 1 \\\\ 2 & 3 \\end{pmatrix}$.'],
      ['Zu jeder regulären Matrix gibt es eine Permutation P mit $PA = LR$.', true, 'Satz 3.'],
      ['$A = LR$ ohne Tausch existiert genau dann, wenn alle führenden Hauptuntermatrizen regulär sind.', true, 'Satz 2; die Zerlegung ist dann eindeutig.'],
      ['Wenn man viele rechte Seiten mit derselben Matrix lösen muss, lohnt sich die LR-Zerlegung besonders.', true, 'Die teure Zerlegung ($\\tfrac13 N^3$) macht man einmal, jede rechte Seite kostet nur $N^2$.'],
    ],
    hints: ['Was passiert, wenn $a_{11} = 0$ ist?', 'Satz 2 und Satz 3 unterscheiden.'],
    sources: [sk('21–23', 'Satz 2, Satz 3')],
  }),

  // ------------------------------------------------------------ LR-Pivot
  numeric({
    id: 'num.w.lr-pivot.e1', chapterId: chLR, formulaIds: ['num.w.lr-pivot'], skill: 'anwenden', difficulty: 2, origin: 'app',
    prompt: t`Erster Schritt der LR-Zerlegung mit Spaltenpivotwahl für $A = \begin{pmatrix} 1 & 2 \\ 4 & 3 \end{pmatrix}$: Nach dem Zeilentausch, wie groß ist der Eliminationsfaktor $\ell_{21}$?`,
    answer: 0.25, fmt: fmt.num(2),
    wrong: [{ value: 4, explanation: 'Ohne Zeilentausch wäre $\\ell_{21} = 4/1$. Mit Spaltenpivotwahl kommt aber die 4 nach oben.' }],
    hints: ['Welches Element in Spalte 1 hat den größten Betrag?', 'Nach dem Tausch: $\\begin{pmatrix} 4 & 3 \\\\ 1 & 2 \\end{pmatrix}$.', '$\\ell_{21} = 1/4$.'],
    explanation: ['Pivot ist 4, also wird getauscht. Dann $\\ell_{21} = 1/4 = 0{,}25$ (und $|\\ell| \\le 1$, wie bei Spaltenpivotwahl immer).'],
    sources: [sk('26', 'Spaltenpivotwahl')],
  }),
  numeric({
    id: 'num.w.lr-pivot.e2', chapterId: chLR, formulaIds: ['num.w.lr-pivot'], skill: 'anwenden', difficulty: 2, origin: 'app',
    prompt: t`Fortsetzung: Für $A = \begin{pmatrix} 1 & 2 \\ 4 & 3 \end{pmatrix}$ mit Spaltenpivotwahl ist $R = \begin{pmatrix} 4 & 3 \\ 0 & r_{22} \end{pmatrix}$. Berechne $r_{22}$.`,
    answer: 1.25, fmt: fmt.num(2),
    wrong: [{ value: -5, explanation: 'Das ist $r_{22}$ ohne Zeilentausch: $3 - 4 \\cdot 2$.' }],
    hints: ['Zeile 2 (ursprünglich Zeile 1): $(1, 2)$.', '$2 - \\ell_{21} \\cdot 3 = 2 - \\tfrac14 \\cdot 3$.'],
    explanation: ['$r_{22} = 2 - \\tfrac34 = 1{,}25$. Probe: $LR = \\begin{pmatrix} 1 & 0 \\\\ \\tfrac14 & 1 \\end{pmatrix}\\begin{pmatrix} 4 & 3 \\\\ 0 & \\tfrac54 \\end{pmatrix} = \\begin{pmatrix} 4 & 3 \\\\ 1 & 2 \\end{pmatrix} = PA$.'],
    sources: [sk('24–26')],
  }),
  mc({
    id: 'num.w.lr-pivot.e3', chapterId: chLR, formulaIds: ['num.w.lr-pivot'], skill: 'auswaehlen', difficulty: 2, origin: 'app',
    prompt: 'Nach dem ersten Eliminationsschritt stehen in Spalte 2 unterhalb der Diagonalen die Werte $-3$ (Zeile 2) und $2$ (Zeile 3). Was ist zu tun?',
    options: opts(
      '*Nicht tauschen: Das Pivot $-3$ steht schon in Zeile 2. Dann $\\ell_{32} = 2/(-3) = -\\tfrac23$.',
      ['Zeilen 2 und 3 tauschen, weil $2 > -3$.', 'Entscheidend ist der Betrag: $|-3| = 3 > 2$.'],
      ['Zeilen 2 und 3 tauschen, inklusive der gespeicherten ℓ-Einträge.', 'Getauscht wird nur, wenn das betragsgrößte Element nicht schon oben steht.'],
      ['Zeilen 2 und 3 tauschen, die ℓ-Einträge aus Spalte 1 aber stehen lassen.', 'Ein Tausch ist hier nicht nötig. Und falls doch: Die gespeicherten ℓ wandern immer mit.'],
    ),
    hints: ['Vergleiche die Beträge.', '$|-3| = 3 > 2$. Steht das Pivot schon in Zeile 2?'],
    explanation: ['$|-3| > |2|$ und $-3$ steht bereits in Zeile 2: kein Tausch. Weiter mit $\\ell_{32} = 2/(-3)$. Stünde das betragsgrößte Element in Zeile 3, würde man tauschen und dabei die gespeicherten ℓ-Einträge mittauschen.'],
    sources: [sk('23–26', 'Beispiel 10, Spaltenpivotwahl')],
  }),

  // ------------------------------------------------------------ Cholesky
  mc({
    id: 'num.w.cholesky.e1', chapterId: chLR, formulaIds: ['num.w.cholesky'], skill: 'abrufen', difficulty: 1, origin: 'klausur',
    prompt: 'Unter welcher Voraussetzung besitzt eine reguläre Matrix eine Cholesky-Zerlegung $A = LL^\\top$?',
    options: opts('*A ist symmetrisch und positiv definit.', ['A ist symmetrisch.', 'Symmetrie allein reicht nicht, z. B. $\\begin{pmatrix} 0 & 1 \\\\ 1 & 0 \\end{pmatrix}$.'], ['Alle Hauptuntermatrizen sind regulär.', 'Das ist die Bedingung für LR ohne Zeilentausch.'], ['A ist eine Diagonalmatrix.', 'Viel zu speziell.']),
    hints: ['Was folgt für $A^\\top$ und $x^\\top A x$ aus $A = LL^\\top$?', 'spd'],
    explanation: ['Satz 4: Cholesky existiert genau für spd-Matrizen.'],
    sources: [sk('27', 'Satz 4'), src('NUM-K-WS1718', '1', 'Aufgabe 1 b)')],
  }),
  numeric({
    id: 'num.w.cholesky.e2', chapterId: chLR, formulaIds: ['num.w.cholesky'], skill: 'anwenden', difficulty: 2, origin: 'app',
    prompt: t`Berechne für $A = \begin{pmatrix} 9 & 3 \\ 3 & 5 \end{pmatrix}$ den Eintrag $\ell_{22}$ des Cholesky-Faktors.`,
    answer: 2, fmt: fmt.num(2),
    wrong: [{ value: 2.2361, explanation: 'Das ist $\\sqrt5$; du hast $\\ell_{21}^2$ nicht abgezogen.' }],
    hints: ['$\\ell_{11} = 3$, $\\ell_{21} = 3/3 = 1$.', '$\\ell_{22} = \\sqrt{a_{22} - \\ell_{21}^2}$.'],
    explanation: ['$\\ell_{22} = \\sqrt{5 - 1} = 2$.'],
    sources: [sk('27–28')],
  }),
  trueFalse({
    id: 'num.w.cholesky.e3', chapterId: chLR, formulaIds: ['num.w.cholesky'], skill: 'interpretieren', difficulty: 2, origin: 'app',
    prompt: 'Richtig oder falsch?',
    statements: [
      ['Die Cholesky-Zerlegung kostet etwa halb so viel wie die LR-Zerlegung.', true, '$\\tfrac16 N^3$ statt $\\tfrac13 N^3$.'],
      ['Bei Cholesky verwendet man Spaltenpivotwahl für mehr Stabilität.', false, 'Zeilentausch würde Symmetrie und Definitheit zerstören.'],
      ['Auf der Diagonalen von L stehen Einsen.', false, 'Das gilt für LR, nicht für Cholesky.'],
      ['Ein Abbruch der Cholesky-Zerlegung (negative Zahl unter der Wurzel) zeigt, dass A nicht positiv definit ist.', true, 'Darauf beruht der numerische spd-Test.'],
    ],
    hints: ['Vergleiche mit der LR-Zerlegung.', 'Was steht unter der Wurzel?'],
    sources: [sk('28–29', 'Bemerkungen 7')],
  }),

  // ------------------------------------------------------------ Householder
  mc({
    id: 'num.w.householder.e1', chapterId: chQR, formulaIds: ['num.w.householder'], skill: 'abrufen', difficulty: 2, origin: 'klausur',
    prompt: 'Wie wählt man σ in $w = (v - \\sigma e^1)/\\|v - \\sigma e^1\\|_2$, um Auslöschung zu vermeiden?',
    options: opts('*$\\sigma = -\\|v\\|_2$ für $v_1 > 0$, $\\sigma = \\|v\\|_2$ für $v_1 \\le 0$', ['$\\sigma = \\|v\\|_2$ für $v_1 > 0$, $\\sigma = -\\|v\\|_2$ für $v_1 \\le 0$', 'Dann wird in $v_1 - \\sigma$ eine fast gleich große Zahl abgezogen: Auslöschung.'], ['$\\sigma = v_1$', 'Es muss $|\\sigma| = \\|v\\|_2$ gelten, weil Q die Länge erhält.'], ['$\\sigma = 1$', 'Dann stimmt die Länge im Allgemeinen nicht.']),
    hints: ['Q ist orthogonal, also $|\\sigma| = \\|v\\|_2$.', 'In $v_1 - \\sigma$ sollen Zahlen gleichen Vorzeichens addiert werden.'],
    explanation: ['Mit $\\sigma = -\\mathrm{sign}(v_1)\\|v\\|_2$ wird $v_1 - \\sigma = v_1 + \\mathrm{sign}(v_1)\\|v\\|_2$: gleiche Vorzeichen, keine Auslöschung.'],
    sources: [sk('31', 'Berechnung von w und σ'), src('NUM-K-SS26', '6', 'Aufgabe 5 a)')],
  }),
  numeric({
    id: 'num.w.householder.e2', chapterId: chQR, formulaIds: ['num.w.householder'], skill: 'anwenden', difficulty: 2, origin: 'app',
    prompt: t`Für $v = (3, 4)^\top$ wird die auslöschungsfreie Householder-Transformation mit $Qv = \sigma e^1$ gesucht. Wie groß ist $\sigma$?`,
    answer: -5, fmt: fmt.num(0),
    wrong: [{ value: 5, explanation: 'Betrag stimmt, Vorzeichen nicht: Bei $v_1 > 0$ wählt man $\\sigma = -\\|v\\|_2$.' }],
    hints: ['$\\|v\\|_2 = \\sqrt{9 + 16}$.', 'Vorzeichen entgegengesetzt zu $v_1$.'],
    explanation: ['$\\|v\\|_2 = 5$, $v_1 = 3 > 0$, also $\\sigma = -5$ und $v - \\sigma e^1 = (8, 4)^\\top$.'],
    sources: [sk('31')],
  }),
  trueFalse({
    id: 'num.w.householder.e3', chapterId: chQR, formulaIds: ['num.w.householder'], skill: 'interpretieren', difficulty: 2, origin: 'app',
    prompt: 'Householder-Transformation $Q = I - 2ww^\\top$ mit $w^\\top w = 1$: Richtig oder falsch?',
    statements: [
      ['Q ist symmetrisch und orthogonal.', true, '$Q^\\top = Q$ und $Q^2 = I - 4ww^\\top + 4w(w^\\top w)w^\\top = I$.'],
      ['$Qw = -w$, und Vektoren senkrecht zu w bleiben unverändert.', true, 'Q ist eine Spiegelung an der Hyperebene $w^\\perp$.'],
      ['Um $Qy$ zu berechnen, stellt man Q als $M \\times M$-Matrix auf.', false, '$Qy = y - 2(w^\\top y)w$ kostet nur etwa $2M$ Operationen.'],
    ],
    hints: ['Rechne $Q^\\top$ und $Q^2$ aus.', 'Wie viel kostet ein Skalarprodukt?'],
    sources: [sk('30', 'Beobachtungen 1–4'), src('NUM-UB03', '2–3', 'Aufgabe 3 a), b)')],
  }),

  // ------------------------------------------------------------ QR
  mc({
    id: 'num.w.qr.e1', chapterId: chQR, formulaIds: ['num.w.qr'], skill: 'abrufen', difficulty: 1, origin: 'app',
    prompt: 'Wie löst man $Ax = b$ ($M = N$) mit einer QR-Zerlegung?',
    options: opts('*$c = Q^\\top b$ berechnen, dann $Rx = c$ rückwärts lösen.', ['$Qc = b$ mit Gauß-Elimination lösen, dann $Rx = c$.', 'Unnötig teuer: $Q^{-1} = Q^\\top$.'], ['$Rc = b$ rückwärts, dann $x = Qc$.', 'Reihenfolge vertauscht.'], ['$x = Q^\\top R^{-1} b$', 'Falsche Reihenfolge der Faktoren.']),
    hints: ['$QRx = b$.', 'Q orthogonal: $Q^{-1} = Q^\\top$.'],
    explanation: ['$QRx = b \\iff Rx = Q^\\top b$.'],
    sources: [sk('29', 'Abschnitt 2.3.1')],
  }),
  trueFalse({
    id: 'num.w.qr.e2', chapterId: chQR, formulaIds: ['num.w.qr'], skill: 'interpretieren', difficulty: 2, origin: 'app',
    prompt: 'Richtig oder falsch?',
    statements: [
      ['Zum Lösen eines quadratischen LGS ist QR etwa doppelt so teuer wie LR, dafür besonders stabil.', true, '$\\tfrac23 N^3$ statt $\\tfrac13 N^3$ (Bemerkung 8).'],
      ['Eine QR-Zerlegung existiert für jede Matrix $A \\in \\mathbb{R}^{M \\times N}$, $M \\ge N$, mit maximalem Rang.', true, 'Satz 5.'],
      ['Für die QR-Zerlegung mit Householder braucht man Spaltenpivotwahl.', false, 'Die Householder-Schritte sind orthogonal und brauchen keine Pivotisierung.'],
    ],
    hints: ['Vergleiche $\\tfrac23$ mit $\\tfrac13$.', 'Was garantiert Satz 5?'],
    sources: [sk('29, 31', 'Bemerkungen 8, Satz 5')],
  }),
  numeric({
    id: 'num.w.qr.e3', chapterId: chQR, formulaIds: ['num.w.qr'], skill: 'anwenden', difficulty: 2, origin: 'app',
    prompt: t`Gegeben $A = QR$ mit $R = \begin{pmatrix} 2 & 1 \\ 0 & 3 \end{pmatrix}$ und $Q^\top b = (5, 6)^\top$. Berechne $x_1$ der Lösung von $Ax = b$.`,
    answer: 1.5, fmt: fmt.num(2),
    hints: ['$Rx = Q^\\top b$ rückwärts lösen.', '$x_2 = 6/3 = 2$.', '$x_1 = (5 - 1 \\cdot 2)/2$.'],
    explanation: ['$x_2 = 2$, $x_1 = 1{,}5$.'],
    sources: [sk('29')],
  }),

  // ------------------------------------------------------------ Aufwände
  mc({
    id: 'num.w.aufwaende.e1', chapterId: chQR, formulaIds: ['num.w.aufwaende'], skill: 'abrufen', difficulty: 1, origin: 'app',
    prompt: 'Welche Zuordnung der Aufwände ($M = N$) ist richtig?',
    options: opts('*LR $\\tfrac13 N^3$, Cholesky $\\tfrac16 N^3$, QR $\\tfrac23 N^3$', ['LR $\\tfrac23 N^3$, Cholesky $\\tfrac13 N^3$, QR $\\tfrac16 N^3$', 'Die Reihenfolge ist genau umgekehrt.'], ['LR $\\tfrac13 N^3$, Cholesky $\\tfrac13 N^3$, QR $\\tfrac13 N^3$', 'Cholesky spart durch Symmetrie die Hälfte, QR kostet das Doppelte.'], ['LR $\\tfrac12 N^2$, Cholesky $\\tfrac16 N^3$, QR $\\tfrac23 N^3$', '$\\tfrac12 N^2$ ist eine Substitution.']),
    hints: ['Cholesky nutzt Symmetrie aus.', 'QR ist das teuerste, aber stabilste Verfahren.'],
    explanation: ['Faustregel: Cholesky = ½ · LR, QR = 2 · LR.'],
    sources: [sk('29', 'Zusammenstellung der Aufwände')],
  }),
  numeric({
    id: 'num.w.aufwaende.e2', chapterId: chQR, formulaIds: ['num.w.aufwaende'], skill: 'anwenden', difficulty: 2, origin: 'app',
    prompt: 'Ein LGS mit $N = 3000$ wird per LR-Zerlegung gelöst. Wie viele Operationen braucht die Zerlegung ungefähr (dominanter Term), in Milliarden?',
    answer: 9, fmt: fmt.num(1), relTol: 0.02,
    wrong: [{ value: 18, explanation: 'Das wäre $\\tfrac23 N^3$ (QR).' }, { value: 4.5, explanation: 'Das wäre $\\tfrac16 N^3$ (Cholesky).' }],
    hints: ['$\\tfrac13 N^3$', '$3000^3 = 2{,}7 \\cdot 10^{10}$'],
    explanation: ['$\\tfrac13 \\cdot 2{,}7 \\cdot 10^{10} = 9 \\cdot 10^9$, also etwa 9 Milliarden. Die beiden Substitutionen kosten zusammen nur $N^2 = 9 \\cdot 10^6$.'],
    sources: [sk('25–26')],
  }),
  trueFalse({
    id: 'num.w.aufwaende.e3', chapterId: chQR, formulaIds: ['num.w.aufwaende'], skill: 'interpretieren', difficulty: 2, origin: 'app',
    prompt: 'Richtig oder falsch?',
    statements: [
      ['Beim Lösen eines LGS mit LR liegt die Hauptarbeit in der Zerlegung, nicht in den Substitutionen.', true, '$\\tfrac13 N^3$ gegenüber $N^2$.'],
      ['Für $M \\gg N$ ist das Ausgleichsproblem mit QR etwa doppelt so teuer wie mit der Normalengleichung.', true, '$MN^2$ gegenüber $\\tfrac12 MN^2$.'],
      ['$Q^\\top b$ kostet mit gespeicherten Householder-Vektoren $M^2$ Operationen.', false, 'Nur etwa $2MN - N^2$, weil man Q nie aufstellt.'],
    ],
    hints: ['Kubisch schlägt quadratisch.', 'Wie wendet man Householder effizient an?'],
    sources: [sk('26, 44', 'Aufwand LR, Aufwand Algorithmus nach Satz 8')],
  }),

  // ------------------------------------------------------------ Matrixnorm
  numeric({
    id: 'num.w.matrixnorm.e1', chapterId: chK, formulaIds: ['num.w.matrixnorm'], skill: 'anwenden', difficulty: 1, origin: 'app',
    prompt: t`Berechne $\|A\|_\infty$ für $A = \begin{pmatrix} 1 & -2 \\ 3 & 4 \end{pmatrix}$.`,
    answer: 7, fmt: fmt.num(0),
    wrong: [{ value: 6, explanation: 'Das ist die Spaltensummennorm $\\|A\\|_1$.' }, { value: 3, explanation: 'Beträge vergessen: $|1| + |-2| = 3$, aber die zweite Zeile ergibt 7.' }],
    hints: ['Zeilensummennorm: Beträge zeilenweise addieren.', 'Zeile 1: 3, Zeile 2: 7.'],
    explanation: ['$\\max\\{|1| + |-2|,\\ |3| + |4|\\} = \\max\\{3, 7\\} = 7$.'],
    sources: [sk('33', 'Beispiele 11')],
  }),
  numeric({
    id: 'num.w.matrixnorm.e2', chapterId: chK, formulaIds: ['num.w.matrixnorm'], skill: 'anwenden', difficulty: 1, origin: 'app',
    prompt: t`Berechne $\|A\|_1$ für $A = \begin{pmatrix} 1 & -2 \\ 3 & 4 \end{pmatrix}$.`,
    answer: 6, fmt: fmt.num(0),
    wrong: [{ value: 7, explanation: 'Das ist die Zeilensummennorm.' }],
    hints: ['Spaltensummennorm: Beträge spaltenweise addieren.', 'Spalte 1: 4, Spalte 2: 6.'],
    explanation: ['$\\max\\{1 + 3,\\ 2 + 4\\} = 6$.'],
    sources: [sk('33', 'Beispiele 11')],
  }),
  mc({
    id: 'num.w.matrixnorm.e3', chapterId: chK, formulaIds: ['num.w.matrixnorm'], skill: 'abrufen', difficulty: 2, origin: 'app',
    prompt: 'Wie berechnet man die Spektralnorm $\\|A\\|_2$?',
    options: opts('*$\\sqrt{\\lambda_{\\max}(A^\\top A)}$', ['$\\lambda_{\\max}(A)$', 'Nur für symmetrische A gilt $\\|A\\|_2 = \\max|\\lambda|$.'], ['$\\lambda_{\\max}(A^\\top A)$', 'Die Wurzel fehlt.'], ['$\\sqrt{\\sum a_{nm}^2}$', 'Das ist die Frobeniusnorm.']),
    hints: ['$\\|Ax\\|_2^2 = x^\\top A^\\top A x$.', 'Maximum über normierte x: größter Eigenwert von $A^\\top A$.'],
    explanation: ['$\\|A\\|_2^2 = \\max_{\\|x\\|=1} x^\\top A^\\top A x = \\lambda_{\\max}(A^\\top A)$.'],
    sources: [sk('33', 'Beispiele 11 (b)'), src('NUM-UB04', '1–2', 'Aufgabe 1 c)')],
  }),
  numeric({
    id: 'num.w.matrixnorm.e4', chapterId: chK, formulaIds: ['num.w.matrixnorm'], skill: 'anwenden', difficulty: 2, origin: 'tutorium',
    prompt: t`Berechne $\|A\|_2$ für $A = \begin{pmatrix} 1 & 2 \\ 3 & 6 \end{pmatrix}$ (auf 4 Nachkommastellen).`,
    answer: Math.sqrt(50), fmt: fmt.num(4),
    wrong: [{ value: 50, explanation: 'Das ist der Eigenwert von $A^\\top A$; die Wurzel fehlt.' }, { value: 7, explanation: 'Das ist der größte Eigenwert von A selbst (Spur 7, det 0). A ist nicht symmetrisch.' }],
    hints: ['$A^\\top A = \\begin{pmatrix} 10 & 20 \\\\ 20 & 40 \\end{pmatrix}$.', 'Eigenwerte: Spur 50, Determinante 0.', '$\\sqrt{50}$'],
    explanation: ['$A^\\top A$ hat die Eigenwerte 0 und 50, also $\\|A\\|_2 = \\sqrt{50} \\approx 7{,}0711$.'],
    sources: [src('NUM-UB04', '1–2', 'Aufgabe 1 d) mit Lösung')],
  }),

  // ------------------------------------------------------------ cond
  mc({
    id: 'num.cond.e1', chapterId: chK, formulaIds: ['num.cond'], skill: 'erkennen', difficulty: 1, origin: 'app',
    prompt: 'Wie ist die Konditionszahl einer regulären Matrix definiert?',
    options: opts(t`*$\mathrm{cond}(A) = \|A\|\,\|A^{-1}\|$`, [t`$\mathrm{cond}(A) = \|A\| / \|A^{-1}\|$`, 'Es wird multipliziert, nicht geteilt.'], [t`$\mathrm{cond}(A) = |\det A|$`, 'Die Determinante sagt nichts über die Kondition: $\\mathrm{cond}(\\alpha A) = \\mathrm{cond}(A)$.'], [t`$\mathrm{cond}(A) = \|A^{-1}\|$`, 'Der Faktor $\\|A\\|$ fehlt.']),
    hints: ['Absolute Abweichung: Faktor $\\|A^{-1}\\|$.', 'Relativ: zusätzlich $\\|b\\| \\le \\|A\\|\\|x\\|$.'],
    explanation: [t`Definition 4: $\mathrm{cond}(A) = \|A\|\|A^{-1}\|$.`],
    sources: [sk('33', 'Definition 4')],
  }),
  numeric({
    id: 'num.cond.e2', chapterId: chK, formulaIds: ['num.cond'], skill: 'einsetzen', difficulty: 2, origin: 'vorlesung',
    prompt: t`Für $A = \begin{pmatrix} 1 & 1 \\ 1 & 1-\varepsilon \end{pmatrix}$ gilt $\|A\|_\infty = 2$ und $\|A^{-1}\|_\infty = 2/\varepsilon$. Berechne $\mathrm{cond}_\infty(A)$ für $\varepsilon = 0{,}01$.`,
    answer: 400, fmt: fmt.num(0),
    wrong: [{ value: 200, explanation: 'Das ist nur $\\|A^{-1}\\|_\\infty$.' }],
    hints: ['$\\mathrm{cond} = \\|A\\|\\|A^{-1}\\|$.', '$2 \\cdot 200$'],
    explanation: ['$\\mathrm{cond}_\\infty(A) = 2 \\cdot \\tfrac{2}{0{,}01} = 400$. Eine relative Störung von $b$ um $10^{-3}$ kann die Lösung also um bis zu 40 % verändern.'],
    sources: [sk('34', 'Beispiel 12')],
  }),
  numeric({
    id: 'num.cond.e3', chapterId: chK, formulaIds: ['num.cond'], skill: 'anwenden', difficulty: 2, origin: 'app',
    prompt: t`Die symmetrische Matrix $A = \begin{pmatrix} 2 & 1 \\ 1 & 2 \end{pmatrix}$ hat die Eigenwerte 3 und 1. Berechne $\mathrm{cond}_2(A)$.`,
    answer: 3, fmt: fmt.num(2),
    hints: ['Für symmetrische Matrizen: $\\mathrm{cond}_2 = \\max|\\lambda| / \\min|\\lambda|$.', '$3 / 1$'],
    explanation: ['$\\mathrm{cond}_2(A) = 3/1 = 3$: gut konditioniert.'],
    sources: [sk('35', 'cond₂ symmetrischer Matrizen')],
  }),
  trueFalse({
    id: 'num.cond.e4', chapterId: chK, formulaIds: ['num.cond'], skill: 'interpretieren', difficulty: 2, origin: 'app',
    prompt: 'Richtig oder falsch?',
    statements: [
      ['Für jede reguläre Matrix gilt $\\mathrm{cond}(A) \\ge 1$.', true, '$1 = \\|I\\| = \\|AA^{-1}\\| \\le \\|A\\|\\|A^{-1}\\|$.'],
      ['$\\mathrm{cond}(\\alpha A) = \\mathrm{cond}(A)$ für $\\alpha \\neq 0$.', true, 'Der Faktor kürzt sich: $|\\alpha| \\cdot |\\alpha|^{-1}$.'],
      ['Orthogonale Matrizen haben $\\mathrm{cond}_2 = 1$.', true, 'Sie erhalten Längen; $U^{-1} = U^\\top$ ist wieder orthogonal.'],
      ['Eine Matrix mit sehr kleiner Determinante ist immer schlecht konditioniert.', false, '$0{,}1 I$ hat $\\det = 10^{-N}$, aber $\\mathrm{cond} = 1$.'],
    ],
    hints: ['Denke an $I = AA^{-1}$.', 'Was passiert bei Skalierung mit α?'],
    sources: [sk('34–38', 'Bemerkung 10, Eigenschaften, 2.4.2')],
  }),

  // ------------------------------------------------------------ Störung
  mc({
    id: 'num.w.stoerung.e1', chapterId: chK, formulaIds: ['num.w.stoerung'], skill: 'abrufen', difficulty: 2, origin: 'app',
    prompt: 'Matrix und rechte Seite sind beide relativ um höchstens $\\varepsilon$ gestört (ε klein). Wie groß ist der relative Fehler der Lösung höchstens (in erster Ordnung)?',
    options: opts('*$2\\varepsilon \\cdot \\mathrm{cond}(A)$', ['$\\varepsilon \\cdot \\mathrm{cond}(A)$', 'Das gilt, wenn nur b gestört ist.'], ['$\\varepsilon^2 \\cdot \\mathrm{cond}(A)$', 'In erster Ordnung geht ε linear ein.'], ['$2\\varepsilon$', 'Ohne die Konditionszahl fehlt die Verstärkung.']),
    hints: ['Satz 6 mit $\\varepsilon_A = \\varepsilon_b = \\varepsilon$.', 'Für kleines ε ist $1/(1 - \\varepsilon\\,\\mathrm{cond}) \\approx 1$.'],
    explanation: ['$\\dfrac{\\mathrm{cond}(A)}{1 - \\varepsilon\\,\\mathrm{cond}(A)} \\cdot 2\\varepsilon = 2\\varepsilon\\,\\mathrm{cond}(A) + O(\\varepsilon^2)$ (Bemerkung 11).'],
    sources: [sk('35–36', 'Satz 6, Bemerkung 11')],
  }),
  numeric({
    id: 'num.w.stoerung.e2', chapterId: chK, formulaIds: ['num.w.stoerung'], skill: 'anwenden', difficulty: 2, origin: 'app',
    prompt: 'Eine Matrix $A = c\\,(I + C)$ hat $\\|C\\|_\\infty = \\tfrac34$. Welche obere Schranke liefert die Neumann-Reihe für $\\|(I + C)^{-1}\\|_\\infty$?',
    answer: 4, fmt: fmt.num(2),
    hints: ['$\\|(I+C)^{-1}\\| \\le \\sum_k \\|C\\|^k$.', 'Geometrische Reihe: $\\dfrac{1}{1 - \\|C\\|}$.'],
    explanation: ['$\\sum_{k=0}^\\infty (3/4)^k = \\dfrac{1}{1 - 3/4} = 4$.'],
    sources: [src('NUM-K-SS26', '2–3', 'Aufgabe 2 b)'), sk('38–39', 'Spline-Matrix')],
  }),
  trueFalse({
    id: 'num.w.stoerung.e3', chapterId: chK, formulaIds: ['num.w.stoerung'], skill: 'interpretieren', difficulty: 2, origin: 'app',
    prompt: 'Richtig oder falsch?',
    statements: [
      ['Die Abschätzung aus Satz 6 kann für manche Störungen mit Gleichheit erfüllt sein.', true, 'Bemerkung 12: In diesem Sinne ist sie optimal.'],
      ['Für die Diagonalmatrix $\\mathrm{diag}(1, 10^{-8})$ ist das LGS schlecht lösbar, weil $\\mathrm{cond}_\\infty = 10^8$.', false, 'Die Gleichungen sind entkoppelt; die große Konditionszahl misst auch Störungen außerhalb der Diagonalen, die hier nicht auftreten.'],
      ['Die Spline-Matrix $\\mathrm{tridiag}(1, 4, 1)$ ist unabhängig von N und h gut konditioniert.', true, '$\\mathrm{cond}_\\infty \\le 3$ über die Neumann-Reihe.'],
      ['Hilbert-Matrizen sind ein Standardbeispiel für sehr schlechte Kondition.', true, 'Schon für $N = 10$ etwa $3{,}5 \\cdot 10^{13}$.'],
    ],
    hints: ['Obere Schranke vs. tatsächlicher Fehler.', 'Was nutzt die Struktur einer Diagonalmatrix aus?'],
    sources: [sk('36–39', 'Bemerkung 12, Beispiel 14, 2.4.2')],
  }),

  // ------------------------------------------------------------ Ausgleich
  mc({
    id: 'num.w.ausgleich.e1', chapterId: chA, formulaIds: ['num.w.ausgleich'], skill: 'abrufen', difficulty: 1, origin: 'klausur',
    prompt: 'Wie lautet die Normalengleichung zum Ausgleichsproblem $\\|Ax - b\\|_2 = \\min!$?',
    options: opts('*$A^\\top A x = A^\\top b$', ['$AA^\\top x = Ab$', 'Dimensionen passen nicht: $AA^\\top$ ist $M \\times M$.'], ['$Ax = b$', 'Das ist das (meist unlösbare) überbestimmte System.'], ['$A^\\top A x = b$', 'Auch die rechte Seite wird mit $A^\\top$ multipliziert.']),
    hints: ['Das Residuum steht senkrecht auf dem Bild von A.', '$A^\\top(Ax - b) = 0$.'],
    explanation: ['$A^\\top(Ax - b) = 0 \\iff A^\\top A x = A^\\top b$ (Definition 5, Satz 7).'],
    sources: [sk('41', 'Definition 5, Satz 7'), src('NUM-K-WS1718', '1', 'Aufgabe 1 c) (i)')],
  }),
  numeric({
    id: 'num.w.ausgleich.e2', chapterId: chA, formulaIds: ['num.w.ausgleich'], skill: 'anwenden', difficulty: 2, origin: 'app',
    prompt: 'Bestimme die Steigung der Ausgleichsgeraden $f(t) = x_1 + x_2 t$ durch die Punkte $(0, 1)$, $(1, 2)$, $(2, 2)$.',
    answer: 0.5, fmt: fmt.num(4),
    hints: ['$A^\\top A = \\begin{pmatrix} 3 & 3 \\\\ 3 & 5 \\end{pmatrix}$, $A^\\top b = (5, 6)^\\top$.', 'Determinante $= 6$.', '$x_2 = (3 \\cdot 6 - 3 \\cdot 5)/6$.'],
    explanation: ['$x = (\\tfrac76, \\tfrac12)^\\top$, die Steigung ist $x_2 = 0{,}5$.'],
    sources: [sk('41', 'Beispiel 16 (Prinzip)')],
  }),
  numeric({
    id: 'num.w.ausgleich.e3', chapterId: chA, formulaIds: ['num.w.ausgleich'], skill: 'anwenden', difficulty: 2, origin: 'app',
    prompt: 'Eine Matrix A hat $\\mathrm{cond}_2(A) = 10^4$. Es gilt $\\mathrm{cond}_2(A^\\top A) = 10^k$. Wie groß ist k?',
    answer: 8, fmt: fmt.int(),
    wrong: [{ value: 4, explanation: 'Die Kondition wird quadriert (Lemma 1), nicht übernommen.' }, { value: 16, explanation: 'Quadrieren verdoppelt den Exponenten: $(10^4)^2 = 10^8$.' }],
    hints: ['Lemma 1.', '$(10^4)^2$'],
    explanation: ['$\\mathrm{cond}_2(A^\\top A) = \\mathrm{cond}_2(A)^2 = 10^8$. Deshalb ist die Normalengleichung für schlecht konditionierte Probleme gefährlich.'],
    sources: [sk('42', 'Lemma 1')],
  }),
  trueFalse({
    id: 'num.w.ausgleich.e4', chapterId: chA, formulaIds: ['num.w.ausgleich'], skill: 'interpretieren', difficulty: 2, origin: 'app',
    prompt: 'Richtig oder falsch?',
    statements: [
      ['Die Normalengleichung ist immer lösbar.', true, '$A^\\top b \\in \\mathrm{Bild}(A^\\top) = \\mathrm{Bild}(A^\\top A)$.'],
      ['Das Ausgleichsproblem ist genau dann eindeutig lösbar, wenn A maximalen Rang hat.', true, 'Dann ist $A^\\top A$ spd.'],
      ['Bei der Lösung steht das Residuum $b - Ax$ senkrecht auf dem Bild von A.', true, 'Ax ist die orthogonale Projektion von b auf Bild(A).'],
      ['Tikhonov-Regularisierung mit großem α verbessert die Kondition ohne Nachteile.', false, 'Großes α vergrößert den Approximationsfehler: Man löst ein anderes Problem.'],
    ],
    hints: ['Satz 7 und Bemerkungen 15.', 'Was ist der Preis eines großen α?'],
    sources: [sk('42–43', 'Bemerkungen 15, Bemerkung 16')],
  }),

  // ------------------------------------------------------------ Ausgleich QR
  mc({
    id: 'num.w.ausgleich-qr.e1', chapterId: chA, formulaIds: ['num.w.ausgleich-qr'], skill: 'abrufen', difficulty: 2, origin: 'klausur',
    prompt: 'Sei $Q^\\top A = \\begin{pmatrix} \\bar R \\\\ 0 \\end{pmatrix}$ und $Q^\\top b = \\begin{pmatrix} c \\\\ d \\end{pmatrix}$. Wie lautet die Lösung des Ausgleichsproblems und die Norm des Residuums?',
    options: opts('*$x = \\bar R^{-1} c$, $\\|b - Ax\\|_2 = \\|d\\|_2$', ['$x = \\bar R^{-1} d$, $\\|b - Ax\\|_2 = \\|c\\|_2$', 'c und d vertauscht.'], ['$x = \\bar R^{-1} c$, $\\|b - Ax\\|_2 = 0$', 'Das Residuum ist nur 0, wenn $d = 0$.'], ['$x = Q\\bar R^{-1} c$', 'Q wurde schon auf b angewendet.']),
    hints: ['$\\|Ax - b\\|_2^2 = \\|\\bar R x - c\\|_2^2 + \\|d\\|_2^2$.', 'Der erste Summand lässt sich auf 0 bringen.'],
    explanation: ['Satz 8 und Bemerkung 17.'],
    sources: [sk('43', 'Satz 8, Bemerkung 17'), src('NUM-K-SS17', '1', 'Aufgabe 3 a)')],
  }),
  numeric({
    id: 'num.w.ausgleich-qr.e2', chapterId: chA, formulaIds: ['num.w.ausgleich-qr'], skill: 'anwenden', difficulty: 2, origin: 'app',
    prompt: t`Für ein Ausgleichsproblem gilt $Q^\top b = (2, 1, 3, -4)^\top$ und $\bar R \in \mathbb{R}^{2 \times 2}$. Wie groß ist die Norm des Residuums $\|b - Ax\|_2$ der Lösung?`,
    answer: 5, fmt: fmt.num(2),
    wrong: [{ value: Math.sqrt(30), explanation: 'Das ist die Norm von ganz $Q^\\top b$. Nur die letzten $M - N$ Komponenten zählen.' }],
    hints: ['$N = 2$: c sind die ersten zwei Komponenten, d die letzten zwei.', '$\\|d\\|_2 = \\sqrt{3^2 + 4^2}$.'],
    explanation: ['$d = (3, -4)^\\top$, $\\|d\\|_2 = 5$.'],
    sources: [sk('43', 'Bemerkung 17')],
  }),
  trueFalse({
    id: 'num.w.ausgleich-qr.e3', chapterId: chA, formulaIds: ['num.w.ausgleich-qr'], skill: 'interpretieren', difficulty: 2, origin: 'app',
    prompt: 'QR oder Normalengleichung? Richtig oder falsch?',
    statements: [
      ['QR ist bei $M \\gg N$ etwa doppelt so teuer, wird aber wegen besserer Kondition und Stabilität meist vorgezogen.', true, 'Mehraufwand gerechtfertigt (Skript nach Satz 8).'],
      ['Im Beispiel mit $\\varepsilon^2 < \\mathrm{eps}$ wird $A^\\top A$ in Gleitpunktarithmetik singulär.', true, '$1 + \\varepsilon^2$ wird zu 1 gerundet; Cholesky bricht ab.'],
      ['Mit QR muss man $A^\\top A$ ebenfalls berechnen.', false, 'Genau das vermeidet QR.'],
    ],
    hints: ['Welche Kondition hat welches Verfahren?', 'Was passiert mit $1 + \\varepsilon^2$?'],
    sources: [sk('43–45', 'Text nach Satz 8, Beispiel 17')],
  }),

  // ------------------------------------------------------------ SVD
  numeric({
    id: 'num.w.svd.e1', chapterId: chA, formulaIds: ['num.w.svd'], skill: 'anwenden', difficulty: 2, origin: 'app',
    prompt: t`Die Matrix $A^\top A$ einer Matrix A hat die Eigenwerte 16, 9 und 0. Wie groß ist der größte Singulärwert $\sigma_1$ von A?`,
    answer: 4, fmt: fmt.num(2),
    wrong: [{ value: 16, explanation: 'Das ist $\\sigma_1^2$; die Wurzel fehlt.' }],
    hints: ['Singulärwerte = Wurzeln der Eigenwerte von $A^\\top A$.', '$\\sqrt{16}$'],
    explanation: ['$\\sigma_1 = 4$, $\\sigma_2 = 3$; der Eigenwert 0 zeigt Rang $R = 2$. Außerdem $\\|A\\|_2 = \\sigma_1 = 4$.'],
    sources: [sk('45', 'Beweis der Existenz')],
  }),
  mc({
    id: 'num.w.svd.e2', chapterId: chA, formulaIds: ['num.w.svd'], skill: 'abrufen', difficulty: 2, origin: 'app',
    prompt: 'Was liefert die Pseudoinverse $x = A^+ b = V\\Sigma^+ U^\\top b$ bei einem Ausgleichsproblem mit Rangdefekt?',
    options: opts('*Die Lösung des Ausgleichsproblems mit minimaler euklidischer Norm.', ['Die exakte Lösung von $Ax = b$.', 'Die gibt es bei überbestimmten Systemen meist nicht.'], ['Irgendeine der unendlich vielen Lösungen.', 'Es ist eine ganz bestimmte: die mit kleinstem $\\|x\\|_2$.'], ['Die Lösung der Tikhonov-Regularisierung mit $\\alpha = 1$.', 'Die Tikhonov-Lösung konvergiert nur für $\\alpha \\to 0$ gegen $A^+b$.']),
    hints: ['Bei Rangdefekt gibt es unendlich viele Minimierer.', 'Welcher davon ist ausgezeichnet?'],
    explanation: ['Bemerkungen 18 2): $A^+ b$ minimiert $\\|Ax - b\\|_2$ und unter allen Minimierern $\\|x\\|_2$.'],
    sources: [sk('46', 'Bemerkungen 18 2)')],
  }),
  trueFalse({
    id: 'num.w.svd.e3', chapterId: chA, formulaIds: ['num.w.svd'], skill: 'interpretieren', difficulty: 2, origin: 'app',
    prompt: 'Richtig oder falsch?',
    statements: [
      ['$\\|A\\|_2 = \\sigma_1$.', true, 'Bemerkungen 18 3).'],
      ['Die Singulärwerte einer Matrix sind immer ihre Eigenwerte.', false, 'Nur bei symmetrischen, positiv semidefiniten Matrizen.'],
      ['$A_k = \\sum_{r=1}^k \\sigma_r u^r (v^r)^\\top$ ist die beste Approximation vom Rang k.', true, 'Bezüglich Frobenius- und Spektralnorm.'],
    ],
    hints: ['Spektralnorm über $A^\\top A$.', 'Abgeschnittene SVD.'],
    sources: [sk('46–47', 'Bemerkungen 18')],
  }),

  // ======================================================== Papier-Aufgaben
  paper({
    id: 'num.p.ws1718-1a', chapterId: chLR, formulaIds: ['num.w.substitution'], difficulty: 1, origin: 'klausur', estMinutes: 4,
    prompt: t`**Klausur WiSe 2017/18, Aufgabe 1 a)** · Löse $Ly = b$ durch Vorwärtssubstitution für
$$L = \begin{pmatrix} 2 & 0 & 0 \\ -2 & -1 & 0 \\ 3 & 2 & 1 \end{pmatrix},\qquad b = \begin{pmatrix} 4 \\ -3 \\ 6 \end{pmatrix}.$$`,
    hints: ['Erste Zeile enthält nur $y_1$.', 'Bekannte Werte in die nächste Zeile einsetzen.'],
    modelAnswer: [t`$2y_1 = 4 \Rightarrow y_1 = 2$`, t`$-2 \cdot 2 - y_2 = -3 \Rightarrow y_2 = -1$`, t`$3 \cdot 2 + 2 \cdot (-1) + y_3 = 6 \Rightarrow y_3 = 2$`, t`Also $y = (2, -1, 2)^\top$.`],
    keywords: ['von oben nach unten', 'y = (2, −1, 2)ᵀ'],
    sources: [src('NUM-K-WS1718', '1', 'Aufgabe 1 a) mit Lösung')],
  }),
  paper({
    id: 'num.p.ss26-1a', chapterId: chLR, formulaIds: ['num.w.lr-idee'], difficulty: 2, origin: 'klausur', estMinutes: 8,
    prompt: t`**Klausur SoSe 2026, Aufgabe 1 a)** · Seien $N \in \mathbb{N}$, $A \in \mathbb{R}^{N \times N}$ und $b \in \mathbb{R}^N$. Erkläre, wie du mit einer gegebenen LR-Zerlegung (mit Zeilenvertauschung) von A das LGS $Ax = b$ algorithmisch lösen kannst. Bestätige die Erklärung durch einen kurzen Beweis und gib den Aufwand an.`,
    hints: ['Die LR-Zerlegung mit Tausch hat die Form $PA = LR$.', 'Zwei Dreieckssysteme.', 'Für den Beweis: $P^\\top P = I$.'],
    modelAnswer: [
      t`Gegeben $PA = LR$. Löse zuerst $Ly = Pb$ durch Vorwärtssubstitution, dann $Rx = y$ durch Rückwärtssubstitution.`,
      t`Beweis: $Ax = P^\top P A x = P^\top L R x = P^\top L y = P^\top P b = b$ (P ist eine Permutationsmatrix und damit orthogonal).`,
      t`Aufwand: Vorwärts- und Rückwärtssubstitution kosten jeweils $\tfrac12 N^2$ Operationen (die Zerlegung selbst, falls sie noch berechnet werden muss, $\tfrac13 N^3$).`,
    ],
    keywords: ['Ly = Pb', 'Rx = y', 'PᵀP = I', '½N² je Substitution'],
    sources: [src('NUM-K-SS26', '1', 'Aufgabe 1 a) mit Lösungsskizze')],
  }),
  paper({
    id: 'num.p.ss26-1b', chapterId: chLR, formulaIds: ['num.w.lr-pivot'], difficulty: 2, origin: 'klausur', estMinutes: 12,
    prompt: t`**Klausur SoSe 2026, Aufgabe 1 b)** · Berechne unter Verwendung der Spaltenpivotwahl eine LR-Zerlegung der Matrix
$$A = \begin{pmatrix} 0 & 1 & 2 \\ 2 & 4 & 6 \\ 1 & 4 & 5 \end{pmatrix}.$$
Gib die Matrizen $P$, $L$ und $R$ explizit an.`,
    hints: ['Spalte 1: Welches Element hat den größten Betrag?', 'Zeilennummern-Vektor mitführen, ℓ-Einträge in die entstehenden Nullen schreiben.', 'Spalte 2 nach dem ersten Schritt: Einträge 1 und 2 vergleichen, beim Tausch die ℓ mittauschen.'],
    modelAnswer: [
      t`Spalte 1: Pivot $2$ (Zeile 2) → Zeilen 1 und 2 tauschen, Zeilenvektor $(2, 1, 3)$: $\begin{pmatrix} 2 & 4 & 6 \\ 0 & 1 & 2 \\ 1 & 4 & 5 \end{pmatrix}$.`,
      t`$\ell_{21} = 0/2 = 0$ (Zeile bleibt), $\ell_{31} = \tfrac12$: $(1, 4, 5) - \tfrac12(2, 4, 6) = (0, 2, 2)$. Kompakt: $\begin{pmatrix} 2 & 4 & 6 \\ 0 & 1 & 2 \\ \tfrac12 & 2 & 2 \end{pmatrix}$.`,
      t`Spalte 2: $|2| > |1|$ → Zeilen 2 und 3 tauschen (samt ℓ), Zeilenvektor $(2, 3, 1)$: $\begin{pmatrix} 2 & 4 & 6 \\ \tfrac12 & 2 & 2 \\ 0 & 1 & 2 \end{pmatrix}$.`,
      t`$\ell_{32} = \tfrac12$: $(1, 2) - \tfrac12(2, 2) = (0, 1)$.`,
      t`Ergebnis: $$P = \begin{pmatrix} 0 & 1 & 0 \\ 0 & 0 & 1 \\ 1 & 0 & 0 \end{pmatrix}$$ $$L = \begin{pmatrix} 1 & 0 & 0 \\ \tfrac12 & 1 & 0 \\ 0 & \tfrac12 & 1 \end{pmatrix}$$ $$R = \begin{pmatrix} 2 & 4 & 6 \\ 0 & 2 & 2 \\ 0 & 0 & 1 \end{pmatrix}$$`,
      'Probe: $LR$ ergibt die Zeilen $(2,4,6)$, $(1,4,5)$, $(0,1,2)$, also genau $PA$.',
    ],
    keywords: ['zwei Zeilentausche', 'ℓ mittauschen', 'P aus Zeilenvektor (2, 3, 1)', 'Probe PA = LR'],
    sources: [src('NUM-K-SS26', '1', 'Aufgabe 1 b) mit Lösungsskizze')],
  }),
  paper({
    id: 'num.p.ws1920-6a', chapterId: chLR, formulaIds: ['num.w.cholesky'], difficulty: 2, origin: 'klausur', estMinutes: 10, status: 'abgeleitet',
    prompt: t`**Klausur WiSe 2019/20, Aufgabe 6 a)** · Berechne den Cholesky-Faktor L für die Matrix
$$A = \begin{pmatrix} 9 & 3 & 0 & 0 \\ 3 & 2 & 2 & 0 \\ 0 & 2 & 8 & 2 \\ 0 & 0 & 2 & 3 \end{pmatrix}$$
mit dem Vorgehen der Vorlesung.`,
    hints: ['Zeile für Zeile: Außerdiagonale durch Vorwärtssubstitution, dann Diagonale per Wurzel.', 'Nullen in A unterhalb der Bandstruktur bleiben Nullen in L.', '$\\ell_{22} = \\sqrt{2 - 1^2}$.'],
    modelAnswer: [
      t`Zeile 1: $\ell_{11} = \sqrt9 = 3$.`,
      t`Zeile 2: $\ell_{21} = 3/3 = 1$, $\ell_{22} = \sqrt{2 - 1} = 1$.`,
      t`Zeile 3: $\ell_{31} = 0$, $\ell_{32} = (2 - 0 \cdot 1)/1 = 2$, $\ell_{33} = \sqrt{8 - 0 - 4} = 2$.`,
      t`Zeile 4: $\ell_{41} = \ell_{42} = 0$, $\ell_{43} = 2/2 = 1$, $\ell_{44} = \sqrt{3 - 1} = \sqrt2$.`,
      t`$$L = \begin{pmatrix} 3 & 0 & 0 & 0 \\ 1 & 1 & 0 & 0 \\ 0 & 2 & 2 & 0 \\ 0 & 0 & 1 & \sqrt2 \end{pmatrix}$$ L hat dieselbe Bandstruktur wie A (vgl. Übungsblatt 3, Aufgabe 2).`,
    ],
    keywords: ['ℓ₁₁ = 3', 'ℓ₂₂ = 1', 'ℓ₃₃ = 2', 'ℓ₄₄ = √2', 'Bandstruktur'],
    statusNote: 'Offizielle Lösung nur als Scan vorhanden; Ergebnis exakt nachgerechnet (LLᵀ = A).',
    sources: [src('NUM-K-WS1920', '4', 'Aufgabe 6 a)')],
  }),
  paper({
    id: 'num.p.ws1718-1b', chapterId: chLR, formulaIds: ['num.w.cholesky'], difficulty: 3, origin: 'klausur', estMinutes: 10,
    prompt: t`**Klausur WiSe 2017/18, Aufgabe 1 b)** · Nenne die Voraussetzungen an $A \in \mathbb{R}^{N \times N}$, unter denen eine Cholesky-Zerlegung existiert, und leite für $N = 3$ Formeln für die Einträge des Cholesky-Faktors $L \in \mathbb{R}^{3 \times 3}$ her. (Es genügt, die Reihenfolge der Berechnung einzuhalten; nicht alles muss nur durch Einträge von A ausgedrückt werden.)`,
    hints: ['Schreibe $LL^\\top$ mit unbekannten $\\ell_{nm}$ aus.', 'Vergleiche Eintrag für Eintrag mit A, spaltenweise von oben.', 'Diagonaleinträge liefern die Wurzeln.'],
    modelAnswer: [
      'Voraussetzung: A ist symmetrisch und positiv definit.',
      t`Ausmultiplizieren: $$LL^\top = \begin{pmatrix} \ell_{11}^2 & \ell_{11}\ell_{21} & \ell_{11}\ell_{31} \\ \ell_{21}\ell_{11} & \ell_{21}^2 + \ell_{22}^2 & \ell_{21}\ell_{31} + \ell_{22}\ell_{32} \\ \ell_{31}\ell_{11} & \ell_{31}\ell_{21} + \ell_{32}\ell_{22} & \ell_{31}^2 + \ell_{32}^2 + \ell_{33}^2 \end{pmatrix} = A$$`,
      t`$\ell_{11} = \sqrt{a_{11}}$, $\ell_{21} = a_{21}/\ell_{11}$, $\ell_{31} = a_{31}/\ell_{11}$.`,
      t`$\ell_{22} = \sqrt{a_{22} - \ell_{21}^2}$, $\ell_{32} = (a_{32} - \ell_{21}\ell_{31})/\ell_{22}$.`,
      t`$\ell_{33} = \sqrt{a_{33} - \ell_{31}^2 - \ell_{32}^2}$.`,
    ],
    keywords: ['symmetrisch, positiv definit', 'Koeffizientenvergleich', 'Reihenfolge ℓ₁₁ → ℓ₂₁, ℓ₃₁ → ℓ₂₂ → ℓ₃₂ → ℓ₃₃'],
    sources: [src('NUM-K-WS1718', '1', 'Aufgabe 1 b) mit Lösung')],
  }),
  paper({
    id: 'num.p.ws2223-6c', chapterId: chQR, formulaIds: ['num.w.householder'], difficulty: 2, origin: 'klausur', estMinutes: 8, status: 'abgeleitet',
    prompt: t`**Klausur WiSe 2022/23, Aufgabe 6 c)** · Bestimme zu
$$A = \begin{pmatrix} 1 & 2 & 5 \\ 2 & 3 & 6 \\ 2 & 4 & 7 \end{pmatrix}$$
die auslöschungsfreie Householder-Transformation Q mit $QAe^1 = \sigma e^1$.`,
    hints: ['$Ae^1$ ist die erste Spalte $v = (1, 2, 2)^\\top$.', '$\\|v\\|_2 = 3$, $v_1 > 0$.', '$w = (v - \\sigma e^1)/\\|v - \\sigma e^1\\|_2$.'],
    modelAnswer: [
      t`$v = Ae^1 = (1, 2, 2)^\top$, $\|v\|_2 = 3$. Wegen $v_1 = 1 > 0$: $\sigma = -3$.`,
      t`$v - \sigma e^1 = (4, 2, 2)^\top$, $\|v - \sigma e^1\|_2 = \sqrt{24}$, also $w = \tfrac{1}{\sqrt{24}}(4, 2, 2)^\top$.`,
      t`$$Q = I - 2ww^\top = I - \tfrac{1}{12}\begin{pmatrix} 16 & 8 & 8 \\ 8 & 4 & 4 \\ 8 & 4 & 4 \end{pmatrix} = \tfrac13\begin{pmatrix} -1 & -2 & -2 \\ -2 & 2 & -1 \\ -2 & -1 & 2 \end{pmatrix}$$`,
      t`Probe: $Qv = (-3, 0, 0)^\top = \sigma e^1$. Auslöschungsfrei, weil in $v_1 - \sigma = 1 + 3$ zwei positive Zahlen addiert werden.`,
    ],
    keywords: ['σ = −3', 'w = (4, 2, 2)ᵀ/√24', 'Q = I − 2wwᵀ', 'keine Auslöschung'],
    statusNote: 'Offizielle Lösung nur als Scan vorhanden; Ergebnis nachgerechnet.',
    sources: [src('NUM-K-WS2223', '3', 'Aufgabe 6 c)')],
  }),
  paper({
    id: 'num.p.ws2425-3ab', chapterId: chQR, formulaIds: ['num.w.householder'], difficulty: 2, origin: 'klausur', estMinutes: 10,
    prompt: t`**Klausur WiSe 2024/25, Aufgabe 3 a), b)** ·
(a) Sei $A \in \mathbb{R}^{M \times N}$ eine Matrix mit maximalem Rang. Gib die Householder-Transformation $Q \in \mathbb{R}^{M \times M}$ an, sodass die erste Spalte von QA ein Vielfaches von $e^1$ ist. Vermeide dabei Auslöschung und gib den Householder-Vektor w konkret an.
(b) Zeige, dass eine Householder-Transformation eine Spiegelung ist, indem du alle $u, y$ mit $Qu = -u$ und $Qy = y$ bestimmst.`,
    hints: ['(a) σ hängt vom Vorzeichen von $a_{11}$ ab.', '(b) Zerlege $\\mathbb{R}^M = E \\oplus \\mathrm{span}\\{w\\}$ mit $E = \\{x : w^\\top x = 0\\}$.'],
    modelAnswer: [
      t`(a) Mit der ersten Spalte $a^1$ von A: $w = \dfrac{a^1 - \sigma e^1}{\|a^1 - \sigma e^1\|_2}$, $\sigma = -\|a^1\|_2$ falls $a_{11} > 0$, sonst $\sigma = \|a^1\|_2$. Dann $Q = I_M - 2ww^\top$.`,
      t`(b) Sei $E = \{x : w^\top x = 0\}$ die Hyperebene senkrecht zu w; es gilt $\mathbb{R}^M = E \oplus \mathrm{span}\{w\}$.`,
      t`Für $x \in E$: $Qx = x - 2w(w^\top x) = x$. Für $x = \alpha w$: $Qx = \alpha w - 2w(w^\top \alpha w) = \alpha w - 2\alpha w = -x$.`,
      'Also: $Qy = y$ genau für $y \\in E$ und $Qu = -u$ genau für $u \\in \\mathrm{span}\\{w\\}$. Q ist die Spiegelung an E.',
    ],
    keywords: ['σ = −sign(a₁₁)‖a¹‖₂', 'E = w⊥', 'Qx = x auf E', 'Qw = −w'],
    sources: [src('NUM-K-WS2425', '2', 'Aufgabe 3 a), b) mit Lösungsskizze')],
  }),
  paper({
    id: 'num.p.ss26-5', chapterId: chQR, formulaIds: ['num.w.householder', 'num.w.ausloeschung'], difficulty: 3, origin: 'klausur', estMinutes: 12,
    prompt: t`**Klausur SoSe 2026, Aufgabe 5 a), b)** · Sei $T \in \mathbb{R}^{N \times N}$ eine Tridiagonalmatrix mit Spalten $t^1, \dots, t^N$.
(a) Gib die auslöschungsfreie Berechnung des Householder-Vektors $w^1$ für die Householder-Transformation $Q_1$ an, die $t^1$ auf ein Vielfaches von $e^1$ abbildet. Erkläre, warum so Auslöschung vermieden wird und warum Auslöschung generell zu Problemen führt.
(b) Bestimme die Nicht-Nullen-Struktur von $Q_1$.`,
    hints: ['Wie viele Einträge von $t^1$ sind ungleich 0?', 'Die Struktur von w überträgt sich auf $ww^\\top$.'],
    modelAnswer: [
      t`(a) $w^1 = \dfrac{t^1 - \sigma e^1}{\|t^1 - \sigma e^1\|_2}$ mit $\sigma = -\|t^1\|_2$ für $t_{11} > 0$ und $\sigma = \|t^1\|_2$ für $t_{11} \le 0$.`,
      'Durch diese Vorzeichenwahl werden in der ersten Komponente $t_{11} - \\sigma$ nur Zahlen gleichen Vorzeichens addiert, es entsteht keine Auslöschung.',
      'Auslöschung entsteht, wenn fast gleich große Zahlen subtrahiert werden: Die führenden signifikanten Stellen der Mantisse heben sich auf, rundungsfehlerbehaftete Stellen rücken nach vorn. Der relative Fehler wird stark verstärkt.',
      t`(b) $t^1$ hat nur die ersten beiden Einträge ungleich 0, also auch $w^1 = (*, *, 0, \dots, 0)^\top$. Damit ist $w^1(w^1)^\top$ nur im linken oberen $2 \times 2$-Block besetzt und $$Q_1 = \begin{pmatrix} * & * & 0^\top \\ * & * & 0^\top \\ 0 & 0 & I_{N-2} \end{pmatrix}.$$`,
    ],
    keywords: ['σ = −sign(t₁₁)‖t¹‖₂', 'gleiche Vorzeichen', 'signifikante Stellen', '2×2-Block + I_{N−2}'],
    sources: [src('NUM-K-SS26', '6', 'Aufgabe 5 a), b) mit Lösungsskizze'), src('NUM-UB04', '2–3', 'Aufgabe 2 a)')],
  }),
  paper({
    id: 'num.p.ub3-3', chapterId: chQR, formulaIds: ['num.w.householder', 'num.w.aufwaende'], difficulty: 2, origin: 'tutorium', estMinutes: 12,
    prompt: t`**Übungsblatt 3, Aufgabe 3** · Sei $A = QR$ mit $Q = Q_1 \cdots Q_N$, $Q_n = I_M - 2w^n(w^n)^\top$ und $w^n = (0, \dots, 0, \tilde w^n)^\top$ mit $\tilde w^n \in \mathbb{R}^{M-(n-1)}$ (die ersten $n - 1$ Einträge sind 0).
(a) Beweise, dass eine Householder-Transformation symmetrisch ist.
(b) Bestimme in Abhängigkeit von n den Aufwand für $Q_n x$, indem du die Struktur von $Q_n$ ausnutzt.
(c) Bestimme den Aufwand für $Q^\top b$.
(d) Wie lässt sich Q effizient speichern?`,
    hints: ['(b) $Q_n x = x - 2((w^n)^\\top x)w^n$; nur $M - (n-1)$ Einträge von $w^n$ sind ungleich 0.', '(c) $Q^\\top = Q_N \\cdots Q_1$ wegen der Symmetrie.', '(c) Summe über n.'],
    modelAnswer: [
      t`(a) $(I_M - 2ww^\top)^\top = I_M - 2(w^\top)^\top w^\top = I_M - 2ww^\top$.`,
      t`(b) $Q_n x = x - 2((w^n)^\top x)\,w^n$. Skalarprodukt: $M - (n-1)$ Operationen, Differenz: nochmals $M - (n-1)$. Zusammen $2(M - n + 1)$ Operationen.`,
      t`(c) $Q^\top = Q_N^\top \cdots Q_1^\top = Q_N \cdots Q_1$. Aufwand $\sum_{n=1}^N 2(M - (n-1)) = 2MN - N(N-1) \approx 2MN - N^2$.`,
      t`(d) Nur die Householder-Vektoren speichern; wegen der Nullen sind das $\sum_{n=1}^N (M - (n-1)) = MN - N(N-1)/2$ Zahlen. Sie passen (fast) in den Platz unterhalb der Diagonalen von A.`,
    ],
    keywords: ['Symmetrie', '2(M − n + 1)', 'Q^T = Q_N ⋯ Q_1', '2MN − N(N − 1)', 'nur w speichern'],
    sources: [src('NUM-UB03', '2–3', 'Aufgabe 3 mit Lösung')],
  }),
  paper({
    id: 'num.p.ub3-1', chapterId: chQR, formulaIds: ['num.w.qr', 'num.w.cholesky'], difficulty: 3, origin: 'tutorium', estMinutes: 20,
    prompt: t`**Übungsblatt 3, Aufgabe 1 (Vertiefung)** · Für die unbekannte Matrix $A \in \mathbb{R}^{N \times N}$ sei eine Zerlegung $A = B^\top B$ mit bekannter $B \in \mathbb{R}^{M \times N}$, $M \ge N$, gegeben.
(a) Welche minimale Anforderung an B macht A zu einer spd-Matrix?
(b) Wie viele Operationen braucht man mindestens, um A und eine Cholesky-Zerlegung von A zu berechnen?
(c) Beweise: In einer QR-Zerlegung von B ist $\bar R$ regulär.
(d) Erkläre, wie man aus einer QR-Zerlegung von B eine Cholesky-Zerlegung von A erhält, ohne A zu berechnen (auf $\ell_{nn} > 0$ darf verzichtet werden).
(e) Vergleiche den Aufwand von (d) mit (b) für $M \approx N$ und $M \gg N$.`,
    hints: ['(a) $x^\\top A x = \\|Bx\\|_2^2$.', '(c) Widerspruchsbeweis: $\\bar R x = 0$ mit $x \\neq 0$.', '(d) $B^\\top B = R^\\top Q^\\top Q R$.'],
    modelAnswer: [
      t`(a) A ist symmetrisch. $x^\top A x = (Bx)^\top(Bx) > 0$ für alle $x \neq 0$ genau dann, wenn B vollen Rang N hat.`,
      t`(b) Wegen Symmetrie $\tfrac12(N^2 + N)$ Einträge, je ein Skalarprodukt der Länge M: $\tfrac12(N^2 + N)M$. Dazu Cholesky $\tfrac16 N^3$. Dominant: $\tfrac12 N^2 M + \tfrac16 N^3$.`,
      t`(c) Annahme: $\bar R$ singulär, also $\bar R x = 0$ für ein $x \neq 0$. Dann $Bx = QRx = Q \cdot 0 = 0$, Widerspruch zum vollen Rang von B.`,
      t`(d) $A = B^\top B = R^\top Q^\top Q R = R^\top R = \bar R^\top \bar R$. Mit $L := \bar R^\top$ (untere Dreiecksmatrix, regulär nach (c)) ist $A = LL^\top$.`,
      t`(e) Aufwand ist der der QR-Zerlegung: $MN^2 - \tfrac13 N^3$. Für $M \approx N$: beide etwa $\tfrac23 N^3$. Für $M \gg N$: QR etwa $MN^2$, also ungefähr doppelt so teuer wie (b) mit $\tfrac12 MN^2$.`,
    ],
    keywords: ['voller Rang', '½N²M + ⅙N³', 'Widerspruch', 'L = R̄ᵀ', 'M ≫ N: doppelt so teuer'],
    sources: [src('NUM-UB03', '1–2', 'Aufgabe 1 mit Lösung')],
  }),
  paper({
    id: 'num.p.ub4-1d', chapterId: chK, formulaIds: ['num.w.matrixnorm'], difficulty: 1, origin: 'tutorium', estMinutes: 6,
    prompt: t`**Übungsblatt 4, Aufgabe 1 d)** · Berechne $\|A\|_1$, $\|A\|_2$ und $\|A\|_\infty$ für
$$A = \begin{pmatrix} 1 & 2 \\ 3 & 6 \end{pmatrix}.$$`,
    hints: ['Spaltensummen, Zeilensummen.', '$A^\\top A$ berechnen und Eigenwerte bestimmen.'],
    modelAnswer: [t`$\|A\|_1 = \max\{1 + 3, 2 + 6\} = 8$.`, t`$\|A\|_\infty = \max\{1 + 2, 3 + 6\} = 9$.`, t`$A^\top A = 10\begin{pmatrix} 1 & 2 \\ 2 & 4 \end{pmatrix}$ hat die Eigenwerte 0 und 50, also $\|A\|_2 = \sqrt{50} \approx 7{,}07$.`],
    keywords: ['8', '9', '√50'],
    sources: [src('NUM-UB04', '1–2', 'Aufgabe 1 d) mit Lösung')],
  }),
  paper({
    id: 'num.p.ss19-6c', chapterId: chK, formulaIds: ['num.w.matrixnorm'], difficulty: 1, origin: 'klausur', estMinutes: 4, status: 'abgeleitet',
    prompt: t`**Klausur SoSe 2019, Aufgabe 6 c)** · Gib zu einer von dir gewählten Norm auf $\mathbb{R}^N$ die zugehörige Matrixnorm an und berechne sie für
$$A = \begin{pmatrix} 2 & 0 & 4 \\ 3 & 1 & -11 \\ 0 & 5 & -2 \end{pmatrix}.$$`,
    hints: ['Am einfachsten: $\\|\\cdot\\|_\\infty$ oder $\\|\\cdot\\|_1$.', 'Beträge nicht vergessen.'],
    modelAnswer: [
      t`Zum Beispiel Maximumsnorm $\|x\|_\infty = \max_n |x_n|$ mit Zeilensummennorm $\|A\|_\infty = \max_n \sum_m |a_{nm}|$.`,
      t`Zeilensummen: $2 + 0 + 4 = 6$, $3 + 1 + 11 = 15$, $0 + 5 + 2 = 7$ → $\|A\|_\infty = 15$.`,
      t`Alternativ Spaltensummennorm: $\max\{5, 6, 17\} = 17 = \|A\|_1$.`,
    ],
    keywords: ['zugehörige Matrixnorm angeben', '‖A‖∞ = 15', 'oder ‖A‖₁ = 17'],
    statusNote: 'Zu dieser Klausur liegt keine offizielle Lösung vor; Werte nachgerechnet.',
    sources: [src('NUM-K-SS19', '3', 'Aufgabe 6 c)')],
  }),
  paper({
    id: 'num.p.ws2425-2', chapterId: chK, formulaIds: ['num.w.matrixnorm'], difficulty: 3, origin: 'klausur', estMinutes: 20,
    prompt: t`**Klausur WiSe 2024/25, Aufgabe 2** · Sei $A \in \mathbb{R}^{N \times N}$ und Q orthogonal.
(a) Zeige mit der Definition der zugehörigen Matrixnorm $\|A\|_2 = \|AQ\|_2$.
(b) Zeige $\|A\|_2^2 = \max\{\lambda : \lambda \text{ EW von } A^\top A\}$, indem du eine geeignete Transformation AQ betrachtest.
(c) Sei $x$ mit $\|A\|_2^2 = \|A^\top A x\|_1$ und $\|x\|_1 = 1$ gegeben. Beweise $\|A\|_2^2 \le \|A\|_\infty \|A\|_1$.
(d) Zeige $\sqrt2 \le \|L\|_2 \le 2$ für die Bidiagonalmatrix L mit Einsen auf der Diagonalen und der ersten unteren Nebendiagonalen.`,
    hints: ['(a) $\\|Qy\\|_2 = \\|y\\|_2$; substituiere $y = Q^\\top x$.', '(b) $A^\\top A$ ist symmetrisch positiv semidefinit, also orthogonal diagonalisierbar.', '(c) $\\|A^\\top\\|_1 = \\|A\\|_\\infty$.', '(d) Obere Schranke mit (c), untere mit $x = e^1$.'],
    modelAnswer: [
      t`(a) $\|Qx\|_2 = \|x\|_2$. Mit $y = Q^\top x$: $\|A\|_2 = \sup_{x \neq 0} \dfrac{\|AQQ^\top x\|_2}{\|QQ^\top x\|_2} = \sup_{y \neq 0} \dfrac{\|AQy\|_2}{\|Qy\|_2} = \sup_{y \neq 0}\dfrac{\|AQy\|_2}{\|y\|_2} = \|AQ\|_2$.`,
      t`(b) Wähle Q mit $Q^\top A^\top A Q = D = \mathrm{diag}(\lambda_1, \dots, \lambda_N)$, $\lambda_n \ge 0$. Dann $\|AQx\|_2^2 = x^\top D x = \sum \lambda_n x_n^2 \le \lambda_{\max}\|x\|_2^2$ mit Gleichheit für den passenden Einheitsvektor. Mit (a): $\|A\|_2^2 = \lambda_{\max}$.`,
      t`(c) $\|A\|_2^2 = \|A^\top A x\|_1 \le \|A^\top\|_1\|A\|_1\|x\|_1 = \|A\|_\infty\|A\|_1$.`,
      t`(d) $\|L\|_1 = \|L\|_\infty = 2$, also nach (c) $\|L\|_2 \le \sqrt{2 \cdot 2} = 2$. Andererseits $\|L\|_2 \ge \|Le^1\|_2 = \|(1, 1, 0, \dots)^\top\|_2 = \sqrt2$.`,
    ],
    keywords: ['Längenerhaltung', 'orthogonal diagonalisieren', '‖Aᵀ‖₁ = ‖A‖∞', 'Le¹ = (1,1,0,…)ᵀ'],
    sources: [src('NUM-K-WS2425', '1–2', 'Aufgabe 2 mit Lösungsskizze')],
  }),
  paper({
    id: 'num.p.ss24-4', chapterId: chK, formulaIds: ['num.cond', 'num.w.matrixnorm'], difficulty: 2, origin: 'klausur', estMinutes: 15,
    prompt: t`**Klausur SoSe 2024, Aufgabe 4 a)–c)** · Seien $A, B \in \mathbb{R}^{N \times N}$ und $\|\cdot\|$ eine Norm auf $\mathbb{R}^N$.
(a) Zeige für die zugehörige Matrixnorm $\|AB\| \le \|A\|\|B\|$.
(b) Sei A regulär. Zeige $\mathrm{cond}(A) \ge 1$.
(c) Seien A regulär, $Ax = b$ und $A\tilde x = \tilde b$. Zeige $\dfrac{\|x - \tilde x\|}{\|x\|} \le \mathrm{cond}(A)\,\dfrac{\|b - \tilde b\|}{\|b\|}$ und diskutiere die Abschätzung kurz.`,
    hints: ['(a) $\\|ABx\\| \\le \\|A\\|\\|Bx\\| \\le \\|A\\|\\|B\\|\\|x\\|$.', '(b) $I = AA^{-1}$ und $\\|I\\| = 1$.', '(c) $x - \\tilde x = A^{-1}(b - \\tilde b)$ und $\\|b\\| \\le \\|A\\|\\|x\\|$.'],
    modelAnswer: [
      t`(a) Für $x \neq 0$: $\|ABx\| \le \|A\|\|Bx\| \le \|A\|\|B\|\|x\|$. Teilen durch $\|x\|$ und Supremum: $\|AB\| \le \|A\|\|B\|$.`,
      t`(b) $\|I\| = \sup \|x\|/\|x\| = 1$. Mit (a): $1 = \|AA^{-1}\| \le \|A\|\|A^{-1}\| = \mathrm{cond}(A)$.`,
      t`(c) $x - \tilde x = A^{-1}(b - \tilde b)$, also $\|x - \tilde x\| \le \|A^{-1}\|\|b - \tilde b\|$. Mit $\|b\| = \|Ax\| \le \|A\|\|x\|$, also $\dfrac{1}{\|x\|} \le \dfrac{\|A\|}{\|b\|}$, folgt die Behauptung.`,
      'Diskussion: Die relative Störung von b wird höchstens um den Faktor cond(A) verstärkt. Bei großem cond(A) kann ein kleiner Datenfehler einen großen Lösungsfehler bewirken (schlecht konditioniert). Die Abschätzung ist eine obere Schranke und kann für spezielle Störungen pessimistisch sein.',
    ],
    keywords: ['Submultiplikativität', '‖I‖ = 1', 'x − x̃ = A⁻¹(b − b̃)', '‖b‖ ≤ ‖A‖‖x‖', 'obere Schranke'],
    sources: [src('NUM-K-SS24', '2', 'Aufgabe 4 a)–c) mit Lösungsskizze')],
  }),
  paper({
    id: 'num.p.ss26-2', chapterId: chK, formulaIds: ['num.w.stoerung', 'num.cond'], difficulty: 3, origin: 'klausur', estMinutes: 15,
    prompt: t`**Klausur SoSe 2026, Aufgabe 2 a), b)** · Die kubische Spline-Interpolation führt bei äquidistantem Gitter auf $Ax = b$ mit
$$A = \frac{h}{6}\begin{pmatrix} 2 & 1 & & & \\ 1 & 4 & 1 & & \\ & \ddots & \ddots & \ddots & \\ & & 1 & 4 & 1 \\ & & & 1 & 2 \end{pmatrix} \in \mathbb{R}^{N \times N},\quad N \ge 3.$$
(a) Begründe kurz, wie sich die Intervalllänge h auf die Kondition auswirkt.
(b) Berechne eine obere Schranke für $\mathrm{cond}_\infty(A)$: Bestimme (i) C mit $\tfrac14 \cdot \tfrac6h A = I_N + C$ und (ii) zeige $\|C\|_\infty = \tfrac34$. Hinweis: $\|(I_N + C)^{-1}\|_\infty \le \sum_{k \ge 0}\|C^k\|_\infty$.`,
    hints: ['(a) $\\mathrm{cond}(\\alpha A) = \\mathrm{cond}(A)$.', '(b) $\\tfrac{6}{4h}A$ hat in der Mitte die Diagonale 1, in den Ecken $\\tfrac12$.', '(b) Geometrische Reihe und $\\|\\tfrac{6}{4h}A\\|_\\infty$.'],
    modelAnswer: [
      t`(a) Für $\alpha \neq 0$: $\mathrm{cond}(\alpha A) = |\alpha|\|A\| \cdot |\alpha|^{-1}\|A^{-1}\| = \mathrm{cond}(A)$. Der Faktor $\tfrac h6$ spielt also keine Rolle: h beeinflusst die Kondition nicht.`,
      t`(b)(i) $I_N + C = \tfrac{6}{4h}A$ hat Diagonale $(\tfrac12, 1, \dots, 1, \tfrac12)$ und Nebendiagonalen $\tfrac14$. Also $C$: Diagonale $(-\tfrac12, 0, \dots, 0, -\tfrac12)$, Nebendiagonalen $\tfrac14$.`,
      t`(ii) Zeilensummen von $|C|$: erste und letzte Zeile $\tfrac12 + \tfrac14 = \tfrac34$, innere Zeilen $\tfrac14 + \tfrac14 = \tfrac12$. Also $\|C\|_\infty = \tfrac34$.`,
      t`Schranke: $\mathrm{cond}(A) = \mathrm{cond}(\tfrac{6}{4h}A)$. Es gilt $\|\tfrac{6}{4h}A\|_\infty = \tfrac14 + 1 + \tfrac14 = \tfrac32$ und $\|(\tfrac{6}{4h}A)^{-1}\|_\infty \le \sum_k (\tfrac34)^k = \dfrac{1}{1 - 3/4} = 4$.`,
      t`Somit $\mathrm{cond}_\infty(A) \le \tfrac32 \cdot 4 = 6$, unabhängig von N und h.`,
    ],
    keywords: ['cond(αA) = cond(A)', 'C mit −½ in den Ecken', '‖C‖∞ = ¾', 'Neumann-Reihe → 4', 'cond∞ ≤ 6'],
    sources: [src('NUM-K-SS26', '2–3', 'Aufgabe 2 a), b) mit Lösungsskizze')],
  }),
  paper({
    id: 'num.p.ss22-6a', chapterId: chA, formulaIds: ['num.w.ausgleich'], difficulty: 2, origin: 'klausur', estMinutes: 10, status: 'abgeleitet',
    prompt: t`**Klausur SoSe 2022, Aufgabe 6 a)** · Gegeben sind die Punkte $(t_n, y_n)$, $n = 1, \dots, 4$:
$$\begin{array}{c|cccc} t_n & 0 & 1 & 2 & 3 \\ \hline y_n & -2 & -1 & 0 & 2 \end{array}$$
Gesucht ist $g(t) = \alpha + \beta t + \gamma t^2$, sodass $\sum_{n=1}^4 |g(t_n) - y_n|^2$ minimal wird. Formuliere das lineare Ausgleichsproblem und gib die zugehörige Normalengleichung an. (Zusatz für Übung: Löse sie.)`,
    hints: ['Spalten von A: Ansatzfunktionen $1, t, t^2$ an den Stellen $t_n$.', '$A^\\top A$ hat Einträge $\\sum t_n^{i+j}$.'],
    modelAnswer: [
      t`$$A = \begin{pmatrix} 1 & 0 & 0 \\ 1 & 1 & 1 \\ 1 & 2 & 4 \\ 1 & 3 & 9 \end{pmatrix},\quad x = \begin{pmatrix} \alpha \\ \beta \\ \gamma \end{pmatrix},\quad b = \begin{pmatrix} -2 \\ -1 \\ 0 \\ 2 \end{pmatrix},\qquad \|Ax - b\|_2 = \min!$$`,
      t`Normalengleichung $A^\top A x = A^\top b$ mit $$A^\top A = \begin{pmatrix} 4 & 6 & 14 \\ 6 & 14 & 36 \\ 14 & 36 & 98 \end{pmatrix},\quad A^\top b = \begin{pmatrix} -1 \\ 5 \\ 17 \end{pmatrix}.$$`,
      t`Zusatz: Lösung $\alpha = -1{,}95$, $\beta = 0{,}55$, $\gamma = 0{,}25$, also $g(t) = -1{,}95 + 0{,}55t + 0{,}25t^2$.`,
    ],
    keywords: ['A mit Spalten 1, t, t²', 'AᵀA x = Aᵀb', 'AᵀA = ((4,6,14),(6,14,36),(14,36,98))'],
    statusNote: 'Offizielle Lösung nur als Scan vorhanden; Matrizen und Lösung nachgerechnet.',
    sources: [src('NUM-K-SS22', '3', 'Aufgabe 6 a)')],
  }),
  paper({
    id: 'num.p.ws1718-1c', chapterId: chA, formulaIds: ['num.w.ausgleich', 'num.w.cholesky'], difficulty: 2, origin: 'klausur', estMinutes: 6,
    prompt: t`**Klausur WiSe 2017/18, Aufgabe 1 c) (i), (ii)** · Sei $A \in \mathbb{R}^{M \times N}$, $M \ge N$, und $b \in \mathbb{R}^M$.
(i) Gib die Normalengleichung des Ausgleichsproblems $\min_x \|Ax - b\|_2$ an.
(ii) Nenne eine zusätzliche Voraussetzung an A, sodass die Normalengleichung mit einer Cholesky-Zerlegung gelöst werden kann, und bestimme den Aufwand (bzgl. M und N).`,
    hints: ['(ii) Wann ist $A^\\top A$ positiv definit?', 'Aufwand: Matrixprodukt plus Cholesky.'],
    modelAnswer: [
      t`(i) $A^\top A x = A^\top b$.`,
      t`(ii) A muss vollen Rang N haben; dann ist $A^\top A$ spd.`,
      t`Aufwand: $A^\top A$ berechnen kostet etwa $N^2 M$ (bzw. $\tfrac12 N^2 M$, wenn man die Symmetrie ausnutzt), die Cholesky-Zerlegung $\tfrac16 N^3$.`,
    ],
    keywords: ['AᵀAx = Aᵀb', 'voller Rang', 'N²M (½N²M)', '⅙N³'],
    sources: [src('NUM-K-WS1718', '1', 'Aufgabe 1 c) mit Lösung')],
  }),
  paper({
    id: 'num.p.ws1718-4', chapterId: chA, formulaIds: ['num.w.ausgleich-qr'], difficulty: 3, origin: 'klausur', estMinutes: 20,
    prompt: t`**Klausur WiSe 2017/18, Aufgabe 4** · Gegeben ist die QR-Zerlegung $A = QR$ mit
$$Q = \frac{1}{15}\begin{pmatrix} 5 & -2 & -14 \\ 10 & 11 & 2 \\ 10 & -10 & 5 \end{pmatrix}$$ $$R = \begin{pmatrix} 3 & 1 \\ 0 & -5 \\ 0 & 0 \end{pmatrix},\quad A = \begin{pmatrix} 1 & 1 \\ 2 & -3 \\ 2 & 4 \end{pmatrix}$$
(Q ist orthogonal).
(a) Begründe mit der Zerlegung, welche der Systeme $Ax = b$ und $Ax = \tilde b$ lösbar sind: $b = (0, -5, 2)^\top$, $\tilde b = (0, -5, 4)^\top$.
(b) Löse in beiden Fällen das Ausgleichsproblem mit der QR-Zerlegung.
(c) Berechne die Residuen.`,
    hints: ['$Ax = b \\iff Rx = Q^\\top b$.', 'Die dritte Komponente von $Q^\\top b$ entscheidet über die Lösbarkeit.', 'Residuumsnorm = Betrag der dritten Komponente.'],
    modelAnswer: [
      t`(a) $Ax = b \iff QRx = b \iff Rx = Q^\top b$. Es ist $Q^\top b = \tfrac{1}{15}(-30, -75, 0)^\top = (-2, -5, 0)^\top$. Die letzte Komponente ist 0 und $\bar R = \begin{pmatrix} 3 & 1 \\ 0 & -5 \end{pmatrix}$ ist regulär: $Ax = b$ ist lösbar.`,
      t`$Q^\top \tilde b = \tfrac{1}{15}(-10, -95, 10)^\top = (-\tfrac23, -\tfrac{19}{3}, \tfrac23)^\top$. Die letzte Komponente ist $\neq 0$, also ist $Ax = \tilde b$ nicht lösbar.`,
      t`(b) Für b: $-5x_2 = -5 \Rightarrow x_2 = 1$, $3x_1 + 1 = -2 \Rightarrow x_1 = -1$. Also $x = (-1, 1)^\top$ (sogar exakte Lösung).`,
      t`Für $\tilde b$: $-5x_2 = -\tfrac{19}{3} \Rightarrow x_2 = \tfrac{19}{15}$, $3x_1 + \tfrac{19}{15} = -\tfrac23 \Rightarrow x_1 = -\tfrac{29}{45}$. Also $x^* = (-\tfrac{29}{45}, \tfrac{19}{15})^\top$.`,
      t`(c) Für b: Residuum $0$. Für $\tilde b$: $\|\tilde b - Ax^*\|_2 = |d| = \tfrac23$ (dritte Komponente von $Q^\top \tilde b$).`,
    ],
    keywords: ['Rx = Qᵀb', 'Qᵀb = (−2, −5, 0)ᵀ', 'x = (−1, 1)ᵀ', 'x* = (−29/45, 19/15)ᵀ', 'Residuum 0 bzw. 2/3'],
    sources: [src('NUM-K-WS1718', '2', 'Aufgabe 4 mit Lösung')],
  }),
  paper({
    id: 'num.p.ss20-1ab', chapterId: chA, formulaIds: ['num.w.svd', 'num.w.aufwaende'], difficulty: 2, origin: 'klausur', estMinutes: 10, status: 'abgeleitet',
    prompt: t`**Klausur SoSe 2020, Aufgabe 1 a), b)** · Sei $A \in \mathbb{R}^{M \times N}$ mit $M \ge N$ und maximalem Rang.
(a) Zeige, dass die Quadrate der Singulärwerte von A die Eigenwerte von $A^\top A$ sind.
(b) Gib an, wie viele Operationen zur Berechnung von $A^\top A$ nötig sind. Begründe kurz.`,
    hints: ['(a) Setze $A = U\\Sigma V^\\top$ ein.', '(a) $U^\\top U = I$.', '(b) Symmetrie: nur die Hälfte der Einträge berechnen.'],
    modelAnswer: [
      t`(a) Mit $A = U\Sigma V^\top$ folgt $A^\top A = V\Sigma^\top U^\top U \Sigma V^\top = V\,\Sigma^\top\Sigma\,V^\top = V\,\mathrm{diag}(\sigma_1^2, \dots, \sigma_N^2)\,V^\top$.`,
      'Das ist eine Diagonalisierung mit orthogonalem V: Die Eigenwerte von $A^\\top A$ sind genau $\\sigma_1^2, \\dots, \\sigma_N^2$ (Eigenvektoren: Spalten von V).',
      t`(b) $A^\top A \in \mathbb{R}^{N \times N}$ ist symmetrisch; man braucht nur $\tfrac12 N(N+1)$ Einträge, jeder ist ein Skalarprodukt zweier Spalten der Länge M. Das sind etwa $\tfrac12 N^2 M$ Operationen.`,
    ],
    keywords: ['A = UΣVᵀ', 'UᵀU = I', 'diag(σ²)', '½N²M'],
    statusNote: 'Offizielle Lösung nur als Scan vorhanden; Lösung nach Skript (Existenzbeweis der SVD, Aufwand AᵀA) hergeleitet.',
    sources: [src('NUM-K-SS20', '1', 'Aufgabe 1 a), b)'), sk('42, 45', 'Aufwand AᵀA, Beweis der Existenz')],
  }),
  paper({
    id: 'num.p.ws2223-1ab', chapterId: chA, formulaIds: ['num.w.svd', 'num.w.matrixnorm'], difficulty: 3, origin: 'klausur', estMinutes: 12, status: 'abgeleitet',
    prompt: t`**Klausur WiSe 2022/23, Aufgabe 1 a), b)** · Sei $A \in \mathbb{R}^{M \times N}$ mit $\mathrm{Rang}(A) = R$.
(a) Erkläre, was unter einer Singulärwertzerlegung von A verstanden wird, und definiere die auftretenden Größen.
(b) Zeige $\|A\|_2 = \sigma_1$, wobei $\sigma_1$ der größte Singulärwert ist.`,
    hints: ['(a) Orthogonale U, V; Σ mit Diagonalblock.', '(b) Orthogonale Matrizen erhalten die 2-Norm.', '(b) Alternativ: $\\|A\\|_2^2 = \\lambda_{\\max}(A^\\top A) = \\sigma_1^2$.'],
    modelAnswer: [
      t`(a) Es gibt orthogonale Matrizen $U \in \mathbb{R}^{M \times M}$, $V \in \mathbb{R}^{N \times N}$ mit $U^\top A V = \Sigma = \begin{pmatrix} \Sigma_R & 0 \\ 0 & 0 \end{pmatrix} \in \mathbb{R}^{M \times N}$, $\Sigma_R = \mathrm{diag}(\sigma_1, \dots, \sigma_R)$, $\sigma_1 \ge \dots \ge \sigma_R > 0$.`,
      'Die $\\sigma_r$ (ergänzt um Nullen bis $\\min\\{M, N\\}$) heißen Singulärwerte; die Spalten von U bzw. V heißen linke bzw. rechte Singulärvektoren. Es gilt $A = U\\Sigma V^\\top = \\sum_{r=1}^R \\sigma_r u^r (v^r)^\\top$.',
      t`(b) Da U und V orthogonal sind, gilt $\|Ax\|_2 = \|U\Sigma V^\top x\|_2 = \|\Sigma y\|_2$ mit $y = V^\top x$, $\|y\|_2 = \|x\|_2$.`,
      t`$\|\Sigma y\|_2^2 = \sum_{r=1}^R \sigma_r^2 y_r^2 \le \sigma_1^2\|y\|_2^2$, Gleichheit für $y = e^1$ (also $x = v^1$). Damit $\|A\|_2 = \max_{\|x\|_2 = 1}\|Ax\|_2 = \sigma_1$.`,
    ],
    keywords: ['U, V orthogonal', 'Σ = diag(σ₁ … σ_R)', 'σ₁ ≥ … ≥ σ_R > 0', 'Längenerhaltung', 'Gleichheit für x = v¹'],
    statusNote: 'Offizielle Lösung nur als Scan vorhanden; Lösung nach Skript hergeleitet.',
    sources: [src('NUM-K-WS2223', '1', 'Aufgabe 1 a), b)'), sk('45–46', 'Abschnitt 2.5.1, Bemerkungen 18 3)')],
  }),
]

/** Offizielle Zahlenwerte für den Inhaltstest (Übungsblatt 4 / Vorlesung). */
export const officialChecks = [
  { id: 'num.w.matrixnorm.e4', value: 7.0711, dec: 4, note: 'UB 4, Aufgabe 1 d): ‖A‖₂ = √50' },
  { id: 'num.cond.e2', value: 400, dec: 0, note: 'Skript Beispiel 12: cond∞ = 4/ε für ε = 0,01' },
]
