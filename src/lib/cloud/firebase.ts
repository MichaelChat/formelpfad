/**
 * Anbindung an Firebase: Google-Anmeldung (Authentication) und Speicherung (Firestore).
 * Wird erst bei Bedarf geladen (dynamischer Import), damit die App ohne Firebase klein bleibt.
 *
 * Datenmodell: ein Dokument pro Person unter `users/{uid}` mit
 *   data      – Lernstand als JSON-Text
 *   rev       – Revisionszähler (für das Erkennen gleichzeitiger Änderungen)
 *   updatedAt – Serverzeit der letzten Änderung
 *   schema    – Formatversion
 */
import { initializeApp, type FirebaseApp } from 'firebase/app'
import { deleteUser, getAuth, GoogleAuthProvider, onAuthStateChanged, reauthenticateWithPopup, signInWithPopup, signInWithRedirect, signOut as fbSignOut, type Auth, type User } from 'firebase/auth'
import { deleteDoc, doc, getDoc, getFirestore, runTransaction, serverTimestamp, type Firestore } from 'firebase/firestore/lite'
import { normalizeState } from '../persistence'
import type { AppState } from '../progress'
import type { FirebaseConfig } from './config'
import type { Remote, RemoteDoc, SaveResult } from './sync'

export interface Account {
  uid: string
  email: string | null
  name: string | null
  photoURL: string | null
}

let app: FirebaseApp | null = null
let auth: Auth | null = null
let db: Firestore | null = null

export function init(config: FirebaseConfig) {
  if (app) return
  app = initializeApp(config)
  auth = getAuth(app)
  auth.languageCode = 'de'
  db = getFirestore(app)
}

function need<T>(v: T | null): T {
  if (!v) throw new Error('Firebase ist nicht initialisiert')
  return v
}

const toAccount = (u: User): Account => ({ uid: u.uid, email: u.email, name: u.displayName, photoURL: u.photoURL })

export function watchAccount(cb: (a: Account | null) => void): () => void {
  return onAuthStateChanged(need(auth), (u) => cb(u ? toAccount(u) : null))
}

export async function signInWithGoogle(): Promise<void> {
  const provider = new GoogleAuthProvider()
  provider.setCustomParameters({ prompt: 'select_account' })
  try {
    await signInWithPopup(need(auth), provider)
  } catch (e) {
    const code = (e as { code?: string }).code
    // Popup blockiert (manche Mobilbrowser): auf Weiterleitung ausweichen.
    if (code === 'auth/popup-blocked' || code === 'auth/operation-not-supported-in-this-environment') {
      await signInWithRedirect(need(auth), provider)
      return
    }
    throw e
  }
}

export async function signOut(): Promise<void> {
  await fbSignOut(need(auth))
}

/** Löscht das Anmeldekonto bei Firebase (ggf. nach erneuter Bestätigung über Google). */
export async function deleteAuthUser(): Promise<void> {
  const user = need(auth).currentUser
  if (!user) return
  try {
    await deleteUser(user)
  } catch (e) {
    if ((e as { code?: string }).code !== 'auth/requires-recent-login') throw e
    await reauthenticateWithPopup(user, new GoogleAuthProvider())
    await deleteUser(user)
  }
}

export function authErrorMessage(e: unknown): string | null {
  const code = (e as { code?: string })?.code ?? ''
  switch (code) {
    case 'auth/popup-closed-by-user':
    case 'auth/cancelled-popup-request':
    case 'auth/user-cancelled':
      return null
    case 'auth/network-request-failed':
      return 'Keine Verbindung. Bitte prüfe deine Internetverbindung.'
    case 'auth/unauthorized-domain':
      return 'Diese Adresse ist in Firebase noch nicht freigegeben (Authentication → Settings → Authorized domains).'
    case 'auth/operation-not-allowed':
      return 'Die Google-Anmeldung ist in Firebase noch nicht aktiviert (Authentication → Sign-in method).'
    default:
      return `Anmeldung fehlgeschlagen${code ? ` (${code})` : ''}.`
  }
}

function parse(data: Record<string, unknown> | undefined): RemoteDoc | null {
  if (!data || typeof data.data !== 'string') return null
  try {
    const state = normalizeState(JSON.parse(data.data))
    if (!state) return null
    return { state, rev: typeof data.rev === 'number' ? data.rev : 0 }
  } catch {
    return null
  }
}

export function firestoreRemote(uid: string): Remote {
  const ref = () => doc(need(db), 'users', uid)
  return {
    async load() {
      const snap = await getDoc(ref())
      return snap.exists() ? parse(snap.data()) : null
    },
    async save(state: AppState, expectedRev: number): Promise<SaveResult> {
      return runTransaction(need(db), async (tx) => {
        const snap = await tx.get(ref())
        const current = snap.exists() ? parse(snap.data()) : null
        const currentRev = snap.exists() ? ((snap.data().rev as number | undefined) ?? 0) : 0
        if (currentRev !== expectedRev) return { ok: false as const, current }
        const rev = currentRev + 1
        tx.set(ref(), { data: JSON.stringify(state), rev, updatedAt: serverTimestamp(), schema: 1 })
        return { ok: true as const, rev }
      })
    },
    async remove() {
      await deleteDoc(ref())
    },
  }
}
