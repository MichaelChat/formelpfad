# Formelkatalog

> Automatisch erzeugt mit `npm run docs` aus `src/content/data/*`. Nicht von Hand bearbeiten.

Insgesamt **76 Formeln** in **14 Kapiteln**. Status: geprüft 74, abgeleitet 2.

Legende Status: **geprüft** = steht so in den Unterlagen und wurde nachgerechnet · **abgeleitet** = von der App ergänzt (z. B. Umstellung), mathematisch geprüft, aber nicht wörtlich in den Unterlagen · **ungeprüft** = unklar, siehe `content-issues.md`.

## F1 Zeitwert des Geldes (Finanzierung)

| ID | Formel | Darstellung | Status | Aufgaben | Generator | Quellen |
|---|---|---|---|---|---|---|
| `fin.endwert` | Endwert (mehrperiodig) | $EW = C_0 \cdot (1+r)^T$ | geprüft | 5 | ja | FIN-VL23 S. 17, 20 |
| `fin.barwert` | Barwert einer Zahlung | $BW = \frac{C_T}{(1+r)^T}$ | geprüft | 5 | ja | FIN-VL23 S. 18–19 |
| `fin.unterjaehrig` | Endwert bei unterjähriger Verzinsung | $EW = C_0 \cdot \left(1 + \frac{r}{m}\right)^{m\cdot T}$ | geprüft | 2 | ja | FIN-VL23 S. 21 |
| `fin.ejz` | Effektiver Jahreszinssatz | $EJZ = \left(1 + \frac{r}{m}\right)^{m} - 1$ | geprüft | 5 | ja | FIN-VL23 S. 22–23; FIN-T1L S. 5–6, 10 |
| `fin.stetig` | Stetige Verzinsung | $EW = C_0 \cdot e^{r\cdot T}$ | geprüft | 3 | ja | FIN-VL23 S. 24; FIN-T1L S. 5 |
| `fin.bw-strom` | Barwert und Endwert eines Zahlungsstroms | $BW = \sum_{i=1}^{T}\frac{C_i}{(1+r)^i}\qquad EW = \sum_{i=1}^{T} C_i\,(1+r)^{T-i}$ | geprüft | 2 | – | FIN-VL23 S. 25 |

## F2 Rentenformeln (Finanzierung)

| ID | Formel | Darstellung | Status | Aufgaben | Generator | Quellen |
|---|---|---|---|---|---|---|
| `fin.ewige-rente` | Ewige Rente | $BW = \frac{C}{r}$ | geprüft | 6 | ja | FIN-VL23 S. 27–28 |
| `fin.ewige-wachsend` | Ewige Rente mit konstantem Wachstum | $BW = \frac{C}{r-g}$ | geprüft | 5 | ja | FIN-VL23 S. 31–32; FIN-T1L S. 7 |
| `fin.endliche-rente` | Endliche Rente (Annuität) | $BW = \frac{C}{r}\left(1 - \frac{1}{(1+r)^T}\right)$ | geprüft | 7 | ja | FIN-VL23 S. 29–30 |
| `fin.endliche-wachsend` | Endliche Rente mit konstantem Wachstum | $BW = \frac{C}{r-g}\left(1 - \left(\frac{1+g}{1+r}\right)^{T}\right)$ | geprüft | 4 | ja | FIN-VL23 S. 33–34; FIN-T1L S. 16–17 |
| `fin.renten-endwert` | Endwert einer Rente / Sparrate | $EW = \frac{C}{r}\big((1+r)^T - 1\big)\quad\Leftrightarrow\quad C = \frac{EW\cdot r}{(1+r)^T-1}$ | geprüft – Formel steht so in den Tutoriumslösungen (nicht auf den Vorlesungsfolien). | 5 | ja | FIN-T1L S. 8–11 |

## F3 Anleihen (Finanzierung)

