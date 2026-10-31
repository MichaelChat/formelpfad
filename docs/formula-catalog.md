# Katalog: Formeln und Wissen

> Automatisch erzeugt mit `npm run docs` aus `src/content/data/*`. Nicht von Hand bearbeiten.

Insgesamt **63 Formeln** und **41 Wissenskarten** in **18 Kapiteln**. Status: geprüft 102, abgeleitet 2.

Legende Status: **geprüft** = steht so in den Unterlagen und wurde nachgerechnet · **abgeleitet** = von der App ergänzt (z. B. Umstellung), mathematisch geprüft, aber nicht wörtlich in den Unterlagen · **ungeprüft** = unklar, siehe `content-issues.md`.

## F0 Grundbegriffe der Finanzierung (Finanzierung)

| ID | Art | Name | Darstellung / Kernaussage | Status | Aufgaben | Generator | Quellen |
|---|---|---|---|---|---|---|---|
| `fin.w.grundbegriffe` | Wissen | Investition, Finanzierung und Wertschöpfung | Eine Investition ist eine Entscheidung, die zunächst eine Auszahlung zur Folge hat (Mittelverwendung). Eine Finanzierung ist eine Entscheidung, die zunächst ein … | geprüft | 6 | – | FIN-VL1 S. 7, 10, 15, 16, 20, 24 |

## F1 Zeitwert des Geldes (Finanzierung)

| ID | Art | Name | Darstellung / Kernaussage | Status | Aufgaben | Generator | Quellen |
|---|---|---|---|---|---|---|---|
| `fin.endwert` | Formel | Endwert (mehrperiodig) | $EW = C_0 \cdot (1+r)^T$ | geprüft | 5 | ja | FIN-VL23 S. 17, 20 |
| `fin.barwert` | Formel | Barwert einer Zahlung | $BW = \frac{C_T}{(1+r)^T}$ | geprüft | 5 | ja | FIN-VL23 S. 18–19 |
| `fin.unterjaehrig` | Formel | Endwert bei unterjähriger Verzinsung | $EW = C_0 \cdot \left(1 + \frac{r}{m}\right)^{m\cdot T}$ | geprüft | 2 | ja | FIN-VL23 S. 21 |
| `fin.ejz` | Formel | Effektiver Jahreszinssatz | $EJZ = \left(1 + \frac{r}{m}\right)^{m} - 1$ | geprüft | 5 | ja | FIN-VL23 S. 22–23; FIN-T1L S. 5–6, 10 |
| `fin.stetig` | Formel | Stetige Verzinsung | $EW = C_0 \cdot e^{r\cdot T}$ | geprüft | 3 | ja | FIN-VL23 S. 24; FIN-T1L S. 5 |
| `fin.bw-strom` | Formel | Barwert und Endwert eines Zahlungsstroms | $BW = \sum_{i=1}^{T}\frac{C_i}{(1+r)^i}\qquad EW = \sum_{i=1}^{T} C_i\,(1+r)^{T-i}$ | geprüft | 2 | – | FIN-VL23 S. 25 |

## F2 Rentenformeln (Finanzierung)

| ID | Art | Name | Darstellung / Kernaussage | Status | Aufgaben | Generator | Quellen |
|---|---|---|---|---|---|---|---|
| `fin.ewige-rente` | Formel | Ewige Rente | $BW = \frac{C}{r}$ | geprüft | 6 | ja | FIN-VL23 S. 27–28 |
| `fin.ewige-wachsend` | Formel | Ewige Rente mit konstantem Wachstum | $BW = \frac{C}{r-g}$ | geprüft | 5 | ja | FIN-VL23 S. 31–32; FIN-T1L S. 7 |
| `fin.endliche-rente` | Formel | Endliche Rente (Annuität) | $BW = \frac{C}{r}\left(1 - \frac{1}{(1+r)^T}\right)$ | geprüft | 7 | ja | FIN-VL23 S. 29–30 |
| `fin.endliche-wachsend` | Formel | Endliche Rente mit konstantem Wachstum | $BW = \frac{C}{r-g}\left(1 - \left(\frac{1+g}{1+r}\right)^{T}\right)$ | geprüft | 4 | ja | FIN-VL23 S. 33–34; FIN-T1L S. 16–17 |
| `fin.renten-endwert` | Formel | Endwert einer Rente / Sparrate | $EW = \frac{C}{r}\big((1+r)^T - 1\big)\quad\Leftrightarrow\quad C = \frac{EW\cdot r}{(1+r)^T-1}$ | geprüft – Formel steht so in den Tutoriumslösungen (nicht auf den Vorlesungsfolien). | 5 | ja | FIN-T1L S. 8–11 |

## F3 Anleihen (Finanzierung)

