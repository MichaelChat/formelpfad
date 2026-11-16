/**
 * Numerische Mathematik – Kapitel 3 (Newton-Verfahren), 4 (Polynom- und Spline-Interpolation)
 * und 5 (numerische Integration). Quellen: Skript (Seitenangaben = PDF-Seite), Übungsblätter 1 und 6,
 * Altklausuren. Alle Zahlenbeispiele wurden mit exakter Bruchrechnung bzw. numpy nachgerechnet.
 */
import { fmt } from '../../lib/format'
import { mc, numeric, opts, paper, src, trueFalse, wissen } from '../helpers'
import type { Chapter, Exercise, Formula, Variable } from '../types'

const t = String.raw
const chN = 'num-newton'
const chI = 'num-interpolation'
const chS = 'num-spline'
const chQ = 'num-quadratur'
const sk = (pages: string, note?: string) => src('NUM-SKRIPT', pages, note)

const vxk: Variable = { sym: 'x_k', tex: 'x_k', name: 'aktuelle Iterierte', domain: [-5, 5] }
const vfk: Variable = { sym: 'f_k', tex: 'f(x_k)', name: 'Funktionswert an der Iterierten', domain: [-5, 5] }
const vdfk: Variable = { sym: 'df_k', tex: "f'(x_k)", name: 'Ableitung an der Iterierten (≠ 0)', domain: [0.5, 5] }
const vxneu: Variable = { sym: 'x_neu', tex: 'x_{k+1}', name: 'neue Iterierte' }
const va: Variable = { sym: 'a', tex: 'a', name: 'linke Intervallgrenze', domain: [0, 2] }
const vb: Variable = { sym: 'b', tex: 'b', name: 'rechte Intervallgrenze', domain: [3, 6] }
const vfa: Variable = { sym: 'f_a', tex: 'f(a)', name: 'Funktionswert links', domain: [-5, 5] }
const vfm: Variable = { sym: 'f_m', tex: 'f(\\tfrac{a+b}{2})', name: 'Funktionswert in der Mitte', domain: [-5, 5] }
const vfb: Variable = { sym: 'f_b', tex: 'f(b)', name: 'Funktionswert rechts', domain: [-5, 5] }
const vS: Variable = { sym: 'S', tex: 'S(f)', name: 'Näherung der Simpsonregel' }
const vE: Variable = { sym: 'E', tex: '|E(f)|', name: 'Schranke für den Quadraturfehler' }
const vM2: Variable = { sym: 'M_2', tex: "\\max|f''|", name: 'Maximum von |f″| auf [a, b]', domain: [0.1, 10] }

export const chapters: Chapter[] = [
  {
    id: chN,
    part: 'num',
    number: '3',
    title: 'Newton-Verfahren für nichtlineare Gleichungen',
    description: 'Nullstellen nichtlinearer Gleichungssysteme iterativ bestimmen: Idee über die Tangente, Stoppkriterium, lokal quadratische Konvergenz und Varianten.',
    sources: [sk('48–54'), src('NUM-VL01', '1–17')],
    lessons: [
      { id: 'l-num-newton', title: 'Das Newton-Verfahren', goal: 'Den Newton-Schritt herleiten, von Hand ausführen und das richtige Stoppkriterium wählen.', formulaIds: ['num.w.newton', 'num.newton-1d'], paperTaskIds: ['num.p.ub1-2', 'num.p.ws1718-6e'] },
      { id: 'l-num-newton-konv', title: 'Konvergenz des Newton-Verfahrens', goal: 'Lokal quadratische Konvergenz erklären und erkennen, wann Newton versagt.', formulaIds: ['num.w.newton-konvergenz'], paperTaskIds: ['num.p.ub1-1', 'num.p.ss26-3'] },
      { id: 'l-num-newton-var', title: 'Varianten und Anwendungen', goal: 'Vereinfachtes Newton-Verfahren, Minimierung und Gauß-Newton einordnen.', formulaIds: ['num.w.newton-varianten'], paperTaskIds: ['num.p.ws1920-2c'] },
    ],
  },
  {
    id: chI,
    part: 'num',
    number: '4.1',
    title: 'Polynominterpolation',
    description: 'Ein Polynom durch gegebene Punkte legen: Lagrange- und Newton-Darstellung, dividierte Differenzen, Interpolationsfehler und warum Tschebyscheff-Stützstellen besser sind als äquidistante.',
    sources: [sk('55–65'), src('NUM-VL07', '1–20'), src('NUM-VL08', '1–7')],
    lessons: [
      { id: 'l-num-ip-lagrange', title: 'Interpolationspolynom und Lagrange-Basis', goal: 'Existenz und Eindeutigkeit begründen und das Polynom in Lagrange-Form aufschreiben.', formulaIds: ['num.w.interpolation'], paperTaskIds: ['num.p.ws2021-2a', 'num.p.ws1718-6b'] },
      { id: 'l-num-ip-newton', title: 'Newton-Darstellung und dividierte Differenzen', goal: 'Das Differenzenschema von Hand rechnen und neue Stützpunkte billig hinzufügen.', formulaIds: ['num.w.newton-interpolation'], paperTaskIds: ['num.p.ws2021-2b', 'num.p.ss24-2ab', 'num.p.ws1920-3ab'] },
      { id: 'l-num-ip-fehler', title: 'Fehler, Kondition und Tschebyscheff', goal: 'Interpolationsfehler abschätzen und die Wahl der Stützstellen begründen.', formulaIds: ['num.w.interpolationsfehler'], paperTaskIds: ['num.p.ws2021-2d', 'num.p.ws1718-6c', 'num.p.ss24-2c'] },
    ],
  },
  {
    id: chS,
    part: 'num',
    number: '4.2',
    title: 'Kubische Spline-Interpolation',
    description: 'Stückweise kubische Polynome, die zweimal stetig differenzierbar zusammengesetzt werden: Definition, Randbedingungen, Minimaleigenschaft, Konstruktion und Fehler.',
    sources: [sk('65–72'), src('NUM-VL09', '1–18')],
    lessons: [
      { id: 'l-num-spline', title: 'Was ist ein kubischer Spline?', goal: 'Die Definition und die drei Randbedingungen kennen und prüfen, ob eine Funktion ein Spline ist.', formulaIds: ['num.w.spline'], paperTaskIds: ['num.p.ws1718-5', 'num.p.ss20-3ab'] },
      { id: 'l-num-spline-konstr', title: 'Konstruktion, Kondition und Fehler', goal: 'Verstehen, wie das tridiagonale Gleichungssystem für die Momente entsteht und warum Splines gut konditioniert sind.', formulaIds: ['num.w.spline-konstruktion'] },
    ],
  },
  {
    id: chQ,
    part: 'num',
    number: '5',
    title: 'Numerische Integration',
    description: 'Integrale mit Quadraturformeln annähern: Mittelpunkt-, Trapez- und Simpsonregel, Ordnung und Ordnungsbedingungen, Gauß-Quadratur, Fehler und summierte Formeln.',
    sources: [sk('73–88'), src('NUM-VL10', '1–14'), src('NUM-VL11', '1–13')],
    lessons: [
      { id: 'l-num-qf', title: 'Quadraturformeln', goal: 'Die allgemeine Form kennen und Rechteck-, Mittelpunkt-, Trapez- und Simpsonregel anwenden.', formulaIds: ['num.w.quadraturformel', 'num.simpson'], paperTaskIds: ['num.p.ss26-4a'] },
      { id: 'l-num-qf-ordnung', title: 'Ordnung und Ordnungsbedingungen', goal: 'Die Ordnung einer Formel bestimmen und Gewichte aus vorgegebenen Knoten berechnen.', formulaIds: ['num.w.qf-ordnung'], paperTaskIds: ['num.p.ub6-2b', 'num.p.ss17-2b', 'num.p.ws2223-6b'] },
      { id: 'l-num-gauss', title: 'Höhere Ordnung und Gauß-Quadratur', goal: 'Erklären, warum 2s die maximale Ordnung ist und wie die Gauß-Knoten entstehen.', formulaIds: ['num.w.gauss'], paperTaskIds: ['num.p.ss24-3'] },
      { id: 'l-num-qf-summiert', title: 'Fehler und summierte Formeln', goal: 'Fehlerschranken angeben und verstehen, wie der Fehler beim Halbieren von h schrumpft.', formulaIds: ['num.w.qf-fehler', 'num.trapez-fehler'], paperTaskIds: ['num.p.ss26-4bc', 'num.p.ws1920-4d'] },
    ],
  },
]

