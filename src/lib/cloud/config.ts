/**
 * Firebase-Konfiguration aus Umgebungsvariablen (beim Build eingesetzt).
 * Lokal: Datei `.env.local` (siehe `.env.example`). GitHub: Repository-Variablen (siehe docs/firebase-setup.md).
 *
 * Diese Werte sind NICHT geheim – sie stehen in jeder Firebase-Web-App im ausgelieferten JavaScript.
 * Geschützt werden die Daten durch die Sicherheitsregeln in `firestore.rules`.
 *
 * Fehlen die Werte, läuft die App wie bisher ohne Anmeldung (nur Browser-Speicher).
 */
export interface FirebaseConfig {
  apiKey: string
  authDomain: string
  projectId: string
  appId: string
}

function read(): FirebaseConfig | null {
  const env = import.meta.env
  const cfg = {
    apiKey: env.VITE_FIREBASE_API_KEY as string | undefined,
    authDomain: env.VITE_FIREBASE_AUTH_DOMAIN as string | undefined,
    projectId: env.VITE_FIREBASE_PROJECT_ID as string | undefined,
    appId: env.VITE_FIREBASE_APP_ID as string | undefined,
  }
  if (!cfg.apiKey || !cfg.authDomain || !cfg.projectId || !cfg.appId) return null
  return cfg as FirebaseConfig
}

export const firebaseConfig = read()
export const cloudEnabled = firebaseConfig !== null
