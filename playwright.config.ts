import { defineConfig, devices } from '@playwright/test'

// PW_CHROMIUM_PATH / PW_CHROMIUM_ARGS erlauben einen eigenen Chromium (z. B. in Sandboxen ohne Browser-Download).
const executablePath = process.env.PW_CHROMIUM_PATH
const args = process.env.PW_CHROMIUM_ARGS ? (JSON.parse(process.env.PW_CHROMIUM_ARGS) as string[]) : undefined
const launchOptions = executablePath ? { executablePath, ...(args ? { args } : {}) } : {}

export default defineConfig({
  testDir: './e2e',
  timeout: 60_000,
  workers: executablePath ? 1 : undefined,
  reporter: [['list']],
  use: { baseURL: 'http://localhost:4173', trace: 'off', launchOptions },
  webServer: { command: 'npm run build && npx vite preview --port 4173 --strictPort', url: 'http://localhost:4173', reuseExistingServer: true, timeout: 120_000 },
  projects: [
    { name: 'mobil', use: { ...devices['Pixel 7'], ...(executablePath ? { launchOptions } : {}) } },
    { name: 'desktop', use: { ...devices['Desktop Chrome'], viewport: { width: 1366, height: 900 }, ...(executablePath ? { launchOptions } : {}) } },
  ],
})