export const formulas: Formula[] = [
  // ================================================================ 3 Newton
  wissen({
    id: 'num.w.newton',
    name: 'Newton-Verfahren',
    short: 'Tangente → Nullstelle',
    chapterId: chN,
    tex: t`f'(x^k)\,d^k = -f(x^k),\qquad x^{k+1} = x^k + d^k`,
    definition: 'Das Newton-Verfahren sucht eine Nullstelle von f: ℝᴺ → ℝᴺ. Man ersetzt f in der Nähe der aktuellen Näherung durch seine Linearisierung (Taylor bis zum linearen Glied) und bestimmt deren Nullstelle. Im Eindimensionalen heißt das: Tangente anlegen und dort weitermachen, wo sie die x-Achse schneidet.',
    keyPoints: [
      t`Herleitung: $0 = f(x^*) \approx f(x^0) + f'(x^0)(x^* - x^0)$, also $x^* \approx x^0 - f'(x^0)^{-1}f(x^0)$.`,
      t`Die inverse Jacobi-Matrix wird nicht berechnet. Stattdessen löst man in jedem Schritt das LGS $f'(x^k)d^k = -f(x^k)$ (mit LR-Zerlegung).`,
      t`Algorithmus: S0) Startwert $x^0$, Toleranz ε, $k = 0$. S1) LGS lösen, $x^{k+1} = x^k + d^k$. S2) Falls $\|d^k\| < \varepsilon$: STOPP, sonst $k \to k+1$.`,
      t`Eindimensional: $x_{k+1} = x_k - \dfrac{f(x_k)}{f'(x_k)}$.`,
      t`Stoppkriterium: $\|d^k\|$, nicht $\|f(x^k)\|$. Multipliziert man f mit einer regulären Matrix (z. B. $\lambda f$), ändern sich Lösung und Iterierte nicht, $\|f(x^k)\|$ aber schon.`,
      t`Typische Anwendung: Umkehrfunktion auswerten. $\sqrt a$ über $f(x) = x^2 - a$ ergibt $x_{k+1} = \tfrac12(x_k + a/x_k)$; $1/d$ über $f(x) = \tfrac1x - d$ ergibt $x_{k+1} = x_k(2 - dx_k)$ ohne Division.`,
      t`Für lineares $f(x) = Ax - b$ liefert Newton nach einem Schritt die exakte Lösung.`,
    ],
    example: {
      problem: 'Berechne mit dem Newton-Verfahren Näherungen von √2, Startwert x₀ = 1.',
      steps: [
        t`$f(x) = x^2 - 2$, $f'(x) = 2x$, also $x_{k+1} = x_k - \dfrac{x_k^2 - 2}{2x_k} = \tfrac12\big(x_k + \tfrac{2}{x_k}\big)$.`,
        t`$x_1 = \tfrac12(1 + 2) = 1{,}5$ (Fehler $\approx 0{,}086$).`,
        t`$x_2 = \tfrac12(1{,}5 + 1{,}3\overline{3}) = 1{,}41\overline{6}$ (Fehler $\approx 2{,}5 \cdot 10^{-3}$).`,
        t`$x_3 \approx 1{,}4142157$ (Fehler $\approx 2{,}1 \cdot 10^{-6}$), $x_4$: Fehler $\approx 1{,}6 \cdot 10^{-12}$. Die Anzahl richtiger Stellen verdoppelt sich ungefähr.`,
      ],
      result: 'x₄ ≈ 1,41421356237',
      source: sk('48–50', 'Beispiel 18, Beispiele 19 (a)'),
    },
    mistakes: [
      'Die Inverse der Jacobi-Matrix explizit berechnen statt ein LGS zu lösen.',
      'Vorzeichen vertauschen: $f\'(x^k)d^k = -f(x^k)$, nicht $+f(x^k)$.',
      '$\\|f(x^k)\\| < \\varepsilon$ als Stoppkriterium verwenden.',
    ],
    examTip: 'Fast jede Klausur fragt den Algorithmus mit Stoppkriterium ab (z. B. SS26, Aufgabe 3 a). Schreib ihn immer mit S0, S1, S2 auf.',
    related: ['num.w.newton-konvergenz', 'num.newton-1d', 'num.w.lr-idee'],
    sources: [sk('48–51', 'Beispiel 18, Abschnitte 3.2 und 3.3, Bemerkung 21')],
  }),
  {
    id: 'num.newton-1d',
    name: 'Newton-Schritt (eindimensional)',
    short: 'x − f/f′',
    chapterId: chN,
    tex: t`x_{k+1} = x_k - \frac{f(x_k)}{f'(x_k)}`,
    lhs: 'x_neu',
    rhs: 'x_k - f_k/df_k',
    variables: [vxneu, vxk, vfk, vdfk],
    assumptions: ['f differenzierbar, $f\'(x_k) \\neq 0$.'],
    intuition: 'Die Tangente im Punkt (x_k, f(x_k)) hat die Steigung f′(x_k). Sie schneidet die x-Achse bei x_k − f(x_k)/f′(x_k).',
    interpretation: 'Ist f(x_k) schon klein und f′(x_k) nicht zu klein, ist der Schritt klein: Man ist nah an der Nullstelle.',
    useCases: ['Einen Newton-Schritt von Hand rechnen', 'Wurzeln und Kehrwerte iterativ berechnen'],
    whenNot: ['Wenn $f\'(x_k) \\approx 0$: Die Tangente ist fast waagerecht, der Schritt wird riesig.'],
    mistakes: ['$f\'(x_k)/f(x_k)$ statt $f(x_k)/f\'(x_k)$.', 'Plus statt Minus.'],
    example: {
      problem: 'Ein Newton-Schritt für f(x) = 1/x − 9 (also 1/9 berechnen) mit x₀ = 0,1.',
      steps: [t`$f'(x) = -1/x^2$, also $x_{k+1} = x_k - \dfrac{1/x_k - 9}{-1/x_k^2} = x_k(2 - 9x_k)$.`, t`$x_1 = 0{,}1 \cdot (2 - 0{,}9) = 0{,}11$, $x_2 = 0{,}11 \cdot 1{,}01 = 0{,}1111$.`],
      result: 'x₂ = 0,1111',
      source: src('NUM-UB01', '1–2', 'Aufgabe 2 c)'),
    },
    related: ['num.w.newton'],
    difficulty: 1,
    sources: [sk('50', 'Abschnitt 3.3')],
    status: 'geprüft',
  },
  wissen({
    id: 'num.w.newton-konvergenz',
    name: 'Konvergenz des Newton-Verfahrens',
    short: 'lokal quadratisch',
    chapterId: chN,
    tex: t`\|x^* - x^k\| \le C\,\|x^* - x^{k-1}\|^2`,
    definition: 'Ist f zweimal stetig differenzierbar und die Jacobi-Matrix in der Nullstelle regulär, dann konvergiert das Newton-Verfahren für jeden Startwert in einer (unbekannten) Kugel um x* gegen x*, und zwar quadratisch: Die Zahl der richtigen Stellen verdoppelt sich ungefähr in jedem Schritt. Weit weg von x* kann es dagegen divergieren.',
    keyPoints: [
      t`Satz 9: $f \in C^2$, $f(x^*) = 0$, $f'(x^*)$ regulär ⇒ es gibt eine Kugel $K_\delta(x^*)$, in der $x^*$ die einzige Nullstelle ist und Newton für jeden Startwert dort quadratisch konvergiert.`,
      t`„Lokal“: δ ist meist klein und unbekannt. Ein guter Startwert ist nötig (Hilfen: Homotopie, Dämpfung).`,
      t`Beispiel Divergenz: $f(x) = \tfrac1x - 1$ mit $x_0 \notin [0, 2]$ läuft gegen $-\infty$.`,
      t`Ist $f'(x^*) = 0$, gilt Satz 9 nicht. Für $f(x) = x^3$ wird $x_{k+1} = \tfrac23 x_k$: nur lineare Konvergenz.`,
      t`Wenn Newton konvergiert ($f \in C^1$, reguläre Jacobi-Matrix im Grenzwert), dann gegen eine Nullstelle.`,
      t`Kondition: $\|x^* - x^*(\varepsilon)\| \le \|f'(x^*)^{-1}\|\,\|\varepsilon\| + O(\|\varepsilon\|^2)$. Je größer $|f'(x^*)|$, desto besser konditioniert; $f'(x^*) = 0$ heißt: nicht sachgemäß gestellt.`,
      t`Wegen $x^k - x^* \approx f'(x^*)^{-1}f(x^k)$ kann $\|f(x^k)\|$ klein sein, obwohl der Fehler groß ist, wenn $\|f'(x^*)^{-1}\|$ groß ist.`,
    ],
    mistakes: ['Globale Konvergenz behaupten: Newton konvergiert nur lokal.', 'Quadratische Konvergenz auch bei $f\'(x^*) = 0$ erwarten.', 'Das gedämpfte Newton-Verfahren für quadratisch konvergent halten (es ist nur linear).'],
    related: ['num.w.newton', 'num.w.newton-varianten'],
    sources: [sk('49–53', 'Abschnitt 3.1, Beispiele 19 (b), Satz 9, Bemerkungen 22, Beispiel 21')],
  }),
  wissen({
    id: 'num.w.newton-varianten',
    name: 'Vereinfachtes Newton, Minimierung und Gauß-Newton',
    short: 'Newton-Varianten',
    chapterId: chN,
    definition: 'Das volle Newton-Verfahren braucht in jedem Schritt eine neue Jacobi-Matrix und eine neue LR-Zerlegung. Das vereinfachte Newton-Verfahren spart das, indem es eine feste Matrix A ≈ f′(x⁰) verwendet, und zahlt mit linearer statt quadratischer Konvergenz. Außerdem lässt sich Newton auf Minimierungsprobleme und nichtlineare Ausgleichsprobleme übertragen.',
    keyPoints: [
      t`Vereinfachtes Newton: $x^{k+1} = x^k - A^{-1}f(x^k)$ mit festem $A \approx f'(x^0)$. Nur eine Auswertung der Ableitung und eine LR-Zerlegung insgesamt.`,
      t`Konvergenz (Satz 10): lokal linear, falls $\rho(I - Bf'(x^*)) < 1$ für $B = A^{-1}$.`,
      t`Aufwandsvergleich pro Schritt: Newton braucht Jacobi-Matrix + LR ($\tfrac13 N^3$); vereinfachtes Newton nur Vorwärts-/Rückwärtssubstitution ($N^2$).`,
      t`Ableitung zu teuer? Differenzenquotient: $(A_k)_{nm} = \tfrac1h\big(f_n(x^k + he^m) - f_n(x^k)\big)$.`,
      t`Minimierung von $f: \mathbb{R}^N \to \mathbb{R}$: Nullstelle des Gradienten suchen, $x^{k+1} = x^k - H_f(x^k)^{-1}\nabla f(x^k)$ mit Hesse-Matrix $H_f$.`,
      t`Gauß-Newton (nichtlineare Ausgleichsrechnung): in jedem Schritt das lineare Ausgleichsproblem $\|f'(x^k)d^k + f(x^k)\|_2 = \min!$ lösen, $x^{k+1} = x^k + d^k$.`,
    ],
    mistakes: ['Beim Minimieren die Hesse-Matrix mit der Jacobi-Matrix von f verwechseln (es ist die Jacobi-Matrix des Gradienten).', 'Erwarten, dass das vereinfachte Newton-Verfahren quadratisch konvergiert.'],
    related: ['num.w.newton', 'num.w.newton-konvergenz', 'num.w.ausgleich'],
    sources: [sk('53–54', 'Abschnitte 3.5 und 3.6, Satz 10')],
  }),

  // ================================================================ 4.1 Polynominterpolation
  wissen({
    id: 'num.w.interpolation',
    name: 'Interpolationspolynom und Lagrange-Basis',
    short: 'p(xₙ) = fₙ',
    chapterId: chI,
    tex: t`L_n(x) = \prod_{m \neq n} \frac{x - x_m}{x_n - x_m},\qquad p(x) = \sum_{n=0}^N f_n L_n(x)`,
    definition: 'Zu N + 1 Stützpunkten (xₙ, fₙ) mit paarweise verschiedenen Stützstellen gibt es genau ein Polynom p vom Grad ≤ N mit p(xₙ) = fₙ für alle n. In der Lagrange-Basis lässt es sich direkt hinschreiben: Lₙ ist 1 in xₙ und 0 in allen anderen Stützstellen.',
    keyPoints: [
      t`Eindeutigkeit: Zwei solche Polynome p, q ⇒ $p - q$ hat Grad $\le N$ und $N + 1$ Nullstellen ⇒ $p - q = 0$ (Fundamentalsatz der Algebra).`,
      t`Existenz: $L_n$ hat die N Nullstellen $x_m$ ($m \neq n$) und wird so normiert, dass $L_n(x_n) = 1$. Dann ist $p = \sum f_n L_n$ ein Polynom vom Grad $\le N$ mit $p(x_m) = f_m$.`,
      t`Drei Argumente für die Lagrange-Darstellung: (1) $p \in \mathbb{P}_N$, (2) $L_n(x_m) = \delta_{nm}$ ⇒ Interpolationsbedingung erfüllt, (3) Eindeutigkeit.`,
      t`$\sum_n L_n(x) \equiv 1$ (interpoliert die konstante Funktion 1).`,
      t`Lagrange: Koeffizienten direkt gegeben, Auswertung aber teuer; neuer Stützpunkt ⇒ alle $L_n$ ändern sich.`,
      t`Für N + 1 Punkte reicht nicht Grad N − 1, und Grad N + 1 wäre nicht eindeutig.`,
    ],
    example: {
      problem: 'Lagrange-Polynome und Interpolationspolynom zu (0, 1), (1, 3), (3, 2).',
      steps: [
        t`$L_0(x) = \dfrac{(x-1)(x-3)}{(0-1)(0-3)} = \tfrac13(x-1)(x-3)$`,
        t`$L_1(x) = \dfrac{(x-0)(x-3)}{(1-0)(1-3)} = -\tfrac12 x(x-3)$`,
        t`$L_2(x) = \dfrac{(x-0)(x-1)}{(3-0)(3-1)} = \tfrac16 x(x-1)$`,
        t`$p(x) = 1 \cdot L_0 + 3 \cdot L_1 + 2 \cdot L_2$. Probe: $p(1) = 0 + 3 \cdot 1 + 0 = 3$.`,
      ],
      result: 'p(x) = 1 + 2x − (5/6)x(x − 1)',
    },
    mistakes: ['Im Nenner von $L_n$ den Faktor $m = n$ mitnehmen (Division durch 0).', 'Glauben, das Interpolationspolynom hänge von der gewählten Basis ab: Nur die Darstellung ändert sich.'],
    supplement: 'Das Beispiel ist ein eigenes Beispiel der App (exakt nachgerechnet).',
    related: ['num.w.newton-interpolation', 'num.w.interpolationsfehler'],
    sources: [sk('55–57', 'Abschnitt 4.1, Satz 12, (4.1), (4.2)')],
  }),
  wissen({
    id: 'num.w.newton-interpolation',
    name: 'Newton-Darstellung und dividierte Differenzen',
    short: 'Differenzenschema',
    chapterId: chI,
    tex: t`p(x) = f_{0,0} + f_{0,1}(x - x_0) + \dots + f_{0,N}\prod_{m<N}(x - x_m),\quad f_{n,k} = \frac{f_{n,k-1} - f_{n+1,k}}{x_n - x_k}`,
    definition: 'In der Newton-Basis 1, (x − x₀), (x − x₀)(x − x₁), … sind die Koeffizienten die dividierten Differenzen f₀,ₖ. Man berechnet sie spaltenweise in einem Dreiecksschema. Vorteil: Kommt ein Stützpunkt dazu, rechnet man nur eine neue Zeile und hängt einen Term an.',
    keyPoints: [
      t`Start: $f_{n,n} = f_n$. Nächste Spalte: $f_{n,k} = \dfrac{f_{n,k-1} - f_{n+1,k}}{x_n - x_k}$ (oben minus unten durch die äußeren Stützstellen).`,
      t`Die Koeffizienten stehen auf der oberen Diagonale des Schemas: $f_{0,0}, f_{0,1}, \dots, f_{0,N}$.`,
      t`Newton-Polynome: $w_0 = 1$, $w_k(x) = \prod_{m=0}^{k-1}(x - x_m)$.`,
      t`Neuer Stützpunkt $(x_{N+1}, f_{N+1})$: eine neue Zeile unten, dann $p_{0,N+1} = p_{0,N} + f_{0,N+1}\,w_{N+1}$.`,
      t`Auswerten mit Horner: $p(x) = f_{0,0} + (x - x_0)\big(f_{0,1} + (x - x_1)(f_{0,2} + \dots)\big)$.`,
      t`Aufwand: Schema etwa $N^2$ Operationen, Auswertung mit Horner etwa $2N$.`,
      t`Grundlage ist das Lemma von Aitken: $p_{n,k}(x) = \dfrac{(x_n - x)p_{n+1,k}(x) - (x_k - x)p_{n,k-1}(x)}{x_n - x_k}$.`,
    ],
    example: {
      problem: 'Newton-Darstellung zu (−1, 1), (0, 6), (1, −3), (3, 3).',
      steps: [
        t`1. Spalte: $\frac{1-6}{-1-0} = 5$, $\frac{6-(-3)}{0-1} = -9$, $\frac{-3-3}{1-3} = 3$.`,
        t`2. Spalte: $\frac{5-(-9)}{-1-1} = -7$, $\frac{-9-3}{0-3} = 4$.`,
        t`3. Spalte: $\frac{-7-4}{-1-3} = \frac{11}{4}$.`,
        t`$p(x) = 1 + 5(x+1) - 7(x+1)x + \tfrac{11}{4}(x+1)x(x-1)$.`,
      ],
      result: 'Koeffizienten 1, 5, −7, 11/4',
      source: sk('60–61', 'Beispiele 23 (a)'),
    },
    mistakes: [
      'Im Nenner benachbarte statt der äußersten Stützstellen nehmen: Für $f_{n,k}$ ist es $x_n - x_k$.',
      'Den Zähler in falscher Reihenfolge bilden, aber den Nenner nicht: $(f_{n+1,k} - f_{n,k-1})/(x_k - x_n)$ ist gleichwertig, gemischt wird es falsch.',
      'Die Koeffizienten aus der unteren statt der oberen Diagonale ablesen.',
    ],
    examTip: 'Klausurklassiker (SS24, WS20/21, WS19/20, SS17): Schema rechnen, Newton-Polynome explizit hinschreiben, dann einen Punkt hinzunehmen.',
    related: ['num.w.interpolation', 'num.w.interpolationsfehler'],
    sources: [sk('58–61', 'Abschnitt 4.1.2, Lemma 2, Satz 14, Bemerkung 25'), sk('64', 'Zusammenfassung 4.1.5')],
  }),
  wissen({
    id: 'num.w.interpolationsfehler',
    name: 'Interpolationsfehler, Kondition und Tschebyscheff-Stützstellen',
    short: 'Restglied & Stützstellenwahl',
    chapterId: chI,
    tex: t`f(x) - p(x) = w_{N+1}(x)\,\frac{f^{(N+1)}(\xi)}{(N+1)!},\qquad x_n = \cos\Big(\frac{2n+1}{2N+2}\pi\Big)`,
    definition: 'Der Fehler der Polynominterpolation hängt von der (N+1)-ten Ableitung von f und vom Knotenpolynom w_{N+1}(x) = (x − x₀)⋯(x − x_N) ab, also von der Lage der Stützstellen. Tschebyscheff-Stützstellen machen max |w_{N+1}| auf [−1, 1] so klein wie möglich (2⁻ᴺ) und sind gut konditioniert. Äquidistante Stützstellen führen bei hohem Grad zu starken Oszillationen am Rand.',
    keyPoints: [
      t`Satz 15 (Restglied): für $f \in C^{N+1}$ existiert $\xi \in (a,b)$ mit obiger Darstellung. Abschätzung: $\max|f - p| \le \max|w_{N+1}| \cdot \dfrac{\max|f^{(N+1)}|}{(N+1)!}$.`,
      t`Kondition (Satz 13): $\max|p - \tilde p| \le \Lambda_N \max_n|f_n - \tilde f_n|$ mit der Lebesgue-Konstante $\Lambda_N = \max_x \sum_n |L_n(x)| \ge 1$.`,
      t`$\Lambda_N$ äquidistant: etwa 3,1 ($N = 5$), 29,9 ($N = 10$), $\approx 10^4$ ($N = 20$). Tschebyscheff: 2,1 / 2,5 / 2,9, für großes N etwa $\log N$.`,
      t`Tschebyscheff-Polynome: $T_0 = 1$, $T_1 = x$, $T_{N+1} = 2xT_N - T_{N-1}$, $T_N(x) = \cos(N\arccos x)$, Leitkoeffizient $2^{N-1}$. Tschebyscheff-Stützstellen = Nullstellen von $T_{N+1}$.`,
      t`Satz 16: $\max_{[-1,1]}|w_{N+1}|$ wird genau für Tschebyscheff-Stützstellen minimal, Wert $2^{-N}$.`,
      t`Andere Intervalle: affin transformieren, $y = \tfrac{a+b}{2} + \tfrac{b-a}{2}x$.`,
      t`Bestapproximation: $\max|f - p| \le (1 + \Lambda_N)\min_{q \in \mathbb{P}_N}\max|f - q|$. Mit Tschebyscheff fast optimal, äquidistant bei großem N wertlos.`,
      t`Faustregel: Tschebyscheff für glatte, analytische Funktionen; sonst lieber Splines.`,
    ],
    mistakes: ['Mehr äquidistante Stützstellen für automatisch besser halten (Runge-Phänomen).', 'Den Faktor $(N+1)!$ oder die Ableitungsordnung N + 1 vergessen.', 'Die Lebesgue-Konstante als Fehler interpretieren: Sie verstärkt Datenfehler.'],
    examTip: 'WS20/21: „Minimales N, damit sin auf [−1, 1] bis 10⁻² genau ist“: Restglied mit Tschebyscheff ($2^{-N}$) und $|\\sin^{(N+1)}| \\le 1$, dann N = 2, 3, … probieren.',
    related: ['num.w.interpolation', 'num.w.newton-interpolation', 'num.w.spline'],
    sources: [sk('57–65', 'Satz 13, Beispiel 22, Satz 15, Abschnitt 4.1.4, Sätze 16–17, Beispiel 25, Bemerkung 30')],
  }),

  // ================================================================ 4.2 Splines
  wissen({
    id: 'num.w.spline',
    name: 'Kubischer interpolierender Spline',
    short: 'stückweise kubisch, C²',
    chapterId: chS,
    definition: 'Ein kubischer interpolierender Spline zu den Stützpunkten (x₀, y₀), …, (x_N, y_N) mit a = x₀ < … < x_N = b ist eine zweimal stetig differenzierbare Funktion s, die auf jedem Teilintervall [xₙ₋₁, xₙ] ein Polynom vom Grad ≤ 3 ist und s(xₙ) = yₙ erfüllt. Damit er eindeutig ist, braucht man noch zwei Randbedingungen.',
    keyPoints: [
      t`Definition: (1) $s \in C^2[a,b]$, (2) $s|_{[x_{n-1}, x_n]} \in \mathbb{P}_3$, (3) $s(x_n) = y_n$ für $n = 0, \dots, N$.`,
      t`Eingespannt (Hermite): $s'(a) = v_0$, $s'(b) = v_N$ vorgegeben.`,
      t`Natürlich: $s''(a) = s''(b) = 0$.`,
      t`Periodisch: $s'(a) = s'(b)$ und $s''(a) = s''(b)$ (sinnvoll nur für $y_0 = y_N$).`,
      t`Prüfen, ob ein Spline vorliegt: an jeder inneren Stützstelle Gleichheit von $s$, $s'$ und $s''$ der beiden angrenzenden Stücke, dazu Interpolation und Randbedingung.`,
      t`Minimaleigenschaft (Satz 18): Unter allen $C^2$-Funktionen mit denselben Interpolations- und Randbedingungen minimiert der Spline $\int_a^b |s''(x)|^2\,dx$ (anschaulich: kleinste Gesamtkrümmung).`,
      t`Abzählen: N kubische Stücke mit je 4 Koeffizienten = 4N Unbekannte; 2N Interpolations- + 2(N−1) Glattheitsbedingungen = 4N − 2; dazu 2 Randbedingungen.`,
    ],
    example: {
      problem: t`Ist $s(x) = -x^3 + 8x + 1$ auf $[0,1]$ und $s(x) = x^3 - 6x^2 + 14x - 1$ auf $[1,2]$ ein kubischer Spline? Ist er periodisch?`,
      steps: [
        t`Werte bei $x = 1$: $-1 + 8 + 1 = 8$ und $1 - 6 + 14 - 1 = 8$ ✓.`,
        t`Erste Ableitungen: $-3x^2 + 8 \to 5$ und $3x^2 - 12x + 14 \to 5$ ✓.`,
        t`Zweite Ableitungen: $-6x \to -6$ und $6x - 12 \to -6$ ✓. Also ein kubischer Spline.`,
        t`Periodisch? $s(0) = 1 \neq s(2) = 11$: nein.`,
      ],
      result: 'Spline ja, periodisch nein',
      source: src('NUM-K-WS1718', '2', 'Aufgabe 5 b), c)'),
    },
    mistakes: ['Nur Stetigkeit von s prüfen und die Ableitungen vergessen.', 'Natürliche und eingespannte Randbedingungen verwechseln.', 'Einen periodischen Spline für $y_0 \\neq y_N$ fordern.'],
    related: ['num.w.spline-konstruktion', 'num.w.interpolationsfehler'],
    sources: [sk('65–68', 'Definition 9, Satz 18, Definition 10, Bemerkungen 27, Beispiel 26')],
  }),
  wissen({
    id: 'num.w.spline-konstruktion',
    name: 'Konstruktion, Kondition und Fehler von Splines',
    short: 'Momente γₙ = s″(xₙ)',
    chapterId: chS,
    tex: t`\tfrac{h_n}{6}(\gamma_{n-1} + 2\gamma_n) + \tfrac{h_{n+1}}{6}(2\gamma_n + \gamma_{n+1}) = y_{n,n+1} - y_{n-1,n}`,
    definition: 'Man setzt jedes Stück so an, dass es die Interpolation schon erfüllt, und wählt als Unbekannte die Momente γₙ = s″(xₙ). Die Stetigkeit der ersten Ableitung an den inneren Stützstellen liefert dann ein tridiagonales, strikt diagonaldominantes LGS für die γₙ, das man in O(N) Operationen löst.',
    keyPoints: [
      t`Ansatz: $s_n(x) = y_{n-1} + (x - x_{n-1})y_{n-1,n} + (x - x_{n-1})(x - x_n)\big[\alpha_n(x - x_{n-1}) + \beta_n(x - x_n)\big]$: interpolierender plus glättender Anteil.`,
      t`Mit $h_n = x_n - x_{n-1}$: $\alpha_n = \tfrac{1}{6h_n}(\gamma_{n-1} + 2\gamma_n)$, $\beta_n = -\tfrac{1}{6h_n}(2\gamma_{n-1} + \gamma_n)$.`,
      t`$s''$ ist durch den Ansatz automatisch stetig. Die Bedingung $s_n'(x_n) = s_{n+1}'(x_n)$ ergibt die Gleichung oben ($n = 1, \dots, N-1$).`,
      t`Eingespannt: zusätzlich $\tfrac{h_1}{6}(2\gamma_0 + \gamma_1) = y_{0,1} - v_0$ und $\tfrac{h_N}{6}(\gamma_{N-1} + 2\gamma_N) = v_N - y_{N-1,N}$.`,
      t`Die Matrix ist symmetrisch, tridiagonal, strikt diagonaldominant ⇒ spd, Cholesky mit Bandstruktur, Aufwand $O(N)$. Äquidistant: $\tfrac h6\,\mathrm{tridiag}(1, 4, 1)$, gut konditioniert.`,
      t`Kondition (Satz 19): Lagrange-Splines $l_n$ mit $\Lambda_N = \max\sum|l_n| \le 2$ bei äquidistanter Unterteilung, für jedes N. Störungen wirken nur lokal.`,
      t`Fehler (Satz 20, eingespannt mit $s' = f'$ am Rand): $\max|f - s| \le \tfrac{5}{384}h^4\max|f^{(4)}|$, $h = \max h_n$.`,
    ],
    mistakes: ['Glauben, ein Spline werde über ein volles $4N \\times 4N$-System berechnet: Mit Momenten ist es tridiagonal und $(N+1)$-dimensional.', 'Die Fehlerordnung mit $h^2$ angeben: Es ist $h^4$.'],
    related: ['num.w.spline', 'num.w.stoerung', 'num.w.cholesky'],
    sources: [sk('68–72', 'Abschnitte 4.2.1–4.2.3, Bemerkungen 28 und 29, Sätze 19 und 20')],
  }),

  // ================================================================ 5 Quadratur
  wissen({
    id: 'num.w.quadraturformel',
    name: 'Quadraturformeln',
    short: 'gewichtetes Mittel',
    chapterId: chQ,
    tex: t`\int_a^b f(x)\,dx \approx (b-a)\sum_{k=1}^s b_k\, f\big(a + c_k(b-a)\big)`,
    definition: 'Eine Quadraturformel ersetzt das Integral durch Intervalllänge mal gewichtetes Mittel von Funktionswerten. Sie ist durch die Gewichte b_k und die Knoten c_k ∈ [0, 1] festgelegt, kurz (b_k, c_k)_{k=1,…,s}.',
    keyPoints: [
      t`Rechteckregel (links): $s = 1$, $b_1 = 1$, $c_1 = 0$. Mittelpunktregel: $b_1 = 1$, $c_1 = \tfrac12$.`,
      t`Trapezregel: $b_1 = b_2 = \tfrac12$, $c_1 = 0$, $c_2 = 1$: $(b-a)\tfrac{f(a) + f(b)}{2}$.`,
      t`Simpsonregel: $b = (\tfrac16, \tfrac46, \tfrac16)$, $c = (0, \tfrac12, 1)$.`,
      t`Eine Quadraturformel ist linear in f; monoton genau dann, wenn alle $b_k \ge 0$.`,
      t`Interpolatorisch: Integrand durch das Interpolationspolynom ersetzen und dieses exakt integrieren (Trapez, Simpson; bei äquidistanten Knoten: Newton-Cotes).`,
      t`Kondition des Integrals: $\dfrac{|I(f) - I(\tilde f)|}{|I(f)|} \le \mathrm{cond}_1(f)\dfrac{\|f - \tilde f\|_1}{\|f\|_1}$ mit $\mathrm{cond}_1(f) = \dfrac{I(|f|)}{|I(f)|}$. Schlecht bei stark oszillierenden Integranden (Auslöschung).`,
    ],
    example: {
      problem: 'Näherungen für ∫₀¹ x² dx = 1/3 mit Mittelpunkt-, Trapez- und Simpsonregel.',
      steps: [t`Mittelpunkt: $1 \cdot (\tfrac12)^2 = \tfrac14$.`, t`Trapez: $\tfrac{0 + 1}{2} = \tfrac12$.`, t`Simpson: $\tfrac16(0 + 4 \cdot \tfrac14 + 1) = \tfrac13$, exakt.`],
      result: '1/4, 1/2, 1/3',
    },
    mistakes: ['Den Faktor $(b - a)$ vergessen.', 'Knoten $c_k$ (in [0, 1]) mit den tatsächlichen Auswertungsstellen $a + c_k(b-a)$ verwechseln.'],
    supplement: 'Das Rechenbeispiel ist ein eigenes Beispiel der App.',
    related: ['num.simpson', 'num.w.qf-ordnung'],
    sources: [sk('73–76', 'Beispiele 27, Abschnitt 5.1, Satz 21, Beispiel 28, Bemerkungen 32')],
  }),
  {
    id: 'num.simpson',
    name: 'Simpsonregel',
    short: '(b−a)/6 · (1, 4, 1)',
    chapterId: chQ,
    tex: t`S(f) = \frac{b-a}{6}\Big(f(a) + 4f\big(\tfrac{a+b}{2}\big) + f(b)\Big)`,
    lhs: 'S',
    rhs: '(b-a)/6*(f_a+4*f_m+f_b)',
    variables: [vS, va, vb, vfa, vfm, vfb],
    assumptions: ['f stetig auf [a, b].'],
    intuition: 'Man legt eine Parabel durch die Funktionswerte am linken Rand, in der Mitte und am rechten Rand und integriert sie exakt. Die Mitte zählt viermal so viel wie jeder Rand.',
    interpretation: 'Die Simpsonregel hat Ordnung 4: Sie integriert sogar alle Polynome bis Grad 3 exakt (eins mehr als erwartet, wegen der Symmetrie).',
    useCases: ['Integral mit drei Funktionsauswertungen genau annähern', 'Summierte Simpsonregel auf feiner Zerlegung'],
    mistakes: ['Faktor $\\tfrac{b-a}{6}$ durch $\\tfrac{b-a}{3}$ ersetzen (das ist die Form mit $h = \\tfrac{b-a}{2}$).', 'Den Mittelpunkt nur einfach gewichten.'],
    example: {
      problem: 'Simpsonregel für ∫₀² eˣ dx (exakt e² − 1 ≈ 6,3891).',
      steps: [t`$S = \tfrac{2}{6}(e^0 + 4e^1 + e^2) = \tfrac13(1 + 10{,}8731 + 7{,}3891)$`, t`$= \tfrac13 \cdot 19{,}2622 \approx 6{,}4207$`],
      result: 'S ≈ 6,4207 (Fehler ≈ 0,032)',
    },
    related: ['num.w.quadraturformel', 'num.w.qf-ordnung', 'num.w.qf-fehler'],
    difficulty: 1,
    sources: [sk('73, 75', 'Beispiele 27 (d), Beispiel 28')],
    status: 'geprüft',
  },
  wissen({
    id: 'num.w.qf-ordnung',
    name: 'Ordnung und Ordnungsbedingungen',
    short: 'Σ b_k c_k^{q−1} = 1/q',
    chapterId: chQ,
    tex: t`\sum_{k=1}^s b_k c_k^{\,q-1} = \frac1q\quad\text{für } q = 1, \dots, p`,
    definition: 'Eine Quadraturformel hat die Ordnung p, wenn sie alle Polynome vom Grad ≤ p − 1 exakt integriert und p maximal ist. Gleichwertig: Die Ordnungsbedingungen gelten für q = 1, …, p, aber nicht für q = p + 1. Sind die Knoten fest, legen die ersten s Bedingungen die Gewichte eindeutig fest.',
    keyPoints: [
      t`Es reicht, Monome auf [0, 1] zu prüfen (Linearität und Substitution $x = a + t(b-a)$).`,
      t`Ordnungen: Rechteck 1, Mittelpunkt 2, Trapez 2, Simpson 4.`,
      t`Satz 23: Bei paarweise verschiedenen Knoten hat die Formel genau dann Ordnung $\ge s$, wenn $b_k = \int_0^1 L_k(x)\,dx$ (Lagrange-Polynome zu den Knoten), bzw. $b = C^{-1}\tau$ mit Vandermonde-Matrix C.`,
      t`Symmetrisch heißt $c_k = 1 - c_{s+1-k}$ und $b_k = b_{s+1-k}$. Satz 24: Die Ordnung einer symmetrischen Formel ist gerade.`,
      t`Symmetrische Knoten + Ordnung $\ge s$ ⇒ die Gewichte sind automatisch symmetrisch (Korollar 1).`,
      t`Rezept „Gewichte zu gegebenen Knoten“: Bedingungen für $q = 1, \dots, s$ aufschreiben, LGS lösen, dann mit $q = s+1, s+2, \dots$ prüfen, wie hoch die Ordnung wirklich ist.`,
      t`Hat die Formel Ordnung p, so integriert sie ein Polynom vom Grad genau p nicht exakt.`,
    ],
    example: {
      problem: 'Symmetrische Formel mit c₁ = 1/6 (s = 3) und Ordnung ≥ 4: Knoten, Gewichte, Ordnung?',
      steps: [
        t`Symmetrie: $c_3 = \tfrac56$, $c_2 = \tfrac12$, $b_1 = b_3$.`,
        t`$q = 1$: $2b_1 + b_2 = 1$. $q = 3$: $b_1(\tfrac{1}{36} + \tfrac{25}{36}) + \tfrac14 b_2 = \tfrac13$.`,
        t`Einsetzen von $b_2 = 1 - 2b_1$: $b_1 \cdot \tfrac{8}{36} = \tfrac{1}{12}$ ⇒ $b_1 = b_3 = \tfrac38$, $b_2 = \tfrac14$.`,
        t`$q = 2$ und $q = 4$ gelten wegen der Symmetrie. $q = 5$: $\tfrac38\big((\tfrac16)^4 + (\tfrac56)^4\big) + \tfrac14 \cdot \tfrac1{16} \approx 0{,}1968 \neq \tfrac15$ ⇒ Ordnung 4.`,
      ],
      result: 'b = (3/8, 1/4, 3/8), Ordnung 4',
      source: src('NUM-K-SS17', '1', 'Aufgabe 2 b)'),
    },
    mistakes: ['Die Ordnung mit dem höchsten exakt integrierten Grad verwechseln: Ordnung p heißt exakt bis Grad p − 1.', 'Nach Bestimmen der Gewichte nicht weiter prüfen, ob die Ordnung höher ist.'],
    related: ['num.w.quadraturformel', 'num.w.gauss'],
    sources: [sk('77–80', 'Definition 11, Satz 22, Beispiel 30, Satz 23, Definition 12, Satz 24, Korollar 1')],
  }),
  wissen({
    id: 'num.w.gauss',
    name: 'Höhere Ordnung und Gauß-Quadratur',
    short: 'maximal 2s',
    chapterId: chQ,
    tex: t`\text{Ordnung } s + m \iff \int_0^1 M(x)\,g(x)\,dx = 0\ \ \forall g \in \mathbb{P}_{m-1},\quad M(x) = \prod_{k=1}^s (x - c_k)`,
    definition: 'Hat eine Formel schon Ordnung ≥ s, so bestimmen nur noch die Knoten, ob die Ordnung höher wird: Das Knotenpolynom M muss zu allen Polynomen vom Grad ≤ m − 1 orthogonal sein. Mehr als 2s ist unmöglich; genau 2s erreicht die Gauß-Quadratur, deren Knoten aus den Nullstellen der Legendre-Polynome kommen.',
    keyPoints: [
      t`Beweisidee (Satz 25): $f = Mg + r$ mit $\deg g \le m - 1$, $\deg r \le s - 1$. Die Formel integriert r exakt und sieht von $Mg$ nur Nullen ($M(c_k) = 0$).`,
      t`Maximal 2s (Satz 26): Für $g = M$ wäre $\int_0^1 M^2\,dx > 0$.`,
      t`Gauß (Satz 27): $c_k = \tfrac12(1 + \gamma_k)$, $\gamma_k$ Nullstellen des Legendre-Polynoms vom Grad s. Gewichte nach Satz 23.`,
      t`$s = 1$: Mittelpunktregel (Ordnung 2). $s = 2$: $c = \tfrac12 \mp \tfrac{\sqrt3}{6}$, $b = (\tfrac12, \tfrac12)$ (Ordnung 4).`,
      t`$s = 3$: $c = \tfrac12 - \tfrac{\sqrt{15}}{10}, \tfrac12, \tfrac12 + \tfrac{\sqrt{15}}{10}$, $b = (\tfrac5{18}, \tfrac49, \tfrac5{18})$ (Ordnung 6).`,
      t`Gauß-Gewichte sind positiv (also monoton) und symmetrisch: $b_k = \int_0^1 L_k^2\,dx > 0$.`,
      t`Mit Gewichtsfunktion $w(x)$ funktioniert dasselbe mit anderen Orthogonalpolynomen (Tschebyscheff, Jacobi, Laguerre, Hermite).`,
    ],
    mistakes: ['Glauben, mit s Knoten könne man jede beliebig hohe Ordnung erreichen.', 'Gauß-Knoten auf $[-1, 1]$ angeben, wenn Knoten in $[0, 1]$ gefragt sind.'],
    related: ['num.w.qf-ordnung', 'num.w.qf-fehler'],
    sources: [sk('80–83', 'Abschnitt 5.2.3, Satz 25, Satz 26, Satz 27, Beispiel 31')],
  }),
  wissen({
    id: 'num.w.qf-fehler',
    name: 'Quadraturfehler und summierte Formeln',
    short: 'Fehler = O(hᵖ)',
    chapterId: chQ,
    tex: t`\Big|\int_a^b f\,dx - Q_h(f)\Big| \le (b-a)\max_n \mathrm{err}_n = O(h^p)`,
    definition: 'Der Fehler einer Formel der Ordnung p auf einem Intervall der Länge h ist höchstens h^{p+1} · max|f^{(p)}| · ∫|K_p|, mit einer Konstante, die nur von der Formel abhängt (Peano-Kern). Zerlegt man [a, b] in Teilintervalle der Länge h und wendet die Formel auf jedes an (summierte Formel), ist der Gesamtfehler O(hᵖ).',
    keyPoints: [
      t`Peano (Satz 28): $E(f) = (b-a)^{p+1}\int_0^1 K_p(t)\,f^{(p)}(a + t(b-a))\,dt$.`,
      t`Konstanten $\int_0^1 |K_p|$: Mittelpunkt $\tfrac1{24}$, Trapez $\tfrac1{12}$, Simpson $\tfrac1{2880}$.`,
      t`Trapez auf einem Intervall: $|E| \le \tfrac{1}{12}(b-a)^3\max|f''|$. Summiert: $\le \tfrac{b-a}{12}h^2\max|f''|$.`,
      t`Halbiert man h, sinkt der Fehler etwa um den Faktor $2^p$: Mittelpunkt und Trapez ¼, Simpson $\tfrac1{16}$.`,
      t`Doppelt logarithmisch aufgetragen ist der Fehler eine Gerade mit Steigung p.`,
      t`Summierte Trapezregel von $T_N$ auf $T_{2N}$: nur die N Intervallmittelpunkte sind neu, $T_{2N} = \tfrac12 T_N + \tfrac h2\sum f(\text{Mittelpunkte})$.`,
      t`Für konvexe Integranden überschätzt die Trapezregel, die Mittelpunktregel unterschätzt; der Mittelpunkt-Fehler ist etwa halb so groß ($\tfrac1{24}$ vs. $\tfrac1{12}$).`,
      t`Adaptivität: Zerlegung so wählen, dass alle lokalen Fehler etwa gleich groß sind.`,
    ],
    mistakes: ['Die Ordnung p mit dem Exponenten $p + 1$ des lokalen Fehlers verwechseln.', 'Bei der summierten Trapezregel alle Funktionswerte neu berechnen.'],
    examTip: 'WS19/20: Fehlertabelle den Regeln zuordnen. Vorzeichen (konvex: Trapez +, Mittelpunkt −) und Faktor beim Verdoppeln von N (4 bzw. 16) verraten die Regel.',
    related: ['num.trapez-fehler', 'num.w.qf-ordnung', 'num.simpson'],
    sources: [sk('84–88', 'Abschnitt 5.2.4, Satz 28, Lemma 3, Beispiele 32, Abschnitt 5.2.5, Beispiel 33'), src('NUM-K-SS26', '4–5', 'Aufgabe 4')],
  }),
  {
    id: 'num.trapez-fehler',
    name: 'Fehlerschranke der Trapezregel',
    short: '(b−a)³/12 · max|f″|',
    chapterId: chQ,
    tex: t`|E(f)| \le \frac{(b-a)^3}{12}\max_{x \in [a,b]}|f''(x)|`,
    lhs: 'E',
    rhs: '(b-a)^3/12*M_2',
    variables: [vE, va, vb, vM2],
    assumptions: ['$f \\in C^2[a,b]$.', 'Einfache (nicht summierte) Trapezregel.'],
    intuition: 'Die Trapezregel integriert die Sehne statt f. Der Abstand zwischen f und der Sehne ist das Interpolations-Restglied ½(x − a)(x − b)f″(ξ). Integriert über [a, b] ergibt |(x − a)(x − b)| den Faktor (b − a)³/6, mit dem ½ also (b − a)³/12.',
    interpretation: 'Der Fehler wächst mit der dritten Potenz der Intervalllänge. Deshalb teilt man auf: Summiert ergibt sich (b − a)/12 · h² · max|f″|.',
    useCases: ['Fehler der Trapezregel abschätzen', 'Benötigte Gitterweite h für eine Toleranz bestimmen'],
    mistakes: ['Die Schranke mit $(b-a)^2$ statt $(b-a)^3$ schreiben (das wäre die Größenordnung nach Division durch b − a, also bei summierten Formeln mit h).'],
    rearranged: [{ tex: t`\Big|\int_a^b f\,dx - T_N(f)\Big| \le \frac{b-a}{12}h^2\max|f''|`, note: 'summierte Trapezregel' }],
    example: {
      problem: 'Fehlerschranke der Trapezregel für ∫₀¹ x² dx und Vergleich mit dem tatsächlichen Fehler.',
      steps: [t`$f'' = 2$, also $|E| \le \tfrac{1}{12} \cdot 2 = \tfrac16$.`, t`Trapez liefert $\tfrac12$, exakt ist $\tfrac13$: Fehler genau $\tfrac16$. Die Schranke ist hier scharf.`],
      result: '|E| ≤ 1/6',
    },
    related: ['num.w.qf-fehler', 'num.w.quadraturformel'],
    difficulty: 2,
    sources: [src('NUM-K-SS26', '4–5', 'Aufgabe 4 b)'), sk('87', 'Beispiele 32 (b)')],
    status: 'geprüft',
  },
]