| ID | Formel | Darstellung | Status | Aufgaben | Generator | Quellen |
|---|---|---|---|---|---|---|
| `fin.anleihearten` | Anleihearten, Rating und Gestaltung | $\text{Kuponanleihe}\;\cdot\;\text{Zerobond}\;\cdot\;\text{Floating Rate Note}$ | geprüft | 3 | – | FIN-VL23 S. 3–5, 9–10, 15 |
| `fin.zerobond` | Preis eines Zerobonds | $P_Z = \frac{N}{(1+r)^T}$ | geprüft | 5 | ja | FIN-VL23 S. 35–36, 41; KLAUSUR-BSP S. 5 |
| `fin.yield` | Yield to Maturity eines Zerobonds | $y = \left(\frac{\text{Nennwert}}{P_Z}\right)^{1/T} - 1$ | geprüft | 2 | ja | FIN-VL23 S. 35–36 |
| `fin.kuponanleihe` | Preis einer Kuponanleihe | $P_K = \sum_{t=1}^{T}\frac{k\cdot N}{(1+r)^t} + \frac{N}{(1+r)^T} = \frac{kN}{r}\left(1-\frac{1}{(1+r)^T}\right) + \frac{N}{(1+r)^T}$ | abgeleitet – Summenform aus der Vorlesung geprüft; geschlossene Form von der App abgeleitet und numerisch gegen die Summenform getestet. | 5 | ja | FIN-VL23 S. 37–41; KLAUSUR-BSP S. 5 |

## F4 Investitionsentscheidung (Finanzierung)

| ID | Formel | Darstellung | Status | Aufgaben | Generator | Quellen |
|---|---|---|---|---|---|---|
| `fin.kapitalwert` | Kapitalwert (Net Present Value) | $KW = -AAZ + \sum_{t=1}^{T}\frac{C_t}{(1+r)^t}\qquad(\text{2 Jahre: } KW = -AAZ + \tfrac{C_1}{1+r} + \tfrac{C_2}{(1+r)^2})$ | geprüft | 6 | ja | FIN-VL4 S. 4–7; FIN-T2L S. 2–3 |
| `fin.kapitalwertrate` | Kapitalwertrate | $KWR = \frac{BW_{\text{Zahlungen}}}{AAZ}$ | geprüft – Kommt in der Beispielklausur (mit Lösung) vor, aber nicht auf den Vorlesungsfolien SS 2026. Klausurrelevanz im aktuellen Semester unklar – siehe docs/content-issues.md. | 1 | – | KLAUSUR-BSP S. 4 |
| `fin.amortisation` | Amortisationsrechnung | $AD = \min\Big\{\,t : \sum_{i=1}^{t} C_i \ge AAZ\Big\}$ | geprüft | 3 | – | FIN-VL4 S. 9–12; FIN-T2L S. 4–9 |
| `fin.izs` | Interner Zinssatz (2-Perioden-Projekt) | $0 = -AAZ + \frac{C_1}{1+IZS} + \frac{C_2}{(1+IZS)^2}\;\Rightarrow\; 1+IZS = \frac{C_1 + \sqrt{C_1^2 + 4\,AAZ\,C_2}}{2\,AAZ}$ | abgeleitet – Definition aus der Vorlesung; geschlossene Lösung für zwei Perioden von der App abgeleitet und gegen alle Lösungen aus Klausur/Tutorium getestet. | 2 | ja | FIN-VL4 S. 13–15; FIN-T2L S. 10–11; KLAUSUR-BSP S. 3 |
| `fin.izs-probleme` | Probleme der internen Zinssatzmethode | $\text{Mehrere Vorzeichenwechsel}\;\cdot\;\text{Größenproblem}\;\cdot\;\text{Timing-Problem}$ | geprüft | 3 | – | FIN-VL4 S. 16–25; FIN-T2L S. 12–13; FIN-T3L S. 2–5 |

## F5 Eigenkapital & Aktien (Finanzierung)

