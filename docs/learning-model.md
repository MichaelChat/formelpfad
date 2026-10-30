# Lernmodell: Beherrschung, Wiederholung, XP

Der gesamte Code liegt in `src/lib/` und ist in `src/lib/logic.test.ts` getestet.

## Kompetenzdimensionen (mastery.ts)

Pro Formel werden sieben Fähigkeiten getrennt verfolgt: *erkennen, abrufen, auswählen, einsetzen, umstellen, interpretieren, anwenden*. Jede Fähigkeit hat einen Wert zwischen 0 und 1. Er wird als gleitender Mittelwert aktualisiert (α = 0,35). Eine richtige Antwort zählt umso weniger, je mehr Hinweise benutzt wurden: Faktor 1 / 0,7 / 0,5 / 0,35 bei 0 / 1 / 2 / 3 Hinweisen.

**„Beherrscht“** heißt: Mindestens min(3, Zahl der für diese Formel verfügbaren Fähigkeiten) Fähigkeiten stehen auf ≥ 0,8, darunter mindestens eine aktive (abrufen, einsetzen, umstellen oder anwenden). Wer eine Formel nur wiedererkennt, beherrscht sie noch nicht.

## Wiederholung (srs.ts)

Ein vereinfachtes SM-2-Verfahren pro Formel. Richtig: Das Intervall wächst (1 → 3 → Intervall × Faktor). Falsch: zurück auf 1 Tag, Faktor sinkt. Pro Tag zählt nur ein positiver Schritt je Formel. Wer dieselbe Formel fünfmal am Tag richtig rechnet, schiebt sie also nicht künstlich weit in die Zukunft.

## Erfahrungspunkte (gamification.ts)

| Ereignis | XP |
|---|---|
| Richtige Antwort | 10 / 15 / 20 je nach Schwierigkeit, −3 pro Hinweis (mindestens 3) |
| Dieselbe Aufgabe am selben Tag erneut | ×0,5, dann ×0,2, danach 0 (kein Farmen) |
| Fehler korrigiert (erste richtige Lösung nach einem Fehler, am selben Tag) | +5 |
| Lektion abgeschlossen | +20 (Wiederholung derselben Lektion: +5) |
| Boss-Challenge bestanden (≥ 70 %) | +50 (sonst +10) |
| Wiederholungsrunde | +10 (höchstens 3 pro Tag) |
| Klausursimulation | 0,6 × erreichte Prozent (einmal pro Tag, sonst +10) |

Level: Level n beginnt bei 25·(n−1)·(n+2) XP.

**Streak:** Ein Tag zählt, wenn an ihm mindestens eine Aufgabe richtig gelöst wurde. Gerechnet wird mit dem lokalen Datum, robust gegenüber der Sommerzeitumstellung.

## Speicherung (persistence.ts, cloud/)

- `localStorage`-Schlüssel `formelpfad:state:v1`, versioniertes JSON.
- Ist der Speicher beschädigt, wird er als `formelpfad:state:v1:defekt:<Zeitstempel>` gesichert und die App startet sauber neu. Es geht nichts verloren.
- Einstellungen → Export/Import als JSON-Datei. So lässt sich der Fortschritt auf ein anderes Gerät oder in einen anderen Browser mitnehmen.
- **Mit Anmeldung** (`src/lib/cloud/`): Der Lernstand liegt als JSON-Text im Firestore-Dokument `users/<uid>` und hat einen Revisionszähler. Geschrieben wird 1,5 s nach der letzten Änderung, beim Verlassen der Seite sofort. Die Cloud nimmt nur an, wenn ihre Revision noch der zuletzt gesehenen entspricht. Sonst hat ein anderes Gerät dazwischen gespeichert: Beide Stände werden per Drei-Wege-Merge zusammengeführt (Zähler: Cloud + eigene Änderungen seit dem letzten gemeinsamen Stand; Kompetenz und Wiederholungsplan: jüngere Antwort), dann wird erneut geschrieben.
- Damit ein Dokument unter der Firestore-Grenze von 1 MiB bleibt, behält die Cloud-Kopie nur die Statistiken der 300 neuesten zufallsgenerierten Varianten und kürzt bei Bedarf das älteste Antwortprotokoll. XP, Kompetenzen, Wiederholungsplan und Originalaufgaben bleiben vollständig.
