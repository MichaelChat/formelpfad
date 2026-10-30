import { createContext, useContext } from 'react'
import type { SyncStatus } from '../lib/cloud/sync'

export interface CloudAccount {
  uid: string
  email: string | null
  name: string | null
}

export interface CloudValue {
  account: CloudAccount
  status: SyncStatus
  /** true, solange Änderungen noch nicht in der Cloud sind. */
  hasUnsyncedChanges: () => boolean
  syncNow: () => Promise<void>
  signOut: () => Promise<void>
  /** Löscht Lernstand und Konto bei Firebase und meldet ab. */
  deleteAccount: () => Promise<void>
}

export const CloudContext = createContext<CloudValue | null>(null)

/** null, wenn die App ohne Anmeldung läuft (keine Firebase-Konfiguration). */
export function useCloud(): CloudValue | null {
  return useContext(CloudContext)
}

export const STATUS_LABELS: Record<SyncStatus, string> = {
  synced: 'Gespeichert',
  saving: 'Wird gespeichert …',
  offline: 'Offline – wird gespeichert, sobald du wieder online bist',
  error: 'Speichern fehlgeschlagen – wird erneut versucht',
}
