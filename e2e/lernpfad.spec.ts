import { expect, test, type Page } from '@playwright/test'

async function noHorizontalScroll(page: Page) {
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth + 1)
  expect(overflow, 'kein horizontales Scrollen der Seite').toBe(false)
}

/** Beantwortet die aktuelle Aufgabe „irgendwie“ und geht weiter (für Durchlauf-Tests). */
async function answerCurrent(page: Page) {
  const radios = page.getByRole('radio', { disabled: false })
  const checks = page.getByRole('checkbox')
  if (await page.getByLabel('Deine Antwort').count()) await page.getByLabel('Deine Antwort').first().fill('1')
  else if (await page.locator('input[aria-label^="Formel für"]').count()) await page.locator('input[aria-label^="Formel für"]').fill('1')
  else if (await page.getByRole('textbox', { disabled: false }).count()) await page.getByRole('textbox', { disabled: false }).first().fill('1')
  else if (await radios.count()) await radios.first().click()
  else if (await checks.count()) await checks.first().click()
  else if (await page.locator('select').count()) for (const s of await page.locator('select').all()) await s.selectOption({ index: 1 })
}

test('wichtigster Lernpfad: Lektion starten, antworten, Feedback, abschließen, Reload', async ({ page }) => {
  await page.goto('/#/')
  await expect(page.getByText('Willkommen beim Formelpfad')).toBeVisible()
  await noHorizontalScroll(page)
  await page.getByRole('link', { name: /Erste Lektion starten/ }).click()
  await page.getByRole('button', { name: /Los geht/ }).click()

  // Erklärung → Beispiel → Aufgaben, bis „Abschließen“ bzw. Zusammenfassung erscheint
  for (let i = 0; i < 150; i++) {
    if (await page.getByRole('heading', { name: 'Lektion abgeschlossen' }).count()) break
    const weiter = page.getByRole('button', { name: /^(Weiter|Abschließen|Los geht’s)$/ })
    const pruefen = page.getByRole('button', { name: /^(Prüfen|Schritt prüfen)$/ })
    if (await pruefen.count()) {
      await answerCurrent(page)
      await pruefen.click()
      // Feedback sichtbar (richtig oder falsch) oder nächster Schritt
      await page.waitForTimeout(150)
      continue
    }
    if (await weiter.count()) {
      await weiter.first().click()
      continue
    }
    const fertig = page.getByRole('button', { name: 'Musterlösung zeigen' })
    if (await fertig.count()) {
      await fertig.click()
      await page.getByRole('button', { name: 'Teilweise' }).click()
    }
  }
  await expect(page.getByRole('heading', { name: 'Lektion abgeschlossen' })).toBeVisible()
  await expect(page.getByText(/^\+\d+$/).first()).toBeVisible()
  await page.getByRole('button', { name: 'Fertig' }).click()

  // Reload → Fortschritt bleibt erhalten
  await page.goto('/#/')
  await page.reload()
  await expect(page.getByText('Willkommen beim Formelpfad')).toHaveCount(0)
  await expect(page.getByText('Nächste Lektion')).toBeVisible()
  const xp = await page.getByTitle('Erfahrungspunkte').innerText()
  expect(Number(xp.replace(/\D/g, ''))).toBeGreaterThan(0)
})

test('Formelsammlung: Suche, Detailansicht, lange Formeln ohne Abschneiden', async ({ page }) => {
  await page.goto('/#/formeln')
  await page.getByPlaceholder(/Suche nach Name/).fill('Kuponanleihe')
  await page.getByText('Preis einer Kuponanleihe').first().click()
  await expect(page.getByRole('heading', { name: 'Preis einer Kuponanleihe' })).toBeVisible()
  await expect(page.getByText('Quellen und Fundstellen')).toBeVisible()
  await noHorizontalScroll(page)
})

test('vollständige Klausursimulation mit Auswertung', async ({ page }) => {
  await page.goto('/#/arena')
  await page.getByRole('button', { name: 'Ohne Zeitdruck' }).click()
  await expect(page.getByRole('heading', { name: /Beispielklausur/ })).toBeVisible()
  page.on('dialog', (d) => d.accept())
  // Eine Aufgabe korrekt beantworten: 1.1.2 Kapitalwert = 1,0744
  // Erstes freies Zahlenfeld ist 1.1.2 (1.1.1 besteht aus beschrifteten Schritten)
  await page.getByLabel('Deine Antwort').first().fill('1,0744')
  await page.getByRole('button', { name: 'Klausur abgeben' }).click()
  // Selbstbewertung offener Fragen
  for (const b of await page.getByRole('button', { name: 'Teilweise' }).all()) await b.click()
  await page.getByRole('button', { name: 'Auswertung anzeigen' }).click()
  await expect(page.getByText('Ergebnis', { exact: true })).toBeVisible()
  await expect(page.getByRole('heading', { name: 'Nach Themengebiet' })).toBeVisible()
  await expect(page.getByText(/\/ 90/).first()).toBeVisible()
  await expect(page.getByRole('heading', { name: 'Lösungswege' })).toBeVisible()
})

test('Wissensbereich: Suche, Detailansicht und Wissenstraining', async ({ page }) => {
  await page.goto('/#/wissen')
  await expect(page.getByRole('heading', { name: 'Wissen', exact: true })).toBeVisible()
  await noHorizontalScroll(page)
  await page.getByPlaceholder(/Suche nach Begriff/).fill('Lagebericht')
  await page.getByText('Lagebericht und Bilanzeid').first().click()
  await expect(page.getByRole('heading', { name: 'Lagebericht und Bilanzeid' })).toBeVisible()
  await expect(page.getByText('Kernaussage')).toBeVisible()
  await expect(page.getByRole('heading', { name: 'Das Wichtigste' })).toBeVisible()
  await noHorizontalScroll(page)

  await page.goto('/#/training?art=wissen')
  await expect(page.getByRole('button', { name: 'Sitzung beenden' })).toBeVisible()
  // erste Aufgabe beantworten → Feedback erscheint
  for (let i = 0; i < 5; i++) {
    const pruefen = page.getByRole('button', { name: /^(Prüfen|Schritt prüfen)$/ })
    if (await pruefen.count()) {
      await answerCurrent(page)
      await pruefen.click()
      break
    }
    if (await page.getByRole('button', { name: 'Musterlösung zeigen' }).count()) break
    await page.waitForTimeout(100)
  }
  await expect(page.getByText(/Richtig!|Richtig wäre|Nicht ganz|Lösungsweg|Teilweise|Musterlösung/).first()).toBeVisible()
})
