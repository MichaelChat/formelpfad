/**
 * Numerische Mathematik – Kapitel 6 (Eigenwertprobleme) und 7 (iterative Verfahren für lineare
 * Gleichungssysteme) sowie die Klausursimulation SoSe 2026. Quellen: Skript (Seitenangaben = PDF-Seite),
 * Übungsblatt 7, Altklausuren. Alle Zahlenbeispiele wurden mit exakter Bruchrechnung bzw. numpy nachgerechnet.
 */
import { fmt } from '../../lib/format'
import { mc, numeric, opts, paper, src, trueFalse, wissen } from '../helpers'
import type { Chapter, Exam, Exercise, Formula, Variable } from '../types'

const t = String.raw
const chE = 'num-eigenwerte'
const chI = 'num-iterativ'
const sk = (pages: string, note?: string) => src('NUM-SKRIPT', pages, note)

const vq: Variable = { sym: 'q', tex: 'q', name: 'Konvergenzfaktor der Vektoriteration' }
const vl1: Variable = { sym: 'l_1', tex: '|\\lambda_1|', name: 'Betrag des dominanten Eigenwerts', domain: [2, 10] }
const vl2: Variable = { sym: 'l_2', tex: '|\\lambda_2|', name: 'Betrag des zweitgrößten Eigenwerts', domain: [0.1, 1.9] }
const vc: Variable = { sym: 'c', tex: 'c', name: 'Kontraktionsfaktor des cg-Verfahrens' }
const vk: Variable = { sym: 'kappa', tex: '\\kappa', name: 'Konditionszahl cond₂(A) = λmax/λmin', domain: [1, 10000] }

export const chapters: Chapter[] = [
  {
    id: chE,
    part: 'num',
    number: '6',
    title: 'Eigenwertprobleme',
    description: 'Eigenwerte und Eigenvektoren numerisch berechnen: Vektoriteration, inverse Iteration mit Shift und der QR-Algorithmus mit Hessenbergform und Shift.',
    sources: [sk('89–101'), src('NUM-VL12', '1–14'), src('NUM-VL13', '1–19')],
    lessons: [
      { id: 'l-num-vektoriteration', title: 'Vektoriteration', goal: 'Verstehen, warum wiederholtes Multiplizieren mit A zum dominanten Eigenvektor führt und wovon die Geschwindigkeit abhängt.', formulaIds: ['num.w.vektoriteration', 'num.konvergenzfaktor'], paperTaskIds: ['num.p.ss17-6c'] },
      { id: 'l-num-inverse-iteration', title: 'Inverse Iteration und Shift', goal: 'Mit inverser Iteration und Shift beliebige einfache Eigenwerte und ihre Eigenvektoren berechnen.', formulaIds: ['num.w.inverse-iteration'], paperTaskIds: ['num.p.ws1920-6c', 'num.p.ss19-4'] },
      { id: 'l-num-qr-alg', title: 'QR-Algorithmus und Hessenbergform', goal: 'Den QR-Algorithmus erklären und begründen, warum man vorher auf Hessenbergform transformiert.', formulaIds: ['num.w.qr-algorithmus'], paperTaskIds: ['num.p.ws2425-3c', 'num.p.ss26-5c'] },
      { id: 'l-num-qr-shift', title: 'QR-Algorithmus mit Shift', goal: 'Den Shift µ = h_NN, die Deflation und die schnelle Konvergenz verstehen.', formulaIds: ['num.w.qr-shift'], paperTaskIds: ['num.p.ws2021-4'] },
    ],
  },
  {
    id: chI,
    part: 'num',
    number: '7',
    title: 'Iterative Verfahren für lineare Gleichungssysteme',
    description: 'Große, dünnbesetzte Systeme näherungsweise lösen: allgemeine lineare Iterationen mit Vorkonditionierer, Jacobi- und Gauß-Seidel-Verfahren sowie das cg-Verfahren.',
    sources: [sk('102–111'), src('NUM-VL14', '1–17')],
    lessons: [
      { id: 'l-num-lin-iteration', title: 'Allgemeine lineare Iterationen', goal: 'Die Fixpunktiteration mit Vorkonditionierer aufstellen und die Konvergenzbedingung über den Spektralradius verstehen.', formulaIds: ['num.w.lineare-iteration'], paperTaskIds: ['num.p.ws2021-6c', 'num.p.ws1920-5'] },
      { id: 'l-num-jacobi-gs', title: 'Jacobi- und Gauß-Seidel-Verfahren', goal: 'Beide Verfahren von Hand ausführen und ihre Konvergenz prüfen.', formulaIds: ['num.w.jacobi-gs'], paperTaskIds: ['num.p.ub7-1', 'num.p.ss26-2c', 'num.p.ss19-6e'] },
      { id: 'l-num-cg', title: 'Das cg-Verfahren', goal: 'Das Minimierungsproblem, die Schrittweite α und die neue Suchrichtung erklären und einen cg-Lauf von Hand rechnen.', formulaIds: ['num.w.cg'], paperTaskIds: ['num.p.ub7-3', 'num.p.ws1718-2', 'num.p.ss24-5', 'num.p.ss20-6e'] },
      { id: 'l-num-cg-konv', title: 'Konvergenz und Vorkonditionierung beim cg-Verfahren', goal: 'Verstehen, warum das Spektrum (Kondition, Cluster) die Konvergenz bestimmt und wie Vorkonditionierung hilft.', formulaIds: ['num.w.cg-konvergenz', 'num.cg-faktor'], paperTaskIds: ['num.p.ss26-6', 'num.p.ws2021-6d'] },
    ],
  },
]

