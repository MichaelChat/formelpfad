# Umsetzungsplan und Architektur

## Ziel

„Duolingo für WiWi-Formeln“: Die Formeln aus Finanzierung, Rechnungswesen und Jahresabschluss werden in kurzen Lektionen gelernt, verteilt wiederholt und in einer Klausursimulation geprüft. Alle Inhalte stammen nachweisbar aus den Kursunterlagen.

## Technik

- **Vite + React + TypeScript (strict)**, Tailwind CSS v4, KaTeX für die Formeln, Schriften selbst gehostet (offline-fähig, keine externen Requests).
- **HashRouter** und `base: './'`: Die App funktioniert auf GitHub Pages in jedem Unterpfad, ohne Server-Konfiguration.
- **Kein Backend.** Der Fortschritt liegt im `localStorage` des Browsers, mit Export und Import.

## Aufbau

```
src/content/   Inhalte (Kapitel, Formeln, Aufgaben, Klausur) – getrennt von der UI
  types.ts     Inhaltsmodell
  sources.ts   Quelldokumente
  data/*.ts    Inhalte je Fach
src/lib/       Logik ohne UI: Parser, Äquivalenz, Validierung, Generator, SRS, XP, Engine
src/state/     Store (React Context) + Persistenz
src/ui/        Bausteine: Formel- und Aufgabenkarten, Eingaben, Session-Player
src/pages/     Start, Lernpfad, Formelsammlung, Wiederholen, Klausur-Arena, Fortschritt, Einstellungen
e2e/           Playwright-Tests (mobil + Desktop)
scripts/       Doku-Generator
```

## Umgesetzte Bausteine

1. Inhaltsmodell mit Quellenpflicht und Status (`geprüft` / `abgeleitet` / `ungeprüft`).
2. Aufgabentypen: Multiple Choice (auch Mehrfachauswahl, Fehler finden, Lücke), Zuordnen, Formel eintippen (Äquivalenz an Zufallspunkten), Zahl, Schritt-für-Schritt, Selbstkontrolle. Dazu zufallsgenerierte Varianten.
3. Eingabeprüfung: Dezimalkomma und -punkt, Tausenderpunkte, Prozent, Vorzeichen, Toleranz, typische Fehlwerte mit Diagnose.
4. Drei Hinweisstufen, ausführliches Feedback mit Lösungsweg, Formel und Klausurtipp.
5. Lernpfad mit Lektionen und Boss-Challenges, Formelsammlung mit Detailansicht, Wiederholung, Schwächentraining.
6. Gamification: XP gegen Farmen geschützt, Level, Streak, Tagesziel, Erfolge, Tagesquests.
7. Klausur-Arena mit Originalstruktur.
8. Tests: Inhalt (offizielle Ergebnisse nachrechnen), Logik, Integration, E2E.

## Bekannte Grenzen und nächste Schritte

Siehe README, Abschnitt „Einschränkungen“, sowie `course-inventory.md` (noch nicht ausgewertete PDFs).