| ID | Art | Name | Darstellung / Kernaussage | Status | Aufgaben | Generator | Quellen |
|---|---|---|---|---|---|---|---|
| `fin.anleihearten` | Wissen | Anleihearten, Rating und Gestaltung | Kuponanleihe: feste Zinsen jedes Jahr + Rückzahlung am Ende. Zerobond: nur eine Zahlung am Ende. Floater: variable Zinsen, die sich an kurzfristigen Marktzinsen … | geprüft | 5 | – | FIN-VL23 S. 3–5, 9–10, 15 |
| `fin.zerobond` | Formel | Preis eines Zerobonds | $P_Z = \frac{N}{(1+r)^T}$ | geprüft | 5 | ja | FIN-VL23 S. 35–36, 41; KLAUSUR-BSP S. 5 |
| `fin.yield` | Formel | Yield to Maturity eines Zerobonds | $y = \left(\frac{\text{Nennwert}}{P_Z}\right)^{1/T} - 1$ | geprüft | 2 | ja | FIN-VL23 S. 35–36 |
| `fin.kuponanleihe` | Formel | Preis einer Kuponanleihe | $P_K = \sum_{t=1}^{T}\frac{k\cdot N}{(1+r)^t} + \frac{N}{(1+r)^T} = \frac{kN}{r}\left(1-\frac{1}{(1+r)^T}\right) + \frac{N}{(1+r)^T}$ | abgeleitet – Summenform aus der Vorlesung geprüft; geschlossene Form von der App abgeleitet und numerisch gegen die Summenform getestet. | 5 | ja | FIN-VL23 S. 37–41; KLAUSUR-BSP S. 5 |

## F4 Investitionsentscheidung (Finanzierung)

| ID | Art | Name | Darstellung / Kernaussage | Status | Aufgaben | Generator | Quellen |
|---|---|---|---|---|---|---|---|
| `fin.kapitalwert` | Formel | Kapitalwert (Net Present Value) | $KW = -AAZ + \sum_{t=1}^{T}\frac{C_t}{(1+r)^t}\qquad(\text{2 Jahre: } KW = -AAZ + \tfrac{C_1}{1+r} + \tfrac{C_2}{(1+r)^2})$ | geprüft | 8 | ja | FIN-VL4 S. 4–7; FIN-T2L S. 2–3 |
| `fin.kapitalwertrate` | Formel | Kapitalwertrate | $KWR = \frac{BW_{\text{Zahlungen}}}{AAZ}$ | geprüft – Kommt in der Beispielklausur (mit Lösung) vor, aber nicht auf den Vorlesungsfolien SS 2026. Klausurrelevanz im aktuellen Semester unklar – siehe docs/content-issues.md. | 1 | – | KLAUSUR-BSP S. 4 |
| `fin.amortisation` | Formel | Amortisationsrechnung | $AD = \min\Big\{\,t : \sum_{i=1}^{t} C_i \ge AAZ\Big\}$ | geprüft | 4 | – | FIN-VL4 S. 9–12; FIN-T2L S. 4–9 |
| `fin.izs` | Formel | Interner Zinssatz (2-Perioden-Projekt) | $0 = -AAZ + \frac{C_1}{1+IZS} + \frac{C_2}{(1+IZS)^2}\;\Rightarrow\; 1+IZS = \frac{C_1 + \sqrt{C_1^2 + 4\,AAZ\,C_2}}{2\,AAZ}$ | abgeleitet – Definition aus der Vorlesung; geschlossene Lösung für zwei Perioden von der App abgeleitet und gegen alle Lösungen aus Klausur/Tutorium getestet. | 2 | ja | FIN-VL4 S. 13–15; FIN-T2L S. 10–11; KLAUSUR-BSP S. 3 |
| `fin.izs-probleme` | Wissen | Probleme der internen Zinssatzmethode | Der IZS ist eine relative Kennzahl. Er sagt nichts über die absolute Größe des Wertbeitrags und hängt nicht vom geforderten Zins ab – die Kapitalwertmethode sch … | geprüft | 3 | – | FIN-VL4 S. 16–25; FIN-T2L S. 12–13; FIN-T3L S. 2–5 |
| `fin.w.verfahren` | Wissen | Investitionsrechenverfahren: Stärken und Schwächen | Kapitalwertmethode, Amortisationsrechnung und interne Zinssatzmethode beantworten die Investitionsfrage unterschiedlich gut. Die Kapitalwertmethode gilt als Ref … | geprüft | 5 | – | FIN-VL4 S. 7, 11, 12, 16–25 |

## F5 Eigenkapital & Aktien (Finanzierung)

