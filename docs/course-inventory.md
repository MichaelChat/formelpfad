# Kursinventar

Ausgewertet wurden die 67 PDFs im Projekt „WiWi 1“ (Stand 28.10.2026). In der App hat jedes Dokument eine Kennung (`src/content/sources.ts`). Jede Formel und jede Originalaufgabe verweist darauf mit einer Seiten- bzw. Folienangabe.

## Als Quelle verwendet

| Bereich | Dokumente | Verwendung |
|---|---|---|
| Finanzierung, Vorlesungen | VL 1, VL 2+3, VL 4, VL 5, VL 6+7 (`FIN-VL…`) | Formeln, Definitionen, Annahmen, Folienbeispiele; Wissen: Grundbegriffe, Verfahrensvergleich, IPO, Ausschüttungspolitik |
| Finanzierung, Tutorien | Tutorium 1–5, jeweils Aufgaben + Lösungen (`FIN-T1…T5L`) | Originalaufgaben mit offiziellen Ergebnissen (werden in Tests nachgerechnet) |
| Rechnungswesen, Vorlesungen | VL 1, VL 2+3, VL 4, VL 5, VL 6, VL 7 (`RW-VL…`) | Bilanz, GuV, Bewertung, Kostenrechnung, Kostenstellen und Kostenträger |
| Rechnungswesen, Diskussionsfragen | Diskussionsfragen und Antworten VL 1–7 (`RW-D1…RW-D7`) | Wissensfragen mit offizieller Lösung (fett markierte Antwort, maschinell aus der Schriftart ausgelesen) |
| Rechnungswesen, Tutorien | Tutorium 4, 5, 7 mit Lösungsfolien (`RW-T4`, `RW-T5(L)`, `RW-T7(L)`) | Originalaufgaben |
| Jahresabschluss & Bewertung | Kapitel 1–6 (Folien), Antworten Kapitel 1, 2, 3, 4 (Teil 1+2), 5 (Teil 1+2), 6 (`JB-…`) | Bewertung, GuV-Verfahren; Wissen: Grundlagen, Ansatz, Bewertung, GuV, Anhang und Lagebericht |
| Klausur | Beispielklausur BWL FR (`KLAUSUR-BSP`, 16 Seiten, mit Lösung) | Klausur-Arena: Struktur, Punkte, Originalaufgaben |

`Planung FR und JB 2026` ist in `sources.ts` registriert (`PLANUNG`), aber kein Inhalt verweist darauf (siehe Statistik).

## Noch nicht als Quelle ausgewertet

- **Rechnungswesen Tutorium 1, 2, 3, 6** (Aufgaben und Lösungen/Lösungstabellen, inkl. „Elimination und Matrizen“).
- **Curraxit AG Beschreibung** (Fallstudie).
- **JB Syllabus** (organisatorisch).
- **„beschriftet“-Versionen** der Finanzierungsfolien (VL 1, 2+3, 4, 6, 7): handschriftlich ergänzte Fassungen der unbeschrifteten Folien, die bereits verwendet werden.
- Einzelne Antworten wurden bewusst nicht als Aufgabe übernommen, weil Tabellen beim Auslesen verloren gingen (z. B. JB Kapitel 3, F41 latente Steuern; Kapitel 4, F43–F47 Abschreibungsverläufe; Kapitel 5, F34–F36 GuV-Beispiele; Kapitel 6, F10 Anlagenspiegel).

## Statistik (automatisch)

Mit `npm run docs` neu erzeugt.

<!-- STATS:START -->
- Kapitel: 18, Lektionen: 58, Formeln: 104, Aufgaben: 322, Klausuren: 1
- Aufgaben nach Herkunft: app 69, vorlesung 185, tutorium 35, klausur 33
- Aufgaben nach Typ: mc 150, formula 20, numeric 48, steps 52, match 19, selfcheck 33