| ID | Formel | Darstellung | Status | Aufgaben | Generator | Quellen |
|---|---|---|---|---|---|---|
| `fin.ek-fk` | Eigen- vs. Fremdkapital und Aktienrechte | $\text{EK: Eigentümer, Gewinnbeteiligung, nachrangig}\quad\text{FK: Gläubiger, fester Zins, vorrangig}$ | geprüft | 2 | – | FIN-VL1 S. 15–16; FIN-VL5 S. 3–5, 11 |
| `fin.ipo` | Empirische IPO-Phänomene | $\text{Underpricing}\;\cdot\;\text{Zyklizität}\;\cdot\;\text{hohe Kosten}\;\cdot\;\text{Langfrist-Performance}$ | geprüft | 2 | – | FIN-VL5 S. 9–10; KLAUSUR-BSP S. 10 |
| `fin.ausschuettung` | Dividende vs. Aktienrückkauf | $\text{Ex-Dividende: } P_{ex} = P_{cum} - Div\qquad\text{Rückkauf: Kurs unverändert, weniger Aktien}$ | geprüft | 3 | – | FIN-VL5 S. 12–19 |
| `fin.aktienrendite` | Aktienrendite (eine Periode) | $r = \frac{Div_1 + P_1 - P_0}{P_0} = \underbrace{\frac{Div_1}{P_0}}_{\text{Dividendenrendite}} + \underbrace{\frac{P_1-P_0}{P_0}}_{\text{Kursrendite}}$ | geprüft | 3 | ja | FIN-VL67 S. 5, 10; FIN-T3L S. 6–10 |
| `fin.ddm` | Dividend Discount Model (konstantes Wachstum) | $P_0 = \frac{Div_1}{r-g} = \frac{Div_0\,(1+g)}{r-g},\qquad Div_0 = \text{Ausschüttungsquote}\cdot\text{Gewinn pro Aktie}$ | geprüft – Aufgabe stammt aus der Beispielklausur (älterer Jahrgang). Auf den Folien SS 2026 steht die zugrunde liegende Rentenformel (wachsende ewige Rente), aber kein eigener DDM-Abschnitt. | 2 | ja | KLAUSUR-BSP S. 7–8; FIN-VL23 S. 31 |

## F6 Portfoliotheorie & CAPM (Finanzierung)

| ID | Formel | Darstellung | Status | Aufgaben | Generator | Quellen |
|---|---|---|---|---|---|---|
| `fin.halteperiode` | Halteperioden-Rendite | $r_{HP} = (1+r_1)(1+r_2)\cdots(1+r_n) - 1$ | geprüft | 1 | – | FIN-VL67 S. 6–7 |
| `fin.rendite-geo` | Geometrisch durchschnittliche Rendite | $(1+r_g)^n = (1+r_1)(1+r_2)\cdots(1+r_n)$ | geprüft | 2 | – | FIN-VL67 S. 6–7; FIN-T4L S. 6–7 |
| `fin.rendite-arith` | Arithmetisch durchschnittliche Rendite | $r_a = \frac{r_1 + r_2 + \dots + r_n}{n}$ | geprüft | 2 | – | FIN-VL67 S. 6–8; FIN-T4L S. 6–7 |
| `fin.erwartungswert` | Erwartete Rendite (Szenarien) | $\mu = E(\tilde r) = \sum_{s} p_s\, r_s$ | geprüft | 2 | – | FIN-VL67 S. 10–11 |
| `fin.varianz` | Varianz und Standardabweichung | $\sigma^2 = E\big[(\tilde r-\mu)^2\big] = \sum_s p_s (r_s - \mu)^2,\qquad \sigma = \sqrt{\sigma^2}$ | geprüft | 1 | – | FIN-VL67 S. 8, 12–13 |
| `fin.kovarianz` | Kovarianz und Korrelation | $cov_{1,2} = E\big[(\tilde r_1-\mu_1)(\tilde r_2-\mu_2)\big] = \sigma_1\,\sigma_2\,\rho_{12}$ | geprüft | 3 | ja | FIN-VL67 S. 17, 19; FIN-T4L S. 13 |
| `fin.portfolio-mu` | Erwartete Portfoliorendite | $\mu_w = w_1\,\mu_1 + w_2\,\mu_2,\qquad w_1 + w_2 = 100\,\%,\qquad w_i = \frac{x_i S_i}{\sum_j x_j S_j}$ | geprüft | 1 | ja | FIN-VL67 S. 14–16, 18 |
| `fin.portfolio-var` | Varianz eines Portfolios aus zwei Wertpapieren | $\sigma_w^2 = w_1^2\sigma_1^2 + w_2^2\sigma_2^2 + 2\,w_1 w_2\,\rho_{12}\,\sigma_1\sigma_2$ | geprüft | 6 | ja | FIN-VL67 S. 17–25 |
| `fin.risikolos-mix` | Portfolio aus riskantem und risikolosem Wertpapier | $\mu_w = w_A\,\mu_A + w_0\,r,\qquad \sigma_w = w_A\,\sigma_A$ | geprüft | 3 | – | FIN-VL67 S. 26–28; FIN-T5L S. 2–4 |
| `fin.kml` | Kapitalmarktlinie | $\mu_w = r + \frac{\mu_M - r}{\sigma_M}\,\sigma_w$ | geprüft | 2 | ja | FIN-VL67 S. 41–42; FIN-T5L S. 6–7 |
| `fin.wml` | Wertpapiermarktlinie (CAPM) | $\mu_j = r + (\mu_M - r)\,\beta_j$ | geprüft | 7 | ja | FIN-VL67 S. 43–44; KLAUSUR-BSP S. 7 |
| `fin.beta` | Beta-Faktor | $\beta_j = \frac{cov(\tilde r_j, \tilde r_M)}{\sigma_M^2} = \frac{\rho_{j,M}\,\sigma_j}{\sigma_M}$ | geprüft | 2 | ja | FIN-VL67 S. 43–46; KLAUSUR-BSP S. 7; FIN-T5L S. 13 |
| `fin.capm-annahmen` | CAPM-Annahmen und Risikozerlegung | $\sigma_j^2 = \underbrace{\text{systematisches Risiko}}_{\text{vergütet}} + \underbrace{\text{unsystematisches Risiko}}_{\text{nicht vergütet}}$ | geprüft | 3 | – | FIN-VL67 S. 31, 46; KLAUSUR-BSP S. 6 |