| ID | Art | Name | Darstellung / Kernaussage | Status | Aufgaben | Generator | Quellen |
|---|---|---|---|---|---|---|---|
| `fin.ek-fk` | Wissen | Eigen- vs. Fremdkapital und Aktienrechte | Gläubiger haben vertraglich feste Ansprüche und werden in der Insolvenz zuerst bedient; Eigentümer tragen das Restrisiko und bekommen dafür den variablen Gewinn … | geprüft | 5 | – | FIN-VL1 S. 15–16; FIN-VL5 S. 3–5, 11 |
| `fin.ipo` | Wissen | Empirische IPO-Phänomene | Vier Muster, die man bei Börsengängen immer wieder beobachtet. | geprüft | 4 | – | FIN-VL5 S. 9–10; KLAUSUR-BSP S. 10 |
| `fin.ausschuettung` | Formel | Dividende vs. Aktienrückkauf | $\text{Ex-Dividende: } P_{ex} = P_{cum} - Div\qquad\text{Rückkauf: Kurs unverändert, weniger Aktien}$ | geprüft | 4 | – | FIN-VL5 S. 12–19 |
| `fin.aktienrendite` | Formel | Aktienrendite (eine Periode) | $r = \frac{Div_1 + P_1 - P_0}{P_0} = \underbrace{\frac{Div_1}{P_0}}_{\text{Dividendenrendite}} + \underbrace{\frac{P_1-P_0}{P_0}}_{\text{Kursrendite}}$ | geprüft | 3 | ja | FIN-VL67 S. 5, 10; FIN-T3L S. 6–10 |
| `fin.ddm` | Formel | Dividend Discount Model (konstantes Wachstum) | $P_0 = \frac{Div_1}{r-g} = \frac{Div_0\,(1+g)}{r-g},\qquad Div_0 = \text{Ausschüttungsquote}\cdot\text{Gewinn pro Aktie}$ | geprüft – Aufgabe stammt aus der Beispielklausur (älterer Jahrgang). Auf den Folien SS 2026 steht die zugrunde liegende Rentenformel (wachsende ewige Rente), aber kein eigener DDM-Abschnitt. | 2 | ja | KLAUSUR-BSP S. 7–8; FIN-VL23 S. 31 |
| `fin.w.ipo` | Wissen | Börsengang (IPO): Ablauf | Beim Börsengang (Initial Public Offering) beschafft sich ein Unternehmen Eigenkapital am Kapitalmarkt. Der Prozess reicht von der Auswahl der Emissionsbanken bi … | geprüft | 4 | – | FIN-VL5 S. 9 |
| `fin.w.ausschuettungspolitik` | Wissen | Ausschüttungspolitik: Dividenden und Aktienrückkäufe | Unternehmen können Gewinne als Dividende ausschütten oder eigene Aktien zurückkaufen. Im perfekten Kapitalmarkt (ohne Steuern) sind beide Wege äquivalent; in de … | geprüft | 5 | – | FIN-VL5 S. 12, 14–18 |

## F6 Portfoliotheorie & CAPM (Finanzierung)

| ID | Art | Name | Darstellung / Kernaussage | Status | Aufgaben | Generator | Quellen |
|---|---|---|---|---|---|---|---|
| `fin.halteperiode` | Formel | Halteperioden-Rendite | $r_{HP} = (1+r_1)(1+r_2)\cdots(1+r_n) - 1$ | geprüft | 1 | – | FIN-VL67 S. 6–7 |
| `fin.rendite-geo` | Formel | Geometrisch durchschnittliche Rendite | $(1+r_g)^n = (1+r_1)(1+r_2)\cdots(1+r_n)$ | geprüft | 2 | – | FIN-VL67 S. 6–7; FIN-T4L S. 6–7 |
| `fin.rendite-arith` | Formel | Arithmetisch durchschnittliche Rendite | $r_a = \frac{r_1 + r_2 + \dots + r_n}{n}$ | geprüft | 2 | – | FIN-VL67 S. 6–8; FIN-T4L S. 6–7 |
| `fin.erwartungswert` | Formel | Erwartete Rendite (Szenarien) | $\mu = E(\tilde r) = \sum_{s} p_s\, r_s$ | geprüft | 2 | – | FIN-VL67 S. 10–11 |
| `fin.varianz` | Formel | Varianz und Standardabweichung | $\sigma^2 = E\big[(\tilde r-\mu)^2\big] = \sum_s p_s (r_s - \mu)^2,\qquad \sigma = \sqrt{\sigma^2}$ | geprüft | 1 | – | FIN-VL67 S. 8, 12–13 |
| `fin.kovarianz` | Formel | Kovarianz und Korrelation | $cov_{1,2} = E\big[(\tilde r_1-\mu_1)(\tilde r_2-\mu_2)\big] = \sigma_1\,\sigma_2\,\rho_{12}$ | geprüft | 3 | ja | FIN-VL67 S. 17, 19; FIN-T4L S. 13 |
| `fin.portfolio-mu` | Formel | Erwartete Portfoliorendite | $\mu_w = w_1\,\mu_1 + w_2\,\mu_2,\qquad w_1 + w_2 = 100\,\%,\qquad w_i = \frac{x_i S_i}{\sum_j x_j S_j}$ | geprüft | 1 | ja | FIN-VL67 S. 14–16, 18 |
| `fin.portfolio-var` | Formel | Varianz eines Portfolios aus zwei Wertpapieren | $\sigma_w^2 = w_1^2\sigma_1^2 + w_2^2\sigma_2^2 + 2\,w_1 w_2\,\rho_{12}\,\sigma_1\sigma_2$ | geprüft | 6 | ja | FIN-VL67 S. 17–25 |
| `fin.risikolos-mix` | Formel | Portfolio aus riskantem und risikolosem Wertpapier | $\mu_w = w_A\,\mu_A + w_0\,r,\qquad \sigma_w = w_A\,\sigma_A$ | geprüft | 3 | – | FIN-VL67 S. 26–28; FIN-T5L S. 2–4 |
| `fin.kml` | Formel | Kapitalmarktlinie | $\mu_w = r + \frac{\mu_M - r}{\sigma_M}\,\sigma_w$ | geprüft | 2 | ja | FIN-VL67 S. 41–42; FIN-T5L S. 6–7 |
| `fin.wml` | Formel | Wertpapiermarktlinie (CAPM) | $\mu_j = r + (\mu_M - r)\,\beta_j$ | geprüft | 7 | ja | FIN-VL67 S. 43–44; KLAUSUR-BSP S. 7 |
| `fin.beta` | Formel | Beta-Faktor | $\beta_j = \frac{cov(\tilde r_j, \tilde r_M)}{\sigma_M^2} = \frac{\rho_{j,M}\,\sigma_j}{\sigma_M}$ | geprüft | 2 | ja | FIN-VL67 S. 43–46; KLAUSUR-BSP S. 7; FIN-T5L S. 13 |
| `fin.capm-annahmen` | Wissen | CAPM-Annahmen und Risikozerlegung | Wenn alle Investoren gleich denken, halten alle dasselbe Tangentialportfolio – im Gleichgewicht das Marktportfolio. Dann zählt nur noch der Risikobeitrag zum Ma … | geprüft | 5 | – | FIN-VL67 S. 31, 46; KLAUSUR-BSP S. 6 |

