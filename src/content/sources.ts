/**
 * Verzeichnis der ausgewerteten Quelldokumente (siehe docs/course-inventory.md).
 * Seitenangaben beziehen sich auf die PDF-Seite; bei den Folien entspricht sie der Foliennummer.
 */
export interface SourceDoc {
  id: string
  title: string
  file: string
  kind: 'vorlesung' | 'tutorium-aufgaben' | 'tutorium-loesung' | 'klausur' | 'antworten' | 'organisation' | 'fallstudie'
}

const list: SourceDoc[] = [
  { id: 'FIN-VL1', title: 'Finanzierung, Vorlesung 1 – Einführung', file: 'Finanzierung  Vorlesung 1 SS2026.pdf', kind: 'vorlesung' },
  { id: 'FIN-VL23', title: 'Finanzierung, Vorlesung 2 und 3 – Bewertung von Zahlungsströmen, Anleihen', file: 'Finanzierung  Vorlesung 23 SS2026.pdf', kind: 'vorlesung' },
  { id: 'FIN-VL4', title: 'Finanzierung, Vorlesung 4 – Methoden der Investitionsentscheidung', file: 'Finanzierung Vorlesung 4 SS2026.pdf', kind: 'vorlesung' },
  { id: 'FIN-VL5', title: 'Finanzierung, Vorlesung 5 – Eigenkapitalfinanzierung, Aktien', file: 'Finanzierung Vorlesung 5 SS2026.pdf', kind: 'vorlesung' },
  { id: 'FIN-VL67', title: 'Finanzierung, Vorlesung 6 und 7 – Portfoliotheorie', file: 'Finanzierung Vorlesung 67 SS2026.pdf', kind: 'vorlesung' },
  { id: 'FIN-T1', title: 'Tutorium 1 Finanzierung – Aufgaben', file: 'Tutorium 1 Finanzierung 2026 Aufgabenblatt.pdf', kind: 'tutorium-aufgaben' },
  { id: 'FIN-T1L', title: 'Tutorium 1 Finanzierung – Lösungen', file: 'Tutorium 1 Finanzierung 2026 Lösungen.pdf', kind: 'tutorium-loesung' },
  { id: 'FIN-T2', title: 'Tutorium 2 Finanzierung – Aufgaben', file: 'Tutorium 2 Finanzierung 2026 Aufgabenblatt.pdf', kind: 'tutorium-aufgaben' },
  { id: 'FIN-T2L', title: 'Tutorium 2 Finanzierung – Lösungen', file: 'Tutorium 2 Finanzierung 2026 Lösungen.pdf', kind: 'tutorium-loesung' },
  { id: 'FIN-T3', title: 'Tutorium 3 Finanzierung – Aufgaben', file: 'Tutorium 3 Finanzierung 2026 Aufgabenblatt.pdf', kind: 'tutorium-aufgaben' },
  { id: 'FIN-T3L', title: 'Tutorium 3 Finanzierung – Lösungen', file: 'Tutorium 3 Finanzierung 2026 Lösungen.pdf', kind: 'tutorium-loesung' },
  { id: 'FIN-T4', title: 'Tutorium 4 Finanzierung – Aufgaben', file: 'Tutorium 4 Finanzierung 2026 Aufgabenblatt.pdf', kind: 'tutorium-aufgaben' },
  { id: 'FIN-T4L', title: 'Tutorium 4 Finanzierung – Lösungen', file: 'Tutorium 4 Finanzierung 2026 Lösungen.pdf', kind: 'tutorium-loesung' },
  { id: 'FIN-T5', title: 'Tutorium 5 Finanzierung – Aufgaben', file: 'Tutorium 5 Finanzierung 2026 Aufgabenblatt.pdf', kind: 'tutorium-aufgaben' },
  { id: 'FIN-T5L', title: 'Tutorium 5 Finanzierung – Lösungen', file: 'Tutorium 5 Finanzierung 2026 Lösungen.pdf', kind: 'tutorium-loesung' },
  { id: 'RW-VL1', title: 'Rechnungswesen, Vorlesung 1 – Grundlagen des externen Rechnungswesens', file: 'Rechnungswesen VL 1 2026.pdf', kind: 'vorlesung' },
  { id: 'RW-VL23', title: 'Rechnungswesen, Vorlesung 2 und 3 – Bilanz und GuV', file: 'Rechnungswesen VL 2 und 3 2026.pdf', kind: 'vorlesung' },
  { id: 'RW-VL4', title: 'Rechnungswesen, Vorlesung 4 – Mehrdeutigkeit (Abschreibung, Vorräte, Herstellungskosten)', file: 'Rechnungswesen VL 4 2026.pdf', kind: 'vorlesung' },
  { id: 'RW-VL5', title: 'Rechnungswesen, Vorlesung 5 – Grundlagen des internen Rechnungswesens', file: 'Rechnungswesen VL 5 2026.pdf', kind: 'vorlesung' },
  { id: 'RW-VL6', title: 'Rechnungswesen, Vorlesung 6 – Kostenstellenrechnung', file: 'Rechnungswesen VL 6 2026.pdf', kind: 'vorlesung' },
  { id: 'RW-VL7', title: 'Rechnungswesen, Vorlesung 7 – Kostenträgerrechnung', file: 'Rechnungswesen VL 7 2026.pdf', kind: 'vorlesung' },
  { id: 'RW-T4', title: 'Tutorium 4 Rechnungswesen – Aufgaben', file: 'Tutorium 4 Rechnungswesen 2026 Aufgabenblatt.pdf', kind: 'tutorium-aufgaben' },
  { id: 'RW-T5', title: 'Tutorium 5 Rechnungswesen – Aufgaben', file: 'Tutorium 5 Rechnungswesen 2026 Aufgabenblatt.pdf', kind: 'tutorium-aufgaben' },
  { id: 'RW-T5L', title: 'Tutorium 5 Rechnungswesen – Lösungsfolien', file: 'Tutorium 5 Rechnungswesen 2026 Loesungsfolien.pdf', kind: 'tutorium-loesung' },
  { id: 'RW-T7', title: 'Tutorium 7 Rechnungswesen – Aufgaben', file: 'Tutorium 7 Rechnungswesen 2026 Aufgabenblatt.pdf', kind: 'tutorium-aufgaben' },
  { id: 'RW-T7L', title: 'Tutorium 7 Rechnungswesen – Lösungsfolien', file: 'Tutorium 7 Rechnungswesen 2026 Loesungsfolien.pdf', kind: 'tutorium-loesung' },
  { id: 'JB-K2', title: 'Jahresabschluss & Bewertung, Kapitel 2 – Grundlagen des Jahresabschlusses', file: 'JB - Kapitel 2 - Grundlagen des Jahresabschlusses.pdf', kind: 'vorlesung' },
  { id: 'JB-K4', title: 'Jahresabschluss & Bewertung, Kapitel 4 – Grundlagen der Bewertung (aktualisiert)', file: 'JB - Kapitel 4 - Grundlagen der Bewertung - AKTUALISIERT.pdf', kind: 'vorlesung' },
  { id: 'JB-K4A1', title: 'Antworten Kapitel 4, Teil 1', file: 'Antworten Kapitel 4 - Teil 1.pdf', kind: 'antworten' },
  { id: 'JB-K4A2', title: 'Antworten Kapitel 4, Teil 2', file: 'Antworten Kapitel 4 - Teil 2.pdf', kind: 'antworten' },
  { id: 'JB-K5', title: 'Jahresabschluss & Bewertung, Kapitel 5 – Gewinn- und Verlustrechnung', file: 'JB - Kapitel 5 - Gewinn- und Verlustrechnung.pdf', kind: 'vorlesung' },
  { id: 'RW-D1', title: 'Rechnungswesen – Diskussionsfragen und Antworten, Vorlesung 1', file: 'Diskussionsfragen und Antworten VL 1.pdf', kind: 'antworten' },
  { id: 'RW-D2', title: 'Rechnungswesen – Diskussionsfragen und Antworten, Vorlesung 2', file: 'Diskussionsfragen und Antworten VL 2.pdf', kind: 'antworten' },
  { id: 'RW-D3', title: 'Rechnungswesen – Diskussionsfragen und Antworten, Vorlesung 3', file: 'Diskussionsfragen und Antworten VL 3.pdf', kind: 'antworten' },
  { id: 'RW-D4', title: 'Rechnungswesen – Diskussionsfragen und Antworten, Vorlesung 4', file: 'Diskussionsfragen und Antworten VL 4.pdf', kind: 'antworten' },
  { id: 'RW-D5', title: 'Rechnungswesen – Diskussionsfragen und Antworten, Vorlesung 5', file: 'Diskussionsfragen und Antworten VL 5.pdf', kind: 'antworten' },
  { id: 'RW-D6', title: 'Rechnungswesen – Diskussionsfragen und Antworten, Vorlesung 6', file: 'Diskussionsfragen und Antworten VL 6.pdf', kind: 'antworten' },
  { id: 'RW-D7', title: 'Rechnungswesen – Diskussionsfragen und Antworten, Vorlesung 7', file: 'Diskussionsfragen und Antworten VL 7.pdf', kind: 'antworten' },
  { id: 'JB-K1', title: 'Jahresabschluss & Bewertung, Kapitel 1 – Einführung und institutionelle Grundlagen', file: 'JB - Kapitel 1 - Einführung und institutionelle Grundlagen.pdf', kind: 'vorlesung' },
  { id: 'JB-K3', title: 'Jahresabschluss & Bewertung, Kapitel 3 – Grundlagen Bilanzierung', file: 'JB - Kapitel 3 - Grundlagen Bilanzierung.pdf', kind: 'vorlesung' },
  { id: 'JB-K6', title: 'Jahresabschluss & Bewertung, Kapitel 6 – Ergänzende Instrumente', file: 'JB - Kapitel 6 - Ergänzende Instrumente.pdf', kind: 'vorlesung' },
  { id: 'JB-K1A', title: 'Antworten Kapitel 1', file: 'Antworten Kapitel 1.pdf', kind: 'antworten' },
  { id: 'JB-K2A', title: 'Antworten Kapitel 2', file: 'Antworten Kapitel 2.pdf', kind: 'antworten' },
  { id: 'JB-K3A', title: 'Antworten Kapitel 3', file: 'Antworten Kapitel 3.pdf', kind: 'antworten' },
  { id: 'JB-K5A1', title: 'Antworten Kapitel 5, Teil 1', file: 'Antworten Kapitel 5 - Teil 1.pdf', kind: 'antworten' },
  { id: 'JB-K5A2', title: 'Antworten Kapitel 5, Teil 2', file: 'Antworten Kapitel 5 - Teil 2.pdf', kind: 'antworten' },
  { id: 'JB-K6A', title: 'Antworten Kapitel 6', file: 'Antworten Kapitel 6.pdf', kind: 'antworten' },
  { id: 'KLAUSUR-BSP', title: 'Beispiel-Klausur BWL: Finanzwirtschaft und Rechnungswesen (mit Lösung)', file: 'Beispiel Klausur BWL FR.pdf', kind: 'klausur' },
  // ---------------------------------------------------------------- Numerische Mathematik (Dr. Daniel Weiß, SoSe 2026)
  { id: 'NUM-SKRIPT', title: 'Numerische Mathematik für Inf./Ing. – Skript (Stand 9.7.2026)', file: 'Skript_9_7_2026.pdf', kind: 'vorlesung' },
  { id: 'NUM-VL02', title: 'Numerik, Vorlesung 2 – Kapitel 2: LR-Zerlegung', file: 'VL02_Kapitel2_LR.pdf', kind: 'vorlesung' },
  { id: 'NUM-VL03', title: 'Numerik, Vorlesung 3 – Kapitel 1: Gleitpunktrechnung, Kondition, Stabilität', file: 'VL03_Kapitel1.pdf', kind: 'vorlesung' },
  { id: 'NUM-VL04', title: 'Numerik, Vorlesung 4 – Kapitel 2: Cholesky- und QR-Zerlegung', file: 'VL04_Kapitel2_LL_QR.pdf', kind: 'vorlesung' },
  { id: 'NUM-VL05', title: 'Numerik, Vorlesung 5 – Kapitel 2: Kondition linearer Gleichungssysteme', file: 'VL05_Kapitel2_Kondition.pdf', kind: 'vorlesung' },
  { id: 'NUM-VL06', title: 'Numerik, Vorlesung 6 – Kapitel 2: Lineare Ausgleichsrechnung', file: 'VL06_Kapitel2_LinAusgleichsrechung.pdf', kind: 'vorlesung' },
  { id: 'NUM-UB02', title: 'Numerik, Übungsblatt 2 mit Lösung', file: 'UB02_NumaInfIng.pdf', kind: 'tutorium-loesung' },
  { id: 'NUM-UB03', title: 'Numerik, Übungsblatt 3 mit Lösung', file: 'UB03_NumaInfIng.pdf', kind: 'tutorium-loesung' },
  { id: 'NUM-UB04', title: 'Numerik, Übungsblatt 4 mit Lösung', file: 'UB04_NumaInfIng.pdf', kind: 'tutorium-loesung' },
  { id: 'NUM-UB05', title: 'Numerik, Übungsblatt 5 mit Lösung', file: 'UB05_NumaInfIng.pdf', kind: 'tutorium-loesung' },
  { id: 'NUM-VL01', title: 'Numerik, Vorlesung 1 – Kapitel 3: Iterative Verfahren für nichtlineare Gleichungssysteme', file: 'VL01_Kapitel3_IterativeVerfahren_NLGS.pdf', kind: 'vorlesung' },
  { id: 'NUM-VL07', title: 'Numerik, Vorlesung 7 – Kapitel 4: Polynominterpolation', file: 'VL07_Kapitel4_Polynominterpolation.pdf', kind: 'vorlesung' },
  { id: 'NUM-VL08', title: 'Numerik, Vorlesung 8 – Kapitel 4: Tschebyscheff-Interpolation', file: 'VL08_Kapitel4_Tschebyscheffinterpolation.pdf', kind: 'vorlesung' },
  { id: 'NUM-VL09', title: 'Numerik, Vorlesung 9 – Kapitel 4: Spline-Interpolation', file: 'VL09_Kapitel4_Splineinterpolation.pdf', kind: 'vorlesung' },
  { id: 'NUM-VL10', title: 'Numerik, Vorlesung 10 – Kapitel 5: Quadraturformeln', file: 'VL10_Kapitel5_Quadraturformeln.pdf', kind: 'vorlesung' },
  { id: 'NUM-VL11', title: 'Numerik, Vorlesung 11 – Kapitel 5: Quadraturformeln hoher Ordnung, Fehler', file: 'VL11_Kapitel5_QF_hoherOrdnung_Fehler.pdf', kind: 'vorlesung' },
  { id: 'NUM-UB01', title: 'Numerik, Übungsblatt 1 mit Lösung', file: 'UB01_NumaInfIng.pdf', kind: 'tutorium-loesung' },
  { id: 'NUM-UB06', title: 'Numerik, Übungsblatt 6 mit Lösung', file: 'UB06_NumaInfIng.pdf', kind: 'tutorium-loesung' },
  { id: 'NUM-K-SS26', title: 'Numerik, Klausur SoSe 2026 – Lösungsskizze', file: 'Loesungsskizze_Klausur_ss26.pdf', kind: 'klausur' },
  { id: 'NUM-K-SS24', title: 'Numerik, Klausur SoSe 2024 (Aufgaben und Lösungsskizzen)', file: 'klausur_numii_ss24_Aufgaben.pdf', kind: 'klausur' },
  { id: 'NUM-K-SS22', title: 'Numerik, Klausur SoSe 2022 (Aufgaben und Lösungsskizze)', file: 'klausur_numii_ss22_Aufgaben.pdf', kind: 'klausur' },
  { id: 'NUM-K-SS20', title: 'Numerik, Klausur SoSe 2020 (Aufgaben und Lösungsskizze)', file: 'klausur_numii_ss20_Aufgaben.pdf', kind: 'klausur' },
  { id: 'NUM-K-SS19', title: 'Numerik, Klausur SoSe 2019 (nur Aufgaben)', file: 'klausur_numii_ss19_Aufgaben.pdf', kind: 'klausur' },
  { id: 'NUM-K-SS17', title: 'Numerik, Klausur SoSe 2017 (Aufgaben und Lösungen)', file: 'klausur_numii_ss17_Aufgaben.pdf', kind: 'klausur' },
  { id: 'NUM-K-WS2425', title: 'Numerik, Klausur WiSe 2024/25 (Aufgaben und Lösungsskizzen)', file: 'klausur_numii_ws2425_Aufgaben.pdf', kind: 'klausur' },
  { id: 'NUM-K-WS2223', title: 'Numerik, Klausur WiSe 2022/23 (Aufgaben und Lösungsskizzen)', file: 'klausur_numii_ws2223_Aufgaben.pdf', kind: 'klausur' },
  { id: 'NUM-K-WS2021', title: 'Numerik, Klausur WiSe 2020/21 (Aufgaben und Lösungsskizze)', file: 'klausur_numii_ws2021_Aufgaben.pdf', kind: 'klausur' },
  { id: 'NUM-K-WS1920', title: 'Numerik, Klausur WiSe 2019/20 (Aufgaben und Lösungsskizze)', file: 'klausur_numii_ws1920_Aufgaben.pdf', kind: 'klausur' },
  { id: 'NUM-K-WS1718', title: 'Numerik, Klausur WiSe 2017/18 (Aufgaben und Lösungen)', file: 'klausur_numii_ws1718_Aufgaben.pdf', kind: 'klausur' },
  { id: 'PLANUNG', title: 'Planung des Moduls „Finanzierung und Rechnungswesen“ SoSe 2026', file: 'Planung FR und JB 2026.pdf', kind: 'organisation' },
]

export const SOURCES: Record<string, SourceDoc> = Object.fromEntries(list.map((d) => [d.id, d]))

export function sourceLabel(id: string): string {
  return SOURCES[id]?.title ?? id
}
