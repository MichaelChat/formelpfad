// Erzeugt docs/formula-catalog.md und den Statistik-Teil von docs/course-inventory.md
// direkt aus src/content. Aufruf: npm run docs
import { createServer } from 'vite'
import { readFileSync, writeFileSync } from 'node:fs'

const server = await createServer({ server: { middlewareMode: true }, appType: 'custom', logLevel: 'error' })
try {
  const c = await server.ssrLoadModule('/src/content/index.ts')
  const { SOURCES } = await server.ssrLoadModule('/src/content/sources.ts')
  const { chapters, formulas, exercises, exams, lessons } = c

  const ref = (s) => `${s.doc} S. ${s.pages}`
  const partName = { fin: 'Finanzierung', rw: 'Rechnungswesen', jb: 'Jahresabschluss & Bewertung' }

  // ---------- Formelkatalog ----------
  let out = '# Formelkatalog\n\n'
  out += '> Automatisch erzeugt mit `npm run docs` aus `src/content/data/*`. Nicht von Hand bearbeiten.\n\n'
  out += `Insgesamt **${formulas.length} Formeln** in **${chapters.length} Kapiteln**. Status: `
  const st = {}
  for (const f of formulas) st[f.status] = (st[f.status] ?? 0) + 1
  out += Object.entries(st).map(([k, v]) => `${k} ${v}`).join(', ') + '.\n\n'
  out += 'Legende Status: **geprüft** = steht so in den Unterlagen und wurde nachgerechnet · **abgeleitet** = von der App ergänzt (z. B. Umstellung), mathematisch geprüft, aber nicht wörtlich in den Unterlagen · **ungeprüft** = unklar, siehe `content-issues.md`.\n\n'
  for (const ch of chapters) {
    const fs = formulas.filter((f) => f.chapterId === ch.id)
    out += `## ${ch.number} ${ch.title} (${partName[ch.part]})\n\n`
    out += '| ID | Formel | Darstellung | Status | Aufgaben | Generator | Quellen |\n|---|---|---|---|---|---|---|\n'
    for (const f of fs) {
      const n = exercises.filter((e) => e.formulaIds.includes(f.id)).length
      const tex = '$' + f.tex.replace(/\|/g, '\\vert ').replace(/\n/g, ' ') + '$'
      out += `| \`${f.id}\` | ${f.name} | ${tex} | ${f.status}${f.statusNote ? ' – ' + f.statusNote : ''} | ${n} | ${f.generator ? 'ja' : '–'} | ${f.sources.map(ref).join('; ')} |\n`
    }
    out += '\n'
  }
  writeFileSync('docs/formula-catalog.md', out)

  // ---------- Statistik für das Inventar ----------
  const byOrigin = {}
  const byType = {}
  for (const e of exercises) {
    byOrigin[e.origin] = (byOrigin[e.origin] ?? 0) + 1
    byType[e.type] = (byType[e.type] ?? 0) + 1
  }
  const used = {}
  const add = (s) => s && (used[s.doc] = (used[s.doc] ?? 0) + 1)
  for (const f of formulas) f.sources.forEach(add)
  for (const e of exercises) (e.sources ?? []).forEach(add)
  for (const ch of chapters) ch.sources.forEach(add)

  let stats = '<!-- STATS:START -->\n'
  stats += `- Kapitel: ${chapters.length}, Lektionen: ${lessons.length}, Formeln: ${formulas.length}, Aufgaben: ${exercises.length}, Klausuren: ${exams.length}\n`
  stats += `- Aufgaben nach Herkunft: ${Object.entries(byOrigin).map(([k, v]) => `${k} ${v}`).join(', ')}\n`
  stats += `- Aufgaben nach Typ: ${Object.entries(byType).map(([k, v]) => `${k} ${v}`).join(', ')}\n\n`
  stats += '| Kennung | Datei | Verweise im Inhalt |\n|---|---|---|\n'
  for (const [id, d] of Object.entries(SOURCES)) stats += `| \`${id}\` | ${d.file} | ${used[id] ?? 0} |\n`
  stats += '<!-- STATS:END -->'

  const inv = readFileSync('docs/course-inventory.md', 'utf8')
  writeFileSync('docs/course-inventory.md', inv.replace(/<!-- STATS:START -->[\s\S]*<!-- STATS:END -->/, stats))
  console.log(`Formelkatalog: ${formulas.length} Formeln · Inventar-Statistik aktualisiert`)
} finally {
  await server.close()
}