## R1 Grundlagen & Prinzipien (Rechnungswesen)

| ID | Art | Name | Darstellung / Kernaussage | Status | Aufgaben | Generator | Quellen |
|---|---|---|---|---|---|---|---|
| `rw.reinvermoegen` | Formel | Reinvermögen und wirtschaftlicher Erfolg | $RV_t = VG_t - S_t\qquad\text{Erfolg}_{0\to1} = RV_1 - RV_0$ | geprüft | 2 | – | RW-VL1 S. 12–17 |
| `rw.gewinn` | Formel | Gewinn im Rechnungswesen | $\text{Gewinn} = \text{Erträge} - \text{Aufwendungen}$ | geprüft | 2 | – | RW-VL1 S. 20 |
| `rw.realisation` | Wissen | Realisationsprinzip | Umsatz gibt es, wenn das Geschäft „durch“ ist – nicht schon bei der Bestellung, nicht erst bei der Zahlung. | geprüft | 8 | – | RW-VL1 S. 22–25; KLAUSUR-BSP S. 12 |
| `rw.matching` | Wissen | Matching Principle | Aufwendungen „wandern“ zu den Umsätzen, die sie verursacht haben – egal, wann gezahlt wurde. | geprüft | 8 | – | RW-VL1 S. 26–28; KLAUSUR-BSP S. 12–13 |
| `rw.vorsicht` | Wissen | Vorsichts-, Fortführungs- und Konsistenzprinzip | Lieber zu pessimistisch als zu optimistisch: Drohende Verluste sofort zeigen, erhoffte Gewinne erst, wenn sie sicher sind. | geprüft | 6 | – | RW-VL1 S. 29–30; RW-VL23 S. 6 |
| `rw.w.erfolg` | Wissen | Wirtschaftlicher Erfolg und Gewinn | Der wirtschaftliche Erfolg einer Periode ist die Veränderung des Reinvermögens (Vermögen minus Schulden) – nicht die Veränderung des Kassenbestands. Gewinn ist  … | geprüft | 6 | – | RW-VL1 S. 10–11; RW-D1 S. 1; RW-VL23 S. 28, 35; RW-D2 S. 1; RW-D3 S. 1 |

## R2 Bilanz & GuV (Rechnungswesen)

| ID | Art | Name | Darstellung / Kernaussage | Status | Aufgaben | Generator | Quellen |
|---|---|---|---|---|---|---|---|
| `rw.bilanzgleichung` | Formel | Bilanzgleichung | $\text{Vermögensgegenstände} = \text{Fremdkapital (Schulden)} + \text{Eigenkapital}$ | geprüft | 4 | – | RW-VL23 S. 4–8 |
| `rw.ek-komponenten` | Wissen | Komponenten des Eigenkapitals | Eigenkapital entsteht auf zwei Wegen: Eigentümer zahlen ein, oder das Unternehmen behält Gewinne ein. | geprüft | 4 | – | RW-VL23 S. 8; KLAUSUR-BSP S. 11–12 |
| `rw.guv-schema` | Formel | GuV-Schema (operativer Gewinn) | $\text{Operativer Gewinn} = \underbrace{\text{Umsatzerlöse} - \text{Herstellungskosten}}_{\text{Bruttoergebnis}} - \text{Periodenaufwendungen}$ | geprüft | 3 | – | RW-VL23 S. 10–14 |
| `rw.gewinn-ek` | Formel | Gewinn als Veränderung des Eigenkapitals | $\text{Gewinn}_{1\to2} = EK_2 - EK_1 \;\;(\text{ohne Einlagen/Entnahmen der Eigentümer})$ | geprüft | 1 | – | RW-VL23 S. 14 |
| `rw.worksheet` | Formel | Worksheet Approach (Verbuchen in Bilanz und GuV) | $\Delta VG = \Delta FK + \Delta EK,\quad \Delta EK_{\text{GuV}} = \text{Ertrag} - \text{Aufwand}$ | geprüft | 2 | – | RW-VL23 S. 21–48; KLAUSUR-BSP S. 13–14 |
| `rw.cashflow` | Formel | Kapitalflussrechnung (Cashflow) | $CF_{\text{operativ}} \approx \text{op. Gewinn} + \text{Abschreibungen} + \Delta\text{Rückstellungen} - \Delta\text{Vorräte} - \Delta\text{Forderungen LuL}$ | geprüft | 1 | ja | RW-VL23 S. 51–53 |
| `rw.nwc` | Formel | Netto-Geldvermögen, Net Working Capital, RAP | $NGV = LM + WP + Ford. - \text{kfr. Schulden}\qquad NWC = NGV + \text{Vorräte} = UV - \text{kfr. Schulden}$ | geprüft | 3 | – | RW-VL23 S. 53–58 |
| `rw.w.aktivieren` | Wissen | Aktivieren oder sofort als Aufwand verbuchen | Auszahlungen werden aktiviert (als Vermögensgegenstand in die Bilanz genommen), wenn sie einen zukünftigen ökonomischen Wert schaffen, der zuverlässig in Geld m … | geprüft | 7 | – | RW-VL23 S. 15, 21, 26; RW-D2 S. 1; RW-VL4 S. 16; RW-D4 S. 2 |
| `rw.w.erfolgswirksam` | Wissen | Erfolgswirksam oder erfolgsneutral buchen | Ein Geschäftsvorfall ist erfolgswirksam, wenn er das Eigenkapital über Erträge oder Aufwendungen verändert (dann auch in der GuV). Erfolgsneutral ist er, wenn s … | geprüft | 4 | – | RW-VL23 S. 35–41; RW-D3 S. 1 |