export const formulas: Formula[] = [
  // ================================================================ 6 Eigenwerte
  wissen({
    id: 'num.w.vektoriteration',
    name: 'Vektoriteration (Potenzmethode)',
    short: 'immer wieder mit A multiplizieren',
    chapterId: chE,
    tex: t`x^{k+1} = Ay^k,\quad y^{k+1} = \frac{x^{k+1}}{\|x^{k+1}\|_2}`,
    definition: 'Multipliziert man einen Startvektor immer wieder mit A, so wird der Anteil in Richtung des Eigenvektors zum betragsgrößten Eigenwert λ₁ immer stärker, alle anderen Anteile werden relativ dazu gedämpft. Nach Normierung konvergiert die Folge gegen einen Eigenvektor zu λ₁; den Eigenwert liefert der Rayleigh-Quotient.',
    keyPoints: [
      t`Warum nicht das charakteristische Polynom? Nullstellen eines Polynoms in Monomdarstellung sind sehr schlecht konditioniert.`,
      t`Idee: $x^0 = \mu_1 v^1 + \dots + \mu_N v^N$ ⇒ $A^k x^0 = \lambda_1^k\big(\mu_1 v^1 + (\tfrac{\lambda_2}{\lambda_1})^k\mu_2 v^2 + \dots\big)$. Alle Anteile außer $v^1$ schrumpfen wie $|\lambda_n/\lambda_1|^k$.`,
      t`Normieren in jedem Schritt verhindert Über- bzw. Unterlauf ($\lambda_1^k \to \infty$ oder $\to 0$).`,
      t`Satz 29: A symmetrisch, $|\lambda_1| > |\lambda_2| \ge \dots$, $x^0$ nicht senkrecht auf $v^1$ ⇒ $y^k \to v^1$ (bis aufs Vorzeichen).`,
      t`Eigenwert über den Rayleigh-Quotienten $\lambda_1 = \dfrac{(v^1)^\top A v^1}{(v^1)^\top v^1}$, bei normiertem Vektor einfach $(y^k)^\top A y^k$.`,
      t`Konvergenzfaktor $|\lambda_2|/|\lambda_1|$: Liegen $|\lambda_1|$ und $|\lambda_2|$ nah beieinander, ist die Iteration sehr langsam.`,
      t`Shift: $A - \lambda^* I$ hat dieselben Eigenvektoren und um $\lambda^*$ verschobene Eigenwerte. Geschickt gewählt verkleinert das den Konvergenzfaktor.`,
      t`Aufwand pro Schritt: ein Matrix-Vektor-Produkt ($N^2$, bei dünnbesetzten Matrizen viel weniger).`,
    ],
    example: {
      problem: t`Vektoriteration für $A = \begin{pmatrix} 2 & 1 \\ 1 & 2 \end{pmatrix}$ (Eigenwerte 3 und 1) mit $y^0 = (1, 0)^\top$.`,
      steps: [
        t`$x^1 = Ay^0 = (2, 1)^\top$, $y^1 = \tfrac{1}{\sqrt5}(2, 1)^\top \approx (0{,}894;\ 0{,}447)^\top$, Rayleigh-Quotient $(y^1)^\top A y^1 = 2{,}8$.`,
        t`$x^2 = Ay^1 \approx (2{,}236;\ 1{,}789)^\top$, $y^2 \approx (0{,}781;\ 0{,}625)^\top$, Rayleigh-Quotient $\approx 2{,}976$.`,
        t`$y^3 \approx (0{,}733;\ 0{,}680)^\top$, Rayleigh-Quotient $\approx 2{,}997$. Die Richtung nähert sich $\tfrac{1}{\sqrt2}(1, 1)^\top$, der Eigenwert 3.`,
        t`Konvergenzfaktor $\tfrac13$: Der Fehler im Vektor drittelt sich ungefähr pro Schritt.`,
      ],
      result: 'λ₁ ≈ 2,997 nach drei Schritten',
    },
    mistakes: ['Vergessen zu normieren.', 'Annehmen, die Vektoriteration liefere den betragskleinsten Eigenwert.', 'Den Eigenwert als $\\|x^{k+1}\\|$ ohne Vorzeichen ablesen: Für negatives λ₁ braucht man den Rayleigh-Quotienten.'],
    supplement: 'Das Rechenbeispiel ist ein eigenes Beispiel der App (mit numpy nachgerechnet).',
    related: ['num.konvergenzfaktor', 'num.w.inverse-iteration', 'num.w.qr-algorithmus'],
    sources: [sk('89–90', 'Einleitung Kapitel 6, Abschnitt 6.1, Satz 29, Beispiel 34')],
  }),
  {
    id: 'num.konvergenzfaktor',
    name: 'Konvergenzfaktor der Vektoriteration',
    short: '|λ₂| / |λ₁|',
    chapterId: chE,
    tex: t`q = \frac{|\lambda_2|}{|\lambda_1|}`,
    lhs: 'q',
    rhs: 'l_2/l_1',
    variables: [vq, vl1, vl2],
    assumptions: ['$|\\lambda_1| > |\\lambda_2| \\ge \\dots \\ge |\\lambda_N|$, λ₁ einfach.'],
    intuition: 'Der zweitstärkste Anteil im Vektor schrumpft pro Schritt um den Faktor q relativ zum dominanten Anteil. Je kleiner q, desto schneller.',
    interpretation: 'q = 0,9 heißt: etwa 22 Schritte pro Dezimalstelle. q = 0,1 heißt: eine Stelle pro Schritt.',
    useCases: ['Geschwindigkeit der Vektoriteration abschätzen', 'Wirkung eines Shifts beurteilen', 'Inverse Iteration: q aus den Kehrwerten der Eigenwerte bilden'],
    mistakes: ['Die Eigenwerte ohne Betrag nehmen.', 'Bei der inversen Iteration die Eigenwerte von A statt die von $A^{-1}$ einsetzen.'],
    example: {
      problem: 'Eigenwerte 3, 2, 1. Konvergenzfaktor für A und für A − 1,5 I?',
      steps: [t`A: $q = \tfrac23$.`, t`$A - 1{,}5I$ hat die Eigenwerte $1{,}5;\ 0{,}5;\ -0{,}5$, also $q = \tfrac{0{,}5}{1{,}5} = \tfrac13$: doppelt so schnell.`],
      result: '2/3 bzw. 1/3',
      source: sk('90', 'Beispiel 34'),
    },
    related: ['num.w.vektoriteration', 'num.w.inverse-iteration'],
    difficulty: 1,
    sources: [sk('90', 'nach Satz 29, Beispiel 34')],
    status: 'geprüft',
  },
  wissen({
    id: 'num.w.inverse-iteration',
    name: 'Inverse Iteration mit Shift',
    short: 'A⁻¹ bzw. (A − λ*I)⁻¹',
    chapterId: chE,
    tex: t`(A - \lambda^* I_N)\,x^{k+1} = y^k,\qquad y^{k+1} = \frac{x^{k+1}}{\|x^{k+1}\|_2}`,
    definition: 'A⁻¹ hat dieselben Eigenvektoren wie A und die Kehrwerte als Eigenwerte. Der betragskleinste Eigenwert von A wird so zum dominanten von A⁻¹, und die Vektoriteration mit A⁻¹ findet seinen Eigenvektor. Mit Shift λ* nahe an einem beliebigen einfachen Eigenwert λₙ wird λₙ − λ* zum betragskleinsten Eigenwert von A − λ*I, und die inverse Iteration findet den Eigenvektor zu λₙ.',
    keyPoints: [
      t`$Av = \lambda v \iff A^{-1}v = \tfrac1\lambda v$: gleiche Eigenvektoren, „reziprokes Spektrum“.`,
      t`Statt $A^{-1}$ zu berechnen, löst man in jedem Schritt das LGS $Ax^{k+1} = y^k$. Die LR-Zerlegung wird nur einmal berechnet, danach kostet jeder Schritt nur $N^2$.`,
      t`Shift: Braucht eine gute Schätzung $\lambda^*$ von $\lambda_n$, sodass $|\lambda_n - \lambda^*|$ klein ist, aber ungleich 0, und $\lambda_n - \lambda^*$ der betragskleinste Eigenwert von $A - \lambda^*I$ ist.`,
      t`Konvergenzfaktor $\dfrac{|\lambda_n - \lambda^*|}{\min_{m \neq n}|\lambda_m - \lambda^*|}$: je besser die Schätzung, desto schneller.`,
      t`$A - \lambda^* I$ ist dann sehr schlecht konditioniert. Das schadet aber nicht, weil nur die Richtung des Eigenvektors gesucht ist, und die ist gut konditioniert.`,
      t`Anwendung: Spektrale Bisektion. Laplacematrix eines Graphen, Eigenvektor zum kleinsten positiven Eigenwert, inverse Iteration auf $A + ee^\top$ (weil A singulär ist), Startwert mit $e^\top x^0 = 0$.`,
    ],
    example: {
      problem: 'A hat die Eigenwerte 0,1; 2; 3; −5. Eigenwerte von A⁻¹ und Konvergenzfaktor der inversen Iteration?',
      steps: [t`Kehrwerte: $10;\ \tfrac12;\ \tfrac13;\ -\tfrac15$.`, t`Dominant ist 10, der zweitgrößte Betrag ist $\tfrac12$.`, t`$q = \dfrac{1/2}{10} = \dfrac{1}{20}$: sehr schnell.`],
      result: 'q = 1/20',
      source: sk('91', 'Beispiel 35'),
    },
    mistakes: ['$A^{-1}$ explizit berechnen statt ein LGS mit einmaliger LR-Zerlegung zu lösen.', 'Den Shift genau gleich dem Eigenwert wählen: Dann ist $A - \\lambda^*I$ singulär.', 'Glauben, die schlechte Kondition von $A - \\lambda^*I$ mache das Verfahren unbrauchbar.'],
    examTip: 'SS17 und WS19/20: „Nenne eine Iteration für den Eigenvektor zum größten bzw. kleinsten Eigenwert und den Aufwand“: Vektoriteration (Matrix-Vektor-Produkt) und inverse Iteration (einmal LR, dann Vorwärts-/Rückwärtssubstitution).',
    related: ['num.w.vektoriteration', 'num.konvergenzfaktor', 'num.w.lr-idee'],
    sources: [sk('91–93', '(6.1), Abschnitt 6.1.1, Beispiel 35, Bemerkung 41, Abschnitt 6.1.2')],
  }),
  wissen({
    id: 'num.w.qr-algorithmus',
    name: 'QR-Algorithmus und Hessenbergform',
    short: 'A_{k+1} = R_k Q_k',
    chapterId: chE,
    tex: t`A_k = Q_k R_k,\qquad A_{k+1} = R_k Q_k = Q_k^\top A_k Q_k`,
    definition: 'Der QR-Algorithmus berechnet alle Eigenwerte auf einmal: Man zerlegt A_k = Q_kR_k und multipliziert in umgekehrter Reihenfolge. A_{k+1} ist ähnlich zu A_k, hat also dieselben Eigenwerte, und konvergiert (bei reellen, betragsmäßig verschiedenen Eigenwerten) gegen eine obere Dreiecksmatrix mit den Eigenwerten auf der Diagonalen. Damit das billig wird, bringt man A vorher auf Hessenbergform.',
    keyPoints: [
      t`Ähnlichkeit: $R_kQ_k = Q_k^\top(Q_kR_k)Q_k = Q_k^\top A_k Q_k$. Orthogonale Ähnlichkeitstransformation ⇒ gleiche Eigenwerte.`,
      t`Konvergenz: Das Nebendiagonalelement $h_{n+1,n}$ geht wie $|\lambda_{n+1}/\lambda_n|^k$ gegen 0. Nah beieinander liegende Eigenwerte ⇒ langsam.`,
      t`Ein QR-Schritt mit voller Matrix kostet $O(N^3)$. Deshalb zuerst Hessenbergform: unterhalb der ersten Nebendiagonale nur Nullen.`,
      t`Satz 30: $H = Q^\top AQ$ mit $N - 2$ Householder-Transformationen $Q = Q_2 \cdots Q_{N-1}$. Aufwand $\tfrac53 N^3$, symmetrisch $\tfrac23 N^3$.`,
      t`Householder für Hessenberg: $Q_2$ lässt die erste Zeile/Spalte unverändert und bildet die Komponenten 2 bis N der ersten Spalte auf ein Vielfaches von $e^1$ ab. Von beiden Seiten anwenden, sonst ändern sich die Eigenwerte.`,
      t`Ist A symmetrisch, ist H tridiagonal.`,
      t`Satz 31: Die Hessenbergform (bzw. Tridiagonalform) bleibt im QR-Algorithmus erhalten. QR-Zerlegung und RQ kosten dann nur $O(N^2)$ (tridiagonal: $O(N)$).`,
      t`Reduzible Hessenbergmatrix ($h_{n+1,n} = 0$): zerfällt in zwei kleinere Probleme, die man getrennt löst.`,
    ],
    example: {
      problem: t`Ein Schritt des QR-Algorithmus für $A = \begin{pmatrix} 2 & 1 \\ 1 & 2 \end{pmatrix}$ (Eigenwerte 3 und 1).`,
      steps: [
        t`$A_1 = R_0Q_0 = \begin{pmatrix} 2{,}8 & -0{,}6 \\ -0{,}6 & 1{,}2 \end{pmatrix}$ (Spur bleibt 4, Determinante bleibt 3).`,
        t`$A_2 \approx \begin{pmatrix} 2{,}976 & 0{,}220 \\ 0{,}220 & 1{,}024 \end{pmatrix}$, $A_3 \approx \begin{pmatrix} 2{,}997 & -0{,}074 \\ -0{,}074 & 1{,}003 \end{pmatrix}$.`,
        t`Das Nebendiagonalelement schrumpft etwa um $\tfrac13 = \lambda_2/\lambda_1$ pro Schritt.`,
      ],
      result: 'Diagonale → (3, 1)',
    },
    mistakes: ['Nur von links mit Q multiplizieren: $QA$ ist nicht ähnlich zu A.', 'Glauben, der QR-Algorithmus liefere direkt die Eigenvektoren.', 'Die Hessenbergform mit einer oberen Dreiecksmatrix verwechseln.'],
    supplement: 'Das Rechenbeispiel ist ein eigenes Beispiel der App (mit numpy nachgerechnet).',
    related: ['num.w.qr-shift', 'num.w.householder', 'num.w.qr'],
    sources: [sk('93–96', 'Abschnitt 6.2, Bemerkungen 42, Satz 30, Bemerkung 43, Satz 31, Bemerkung 44')],
  }),
  wissen({
    id: 'num.w.qr-shift',
    name: 'QR-Algorithmus mit Shift',
    short: 'µ = h_NN, Deflation',
    chapterId: chE,
    tex: t`H_k - \mu_k I_N = Q_kR_k,\qquad H_{k+1} = R_kQ_k + \mu_k I_N`,
    definition: 'Mit Shift µ konvergiert das letzte Nebendiagonalelement wie |(λ_N − µ)/(λ_{N−1} − µ)|^k, also sehr schnell, wenn µ nahe am Eigenwert λ_N liegt. Man nimmt µ_k = h_NN, den aktuellen Eintrag rechts unten. Sobald h_{N,N−1} klein genug ist, akzeptiert man h_NN als Eigenwert und arbeitet mit der um eins kleineren Matrix weiter (Deflation).',
    keyPoints: [
      t`$H_{k+1} = R_kQ_k + \mu_k I = Q_k^\top H_k Q_k$: weiterhin ähnlich zu A.`,
      t`Satz 32: Ist H irreduzibel und µ ein exakter Eigenwert, dann gilt nach einem Schritt $h_{N,N-1} = 0$ und $h_{NN} = \mu$: Die Matrix zerfällt sofort.`,
      t`Algorithmus: Toleranz ε; zerlege $H_k - h^{(k)}_{NN}I = Q_kR_k$; $H_{k+1} = R_kQ_k + h^{(k)}_{NN}I$; falls $|h_{N,N-1}| \le \varepsilon(|h_{NN}| + |h_{N-1,N-1}|)$: $h_{NN}$ ist Eigenwert, weiter mit $H[1{:}N{-}1, 1{:}N{-}1]$.`,
      t`Konvergenz mit $\mu = h_{NN}$: aus $h_{N,N-1} = \delta$ wird $O(\delta^2)$ (quadratisch), bei symmetrischer Matrix sogar $O(\delta^3)$ (kubisch).`,
      t`Quadratische Konvergenz heißt: Die Anzahl richtiger Stellen verdoppelt sich ungefähr pro Schritt.`,
      t`Im Skript-Beispiel (6 × 6): ohne Shift 23 Iterationen bis $10^{-7}$, mit Shift 11 Iterationen bis $10^{-15}$ für alle Eigenwerte.`,
      t`Deflation verkleinert die Matrix nach jedem gefundenen Eigenwert, das spart zusätzlich Aufwand.`,
    ],
    mistakes: ['Den Shift nach der Multiplikation $R_kQ_k$ nicht wieder addieren.', 'Erwarten, dass der Shift die Eigenwerte verändert.', 'Quadratische und kubische Konvergenz vertauschen (kubisch nur im symmetrischen Fall).'],
    examTip: 'WS20/21, Aufgabe 4 ist ein Lückentext genau zu diesem Thema: N − 2 Householder, $O(N^3)$, Tridiagonalmatrix, $H - \\mu I = QR$, $\\bar H = RQ + \\mu I$, $(e^N)^\\top \\bar H = (0, \\dots, 0, \\mu)$, $O(\\delta^2)$, Stellen verdoppeln sich.',
    related: ['num.w.qr-algorithmus', 'num.w.inverse-iteration'],
    sources: [sk('97–101', 'Satz 32, Algorithmus mit Shift, Konvergenzbetrachtung, Beispiel 37')],
  }),

  // ================================================================ 7 Iterative Verfahren
  wissen({
    id: 'num.w.lineare-iteration',
    name: 'Allgemeine lineare Iterationen',
    short: 'x + B⁻¹(b − Ax)',
    chapterId: chI,
    tex: t`x^{k+1} = x^k + B^{-1}r^k,\qquad r^k = b - Ax^k`,
    definition: 'Für große, dünnbesetzte Systeme sind direkte Verfahren oft zu teuer, weil die Faktoren der LR- oder Cholesky-Zerlegung auffüllen (Fill-in). Eine allgemeine lineare Iteration verbessert die Näherung schrittweise mit dem Residuum. Dabei ist B ein Vorkonditionierer, also eine Näherung an A, für die Bc = r leicht lösbar ist. Die Iteration konvergiert für jeden Startwert, wenn der Spektralradius von I − B⁻¹A kleiner als 1 ist.',
    keyPoints: [
      t`Warum iterativ? N sehr groß und A dünnbesetzt; Fill-in bei LR/Cholesky; oft reicht eine Näherung (z. B. bei Diskretisierungsfehlern). Die Inverse wäre vollbesetzt.`,
      t`Herleitung: $Ax = b \iff x = x + B^{-1}(b - Ax) = (I - B^{-1}A)x + B^{-1}b$ (Fixpunktgleichung).`,
      t`Fehler: $e^{k+1} = (I - B^{-1}A)e^k$, da $r^k = Ae^k$.`,
      t`Satz 33: $\rho(I - B^{-1}A) < \theta < 1$ ⇒ A regulär und $\|x^{k+1} - x^*\| \le \theta\|x^k - x^*\|$ für jeden Startwert (lineare Konvergenz).`,
      t`Algorithmus: $r^0 = b - Ax^0$; solange $\|r^k\| > \varepsilon\|b\|$: $Bc^k = r^k$ lösen, $x^{k+1} = x^k + c^k$, $r^{k+1} = r^k - Ac^k$.`,
      t`Vorkonditionierer: $\mathrm{cond}(B^{-1}A) < \mathrm{cond}(A)$. Je mehr von A in B steckt, desto schneller die Konvergenz, aber desto teurer $Bc = r$ (Extreme: $B = I$ und $B = A$).`,
      t`Beispiele mit $A = L + D + R$: Jacobi $B = D$, Gauß-Seidel $B = L + D$, unvollständige LR-Zerlegung $B = \tilde L\tilde R$.`,
    ],
    mistakes: ['$B^{-1}$ explizit berechnen: Man löst $Bc = r$.', 'Den Spektralradius von A statt von $I - B^{-1}A$ prüfen.', 'L und R hier mit den Faktoren der LR-Zerlegung verwechseln: Es sind die strikten Dreiecksteile von A.'],
    related: ['num.w.jacobi-gs', 'num.w.cg', 'num.w.lr-idee'],
    sources: [sk('102–105', 'Einleitung Kapitel 7, Bemerkung 46, Abschnitt 7.1, Satz 33, Algorithmus, Bemerkung 47, Beispiele 38, Abbildung 7.2')],
  }),
  wissen({
    id: 'num.w.jacobi-gs',
    name: 'Jacobi- und Gauß-Seidel-Verfahren',
    short: 'B = D bzw. B = L + D',
    chapterId: chI,
    tex: t`A = L + D + R:\quad B_{\mathrm{J}} = D,\quad B_{\mathrm{GS}} = L + D`,
    definition: 'Zerlege A = L + D + R in strikt unteren Teil, Diagonale und strikt oberen Teil. Das Jacobi-Verfahren (Gesamtschrittverfahren) nimmt B = D: Jede Komponente wird aus der n-ten Gleichung mit den alten Werten berechnet, alles parallel. Das Gauß-Seidel-Verfahren (Einzelschrittverfahren) nimmt B = L + D: Es verwendet die schon neu berechneten Komponenten sofort, muss also der Reihe nach rechnen.',
    keyPoints: [
      t`Jacobi komponentenweise: $x^{k+1}_n = \dfrac{1}{a_{nn}}\Big(b_n - \sum_{m \neq n} a_{nm}x^k_m\Big)$. Gauß-Seidel genauso, nur mit $x^{k+1}_m$ für $m < n$.`,
      t`Jacobi: $Dc = r$ ist trivial (Division durch die Diagonale). Komponenten unabhängig ⇒ parallelisierbar.`,
      t`Gauß-Seidel: $(L + D)c = r$ per Vorwärtssubstitution. Sequenziell, konvergiert aber häufig schneller.`,
      t`Satz 34: A strikt diagonaldominant ($|a_{nn}| > \sum_{m \neq n}|a_{nm}|$) ⇒ Jacobi und Gauß-Seidel konvergieren für jeden Startwert.`,
      t`Diagonaldominanz ist hinreichend, nicht notwendig. Genau entscheidet $\rho(I - B^{-1}A) < 1$.`,
      t`Es kann sein, dass Jacobi konvergiert und Gauß-Seidel nicht (Übungsblatt 7: $\rho_J = \tfrac12$, $\rho_{GS} \approx 2{,}54$).`,
      t`Jacobi-Iterationsmatrix: $I - D^{-1}A$ hat Nullen auf der Diagonalen und $-a_{nm}/a_{nn}$ sonst. Mit den Gerschgorin-Kreisen lässt sich ρ oft schnell abschätzen.`,
    ],
    example: {
      problem: t`Zwei Schritte Jacobi und Gauß-Seidel für $\begin{pmatrix} 4 & 1 \\ 1 & 3 \end{pmatrix}x = \begin{pmatrix} 1 \\ 2 \end{pmatrix}$, $x^0 = 0$. Exakt: $x^* = (\tfrac1{11}, \tfrac7{11}) \approx (0{,}0909;\ 0{,}6364)$.`,
      steps: [
        t`Jacobi: $x^1 = (\tfrac14, \tfrac23)$, $x^2 = \big(\tfrac{1 - 2/3}{4}, \tfrac{2 - 1/4}{3}\big) = (\tfrac1{12}, \tfrac7{12}) \approx (0{,}083;\ 0{,}583)$.`,
        t`Gauß-Seidel: $x^1_1 = \tfrac14$, dann sofort $x^1_2 = \tfrac{2 - 1/4}{3} = \tfrac7{12}$.`,
        t`$x^2_1 = \tfrac{1 - 7/12}{4} = \tfrac{5}{48} \approx 0{,}104$, $x^2_2 = \tfrac{2 - 5/48}{3} = \tfrac{91}{144} \approx 0{,}632$.`,
        t`Spektralradien: Jacobi $\tfrac{1}{\sqrt{12}} \approx 0{,}289$, Gauß-Seidel $\tfrac1{12} \approx 0{,}083$. Gauß-Seidel ist hier deutlich schneller.`,
      ],
      result: 'GS nach 2 Schritten näher an x* als Jacobi',
    },
    mistakes: ['Beim Jacobi-Verfahren schon neue Werte verwenden (das wäre Gauß-Seidel).', 'Aus fehlender Diagonaldominanz auf Divergenz schließen.', 'Bei Gauß-Seidel $B = D + R$ statt $B = L + D$ nehmen.'],
    supplement: 'Das Rechenbeispiel ist ein eigenes Beispiel der App (exakt nachgerechnet).',
    related: ['num.w.lineare-iteration', 'num.w.cg'],
    sources: [sk('104–105', 'Beispiele 38 (a), (b), Satz 34, Bemerkung 48'), src('NUM-UB07', '1–2', 'Aufgabe 1 c)')],
  }),
  wissen({
    id: 'num.w.cg',
    name: 'Das cg-Verfahren',
    short: 'konjugierte Gradienten',
    chapterId: chI,
    tex: t`\Phi(x) = \tfrac12 x^\top Ax - x^\top b = \min!`,
    definition: 'Für symmetrisch positiv definites A ist Ax = b gleichwertig dazu, das Funktional Φ(x) = ½xᵀAx − xᵀb zu minimieren. Das cg-Verfahren minimiert Φ schrittweise entlang von Suchrichtungen: optimale Schrittweite α_k entlang d^k, dann neue Suchrichtung aus dem Residuum, A-orthogonal (konjugiert) zur alten gemacht. Pro Schritt braucht es nur ein Matrix-Vektor-Produkt.',
    keyPoints: [
      t`Voraussetzung: A symmetrisch positiv definit.`,
      t`Satz 35: x minimiert Φ ⇔ $Ax = b$ (Gradient $(Ax - b)^\top = 0$, Hesse-Matrix A spd).`,
      t`Energienorm $\|x\|_A = \sqrt{x^\top Ax}$, und $\Phi(x) - \Phi(x^*) = \tfrac12\|x - x^*\|_A^2$.`,
      t`Schrittweite: $\varphi(\alpha) = \Phi(x^k + \alpha d^k)$ minimieren, $\varphi'(\alpha) = 0$ ⇒ $\alpha_k = \dfrac{\langle r^k, d^k\rangle}{\langle d^k, d^k\rangle_A}$ (gleich $\dfrac{\langle r^k, r^k\rangle}{\langle d^k, d^k\rangle_A}$).`,
      t`Neue Suchrichtung: $d^{k+1} = r^{k+1} + \beta_k d^k$ mit $\langle d^{k+1}, d^k\rangle_A = 0$ ⇒ $\beta_k = -\dfrac{\langle r^{k+1}, d^k\rangle_A}{\langle d^k, d^k\rangle_A}$ (gleich $\dfrac{\langle r^{k+1}, r^{k+1}\rangle}{\langle r^k, r^k\rangle}$).`,
      t`Algorithmus: $d^0 = r^0 = b - Ax^0$; solange $\|r^k\| > \varepsilon\|b\|$: $\alpha_k$, $x^{k+1} = x^k + \alpha_k d^k$, $r^{k+1} = r^k - \alpha_k Ad^k$, $\beta_k$, $d^{k+1} = r^{k+1} + \beta_k d^k$.`,
      t`Aufwand pro Schritt: ein Matrix-Vektor-Produkt $Ad^k$ (vollbesetzt $N^2$, dünnbesetzt $\sim$ Anzahl Nicht-Nullen), sonst nur $O(N)$. $Ad^k$ speichern und zweimal verwenden.`,
      t`Stoppkriterium relativ: $\|r^k\| \le \varepsilon\|b\|$. Skaliert man A und b mit λ, ändern sich die Iterierten nicht, das Kriterium auch nicht.`,
    ],
    example: {
      problem: t`cg für $\begin{pmatrix} 1 & 1 \\ 1 & 2 \end{pmatrix}x = \begin{pmatrix} 2 \\ -1 \end{pmatrix}$, $x^0 = 0$.`,
      steps: [
        t`$d^0 = r^0 = (2, -1)^\top$, $Ad^0 = (1, 0)^\top$, $\langle r^0, r^0\rangle = 5$, $\langle d^0, d^0\rangle_A = 2$ ⇒ $\alpha_0 = \tfrac52$.`,
        t`$x^1 = (5, -\tfrac52)^\top$, $r^1 = r^0 - \tfrac52(1, 0)^\top = (-\tfrac12, -1)^\top$, $\beta_0 = \tfrac{5/4}{5} = \tfrac14$, $d^1 = (0, -\tfrac54)^\top$.`,
        t`$Ad^1 = (-\tfrac54, -\tfrac52)^\top$, $\langle d^1, d^1\rangle_A = \tfrac{25}{8}$ ⇒ $\alpha_1 = \tfrac{5/4}{25/8} = \tfrac25$.`,
        t`$x^2 = (5, -3)^\top$, $r^2 = 0$: nach N = 2 Schritten exakt.`,
      ],
      result: 'x = (5, −3)ᵀ',
      source: src('NUM-UB07', '2–3', 'Aufgabe 3 mit Lösung'),
    },
    mistakes: ['cg auf nicht symmetrische oder indefinite Matrizen anwenden.', 'Beim Residuum $r^{k+1} = b - Ax^{k+1}$ ein zweites Matrix-Vektor-Produkt ausrechnen statt $r^k - \\alpha_kAd^k$.', 'Euklidisches Skalarprodukt und A-Skalarprodukt im Nenner von α verwechseln.'],
    examTip: 'Häufig gefragt (WS17/18, SS20, SS24, SS26): Minimierungsproblem angeben, Idee von α (Minimum entlang der Suchrichtung) und von β (A-Orthogonalisierung) in Worten erklären.',
    related: ['num.w.cg-konvergenz', 'num.w.lineare-iteration', 'num.w.cholesky'],
    sources: [sk('105–108', 'Abschnitt 7.2, Satz 35, Definition 13, Abschnitt 7.2.1, Bemerkungen 49, Algorithmus, Bemerkungen 50')],
  }),
  wissen({
    id: 'num.w.cg-konvergenz',
    name: 'Konvergenz und Vorkonditionierung beim cg-Verfahren',
    short: 'Spektrum entscheidet',
    chapterId: chI,
    tex: t`\frac{\|x^* - x^k\|_A}{\|x^* - x^0\|_A} \le \max_{\lambda \in \sigma(A)}|q_k(\lambda)|`,
    definition: 'Wie schnell cg konvergiert, hängt vom Spektrum von A ab: Für jedes Polynom q_k vom Grad k mit q_k(0) = 1 ist der Fehler höchstens max |q_k(λ)| über die Eigenwerte. Wenige verschiedene Eigenwerte oder wenige schmale Cluster bedeuten schnelle Konvergenz; eine große Konditionszahl bedeutet langsame. Vorkonditionierung formt das System so um, dass das Spektrum günstiger wird.',
    keyPoints: [
      t`Satz 36: In exakter Arithmetik nach höchstens N Schritten exakt. Praktisch unwichtig: Rundungsfehler, und N ist riesig.`,
      t`L verschiedene Eigenwerte ⇒ höchstens L Schritte: $q_L(x) = \prod_{m=1}^L(1 - x/\lambda_m)$ verschwindet auf dem Spektrum, $q_L(0) = 1$.`,
      t`Cluster: Lagrange-Polynom mit Nullstellen in den Clustermitten ⇒ nach M Schritten kleiner Fehler, wenn die Cluster schmal und weit voneinander (und von 0) entfernt sind.`,
      t`Satz 38: $\|x^* - x^k\|_A \le 2\Big(\dfrac{\sqrt\kappa - 1}{\sqrt\kappa + 1}\Big)^k\|x^* - x^0\|_A$ mit $\kappa = \mathrm{cond}_2(A) = \lambda_{\max}/\lambda_{\min}$.`,
      t`Vorkonditionierung mit $M = CC^\top \approx A$: cg für $\tilde A = C^{-1}AC^{-\top}$, ohne $\tilde A$ zu bilden; pro Schritt zusätzlich $Ms = r$ lösen. Konvergenz hängt von $\mathrm{cond}(M^{-1}A)$ ab.`,
      t`Typische Vorkonditionierer: Jacobi, unvollständige Cholesky-Zerlegung, symmetrisches Gauß-Seidel, Zeilenäquilibrierung. Sie helfen nicht immer.`,
      t`Normalengleichung $A^\top Ax = A^\top b$: cg braucht pro Schritt nur $A(d^k)$ und dann $A^\top(Ad^k)$, also zwei Matrix-Vektor-Produkte statt der teuren Matrix $A^\top A$. Achtung: $\mathrm{cond}(A^\top A) = \mathrm{cond}(A)^2$.`,
    ],
    mistakes: ['Glauben, cg brauche in der Praxis immer N Schritte.', 'Kondition mit $\\kappa$ statt $\\sqrt\\kappa$ in den Faktor einsetzen.', 'Bei der Vorkonditionierung $\\tilde A$ explizit ausrechnen.'],
    examTip: 'SS26, Aufgabe 6 c, d und Übungsblatt 7, Aufgabe 2: Lagrange-Polynom mit $q(0) = 1$ und Nullstellen in den Eigenwerten bzw. Clustermitten konstruieren.',
    related: ['num.w.cg', 'num.cg-faktor', 'num.w.interpolation', 'num.cond'],
    sources: [sk('107–111', 'Satz 36, Bemerkungen 49 1), Satz 37, Bemerkung 51, Satz 38, Bemerkungen 52, Abschnitte 7.2.3 und 7.2.4, Bemerkungen 53'), src('NUM-UB07', '2', 'Aufgabe 2')],
  }),
  {
    id: 'num.cg-faktor',
    name: 'Kontraktionsfaktor des cg-Verfahrens',
    short: '(√κ − 1)/(√κ + 1)',
    chapterId: chI,
    tex: t`c = \frac{\sqrt\kappa - 1}{\sqrt\kappa + 1},\qquad \|x^* - x^k\|_A \le 2c^k\,\|x^* - x^0\|_A`,
    lhs: 'c',
    rhs: '(sqrt(kappa)-1)/(sqrt(kappa)+1)',
    variables: [vc, vk],
    assumptions: ['A symmetrisch positiv definit, $\\kappa = \\mathrm{cond}_2(A) = \\lambda_{\\max}/\\lambda_{\\min}$.'],
    intuition: 'Je näher κ an 1 liegt, desto kleiner c und desto schneller cg. Wegen der Wurzel ist cg viel unempfindlicher gegenüber der Kondition als einfache Verfahren.',
    interpretation: 'κ = 100 ergibt c = 9/11 ≈ 0,82; κ = 10⁴ ergibt c ≈ 0,98. Deshalb lohnt Vorkonditionierung.',
    useCases: ['Konvergenzgeschwindigkeit von cg abschätzen', 'Nutzen eines Vorkonditionierers beurteilen'],
    whenNot: ['Wenn das Spektrum aus wenigen Clustern besteht: Dann ist cg viel schneller als diese Schranke.'],
    mistakes: ['κ statt √κ einsetzen.', 'Den Faktor 2 vor $c^k$ vergessen.'],
    example: {
      problem: 'A spd mit Eigenwerten zwischen 1 und 100. Wie groß ist c?',
      steps: [t`$\kappa = 100$, $\sqrt\kappa = 10$.`, t`$c = \tfrac{9}{11} \approx 0{,}818$.`],
      result: 'c ≈ 0,818',
    },
    related: ['num.w.cg-konvergenz', 'num.cond'],
    difficulty: 2,
    sources: [sk('109', 'Satz 38, Bemerkungen 52')],
    status: 'geprüft',
  },
]

