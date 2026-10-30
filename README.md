# Formelpfad – Formeln lernen wie Vokabeln

Lern-App für **Finanzierung, Rechnungswesen und Jahresabschluss & Bewertung** (WiWi 1, SoSe 2026). Kurze Lektionen, Aufgaben mit sofortigem Feedback, verteilte Wiederholung und eine Klausursimulation nach der Beispielklausur. Alle Formeln und Originalaufgaben verweisen auf Dokument und Folie.

Die Seite ist rein statisch und läuft auf GitHub Pages. Es gibt zwei Betriebsarten:

- **Mit Anmeldung (empfohlen):** Die Lernenden melden sich mit Google an, ihr Fortschritt liegt in Firebase (Google) und ist auf allen Geräten derselbe. Einrichtung: [`docs/firebase-setup.md`](docs/firebase-setup.md).
- **Ohne Anmeldung:** Fehlt die Firebase-Konfiguration, speichert die App nur im Browser (`localStorage`). So laufen auch die Tests.

## Voraussetzungen

- **Node.js 22.22 oder neuer** (`node -v` zeigt die Version) und npm (kommt mit Node). Mit Node 20 startet die App nicht. Einfachste Installation: [nvm](https://github.com/nvm-sh/nvm), dann im Projektordner `nvm install` (liest die Version aus `.nvmrc`).
- Für die E2E-Tests zusätzlich ein Chromium von Playwright (Installation siehe unten).

## Installation und Entwicklung

```bash
npm install        # lädt alle Abhängigkeiten nach node_modules/ (einmalig bzw. nach Änderungen an package.json)
npm run dev        # startet einen lokalen Entwicklungsserver mit Live-Reload, Adresse steht im Terminal
```

## Build

```bash
npm run build      # prüft zuerst die Typen (tsc), baut dann die fertige Seite nach dist/
npm run preview    # zeigt den Build lokal an, genau so wie er später online läuft
```

`dist/` enthält nur statische Dateien. Sie lassen sich auf jedem Webspace ablegen, weil die App relative Pfade und Hash-Routing (`#/formeln`) benutzt.

## Tests

```bash
npm test           # Unit- und Integrationstests (Vitest): Inhalte, Logik, App-Abläufe
npm run lint       # ESLint
npm run typecheck  # TypeScript ohne Build

npx playwright install chromium   # einmalig: Browser für die E2E-Tests
npm run test:e2e                  # Playwright, jeweils auf Smartphone- und Desktop-Größe
```

Der Inhaltstest rechnet unter anderem alle offiziellen Ergebnisse aus Tutorien und Klausur nach. Hat eine Folie einen Rechenfehler, schlägt der Test fehl. So wurde zum Beispiel der Fehler auf der GuV-Folie gefunden (`docs/content-issues.md`).

## Auf GitHub Pages veröffentlichen

Der Workflow `.github/workflows/deploy.yml` führt bei jedem Push auf `main` Lint, Typecheck, alle Tests und den Build aus. Nur wenn alles grün ist, veröffentlicht er die Seite.

1. **Repository anlegen** auf github.com (Button „New“), z. B. `formelpfad`. Kein README anlegen lassen, das Projekt hat schon eins.
   *Zur Sichtbarkeit siehe den Hinweis zum Urheberrecht unten.*
2. **Code hochladen**: im Projektordner im Terminal:
   ```bash
   git init                 # macht den Ordner zu einem Git-Repository
   git add .                # merkt alle Dateien vor (.gitignore schließt node_modules, dist usw. aus)
   git commit -m "Formelpfad"
   git branch -M main       # der Workflow reagiert auf den Branch "main"
   git remote add origin https://github.com/DEIN-NAME/formelpfad.git
   git push -u origin main
   ```
3. **Pages einschalten**: im Repository *Settings → Pages → Build and deployment → Source:* **„GitHub Actions“** wählen. Damit veröffentlicht GitHub das Ergebnis des Workflows statt einfach einen Branch.
4. **Anmeldung einrichten** (optional, aber empfohlen): Firebase anlegen und die vier Werte als Repository-Variablen hinterlegen, siehe [`docs/firebase-setup.md`](docs/firebase-setup.md). Ohne diesen Schritt läuft die Seite ohne Anmeldung.
5. Unter **Actions** den Lauf abwarten (ca. 3–5 Minuten). Die Adresse steht danach in *Settings → Pages*, typischerweise `https://DEIN-NAME.github.io/formelpfad/`.

Jeder weitere `git push` aktualisiert die Seite automatisch.

### Hinweis zum Urheberrecht

Die PDFs selbst gehören **nicht** ins Repository (`.gitignore` schließt `materials/*.pdf` aus). Die App enthält aber Formeln, kurze Aufgabentexte und Ergebnisse aus den Unterlagen des Lehrstuhls. Eine öffentlich erreichbare Seite ist eine Veröffentlichung. Für eine Nachhilfe-Gruppe ist es sicherer, vorher beim Lehrstuhl nachzufragen oder das Repository privat zu halten. GitHub Pages aus privaten Repositories braucht allerdings einen kostenpflichtigen Plan (z. B. GitHub Pro). Alternative: `dist/` lokal bauen und nur gezielt weitergeben.

## Speicher und Daten

**Mit Anmeldung:**
- Ein Firestore-Dokument pro Person (`users/<id>`), lesbar nur für diese Person (`firestore.rules`).
- Der Browser hält zusätzlich einen Zwischenspeicher. Die App startet dadurch sofort und funktioniert auch offline, Änderungen werden nachgereicht.
- Lernt jemand gleichzeitig auf zwei Geräten, werden die Stände zusammengeführt, ohne XP doppelt zu zählen (`src/lib/cloud/merge.ts`).
- Ein Fortschritt aus der Zeit ohne Anmeldung wird bei der ersten Anmeldung übernommen.
- Abmelden löscht den Zwischenspeicher im Browser. *Einstellungen → Konto löschen* entfernt Lernstand und Konto bei Firebase.

**Ohne Anmeldung:**
- Der Fortschritt liegt im **Browser, pro Gerät und pro Browser**. Werden die Browserdaten gelöscht, ist er weg. Unter *Einstellungen → Exportieren* lässt er sich als JSON-Datei sichern.
- Ein beschädigter Speicherstand wird gesichert (Schlüssel `…:defekt:<Zeit>`), nicht gelöscht.

## Wo die Lernmaterialien liegen

- **Original-PDFs**: im claude.ai-Projekt „WiWi 1“. Für die lokale Arbeit können sie in einen Ordner `materials/` gelegt werden. Er wird nicht eingecheckt.
- **Aufbereitete Inhalte**: `src/content/`.
  - `sources.ts`: Verzeichnis der Quelldokumente mit Kennungen (`FIN-VL23`, `KLAUSUR-BSP`, …)
  - `data/fin-1.ts`, `fin-2.ts`: Finanzierung · `rw-1.ts`, `rw-2.ts`: Rechnungswesen · `jb.ts`: Jahresabschluss · `exam.ts`: Beispielklausur
  - `types.ts`: das Inhaltsmodell mit Kommentaren zu jedem Feld

## Inhalte ergänzen oder korrigieren

1. Neues PDF in `sources.ts` eintragen (Kennung, Titel, Dateiname, Art).
2. In der passenden `data/*.ts` die Formel bzw. Aufgabe anlegen. Pflicht sind `sources` (Kennung + Seite) und `status`:
   `geprüft` (steht so in den Unterlagen und ist nachgerechnet), `abgeleitet` (von dir hergeleitet) oder `ungeprüft` (unklar; wird dann nicht in bewerteten Simulationen benutzt).
   Hilfsfunktionen wie `mc()`, `numeric()`, `steps()`, `opts('*richtig', 'falsch')` stehen in `src/content/helpers.ts`. Am einfachsten kopiert man eine bestehende Aufgabe als Vorlage.
3. Offizielle Ergebnisse in `officialChecks` der Datei eintragen. Der Test rechnet sie dann nach.
4. `npm test` ausführen. Der Inhaltstest prüft unter anderem eindeutige IDs, gültige Quellen, ob jede Formel Aufgaben hat und ob die Formeln auswertbar sind.
5. `npm run docs` erzeugt `docs/formula-catalog.md` und die Statistik in `docs/course-inventory.md` neu.
6. Unklarheiten in `docs/content-issues.md` festhalten.

Die Oberfläche liest alles generisch aus diesem Modell. Neue Kapitel, Lektionen und Formeln erscheinen ohne UI-Änderung.

## Dokumentation

| Datei | Inhalt |
|---|---|
| `docs/implementation-plan.md` | Architektur, umgesetzte Bausteine |
| `docs/course-inventory.md` | welche PDFs ausgewertet sind und welche noch fehlen |
| `docs/formula-catalog.md` | alle Formeln mit Status und Fundstellen (generiert) |
| `docs/exam-analysis.md` | Aufbau der Beispielklausur, Umsetzung in der Arena |
| `docs/content-issues.md` | Fehler in den Unterlagen, Annahmen, offene Fragen |
| `docs/learning-model.md` | Beherrschung, Wiederholung, XP-Regeln, Speicherung |
| `docs/firebase-setup.md` | Google-Anmeldung und Speicherung einrichten |

## Einschränkungen

- **Nicht alle PDFs sind eingearbeitet.** Es fehlen u. a. JB Kapitel 1, 2, 3 und 6, die Diskussionsfragen, Rechnungswesen-Tutorien 1–3 und 6 sowie die Curraxit-Fallstudie (Liste in `docs/course-inventory.md`).
- **Nur eine Klausur** liegt vor. „Relevanz“ heißt deshalb Häufigkeit in dieser Klausur, keine Prognose. Die Bearbeitungszeit ist ein Vorschlag der App.
- **Offene Fragen** (Erklären, Begründen, Buchen im Worksheet als Freitext) lassen sich nicht automatisch bewerten. Hier bewertet man sich selbst anhand der Musterlösung.
- **Die Anmeldung schützt den Fortschritt, nicht die Inhalte.** Formeln und Aufgaben stehen im JavaScript der Seite. Wer die Adresse kennt, kann sie auch ohne Anmeldung abrufen.
- Die Google-Anmeldung wurde hier mit einer simulierten Cloud getestet, nicht gegen ein echtes Firebase-Projekt. Den ersten echten Test macht man nach `docs/firebase-setup.md`, Schritt 6.
- Mehrere Geräte gleichzeitig: Kompetenzwerte und Wiederholungsplan einer Formel kommen vom Gerät mit der jüngeren Antwort, Zähler (XP, Versuche) werden addiert.
- Das JavaScript-Bundle ist etwa 290 kB groß (gzip), vor allem durch KaTeX und die Inhalte. Auf langsamen Mobilverbindungen dauert der erste Aufruf etwas länger, danach greift der Browser-Cache.