## R3 Abschreibung, Vorräte & Herstellungskosten (Rechnungswesen)

| ID | Art | Name | Darstellung / Kernaussage | Status | Aufgaben | Generator | Quellen |
|---|---|---|---|---|---|---|---|
| `rw.afa-linear` | Formel | Lineare Abschreibung | $ABS_t = \frac{AW_{VG} - LW_{VG}}{T}$ | geprüft | 6 | ja | RW-VL4 S. 4–9 |
| `rw.afa-geo` | Formel | Geometrisch-degressive Abschreibung | $p = 1 - \sqrt[T]{\frac{LW_{VG}}{AW_{VG}}}\qquad ABS_t = p\cdot BW_{t-1}$ | geprüft | 3 | ja | RW-VL4 S. 10–12 |
| `rw.afa-leistung` | Formel | Leistungsabschreibung | $ABS_t = \frac{AW - LW}{\text{geschätzte Gesamtleistung}}\cdot \text{Leistung}_t$ | geprüft | 2 | – | RW-VL4 S. 12; JB-K4 S. 44; JB-K4A2 S. 1 |
| `rw.afa-apl` | Formel | Außerplanmäßige Abschreibung und Zuschreibung | $BW_{neu} = \max(\text{Marktwert}, \text{indirekter Wert})\quad\text{wenn } BW \gg \text{diese Werte}$ | geprüft | 1 | – | RW-VL4 S. 13–14 |
| `rw.rueckstellung` | Wissen | Rückstellungen | Der Aufwand gehört in die Periode, die die Verpflichtung verursacht hat (Matching) – auch wenn erst später gezahlt wird. | geprüft | 4 | – | RW-VL4 S. 18–20 |
| `rw.vorraete` | Formel | Vorratsbewertung: Durchschnitt, FIFO, LIFO | $\varnothing\text{-Preis} = \frac{\text{Wert Anfangsbestand} + \text{Wert Zugänge}}{\text{Menge Anfangsbestand} + \text{Menge Zugänge}}$ | geprüft | 1 | – | RW-VL4 S. 21–25 |
| `rw.ac-vc` | Formel | Voll- vs. Teilkostenrechnung (Absorption vs. Variable Costing) | $G_{AC} - G_{VC} = \Delta\text{Vorrat (Stück)}\cdot\text{fixe Herstellungskosten pro Stück}$ | geprüft | 6 | – | RW-VL4 S. 26–30 |
| `rw.w.abschreibung` | Wissen | Abschreibungen: Wahl der Methode und Wirkung | Abschreibungen verteilen die Anschaffungskosten einer Sachanlage über die Nutzungsdauer. Die Methode verschiebt Aufwand zwischen den Perioden, ändert aber nicht … | geprüft | 8 | – | RW-VL4 S. 6, 9, 12; RW-D4 S. 1 |

## R4 Kostenbegriffe & Break-even (Rechnungswesen)