## R1 Grundlagen & Prinzipien (Rechnungswesen)

| ID | Formel | Darstellung | Status | Aufgaben | Generator | Quellen |
|---|---|---|---|---|---|---|
| `rw.reinvermoegen` | Reinvermögen und wirtschaftlicher Erfolg | $RV_t = VG_t - S_t\qquad\text{Erfolg}_{0\to1} = RV_1 - RV_0$ | geprüft | 2 | – | RW-VL1 S. 12–17 |
| `rw.gewinn` | Gewinn im Rechnungswesen | $\text{Gewinn} = \text{Erträge} - \text{Aufwendungen}$ | geprüft | 2 | – | RW-VL1 S. 20 |
| `rw.realisation` | Realisationsprinzip | $\text{Umsatzerlös realisiert} \Leftrightarrow \text{Risiken/Nutzen übertragen} \wedge \text{genau messbar} \wedge \text{hohe Sicherheit des Nutzens}$ | geprüft | 5 | – | RW-VL1 S. 22–25; KLAUSUR-BSP S. 12 |
| `rw.matching` | Matching Principle | $\text{Aufwand}_t \;\leftrightarrow\; \text{Umsatzerlöse}_t$ | geprüft | 5 | – | RW-VL1 S. 26–28; KLAUSUR-BSP S. 12–13 |
| `rw.vorsicht` | Vorsichts-, Fortführungs- und Konsistenzprinzip | $\text{Verluste so früh wie möglich, Gewinne erst bei Realisierung}$ | geprüft | 2 | – | RW-VL1 S. 29–30; RW-VL23 S. 6 |

## R2 Bilanz & GuV (Rechnungswesen)

