# Kursinventar

Ausgewertet wurden die 67 PDFs im Projekt „WiWi 1“ (Stand 28.10.2026). In der App hat jedes Dokument eine Kennung (`src/content/sources.ts`). Jede Formel und jede Originalaufgabe verweist darauf mit einer Seiten- bzw. Folienangabe.

## Als Quelle verwendet

| Bereich | Dokumente | Verwendung |
|---|---|---|
| Finanzierung, Vorlesungen | VL 1, VL 2+3, VL 4, VL 5, VL 6+7 (`FIN-VL…`) | Formeln, Definitionen, Annahmen, Folienbeispiele |
| Finanzierung, Tutorien | Tutorium 1–5, jeweils Aufgaben + Lösungen (`FIN-T1…T5L`) | Originalaufgaben mit offiziellen Ergebnissen (werden in Tests nachgerechnet) |
| Rechnungswesen, Vorlesungen | VL 1, VL 2+3, VL 4, VL 5, VL 6, VL 7 (`RW-VL…`) | Bilanz, GuV, Bewertung, Kostenrechnung, Kostenstellen und Kostenträger |
| Rechnungswesen, Tutorien | Tutorium 4, 5, 7 mit Lösungsfolien (`RW-T4`, `RW-T5(L)`, `RW-T7(L)`) | Originalaufgaben |
| Jahresabschluss & Bewertung | Kapitel 4 (aktualisiert), 5; Antworten Kapitel 4 Teil 1+2 (`JB-…`) | Bewertung, Zugangsbewertung, GuV-Verfahren |
| Klausur | Beispielklausur BWL FR (`KLAUSUR-BSP`, 16 Seiten, mit Lösung) | Klausur-Arena: Struktur, Punkte, Originalaufgaben |

`JB - Kapitel 2` und `Planung FR und JB 2026` sind in `sources.ts` registriert (`JB-K2`, `PLANUNG`). Bisher verweist aber kein Inhalt auf sie (siehe Statistik).

## Noch nicht als Quelle ausgewertet

Diese Dateien liegen im Projekt, aber kein Inhalt der App verweist bisher auf sie. Sie sind der naheliegende nächste Schritt (siehe „Inhalte ergänzen“ in der README):

- **JB – Kapitel 1, 2, 3, 6 und Syllabus**; **Antworten Kapitel 1, 2, 3, 5 (Teil 1+2), 6**: JB ist bisher nur mit Kapitel 4 und 5 vertreten.
- **Rechnungswesen Tutorium 1, 2, 3, 6** (Aufgaben und Lösungen/Lösungstabellen, inkl. „Elimination und Matrizen“).
- **Diskussionsfragen und Antworten VL 1–7**: eignen sich gut als Selbstkontroll-Aufgaben (Typ `selfcheck`).
- **Curraxit AG Beschreibung** (Fallstudie).
- **„beschriftet“-Versionen** der Finanzierungsfolien (VL 1, 2+3, 4, 6, 7): handschriftlich ergänzte Fassungen der unbeschrifteten Folien, die bereits verwendet werden. Sie können zusätzliche Rechenwege enthalten.

## Statistik (automatisch)

Mit `npm run docs` neu erzeugt.

<!-- STATS:START -->
- Kapitel: 14, Lektionen: 42, Formeln: 76, Aufgaben: 174, Klausuren: 1
- Aufgaben nach Herkunft: app 44, vorlesung 66, tutorium 35, klausur 29
- Aufgaben nach Typ: mc 56, formula 20, numeric 47, steps 41, match 7, selfcheck 3

| Kennung | Datei | Verweise im Inhalt |
|---|---|---|
| `FIN-VL1` | Finanzierung  Vorlesung 1 SS2026.pdf | 1 |
| `FIN-VL23` | Finanzierung  Vorlesung 23 SS2026.pdf | 38 |
| `FIN-VL4` | Finanzierung Vorlesung 4 SS2026.pdf | 9 |
| `FIN-VL5` | Finanzierung Vorlesung 5 SS2026.pdf | 10 |
| `FIN-VL67` | Finanzierung Vorlesung 67 SS2026.pdf | 25 |
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
| `RW-VL1` | Rechnungswesen VL 1 2026.pdf | 14 |
| `RW-VL23` | Rechnungswesen VL 2 und 3 2026.pdf | 17 |
| `RW-VL4` | Rechnungswesen VL 4 2026.pdf | 21 |
| `RW-VL5` | Rechnungswesen VL 5 2026.pdf | 13 |
| `RW-VL6` | Rechnungswesen VL 6 2026.pdf | 7 |
| `RW-VL7` | Rechnungswesen VL 7 2026.pdf | 10 |
| `RW-T4` | Tutorium 4 Rechnungswesen 2026 Aufgabenblatt.pdf | 6 |
| `RW-T5` | Tutorium 5 Rechnungswesen 2026 Aufgabenblatt.pdf | 3 |
| `RW-T5L` | Tutorium 5 Rechnungswesen 2026 Loesungsfolien.pdf | 2 |
| `RW-T7` | Tutorium 7 Rechnungswesen 2026 Aufgabenblatt.pdf | 0 |
| `RW-T7L` | Tutorium 7 Rechnungswesen 2026 Loesungsfolien.pdf | 9 |
| `JB-K2` | JB - Kapitel 2 - Grundlagen des Jahresabschlusses.pdf | 0 |
| `JB-K4` | JB - Kapitel 4 - Grundlagen der Bewertung - AKTUALISIERT.pdf | 12 |
| `JB-K4A1` | Antworten Kapitel 4 - Teil 1.pdf | 6 |
| `JB-K4A2` | Antworten Kapitel 4 - Teil 2.pdf | 7 |
| `JB-K5` | JB - Kapitel 5 - Gewinn- und Verlustrechnung.pdf | 4 |
| `KLAUSUR-BSP` | Beispiel Klausur BWL FR.pdf | 48 |
| `PLANUNG` | Planung FR und JB 2026.pdf | 0 |
<!-- STATS:END -->
