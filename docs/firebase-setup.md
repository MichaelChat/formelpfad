# Firebase einrichten (Google-Anmeldung + Speicherung)

Mit Firebase melden sich die Lernenden mit ihrem Google-Konto an. Ihr Fortschritt liegt dann in einer Datenbank bei Google (Firestore) und ist auf allen Geräten derselbe. Die Seite selbst bleibt auf GitHub Pages.

Zeitaufwand: etwa 20 Minuten, einmalig. Kosten: Der kostenlose „Spark“-Tarif reicht für eine Nachhilfegruppe. Nach aktuellem Stand umfasst er pro Tag 50.000 Lese- und 20.000 Schreibvorgänge, die App schreibt höchstens einmal pro beantworteter Aufgabe. Die genauen Grenzen stehen in der Konsole unter *Usage*.

> Die Firebase-Konsole ändert gelegentlich Beschriftungen. Wenn ein Menüpunkt anders heißt, hilft meist die Suche oben in der Konsole.

## 1. Projekt anlegen

1. <https://console.firebase.google.com> öffnen und mit dem Google-Konto anmelden, dem das Projekt gehören soll.
2. **Projekt erstellen** → Name z. B. `formelpfad`.
3. **Google Analytics deaktivieren.** Die App braucht es nicht, und ohne Analytics fällt Tracking weg, das sonst im Datenschutzhinweis stehen müsste.

## 2. Google-Anmeldung einschalten

1. Links **Build → Authentication → Jetzt starten**.
2. Reiter **Sign-in method** → **Google** → **Aktivieren**, eine Support-E-Mail auswählen → **Speichern**.
3. Reiter **Settings → Authorized domains** → **Domain hinzufügen**: `DEIN-GITHUB-NAME.github.io`.
   *Warum:* Firebase erlaubt Anmeldungen nur von freigegebenen Adressen. `localhost` (für `npm run dev`) ist schon eingetragen.

## 3. Datenbank anlegen

1. **Build → Firestore Database → Datenbank erstellen** (falls eine Edition abgefragt wird: **Standard**).
2. **Standort:** `europe-west3 (Frankfurt)` wählen.
   *Warum:* Die Daten liegen dann in der EU. **Der Standort lässt sich später nicht mehr ändern.**
3. **Im Produktionsmodus starten.** Damit ist zunächst alles gesperrt, Schritt 4 öffnet genau das Nötige.

## 4. Sicherheitsregeln eintragen

1. In Firestore den Reiter **Regeln** öffnen.
2. Den gesamten Inhalt der Datei `firestore.rules` aus diesem Projekt hineinkopieren (den vorhandenen Text ersetzen) → **Veröffentlichen**.

*Warum:* Die Firebase-Zugangsdaten aus Schritt 5 stehen offen im JavaScript der Seite, das ist bei Firebase normal. Geschützt werden die Daten durch diese Regeln. Jede Person kann nur ihr eigenes Dokument `users/<ihre ID>` lesen und schreiben, alles andere ist gesperrt.

## 5. Web-App registrieren und Werte kopieren

1. Zahnrad oben links → **Projekteinstellungen** → Reiter **Allgemein**.
2. Unten bei **Meine Apps** auf das Web-Symbol `</>` klicken, Spitzname `formelpfad`, **Firebase Hosting nicht** ankreuzen (wir nutzen GitHub Pages) → **App registrieren**.
3. Aus dem angezeigten `firebaseConfig` brauchst du vier Werte: `apiKey`, `authDomain`, `projectId`, `appId`.
4. Optional, aber schön: im selben Reiter oben **Öffentlicher Name** auf „Formelpfad“ setzen. Dieser Name erscheint im Google-Anmeldefenster.

## 6. Lokal testen

Im Projektordner:

```bash
cp .env.example .env.local      # Vorlage kopieren; .env.local wird nicht eingecheckt
nano .env.local                 # die vier Werte eintragen, speichern mit Strg+O, Enter, Strg+X
npm run dev                     # danach erscheint der Anmeldebildschirm
```

Mit Google anmelden und eine Aufgabe lösen. In der Konsole unter **Firestore → Daten** sollte jetzt ein Dokument unter `users` auftauchen.

## 7. Werte bei GitHub hinterlegen

Der Workflow baut die Seite auf GitHub und braucht die Werte dort ebenfalls:

1. Repository auf github.com → **Settings → Secrets and variables → Actions** → Reiter **Variables** → **New repository variable**.
2. Vier Variablen anlegen (Name links, Wert aus Schritt 5):

   | Name | Wert |
   |---|---|
   | `FIREBASE_API_KEY` | apiKey |
   | `FIREBASE_AUTH_DOMAIN` | authDomain |
   | `FIREBASE_PROJECT_ID` | projectId |
   | `FIREBASE_APP_ID` | appId |

   *Variables statt Secrets*, weil die Werte ohnehin in der veröffentlichten Seite stehen. So sind sie im Workflow-Log lesbar, was die Fehlersuche erleichtert.
3. **Actions** → letzten Lauf öffnen → **Re-run all jobs** (oder einfach neu pushen).

Fehlen die Variablen, baut der Workflow die Seite ohne Anmeldung. Sie funktioniert dann wie vorher, nur mit Browser-Speicher.

## Was passiert mit bisherigem Fortschritt?

Wer die App vorher ohne Anmeldung benutzt hat, behält den Fortschritt: Bei der ersten Anmeldung auf diesem Gerät wird der Browser-Stand ins Konto übernommen. Der alte Eintrag wird dabei im Browser nicht gelöscht, sondern umbenannt (`formelpfad:state:v1:uebernommen:<Zeit>`).

## Datenschutz (bitte lesen)

Mit Anmeldung verarbeitet die Seite personenbezogene Daten: Google-Konto-ID, Name, E-Mail und den Lernstand. Für eine öffentlich erreichbare Seite in Deutschland heißt das in der Regel:

- eine **Datenschutzerklärung** (wer verantwortlich ist, welche Daten, Zweck, Speicherort Google/Firebase, Löschmöglichkeit) und je nach Fall ein **Impressum**;
- die **Datenverarbeitungsbedingungen** von Google/Firebase (englisch *Data Processing Terms*) bestätigen. Das geht in den Projekteinstellungen der Firebase-Konsole; der genaue Menüpunkt ändert sich gelegentlich, die Suche hilft.

Löschen können die Lernenden selbst: *Einstellungen → Konto löschen* entfernt den Lernstand und das Anmeldekonto bei Firebase. Das ist keine Rechtsberatung. Bei Unsicherheit hilft der Datenschutzbeauftragte der Hochschule weiter.

## Fehlermeldungen beim Anmelden

| Meldung | Ursache | Lösung |
|---|---|---|
| „Diese Adresse ist in Firebase noch nicht freigegeben“ | Domain fehlt | Schritt 2.3 |
| „Die Google-Anmeldung ist … noch nicht aktiviert“ | Anbieter aus | Schritt 2.2 |
| Anmeldung klappt, aber „Laden fehlgeschlagen … permission“ | Regeln fehlen oder falsch kopiert | Schritt 4 |
| Popup öffnet sich nicht (manche Handys) | Popup-Blocker | Die App weicht automatisch auf eine Weiterleitung aus. Notfalls Popups für die Seite erlauben. |