| ID | Formel | Darstellung | Status | Aufgaben | Generator | Quellen |
|---|---|---|---|---|---|---|
| `rw.bilanzgleichung` | Bilanzgleichung | $\text{Vermögensgegenstände} = \text{Fremdkapital (Schulden)} + \text{Eigenkapital}$ | geprüft | 4 | – | RW-VL23 S. 4–8 |
| `rw.ek-komponenten` | Komponenten des Eigenkapitals | $EK = \underbrace{\text{Gezeichnetes Kapital} + \text{Kapitalrücklage}}_{\text{von Gesellschaftern eingezahlt}} + \underbrace{\text{Gewinnrücklage}}_{\text{kumulierte einbehaltene Gewinne}}$ | geprüft | 2 | – | RW-VL23 S. 8; KLAUSUR-BSP S. 11–12 |
| `rw.guv-schema` | GuV-Schema (operativer Gewinn) | $\text{Operativer Gewinn} = \underbrace{\text{Umsatzerlöse} - \text{Herstellungskosten}}_{\text{Bruttoergebnis}} - \text{Periodenaufwendungen}$ | geprüft | 3 | – | RW-VL23 S. 10–14 |
| `rw.gewinn-ek` | Gewinn als Veränderung des Eigenkapitals | $\text{Gewinn}_{1\to2} = EK_2 - EK_1 \;\;(\text{ohne Einlagen/Entnahmen der Eigentümer})$ | geprüft | 1 | – | RW-VL23 S. 14 |
| `rw.worksheet` | Worksheet Approach (Verbuchen in Bilanz und GuV) | $\Delta VG = \Delta FK + \Delta EK,\quad \Delta EK_{\text{GuV}} = \text{Ertrag} - \text{Aufwand}$ | geprüft | 2 | – | RW-VL23 S. 21–48; KLAUSUR-BSP S. 13–14 |
| `rw.cashflow` | Kapitalflussrechnung (Cashflow) | $CF_{\text{operativ}} \approx \text{op. Gewinn} + \text{Abschreibungen} + \Delta\text{Rückstellungen} - \Delta\text{Vorräte} - \Delta\text{Forderungen LuL}$ | geprüft | 1 | ja | RW-VL23 S. 51–53 |
| `rw.nwc` | Netto-Geldvermögen, Net Working Capital, RAP | $NGV = LM + WP + Ford. - \text{kfr. Schulden}\qquad NWC = NGV + \text{Vorräte} = UV - \text{kfr. Schulden}$ | geprüft | 3 | – | RW-VL23 S. 53–58 |

## R3 Abschreibung, Vorräte & Herstellungskosten (Rechnungswesen)

| ID | Formel | Darstellung | Status | Aufgaben | Generator | Quellen |
|---|---|---|---|---|---|---|
| `rw.afa-linear` | Lineare Abschreibung | $ABS_t = \frac{AW_{VG} - LW_{VG}}{T}$ | geprüft | 6 | ja | RW-VL4 S. 4–9 |
| `rw.afa-geo` | Geometrisch-degressive Abschreibung | $p = 1 - \sqrt[T]{\frac{LW_{VG}}{AW_{VG}}}\qquad ABS_t = p\cdot BW_{t-1}$ | geprüft | 3 | ja | RW-VL4 S. 10–12 |
| `rw.afa-leistung` | Leistungsabschreibung | $ABS_t = \frac{AW - LW}{\text{geschätzte Gesamtleistung}}\cdot \text{Leistung}_t$ | geprüft | 2 | – | RW-VL4 S. 12; JB-K4 S. 44; JB-K4A2 S. 1 |
| `rw.afa-apl` | Außerplanmäßige Abschreibung und Zuschreibung | $BW_{neu} = \max(\text{Marktwert}, \text{indirekter Wert})\quad\text{wenn } BW \gg \text{diese Werte}$ | geprüft | 1 | – | RW-VL4 S. 13–14 |
| `rw.rueckstellung` | Rückstellungen | $\text{Bildung: } EK\downarrow,\ \text{Rückstellung}\uparrow,\ \text{Aufwand}\uparrow\qquad \text{Zahlung: } LM\downarrow,\ \text{Rückstellung}\downarrow$ | geprüft | 2 | – | RW-VL4 S. 18–20 |
| `rw.vorraete` | Vorratsbewertung: Durchschnitt, FIFO, LIFO | $\varnothing\text{-Preis} = \frac{\text{Wert Anfangsbestand} + \text{Wert Zugänge}}{\text{Menge Anfangsbestand} + \text{Menge Zugänge}}$ | geprüft | 1 | – | RW-VL4 S. 21–25 |
| `rw.ac-vc` | Voll- vs. Teilkostenrechnung (Absorption vs. Variable Costing) | $G_{AC} - G_{VC} = \Delta\text{Vorrat (Stück)}\cdot\text{fixe Herstellungskosten pro Stück}$ | geprüft | 4 | – | RW-VL4 S. 26–30 |

