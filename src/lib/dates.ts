/**
 * Lokale Datumslogik. Lerntage werden als lokales Datum „YYYY-MM-DD“ gespeichert.
 * Differenzen werden über Date.UTC(Jahr, Monat, Tag) berechnet – so verschieben
 * Zeitumstellungen (23- bzw. 25-Stunden-Tage) keine Tagesgrenzen.
 */
export type Day = string

export function localDay(d: Date = new Date()): Day {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

function parts(day: Day): [number, number, number] {
  const [y, m, d] = day.split('-').map(Number)
  return [y!, m!, d!]
}

export function addDays(day: Day, n: number): Day {
  const [y, m, d] = parts(day)
  const dt = new Date(Date.UTC(y, m - 1, d + n))
  return `${dt.getUTCFullYear()}-${String(dt.getUTCMonth() + 1).padStart(2, '0')}-${String(dt.getUTCDate()).padStart(2, '0')}`
}

/** Anzahl Kalendertage von a nach b (b − a). */
export function daysBetween(a: Day, b: Day): number {
  const [y1, m1, d1] = parts(a)
  const [y2, m2, d2] = parts(b)
  return Math.round((Date.UTC(y2, m2 - 1, d2) - Date.UTC(y1, m1 - 1, d1)) / 86400000)
}

export function formatDayLong(day: Day): string {
  const [y, m, d] = parts(day)
  return new Date(y, m - 1, d).toLocaleDateString('de-DE', { weekday: 'short', day: 'numeric', month: 'short' })
}