| Kennung | Datei | Verweise im Inhalt |
|---|---|---|
| `FIN-VL1` | Finanzierung  Vorlesung 1 SS2026.pdf | 11 |
| `FIN-VL23` | Finanzierung  Vorlesung 23 SS2026.pdf | 40 |
| `FIN-VL4` | Finanzierung Vorlesung 4 SS2026.pdf | 15 |
| `FIN-VL5` | Finanzierung Vorlesung 5 SS2026.pdf | 24 |
| `FIN-VL67` | Finanzierung Vorlesung 67 SS2026.pdf | 27 |
| `FIN-T1` | Tutorium 1 Finanzierung 2026 Aufgabenblatt.pdf | 5 |
| `FIN-T1L` | Tutorium 1 Finanzierung 2026 Lösungen.pdf | 16 |
| `FIN-T2` | Tutorium 2 Finanzierung 2026 Aufgabenblatt.pdf | 2 |
| `FIN-T2L` | Tutorium 2 Finanzierung 2026 Lösungen.pdf | 9 |
| `FIN-T3` | Tutorium 3 Finanzierung 2026 Aufgabenblatt.pdf | 1 |
| `FIN-T3L` | Tutorium 3 Finanzierung 2026 Lösungen.pdf | 6 |
| `FIN-T4` | Tutorium 4 Finanzierung 2026 Aufgabenblatt.pdf | 0 |
| `FIN-T4L` | Tutorium 4 Finanzierung 2026 Lösungen.pdf | 9 |
| `FIN-T5` | Tutorium 5 Finanzierung 2026 Aufgabenblatt.pdf | 2 |
| `FIN-T5L` | Tutorium 5 Finanzierung 2026 Lösungen.pdf | 8 |
| `RW-VL1` | Rechnungswesen VL 1 2026.pdf | 20 |
| `RW-VL23` | Rechnungswesen VL 2 und 3 2026.pdf | 33 |
| `RW-VL4` | Rechnungswesen VL 4 2026.pdf | 36 |
| `RW-VL5` | Rechnungswesen VL 5 2026.pdf | 18 |
| `RW-VL6` | Rechnungswesen VL 6 2026.pdf | 19 |
| `RW-VL7` | Rechnungswesen VL 7 2026.pdf | 17 |
| `RW-T4` | Tutorium 4 Rechnungswesen 2026 Aufgabenblatt.pdf | 6 |
| `RW-T5` | Tutorium 5 Rechnungswesen 2026 Aufgabenblatt.pdf | 3 |
| `RW-T5L` | Tutorium 5 Rechnungswesen 2026 Loesungsfolien.pdf | 2 |
| `RW-T7` | Tutorium 7 Rechnungswesen 2026 Aufgabenblatt.pdf | 0 |
| `RW-T7L` | Tutorium 7 Rechnungswesen 2026 Loesungsfolien.pdf | 9 |
| `JB-K2` | JB - Kapitel 2 - Grundlagen des Jahresabschlusses.pdf | 13 |
| `JB-K4` | JB - Kapitel 4 - Grundlagen der Bewertung - AKTUALISIERT.pdf | 26 |
| `JB-K4A1` | Antworten Kapitel 4 - Teil 1.pdf | 15 |
| `JB-K4A2` | Antworten Kapitel 4 - Teil 2.pdf | 12 |
| `JB-K5` | JB - Kapitel 5 - Gewinn- und Verlustrechnung.pdf | 18 |
| `RW-D1` | Diskussionsfragen und Antworten VL 1.pdf | 5 |
| `RW-D2` | Diskussionsfragen und Antworten VL 2.pdf | 11 |
| `RW-D3` | Diskussionsfragen und Antworten VL 3.pdf | 9 |
| `RW-D4` | Diskussionsfragen und Antworten VL 4.pdf | 14 |
| `RW-D5` | Diskussionsfragen und Antworten VL 5.pdf | 3 |
| `RW-D6` | Diskussionsfragen und Antworten VL 6.pdf | 12 |
| `RW-D7` | Diskussionsfragen und Antworten VL 7.pdf | 7 |
| `JB-K1` | JB - Kapitel 1 - Einführung und institutionelle Grundlagen.pdf | 15 |
| `JB-K3` | JB - Kapitel 3 - Grundlagen Bilanzierung.pdf | 21 |
| `JB-K6` | JB - Kapitel 6 - Ergänzende Instrumente.pdf | 12 |
| `JB-K1A` | Antworten Kapitel 1.pdf | 14 |
| `JB-K2A` | Antworten Kapitel 2.pdf | 12 |
| `JB-K3A` | Antworten Kapitel 3.pdf | 20 |
| `JB-K5A1` | Antworten Kapitel 5 - Teil 1.pdf | 5 |
| `JB-K5A2` | Antworten Kapitel 5 - Teil 2.pdf | 10 |
| `JB-K6A` | Antworten Kapitel 6.pdf | 12 |
| `KLAUSUR-BSP` | Beispiel Klausur BWL FR.pdf | 53 |
| `PLANUNG` | Planung FR und JB 2026.pdf | 0 |
<!-- STATS:END -->