export const exercises: Exercise[] = [
  // ------------------------------------------------------------ Vektoriteration
  mc({
    id: 'num.w.vektoriteration.e1', chapterId: chE, formulaIds: ['num.w.vektoriteration'], skill: 'abrufen', difficulty: 1, origin: 'klausur',
    prompt: 'Gegen welchen Eigenvektor konvergiert die Vektoriteration $y^{k+1} = Ay^k / \\|Ay^k\\|_2$ (A symmetrisch, Startwert generisch)?',
    options: opts('*Gegen einen Eigenvektor zum betragsgrößten Eigenwert.', ['Gegen einen Eigenvektor zum betragskleinsten Eigenwert.', 'Das leistet die inverse Iteration.'], ['Gegen einen Eigenvektor zum größten positiven Eigenwert, auch wenn ein negativer betragsmäßig größer ist.', 'Es zählt der Betrag.'], ['Gegen alle Eigenvektoren gleichzeitig.', 'Alle Eigenwerte auf einmal liefert der QR-Algorithmus, und auch der keine Eigenvektoren.']),
    hints: ['Welcher Anteil wird durch Multiplikation mit A am stärksten verstärkt?', '$(\\lambda_n/\\lambda_1)^k \\to 0$ für $n \\ge 2$.'],
    explanation: ['Satz 29: Konvergenz gegen $v^1$ zum betragsgrößten einfachen Eigenwert, falls $x^0$ nicht senkrecht auf $v^1$ steht.'],
    sources: [sk('90', 'Satz 29'), src('NUM-K-SS17', '3', 'Aufgabe 6 c)')],
  }),
  numeric({
    id: 'num.w.vektoriteration.e2', chapterId: chE, formulaIds: ['num.w.vektoriteration'], skill: 'anwenden', difficulty: 2, origin: 'app',
    prompt: t`Vektoriteration für $A = \begin{pmatrix} 2 & 1 \\ 1 & 2 \end{pmatrix}$ mit $y^0 = (1, 0)^\top$: Es ist $y^1 = \tfrac{1}{\sqrt5}(2, 1)^\top$. Berechne den Rayleigh-Quotienten $(y^1)^\top Ay^1$.`,
    answer: 2.8, fmt: fmt.num(4),
    hints: ['$Ay^1 = \\tfrac{1}{\\sqrt5}(5, 4)^\\top$.', '$(y^1)^\\top Ay^1 = \\tfrac15(2 \\cdot 5 + 1 \\cdot 4)$.'],
    explanation: ['$\\tfrac{14}{5} = 2{,}8$. Der dominante Eigenwert ist 3.'],
    sources: [sk('90', 'Rayleigh-Quotient nach Satz 29')],
  }),
  trueFalse({
    id: 'num.w.vektoriteration.e3', chapterId: chE, formulaIds: ['num.w.vektoriteration'], skill: 'interpretieren', difficulty: 2, origin: 'vorlesung',
    prompt: 'Richtig oder falsch?',
    statements: [
      ['Eigenwerte über die Nullstellen des charakteristischen Polynoms zu berechnen ist numerisch nicht sinnvoll.', true, 'Polynomnullstellen sind bezüglich der Koeffizienten sehr schlecht konditioniert.'],
      ['Ohne Normierung kann die Vektoriteration über- oder unterlaufen.', true, '$\\lambda_1^k \\to \\infty$ bzw. $\\to 0$.'],
      ['$A - \\lambda^*I$ hat andere Eigenvektoren als A.', false, 'Gleiche Eigenvektoren, verschobene Eigenwerte.'],
      ['Steht $x^0$ senkrecht auf $v^1$, so konvergiert die Vektoriteration (in exakter Arithmetik) nicht gegen $v^1$.', true, 'Dann ist $\\mu_1 = 0$.'],
    ],
    hints: ['$(A - \\lambda^*I)v = (\\lambda - \\lambda^*)v$.', 'Was passiert mit dem Anteil $\\mu_1 v^1$, wenn $\\mu_1 = 0$?'],
    sources: [sk('89–90')],
  }),
  numeric({
    id: 'num.konvergenzfaktor.e1', chapterId: chE, formulaIds: ['num.konvergenzfaktor'], skill: 'einsetzen', difficulty: 1, origin: 'app',
    prompt: 'Die betragsgrößten Eigenwerte einer symmetrischen Matrix sind $-6$ und $4$. Wie groß ist der Konvergenzfaktor der Vektoriteration?',
    answer: 2 / 3, fmt: fmt.num(4),
    wrong: [{ value: 1.5, explanation: 'Kehrwert: oben steht $|\\lambda_2|$.' }, { value: -2 / 3, explanation: 'Beträge nehmen.' }],
    hints: ['$q = |\\lambda_2| / |\\lambda_1|$.', '$4/6$'],
    explanation: ['$q = 4/6 = 2/3$.'],
    sources: [sk('90')],
  }),
  numeric({
    id: 'num.konvergenzfaktor.e2', chapterId: chE, formulaIds: ['num.konvergenzfaktor'], skill: 'anwenden', difficulty: 2, origin: 'vorlesung',
    prompt: 'A hat die Eigenwerte 3, 2, 1. Wie groß ist der Konvergenzfaktor der Vektoriteration für $A - 1{,}5\\,I$?',
    answer: 1 / 3, fmt: fmt.num(4),
    wrong: [{ value: 2 / 3, explanation: 'Das ist der Faktor für A ohne Shift.' }],
    hints: ['Eigenwerte von $A - 1{,}5I$: jeweils 1,5 abziehen.', '$1{,}5;\\ 0{,}5;\\ -0{,}5$'],
    explanation: ['$q = 0{,}5 / 1{,}5 = 1/3$: doppelt so schnell wie ohne Shift.'],
    sources: [sk('90', 'Beispiel 34')],
  }),

  // ------------------------------------------------------------ Inverse Iteration
  mc({
    id: 'num.w.inverse-iteration.e1', chapterId: chE, formulaIds: ['num.w.inverse-iteration'], skill: 'abrufen', difficulty: 1, origin: 'klausur',
    prompt: 'Was wird in jedem Schritt der inversen Iteration (ohne Shift) gemacht?',
    options: opts(t`*Das LGS $Ax^{k+1} = y^k$ lösen (mit einmal berechneter LR-Zerlegung) und normieren.`, [t`$A^{-1}$ in jedem Schritt neu berechnen und mit $y^k$ multiplizieren.`, 'Viel zu teuer; man löst ein LGS.'], [t`$x^{k+1} = Ay^k$ berechnen und normieren.`, 'Das ist die normale Vektoriteration.'], ['Eine QR-Zerlegung von A berechnen.', 'Das gehört zum QR-Algorithmus.']),
    hints: ['Man iteriert mit $A^{-1}$, ohne $A^{-1}$ zu bilden.', 'Die teure Zerlegung braucht man nur einmal.'],
    explanation: ['Einmal LR-Zerlegung ($\\tfrac13N^3$), danach pro Schritt Vorwärts- und Rückwärtssubstitution ($N^2$).'],
    sources: [sk('91', 'Abschnitt 6.1.1'), src('NUM-K-WS1920', '4', 'Aufgabe 6 c)')],
  }),
  numeric({
    id: 'num.w.inverse-iteration.e2', chapterId: chE, formulaIds: ['num.w.inverse-iteration', 'num.konvergenzfaktor'], skill: 'anwenden', difficulty: 2, origin: 'vorlesung',
    prompt: 'A hat die Eigenwerte 0,1; 2; 3 und −5. Wie groß ist der Konvergenzfaktor der inversen Iteration (ohne Shift)?',
    answer: 1 / 20, fmt: fmt.num(4),
    wrong: [{ value: 0.02, explanation: 'Der zweitgrößte Betrag unter den Kehrwerten ist 1/2, nicht 1/5.' }, { value: 20, explanation: 'Kehrwert: kleiner Betrag oben.' }],
    hints: ['Eigenwerte von $A^{-1}$: $10;\\ \\tfrac12;\\ \\tfrac13;\\ -\\tfrac15$.', 'Zweitgrößter Betrag durch größten Betrag.'],
    explanation: ['$q = \\tfrac{1/2}{10} = \\tfrac{1}{20}$.'],
    sources: [sk('91', 'Beispiel 35')],
  }),
  numeric({
    id: 'num.w.inverse-iteration.e3', chapterId: chE, formulaIds: ['num.w.inverse-iteration'], skill: 'anwenden', difficulty: 3, origin: 'app',
    prompt: 'A symmetrisch mit Eigenwerten 1, 2 und 4. Für den Eigenwert 2 liegt die Schätzung $\\lambda^* = 2{,}1$ vor. Wie groß ist der Konvergenzfaktor der inversen Iteration mit $A - \\lambda^* I$? (4 Nachkommastellen)',
    answer: 0.1 / 1.1, fmt: fmt.num(4),
    hints: ['Eigenwerte von $A - 2{,}1I$: $-1{,}1;\\ -0{,}1;\\ 1{,}9$.', 'Für die Inverse: Kehrwerte, also $-0{,}909;\\ -10;\\ 0{,}526$.', 'Zweitgrößter Betrag durch größten Betrag.'],
    explanation: ['$q = \\dfrac{1/1{,}1}{10} = \\dfrac{0{,}1}{1{,}1} \\approx 0{,}0909$. Der nächstgelegene andere Eigenwert (1) bestimmt die Geschwindigkeit.'],
    sources: [sk('91', 'Diskussion vor Beispiel 36')],
  }),
  trueFalse({
    id: 'num.w.inverse-iteration.e4', chapterId: chE, formulaIds: ['num.w.inverse-iteration'], skill: 'interpretieren', difficulty: 2, origin: 'vorlesung',
    prompt: 'Richtig oder falsch?',
    statements: [
      ['Die schlechte Kondition von $A - \\lambda^*I$ für $\\lambda^*$ nahe an einem Eigenwert macht die inverse Iteration unbrauchbar.', false, 'Gesucht ist nur die Richtung des Eigenvektors, und die ist gut konditioniert (Bemerkung 41).'],
      ['Für die inverse Iteration mit Shift braucht man schon eine gute Schätzung des Eigenwerts.', true, 'Sonst findet man einen anderen Eigenwert.'],
      ['Bei der spektralen Bisektion wendet man die inverse Iteration auf $A + ee^\\top$ an, weil die Laplacematrix singulär ist.', true, '$Ae = 0$; $A + ee^\\top$ ist spd.'],
    ],
    hints: ['Was genau wird bei der inversen Iteration gesucht?', 'Welchen Kern hat die Laplacematrix?'],
    sources: [sk('91–93')],
  }),

  // ------------------------------------------------------------ QR-Algorithmus
  mc({
    id: 'num.w.qr-algorithmus.e1', chapterId: chE, formulaIds: ['num.w.qr-algorithmus'], skill: 'abrufen', difficulty: 1, origin: 'klausur',
    prompt: 'Wie lautet ein Schritt des QR-Algorithmus (ohne Shift)?',
    options: opts(t`*$A_k = Q_kR_k$ zerlegen, $A_{k+1} = R_kQ_k$`, [t`$A_k = Q_kR_k$ zerlegen, $A_{k+1} = Q_kR_k$`, 'Das wäre wieder $A_k$.'], [t`$A_{k+1} = Q_kA_k$`, 'Nicht ähnlich zu $A_k$, die Eigenwerte ändern sich.'], [t`$A_k = L_kR_k$ zerlegen, $A_{k+1} = R_kL_k$`, 'Das ist der (historische) LR-Algorithmus, nicht der aus der Vorlesung.']),
    hints: ['Faktoren in umgekehrter Reihenfolge multiplizieren.', '$R_kQ_k = Q_k^\\top A_kQ_k$.'],
    explanation: ['$A_{k+1} = R_kQ_k = Q_k^\\top A_kQ_k$ ist ähnlich zu $A_k$.'],
    sources: [sk('93', 'Abschnitt 6.2'), src('NUM-K-SS19', '3', 'Aufgabe 4')],
  }),
  mc({
    id: 'num.w.qr-algorithmus.e2', chapterId: chE, formulaIds: ['num.w.qr-algorithmus'], skill: 'auswaehlen', difficulty: 2, origin: 'klausur',
    prompt: 'Warum transformiert man A vor dem QR-Algorithmus auf Hessenbergform?',
    options: opts(
      '*Die Hessenbergform bleibt erhalten, und ein QR-Schritt kostet dann nur $O(N^2)$ statt $O(N^3)$.',
      ['Weil man die Eigenwerte direkt von der Diagonale der Hessenbergmatrix ablesen kann.', 'Dafür muss erst der QR-Algorithmus konvergieren.'],
      ['Weil der QR-Algorithmus sonst nicht konvergiert.', 'Er konvergiert auch ohne, aber jeder Schritt ist teuer.'],
      ['Weil die Hessenbergform andere, besser konditionierte Eigenwerte hat.', 'Ähnlichkeitstransformation: gleiche Eigenwerte.'],
    ),
    hints: ['Satz 31 und Bemerkung 44.', 'Was kostet eine QR-Zerlegung einer vollen Matrix?'],
    explanation: ['Einmal $\\tfrac53N^3$ für die Transformation, dann pro Schritt $O(N^2)$ (tridiagonal: $O(N)$).'],
    sources: [sk('94–96', 'Bemerkungen 42 1), Satz 31, Bemerkung 44')],
  }),
  numeric({
    id: 'num.w.qr-algorithmus.e3', chapterId: chE, formulaIds: ['num.w.qr-algorithmus'], skill: 'abrufen', difficulty: 1, origin: 'klausur',
    prompt: 'Wie viele Householder-Transformationen braucht man, um $A \\in \\mathbb{R}^{N \\times N}$ mit $N = 6$ auf Hessenbergform zu bringen?',
    answer: 4, fmt: fmt.int(),
    wrong: [{ value: 5, explanation: 'Das wäre für eine QR-Zerlegung (N − 1). Für Hessenberg reichen N − 2.' }],
    hints: ['Für Hessenberg muss man in Spalte n erst ab Zeile n + 2 Nullen erzeugen.', 'Satz 30: $Q = Q_2 \\cdots Q_{N-1}$.'],
    explanation: ['$N - 2 = 4$.'],
    sources: [sk('94', 'Satz 30'), src('NUM-K-WS2021', '3', 'Aufgabe 4 (a)')],
  }),
  trueFalse({
    id: 'num.w.qr-algorithmus.e4', chapterId: chE, formulaIds: ['num.w.qr-algorithmus'], skill: 'interpretieren', difficulty: 2, origin: 'app',
    prompt: 'Richtig oder falsch?',
    statements: [
      ['Die Hessenbergform einer symmetrischen Matrix ist tridiagonal.', true, '$H = Q^\\top AQ$ ist wieder symmetrisch.'],
      ['Für die Hessenbergform reicht es, A von links mit den Householder-Matrizen zu multiplizieren.', false, 'Von beiden Seiten, sonst ändern sich die Eigenwerte.'],
      ['Ohne Shift geht $h_{n+1,n}$ etwa wie $|\\lambda_{n+1}/\\lambda_n|^k$ gegen 0.', true, 'Bemerkungen 42 2).'],
      ['Ist $h_{n+1,n} = 0$, kann man die beiden Diagonalblöcke getrennt weiterbehandeln.', true, 'Reduzible Hessenbergmatrix.'],
    ],
    hints: ['Ähnlichkeit braucht $Q^\\top \\cdot Q$.', 'Wie hängen die Eigenwerte einer Block-Dreiecksmatrix mit denen der Diagonalblöcke zusammen?'],
    sources: [sk('93–97')],
  }),

  // ------------------------------------------------------------ QR mit Shift
  mc({
    id: 'num.w.qr-shift.e1', chapterId: chE, formulaIds: ['num.w.qr-shift'], skill: 'abrufen', difficulty: 2, origin: 'klausur',
    prompt: 'Wie lautet ein Schritt des QR-Algorithmus mit Shift µ?',
    options: opts(t`*$H - \mu I = QR$, $\bar H = RQ + \mu I$`, [t`$H - \mu I = QR$, $\bar H = RQ$`, 'Der Shift muss wieder addiert werden, sonst verschieben sich die Eigenwerte.'], [t`$H = QR$, $\bar H = RQ - \mu I$`, 'Der Shift kommt vor der Zerlegung.'], [t`$H + \mu I = QR$, $\bar H = RQ - \mu I$`, 'Vorzeichen vertauscht; verwendet wird $H - \\mu I$.']),
    hints: ['Erst verschieben, dann zerlegen und zurückmultiplizieren, dann zurückverschieben.', '$\\bar H = Q^\\top HQ$ muss gelten.'],
    explanation: ['$\\bar H = RQ + \\mu I = Q^\\top(H - \\mu I)Q + \\mu I = Q^\\top HQ$.'],
    sources: [sk('94, 97', 'Bemerkungen 42 2), Satz 32'), src('NUM-K-WS2021', '3', 'Aufgabe 4 (e), (f)')],
  }),
  mc({
    id: 'num.w.qr-shift.e2', chapterId: chE, formulaIds: ['num.w.qr-shift'], skill: 'abrufen', difficulty: 2, origin: 'klausur',
    prompt: 'Wie schnell konvergiert $h_{N,N-1}$ beim QR-Algorithmus mit Shift $\\mu = h_{NN}$ für eine **symmetrische** Matrix?',
    options: opts('*Kubisch: aus $h_{N,N-1} = \\delta$ wird $O(\\delta^3)$.', ['Quadratisch: $O(\\delta^2)$.', 'Das gilt im allgemeinen (nicht symmetrischen) Fall.'], ['Linear mit Faktor $|\\lambda_N / \\lambda_{N-1}|$.', 'Das ist ohne Shift.'], ['In einem Schritt exakt.', 'Nur wenn µ schon exakt ein Eigenwert ist (Satz 32).']),
    hints: ['Im symmetrischen Fall ist $b = O(\\delta)$.', 'Neuer Eintrag $\\delta^2 b / (a^2 + \\delta^2)$.'],
    explanation: ['$\\bar h_{N,N-1} = \\delta^2 b/(a^2 + \\delta^2)$ mit $b = O(\\delta)$ im symmetrischen Fall ⇒ $O(\\delta^3)$.'],
    sources: [sk('98–99', 'Konvergenzbetrachtung')],
  }),
  trueFalse({
    id: 'num.w.qr-shift.e3', chapterId: chE, formulaIds: ['num.w.qr-shift'], skill: 'interpretieren', difficulty: 2, origin: 'vorlesung',
    prompt: 'Richtig oder falsch?',
    statements: [
      ['Ist µ ein exakter Eigenwert der irreduziblen Hessenbergmatrix H, so ist nach einem Schritt $h_{N,N-1} = 0$ und $h_{NN} = \\mu$.', true, 'Satz 32.'],
      ['Nach dem Akzeptieren eines Eigenwerts rechnet man mit der um eine Zeile und Spalte kleineren Matrix weiter.', true, 'Deflation.'],
      ['Bei quadratischer Konvergenz verdoppelt sich ungefähr die Anzahl richtiger Stellen pro Schritt.', true, 'WS20/21, Aufgabe 4 (j).'],
      ['Der Shift verändert die Eigenwerte, die am Ende auf der Diagonalen stehen.', false, '$\\bar H$ ist ähnlich zu H.'],
    ],
    hints: ['Satz 32 und der Algorithmus mit Shift.', 'Ist $\\bar H$ ähnlich zu H?'],
    sources: [sk('97–98'), src('NUM-K-WS2021', '3', 'Aufgabe 4')],
  }),

  // ------------------------------------------------------------ Lineare Iteration
  mc({
    id: 'num.w.lineare-iteration.e1', chapterId: chI, formulaIds: ['num.w.lineare-iteration'], skill: 'abrufen', difficulty: 1, origin: 'klausur',
    prompt: 'Wann konvergiert die allgemeine lineare Iteration $x^{k+1} = x^k + B^{-1}(b - Ax^k)$ für **jeden** Startwert?',
    options: opts(t`*Wenn $\rho(I_N - B^{-1}A) < 1$.`, [t`Wenn $\rho(A) < 1$.`, 'Es kommt auf die Iterationsmatrix an, nicht auf A.'], [t`Wenn $\|B\| < 1$.`, 'Nein.'], ['Wenn A regulär ist.', 'Regularität allein reicht nicht.']),
    hints: ['Fehlerfortpflanzung: $e^{k+1} = (I - B^{-1}A)e^k$.', 'Satz 33.'],
    explanation: ['Satz 33: Spektralradius der Iterationsmatrix kleiner 1.'],
    sources: [sk('103', 'Satz 33'), src('NUM-K-WS1920', '4', 'Aufgabe 5 (e)')],
  }),
  mc({
    id: 'num.w.lineare-iteration.e2', chapterId: chI, formulaIds: ['num.w.lineare-iteration'], skill: 'auswaehlen', difficulty: 2, origin: 'vorlesung',
    prompt: 'Warum verwendet man für große dünnbesetzte Systeme oft iterative statt direkter Verfahren?',
    options: opts(
      '*Die Faktoren von LR- oder Cholesky-Zerlegung füllen auf (Fill-in) und brauchen viel Speicher; iterative Verfahren brauchen nur Matrix-Vektor-Produkte.',
      ['Weil direkte Verfahren bei dünnbesetzten Matrizen falsche Ergebnisse liefern.', 'Sie sind korrekt, nur teuer.'],
      ['Weil man die Inverse dünnbesetzter Matrizen günstig berechnen kann.', 'Die Inverse ist meist vollbesetzt.'],
      ['Weil iterative Verfahren immer in einem Schritt exakt sind.', 'Sie liefern Näherungen.'],
    ),
    hints: ['Abbildung 7.1 im Skript.', 'Was passiert mit den Nullen in L und R?'],
    explanation: ['Fill-in und Speicher; dazu reicht oft eine Näherung.'],
    sources: [sk('102–103', 'Einleitung, Abbildung 7.1, Bemerkung 46')],
  }),
  trueFalse({
    id: 'num.w.lineare-iteration.e3', chapterId: chI, formulaIds: ['num.w.lineare-iteration'], skill: 'interpretieren', difficulty: 2, origin: 'app',
    prompt: 'Richtig oder falsch?',
    statements: [
      ['Mit $B = A$ wäre die Iteration nach einem Schritt exakt, aber $Bc = r$ wäre so schwer wie das Ausgangsproblem.', true, 'Abbildung 7.2: rechtes Extrem.'],
      ['Mit $B = I$ wird die Kondition nicht verbessert.', true, 'Linkes Extrem.'],
      ['Für die Fehler gilt $e^{k+1} = (I - B^{-1}A)e^k$.', true, 'Wegen $r^k = Ae^k$.'],
      ['Fehler bei der Berechnung der Residuen über $r^{k+1} = r^k - Ac^k$ schaukeln sich auf.', false, 'Sie werden weggedämpft, da $I - AB^{-1}$ denselben Spektralradius hat (Bemerkung 47).'],
    ],
    hints: ['Was passiert für $B = A$ in einem Schritt?', 'Bemerkung 47.'],
    sources: [sk('103–105')],
  }),

  // ------------------------------------------------------------ Jacobi / GS
  mc({
    id: 'num.w.jacobi-gs.e1', chapterId: chI, formulaIds: ['num.w.jacobi-gs'], skill: 'abrufen', difficulty: 1, origin: 'klausur',
    prompt: 'Welche Vorkonditionierer gehören zu Jacobi- und Gauß-Seidel-Verfahren ($A = L + D + R$)?',
    options: opts('*Jacobi: $B = D$, Gauß-Seidel: $B = L + D$', ['Jacobi: $B = L + D$, Gauß-Seidel: $B = D$', 'Vertauscht.'], ['Jacobi: $B = D$, Gauß-Seidel: $B = D + R$', 'Gauß-Seidel nimmt den unteren Teil.'], ['Jacobi: $B = I$, Gauß-Seidel: $B = A$', 'Das sind die Extremfälle.']),
    hints: ['Gesamtschritt: nur die Diagonale.', 'Einzelschritt: bereits neue Komponenten (untere Dreiecksmatrix) verwenden.'],
    explanation: ['Beispiele 38 (a), (b).'],
    sources: [sk('104', 'Beispiele 38'), src('NUM-K-WS2021', '4', 'Aufgabe 6 c)')],
  }),
  numeric({
    id: 'num.w.jacobi-gs.e2', chapterId: chI, formulaIds: ['num.w.jacobi-gs'], skill: 'anwenden', difficulty: 2, origin: 'app',
    prompt: t`Jacobi-Verfahren für $\begin{pmatrix} 4 & 1 \\ 1 & 3 \end{pmatrix}x = \begin{pmatrix} 1 \\ 2 \end{pmatrix}$ mit $x^0 = (\tfrac14, \tfrac23)^\top$ (schon ein Schritt gemacht). Berechne die erste Komponente $x^2_1$ des nächsten Schritts.`,
    answer: 1 / 12, fmt: fmt.num(4),
    wrong: [{ value: 5 / 48, explanation: 'Das wäre Gauß-Seidel mit dem neuen $x_2$. Jacobi verwendet nur alte Werte.' }],
    hints: ['$x^{k+1}_1 = (b_1 - a_{12}x^k_2)/a_{11}$.', '$(1 - 2/3)/4$'],
    explanation: ['$x^2_1 = \\tfrac{1/3}{4} = \\tfrac1{12} \\approx 0{,}0833$.'],
    sources: [sk('104', 'Beispiele 38 (a)')],
  }),
  numeric({
    id: 'num.w.jacobi-gs.e3', chapterId: chI, formulaIds: ['num.w.jacobi-gs'], skill: 'anwenden', difficulty: 2, origin: 'app',
    prompt: t`Gauß-Seidel-Verfahren für $\begin{pmatrix} 4 & 1 \\ 1 & 3 \end{pmatrix}x = \begin{pmatrix} 1 \\ 2 \end{pmatrix}$ mit $x^0 = 0$. Berechne $x^1_2$ (4 Nachkommastellen).`,
    answer: 7 / 12, fmt: fmt.num(4),
    wrong: [{ value: 2 / 3, explanation: 'Das wäre Jacobi. Gauß-Seidel verwendet das schon neue $x^1_1 = 1/4$.' }],
    hints: ['Zuerst $x^1_1 = (1 - 0)/4$.', '$x^1_2 = (2 - x^1_1)/3$'],
    explanation: ['$x^1_1 = \\tfrac14$, $x^1_2 = \\tfrac{2 - 1/4}{3} = \\tfrac7{12} \\approx 0{,}5833$.'],
    sources: [sk('104', 'Beispiele 38 (b)')],
  }),
  trueFalse({
    id: 'num.w.jacobi-gs.e4', chapterId: chI, formulaIds: ['num.w.jacobi-gs'], skill: 'interpretieren', difficulty: 2, origin: 'tutorium',
    prompt: 'Richtig oder falsch?',
    statements: [
      ['Ist A strikt diagonaldominant, konvergieren Jacobi und Gauß-Seidel für jeden Startwert.', true, 'Satz 34.'],
      ['Ist A nicht strikt diagonaldominant, divergiert das Jacobi-Verfahren.', false, 'Die Bedingung ist nur hinreichend.'],
      ['Es gibt Matrizen, für die Jacobi konvergiert, Gauß-Seidel aber nicht.', true, 'Übungsblatt 7, Aufgabe 1 c).'],
      ['Beim Jacobi-Verfahren lassen sich die Komponenten parallel berechnen.', true, 'Sie hängen nur von alten Werten ab.'],
    ],
    hints: ['Hinreichend vs. notwendig.', 'Übungsblatt 7: $\\rho_J = 0{,}5$, $\\rho_{GS} \\approx 2{,}5$.'],
    sources: [sk('104–105'), src('NUM-UB07', '1–2', 'Aufgabe 1 c)')],
  }),

  // ------------------------------------------------------------ cg
  mc({
    id: 'num.w.cg.e1', chapterId: chI, formulaIds: ['num.w.cg'], skill: 'abrufen', difficulty: 1, origin: 'klausur',
    prompt: 'Welches Funktional minimiert das cg-Verfahren, und welche Voraussetzung braucht A?',
    options: opts(t`*$\Phi(x) = \tfrac12 x^\top Ax - x^\top b$, A symmetrisch positiv definit`, [t`$\Phi(x) = \|Ax - b\|_2^2$, A beliebig regulär`, 'Das ist das Ausgleichsproblem.'], [t`$\Phi(x) = x^\top Ax - b$, A symmetrisch`, 'Faktor ½ und Skalarprodukt mit b fehlen; außerdem braucht es positive Definitheit.'], [t`$\Phi(x) = \tfrac12 x^\top Ax + x^\top b$, A spd`, 'Vorzeichen: Gradient muss $Ax - b$ sein.']),
    hints: ['Gradient von Φ muss $(Ax - b)^\\top$ sein.', 'Damit es ein eindeutiges Minimum gibt, muss die Hesse-Matrix positiv definit sein.'],
    explanation: ['Satz 35: Minimum von Φ ⇔ $Ax = b$ für spd A.'],
    sources: [sk('105', 'Satz 35'), src('NUM-K-WS1718', '1', 'Aufgabe 2 (a), (b)')],
  }),
  numeric({
    id: 'num.w.cg.e2', chapterId: chI, formulaIds: ['num.w.cg'], skill: 'anwenden', difficulty: 2, origin: 'app',
    prompt: t`cg für $\begin{pmatrix} 4 & 1 \\ 1 & 3 \end{pmatrix}x = \begin{pmatrix} 1 \\ 2 \end{pmatrix}$ mit $x^0 = 0$. Berechne die erste Schrittweite $\alpha_0$.`,
    answer: 0.25, fmt: fmt.num(4),
    hints: ['$d^0 = r^0 = b = (1, 2)^\\top$, $Ad^0 = (6, 7)^\\top$.', '$\\alpha_0 = \\dfrac{\\langle r^0, r^0\\rangle}{\\langle d^0, Ad^0\\rangle} = \\dfrac{5}{6 + 14}$'],
    explanation: ['$\\alpha_0 = 5/20 = 0{,}25$, also $x^1 = (0{,}25;\\ 0{,}5)^\\top$.'],
    sources: [sk('108', 'Algorithmus')],
  }),
  numeric({
    id: 'num.w.cg.e3', chapterId: chI, formulaIds: ['num.w.cg'], skill: 'anwenden', difficulty: 2, origin: 'tutorium',
    prompt: t`Im cg-Verfahren für $A = \begin{pmatrix} 1 & 1 \\ 1 & 2 \end{pmatrix}$ ist $\langle r^0, r^0\rangle = 5$ und $\langle r^1, r^1\rangle = \tfrac54$. Berechne $\beta_0$.`,
    answer: 0.25, fmt: fmt.num(4),
    wrong: [{ value: 4, explanation: 'Kehrwert: das neue Residuum steht im Zähler.' }],
    hints: ['$\\beta_k = \\langle r^{k+1}, r^{k+1}\\rangle / \\langle r^k, r^k\\rangle$.', '$\\tfrac{5/4}{5}$'],
    explanation: ['$\\beta_0 = \\tfrac14$.'],
    sources: [src('NUM-UB07', '2–3', 'Aufgabe 3 mit Lösung')],
  }),
  trueFalse({
    id: 'num.w.cg.e4', chapterId: chI, formulaIds: ['num.w.cg'], skill: 'interpretieren', difficulty: 2, origin: 'klausur',
    prompt: 'Richtig oder falsch?',
    statements: [
      ['$\\alpha_k$ wird so gewählt, dass Φ entlang der Suchrichtung $d^k$ minimal wird.', true, '$\\varphi\'(\\alpha_k) = 0$.'],
      ['Die neue Suchrichtung ist A-orthogonal zur alten.', true, '$\\langle d^{k+1}, d^k\\rangle_A = 0$, daher „konjugierte“ Gradienten.'],
      ['Der Hauptaufwand pro Schritt ist eine Matrix-Matrix-Multiplikation.', false, 'Ein Matrix-Vektor-Produkt $Ad^k$.'],
      ['Multipliziert man A und b mit λ > 0, ändern sich die Iterierten $x^k$ nicht.', true, 'SS24, Aufgabe 5 d).'],
    ],
    hints: ['Was wird in einem cg-Schritt minimiert?', 'Wie oft braucht man A pro Schritt?'],
    sources: [sk('106–108'), src('NUM-K-SS24', '3', 'Aufgabe 5')],
  }),

  // ------------------------------------------------------------ cg-Konvergenz
  mc({
    id: 'num.w.cg-konvergenz.e1', chapterId: chI, formulaIds: ['num.w.cg-konvergenz'], skill: 'abrufen', difficulty: 2, origin: 'klausur',
    prompt: 'A ist spd und hat nur 3 verschiedene Eigenwerte. Nach wie vielen Schritten liefert cg (in exakter Arithmetik) die Lösung?',
    options: opts('*Nach höchstens 3 Schritten.', ['Nach genau N Schritten.', 'N ist nur die allgemeine Obergrenze.'], ['Nach einem Schritt.', 'Nur bei einem einzigen Eigenwert ($A = \\lambda I$).'], ['Gar nicht exakt, nur näherungsweise.', 'In exakter Arithmetik schon.']),
    hints: ['Polynom $q$ mit $q(0) = 1$ und Nullstellen in den Eigenwerten.', 'Welchen Grad hat es?'],
    explanation: ['$q_3(x) = \\prod_{m=1}^3(1 - x/\\lambda_m)$ verschwindet auf dem Spektrum ⇒ Fehler nach 3 Schritten 0 (Bemerkung 51).'],
    sources: [sk('109', 'Satz 37, Bemerkung 51'), src('NUM-K-SS26', '8', 'Aufgabe 6 c)')],
  }),
  mc({
    id: 'num.w.cg-konvergenz.e2', chapterId: chI, formulaIds: ['num.w.cg-konvergenz'], skill: 'auswaehlen', difficulty: 2, origin: 'klausur',
    prompt: 'Welches Spektrum von A ist für schnelle Konvergenz des cg-Verfahrens am günstigsten?',
    options: opts('*Wenige schmale Cluster, weit voneinander und von 0 entfernt.', ['Viele gleichmäßig verteilte Eigenwerte.', 'Dann braucht das Polynom hohen Grad.'], ['Ein sehr großer und ein sehr kleiner Eigenwert, sonst egal.', 'Große Kondition ist ungünstig.'], ['Eigenwerte nahe bei 0.', 'Dann ist $q(0) = 1$ schwer mit kleinen Werten auf dem Spektrum vereinbar.']),
    hints: ['Satz 37: Polynom klein auf dem Spektrum, $q(0) = 1$.', 'Übungsblatt 7, Aufgabe 2 c).'],
    explanation: ['Polynom mit Nullstellen in den Clustermitten: klein auf schmalen Clustern; wenige Cluster ⇒ kleiner Grad.'],
    sources: [sk('109', 'Bemerkung 51'), src('NUM-UB07', '2', 'Aufgabe 2 c)'), src('NUM-K-SS26', '8', 'Aufgabe 6 d)')],
  }),
  trueFalse({
    id: 'num.w.cg-konvergenz.e3', chapterId: chI, formulaIds: ['num.w.cg-konvergenz'], skill: 'interpretieren', difficulty: 2, origin: 'vorlesung',
    prompt: 'Richtig oder falsch?',
    statements: [
      ['Beim vorkonditionierten cg-Verfahren wird $\\tilde A = C^{-1}AC^{-\\top}$ explizit berechnet.', false, 'Viel zu teuer; man löst pro Schritt $Ms = r$.'],
      ['Für die Normalengleichung braucht cg pro Schritt zwei Matrix-Vektor-Produkte ($Ad$, dann $A^\\top(Ad)$).', true, 'Abschnitt 7.2.4.'],
      ['$\\mathrm{cond}_2(A^\\top A) = \\mathrm{cond}_2(A)^2$.', true, 'Deshalb ist die Normalengleichung heikel.'],
      ['Satz 36 (exakt nach N Schritten) ist für große Probleme der wichtigste Grund, cg zu verwenden.', false, 'Rundungsfehler und großes N; man hofft auf brauchbare Näherungen für $k \\ll N$.'],
    ],
    hints: ['Bemerkungen 49 1) und 53.', 'Was ist bei der Vorkonditionierung pro Schritt zu lösen?'],
    sources: [sk('108–111')],
  }),
  numeric({
    id: 'num.cg-faktor.e1', chapterId: chI, formulaIds: ['num.cg-faktor'], skill: 'einsetzen', difficulty: 1, origin: 'app',
    prompt: 'A spd mit $\\lambda_{\\min} = 1$ und $\\lambda_{\\max} = 100$. Berechne den Kontraktionsfaktor $c = \\dfrac{\\sqrt\\kappa - 1}{\\sqrt\\kappa + 1}$.',
    answer: 9 / 11, fmt: fmt.num(4),
    wrong: [{ value: 99 / 101, explanation: 'κ statt √κ eingesetzt.' }],
    hints: ['$\\kappa = 100$', '$\\sqrt\\kappa = 10$'],
    explanation: ['$c = 9/11 \\approx 0{,}8182$.'],
    sources: [sk('109', 'Satz 38')],
  }),
  numeric({
    id: 'num.cg-faktor.e2', chapterId: chI, formulaIds: ['num.cg-faktor'], skill: 'anwenden', difficulty: 2, origin: 'app',
    prompt: 'Ein Vorkonditionierer senkt die Kondition von $\\kappa = 10^4$ auf $\\tilde\\kappa = 16$. Wie groß ist der Kontraktionsfaktor danach?',
    answer: 0.6, fmt: fmt.num(4),
    hints: ['$\\sqrt{16} = 4$', '$(4 - 1)/(4 + 1)$'],
    explanation: ['$c = 3/5 = 0{,}6$ statt $99/101 \\approx 0{,}98$ ohne Vorkonditionierung.'],
    sources: [sk('109–111', 'Satz 38, Bemerkungen 53 3)')],
  }),

  // ======================================================== Papier-Aufgaben
  paper({
    id: 'num.p.ss17-6c', chapterId: chE, formulaIds: ['num.w.vektoriteration', 'num.w.inverse-iteration'], difficulty: 2, origin: 'klausur', estMinutes: 6, status: 'abgeleitet',
    prompt: t`**Klausur SoSe 2017, Aufgabe 6 (c)** · Sei $A \in \mathbb{R}^{N \times N}$ symmetrisch mit Eigenwerten $\lambda_1 > \dots > \lambda_N > 0$. Nenne eine Iterationsvorschrift, um
(i) den Eigenvektor zum größten Eigenwert von A,
(ii) den Eigenvektor zum kleinsten Eigenwert von A
zu berechnen. Gehe kurz auf den Aufwand der Iterationen ein.`,
    hints: ['(i) Welcher Eigenwert wird bei wiederholter Multiplikation dominant?', '(ii) Kleinster Eigenwert von A = größter von $A^{-1}$.', 'Aufwand: Was kostet ein Schritt, was nur einmal?'],
    modelAnswer: [
      t`(i) Vektoriteration: $y^0 = x^0/\|x^0\|_2$, $x^{k+1} = Ay^k$, $y^{k+1} = x^{k+1}/\|x^{k+1}\|_2$. Da alle Eigenwerte positiv sind, ist $\lambda_1$ betragsgrößter Eigenwert. Aufwand pro Schritt: ein Matrix-Vektor-Produkt, $N^2$ (dünnbesetzt weniger).`,
      t`(ii) Inverse Iteration: $Ax^{k+1} = y^k$ lösen, $y^{k+1} = x^{k+1}/\|x^{k+1}\|_2$. Konvergiert gegen den Eigenvektor zu $\lambda_N$, weil $1/\lambda_N$ der größte Eigenwert von $A^{-1}$ ist.`,
      t`Aufwand (ii): einmal eine LR- bzw. Cholesky-Zerlegung ($\tfrac13 N^3$ bzw. $\tfrac16 N^3$), danach pro Schritt Vorwärts- und Rückwärtssubstitution ($N^2$). $A^{-1}$ wird nie berechnet.`,
    ],
    keywords: ['Vektoriteration', 'x^{k+1} = A y^k, normieren', 'inverse Iteration', 'A x^{k+1} = y^k', 'LR einmal, dann N²'],
    statusNote: 'Für diese Klausur liegt keine Lösung vor; Musterlösung nach Skript Abschnitt 6.1.',
    sources: [src('NUM-K-SS17', '3', 'Aufgabe 6 (c)'), sk('90–91')],
  }),
  paper({
    id: 'num.p.ws1920-6c', chapterId: chE, formulaIds: ['num.w.inverse-iteration'], difficulty: 1, origin: 'klausur', estMinutes: 4, status: 'abgeleitet',
    prompt: t`**Klausur WiSe 2019/20, Aufgabe 6 (c)** · Formuliere die inverse Vektoriteration (ohne Shift) als Algorithmus und erkläre kurz, was durch diese Iteration berechnet wird.`,
    hints: ['Gleiches Schema wie die Vektoriteration, nur mit $A^{-1}$.', 'Die Inverse wird nicht berechnet.'],
    modelAnswer: [
      t`1. Wähle $x^0 \neq 0$, setze $y^0 = x^0/\|x^0\|_2$, $k = 0$ (und berechne einmal eine LR-Zerlegung von A).`,
      t`2. Löse $Ax^{k+1} = y^k$ (Vorwärts- und Rückwärtssubstitution).`,
      t`3. Setze $y^{k+1} = x^{k+1}/\|x^{k+1}\|_2$, erhöhe k und gehe zu 2.`,
      t`Berechnet wird (für symmetrisches reguläres A mit einfachem betragskleinsten Eigenwert $\lambda_N$) ein Eigenvektor zu $\lambda_N$; den Eigenwert liefert der Rayleigh-Quotient $(y^k)^\top Ay^k$.`,
    ],
    keywords: ['A x^{k+1} = y^k', 'normieren', 'LR einmal', 'betragskleinster Eigenwert'],
    statusNote: 'Offizielle Lösung nur als Scan vorhanden; Musterlösung nach Skript Abschnitt 6.1.1.',
    sources: [src('NUM-K-WS1920', '4', 'Aufgabe 6 (c)'), sk('91')],
  }),
  paper({
    id: 'num.p.ss19-4', chapterId: chE, formulaIds: ['num.w.inverse-iteration', 'num.w.qr-algorithmus'], difficulty: 2, origin: 'klausur', estMinutes: 8, status: 'abgeleitet',
    prompt: t`**Klausur SoSe 2019, Aufgabe 4 (Lückentext)** · Ergänze die Lücken (a)–(j):
Sei $A \in \mathbb{R}^{N \times N}$ mit reellen einfachen Eigenwerten. Die Eigenwerte lassen sich über die Nullstellen des **(a)** bestimmen, wobei eine solche Nullstellenbestimmung im Allgemeinen **(b)** ist. Mit der Vektoriteration kann im Fall $A = A^\top$ ein Eigenvektor berechnet werden, der zum Eigenwert **(c)** gehört. Für einen beliebigen anderen Eigenwert $\lambda_n$ verwendet man die **(d)**, dazu benötigt man aber eine **(e)** von $\lambda_n$.
Beim QR-Algorithmus ist die QR-Zerlegung $A_k = Q_kR_k$ und die Berechnung von $A_{k+1} =$ **(f)** sehr teuer, daher transformiert man A zunächst in **(g)**. Dadurch sinkt der Aufwand im Allgemeinen auf **(h)** und im symmetrischen Fall auf **(i)** Operationen. Da die Konvergenz langsam sein kann, verwendet man **(j)**.`,
    hints: ['(a), (b): Warum rechnet man Eigenwerte nicht so aus?', '(d), (e): inverse Iteration mit Shift.', '(h), (i): Satz 31 und Bemerkung 44.'],
    modelAnswer: [
      '(a) charakteristischen Polynoms $p_A(\\lambda) = \\det(A - \\lambda I)$, (b) schlecht konditioniert',
      '(c) betragsgrößten (einfachen) Eigenwert $\\lambda_1$',
      '(d) inverse Iteration mit Shift (auf $A - \\lambda^*I$), (e) gute Schätzung (Approximation)',
      '(f) $R_kQ_k$, (g) Hessenbergform (symmetrisch: Tridiagonalform)',
      '(h) $O(N^2)$, (i) $O(N)$',
      '(j) einen Shift (z. B. $\\mu_k = h_{NN}^{(k)}$)',
    ],
    keywords: ['charakteristisches Polynom', 'schlecht konditioniert', 'betragsgrößter EW', 'inverse Iteration mit Shift', 'R_kQ_k', 'Hessenberg', 'O(N²) / O(N)', 'Shift'],
    statusNote: 'Für diese Klausur liegt keine Lösung vor; Lücken nach Skript Kapitel 6 ergänzt.',
    sources: [src('NUM-K-SS19', '3', 'Aufgabe 4'), sk('89–96')],
  }),
  paper({
    id: 'num.p.ws2425-3c', chapterId: chE, formulaIds: ['num.w.qr-algorithmus'], difficulty: 3, origin: 'klausur', estMinutes: 15,
    prompt: t`**Klausur WiSe 2024/25, Aufgabe 3 (c)** · Gegeben sei
$$A = \begin{pmatrix} 1 & -4 & 3 \\ -4 & 3 & 0 \\ 3 & 0 & 3 \end{pmatrix}.$$
Transformiere A in Hessenbergform, sodass sich die Eigenwerte nicht ändern. Gib alle verwendeten Transformationen explizit an. Hinweis: Nutze die Struktur von A, um unnötige Rechnungen zu vermeiden.`,
    hints: ['Eine Householder-Transformation $\\tilde Q$ für den Vektor $(-4, 3)^\\top$ (untere Komponenten der ersten Spalte).', 'Auslöschungsfrei: erste Komponente −4 < 0 ⇒ σ = +5.', 'A ist symmetrisch ⇒ H tridiagonal; und $A[2{:}3, 2{:}3] = 3I_2$.'],
    modelAnswer: [
      t`Untere Komponenten der ersten Spalte: $a = (-4, 3)^\top$, $\|a\|_2 = 5$. Wegen $a_1 < 0$: $\sigma = +5$, $\tilde w = \dfrac{a - 5e^1}{\|a - 5e^1\|_2} = \dfrac{1}{\sqrt{90}}(-9, 3)^\top$.`,
      t`$\tilde Q = I_2 - 2\tilde w\tilde w^\top = I_2 - \tfrac{1}{45}\begin{pmatrix} 81 & -27 \\ -27 & 9 \end{pmatrix} = \tfrac15\begin{pmatrix} -4 & 3 \\ 3 & 4 \end{pmatrix}$, Probe: $\tilde Q a = (5, 0)^\top$.`,
      t`$Q = \begin{pmatrix} 1 & 0^\top \\ 0 & \tilde Q \end{pmatrix}$, $Q = Q^\top = Q^{-1}$.`,
      t`Struktur nutzen: $H = QAQ = \begin{pmatrix} 1 & (\tilde Q a)^\top \\ \tilde Q a & \tilde Q (3I_2)\tilde Q \end{pmatrix} = \begin{pmatrix} 1 & 5 & 0 \\ 5 & 3 & 0 \\ 0 & 0 & 3 \end{pmatrix}$.`,
      'H ist symmetrisch und tridiagonal (sogar reduzibel: der Eigenwert 3 ist sofort abzulesen) und ähnlich zu A, hat also dieselben Eigenwerte.',
    ],
    keywords: ['a = (−4, 3)ᵀ', 'σ = 5', 'Q̃ = ⅕[[−4, 3], [3, 4]]', 'H = QAQ', 'H = [[1, 5, 0], [5, 3, 0], [0, 0, 3]]'],
    sources: [src('NUM-K-WS2425', '2', 'Aufgabe 3 (c) mit Lösungsskizze')],
  }),
  paper({
    id: 'num.p.ss26-5c', chapterId: chE, formulaIds: ['num.w.qr-algorithmus'], difficulty: 1, origin: 'klausur', estMinutes: 3,
    prompt: t`**Klausur SoSe 2026, Aufgabe 5 (c)** · In Aufgabe 5 a), b) wurde für eine Tridiagonalmatrix T die Householder-Transformation $Q_1$ bestimmt, die die erste Spalte $t^1$ auf ein Vielfaches von $e^1$ abbildet; sie hat die Struktur $Q_1 = \begin{pmatrix} * & * & \\ * & * & \\ & & I_{N-2} \end{pmatrix}$. Erkläre kurz den Bezug zur Eigenwertberechnung.`,
    hints: ['Wo tauchen Tridiagonalmatrizen beim Berechnen von Eigenwerten auf?', 'Was passiert dann in jedem Schritt mit der Tridiagonalmatrix?'],
    modelAnswer: [
      'Beim QR-Algorithmus wird A zuerst durch eine Ähnlichkeitstransformation auf Hessenbergform $H = Q^\\top AQ$ gebracht; für symmetrisches A ist das eine Tridiagonalmatrix.',
      'In jedem Schritt des QR-Algorithmus wird diese Tridiagonalmatrix QR-zerlegt. Die erste Householder-Matrix $Q_1$ hat dabei genau die Struktur aus b), wirkt also nur auf zwei Zeilen; deshalb ist ein Schritt so billig.',
    ],
    keywords: ['QR-Algorithmus', 'Hessenberg/Tridiagonal', 'Ähnlichkeitstransformation', 'Q₁ wirkt auf 2 Zeilen'],
    sources: [src('NUM-K-SS26', '7', 'Aufgabe 5 c) mit Lösungsskizze')],
  }),
  paper({
    id: 'num.p.ws2021-4', chapterId: chE, formulaIds: ['num.w.qr-shift', 'num.w.qr-algorithmus'], difficulty: 2, origin: 'klausur', estMinutes: 8,
    prompt: t`**Klausur WiSe 2020/21, Aufgabe 4 (Lückentext)** · Ergänze die Lücken (a)–(j):
Beim QR-Algorithmus wird A zunächst durch **(a)** viele Householder-Transformationen auf Hessenbergform $H = Q^\top AQ$ gebracht. Dazu sind im Allgemeinen **(b)** Operationen notwendig; unter einer Operation verstehen wir **(c)**. Ist A symmetrisch, so ist H eine **(d)**.
Mit Shift µ wird in einem Schritt die QR-Zerlegung von **(e)** und damit $\bar H =$ **(f)** berechnet. Ist H irreduzibel und µ ein Eigenwert von H, so gilt $(e^N)^\top \bar H =$ **(g)**. Mit $\mu = h_{NN}$ liegt im Allgemeinen quadratische Konvergenz vor; das bedeutet, dass aus **(h)** die Darstellung $\bar h_{N,N-1} =$ **(i)** folgt. Bei quadratischer Konvergenz wird sich die Anzahl richtiger Nachkommastellen ungefähr **(j)**.`,
    hints: ['(a) Für Hessenberg braucht man eine Transformation weniger als für QR.', '(g) Satz 32.', '(h), (i): Was wird aus δ?'],
    modelAnswer: [
      '(a) $N - 2$, (b) $O(N^3)$ (genauer $\\tfrac53N^3$), (c) eine Addition plus eine Multiplikation, (d) Tridiagonalmatrix',
      '(e) $H - \\mu I_N = QR$, (f) $RQ + \\mu I_N$',
      '(g) $(0, \\dots, 0, \\mu)$',
      '(h) $h_{N,N-1} = \\delta$, (i) $O(\\delta^2)$',
      '(j) verdoppeln',
    ],
    keywords: ['N − 2', 'O(N³)', 'Tridiagonalmatrix', 'H − µI = QR', 'RQ + µI', '(0, …, 0, µ)', 'δ → O(δ²)', 'verdoppelt'],
    sources: [src('NUM-K-WS2021', '3', 'Aufgabe 4 mit Lösungsskizze')],
  }),
  paper({
    id: 'num.p.ws2021-6c', chapterId: chI, formulaIds: ['num.w.lineare-iteration', 'num.w.jacobi-gs'], difficulty: 1, origin: 'klausur', estMinutes: 4,
    prompt: t`**Klausur WiSe 2020/21, Aufgabe 6 (c)** · Formuliere die Fixpunktiteration einer allgemeinen linearen Iteration und gib den Vorkonditionierer B konkret für das Jacobi- und das Gauß-Seidel-Verfahren an. Definiere auftretende Größen.`,
    hints: ['Residuum $r^k = b - Ax^k$.', 'Zerlegung $A = L + D + R$.'],
    modelAnswer: [
      t`$x^{k+1} = x^k + B^{-1}r^k$ mit dem Residuum $r^k = b - Ax^k$ und einem regulären Vorkonditionierer B (in der Praxis: $Bc^k = r^k$ lösen, $x^{k+1} = x^k + c^k$).`,
      t`Zerlege $A = L + D + R$ mit strikt unterer Dreiecksmatrix L, Diagonalmatrix D und strikt oberer Dreiecksmatrix R.`,
      t`Jacobi: $B = D$. Gauß-Seidel: $B = L + D$.`,
    ],
    keywords: ['x^{k+1} = x^k + B⁻¹r^k', 'r^k = b − Ax^k', 'A = L + D + R', 'Jacobi B = D', 'GS B = L + D'],
    sources: [src('NUM-K-WS2021', '4', 'Aufgabe 6 (c) mit Lösungsskizze')],
  }),
  paper({
    id: 'num.p.ws1920-5', chapterId: chI, formulaIds: ['num.w.lineare-iteration', 'num.w.jacobi-gs'], difficulty: 2, origin: 'klausur', estMinutes: 8, status: 'abgeleitet',
    prompt: t`**Klausur WiSe 2019/20, Aufgabe 5 (Lückentext)** · Ergänze die Lücken (a)–(j):
Wir verwenden iterative Verfahren zum Lösen von $Ax = b$, wenn die Lösung nicht exakt berechnet werden muss oder N **(a)** und A **(b)** ist. Zusätzlich gibt es bei direkten Verfahren wie LR- und Cholesky-Zerlegung die Problematik des **(c)**, sodass die Faktoren zu viel Speicherplatz benötigen. Allgemeine lineare Iterationen sind durch die Fixpunktgleichung **(d)** definiert. Konvergenz für beliebigen Startvektor liegt vor, falls **(e)** gilt. Als Vorkonditionierer wird beim Jacobi-Verfahren **(f)** und beim Gauß-Seidel-Verfahren **(g)** gewählt, wobei A folgendermaßen zerlegt ist: **(h)**. Aber auch die **(i)** von A kann als Vorkonditionierer dienen. Die Hauptidee ist, dass **(j)** leichter gelöst werden kann als das ursprüngliche System $Ax = b$.`,
    hints: ['(c) Was passiert mit den Nullen in den Faktoren?', '(e) Satz 33.', '(i) Beispiele 38 (c).'],
    modelAnswer: [
      '(a) sehr groß, (b) dünnbesetzt, (c) Fill-in',
      '(d) $x = x + B^{-1}(b - Ax)$ bzw. $x = (I - B^{-1}A)x + B^{-1}b$',
      '(e) $\\rho(I_N - B^{-1}A) < 1$',
      '(f) $B = D$, (g) $B = L + D$, (h) $A = L + D + R$ (strikt unten, Diagonale, strikt oben)',
      '(i) unvollständige LR-Zerlegung',
      '(j) das Gleichungssystem $Bc = r$',
    ],
    keywords: ['sehr groß', 'dünnbesetzt', 'Fill-in', 'x = x + B⁻¹(b − Ax)', 'ρ(I − B⁻¹A) < 1', 'D / L + D', 'unvollständige LR', 'Bc = r'],
    statusNote: 'Offizielle Lösung nur als Scan vorhanden; Lücken nach Skript Abschnitt 7.1 ergänzt.',
    sources: [src('NUM-K-WS1920', '4', 'Aufgabe 5'), sk('102–105')],
  }),
  paper({
    id: 'num.p.ub7-1', chapterId: chI, formulaIds: ['num.w.jacobi-gs', 'num.w.lineare-iteration'], difficulty: 3, origin: 'tutorium', estMinutes: 25,
    prompt: t`**Übungsblatt 7, Aufgabe 1** · Sei $Ax = b$ mit regulärem A und Lösung $x^*$.
(a) Sei $f^k = x^* - x^k$ der Fehler einer allgemeinen linearen Iteration mit Vorkonditionierer B. Leite einen Zusammenhang zwischen $f^k$ und $f^{k-1}$ her.
(b) Es gelte $\rho(I_N - B^{-1}A) < 1$. Verwende ohne Beweis, dass dann eine Norm mit $\|I_N - B^{-1}A\| \le \theta < 1$ existiert, und zeige die lineare Konvergenz.
(c) Für $A = \begin{pmatrix} 2 & 1 & 4 \\ 1 & 2 & -4 \\ 4 & 4 & 2 \end{pmatrix}$ zeige: (i) Das Jacobi-Verfahren konvergiert. (ii) Das Gauß-Seidel-Verfahren konvergiert im Allgemeinen nicht.`,
    hints: ['(a) $x^*$ ist Fixpunkt: $x^* = (I - B^{-1}A)x^* + B^{-1}b$.', '(c)(i) $B = 2I$, $I - B^{-1}A$ hat charakteristisches Polynom $-x(x^2 - \\tfrac14)$.', '(c)(ii) $B = L + D$; einen Eigenwert mit Betrag > 1 finden und als Startfehler einen Eigenvektor wählen.'],
    modelAnswer: [
      t`(a) $x^* = (I - B^{-1}A)x^* + B^{-1}b$ und $x^k = (I - B^{-1}A)x^{k-1} + B^{-1}b$. Subtrahieren: $f^k = (I - B^{-1}A)f^{k-1}$.`,
      t`(b) $\|f^k\| \le \|I - B^{-1}A\|\,\|f^{k-1}\| \le \theta\|f^{k-1}\| \le \theta^k\|f^0\| \to 0$.`,
      t`(c)(i) Jacobi: $B = D = 2I$, $I - B^{-1}A = \begin{pmatrix} 0 & -\frac12 & -2 \\ -\frac12 & 0 & 2 \\ -2 & -2 & 0 \end{pmatrix}$. Charakteristisches Polynom $-x(x^2 - \tfrac14)$, Eigenwerte $0, \pm\tfrac12$ ⇒ $\rho = \tfrac12 < 1$ ⇒ Konvergenz.`,
      t`(c)(ii) Gauß-Seidel: $B = \begin{pmatrix} 2 & 0 & 0 \\ 1 & 2 & 0 \\ 4 & 4 & 2 \end{pmatrix}$, $I - B^{-1}A = \begin{pmatrix} 0 & -\frac12 & -2 \\ 0 & \frac14 & 3 \\ 0 & \frac12 & -2 \end{pmatrix}$.`,
      t`Charakteristisches Polynom $-x(x^2 + \tfrac74x - 2)$, Eigenwerte $0$ und $\tfrac{-7 \pm \sqrt{177}}{8}$; $\lambda = \tfrac{-7 - \sqrt{177}}{8} \approx -2{,}54$ ⇒ $\rho > 1$.`,
      t`Wählt man $x^0 = x^* - y$ mit einem Eigenvektor y zu λ, so ist $f^k = \lambda^k y$: Divergenz.`,
    ],
    keywords: ['f^k = (I − B⁻¹A) f^{k−1}', 'θ^k‖f⁰‖ → 0', 'ρ_J = ½', 'λ ≈ −2,54', 'Startfehler = Eigenvektor'],
    sources: [src('NUM-UB07', '1–2', 'Aufgabe 1 mit Lösung')],
  }),
  paper({
    id: 'num.p.ss26-2c', chapterId: chI, formulaIds: ['num.w.jacobi-gs'], difficulty: 2, origin: 'klausur', estMinutes: 10,
    prompt: t`**Klausur SoSe 2026, Aufgabe 2 c)** · Für die Spline-Matrix
$$A = \frac h6\begin{pmatrix} 2 & 1 & & & \\ 1 & 4 & 1 & & \\ & \ddots & \ddots & \ddots & \\ & & 1 & 4 & 1 \\ & & & 1 & 2 \end{pmatrix} \in \mathbb{R}^{N \times N},\ N \ge 3:$$
(i) Nenne den Vorkonditionierer des Jacobi-Verfahrens. (ii) Berechne die Matrix, die für die Konvergenz entscheidend ist. (iii) Nenne die hinreichende Bedingung für Konvergenz. (iv) Folgere die Konvergenz mit dem Satz von Gerschgorin: Jeder Eigenwert von M liegt in einer Kreisscheibe $K_n = \{z : |z - m_{nn}| \le \sum_{k \neq n}|m_{nk}|\}$.`,
    hints: ['(i) Diagonale von A.', '(ii) $I - B^{-1}A$: Diagonale 0, Nebendiagonalen $-a_{nm}/a_{nn}$.', '(iv) Mittelpunkte 0, Radien höchstens ½.'],
    modelAnswer: [
      t`(i) $B = \mathrm{diag}(A) = \tfrac h6\,\mathrm{diag}(2, 4, \dots, 4, 2)$.`,
      t`(ii) $I - B^{-1}A$ hat Diagonale 0; erste Zeile $(0, -\tfrac12, 0, \dots)$, letzte Zeile $(\dots, 0, -\tfrac12, 0)$, innere Zeilen $-\tfrac14$ auf beiden Nebendiagonalen.`,
      t`(iii) $\rho(I - B^{-1}A) < 1$ (oder hinreichend: A strikt diagonaldominant).`,
      t`(iv) Alle Kreismittelpunkte sind $m_{nn} = 0$, alle Radien gleich $\tfrac12$ (erste/letzte Zeile: $\tfrac12$, innere: $\tfrac14 + \tfrac14$). Alle Eigenwerte liegen im Kreis um 0 mit Radius $\tfrac12$ ⇒ $\rho \le \tfrac12 < 1$ ⇒ Jacobi konvergiert.`,
    ],
    keywords: ['B = diag(A)', 'I − B⁻¹A', '−½ in Ecken, −¼ innen', 'ρ < 1', 'Gerschgorin: Radius ½'],
    sources: [src('NUM-K-SS26', '2–3', 'Aufgabe 2 c) mit Lösungsskizze')],
  }),
  paper({
    id: 'num.p.ss19-6e', chapterId: chI, formulaIds: ['num.w.jacobi-gs'], difficulty: 1, origin: 'klausur', estMinutes: 4, status: 'abgeleitet',
    prompt: t`**Klausur SoSe 2019, Aufgabe 6 (e)** · Formuliere die Fixpunktiteration des Jacobi-Verfahrens, erkläre dabei auftretende Größen und nenne eine hinreichende Bedingung für die Konvergenz.`,
    hints: ['Allgemeine lineare Iteration mit $B = D$.', 'Satz 34.'],
    modelAnswer: [
      t`$x^{k+1} = x^k + D^{-1}(b - Ax^k)$, komponentenweise $x^{k+1}_n = \dfrac{1}{a_{nn}}\Big(b_n - \sum_{m \neq n}a_{nm}x^k_m\Big)$.`,
      t`Dabei ist $D = \mathrm{diag}(a_{11}, \dots, a_{NN})$ (Diagonale von A, alle $a_{nn} \neq 0$) und $b - Ax^k$ das Residuum.`,
      'Hinreichend: A strikt diagonaldominant (oder allgemein $\\rho(I - D^{-1}A) < 1$).',
    ],
    keywords: ['x^{k+1} = x^k + D⁻¹(b − Ax^k)', 'D = Diagonale', 'strikt diagonaldominant'],
    statusNote: 'Für diese Klausur liegt keine Lösung vor; Musterlösung nach Skript Abschnitt 7.1.',
    sources: [src('NUM-K-SS19', '4', 'Aufgabe 6 (e)'), sk('104–105')],
  }),
  paper({
    id: 'num.p.ub7-3', chapterId: chI, formulaIds: ['num.w.cg'], difficulty: 2, origin: 'tutorium', estMinutes: 15,
    prompt: t`**Übungsblatt 7, Aufgabe 3** · Löse
$$\begin{pmatrix} 1 & 1 \\ 1 & 2 \end{pmatrix}x = \begin{pmatrix} 2 \\ -1 \end{pmatrix}$$
mit dem cg-Verfahren. Startvektor $x^0 = (0, 0)^\top$.`,
    hints: ['$d^0 = r^0 = b$.', '$Ad^k$ einmal berechnen und für α und für das neue Residuum verwenden.', 'Nach höchstens 2 Schritten muss $r = 0$ sein.'],
    modelAnswer: [
      t`$d^0 = r^0 = (2, -1)^\top$, $\|r^0\|_2^2 = 5$. $Ad^0 = (1, 0)^\top$, $\langle d^0, d^0\rangle_A = 2$ ⇒ $\alpha_0 = \tfrac52$.`,
      t`$x^1 = (5, -\tfrac52)^\top$, $r^1 = (2, -1)^\top - \tfrac52(1, 0)^\top = (-\tfrac12, -1)^\top$, $\langle r^1, r^1\rangle = \tfrac54$.`,
      t`$\beta_0 = \tfrac{5/4}{5} = \tfrac14$, $d^1 = (-\tfrac12, -1)^\top + \tfrac14(2, -1)^\top = (0, -\tfrac54)^\top$.`,
      t`$Ad^1 = (-\tfrac54, -\tfrac52)^\top$, $\langle d^1, d^1\rangle_A = \tfrac{25}{8}$ ⇒ $\alpha_1 = \tfrac{5/4}{25/8} = \tfrac25$.`,
      t`$x^2 = (5, -\tfrac52)^\top + \tfrac25(0, -\tfrac54)^\top = (5, -3)^\top$, $r^2 = (-\tfrac12, -1)^\top - \tfrac25(-\tfrac54, -\tfrac52)^\top = 0$. Lösung gefunden.`,
    ],
    keywords: ['α₀ = 5/2', 'x¹ = (5, −5/2)ᵀ', 'β₀ = 1/4', 'α₁ = 2/5', 'x² = (5, −3)ᵀ', 'r² = 0'],
    sources: [src('NUM-UB07', '2–3', 'Aufgabe 3 mit Lösung')],
  }),
  paper({
    id: 'num.p.ws1718-2', chapterId: chI, formulaIds: ['num.w.cg'], difficulty: 1, origin: 'klausur', estMinutes: 6,
    prompt: t`**Klausur WiSe 2017/18, Aufgabe 2 (Lückentext)** · Ergänze die Lücken (a)–(i):
Das cg-Verfahren löst $Ax = b$. Die notwendigen Voraussetzungen an A lauten **(a)**. Statt das LGS direkt zu lösen, wird $\Phi(x) =$ **(b)** minimiert. Die Hauptidee: Zu $x^k$ und $d^k \neq 0$, den **(c)**, wird $\alpha_k$ so berechnet, dass $\varphi(\alpha) = \Phi(x^k + \alpha d^k)$ minimal ist. Eine hinreichende Bedingung zur Bestimmung von $\alpha_k$ ist **(d)**. Die neue Näherung ist **(e)**. Theoretisch liefert das Verfahren nach **(f)** Schritten die exakte Lösung. Der Hauptaufwand liegt in der Berechnung von **(g)**. Durch **(h)** kann die Anzahl der Schritte verkleinert werden. Besonders gut geeignet ist cg für sehr große und/oder **(i)** Matrizen.`,
    hints: ['(d) Ableitung von φ.', '(g) Was braucht man pro Schritt mit A?'],
    modelAnswer: [
      '(a) symmetrisch, positiv definit; (b) $\\tfrac12x^\\top Ax - x^\\top b$; (c) Suchrichtungen',
      '(d) $\\varphi\'(\\alpha_k) = 0$ (zusammen mit $\\varphi\'\' > 0$); (e) $x^{k+1} = x^k + \\alpha_kd^k$',
      '(f) N; (g) $Ad^k$ (Matrix-Vektor-Produkt, $N^2$ Operationen); (h) Vorkonditionierung; (i) dünnbesetzte',
    ],
    keywords: ['spd', '½xᵀAx − xᵀb', 'Suchrichtungen', 'φ′(α) = 0', 'x^{k+1} = x^k + α_k d^k', 'N', 'Ad^k', 'Vorkonditionierung', 'dünnbesetzt'],
    sources: [src('NUM-K-WS1718', '1', 'Aufgabe 2 mit Lösung')],
  }),
  paper({
    id: 'num.p.ss24-5', chapterId: chI, formulaIds: ['num.w.cg'], difficulty: 3, origin: 'klausur', estMinutes: 20,
    prompt: t`**Klausur SoSe 2024, Aufgabe 5** · A spd, $x^*$ Lösung von $Ax = b$. Gegeben ist der cg-Algorithmus mit $\alpha_k = \langle r^k, r^k\rangle/\langle d^k, d^k\rangle_A$ und $\beta_k = \langle r^{k+1}, r^{k+1}\rangle/\langle r^k, r^k\rangle$.
(a) Gib Φ an, das minimiert wird, und erkläre den Zusammenhang zu $Ax = b$.
(b) Gib die Idee hinter $\alpha_k$ an und bestimme eine alternative Formel.
(c) Gib die Idee hinter $\beta_k$ an und bestimme eine alternative Formel.
(d) Für λ > 0 sei $\tilde A = \lambda A$, $\tilde b = \lambda b$, gleicher Startwert. Wie ändern sich $\tilde x^k, \tilde r^k, \tilde d^k$ beim Schritt von k = 0 auf k = 1? Vermutung für beliebiges k?
(e) Diskutiere das Stoppkriterium $\|r^k\| \le \varepsilon\|b\|$ im Hinblick auf (d).`,
    hints: ['(b) $\\varphi(\\alpha) = \\Phi(x^k + \\alpha d^k)$ ableiten.', '(c) $\\langle d^{k+1}, d^k\\rangle_A = 0$ fordern.', '(d) In α steht $\\lambda$ einmal im Zähler (zweimal) und einmal im Nenner (dreimal).'],
    modelAnswer: [
      t`(a) $\Phi(x) = \tfrac12x^\top Ax - x^\top b$. $\mathrm{grad}\,\Phi(x) = (Ax - b)^\top$, $\Phi'' = A$ spd ⇒ $x^*$ ist genau dann Minimum, wenn $Ax^* = b$.`,
      t`(b) Minimum entlang der Suchrichtung: $\varphi(\alpha) = \Phi(x^k) - \alpha\langle d^k, r^k\rangle + \tfrac12\alpha^2\langle d^k, d^k\rangle_A$, $\varphi'(\alpha) = 0$ ⇒ $\alpha_k = \dfrac{\langle d^k, r^k\rangle}{\langle d^k, d^k\rangle_A}$ (Minimum wegen $\varphi'' > 0$).`,
      t`(c) Neue Suchrichtung aus $r^{k+1}$ durch A-Orthogonalisierung: $0 = \langle r^{k+1} + \beta d^k, d^k\rangle_A$ ⇒ $\beta_k = -\dfrac{\langle r^{k+1}, d^k\rangle_A}{\langle d^k, d^k\rangle_A}$.`,
      t`(d) $\tilde d^0 = \tilde r^0 = \lambda r^0$, $\tilde\alpha_0 = \dfrac{\lambda^2\langle r^0, r^0\rangle}{\lambda^3\langle d^0, d^0\rangle_A} = \tfrac1\lambda\alpha_0$, $\tilde x^1 = x^0 + \tfrac1\lambda\alpha_0\lambda d^0 = x^1$, $\tilde r^1 = \lambda r^1$, $\tilde\beta_0 = \beta_0$, $\tilde d^1 = \lambda d^1$. Vermutung: $\tilde x^k = x^k$, $\tilde r^k = \lambda r^k$, $\tilde d^k = \lambda d^k$.`,
      t`(e) Iterierte und Lösung ändern sich nicht, das Residuum aber um den Faktor λ. Ein absolutes Kriterium $\|r^k\| \le \varepsilon$ würde also je nach Skalierung früher oder später stoppen. Mit $\varepsilon\|b\|$ kürzt sich λ heraus: Das Kriterium ist skalierungsinvariant.`,
    ],
    keywords: ['Φ = ½xᵀAx − xᵀb', 'φ′(α) = 0', 'A-Orthogonalisierung', 'x̃^k = x^k', 'r̃^k = λr^k', 'ε‖b‖: λ kürzt sich'],
    sources: [src('NUM-K-SS24', '3', 'Aufgabe 5 mit Lösungsskizze')],
  }),
  paper({
    id: 'num.p.ss20-6e', chapterId: chI, formulaIds: ['num.w.cg'], difficulty: 1, origin: 'klausur', estMinutes: 4, status: 'abgeleitet',
    prompt: t`**Klausur SoSe 2020, Aufgabe 6 (e)** · Beschreibe das Minimierungsproblem, das dem cg-Verfahren zugrunde liegt, und erkläre die Idee, wie aus der Iterierten $x^{k+1}$ und der alten Suchrichtung $d^k$ die neue Suchrichtung $d^{k+1}$ ermittelt wird.`,
    hints: ['Funktional Φ und der Zusammenhang zu $Ax = b$.', 'Residuum und A-Orthogonalität.'],
    modelAnswer: [
      t`Für spd A: $\Phi(x) = \tfrac12x^\top Ax - x^\top b = \min!$; das Minimum ist genau die Lösung von $Ax = b$.`,
      t`Neue Suchrichtung: Residuum $r^{k+1} = b - Ax^{k+1}$ (negativer Gradient von Φ) berechnen. Ist es 0, ist die Lösung gefunden. Sonst $r^{k+1}$ nach Gram-Schmidt bezüglich $\langle\cdot,\cdot\rangle_A$ gegen $d^k$ orthogonalisieren: $d^{k+1} = r^{k+1} + \beta_kd^k$ mit $\langle d^{k+1}, d^k\rangle_A = 0$.`,
    ],
    keywords: ['Φ = ½xᵀAx − xᵀb', 'Residuum = −Gradient', 'Gram-Schmidt bzgl. ⟨·,·⟩_A', 'd^{k+1} = r^{k+1} + β_k d^k'],
    statusNote: 'Offizielle Lösung nur als Scan vorhanden; Musterlösung nach Skript Abschnitt 7.2.1.',
    sources: [src('NUM-K-SS20', '4', 'Aufgabe 6 (e)'), sk('106–107')],
  }),
  paper({
    id: 'num.p.ss26-6', chapterId: chI, formulaIds: ['num.w.cg-konvergenz', 'num.w.cg'], difficulty: 3, origin: 'klausur', estMinutes: 20,
    prompt: t`**Klausur SoSe 2026, Aufgabe 6** · A spd, $x^*$ Lösung von $Ax = b$. Für die k-te cg-Iterierte gilt
$$\|x^* - x^k\|_A \le \max_{\lambda \in \sigma(A)}|p(\lambda)|\cdot\|x^* - x^0\|_A \quad (1)$$
für jedes Polynom p vom Grad k mit $p(0) = 1$.
(a) Gib das äquivalente Minimierungsproblem an und beweise die Äquivalenz (Hinweis: Gradient von $\tfrac12x^\top Ax$ ist $x^\top A$).
(b) Erläutere einen Schritt des cg-Verfahrens möglichst ohne Formeln.
(c) Sei $L = |\sigma(A)|$ die Anzahl verschiedener Eigenwerte. Zeige mit (1): cg liefert (exakte Arithmetik) nach höchstens L Schritten die Lösung.
(d) Erläutere mit einer Skizze anhand von (1), welche Eigenschaft des Spektrums für schnelle Konvergenz hilfreich ist.`,
    hints: ['(a) Gradient gleich 0 und Hesse-Matrix spd.', '(c) Lagrange-Polynom zu den Stützpunkten $(0, 1), (\\lambda_1, 0), \\dots, (\\lambda_L, 0)$.', '(d) Was passiert, wenn die Eigenwerte in wenigen schmalen Clustern liegen?'],
    modelAnswer: [
      t`(a) x löst $Ax = b$ ⇔ x löst $\Phi(x) = \tfrac12x^\top Ax - x^\top b = \min!$. Denn $\mathrm{grad}\,\Phi(x) = x^\top A - b^\top$ und $H_\Phi = A$ spd: Minimum genau dann, wenn der Gradient verschwindet, also $Ax = b$.`,
      '(b) (i) Start bei der aktuellen Iterierten und einer Suchrichtung ≠ 0. (ii) Die quadratische Funktion entlang dieser Richtung wird minimiert. (iii) Das Minimum ist die neue Iterierte. (iv) Residuum berechnen: Ist es 0, ist die Lösung gefunden; sonst daraus eine zur alten Suchrichtung A-orthogonale neue Suchrichtung bilden.',
      t`(c) Da A spd ist, sind $0, \lambda_1, \dots, \lambda_L$ paarweise verschiedene reelle Stützstellen. Das Lagrange-Polynom $q(x) = \prod_{m=1}^L\big(1 - \tfrac{x}{\lambda_m}\big)$ hat Grad L, $q(0) = 1$ und $q(\lambda_m) = 0$. In (1) mit $k = L$: $\|x^* - x^L\|_A \le 0$, also $x^L = x^*$.`,
      '(d) Günstig sind wenige Cluster mit kleiner Breite (und Abstand zu 0). Ein Polynom mit Wert 1 bei 0 und Nullstellen in den Clustermitten ist dann auf dem ganzen Spektrum klein: Die rechte Seite von (1) ist nicht 0, aber klein, schon für k = Anzahl der Cluster.',
    ],
    keywords: ['Φ = min! ⇔ Ax = b', 'Hesse-Matrix A spd', 'Minimum entlang Suchrichtung', 'A-orthogonale neue Richtung', 'q(x) = Π(1 − x/λ_m)', 'wenige schmale Cluster'],
    sources: [src('NUM-K-SS26', '8', 'Aufgabe 6 mit Lösungsskizze')],
  }),
  paper({
    id: 'num.p.ws2021-6d', chapterId: chI, formulaIds: ['num.w.cg-konvergenz'], difficulty: 1, origin: 'klausur', estMinutes: 4,
    prompt: t`**Klausur WiSe 2020/21, Aufgabe 6 (d)** · Berechne $\|x\|_A$ für $A = \mathrm{diag}(11, 11, 13) + ee^\top$ und $x = (1, -1, 1)^\top$, wobei $e = (1, 1, 1)^\top$.`,
    hints: ['$\\|x\\|_A^2 = x^\\top Ax = x^\\top Dx + (e^\\top x)^2$.', 'Man muss A nicht ausmultiplizieren.'],
    modelAnswer: [
      t`$\|x\|_A^2 = x^\top Ax = x^\top\mathrm{diag}(11, 11, 13)x + x^\top ee^\top x$.`,
      t`$x^\top\mathrm{diag}(11, 11, 13)x = 11 + 11 + 13 = 35$ und $e^\top x = 1 - 1 + 1 = 1$.`,
      t`$\|x\|_A^2 = 35 + 1 = 36$ ⇒ $\|x\|_A = 6$.`,
    ],
    keywords: ['xᵀAx', 'xᵀDx = 35', 'eᵀx = 1', '‖x‖_A = 6'],
    sources: [src('NUM-K-WS2021', '4', 'Aufgabe 6 (d) mit Lösungsskizze')],
  }),
]

