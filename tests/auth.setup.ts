import fs from 'node:fs';
import { test as setup, expect } from '@playwright/test';
import { users } from './support/users';

// Sesje zapisujemy w .auth/, testy otwierają z nich kilku użytkowników naraz
for (const user of Object.values(users)) {
  setup(`logowanie: ${user.name}`, async ({ page }) => {
    if (!user.email || !user.password) {
      // bez tego testy użyłyby starej sesji z poprzedniego uruchomienia
      fs.rmSync(user.storageState, { force: true });
      setup.skip(true, `Brak danych logowania dla ${user.name} w .env`);
    }

    await page.goto('/login');
    await page.getByRole('textbox', { name: 'Wpisz adres e-mail' }).fill(user.email);
    await page.getByRole('textbox', { name: 'Twoje hasło' }).fill(user.password);
    await page.getByRole('button', { name: 'Zaloguj się' }).click();
    await expect(page, `${user.name}: logowanie nieudane, sprawdź dane w .env`).not.toHaveURL(/\/log(in|owanie)/);

    // konta testowe mają wyłączone 2FA, jeśli wróci - lepiej wiedzieć od razu
    expect(new URL(page.url()).pathname, `${user.name}: konto wymaga kodu 2FA`).not.toMatch(/^\/2fa/);

    await page.context().storageState({ path: user.storageState });
  });
}
