import { defineConfig, devices } from '@playwright/test';
import 'dotenv/config';

export default defineConfig({
  testDir: './tests',
  // wspólna lista i te same konta - równolegle testy mieszałyby sobie powiadomienia
  fullyParallel: false,
  workers: 1,
  forbidOnly: !!process.env.CI,
  // bez retry: każdy przebieg dodaje komentarze na produkcji, a testy @bug mają być czerwone
  retries: 0,
  timeout: 90_000,
  expect: { timeout: 15_000 },
  reporter: [['list'], ['html', { open: 'never' }]],
  use: {
    baseURL: process.env.BASE_URL ?? 'https://kislist.com',
    locale: 'pl-PL',
    // w CI bez trace - artefakt jest publiczny, a trace zawiera ciasteczka sesji
    trace: process.env.CI ? 'off' : 'retain-on-failure',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },
  projects: [
    { name: 'setup', testMatch: /auth\.setup\.ts/ },
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
      dependencies: ['setup'],
    },
  ],
});