/** Offizielle Zahlenwerte für den Inhaltstest. */
export const officialChecks = [
  { id: 'num.w.cg.e3', value: 0.25, dec: 4, note: 'UB 7, Aufgabe 3: β₀ = 1/4' },
  { id: 'num.konvergenzfaktor.e2', value: 0.3333, dec: 4, note: 'Skript, Beispiel 34: Konvergenzfaktor 1/3' },
  { id: 'num.w.inverse-iteration.e2', value: 0.05, dec: 4, note: 'Skript, Beispiel 35: Konvergenzfaktor 1/20' },
]

/** Klausursimulation: Aufbau, Reihenfolge und Punkte wie in der Klausur SoSe 2026. */
export const exams: Exam[] = [
  {
    id: 'numerik-ss26',
    title: 'Klausur Numerik SoSe 2026',
    source: src('NUM-K-SS26', '1–8'),
    totalPoints: 50,
    minutes: 60,
    minutesIsOfficial: false,
    intro: [
      'Aufgaben, Reihenfolge und Punkte wie in der Klausur SoSe 2026 (6 Aufgaben, 50 Punkte), mit der offiziellen Lösungsskizze als Musterlösung.',
      'Alle Aufgaben löst du auf Papier. Nach der Abgabe vergleichst du mit der Musterlösung und bewertest dich selbst.',
      'Die Bearbeitungszeit steht nicht auf den Unterlagen. 60 Minuten sind ein Vorschlag der App.',
      'Tipp: Mach die Simulation erst, wenn du alle Kapitel einmal durch hast. Die Aufgaben kommen auch in den Lektionen vor.',
    ],
    sections: [
      {
        title: 'Aufgabe 1 – LR-Zerlegung',
        points: 6,
        tasks: [
          { id: 'n1a', number: '1a', title: 'LGS mit gegebener LR-Zerlegung lösen', points: 3, topic: 'LR-Zerlegung', chapterId: 'num-lr', exerciseIds: ['num.p.ss26-1a'] },
          { id: 'n1b', number: '1b', title: 'LR-Zerlegung mit Spaltenpivotwahl', points: 3, topic: 'LR-Zerlegung', chapterId: 'num-lr', exerciseIds: ['num.p.ss26-1b'] },
        ],
      },
      {
        title: 'Aufgabe 2 – Spline-Matrix: Kondition und Jacobi-Verfahren',
        points: 9,
        tasks: [
          { id: 'n2ab', number: '2a–b', title: 'Kondition der Spline-Matrix', points: 5, topic: 'Kondition', chapterId: 'num-kondition', exerciseIds: ['num.p.ss26-2'] },
          { id: 'n2c', number: '2c', title: 'Konvergenz des Jacobi-Verfahrens', points: 4, topic: 'Iterative Verfahren', chapterId: chI, exerciseIds: ['num.p.ss26-2c'] },
        ],
      },
      {
        title: 'Aufgabe 3 – Newton-Verfahren',
        points: 6,
        tasks: [{ id: 'n3', number: '3a–c', title: 'Newton-Verfahren und Stoppkriterium', points: 6, topic: 'Newton', chapterId: 'num-newton', exerciseIds: ['num.p.ss26-3'] }],
      },
      {
        title: 'Aufgabe 4 – Trapezregel',
        points: 12,
        tasks: [
          { id: 'n4a', number: '4a', title: 'Trapezregel und ihre Ordnung', points: 3, topic: 'Quadratur', chapterId: 'num-quadratur', exerciseIds: ['num.p.ss26-4a'] },
          { id: 'n4bc', number: '4b–c', title: 'Fehlerschranke und summierte Trapezregel', points: 9, topic: 'Quadratur', chapterId: 'num-quadratur', exerciseIds: ['num.p.ss26-4bc'] },
        ],
      },
      {
        title: 'Aufgabe 5 – Householder für Tridiagonalmatrizen',
        points: 7,
        tasks: [
          { id: 'n5ab', number: '5a–b', title: 'Householder-Vektor und Struktur von Q₁', points: 5, topic: 'QR-Zerlegung', chapterId: 'num-qr', exerciseIds: ['num.p.ss26-5'] },
          { id: 'n5c', number: '5c', title: 'Bezug zur Eigenwertberechnung', points: 2, topic: 'Eigenwerte', chapterId: chE, exerciseIds: ['num.p.ss26-5c'] },
        ],
      },
      {
        title: 'Aufgabe 6 – cg-Verfahren',
        points: 10,
        tasks: [{ id: 'n6', number: '6a–d', title: 'cg: Minimierung, Idee, Konvergenz', points: 10, topic: 'cg-Verfahren', chapterId: chI, exerciseIds: ['num.p.ss26-6'] }],
      },
    ],
  },
]