## R4 Kostenbegriffe & Break-even (Rechnungswesen)

| ID | Formel | Darstellung | Status | Aufgaben | Generator | Quellen |
|---|---|---|---|---|---|---|
| `rw.kostenbegriffe` | Grundkosten, Anderskosten, Zusatzkosten, neutraler Aufwand | $\text{Aufwand} = \text{neutraler Aufwand} + \text{Zweckaufwand},\quad \text{Kosten} = \text{Grundkosten} + \underbrace{\text{Anderskosten} + \text{Zusatzkosten}}_{\text{kalkulatorische Kosten}}$ | geprüft | 2 | – | RW-VL5 S. 5, 10–12 |
| `rw.kostenarten` | Fixe vs. variable und Einzel- vs. Gemeinkosten | $K = k_v\cdot x + K_f\qquad\text{Einzelkosten: direkt zurechenbar}\;\;\text{Gemeinkosten: über Schlüssel}$ | geprüft | 2 | – | RW-VL5 S. 17–25 |
| `rw.operatives-ergebnis` | Operatives Ergebnis (lineare Kosten- und Umsatzverläufe) | $\text{Op. Ergebnis} = (p - k_v)\cdot x - K_f$ | geprüft | 4 | ja | RW-VL5 S. 20–21; KLAUSUR-BSP S. 15 |
| `rw.break-even` | Break-even-Menge | $x_{BE} = \frac{K_f}{p - k_v}$ | geprüft | 4 | ja | RW-VL5 S. 20–21 |
| `rw.kalk-annuitaet` | Kalkulatorische Kosten: Annuitätenabschreibung | $C = \frac{BW - RW}{A} + r\cdot RW,\qquad A = \frac{(1+r)^T - 1}{r\,(1+r)^T}$ | geprüft | 1 | ja | RW-VL5 S. 5–6 |
| `rw.kalk-wiederbeschaffung` | Zusätzliche Abschreibung für höhere Wiederbeschaffungskosten | $C_{zus} = \frac{EW}{A'},\qquad A' = \frac{(1+r)^T - 1}{r},\qquad EW = WBK - AK$ | geprüft – Laut Folie 7 entspricht EW zusammen mit historischer Abschreibung und Restwert den Wiederbeschaffungskosten (135.000 − 100.000 = 35.000 €). | 1 | – | RW-VL5 S. 7–9 |

## R5 Kostenstellenrechnung (Rechnungswesen)

| ID | Formel | Darstellung | Status | Aufgaben | Generator | Quellen |
|---|---|---|---|---|---|---|
| `rw.anbau` | Anbauverfahren | $q_i = \frac{\text{primäre Gemeinkosten der Vorkostenstelle } i}{\text{Leistungseinheiten an die Endkostenstellen}}$ | geprüft | 3 | ja | RW-VL6 S. 12–16, 28 |
| `rw.stufenleiter` | Stufenleiterverfahren | $q_i = \frac{K^{prim}_i + \sum_{j<i} q_j\,l_{ji}}{\text{Leistung an Endkostenstellen} + \text{an nachfolgende Vorkostenstellen}}$ | geprüft – Die offizielle Klausurlösung rechnet für die Kantine mit dem gerundeten Transportpreis 1,6938 und erhält 14,6334; mit ungerundetem Wert ergibt sich 14,6333 (siehe docs/content-issues.md). Die App akzeptiert beide. | 4 | – | RW-VL6 S. 18–21, 27; KLAUSUR-BSP S. 15–16 |
| `rw.gleichungsverfahren` | Gleichungsverfahren | $K^{prim}_i + \sum_{j\ne i} q_j\,l_{ji} = q_i\cdot L_i\quad\Leftrightarrow\quad A\,q = b,\; q = A^{-1}b$ | geprüft | 3 | – | RW-VL6 S. 22–26 |

## R6 Kostenträgerrechnung (Rechnungswesen)

| ID | Formel | Darstellung | Status | Aufgaben | Generator | Quellen |
|---|---|---|---|---|---|---|
| `rw.division` | Divisionskalkulation | $k = \frac{K_{gesamt}}{x}\qquad\text{zweistufig: } k = \frac{HK}{x_{Prod}} + \frac{VwVt}{x_{Abs}}$ | geprüft | 2 | ja | RW-VL7 S. 5–6; RW-T7L S. 3 |
| `rw.aequivalenz` | Äquivalenzziffernkalkulation | $k_{RE} = \frac{K}{\sum_i \text{ÄZ}_i\,x_i},\qquad k_i = \text{ÄZ}_i\cdot k_{RE}$ | geprüft | 3 | – | RW-VL7 S. 7–8; RW-T7L S. 4 |
| `rw.zuschlagssatz` | Gemeinkostenzuschlagssatz | $\text{Zuschlagssatz} = \frac{\text{Gemeinkosten der Kostenstelle}}{\text{zugehörige Bezugsgröße (Einzelkosten bzw. Herstellkosten)}}$ | geprüft | 1 | – | RW-VL7 S. 9–11 |
| `rw.zuschlagskalkulation` | Kalkulationsschema der Zuschlagskalkulation | $\underbrace{MEK + MGK}_{\text{Materialkosten}} + \underbrace{FEK + FGK}_{\text{Fertigungskosten}} = HK;\quad SK = HK + VwGK + VtGK$ | geprüft | 4 | – | RW-VL7 S. 9–12; RW-T7L S. 5–7 |
| `rw.maschinenstundensatz` | Maschinenstundensatz (und Lohnstundensatz) | $MSS = \frac{\text{maschinenabhängige Gemeinkosten}}{\text{Maschinenlaufzeit}}\qquad FK = FEK + MSS\cdot t_{Masch} + z_{Rest}\cdot FEK$ | geprüft | 2 | ja | RW-VL7 S. 13–18; RW-T7L S. 8–9 |

## J1 Bewertung nach HGB (Jahresabschluss & Bewertung)

| ID | Formel | Darstellung | Status | Aufgaben | Generator | Quellen |
|---|---|---|---|---|---|---|
| `jb.anschaffungskosten` | Anschaffungskosten nach §255 Abs. 1 HGB | $AK = \text{Anschaffungspreis} - \text{AK-Minderungen} + \text{Nebenkosten (einzeln zurechenbar)} + \text{nachträgliche AK}$ | geprüft | 3 | – | JB-K4 S. 18–21; JB-K4A1 S. 1 |
| `jb.herstellungskosten` | Herstellungskosten nach HGB (Wertunter- und -obergrenze) | $\underbrace{MEK + FEK + SEK_F + \text{Material-/Fertigungs-GK}}_{\text{Wertuntergrenze (Pflicht)}} + \underbrace{\text{Verwaltung} + \text{FK-Kosten}}_{\text{Wahlrecht}} = \text{Wertobergrenze}$ | geprüft | 2 | – | JB-K4 S. 22–28; JB-K4A1 S. 1 |
| `jb.niederstwert` | Niederstwertprinzip und Wertaufholung | $\text{UV: strenges NWP (immer)}\qquad \text{AV: gemildertes NWP (nur bei dauerhafter Wertminderung)}$ | geprüft | 2 | – | JB-K4 S. 45–55; JB-K4A2 S. 1 |
| `jb.verbrauchsfolge` | Verbrauchsfolgeverfahren (HGB) | $\text{Gesamte AK} = \text{Wert des Verbrauchs (GuV)} + \text{Wert des Endbestands (Bilanz)}$ | geprüft – Die Zugangsdaten stehen in einer Tabelle auf Folie 51, die nicht vollständig als Text extrahierbar war; die Zahlen stammen aus den offiziellen Antworten. | 1 | – | JB-K4 S. 49–52; JB-K4A2 S. 2 |

## J2 GuV nach HGB (Jahresabschluss & Bewertung)

| ID | Formel | Darstellung | Status | Aufgaben | Generator | Quellen |
|---|---|---|---|---|---|---|
| `jb.gkv-ukv` | Gesamtkostenverfahren vs. Umsatzkostenverfahren | $\text{GKV: Kostenarten der Periode} \pm \Delta\text{Bestand}\qquad \text{UKV: Herstellungskosten der abgesetzten Leistungen}$ | geprüft | 2 | – | JB-K5 S. 11–18; RW-VL4 S. 28 |