export const exercises: Exercise[] = [
  // ------------------------------------------------------------ Newton
  mc({
    id: 'num.w.newton.e1', chapterId: chN, formulaIds: ['num.w.newton'], skill: 'abrufen', difficulty: 1, origin: 'klausur',
    prompt: 'Welches LGS wird in einem Schritt des Newton-Verfahrens gelöst?',
    options: opts(t`*$f'(x^k)\,d^k = -f(x^k)$, dann $x^{k+1} = x^k + d^k$`, [t`$f'(x^k)\,d^k = f(x^k)$, dann $x^{k+1} = x^k + d^k$`, 'Vorzeichen falsch: Man läuft von der Nullstelle weg.'], [t`$f(x^k)\,d^k = -f'(x^k)$`, 'Rollen von f und f′ vertauscht.'], [t`$x^{k+1} = f'(x^k)^{-1}f(x^k)$`, 'Hier fehlt $x^k$, und die Inverse rechnet man nicht explizit aus.']),
    hints: ['Linearisiere f in $x^k$ und setze die Linearisierung gleich 0.', '$f(x^k) + f\'(x^k)d = 0$.'],
    explanation: [t`$0 \approx f(x^k) + f'(x^k)d^k$ ⇒ $f'(x^k)d^k = -f(x^k)$.`],
    sources: [sk('50', 'Abschnitt 3.2'), src('NUM-K-SS26', '3', 'Aufgabe 3 a)')],
  }),
  mc({
    id: 'num.w.newton.e2', chapterId: chN, formulaIds: ['num.w.newton'], skill: 'auswaehlen', difficulty: 2, origin: 'tutorium',
    prompt: 'Warum ist $\\|d^k\\| < \\varepsilon$ ein besseres Stoppkriterium als $\\|f(x^k)\\| < \\varepsilon$?',
    options: opts(
      '*Ersetzt man f durch $\\lambda f$ ($\\lambda \\neq 0$), bleiben die Iterierten gleich, $\\|f(x^k)\\|$ ändert sich aber beliebig.',
      ['$\\|f(x^k)\\|$ lässt sich nicht berechnen.', 'Es lässt sich berechnen, wird nur willkürlich durch Skalierung beeinflusst.'],
      ['$\\|d^k\\|$ ist immer kleiner als $\\|f(x^k)\\|$.', 'Das stimmt im Allgemeinen nicht.'],
      ['Mit $\\|f(x^k)\\|$ würde das Verfahren nie stoppen.', 'Es kann stoppen, nur zu früh oder zu spät.'],
    ),
    hints: ['Was passiert mit den Newton-Iterierten, wenn man f mit einer Konstanten multipliziert?', 'Übungsblatt 1, Aufgabe 1.'],
    explanation: ['Newton ist invariant gegenüber $f \\to Bf$ mit regulärem B. Ein gutes Stoppkriterium sollte diese Invarianz auch haben.'],
    sources: [sk('50', 'Bemerkung 21'), src('NUM-UB01', '1', 'Aufgabe 1 b)')],
  }),
  numeric({
    id: 'num.w.newton.e3', chapterId: chN, formulaIds: ['num.w.newton'], skill: 'anwenden', difficulty: 2, origin: 'app',
    prompt: 'Newton für $f(x) = x^2 - 3$ (also $\\sqrt3$) mit Startwert $x_0 = 2$. Berechne $x_1$.',
    answer: 1.75, fmt: fmt.num(4),
    wrong: [{ value: 2.25, explanation: 'Vorzeichen falsch: $x_1 = x_0 - f(x_0)/f\'(x_0) = 2 - 1/4$.' }],
    hints: ['$x_{k+1} = \\tfrac12(x_k + 3/x_k)$.', '$\\tfrac12(2 + 1{,}5)$'],
    explanation: ['$x_1 = 2 - \\dfrac{4 - 3}{4} = 1{,}75$ ($\\sqrt3 \\approx 1{,}7321$).'],
    sources: [sk('48–50', 'Beispiel 18, Beispiele 19 (a)')],
  }),
  trueFalse({
    id: 'num.w.newton.e4', chapterId: chN, formulaIds: ['num.w.newton'], skill: 'interpretieren', difficulty: 2, origin: 'tutorium',
    prompt: 'Richtig oder falsch?',
    statements: [
      ['Für $f(x) = Ax - b$ mit regulärem A liefert Newton nach einem Schritt die exakte Lösung.', true, '$x^1 = x^0 - A^{-1}(Ax^0 - b) = A^{-1}b$.'],
      ['Newton angewendet auf $Bf(x) = 0$ (B regulär) liefert andere Iterierte als für $f(x) = 0$.', false, 'Die Iterierten sind identisch, B kürzt sich heraus.'],
      ['Im Eindimensionalen ist $x_{k+1}$ der Schnittpunkt der Tangente in $(x_k, f(x_k))$ mit der x-Achse.', true, 'Geometrische Deutung.'],
    ],
    hints: ['$(Bf)\' = Bf\'$.', 'Lineare Funktion: Linearisierung ist exakt.'],
    sources: [src('NUM-UB01', '1', 'Aufgabe 1 a), d)'), sk('50', 'Abschnitt 3.3')],
  }),
  numeric({
    id: 'num.newton-1d.e1', chapterId: chN, formulaIds: ['num.newton-1d'], skill: 'einsetzen', difficulty: 1, origin: 'app',
    prompt: 'Es ist $x_k = 2$, $f(x_k) = 1$ und $f\'(x_k) = 4$. Berechne $x_{k+1}$.',
    answer: 1.75, fmt: fmt.num(4),
    wrong: [{ value: 2.25, explanation: 'Plus statt Minus.' }, { value: -2, explanation: 'Du hast $f\'/f$ statt $f/f\'$ gerechnet.' }],
    hints: ['$x_{k+1} = x_k - f(x_k)/f\'(x_k)$', '$2 - 1/4$'],
    explanation: ['$x_{k+1} = 2 - 0{,}25 = 1{,}75$.'],
    sources: [sk('50')],
  }),
  numeric({
    id: 'num.newton-1d.e2', chapterId: chN, formulaIds: ['num.newton-1d'], skill: 'anwenden', difficulty: 2, origin: 'tutorium',
    prompt: 'Kehrwert ohne Division: Newton für $1/9$ liefert $x_{k+1} = x_k(2 - 9x_k)$. Berechne $x_2$ für $x_0 = 0{,}1$.',
    answer: 0.1111, fmt: fmt.num(4),
    wrong: [{ value: 0.11, explanation: 'Das ist erst $x_1$.' }],
    hints: ['$x_1 = 0{,}1 \\cdot 1{,}1$', '$x_2 = 0{,}11 \\cdot (2 - 0{,}99)$'],
    explanation: ['$x_1 = 0{,}11$, $x_2 = 0{,}11 \\cdot 1{,}01 = 0{,}1111$. Die richtigen Stellen verdoppeln sich.'],
    sources: [src('NUM-UB01', '1–2', 'Aufgabe 2 c) mit Lösung')],
  }),

  // ------------------------------------------------------------ Konvergenz
  mc({
    id: 'num.w.newton-konvergenz.e1', chapterId: chN, formulaIds: ['num.w.newton-konvergenz'], skill: 'abrufen', difficulty: 1, origin: 'app',
    prompt: 'Was bedeutet „lokal quadratische Konvergenz“ beim Newton-Verfahren?',
    options: opts(
      '*Für Startwerte nahe genug an $x^*$ gilt $\\|x^* - x^k\\| \\le C\\|x^* - x^{k-1}\\|^2$: Die Zahl richtiger Stellen verdoppelt sich etwa.',
      ['Für jeden Startwert konvergiert das Verfahren, und zwar quadratisch.', 'Nein, nur lokal. Weit weg kann es divergieren.'],
      ['Der Fehler halbiert sich in jedem Schritt.', 'Das wäre lineare Konvergenz mit Faktor ½.'],
      ['Man braucht genau zwei Schritte.', 'Das gilt nur für lineare Probleme (sogar ein Schritt).'],
    ),
    hints: ['„Lokal“ bezieht sich auf den Startwert.', '„Quadratisch“ bezieht sich auf den Fehler.'],
    explanation: ['Satz 9 und Bemerkungen 22.'],
    sources: [sk('52', 'Satz 9, Bemerkungen 22')],
  }),
  numeric({
    id: 'num.w.newton-konvergenz.e2', chapterId: chN, formulaIds: ['num.w.newton-konvergenz'], skill: 'anwenden', difficulty: 2, origin: 'vorlesung',
    prompt: 'Newton für $f(x) = x^3$ ergibt $x_{k+1} = \\tfrac23 x_k$. Wie groß ist $x_3$ für $x_0 = 1$? (4 Nachkommastellen)',
    answer: 8 / 27, fmt: fmt.num(4),
    hints: ['$x_{k+1} = x_k - x_k^3/(3x_k^2)$.', '$(2/3)^3$'],
    explanation: ['$x_3 = (2/3)^3 = 8/27 \\approx 0{,}2963$. Nur lineare Konvergenz, weil $f\'(x^*) = 0$ und Satz 9 nicht anwendbar ist.'],
    sources: [sk('53', 'Beispiel 21')],
  }),
  trueFalse({
    id: 'num.w.newton-konvergenz.e3', chapterId: chN, formulaIds: ['num.w.newton-konvergenz'], skill: 'interpretieren', difficulty: 2, origin: 'app',
    prompt: 'Richtig oder falsch?',
    statements: [
      ['Für Satz 9 muss die Jacobi-Matrix in der Nullstelle regulär sein.', true, 'Im Eindimensionalen: $f\'(x^*) \\neq 0$.'],
      ['Für $f(x) = 1/x - 1$ und $x_0 = 3$ konvergiert Newton gegen 1.', false, 'Für $x_0 > 2$ wird $x_1 < 0$, dann divergiert es gegen $-\\infty$.'],
      ['Das gedämpfte Newton-Verfahren verbessert die globale Konvergenz, konvergiert aber nur linear.', true, 'Bemerkungen 22 5).'],
      ['Ist $\\|f(x^k)\\|$ klein, ist auch der Fehler $\\|x^k - x^*\\|$ sicher klein.', false, 'Nicht bei großem $\\|f\'(x^*)^{-1}\\|$ (schlechte Kondition).'],
    ],
    hints: ['Zeichne die Tangenten für $1/x - 1$.', '$x^k - x^* \\approx f\'(x^*)^{-1}f(x^k)$.'],
    sources: [sk('50–53'), src('NUM-K-SS26', '3', 'Aufgabe 3 c)')],
  }),

  // ------------------------------------------------------------ Varianten
  mc({
    id: 'num.w.newton-varianten.e1', chapterId: chN, formulaIds: ['num.w.newton-varianten'], skill: 'abrufen', difficulty: 1, origin: 'klausur',
    prompt: 'Was unterscheidet das vereinfachte Newton-Verfahren vom Newton-Verfahren?',
    options: opts(
      '*Es verwendet eine feste Matrix $A \\approx f\'(x^0)$, braucht nur eine LR-Zerlegung und konvergiert linear.',
      ['Es braucht keine LR-Zerlegung und konvergiert quadratisch.', 'Eine LR-Zerlegung braucht es einmal; die Konvergenz ist nur linear.'],
      ['Es verwendet die Hesse-Matrix.', 'Das ist Newton für Minimierungsprobleme.'],
      ['Es löst in jedem Schritt ein Ausgleichsproblem.', 'Das ist Gauß-Newton.'],
    ),
    hints: ['Was ist im Newton-Verfahren pro Schritt teuer?', 'Was geht verloren, wenn man die Ableitung einfriert?'],
    explanation: ['Pro Schritt nur Vorwärts- und Rückwärtssubstitution ($N^2$) statt neuer Jacobi-Matrix und LR ($\\tfrac13 N^3$); dafür lineare Konvergenz (Satz 10).'],
    sources: [sk('53', 'Abschnitt 3.5, Satz 10'), src('NUM-K-WS2021', '4', 'Aufgabe 6 b)')],
  }),
  mc({
    id: 'num.w.newton-varianten.e2', chapterId: chN, formulaIds: ['num.w.newton-varianten'], skill: 'abrufen', difficulty: 2, origin: 'app',
    prompt: 'Wie lautet der Newton-Schritt zur Minimierung von $f: \\mathbb{R}^N \\to \\mathbb{R}$?',
    options: opts(t`*$x^{k+1} = x^k - H_f(x^k)^{-1}\nabla f(x^k)$`, [t`$x^{k+1} = x^k - \nabla f(x^k)^{-1} f(x^k)$`, 'Gesucht ist eine Nullstelle des Gradienten, nicht von f.'], [t`$x^{k+1} = x^k - \nabla f(x^k)$`, 'Das ist ein Gradientenverfahren mit Schrittweite 1.'], [t`$x^{k+1} = x^k + H_f(x^k)\nabla f(x^k)$`, 'Die Hesse-Matrix wird invertiert (bzw. ein LGS gelöst), und das Vorzeichen stimmt nicht.']),
    hints: ['Im Minimum gilt $\\nabla f = 0$.', 'Newton auf $\\nabla f$ anwenden: Dessen Jacobi-Matrix ist die Hesse-Matrix.'],
    explanation: ['Abschnitt 3.6.1: Newton für die Nullstelle des Gradienten.'],
    sources: [sk('54', 'Abschnitt 3.6.1')],
  }),
  trueFalse({
    id: 'num.w.newton-varianten.e3', chapterId: chN, formulaIds: ['num.w.newton-varianten'], skill: 'interpretieren', difficulty: 2, origin: 'app',
    prompt: 'Richtig oder falsch?',
    statements: [
      ['Gauß-Newton löst in jedem Schritt ein lineares Ausgleichsproblem.', true, '$\\|f\'(x^k)d^k + f(x^k)\\|_2 = \\min!$'],
      ['Ist die Jacobi-Matrix teuer, kann man sie durch Differenzenquotienten annähern.', true, 'Bemerkungen 22 6).'],
      ['Ein Schritt des vereinfachten Newton-Verfahrens kostet wie ein Newton-Schritt etwa $\\tfrac13 N^3$.', false, 'Die LR-Zerlegung von A wird wiederverwendet; pro Schritt nur etwa $N^2$.'],
    ],
    hints: ['Was wird im vereinfachten Verfahren wiederverwendet?', 'Gauß-Newton: Was wird in jedem Schritt minimiert?'],
    sources: [sk('53–54')],
  }),

  // ------------------------------------------------------------ Interpolation
  mc({
    id: 'num.w.interpolation.e1', chapterId: chI, formulaIds: ['num.w.interpolation'], skill: 'abrufen', difficulty: 1, origin: 'klausur',
    prompt: 'Wie viele Stützpunkte (mit paarweise verschiedenen Stützstellen) legen ein Polynom vom Grad ≤ N eindeutig fest?',
    options: opts('*$N + 1$', ['$N$', 'Durch zwei Punkte geht genau eine Gerade (N = 1), also N + 1.'], ['$N + 2$', 'Einer zu viel.'], ['$2N$', 'Nein.']),
    hints: ['Gerade = Grad 1.', 'Ein Polynom vom Grad N hat N + 1 Koeffizienten.'],
    explanation: ['Satz 12: Zu N + 1 Stützpunkten gibt es genau ein Interpolationspolynom vom Grad ≤ N.'],
    sources: [sk('56', 'Satz 12'), src('NUM-K-WS1718', '3', 'Aufgabe 6 b)')],
  }),
  numeric({
    id: 'num.w.interpolation.e2', chapterId: chI, formulaIds: ['num.w.interpolation'], skill: 'anwenden', difficulty: 2, origin: 'app',
    prompt: 'Stützstellen $x_0 = 0$, $x_1 = 1$, $x_2 = 3$. Berechne den Wert des Lagrange-Polynoms $L_1$ an der Stelle $x = 2$.',
    answer: 1, fmt: fmt.num(4),
    wrong: [{ value: -1, explanation: 'Vorzeichen im Nenner prüfen: $(1-0)(1-3) = -2$.' }, { value: 0, explanation: '$L_1$ ist 0 nur in den anderen Stützstellen 0 und 3.' }],
    hints: ['$L_1(x) = \\dfrac{(x-0)(x-3)}{(1-0)(1-3)}$', 'Zähler bei $x = 2$: $2 \\cdot (-1) = -2$.'],
    explanation: ['$L_1(2) = \\dfrac{2 \\cdot (-1)}{1 \\cdot (-2)} = 1$.'],
    sources: [sk('56', '(4.1)')],
  }),
  trueFalse({
    id: 'num.w.interpolation.e3', chapterId: chI, formulaIds: ['num.w.interpolation'], skill: 'interpretieren', difficulty: 2, origin: 'app',
    prompt: 'Richtig oder falsch?',
    statements: [
      ['$L_n(x_m) = 1$ für $m = n$ und $0$ sonst.', true, '(4.1).'],
      ['$\\sum_n L_n(x) = 1$ für alle x.', true, 'Interpolationspolynom der konstanten Funktion 1.'],
      ['Kommt ein Stützpunkt hinzu, bleiben die bisherigen Lagrange-Polynome gleich.', false, 'Jedes $L_n$ bekommt einen neuen Faktor. Deshalb ist Newton bei neuen Punkten besser.'],
    ],
    hints: ['Welche Nullstellen hat $L_n$?', 'Welches Polynom interpoliert die Daten $f_n = 1$?'],
    sources: [sk('56–58, 64')],
  }),

  // ------------------------------------------------------------ Newton-Interpolation
  numeric({
    id: 'num.w.newton-interpolation.e1', chapterId: chI, formulaIds: ['num.w.newton-interpolation'], skill: 'anwenden', difficulty: 1, origin: 'app',
    prompt: 'Berechne die dividierte Differenz $f_{0,1}$ zu $(x_0, f_0) = (1, 16)$ und $(x_1, f_1) = (3, 4)$.',
    answer: -6, fmt: fmt.num(2),
    wrong: [{ value: 6, explanation: 'Zähler und Nenner müssen in derselben Reihenfolge stehen: $(16 - 4)/(1 - 3)$.' }],
    hints: ['$f_{0,1} = \\dfrac{f_0 - f_1}{x_0 - x_1}$', '$\\dfrac{12}{-2}$'],
    explanation: ['$f_{0,1} = (16 - 4)/(1 - 3) = -6$.'],
    sources: [src('NUM-K-WS2021', '1', 'Aufgabe 2 b)')],
  }),
  numeric({
    id: 'num.w.newton-interpolation.e2', chapterId: chI, formulaIds: ['num.w.newton-interpolation'], skill: 'anwenden', difficulty: 2, origin: 'klausur',
    prompt: 'Zu $(1, 16)$, $(3, 4)$, $(5, 8)$ ist $f_{0,1} = -6$ und $f_{1,2} = 2$. Berechne den Leitkoeffizienten $f_{0,2}$ der Newton-Darstellung.',
    answer: 2, fmt: fmt.num(2),
    wrong: [{ value: -2, explanation: 'Nenner ist $x_0 - x_2 = 1 - 5 = -4$, Zähler $f_{0,1} - f_{1,2} = -8$.' }, { value: -4, explanation: 'Im Nenner gehört $x_0 - x_2$, nicht $x_0 - x_1$.' }],
    hints: ['$f_{0,2} = \\dfrac{f_{0,1} - f_{1,2}}{x_0 - x_2}$', '$\\dfrac{-6 - 2}{1 - 5}$'],
    explanation: ['$f_{0,2} = (-8)/(-4) = 2$, also $p(x) = 16 - 6(x - 1) + 2(x - 1)(x - 3)$.'],
    sources: [src('NUM-K-WS2021', '1', 'Aufgabe 2 b) mit Lösungsskizze')],
  }),
  mc({
    id: 'num.w.newton-interpolation.e3', chapterId: chI, formulaIds: ['num.w.newton-interpolation'], skill: 'auswaehlen', difficulty: 2, origin: 'app',
    prompt: 'Zu einem Interpolationspolynom soll später noch ein Stützpunkt hinzukommen. Welche Darstellung ist am günstigsten?',
    options: opts('*Newton-Darstellung: eine Zeile im Schema ergänzen, einen Term anhängen.', ['Lagrange-Darstellung', 'Alle Lagrange-Polynome ändern sich.'], ['Monomdarstellung', 'Alle Koeffizienten müssen neu bestimmt werden (LGS).'], ['Alle Darstellungen sind gleich aufwendig.', 'Nein, das ist gerade der Vorteil von Newton (Adaptivität).']),
    hints: ['Welche Basisfunktionen hängen nur von den bisherigen Stützstellen ab?', 'Newton-Polynom $w_k$ enthält nur $x_0, \\dots, x_{k-1}$.'],
    explanation: ['$p_{0,N+1} = p_{0,N} + f_{0,N+1}w_{N+1}$: Die alten Koeffizienten bleiben.'],
    sources: [sk('59, 64', '(4.5), Zusammenfassung 4.1.5')],
  }),

  // ------------------------------------------------------------ Interpolationsfehler
  mc({
    id: 'num.w.interpolationsfehler.e1', chapterId: chI, formulaIds: ['num.w.interpolationsfehler'], skill: 'abrufen', difficulty: 2, origin: 'klausur',
    prompt: 'Wie lauten die Tschebyscheff-Stützstellen auf $[-1, 1]$ für ein Polynom vom Grad ≤ N?',
    options: opts(t`*$x_n = \cos\big(\tfrac{2n+1}{2N+2}\pi\big)$, $n = 0, \dots, N$`, [t`$x_n = -1 + \tfrac{2n}{N}$`, 'Das sind äquidistante Stützstellen.'], [t`$x_n = \cos\big(\tfrac{n\pi}{N}\big)$`, 'Das sind die Extremstellen von $T_N$, nicht die Nullstellen von $T_{N+1}$.'], [t`$x_n = \sin\big(\tfrac{2n+1}{2N+2}\pi\big)$`, 'Kosinus, nicht Sinus.']),
    hints: ['Es sind die Nullstellen von $T_{N+1}(x) = \\cos((N+1)\\arccos x)$.', '$\\cos((N+1)\\theta) = 0$ für $(N+1)\\theta = \\tfrac{2n+1}{2}\\pi$.'],
    explanation: ['Definition 8: Nullstellen von $T_{N+1}$.'],
    sources: [sk('63', 'Definition 8'), src('NUM-K-WS1718', '3', 'Aufgabe 6 c)')],
  }),
  numeric({
    id: 'num.w.interpolationsfehler.e2', chapterId: chI, formulaIds: ['num.w.interpolationsfehler'], skill: 'anwenden', difficulty: 2, origin: 'klausur',
    prompt: 'Fehlerschranke für $\\sin$ auf $[-1, 1]$ mit Tschebyscheff-Stützstellen: $\\dfrac{2^{-N}}{(N+1)!}$. Wie groß ist die Schranke für $N = 3$? (auf 6 Nachkommastellen)',
    answer: 1 / 192, fmt: fmt.num(6),
    wrong: [{ value: 1 / 24, explanation: 'Das ist die Schranke für N = 2.' }],
    hints: ['$2^{-3} = \\tfrac18$, $4! = 24$.', '$\\tfrac{1}{8 \\cdot 24}$'],
    explanation: ['$\\tfrac{1}{192} \\approx 0{,}005208 < 10^{-2}$. Für N = 2 ist sie $\\tfrac1{24} > 10^{-2}$, also ist N = 3 minimal.'],
    sources: [src('NUM-K-WS2021', '1', 'Aufgabe 2 d) mit Lösungsskizze')],
  }),
  trueFalse({
    id: 'num.w.interpolationsfehler.e3', chapterId: chI, formulaIds: ['num.w.interpolationsfehler'], skill: 'interpretieren', difficulty: 2, origin: 'vorlesung',
    prompt: 'Richtig oder falsch?',
    statements: [
      ['Bei äquidistanten Stützstellen wächst die Lebesgue-Konstante mit N sehr schnell (N = 20: etwa $10^4$).', true, 'Beispiel 22.'],
      ['Mehr äquidistante Stützstellen verbessern die Interpolation von $1/(1 + (\\alpha x)^2)$ immer.', false, 'Am Rand entstehen starke Oszillationen (Beispiel 25).'],
      ['Für Tschebyscheff-Stützstellen ist $\\max_{[-1,1]}|w_{N+1}| = 2^{-N}$, das kleinstmögliche Maximum.', true, 'Satz 16.'],
      ['Die Lebesgue-Konstante ist immer mindestens 1.', true, 'Weil $\\sum L_n \\equiv 1$.'],
    ],
    hints: ['Erinnere dich an die Tabelle in Beispiel 22.', '$\\sum_n L_n \\equiv 1$ – was folgt für das Maximum von $\\sum|L_n|$?'],
    sources: [sk('57–64', 'Satz 13, Beispiel 22, Satz 16, Beispiel 25')],
  }),

  // ------------------------------------------------------------ Splines
  mc({
    id: 'num.w.spline.e1', chapterId: chS, formulaIds: ['num.w.spline'], skill: 'abrufen', difficulty: 1, origin: 'klausur',
    prompt: 'Welche Randbedingung gehört zum **natürlichen** kubischen Spline?',
    options: opts(t`*$s''(a) = s''(b) = 0$`, [t`$s'(a) = v_0$, $s'(b) = v_N$`, 'Das ist der eingespannte (Hermite-)Spline.'], [t`$s'(a) = s'(b)$, $s''(a) = s''(b)$`, 'Das ist der periodische Spline.'], [t`$s(a) = s(b) = 0$`, 'Werte an den Rändern sind durch die Interpolation festgelegt.']),
    hints: ['Natürlich: keine Krümmung an den Enden.', 'Krümmung wird durch die zweite Ableitung beschrieben.'],
    explanation: ['Definition 10 (ii).'],
    sources: [sk('67', 'Definition 10')],
  }),
  numeric({
    id: 'num.w.spline.e2', chapterId: chS, formulaIds: ['num.w.spline'], skill: 'anwenden', difficulty: 2, origin: 'klausur',
    prompt: t`$s(x) = 2 + 2x + 2x^2 - 2x^3$ auf $[0, 1]$ und $s(x) = -1 + cx - 7x^2 + dx^3$ auf $[1, 2]$ sollen bei $x = 1$ im Wert und in der ersten Ableitung übereinstimmen. Bestimme d.`,
    answer: 1, fmt: fmt.num(2),
    hints: ['Wert: $4 = -1 + c - 7 + d$, also $c + d = 12$.', 'Ableitung: $s_1\'(1) = 2 + 4 - 6 = 0 = c - 14 + 3d$.', 'Zweite Gleichung minus erste: $2d = 2$.'],
    explanation: ['$c + d = 12$ und $c + 3d = 14$ ⇒ $d = 1$, $c = 11$. Probe: $s\'\'$ links $4 - 12 = -8$, rechts $-14 + 6 = -8$ ✓.'],
    status: 'abgeleitet',
    sources: [src('NUM-K-SS20', '2', 'Aufgabe 3 a)')],
  }),
  trueFalse({
    id: 'num.w.spline.e3', chapterId: chS, formulaIds: ['num.w.spline'], skill: 'interpretieren', difficulty: 2, origin: 'app',
    prompt: 'Richtig oder falsch?',
    statements: [
      ['Ein kubischer Spline ist auf ganz $[a, b]$ zweimal stetig differenzierbar.', true, 'Teil der Definition.'],
      ['Der natürliche Spline minimiert $\\int_a^b |s\'\'|^2\\,dx$ unter allen $C^2$-Funktionen durch die Stützpunkte.', true, 'Bemerkungen 27 2).'],
      ['Periodische Splines sind für beliebige Daten sinnvoll.', false, 'Nur für $y_0 = y_N$.'],
      ['Ohne Randbedingungen ist ein kubischer Spline eindeutig.', false, 'Es fehlen genau zwei Bedingungen.'],
    ],
    hints: ['Zähle Unbekannte und Bedingungen.', 'Minimaleigenschaft: Welches Integral wird klein?'],
    sources: [sk('65–68')],
  }),

  // ------------------------------------------------------------ Spline-Konstruktion
  mc({
    id: 'num.w.spline-konstruktion.e1', chapterId: chS, formulaIds: ['num.w.spline-konstruktion'], skill: 'abrufen', difficulty: 2, origin: 'app',
    prompt: 'Welche Struktur hat das Gleichungssystem für die Momente $\\gamma_n$ eines kubischen Splines?',
    options: opts('*Symmetrisch, tridiagonal und strikt diagonaldominant, lösbar in $O(N)$.', ['Vollbesetzt, Aufwand $\\tfrac13 N^3$.', 'Jede Gleichung koppelt nur benachbarte Momente.'], ['Dreiecksmatrix, löst man durch Rückwärtssubstitution.', 'Es ist tridiagonal, nicht dreieckig.'], ['Diagonalmatrix', 'Benachbarte Momente sind gekoppelt.']),
    hints: ['Die Bedingung bei $x_n$ enthält $\\gamma_{n-1}, \\gamma_n, \\gamma_{n+1}$.', 'Welche Matrixstruktur hat ein System, in dem jede Zeile nur drei Nachbarn koppelt?'],
    explanation: ['Bemerkungen 28: Cholesky mit Bandstruktur, $O(N)$.'],
    sources: [sk('69–70', 'Bemerkungen 28')],
  }),
  numeric({
    id: 'num.w.spline-konstruktion.e2', chapterId: chS, formulaIds: ['num.w.spline-konstruktion'], skill: 'anwenden', difficulty: 2, origin: 'app',
    prompt: 'Fehlerschranke eingespannter Splines: $\\tfrac{5}{384}h^4\\max|f^{(4)}|$. Um welchen Faktor sinkt die Schranke, wenn man h halbiert?',
    answer: 16, fmt: fmt.num(0),
    wrong: [{ value: 4, explanation: 'Das wäre bei $h^2$. Hier geht h mit der vierten Potenz ein.' }],
    hints: ['$(h/2)^4 = h^4/16$.', 'Der Exponent von h bestimmt den Faktor.'],
    explanation: ['Faktor $2^4 = 16$.'],
    sources: [sk('72', 'Satz 20')],
  }),
  trueFalse({
    id: 'num.w.spline-konstruktion.e3', chapterId: chS, formulaIds: ['num.w.spline-konstruktion'], skill: 'interpretieren', difficulty: 2, origin: 'app',
    prompt: 'Richtig oder falsch?',
    statements: [
      ['Bei äquidistanter Unterteilung ist die Lebesgue-Konstante der Spline-Interpolation höchstens 2, für jedes N.', true, 'Satz 19.'],
      ['Eine Störung eines einzelnen $y_n$ verändert den Spline überall stark.', false, 'Störungen wirken nur lokal (Bemerkungen 29 2).'],
      ['Durch den Ansatz mit Momenten ist die Stetigkeit von $s\'\'$ automatisch erfüllt.', true, 'Die Gleichungen kommen aus der Stetigkeit von $s\'$.'],
    ],
    hints: ['Vergleiche mit der Polynominterpolation bei äquidistanten Stützstellen.', 'Satz 19: Lagrange-Splines.'],
    sources: [sk('68–72')],
  }),

  // ------------------------------------------------------------ Quadraturformeln
  mc({
    id: 'num.w.quadraturformel.e1', chapterId: chQ, formulaIds: ['num.w.quadraturformel'], skill: 'abrufen', difficulty: 1, origin: 'klausur',
    prompt: 'Welche Gewichte und Knoten hat die Simpsonregel?',
    options: opts(t`*$b = (\tfrac16, \tfrac46, \tfrac16)$, $c = (0, \tfrac12, 1)$`, [t`$b = (\tfrac13, \tfrac13, \tfrac13)$, $c = (0, \tfrac12, 1)$`, 'Die Mitte zählt mehr.'], [t`$b = (\tfrac12, \tfrac12)$, $c = (0, 1)$`, 'Das ist die Trapezregel.'], [t`$b = (\tfrac14, \tfrac12, \tfrac14)$, $c = (0, \tfrac12, 1)$`, 'Dann wäre $\\int x^2 = \\tfrac38 \\neq \\tfrac13$.']),
    hints: ['Gewichte summieren sich zu 1.', 'Mittelpunkt viermal so stark wie ein Rand.'],
    explanation: ['Beispiel 28.'],
    sources: [sk('75', 'Beispiel 28'), src('NUM-K-SS20', '3', 'Aufgabe 4 a)')],
  }),
  numeric({
    id: 'num.w.quadraturformel.e2', chapterId: chQ, formulaIds: ['num.w.quadraturformel'], skill: 'anwenden', difficulty: 1, origin: 'app',
    prompt: 'Berechne die Trapezregel für $\\int_0^2 x^3\\,dx$.',
    answer: 8, fmt: fmt.num(2),
    wrong: [{ value: 4, explanation: 'Der Faktor $(b - a) = 2$ fehlt.' }],
    hints: ['$(b-a)\\dfrac{f(a) + f(b)}{2}$', '$2 \\cdot \\dfrac{0 + 8}{2}$'],
    explanation: ['$2 \\cdot 4 = 8$, exakt wäre 4.'],
    sources: [sk('73', 'Beispiele 27 (c)')],
  }),
  numeric({
    id: 'num.w.quadraturformel.e3', chapterId: chQ, formulaIds: ['num.w.quadraturformel'], skill: 'anwenden', difficulty: 2, origin: 'app',
    prompt: 'Relative Kondition des Integrals: $\\mathrm{cond}_1(f) = I(|f|)/|I(f)|$. Berechne sie für $f(x) = \\sin x$ auf $[0, 3\\pi/2]$. (2 Nachkommastellen)',
    answer: 3, fmt: fmt.num(2),
    hints: ['$I(f) = [-\\cos x]_0^{3\\pi/2} = 1$.', '$I(|f|) = \\int_0^\\pi \\sin + \\int_\\pi^{3\\pi/2} |\\sin| = 2 + 1$.'],
    explanation: ['$\\mathrm{cond}_1 = 3/1 = 3$. Positive und negative Flächen löschen sich teilweise aus.'],
    sources: [sk('74–75', 'Satz 21')],
  }),
  numeric({
    id: 'num.simpson.e1', chapterId: chQ, formulaIds: ['num.simpson'], skill: 'einsetzen', difficulty: 1, origin: 'app',
    prompt: 'Simpsonregel für $\\int_0^2 x^3\\,dx$: Es ist $f(0) = 0$, $f(1) = 1$, $f(2) = 8$. Berechne S.',
    answer: 4, fmt: fmt.num(4),
    wrong: [{ value: 2, explanation: 'Faktor $\\tfrac{b-a}{6} = \\tfrac13$, nicht $\\tfrac16$.' }],
    hints: ['$\\tfrac{2}{6}(0 + 4 \\cdot 1 + 8)$', '$S = \\tfrac{b-a}{6}(f(a) + 4f(m) + f(b))$'],
    explanation: ['$S = \\tfrac13 \\cdot 12 = 4$, genau der exakte Wert: Simpson ist für Grad 3 exakt (Ordnung 4).'],
    sources: [sk('73, 78', 'Beispiele 27 (d), Beispiel 30')],
  }),
  mc({
    id: 'num.simpson.e2', chapterId: chQ, formulaIds: ['num.simpson'], skill: 'erkennen', difficulty: 1, origin: 'app',
    prompt: 'Welche Formel ist die Simpsonregel?',
    options: opts(t`*$\tfrac{b-a}{6}\big(f(a) + 4f(\tfrac{a+b}{2}) + f(b)\big)$`, [t`$\tfrac{b-a}{2}\big(f(a) + f(b)\big)$`, 'Trapezregel.'], [t`$(b-a)\,f(\tfrac{a+b}{2})$`, 'Mittelpunktregel.'], [t`$\tfrac{b-a}{4}\big(f(a) + 2f(\tfrac{a+b}{2}) + f(b)\big)$`, 'Das ist zweimal die Trapezregel auf den Hälften.']),
    hints: ['Gewichte 1, 4, 1 geteilt durch 6.', 'Der Mittelpunkt zählt am meisten.'],
    explanation: ['Parabel durch drei Punkte, exakt integriert.'],
    sources: [sk('73')],
  }),

  // ------------------------------------------------------------ Ordnung
  mc({
    id: 'num.w.qf-ordnung.e1', chapterId: chQ, formulaIds: ['num.w.qf-ordnung'], skill: 'abrufen', difficulty: 1, origin: 'klausur',
    prompt: 'Eine Quadraturformel hat Ordnung p. Was heißt das?',
    options: opts('*Sie integriert alle Polynome vom Grad ≤ p − 1 exakt, und p ist maximal.', ['Sie integriert alle Polynome vom Grad ≤ p exakt.', 'Grad ≤ p − 1, nicht ≤ p.'], ['Sie hat p Knoten.', 'Die Knotenzahl ist s; die Ordnung kann bis 2s gehen.'], ['Ihr Fehler ist $O(h^{p+1})$ auf dem ganzen Intervall.', 'Lokal ja, summiert ist er $O(h^p)$.']),
    hints: ['Mittelpunktregel: Ordnung 2, exakt für Geraden.', 'Ordnungsbedingungen gelten für $q = 1, \\dots, p$.'],
    explanation: ['Definition 11.'],
    sources: [sk('77', 'Definition 11'), src('NUM-K-WS1718', '3', 'Aufgabe 6 a) (i)')],
  }),
  numeric({
    id: 'num.w.qf-ordnung.e2', chapterId: chQ, formulaIds: ['num.w.qf-ordnung'], skill: 'anwenden', difficulty: 2, origin: 'app',
    prompt: 'Welche Ordnung hat die Trapezregel ($b = (\\tfrac12, \\tfrac12)$, $c = (0, 1)$)? Prüfe die Ordnungsbedingungen.',
    answer: 2, fmt: fmt.int(),
    wrong: [{ value: 3, explanation: '$q = 3$: $\\tfrac12 \\cdot 0 + \\tfrac12 \\cdot 1 = \\tfrac12 \\neq \\tfrac13$.' }, { value: 1, explanation: '$q = 2$ ist erfüllt: $\\tfrac12 \\cdot 0 + \\tfrac12 \\cdot 1 = \\tfrac12$.' }],
    hints: ['$q = 1$: $\\sum b_k = 1$.', '$q = 2$: $\\sum b_k c_k = \\tfrac12$?', '$q = 3$: $\\sum b_k c_k^2 = \\tfrac13$?'],
    explanation: ['$q = 1, 2$ erfüllt, $q = 3$ nicht ⇒ Ordnung 2.'],
    sources: [sk('78', 'Beispiel 30'), src('NUM-K-SS26', '4', 'Aufgabe 4 a)')],
  }),
  numeric({
    id: 'num.w.qf-ordnung.e3', chapterId: chQ, formulaIds: ['num.w.qf-ordnung'], skill: 'anwenden', difficulty: 3, origin: 'klausur',
    prompt: 'Symmetrische Formel mit $c = (\\tfrac14, \\tfrac12, \\tfrac34)$ und Ordnung ≥ 3. Berechne das Gewicht $b_2$.',
    answer: -1 / 3, fmt: fmt.num(4),
    hints: ['$b_1 = b_3$ und $2b_1 + b_2 = 1$.', '$q = 3$: $b_1(\\tfrac1{16} + \\tfrac9{16}) + b_2 \\cdot \\tfrac14 = \\tfrac13$.', 'Ergibt $b_1 = \\tfrac23$.'],
    explanation: ['$b_1 = b_3 = \\tfrac23$, $b_2 = -\\tfrac13$. Die Formel hat Ordnung 4, ist aber wegen $b_2 < 0$ nicht monoton.'],
    status: 'abgeleitet',
    sources: [src('NUM-K-WS2223', '3', 'Aufgabe 6 b)')],
  }),
  trueFalse({
    id: 'num.w.qf-ordnung.e4', chapterId: chQ, formulaIds: ['num.w.qf-ordnung'], skill: 'interpretieren', difficulty: 2, origin: 'app',
    prompt: 'Richtig oder falsch?',
    statements: [
      ['Symmetrische Quadraturformeln haben gerade Ordnung.', true, 'Satz 24. Deshalb ist Simpson eins besser als erwartet.'],
      ['Bei gegebenen paarweise verschiedenen Knoten und Ordnung ≥ s sind die Gewichte eindeutig.', true, 'Satz 23: $b_k = \\int_0^1 L_k$.'],
      ['Die Mittelpunktregel hat Ordnung 1, weil sie nur einen Knoten hat.', false, 'Ordnung 2: Sie ist symmetrisch und integriert Geraden exakt.'],
    ],
    hints: ['Welche Ordnung hat die Mittelpunktregel?', 'Prüfe $\\sum b_kc_k = \\tfrac12$ für $c_1 = \\tfrac12$.'],
    sources: [sk('78–80')],
  }),

  // ------------------------------------------------------------ Gauß
  mc({
    id: 'num.w.gauss.e1', chapterId: chQ, formulaIds: ['num.w.gauss'], skill: 'abrufen', difficulty: 1, origin: 'klausur',
    prompt: 'Welche Ordnung kann eine Quadraturformel mit s Knoten höchstens haben?',
    options: opts('*$2s$', ['$s$', 'Das erreicht jede interpolatorische Formel; mit guten Knoten geht mehr.'], ['$s + 1$', 'Simpson ($s = 3$) hat schon 4.'], ['beliebig hoch', 'Für $g = M$ ist $\\int M^2 > 0$.']),
    hints: ['Gauß-Quadratur.', 'Was passiert, wenn man $g = M$ setzt?'],
    explanation: ['Satz 26: maximal 2s, erreicht durch Gauß.'],
    sources: [sk('82', 'Satz 26'), src('NUM-K-WS1718', '3', 'Aufgabe 6 a) (iii)')],
  }),
  numeric({
    id: 'num.w.gauss.e2', chapterId: chQ, formulaIds: ['num.w.gauss'], skill: 'anwenden', difficulty: 2, origin: 'vorlesung',
    prompt: 'Die Gauß-Formel mit $s = 2$ auf $[0, 1]$ hat die Knoten $\\tfrac12 \\pm \\tfrac{\\sqrt3}{6}$ und Gewichte $\\tfrac12$. Berechne damit $\\int_0^1 x^3\\,dx$ (auf 4 Nachkommastellen).',
    answer: 0.25, fmt: fmt.num(4),
    hints: ['Ordnung 4: Grad 3 wird exakt integriert.', 'Ergebnis muss $\\tfrac14$ sein.'],
    explanation: ['Gauß mit $s = 2$ hat Ordnung 4, also exakt $\\tfrac14$.'],
    sources: [sk('83', 'Beispiel 31')],
  }),
  trueFalse({
    id: 'num.w.gauss.e3', chapterId: chQ, formulaIds: ['num.w.gauss'], skill: 'interpretieren', difficulty: 2, origin: 'app',
    prompt: 'Richtig oder falsch?',
    statements: [
      ['Die Gauß-Formel mit $s = 1$ ist die Mittelpunktregel.', true, 'Legendre $P_1 = x$, Nullstelle 0 ⇒ $c_1 = \\tfrac12$.'],
      ['Gauß-Gewichte können negativ sein.', false, '$b_k = \\int_0^1 L_k^2\\,dx > 0$.'],
      ['Ob eine Formel mit Ordnung ≥ s eine höhere Ordnung hat, hängt nur von den Knoten ab.', true, 'Bedingung $\\int M g = 0$ (Bemerkungen 35).'],
    ],
    hints: ['Satz 25 und Nachtrag zu Satz 27.', 'Wie hängen Gauß-Gewichte mit $\\int L_k^2$ zusammen?'],
    sources: [sk('81–83')],
  }),

  // ------------------------------------------------------------ Fehler / summiert
  mc({
    id: 'num.w.qf-fehler.e1', chapterId: chQ, formulaIds: ['num.w.qf-fehler'], skill: 'abrufen', difficulty: 2, origin: 'app',
    prompt: 'Wie verhält sich der Fehler der summierten Simpsonregel, wenn man h halbiert?',
    options: opts('*Er wird etwa 16-mal kleiner ($O(h^4)$).', ['Er halbiert sich.', 'Das wäre Ordnung 1 (Rechteckregel).'], ['Er wird etwa 4-mal kleiner.', 'So verhalten sich Trapez- und Mittelpunktregel (Ordnung 2).'], ['Er wird etwa 32-mal kleiner.', 'Das wäre der lokale Fehler $h^5$, nicht der Gesamtfehler.']),
    hints: ['Summiert: Fehler $= O(h^p)$.', 'Simpson: p = 4.'],
    explanation: ['$(1/2)^4 = 1/16$.'],
    sources: [sk('87–88', 'Bemerkungen 39, Beispiel 33')],
  }),
  numeric({
    id: 'num.w.qf-fehler.e2', chapterId: chQ, formulaIds: ['num.w.qf-fehler'], skill: 'anwenden', difficulty: 2, origin: 'klausur',
    prompt: 'Die summierte Trapezregel $T_N$ mit $N = 10$ Teilintervallen liegt vor. Wie viele **zusätzliche** Funktionsauswertungen braucht $T_{2N}$?',
    answer: 10, fmt: fmt.int(),
    wrong: [{ value: 21, explanation: 'Die 11 alten Werte kann man wiederverwenden.' }, { value: 11, explanation: 'Neu sind nur die Mittelpunkte der 10 Intervalle.' }],
    hints: ['Welche Stützstellen kommen beim Halbieren dazu?', 'Die alten Gitterpunkte bleiben erhalten.'],
    explanation: ['Neu sind nur die 10 Intervallmittelpunkte: $T_{2N} = \\tfrac12 T_N + \\tfrac h2 \\sum f(\\text{Mittelpunkte})$.'],
    sources: [src('NUM-K-SS26', '5', 'Aufgabe 4 c) (ii)')],
  }),
  trueFalse({
    id: 'num.w.qf-fehler.e3', chapterId: chQ, formulaIds: ['num.w.qf-fehler'], skill: 'interpretieren', difficulty: 2, origin: 'app',
    prompt: 'Richtig oder falsch?',
    statements: [
      ['Die Fehlerkonstante der Mittelpunktregel ($\\tfrac1{24}$) ist halb so groß wie die der Trapezregel ($\\tfrac1{12}$).', true, 'Beispiele 32.'],
      ['Für konvexe Funktionen überschätzt die Trapezregel das Integral.', true, 'Die Sehne liegt über dem Graphen.'],
      ['Im doppelt logarithmischen Fehlerplot ist die Steigung gleich der Ordnung p.', true, '$\\log \\mathrm{Err} = p\\log h + \\log C$.'],
      ['Eine höhere Ordnung bedeutet immer einen kleineren Fehler, auch bei großem h.', false, 'Die Ordnung beschreibt das Verhalten für kleine h; Konstanten und Ableitungen spielen mit.'],
    ],
    hints: ['Zeichne eine konvexe Funktion mit Sehne.', 'Fehler $\\approx Ch^p$, logarithmieren.'],
    sources: [sk('87–88')],
  }),
  numeric({
    id: 'num.trapez-fehler.e1', chapterId: chQ, formulaIds: ['num.trapez-fehler'], skill: 'einsetzen', difficulty: 1, origin: 'app',
    prompt: 'Fehlerschranke der (einfachen) Trapezregel auf $[0, 2]$ für eine Funktion mit $\\max|f\'\'| = 3$?',
    answer: 2, fmt: fmt.num(2),
    wrong: [{ value: 1, explanation: '$(b-a)^3 = 8$, nicht $(b-a)^2 = 4$.' }],
    hints: ['$\\tfrac{(b-a)^3}{12}\\max|f\'\'|$', '$\\tfrac{8}{12} \\cdot 3$'],
    explanation: ['$\\tfrac{8}{12} \\cdot 3 = 2$.'],
    sources: [src('NUM-K-SS26', '4', 'Aufgabe 4 b)')],
  }),
  numeric({
    id: 'num.trapez-fehler.e2', chapterId: chQ, formulaIds: ['num.trapez-fehler'], skill: 'anwenden', difficulty: 2, origin: 'app',
    prompt: 'Summierte Trapezregel auf $[0, 1]$ mit $\\max|f\'\'| = 2$. Wie groß muss N mindestens sein, damit die Schranke $\\tfrac{b-a}{12}h^2\\max|f\'\'|$ höchstens $10^{-4}$ ist? ($h = 1/N$)',
    answer: 41, fmt: fmt.int(),
    hints: ['$\\tfrac{1}{12} \\cdot \\tfrac{1}{N^2} \\cdot 2 \\le 10^{-4}$', '$N^2 \\ge \\tfrac{2 \\cdot 10^4}{12} \\approx 1667$', '$\\sqrt{1667} \\approx 40{,}8$'],
    explanation: ['$N \\ge 40{,}8$, also $N = 41$.'],
    sources: [src('NUM-K-SS26', '5', 'Aufgabe 4 c) (i)')],
  }),

  // ======================================================== Papier-Aufgaben
  paper({
    id: 'num.p.ub1-2', chapterId: chN, formulaIds: ['num.w.newton', 'num.newton-1d'], difficulty: 2, origin: 'tutorium', estMinutes: 15,
    prompt: t`**Übungsblatt 1, Aufgabe 2 a), c)** · Die Berechnung des Kehrwerts $\tfrac1d$ einer Zahl $d > 0$ soll mit dem Newton-Verfahren nur mit Additionen und Multiplikationen gelingen.
(a) Formuliere $\tfrac1d$ als Nullstellenproblem $f(x) = 0$ so, dass die Newton-Iteration ohne Division auskommt.
(c) Führe zwei Newton-Schritte zur Berechnung von $\tfrac19$ mit Startwert $x_0 = 0{,}1$ durch.`,
    hints: ['$\\tfrac1d = x \\iff \\tfrac1x - d = 0$.', 'Die Division durch $f\'(x) = -1/x^2$ wird zur Multiplikation mit $x^2$.'],
    modelAnswer: [
      t`(a) $f(x) = \tfrac1x - d$ mit $f'(x) = -\tfrac{1}{x^2}$. Newton: $x_{k+1} = x_k - \dfrac{1/x_k - d}{-1/x_k^2} = x_k + x_k - dx_k^2 = x_k(2 - dx_k)$. Keine Division mehr.`,
      t`(c) $x_1 = 0{,}1 \cdot (2 - 0{,}9) = 0{,}11$, $x_2 = 0{,}11 \cdot (2 - 0{,}99) = 0{,}1111$. (Nächster Schritt: $0{,}11111111$: quadratische Konvergenz.)`,
    ],
    keywords: ['f(x) = 1/x − d', 'x_{k+1} = x_k(2 − d x_k)', 'x₂ = 0,1111'],
    sources: [src('NUM-UB01', '1–2', 'Aufgabe 2 mit Lösung')],
  }),
  paper({
    id: 'num.p.ws1718-6e', chapterId: chN, formulaIds: ['num.w.newton'], difficulty: 2, origin: 'klausur', estMinutes: 10,
    prompt: t`**Klausur WiSe 2017/18, Aufgabe 6 e)** · Gesucht ist ein Schnittpunkt des Kreises $x^2 + y^2 = 2$ mit der Hyperbel $x^2 - y^2 = 1$.
(i) Formuliere das Problem so, dass das Newton-Verfahren angewendet werden kann.
(ii) Berechne die erste Iterierte mit Startwert $(1, -1)^\top$.`,
    hints: ['Alles auf eine Seite: $F(x, y) = 0$.', 'Jacobi-Matrix: $\\begin{pmatrix} 2x & 2y \\\\ 2x & -2y \\end{pmatrix}$.', 'LGS $F\'(x^0)d = -F(x^0)$ lösen.'],
    modelAnswer: [
      t`(i) $F(x, y) = \begin{pmatrix} x^2 + y^2 - 2 \\ x^2 - y^2 - 1 \end{pmatrix} = 0$.`,
      t`(ii) $F(1, -1) = (0, -1)^\top$, $F'(1, -1) = \begin{pmatrix} 2 & -2 \\ 2 & 2 \end{pmatrix}$.`,
      t`LGS: $2d_1 - 2d_2 = 0$, $2d_1 + 2d_2 = 1$ ⇒ $d = (\tfrac14, \tfrac14)^\top$.`,
      t`$x^1 = (1, -1)^\top + (\tfrac14, \tfrac14)^\top = (\tfrac54, -\tfrac34)^\top$. (Exakte Lösung in der Nähe: $(\sqrt{1{,}5}, -\sqrt{0{,}5}) \approx (1{,}225, -0{,}707)$.)`,
    ],
    keywords: ['F(x, y) = 0', 'Jacobi-Matrix', 'd = (1/4, 1/4)ᵀ', 'x¹ = (5/4, −3/4)ᵀ'],
    sources: [src('NUM-K-WS1718', '3', 'Aufgabe 6 e) mit Lösung')],
  }),
  paper({
    id: 'num.p.ub1-1', chapterId: chN, formulaIds: ['num.w.newton-konvergenz', 'num.w.newton'], difficulty: 3, origin: 'tutorium', estMinutes: 20,
    prompt: t`**Übungsblatt 1, Aufgabe 1** · Sei $f: \mathbb{R}^N \to \mathbb{R}^N$ eine $C^1$-Funktion und $f(x) = 0$ das zu lösende System.
(a) Sei B regulär. Zeige: Bei gleichem Startwert liefert Newton für $Bf(x) = 0$ dieselben Iterierten wie für $f(x) = 0$.
(b) Vergleiche das Stoppkriterium $\|d^k\| \le \varepsilon$ mit $\|f(x^k)\| \le \varepsilon$ für $B = \delta I_N$.
(c) Zeige: Konvergiert Newton gegen $x^*$, so ist $f(x^*) = 0$.
(d) Zeige: Für $f(x) = Ax - b$ (A regulär) liefert Newton nach einem Schritt die exakte Lösung.`,
    hints: ['(a) $(Bf)\' = Bf\'$ und $(Bf\')^{-1} = f\'^{-1}B^{-1}$.', '(c) Grenzwert in der Iterationsvorschrift bilden, Stetigkeit nutzen.', '(d) $f\'(x) = A$.'],
    modelAnswer: [
      t`(a) $g := Bf$, $g'(x) = Bf'(x)$, $g'(x)^{-1} = f'(x)^{-1}B^{-1}$. Also $x^{k+1} = x^k - f'(x^k)^{-1}B^{-1}Bf(x^k) = x^k - f'(x^k)^{-1}f(x^k)$: identisch.`,
      t`(b) Die Iterierten (und damit $d^k$) hängen nicht von δ ab, also stoppt $\|d^k\| \le \varepsilon$ immer im selben Schritt. Dagegen ist $\|g(x^k)\| = |\delta|\|f(x^k)\|$: Für großes $|\delta|$ stoppt man später, für kleines früher, bei gleichen Iterierten. Das Kriterium ist also willkürlich manipulierbar.`,
      t`(c) $f$, $f'$ und $(f')^{-1}$ sind stetig. Grenzwert in $x^{k+1} = x^k - f'(x^k)^{-1}f(x^k)$: $x^* = x^* - f'(x^*)^{-1}f(x^*)$, also $f'(x^*)^{-1}f(x^*) = 0$ und wegen Regularität $f(x^*) = 0$.`,
      t`(d) $f'(x) = A$. $x^1 = x^0 - A^{-1}(Ax^0 - b) = A^{-1}b$, die exakte Lösung.`,
    ],
    keywords: ['B kürzt sich', '|δ|‖f(xᵏ)‖', 'Grenzwert + Stetigkeit', 'x¹ = A⁻¹b'],
    sources: [src('NUM-UB01', '1', 'Aufgabe 1 mit Lösung')],
  }),
  paper({
    id: 'num.p.ss26-3', chapterId: chN, formulaIds: ['num.w.newton-konvergenz', 'num.w.newton'], difficulty: 2, origin: 'klausur', estMinutes: 12,
    prompt: t`**Klausur SoSe 2026, Aufgabe 3** · Sei $f: \mathbb{R}^N \to \mathbb{R}^N$ eine $C^2$-Funktion mit Nullstelle $x^*$ und regulärer Jacobi-Matrix $f'(x^*)$.
(a) Formuliere das Newton-Verfahren mit Stoppkriterium.
(b) Begründe mit der Taylorentwicklung $f(x^k) = f(x^*) + f'(x^*)(x^k - x^*) + O(\|x^k - x^*\|^2)$ die Näherung $\|x^k - x^*\| \approx \|f'(x^*)^{-1}f(x^k)\|$ und schätze die rechte Seite durch $K\|f(x^k)\|$ ab.
(c) Erkläre damit, warum das Stoppkriterium $\|f(x^k)\| \le \varepsilon$ problematisch ist.`,
    hints: ['(b) $f(x^*) = 0$, dann mit $f\'(x^*)^{-1}$ multiplizieren.', '(b) Zugehörige Matrixnorm: $\\|Mv\\| \\le \\|M\\|\\|v\\|$.'],
    modelAnswer: [
      t`(a) S0) Toleranz ε wählen, $k = 0$. S1) $f'(x^k)d^k = -f(x^k)$ lösen, $x^{k+1} = x^k + d^k$. S2) Falls $\|d^k\| < \varepsilon$: STOPP. Sonst $k \to k+1$, weiter mit S1.`,
      t`(b) Mit $f(x^*) = 0$ und Vernachlässigung der quadratischen Terme: $f(x^k) \approx f'(x^*)(x^k - x^*)$, also $f'(x^*)^{-1}f(x^k) \approx x^k - x^*$. Abschätzung: $\|f'(x^*)^{-1}f(x^k)\| \le \|f'(x^*)^{-1}\|\,\|f(x^k)\|$, also $K = \|f'(x^*)^{-1}\|$.`,
      t`(c) Auch wenn $\|f(x^k)\| \le \varepsilon$ gilt, kann der Fehler $\|x^k - x^*\| \approx K\|f(x^k)\|$ groß sein, falls $K = \|f'(x^*)^{-1}\|$ groß ist (schlechte Kondition). Kleines Residuum garantiert keinen kleinen Fehler.`,
    ],
    keywords: ['S0, S1, S2', '‖dᵏ‖ < ε', 'K = ‖f′(x*)⁻¹‖', 'kleines Residuum ≠ kleiner Fehler'],
    sources: [src('NUM-K-SS26', '3', 'Aufgabe 3 mit Lösungsskizze')],
  }),
  paper({
    id: 'num.p.ws1920-2c', chapterId: chN, formulaIds: ['num.w.newton-varianten'], difficulty: 2, origin: 'klausur', estMinutes: 10, status: 'abgeleitet',
    prompt: t`**Klausur WiSe 2019/20, Aufgabe 2 b), c)** · Für $f \in C^2(\mathbb{R}^N, \mathbb{R})$ betrachten wir $\min_x f(x)$.
(b) Leite eine geeignete Nullstellengleichung her und formuliere das Newton-Verfahren.
(c) Führe für $f(x) = \cos(x_1) + x_1 e^{x_2}$ einen Schritt dieses Verfahrens mit Startwert $x^0 = (0, 0)^\top$ aus.`,
    hints: ['(b) Notwendige Bedingung für ein Minimum: $\\nabla f = 0$.', '(c) $\\nabla f = (-\\sin x_1 + e^{x_2},\\ x_1e^{x_2})^\\top$.', '(c) Hesse-Matrix ableiten und bei 0 auswerten.'],
    modelAnswer: [
      t`(b) Ein Minimum erfüllt $\nabla f(x) = 0$. Newton auf $\nabla f$: $H_f(x^k)d^k = -\nabla f(x^k)$, $x^{k+1} = x^k + d^k$ mit der Hesse-Matrix $H_f$.`,
      t`(c) $\nabla f(x) = \begin{pmatrix} -\sin x_1 + e^{x_2} \\ x_1 e^{x_2} \end{pmatrix}$, $H_f(x) = \begin{pmatrix} -\cos x_1 & e^{x_2} \\ e^{x_2} & x_1 e^{x_2} \end{pmatrix}$.`,
      t`Bei $x^0 = 0$: $\nabla f = (1, 0)^\top$, $H_f = \begin{pmatrix} -1 & 1 \\ 1 & 0 \end{pmatrix}$.`,
      t`$-d_1 + d_2 = -1$ und $d_1 = 0$ ⇒ $d = (0, -1)^\top$, also $x^1 = (0, -1)^\top$.`,
      'Hinweis: Newton sucht nur stationäre Punkte. Ob ein Minimum vorliegt, zeigt erst die Hesse-Matrix (hier bei 0 indefinit).',
    ],
    keywords: ['∇f = 0', 'Hesse-Matrix', 'H d = −∇f', 'x¹ = (0, −1)ᵀ'],
    statusNote: 'Offizielle Lösung nur als Scan vorhanden; Schritt nachgerechnet.',
    sources: [src('NUM-K-WS1920', '2', 'Aufgabe 2 b), c)'), sk('54', 'Abschnitt 3.6.1')],
  }),
  paper({
    id: 'num.p.ws2021-2a', chapterId: chI, formulaIds: ['num.w.interpolation'], difficulty: 2, origin: 'klausur', estMinutes: 8,
    prompt: t`**Klausur WiSe 2020/21, Aufgabe 2 a)** · Seien die Stützpunkte $(x_0, f_0), \dots, (x_N, f_N)$ mit paarweise verschiedenen Stützstellen gegeben. Formuliere die Definition des Interpolationspolynoms und beweise, dass ein solches Polynom existiert.`,
    hints: ['Gesucht ist $p \\in \\mathbb{P}_N$ mit ...', 'Konstruiere es mit Lagrange-Polynomen.'],
    modelAnswer: [
      t`Definition: Gesucht ist $p \in \mathbb{P}_N$ (Grad $\le N$) mit $p(x_n) = f_n$ für $n = 0, \dots, N$.`,
      t`Existenz: $L_n(x) = \prod_{m \neq n}\dfrac{x - x_m}{x_n - x_m}$ (Nenner $\neq 0$, da die Stützstellen verschieden sind). Es gilt $L_n \in \mathbb{P}_N$ und $L_n(x_m) = \delta_{nm}$.`,
      t`$p(x) := \sum_{n=0}^N f_n L_n(x)$ ist als Linearkombination in $\mathbb{P}_N$, und $p(x_m) = \sum_n f_n\delta_{nm} = f_m$. Also existiert ein Interpolationspolynom.`,
    ],
    keywords: ['p ∈ P_N', 'p(xₙ) = fₙ', 'Lₙ(x_m) = δ_{nm}', 'p = Σ fₙLₙ'],
    sources: [src('NUM-K-WS2021', '1', 'Aufgabe 2 a) mit Lösungsskizze')],
  }),
  paper({
    id: 'num.p.ws1718-6b', chapterId: chI, formulaIds: ['num.w.interpolation'], difficulty: 1, origin: 'klausur', estMinutes: 4,
    prompt: t`**Klausur WiSe 2017/18, Aufgabe 6 b)** · Wie viele Stützstellen sind bei der Polynominterpolation nötig, um ein Polynom vom Grad N eindeutig zu bestimmen? Begründe kurz, warum dieses Interpolationspolynom eindeutig ist.`,
    hints: ['Angenommen, es gäbe zwei.', 'Wie viele Nullstellen hätte die Differenz?'],
    modelAnswer: [
      'Es sind $N + 1$ Stützstellen nötig.',
      'Eindeutigkeit: Wären p und q zwei Interpolationspolynome vom Grad $\\le N$ zu denselben Daten, so hätte $p - q$ Grad $\\le N$ und $N + 1$ verschiedene Nullstellen (die Stützstellen). Nach dem Fundamentalsatz der Algebra ist dann $p - q = 0$, also $p = q$.',
    ],
    keywords: ['N + 1', 'p − q', 'N + 1 Nullstellen', 'Fundamentalsatz der Algebra'],
    sources: [src('NUM-K-WS1718', '3', 'Aufgabe 6 b) mit Lösung')],
  }),
  paper({
    id: 'num.p.ws2021-2b', chapterId: chI, formulaIds: ['num.w.newton-interpolation'], difficulty: 1, origin: 'klausur', estMinutes: 6,
    prompt: t`**Klausur WiSe 2020/21, Aufgabe 2 b)** · Bestimme zu den Stützpunkten $(1, 16)$, $(3, 4)$ und $(5, 8)$ das Interpolationspolynom in Newton-Darstellung. Gib die Newton-Polynome explizit an.`,
    hints: ['Erste Spalte: $(16 - 4)/(1 - 3)$ und $(4 - 8)/(3 - 5)$.', 'Zweite Spalte: Nenner $1 - 5$.'],
    modelAnswer: [
      t`Schema: $f_{0,1} = \frac{16 - 4}{1 - 3} = -6$, $f_{1,2} = \frac{4 - 8}{3 - 5} = 2$, $f_{0,2} = \frac{-6 - 2}{1 - 5} = 2$.`,
      t`Newton-Polynome: $w_0 = 1$, $w_1 = x - 1$, $w_2 = (x - 1)(x - 3)$.`,
      t`$p(x) = 16 - 6(x - 1) + 2(x - 1)(x - 3)$. Probe: $p(5) = 16 - 24 + 16 = 8$ ✓.`,
    ],
    keywords: ['−6, 2, 2', 'w₁ = x − 1', 'w₂ = (x − 1)(x − 3)'],
    sources: [src('NUM-K-WS2021', '1', 'Aufgabe 2 b) mit Lösungsskizze')],
  }),
  paper({
    id: 'num.p.ss24-2ab', chapterId: chI, formulaIds: ['num.w.newton-interpolation'], difficulty: 2, origin: 'klausur', estMinutes: 12,
    prompt: t`**Klausur SoSe 2024, Aufgabe 2 a), b)** · Gegeben ist die Wertetabelle
$$\begin{array}{c|cccc} x_n & -1 & 2 & 4 & 5 \\ \hline f_n & 3 & -3 & 63 & 99 \end{array}$$
(a) Bestimme das Interpolationspolynom in Newton-Darstellung.
(b) Der Punkt $(x_4, f_4) = (0, 59)$ kommt hinzu. Bestimme das neue Interpolationspolynom.`,
    hints: ['Schema mit 4 Zeilen, dann eine fünfte ergänzen.', 'Nenner immer: äußerste Stützstellen der jeweiligen Gruppe.', 'In (b) wird nur ein Term angehängt.'],
    modelAnswer: [
      t`1. Spalte: $\frac{3 - (-3)}{-1 - 2} = -2$, $\frac{-3 - 63}{2 - 4} = 33$, $\frac{63 - 99}{4 - 5} = 36$.`,
      t`2. Spalte: $\frac{-2 - 33}{-1 - 4} = 7$, $\frac{33 - 36}{2 - 5} = 1$. 3. Spalte: $\frac{7 - 1}{-1 - 5} = -1$.`,
      t`(a) $p_{0,3}(x) = 3 - 2(x + 1) + 7(x + 1)(x - 2) - (x + 1)(x - 2)(x - 4)$.`,
      t`(b) Neue Zeile mit $(0, 59)$: $\frac{99 - 59}{5 - 0} = 8$, $\frac{36 - 8}{4 - 0} = 7$, $\frac{1 - 7}{2 - 0} = -3$, $\frac{-1 - (-3)}{-1 - 0} = -2$.`,
      t`$p_{0,4}(x) = p_{0,3}(x) - 2(x + 1)(x - 2)(x - 4)(x - 5)$.`,
    ],
    keywords: ['3, −2, 7, −1', 'neue Zeile', 'f_{0,4} = −2', 'Term anhängen'],
    sources: [src('NUM-K-SS24', '1', 'Aufgabe 2 a), b) mit Lösungsskizze')],
  }),
  paper({
    id: 'num.p.ws1920-3ab', chapterId: chI, formulaIds: ['num.w.newton-interpolation'], difficulty: 2, origin: 'klausur', estMinutes: 10, status: 'abgeleitet',
    prompt: t`**Klausur WiSe 2019/20, Aufgabe 3 a), b)** ·
(a) Bestimme zu $(1, -2)$, $(2, 0)$, $(4, -4)$ die Newton-Darstellung von $p_{0,2}$ mit einem Differenzenschema und gib die Newton-Polynome explizit an.
(b) Bestimme $p_{0,3}$ mit dem zusätzlichen Stützpunkt $(-1, 1)$.`,
    hints: ['Erste Spalte: $(−2 − 0)/(1 − 2)$, $(0 − (−4))/(2 − 4)$.', 'Für (b): Zeile mit $x_3 = -1$ unten anfügen.'],
    modelAnswer: [
      t`1. Spalte: $\frac{-2 - 0}{1 - 2} = 2$, $\frac{0 - (-4)}{2 - 4} = -2$. 2. Spalte: $\frac{2 - (-2)}{1 - 4} = -\frac43$.`,
      t`(a) $p_{0,2}(x) = -2 + 2(x - 1) - \tfrac43(x - 1)(x - 2)$ mit $w_1 = x - 1$, $w_2 = (x - 1)(x - 2)$.`,
      t`(b) Neue Zeile: $\frac{-4 - 1}{4 - (-1)} = -1$, $\frac{-2 - (-1)}{2 - (-1)} = -\frac13$, $\frac{-\frac43 - (-\frac13)}{1 - (-1)} = -\frac12$.`,
      t`$p_{0,3}(x) = p_{0,2}(x) - \tfrac12(x - 1)(x - 2)(x - 4)$. Probe: $p_{0,3}(-1) = -2 - 4 - 8 + 15 = 1$ ✓.`,
    ],
    keywords: ['2, −2, −4/3', 'f_{0,3} = −1/2', 'p_{0,3} = p_{0,2} − ½(x − 1)(x − 2)(x − 4)'],
    statusNote: 'Offizielle Lösung nur als Scan vorhanden; Schema exakt nachgerechnet.',
    sources: [src('NUM-K-WS1920', '2', 'Aufgabe 3 a), b)')],
  }),
  paper({
    id: 'num.p.ws2021-2d', chapterId: chI, formulaIds: ['num.w.interpolationsfehler'], difficulty: 3, origin: 'klausur', estMinutes: 10,
    prompt: t`**Klausur WiSe 2020/21, Aufgabe 2 d)** · Die Funktion $f(x) = \sin(x)$ soll auf $[-1, 1]$ gleichmäßig durch Interpolationspolynome vom Grad höchstens N bis auf einen Fehler von $10^{-2}$ approximiert werden. Ermittle das minimale N, für das dies möglich ist.`,
    hints: ['Restgliedabschätzung mit $\\max|w_{N+1}|$.', 'Welche Stützstellen machen $\\max|w_{N+1}|$ minimal?', '$|\\sin^{(N+1)}| \\le 1$.'],
    modelAnswer: [
      t`$e := \max_{[-1,1]}|f - p| \le \max|w_{N+1}| \cdot \dfrac{\max|f^{(N+1)}|}{(N+1)!}$.`,
      t`Mit Tschebyscheff-Stützstellen wird $\max|w_{N+1}|$ minimal, nämlich $2^{-N}$. Zudem $|\sin^{(N+1)}| \le 1$. Also $e \le \dfrac{2^{-N}}{(N+1)!}$.`,
      t`$N = 2$: $\tfrac{1}{4 \cdot 6} = \tfrac{1}{24} \approx 0{,}042 > 10^{-2}$. $N = 3$: $\tfrac{1}{8 \cdot 24} = \tfrac{1}{192} \approx 0{,}0052 < 10^{-2}$.`,
      'Minimales N ist 3 (mit Tschebyscheff-Stützstellen).',
    ],
    keywords: ['Restglied', 'Tschebyscheff: 2^{−N}', '|sin^{(N+1)}| ≤ 1', 'N = 3'],
    sources: [src('NUM-K-WS2021', '1', 'Aufgabe 2 d) mit Lösungsskizze')],
  }),
  paper({
    id: 'num.p.ws1718-6c', chapterId: chI, formulaIds: ['num.w.interpolationsfehler'], difficulty: 1, origin: 'klausur', estMinutes: 4,
    prompt: t`**Klausur WiSe 2017/18, Aufgabe 6 c)** · Gib die Formel für die Stützstellen der Tschebyscheff-Interpolation auf $[-1, 1]$ an und erkläre kurz, welche Vorteile diese Wahl gegenüber äquidistanten Stützstellen hat.`,
    hints: ['Nullstellen von $T_{N+1}$.', 'Zwei Vorteile: Oszillationen und Kondition.'],
    modelAnswer: [
      t`$x_n = \cos\Big(\dfrac{2n+1}{2N+2}\pi\Big)$ für $n = 0, \dots, N$.`,
      'Vorteile: Es treten keine so starken Oszillationen am Rand auf wie bei äquidistanten Stützstellen ($\\max|w_{N+1}|$ ist minimal), und die Kondition ist viel besser (kleine Lebesgue-Konstante, etwa 2,9 statt $10^4$ für N = 20).',
    ],
    keywords: ['cos((2n+1)π/(2N+2))', 'weniger Oszillationen', 'bessere Kondition'],
    sources: [src('NUM-K-WS1718', '3', 'Aufgabe 6 c) mit Lösung')],
  }),
  paper({
    id: 'num.p.ss24-2c', chapterId: chI, formulaIds: ['num.w.interpolationsfehler'], difficulty: 3, origin: 'klausur', estMinutes: 15,
    prompt: t`**Klausur SoSe 2024, Aufgabe 2 c)** · Sei p das Interpolationspolynom zu stetigem $f: [a,b] \to \mathbb{R}$ in paarweise verschiedenen Stützstellen $x_0, \dots, x_N$ und $q \in \mathbb{P}_N$ beliebig.
(i) Zeige $\max|q - p| \le \Lambda_N \max|q - f|$ und gib $\Lambda_N$ explizit an.
(ii) Zeige $\max|f - p| \le (1 + \Lambda_N)\max|q - f|$.
(iii) Diskutiere die Aussage von (ii) für zwei Klassen von Stützstellen bei $N \approx 20$.`,
    hints: ['(i) Auch q ist sein eigenes Interpolationspolynom: $q = \\sum q(x_n)L_n$.', '(ii) Dreiecksungleichung über q.', '(iii) Lebesgue-Konstanten äquidistant vs. Tschebyscheff.'],
    modelAnswer: [
      t`(i) $p = \sum f(x_n)L_n$ und $q = \sum q(x_n)L_n$ (Eindeutigkeit). Also $|q(x) - p(x)| \le \sum_n |q(x_n) - f(x_n)||L_n(x)| \le \max|q - f| \sum_n|L_n(x)| \le \Lambda_N\max|q - f|$ mit $\Lambda_N = \max_{x \in [a,b]}\sum_n |L_n(x)|$.`,
      t`(ii) $|f - p| \le |f - q| + |q - p|$, mit (i): $\max|f - p| \le (1 + \Lambda_N)\max|f - q|$.`,
      'Bedeutung: Das Interpolationspolynom ist höchstens um den Faktor $(1 + \\Lambda_N)$ schlechter als die beste Approximation in $\\mathbb{P}_N$ (q beliebig).',
      '(iii) Äquidistant ist $\\Lambda_{20} \\approx 10^4$: Die Abschätzung ist wertlos. Tschebyscheff: $\\Lambda_{20} \\approx 2{,}9$, also fast so gut wie die Bestapproximation.',
    ],
    keywords: ['q = Σ q(xₙ)Lₙ', 'Λ_N = max Σ|Lₙ|', 'Dreiecksungleichung', '1 + Λ_N', '10⁴ vs. 2,9'],
    sources: [src('NUM-K-SS24', '1', 'Aufgabe 2 c) mit Lösungsskizze')],
  }),
  paper({
    id: 'num.p.ws1718-5', chapterId: chS, formulaIds: ['num.w.spline'], difficulty: 2, origin: 'klausur', estMinutes: 15,
    prompt: t`**Klausur WiSe 2017/18, Aufgabe 5** ·
(a) Gib die Definition eines natürlichen interpolierenden kubischen Splines zu $(x_0, y_0), \dots, (x_N, y_N)$ an.
(b) Bestimme $\alpha, \beta, \gamma$ so, dass
$$s(x) = \begin{cases} -x^3 + 8x + \alpha, & 0 \le x \le 1 \\ \beta x^3 + \gamma x^2 + 14x - 1, & 1 < x \le 2 \end{cases}$$
ein kubischer Spline zu $x_0 = 0$, $x_1 = 1$, $x_2 = 2$ ist.
(c) Entscheide, ob dieser Spline periodisch ist.`,
    hints: ['(b) Bei $x = 1$: gleiche Werte, gleiche erste und zweite Ableitungen.', '(b) Drei lineare Gleichungen für α, β, γ.', '(c) Vergleiche $s(0)$ und $s(2)$.'],
    modelAnswer: [
      t`(a) $s \in C^2[a, b]$, $s|_{[x_{n-1}, x_n]} \in \mathbb{P}_3$, $s(x_n) = y_n$ für alle n, und natürlich: $s''(x_0) = s''(x_N) = 0$.`,
      t`(b) $s_1' = -3x^2 + 8$, $s_1'' = -6x$; $s_2' = 3\beta x^2 + 2\gamma x + 14$, $s_2'' = 6\beta x + 2\gamma$. Bei $x = 1$: $7 + \alpha = \beta + \gamma + 13$, $5 = 3\beta + 2\gamma + 14$, $-6 = 6\beta + 2\gamma$.`,
      t`Aus den letzten beiden: $3\beta = 3$ ⇒ $\beta = 1$, $\gamma = -6$. Dann $\alpha = 1 - 6 + 13 - 7 = 1$.`,
      t`(c) $s(0) = 1$, aber $s(2) = 8 - 24 + 28 - 1 = 11$. Also nicht periodisch (auch $s'(0) = 8 \neq s'(2) = 2$).`,
    ],
    keywords: ['C², stückweise P₃, Interpolation, s″ = 0 am Rand', 'α = 1, β = 1, γ = −6', 's(0) ≠ s(2)'],
    sources: [src('NUM-K-WS1718', '2', 'Aufgabe 5 mit Lösung')],
  }),
  paper({
    id: 'num.p.ss20-3ab', chapterId: chS, formulaIds: ['num.w.spline'], difficulty: 2, origin: 'klausur', estMinutes: 12, status: 'abgeleitet',
    prompt: t`**Klausur SoSe 2020, Aufgabe 3 a), b)** ·
(a) Bestimme $c, d$ so, dass
$$s(x) = \begin{cases} 2 + 2x + 2x^2 - 2x^3, & x \in [0, 1] \\ -1 + cx - 7x^2 + dx^3, & x \in [1, 2] \end{cases}$$
ein eingespannter kubischer Spline zu $x_n = n$ ($n = 0, 1, 2$) mit Hermite-Randbedingungen $s'(0) = 2$ und $s'(2) = -5$ ist. Überprüfe, ob wirklich ein solcher Spline vorliegt.
(b) Untersuche, ob es sich um einen natürlichen Spline handelt.`,
    hints: ['Zwei Unbekannte: Wert und erste Ableitung bei $x = 1$ reichen.', 'Danach $s\'\'$ bei $x = 1$ und die Randbedingungen prüfen.'],
    modelAnswer: [
      t`Wert bei 1: $s_1(1) = 4$, $s_2(1) = -8 + c + d$ ⇒ $c + d = 12$. Ableitung: $s_1'(1) = 2 + 4 - 6 = 0$, $s_2'(1) = c - 14 + 3d$ ⇒ $c + 3d = 14$.`,
      t`Also $d = 1$, $c = 11$.`,
      t`Prüfen: $s_1''(1) = 4 - 12 = -8 = s_2''(1) = -14 + 6$ ✓. $s'(0) = 2$ ✓. $s_2'(2) = 11 - 28 + 12 = -5$ ✓. Stückweise kubisch und $C^2$ ⇒ eingespannter Spline.`,
      t`(b) $s''(0) = 4 \neq 0$ (und $s''(2) = -14 + 12 = -2 \neq 0$): kein natürlicher Spline.`,
    ],
    keywords: ['c + d = 12', 'c + 3d = 14', 'c = 11, d = 1', 's″(1) = −8 beidseitig', 's″(0) = 4 ≠ 0'],
    statusNote: 'Offizielle Lösung nur als Scan vorhanden; alle Bedingungen nachgerechnet.',
    sources: [src('NUM-K-SS20', '2', 'Aufgabe 3 a), b)')],
  }),
  paper({
    id: 'num.p.ss26-4a', chapterId: chQ, formulaIds: ['num.w.quadraturformel', 'num.w.qf-ordnung'], difficulty: 1, origin: 'klausur', estMinutes: 6,
    prompt: t`**Klausur SoSe 2026, Aufgabe 4 a)** · Sei $f: [a, b] \to \mathbb{R}$ eine $C^2$-Funktion. Formuliere die Trapezregel $T(f)$, gib Gewichte, Knoten und die Ordnung an und beweise die Ordnung.`,
    hints: ['Gewichte summieren sich zu 1, die Formel ist symmetrisch.', 'Prüfe $q = 3$.'],
    modelAnswer: [
      t`$T(f) = (b - a)\dfrac{f(a) + f(b)}{2}$, Knoten $c_1 = 0$, $c_2 = 1$, Gewichte $b_1 = b_2 = \tfrac12$.`,
      t`Ordnung 2: $\sum b_k = 1$, und die Formel ist symmetrisch, also ist die Ordnung gerade und mindestens 2 (alternativ $\tfrac12 \cdot 0 + \tfrac12 \cdot 1 = \tfrac12$ direkt). Wegen $\tfrac12 \cdot 0^2 + \tfrac12 \cdot 1^2 = \tfrac12 \neq \tfrac13$ ist sie genau 2.`,
    ],
    keywords: ['(b − a)(f(a) + f(b))/2', 'b = (½, ½), c = (0, 1)', 'Ordnung 2', '½ ≠ ⅓'],
    sources: [src('NUM-K-SS26', '4', 'Aufgabe 4 a) mit Lösungsskizze')],
  }),
  paper({
    id: 'num.p.ub6-2b', chapterId: chQ, formulaIds: ['num.w.qf-ordnung'], difficulty: 2, origin: 'tutorium', estMinutes: 12,
    prompt: t`**Übungsblatt 6, Aufgabe 2 b)** · Seien $s = 3$ und die Knoten $c_1 = 0$, $c_3 = 1$ gegeben. Bestimme $c_2$ und die Gewichte $b_1, b_2, b_3$ so, dass die Ordnung maximal wird. Begründe.`,
    hints: ['Schreibe die ersten vier Ordnungsbedingungen auf.', 'Ziehe die Bedingungen für q = 2, 3 bzw. q = 3, 4 voneinander ab.', 'Der Quotient liefert $c_2$.'],
    modelAnswer: [
      t`Ordnungsbedingungen mit $c_1 = 0$, $c_3 = 1$: $b_1 + b_2 + b_3 = 1$, $b_2c_2 + b_3 = \tfrac12$, $b_2c_2^2 + b_3 = \tfrac13$, $b_2c_2^3 + b_3 = \tfrac14$.`,
      t`Differenzen: $b_2c_2(c_2 - 1) = -\tfrac16$ und $b_2c_2^2(c_2 - 1) = -\tfrac1{12}$. Quotient: $c_2 = \tfrac12$ (beachte $b_2 \neq 0$, $c_2 \neq 0, 1$).`,
      t`Dann $\tfrac12 b_2 + b_3 = \tfrac12$ und $\tfrac14 b_2 + b_3 = \tfrac13$ ⇒ $b_2 = \tfrac23$, $b_3 = \tfrac16$, $b_1 = \tfrac16$: die Simpsonregel.`,
      t`Ordnung genau 4: $q = 5$: $\tfrac23 \cdot \tfrac1{16} + \tfrac16 = \tfrac5{24} \neq \tfrac15$. (Oder: symmetrisch ⇒ gerade Ordnung, und Ordnung 6 hat nur die Gauß-Formel.)`,
    ],
    keywords: ['vier Ordnungsbedingungen', 'c₂ = ½', 'b = (1/6, 2/3, 1/6)', 'Simpson, Ordnung 4'],
    sources: [src('NUM-UB06', '2–3', 'Aufgabe 2 b) mit Lösung')],
  }),
  paper({
    id: 'num.p.ss17-2b', chapterId: chQ, formulaIds: ['num.w.qf-ordnung'], difficulty: 2, origin: 'klausur', estMinutes: 10, status: 'abgeleitet',
    prompt: t`**Klausur SoSe 2017, Aufgabe 2 b)** · Bestimme zu den Knoten $c_1, c_2, c_3$ mit $c_1 = \tfrac16$ eine symmetrische Quadraturformel mit Ordnung größer oder gleich vier.`,
    hints: ['Symmetrie legt $c_2$ und $c_3$ fest.', 'Symmetrisch + Ordnung ≥ 3 ⇒ Ordnung ≥ 4.', 'Ordnungsbedingungen q = 1 und q = 3 mit $b_1 = b_3$.'],
    modelAnswer: [
      t`Symmetrie: $c_3 = 1 - c_1 = \tfrac56$, $c_2 = \tfrac12$, $b_1 = b_3$.`,
      t`$q = 1$: $2b_1 + b_2 = 1$. $q = 3$: $b_1\big(\tfrac1{36} + \tfrac{25}{36}\big) + \tfrac14 b_2 = \tfrac13$.`,
      t`Mit $b_2 = 1 - 2b_1$: $\tfrac{26}{36}b_1 + \tfrac14 - \tfrac12 b_1 = \tfrac13$ ⇒ $\tfrac{8}{36}b_1 = \tfrac1{12}$ ⇒ $b_1 = b_3 = \tfrac38$, $b_2 = \tfrac14$.`,
      'Begründung Ordnung ≥ 4: Bedingungen für q = 1, 2, 3 sind erfüllt (q = 2 wegen Symmetrie). Symmetrische Formeln haben gerade Ordnung, also mindestens 4. (Genau 4, da q = 5 nicht gilt.)',
    ],
    keywords: ['c = (1/6, 1/2, 5/6)', 'b = (3/8, 1/4, 3/8)', 'symmetrisch ⇒ gerade Ordnung'],
    statusNote: 'Offizielle Lösung nur als Scan vorhanden; Ordnungsbedingungen exakt nachgerechnet.',
    sources: [src('NUM-K-SS17', '1', 'Aufgabe 2 b)')],
  }),
  paper({
    id: 'num.p.ws2223-6b', chapterId: chQ, formulaIds: ['num.w.qf-ordnung'], difficulty: 2, origin: 'klausur', estMinutes: 10, status: 'abgeleitet',
    prompt: t`**Klausur WiSe 2022/23, Aufgabe 6 b)** · Sei eine Quadraturformel $(b_k, c_k)_{k=1,2,3}$ mit $c_1 = \tfrac14$ und $c_3 = \tfrac34$ gegeben.
(i) Bestimme $c_2$ und die Gewichte so, dass die Formel symmetrisch ist und maximale Ordnung hat.
(ii) Entscheide, ob die Formel monoton ist, und begründe kurz.`,
    hints: ['Symmetrie ⇒ $c_2 = \\tfrac12$, $b_1 = b_3$.', 'Bedingungen q = 1 und q = 3.', 'Monoton heißt: alle Gewichte ≥ 0.'],
    modelAnswer: [
      t`(i) Symmetrie: $c_2 = \tfrac12$, $b_1 = b_3$. $q = 1$: $2b_1 + b_2 = 1$. $q = 3$: $b_1(\tfrac1{16} + \tfrac9{16}) + \tfrac14 b_2 = \tfrac13$ ⇒ $\tfrac{2}{16}b_1 = \tfrac1{12}$ ⇒ $b_1 = b_3 = \tfrac23$, $b_2 = -\tfrac13$.`,
      'Ordnung: q = 1, 2, 3 erfüllt, symmetrisch ⇒ Ordnung 4; q = 5 gilt nicht (Ordnung 6 hätte nur die Gauß-Formel mit anderen Knoten).',
      t`(ii) Nicht monoton, weil $b_2 = -\tfrac13 < 0$. (Für $f \ge 0$ mit Spitze bei $\tfrac12$ kann die Formel sogar negative Werte liefern.)`,
    ],
    keywords: ['c₂ = ½', 'b = (2/3, −1/3, 2/3)', 'Ordnung 4', 'b₂ < 0 ⇒ nicht monoton'],
    statusNote: 'Offizielle Lösung nur als Scan vorhanden; Gewichte und Ordnung exakt nachgerechnet.',
    sources: [src('NUM-K-WS2223', '3', 'Aufgabe 6 b)')],
  }),
  paper({
    id: 'num.p.ss24-3', chapterId: chQ, formulaIds: ['num.w.gauss', 'num.w.qf-ordnung'], difficulty: 3, origin: 'klausur', estMinutes: 20,
    prompt: t`**Klausur SoSe 2024, Aufgabe 3** · Sei $(b_k, c_k)_{k=1,\dots,s}$ eine Quadraturformel der Ordnung p.
(a) Formuliere die Definition der Ordnung.
(b) Zeige: Im Fall $p \ge s$ sind die Gewichte durch die Knoten eindeutig festgelegt; gib sie explizit an.
(c) Seien $p \ge s$, $m \ge 1$ und $M(x) = (x - c_1)\cdots(x - c_s)$. Zeige: Die Ordnung ist genau dann $s + m$, wenn $\int_0^1 M(x)g(x)\,dx = 0$ für alle $g \in \mathbb{P}_{m-1}$, aber nicht für ein g vom Grad m.
(d) Gib die maximale Ordnung an und begründe mit (c).`,
    hints: ['(b) Lagrange-Polynome zu den Knoten haben Grad s − 1.', '(c) Polynomdivision: $f = Mg + r$.', '(d) Setze $g = M$.'],
    modelAnswer: [
      '(a) Ordnung p: Die Formel integriert alle Polynome vom Grad $\\le p - 1$ exakt, und p ist maximal.',
      t`(b) Die Lagrange-Polynome $L_j \in \mathbb{P}_{s-1}$ zu den Knoten sind durch die Knoten festgelegt. Wegen $p \ge s$ werden sie exakt integriert: $\int_0^1 L_j\,dx = \sum_k b_kL_j(c_k) = b_j$. Also $b_j = \int_0^1 L_j(x)\,dx$, eindeutig.`,
      t`(c) Für $f \in \mathbb{P}_{s+m-1}$ gibt es eindeutige $g \in \mathbb{P}_{m-1}$, $r \in \mathbb{P}_{s-1}$ mit $f = Mg + r$. Dann $\int f = \int Mg + \int r$ und $\sum b_kf(c_k) = \sum b_kM(c_k)g(c_k) + \sum b_kr(c_k) = 0 + \sum b_kr(c_k)$. Die r-Anteile stimmen überein (Ordnung $\ge s$). Exakt für alle f genau dann, wenn $\int Mg = 0$ für alle $g \in \mathbb{P}_{m-1}$.`,
      t`(d) Maximal $2s$ (Gauß-Quadratur): Für $m = s + 1$ müsste $\int_0^1 M\cdot M\,dx = 0$ gelten, aber $\int_0^1 M^2\,dx > 0$.`,
    ],
    keywords: ['exakt bis Grad p − 1', 'b_j = ∫ L_j', 'f = Mg + r', 'M(c_k) = 0', '∫M² > 0 ⇒ max 2s'],
    sources: [src('NUM-K-SS24', '2', 'Aufgabe 3 mit Lösungsskizze')],
  }),
  paper({
    id: 'num.p.ss26-4bc', chapterId: chQ, formulaIds: ['num.trapez-fehler', 'num.w.qf-fehler'], difficulty: 3, origin: 'klausur', estMinutes: 20,
    prompt: t`**Klausur SoSe 2026, Aufgabe 4 b), c)** · Sei $f \in C^2[a, b]$.
(b) Beweise $\Big|\int_a^b f\,dx - T(f)\Big| \le \tfrac1{12}(b-a)^3\max|f''|$ für den Spezialfall $a = 0$, $b = 1$, indem du die Trapezregel als interpolatorische Formel auffasst und das Restglied der Interpolation nutzt.
(c) Für eine äquidistante Zerlegung mit $h = \tfrac{b-a}{N}$ sei $T_N(f)$ die summierte Trapezregel.
(i) Leite eine Fehlerabschätzung für $T_N$ her.
(ii) Wie viele weitere Funktionsauswertungen braucht $T_{2N}$, wenn $T_N$ schon vorliegt?
(iii) Wie spiegeln sich diese zusätzlichen Auswertungen in der Fehlerabschätzung wider?`,
    hints: ['(b) Restglied: $f(x) - p(x) = \\tfrac12 x(x - 1)f\'\'(\\xi(x))$.', '(b) $\\int_0^1 x(1 - x)\\,dx = \\tfrac16$.', '(c) Additivität des Integrals und Dreiecksungleichung.'],
    modelAnswer: [
      t`(b) Die Trapezregel integriert die Gerade p durch $(0, f(0))$ und $(1, f(1))$ exakt. Restglied: $f(x) - p(x) = \tfrac12 w_2(x)f''(\xi(x))$ mit $|w_2(x)| = x(1 - x)$ auf $[0, 1]$.`,
      t`$\Big|\int_0^1 f\,dx - T(f)\Big| = \Big|\int_0^1 (f - p)\,dx\Big| \le \tfrac12\max|f''|\int_0^1 x(1-x)\,dx = \tfrac12 \cdot \tfrac16\max|f''| = \tfrac1{12}\max|f''|$.`,
      t`(c)(i) Auf jedem Teilintervall gilt die Schranke mit $(b-a)^3 \to h^3$. Summe über N Intervalle: $\Big|\int_a^b f\,dx - T_N(f)\Big| \le N \cdot \tfrac1{12}h^3\max|f''| = \tfrac{b-a}{12}h^2\max|f''|$.`,
      t`(ii) Nur die N Intervallmittelpunkte sind neu: $T_{2N}(f) = \tfrac12 T_N(f) + \tfrac h2\sum_{n=1}^N f\big(\tfrac{x_{n-1} + x_n}{2}\big)$.`,
      '(iii) Die Gitterweite halbiert sich, wegen $h^2$ viertelt sich die Fehlerschranke.',
    ],
    keywords: ['Restglied ½ x(x − 1) f″(ξ)', '∫ x(1 − x) = 1/6', '(b − a)/12 · h² · max|f″|', 'N neue Mittelpunkte', 'Fehler / 4'],
    sources: [src('NUM-K-SS26', '4–5', 'Aufgabe 4 b), c) mit Lösungsskizze')],
  }),
  paper({
    id: 'num.p.ws1920-4d', chapterId: chQ, formulaIds: ['num.w.qf-fehler'], difficulty: 2, origin: 'klausur', estMinutes: 8, status: 'abgeleitet',
    prompt: t`**Klausur WiSe 2019/20, Aufgabe 4 d)** · Ordne Mittelpunkt-, Trapez- und Simpsonregel den Spalten (i)–(iii) zu. Die Werte sind die Differenzen zwischen summierter Formel und exaktem Wert von $\int_0^5 e^x\,dx$ bei $h = 5/N$. Begründe kurz.
$$\begin{array}{c|ccc} N & \text{(i)} & \text{(ii)} & \text{(iii)} \\ \hline 10 & -1{,}5244303 & 0{,}0497007 & 3{,}0583869 \\ 20 & -0{,}3831898 & 0{,}0031754 & 0{,}7669783 \\ 40 & -0{,}0959284 & 0{,}0001996 & 0{,}1918943 \\ 80 & -0{,}0239903 & 0{,}0000125 & 0{,}0479829 \end{array}$$`,
    hints: ['Um welchen Faktor schrumpft jede Spalte beim Verdoppeln von N?', '$e^x$ ist konvex: Wer über-, wer unterschätzt?', 'Vergleiche die Beträge von (i) und (iii).'],
    modelAnswer: [
      '(ii) schrumpft beim Verdoppeln von N etwa um den Faktor 16 ⇒ Ordnung 4 ⇒ **Simpsonregel**.',
      '(i) und (iii) schrumpfen etwa um den Faktor 4 ⇒ Ordnung 2 ⇒ Mittelpunkt- und Trapezregel.',
      '$e^x$ ist konvex: Die Trapezregel (Sehne über dem Graphen) überschätzt ⇒ positiver Fehler ⇒ (iii) = **Trapezregel**. Die Mittelpunktregel unterschätzt ⇒ negativer Fehler ⇒ (i) = **Mittelpunktregel**.',
      'Passt auch zu den Fehlerkonstanten: Der Mittelpunkt-Fehler ist etwa halb so groß wie der Trapez-Fehler ($\\tfrac1{24}$ vs. $\\tfrac1{12}$).',
    ],
    keywords: ['Faktor 16 ⇒ Simpson', 'Faktor 4 ⇒ Ordnung 2', 'konvex: Trapez +, Mittelpunkt −', '1/24 vs. 1/12'],
    statusNote: 'Offizielle Lösung nur als Scan vorhanden; Zuordnung durch Nachrechnen der Tabelle bestätigt.',
    sources: [src('NUM-K-WS1920', '3', 'Aufgabe 4 d)')],
  }),
]

/** Offizielle Zahlenwerte für den Inhaltstest. */
export const officialChecks = [
  { id: 'num.newton-1d.e2', value: 0.1111, dec: 4, note: 'UB 1, Aufgabe 2 c): x₂ = 0,1111' },
  { id: 'num.w.newton-interpolation.e2', value: 2, dec: 2, note: 'Klausur WS20/21, 2 b): Leitkoeffizient 2' },
  { id: 'num.w.interpolationsfehler.e2', value: 0.005208, dec: 6, note: 'Klausur WS20/21, 2 d): 1/192' },
]
