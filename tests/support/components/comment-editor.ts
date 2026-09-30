import { expect, type Locator, type Page } from '@playwright/test';

// Edytor komentarza - ten sam w widoku zespołu i klienta. root = kontener z polem i przyciskiem "Wyślij"
export class CommentEditor {
  constructor(
    private readonly page: Page,
    private readonly root: Locator,
  ) {}

  async write(text: string, mention?: string) {
    // TipTap (contenteditable) - fill() nie działa, trzeba pisać z klawiatury
    await this.root.locator('[contenteditable="true"]').click();
    if (mention) await this.insertMention(mention);
    await this.page.keyboard.type(text);
  }

  async send(endpoint: RegExp) {
    const saved = this.page.waitForResponse(
      (r) => r.request().method() === 'POST' && endpoint.test(r.url()),
    );
    await this.root.getByRole('button', { name: /wyślij/i }).click();
    const response = await saved;
    if (!response.ok()) {
      throw new Error(`Nie udało się zapisać komentarza: HTTP ${response.status()} (${response.url()})`);
    }
  }

  private async insertMention(name: string) {
    // Lista osób dociera asynchronicznie. W CI pierwsze "@" potrafi pokazać "Nic nie znaleziono",
    // wtedy kasujemy je i próbujemy jeszcze raz. Spację po oznaczeniu edytor dodaje sam.
    const option = this.page.locator('.mention-items').getByRole('button', { name, exact: true });
    await expect(async () => {
      await this.page.keyboard.type('@');
      try {
        await option.click({ timeout: 2_000 });
      } catch (error) {
        await this.page.keyboard.press('Backspace');
        throw error;
      }
    }).toPass({ timeout: 20_000 });
  }
}
