# Inhaltliche Auffälligkeiten und offene Punkte

Hier steht alles, was beim Auswerten der Unterlagen unklar, widersprüchlich oder fehlerhaft war, und wie die App damit umgeht. Inhalte mit Status `ungeprüft` erscheinen nicht in bewerteten Simulationen. Aktuell hat keine Formel diesen Status. Die Punkte unten betreffen Abweichungen, die die App bewusst so behandelt.

## Fehler oder Abweichungen in den Unterlagen

| # | Fundstelle | Befund | Umgang in der App |
|---|---|---|---|
| 1 | Rechnungswesen VL 2+3, GuV-Beispiel (Umsatzkostenverfahren) | Die Umsatzsumme ist auf der Folie mit 494.505 € angegeben. Die Einzelposten ergeben nachgerechnet **495.505 €**, das Bruttoergebnis also 166.824,60 €. Gefunden durch den automatischen Nachrechen-Test. | Die App verwendet den nachgerechneten Wert und weist im Lösungsweg auf die Abweichung hin. |
| 2 | Tutorium 1 Finanzierung, Lösungen Folie 9 (Renten-Endwert) | Offizielles Ergebnis 18.462,7114. Exakt gerechnet ergibt sich 18.462,7113 (Rundung in der letzten Stelle). | Beide Werte gelten als richtig (Toleranz). Der Test erlaubt 1 Einheit in der letzten Stelle. |
| 3 | Beispielklausur 2.3 (Stufenleiterverfahren, Kantine) | Die offizielle Lösung rechnet mit dem gerundeten Transport-Verrechnungspreis 1,6938 und erhält 14,6334. Ungerundet ergibt sich 14,6333. | Beide Werte werden akzeptiert, mit Hinweis. |
| 4 | JB Kapitel 4, Folie 51 (Zugangsbewertung) | Die Tabelle ließ sich nicht vollständig als Text auslesen. | Die Zahlen stammen aus „Antworten Kapitel 4“. Das ist an der Formel vermerkt. |

## Unklare Klausurrelevanz

| # | Inhalt | Befund |
|---|---|---|
| 5 | Kapitalwertrate | Steht in der Beispielklausur (1.1.3), aber nicht auf den Vorlesungsfolien SS 2026. |
| 6 | Dividend Discount Model | Die Beispielklausur (1.4) stammt aus einem älteren Jahrgang. Die Folien SS 2026 enthalten die zugrunde liegende wachsende ewige Rente, aber keinen eigenen DDM-Abschnitt. |
| 7 | Renten-Endwert $C\cdot\frac{(1+r)^T-1}{r}$ | Steht so nur in den Tutoriumslösungen, nicht auf den Folien. |

Diese Inhalte bleiben in der App, sind aber an der Formel gekennzeichnet. Am besten im Tutorium nachfragen.

## Annahmen der App (keine Angaben in den Unterlagen)

- **Bearbeitungszeit der Beispielklausur:** Das Dokument nennt keine. Die App schlägt 90 Minuten vor (1 Minute pro Punkt) und kennzeichnet das als Vorschlag.
- **Punkte für Teilaufgaben 2.3a–e:** In der Klausur stehen nur 10 Punkte für 2.3 insgesamt. Die Aufteilung 2/3/1/2/2 ist eine Annahme der App und wird in der Auswertung als „geschätzt“ markiert.
- **2.1b–d** (3 + 4 + 3 = 10 Punkte) sind in der App eine Aufgabe.
- **Abgeleitete Formeln** (Status `abgeleitet`): Umstellungen und geschlossene Formen, die nicht wörtlich auf den Folien stehen. Zum Beispiel die geschlossene Form des Barwerts einer endlichen Rente und die IZF-Lösung für zwei Perioden. Sie sind mathematisch hergeleitet und numerisch gegen die Folien bzw. Lösungen getestet.
- **App-Übungen** (`origin: 'app'`) und **generierte Varianten** sind als solche markiert. Sie sind keine Originalaufgaben.

## Nicht automatisch bewertbar

Offene Erklär- und Begründungsfragen (Typ `selfcheck`) werden nach dem Vergleich mit der Musterlösung selbst bewertet (richtig / teilweise / falsch). In der Klausur-Arena geschieht das nach der Abgabe, bevor die Punkte berechnet werden.

## Wissensfragen: Herkunft der Lösungen

- In den „Diskussionsfragen und Antworten“ (Rechnungswesen) ist die richtige Auswahlantwort nur durch **Fettdruck** markiert. Die App liest das maschinell über die Schriftart aus (pdfplumber) und hat es stichprobenartig an den Seitenbildern geprüft. Die eigentliche Frage steht jeweils auf der genannten Vorlesungsfolie.
- VL 6, Folie 31: Beim Verkaufspreis von 18.200 € ist offiziell „Ja, gewinnbringend“ markiert, bei 15.900 € „unklar“. Die Erklärung im Antwortdokument bezieht sich auf den knappen Fall. Die App übernimmt beides so.
- JB Kapitel 2, F27 Frage 1 („Welche Finanzberichte enthält der JA zwingend?“): Die offizielle Antwort lautet „Bilanz und GuV“, obwohl Kapitalgesellschaften zusätzlich einen Anhang erstellen müssen (Kapitel 6). Diese Teilfrage wurde deshalb nicht als Aufgabe übernommen.
- Richtig/Falsch-Begründungen für JB Kapitel 5, F47 stammen aus den Folien desselben Kapitels (GuV-Schema, Anmerkungen zu Steuern). Das offizielle Antwortdokument nennt nur „R-R-R-F-F-F-R“.

## Behobene Programmfehler

- Mehrschrittige Aufgaben (Typ „steps“, z. B. Beispielklausur 1.5) ließen sich nach dem ersten Schritt nicht weiter prüfen: Es wurde immer wieder Schritt 1 ausgewertet. Behoben, mit Regressionstest (`src/test/app.test.tsx`).