| ID | Art | Name | Darstellung / Kernaussage | Status | Aufgaben | Generator | Quellen |
|---|---|---|---|---|---|---|---|
| `rw.kostenbegriffe` | Wissen | Grundkosten, Anderskosten, Zusatzkosten, neutraler Aufwand | Grundkosten sind in beiden Welten gleich. Anderskosten stehen intern in anderer Höhe drin, Zusatzkosten nur intern. Neutraler Aufwand ist nur extern Aufwand, in … | geprüft | 4 | – | RW-VL5 S. 5, 10–12 |
| `rw.kostenarten` | Formel | Fixe vs. variable und Einzel- vs. Gemeinkosten | $K = k_v\cdot x + K_f\qquad\text{Einzelkosten: direkt zurechenbar}\;\;\text{Gemeinkosten: über Schlüssel}$ | geprüft | 2 | – | RW-VL5 S. 17–25 |
| `rw.operatives-ergebnis` | Formel | Operatives Ergebnis (lineare Kosten- und Umsatzverläufe) | $\text{Op. Ergebnis} = (p - k_v)\cdot x - K_f$ | geprüft | 4 | ja | RW-VL5 S. 20–21; KLAUSUR-BSP S. 15 |
| `rw.break-even` | Formel | Break-even-Menge | $x_{BE} = \frac{K_f}{p - k_v}$ | geprüft | 4 | ja | RW-VL5 S. 20–21 |
| `rw.kalk-annuitaet` | Formel | Kalkulatorische Kosten: Annuitätenabschreibung | $C = \frac{BW - RW}{A} + r\cdot RW,\qquad A = \frac{(1+r)^T - 1}{r\,(1+r)^T}$ | geprüft | 1 | ja | RW-VL5 S. 5–6 |
| `rw.kalk-wiederbeschaffung` | Formel | Zusätzliche Abschreibung für höhere Wiederbeschaffungskosten | $C_{zus} = \frac{EW}{A'},\qquad A' = \frac{(1+r)^T - 1}{r},\qquad EW = WBK - AK$ | geprüft – Laut Folie 7 entspricht EW zusammen mit historischer Abschreibung und Restwert den Wiederbeschaffungskosten (135.000 − 100.000 = 35.000 €). | 1 | – | RW-VL5 S. 7–9 |
| `rw.w.kostenklassifikation` | Wissen | Kosten klassifizieren: Kostenobjekt und Kostentreiber | Ob Kosten Einzel- oder Gemeinkosten sind, hängt vom Kostenobjekt ab (direkt zurechenbar oder nicht). Ob sie variabel oder fix sind, hängt vom Kostentreiber ab ( … | geprüft | 4 | – | RW-VL5 S. 27–29; RW-D5 S. 1; RW-VL7 S. 24–25; RW-D7 S. 1–2 |

## R5 Kostenstellenrechnung (Rechnungswesen)

| ID | Art | Name | Darstellung / Kernaussage | Status | Aufgaben | Generator | Quellen |
|---|---|---|---|---|---|---|---|
| `rw.anbau` | Formel | Anbauverfahren | $q_i = \frac{\text{primäre Gemeinkosten der Vorkostenstelle } i}{\text{Leistungseinheiten an die Endkostenstellen}}$ | geprüft | 5 | ja | RW-VL6 S. 12–16, 28 |
| `rw.stufenleiter` | Formel | Stufenleiterverfahren | $q_i = \frac{K^{prim}_i + \sum_{j<i} q_j\,l_{ji}}{\text{Leistung an Endkostenstellen} + \text{an nachfolgende Vorkostenstellen}}$ | geprüft – Die offizielle Klausurlösung rechnet für die Kantine mit dem gerundeten Transportpreis 1,6938 und erhält 14,6334; mit ungerundetem Wert ergibt sich 14,6333 (siehe docs/content-issues.md). Die App akzeptiert beide. | 5 | – | RW-VL6 S. 18–21, 27; KLAUSUR-BSP S. 15–16 |
| `rw.gleichungsverfahren` | Formel | Gleichungsverfahren | $K^{prim}_i + \sum_{j\ne i} q_j\,l_{ji} = q_i\cdot L_i\quad\Leftrightarrow\quad A\,q = b,\; q = A^{-1}b$ | geprüft | 5 | – | RW-VL6 S. 22–26 |
| `rw.w.leistungsverrechnung` | Wissen | Innerbetriebliche Leistungsverrechnung verstehen | Die Kosten der Vorkostenstellen werden auf die Endkostenstellen verteilt (Sekundärkostenverrechnung). Anbau-, Stufenleiter- und Gleichungsverfahren unterscheide … | geprüft | 5 | – | RW-VL6 S. 11–15, 29; RW-D6 S. 1 |

## R6 Kostenträgerrechnung (Rechnungswesen)

| ID | Art | Name | Darstellung / Kernaussage | Status | Aufgaben | Generator | Quellen |
|---|---|---|---|---|---|---|---|
| `rw.division` | Formel | Divisionskalkulation | $k = \frac{K_{gesamt}}{x}\qquad\text{zweistufig: } k = \frac{HK}{x_{Prod}} + \frac{VwVt}{x_{Abs}}$ | geprüft | 2 | ja | RW-VL7 S. 5–6; RW-T7L S. 3 |
| `rw.aequivalenz` | Formel | Äquivalenzziffernkalkulation | $k_{RE} = \frac{K}{\sum_i \text{ÄZ}_i\,x_i},\qquad k_i = \text{ÄZ}_i\cdot k_{RE}$ | geprüft | 3 | – | RW-VL7 S. 7–8; RW-T7L S. 4 |
| `rw.zuschlagssatz` | Formel | Gemeinkostenzuschlagssatz | $\text{Zuschlagssatz} = \frac{\text{Gemeinkosten der Kostenstelle}}{\text{zugehörige Bezugsgröße (Einzelkosten bzw. Herstellkosten)}}$ | geprüft | 1 | – | RW-VL7 S. 9–11 |
| `rw.zuschlagskalkulation` | Formel | Kalkulationsschema der Zuschlagskalkulation | $\underbrace{MEK + MGK}_{\text{Materialkosten}} + \underbrace{FEK + FGK}_{\text{Fertigungskosten}} = HK;\quad SK = HK + VwGK + VtGK$ | geprüft | 5 | – | RW-VL7 S. 9–12; RW-T7L S. 5–7 |
| `rw.maschinenstundensatz` | Formel | Maschinenstundensatz (und Lohnstundensatz) | $MSS = \frac{\text{maschinenabhängige Gemeinkosten}}{\text{Maschinenlaufzeit}}\qquad FK = FEK + MSS\cdot t_{Masch} + z_{Rest}\cdot FEK$ | geprüft | 2 | ja | RW-VL7 S. 13–18; RW-T7L S. 8–9 |
| `rw.w.kalkulationsgrenzen` | Wissen | Grenzen der Kalkulation | Berechnete Kosten je Produkt sind nur eine Annäherung: Gemeinkosten werden mit Verteilungsschlüsseln auf Kostenstellen, von Vor- auf Endkostenstellen und weiter … | geprüft | 8 | – | RW-VL6 S. 8, 30–31; RW-D6 S. 1–2; RW-VL7 S. 9, 17, 18, 21; RW-D7 S. 1 |

## J1 Grundlagen des Jahresabschlusses (Jahresabschluss & Bewertung)

| ID | Art | Name | Darstellung / Kernaussage | Status | Aufgaben | Generator | Quellen |
|---|---|---|---|---|---|---|---|
| `jb.w.inventar` | Wissen | Inventur, Inventar und Bilanz | Auf Grundlage der Inventur wird das Inventar aufgestellt: ein Verzeichnis aller Vermögensgegenstände und Schulden nach Menge und Wert zum Abschlussstichtag, in  … | geprüft | 4 | – | JB-K1 S. 8; JB-K1A S. 1 |
| `jb.w.adressaten` | Wissen | Adressaten und Qualität von Rechnungslegungsinformationen | Rechnungslegung informiert viele externe Adressaten – nicht nur Kapitalgeber. „Gute“, entscheidungsnützliche Information ist vor allem relevant und verlässlich; … | geprüft | 3 | – | JB-K1 S. 10; JB-K1A S. 1 |
| `jb.w.prinzipal-agent` | Wissen | Prinzipal-Agent-Problem der Rechnungslegung | Ersteller (Management) und Nutzer (Aktionäre) der Unternehmensrechnung sind getrennt. Das Management ist Agent, die Aktionäre sind Prinzipal; asymmetrische Info … | geprüft | 4 | – | JB-K1 S. 11; JB-K1A S. 1 |
| `jb.w.rechtsformen` | Wissen | Rechtsformen: Personen- vs. Kapitalgesellschaften | Der wesentliche Unterschied liegt in der Haftung: Gesellschafter von Personengesellschaften haften unbeschränkt mit Geschäfts- und Privatvermögen, bei Kapitalge … | geprüft | 4 | – | JB-K2 S. 5, 9; JB-K2A S. 1 |
| `jb.w.gob` | Wissen | GoB, Vorsichtsprinzip und Zusammenhang von Bilanz und GuV | Die Grundsätze ordnungsmäßiger Buchführung (GoB) sind im HGB bewusst nicht abschließend definiert und helfen bei praktischen Zweifelsfragen. Deutsche GoB werden … | geprüft | 5 | – | JB-K2 S. 14, 15, 23, 25, 27; JB-K2A S. 1–2 |

## J2 Bilanzierung dem Grunde nach (Ansatz) (Jahresabschluss & Bewertung)

| ID | Art | Name | Darstellung / Kernaussage | Status | Aufgaben | Generator | Quellen |
|---|---|---|---|---|---|---|---|
| `jb.w.vermoegensgegenstand` | Wissen | Abstrakte Bilanzierungsfähigkeit | Ein Sachverhalt ist abstrakt bilanzierungsfähig, wenn er sich einer Kategorie zuordnen lässt: Vermögensgegenstand, Schulden, Eigenkapital oder Rechnungsabgrenzu … | geprüft | 4 | – | JB-K3 S. 5–7, 12; JB-K3A S. 1 |
| `jb.w.ansatzvorschriften` | Wissen | Ansatzpflichten, -wahlrechte und -verbote | Die Ansatzvorschriften des HGB unterteilen sich in Ansatzpflichten, Ansatzwahlrechte und Ansatzverbote. Ein wichtiges Aktivierungswahlrecht betrifft selbst gesc … | geprüft | 3 | – | JB-K3 S. 15, 17, 45; JB-K3A S. 1–2 |
| `jb.w.rap` | Wissen | Rechnungsabgrenzungsposten (RAP) | Rechnungsabgrenzungsposten dienen der periodengerechten Erfolgsermittlung. Unter „RAP“ ausgewiesen werden nur transitorische Posten: Zahlung vor dem Stichtag, A … | geprüft | 3 | – | JB-K3 S. 13–14; JB-K3A S. 1 |
| `jb.w.rueckstellungen-hgb` | Wissen | Rückstellungen im HGB-Abschluss | Der Ansatz von Rückstellungen und die Angabe von Haftungsverhältnissen resultieren aus dem Prinzip der Vorsicht. Eine Rückstellung ist anzusetzen, wenn künftige … | geprüft | 3 | – | JB-K3 S. 31–34; JB-K3A S. 1 |
| `jb.w.kapitalmarkt` | Wissen | Kapitalmarktorientierte Kapitalgesellschaften | Eine Kapitalgesellschaft ist kapitalmarktorientiert (§264d HGB), wenn ihre Wertpapiere an einem organisierten Markt zum Handel zugelassen sind oder die Zulassun … | geprüft | 3 | – | JB-K3 S. 24; JB-K3A S. 1 |

## J3 Bewertung nach HGB (Jahresabschluss & Bewertung)

| ID | Art | Name | Darstellung / Kernaussage | Status | Aufgaben | Generator | Quellen |
|---|---|---|---|---|---|---|---|
| `jb.anschaffungskosten` | Formel | Anschaffungskosten nach §255 Abs. 1 HGB | $AK = \text{Anschaffungspreis} - \text{AK-Minderungen} + \text{Nebenkosten (einzeln zurechenbar)} + \text{nachträgliche AK}$ | geprüft | 3 | – | JB-K4 S. 18–21; JB-K4A1 S. 1 |
| `jb.herstellungskosten` | Formel | Herstellungskosten nach HGB (Wertunter- und -obergrenze) | $\underbrace{MEK + FEK + SEK_F + \text{Material-/Fertigungs-GK}}_{\text{Wertuntergrenze (Pflicht)}} + \underbrace{\text{Verwaltung} + \text{FK-Kosten}}_{\text{Wahlrecht}} = \text{Wertobergrenze}$ | geprüft | 2 | – | JB-K4 S. 22–28; JB-K4A1 S. 1 |
| `jb.niederstwert` | Wissen | Niederstwertprinzip und Wertaufholung | Am Stichtag wird der beizulegende Wert mit dem Buchwert verglichen; angesetzt wird im Regelfall der niedrigere. | geprüft | 3 | – | JB-K4 S. 45–55; JB-K4A2 S. 1 |
| `jb.verbrauchsfolge` | Formel | Verbrauchsfolgeverfahren (HGB) | $\text{Gesamte AK} = \text{Wert des Verbrauchs (GuV)} + \text{Wert des Endbestands (Bilanz)}$ | geprüft – Die Zugangsdaten stehen in einer Tabelle auf Folie 51, die nicht vollständig als Text extrahierbar war; die Zahlen stammen aus den offiziellen Antworten. | 1 | – | JB-K4 S. 49–52; JB-K4A2 S. 2 |
| `jb.w.stichtag` | Wissen | Wertaufhellung vs. wertbegründendes Ereignis | Erfährt man nach dem Abschlussstichtag (aber vor Aufstellung des Abschlusses) von Umständen, die am Stichtag schon bestanden, sind sie zu berücksichtigen (werta … | geprüft | 3 | – | JB-K4 S. 10; JB-K4A1 S. 1 |
| `jb.w.vorsicht-bewertung` | Wissen | Vorsichtsprinzip in der Bewertung | Im Bereich der Bewertung konkretisiert sich das Vorsichtsprinzip durch das Realisationsprinzip (→ AHK-Prinzip) und das Imparitätsprinzip (→ Niederstwertprinzip  … | geprüft | 4 | – | JB-K4 S. 12, 18, 23, 27; JB-K4A1 S. 1 |
| `jb.w.bilanzpolitik` | Wissen | Bilanzpolitik | Bilanzpolitik ist die bewusste Gestaltung des Jahresabschlusses im Rahmen der gesetzlichen Spielräume. Ihre grundlegenden Ziele sind die Beeinflussung der Infor … | geprüft | 3 | – | JB-K4 S. 41, 59, 63; JB-K4A2 S. 1–2 |

## J4 GuV nach HGB (Jahresabschluss & Bewertung)

| ID | Art | Name | Darstellung / Kernaussage | Status | Aufgaben | Generator | Quellen |
|---|---|---|---|---|---|---|---|
| `jb.gkv-ukv` | Wissen | Gesamtkostenverfahren vs. Umsatzkostenverfahren | GKV: Alle Aufwendungen der Periode nach Arten (Material, Personal, Abschreibungen), korrigiert um Bestandsveränderungen. UKV: Nur die Kosten der verkauften Leis … | geprüft | 8 | – | JB-K5 S. 11–18; RW-VL4 S. 28 |
| `jb.w.guv` | Wissen | Die GuV als Bewegungsrechnung | Die GuV ist ein Unterkonto des Eigenkapitals. Sie erklärt die erfolgswirksamen EK-Veränderungen, die nicht durch Transaktionen mit Kapitalgebern bedingt sind, u … | geprüft | 6 | – | JB-K5 S. 4, 6, 9, 10, 13; JB-K5A1 S. 1–2 |
| `jb.w.gewinnverwendung` | Wissen | Gewinnverwendung in der AG | Vom Jahresüberschuss einer AG müssen Rücklagen gebildet werden: 5 % des (korrigierten) Jahresüberschusses in die gesetzliche Rücklage, bis gesetzliche Rücklage  … | geprüft | 3 | – | JB-K5 S. 45; JB-K5A2 S. 3 |

## J5 Anhang und Lagebericht (Jahresabschluss & Bewertung)

| ID | Art | Name | Darstellung / Kernaussage | Status | Aufgaben | Generator | Quellen |
|---|---|---|---|---|---|---|---|
| `jb.w.anhang` | Wissen | Anhang und Anlagenspiegel | Der Anhang ist Pflichtbestandteil des erweiterten Jahresabschlusses von Kapitalgesellschaften. Er erläutert, ergänzt, entlastet und korrigiert Bilanz und GuV. D … | geprüft | 4 | – | JB-K6 S. 5, 9, 17–19; JB-K6A S. 1 |
| `jb.w.lagebericht` | Wissen | Lagebericht und Bilanzeid | Der Lagebericht ist nicht Bestandteil des Jahresabschlusses, sondern steht neben ihm und ergänzt ihn um Informationen über Stand und Entwicklung des Unternehmen … | geprüft | 5 | – | JB-K6 S. 21, 23, 31; JB-K6A S. 1–2 |

