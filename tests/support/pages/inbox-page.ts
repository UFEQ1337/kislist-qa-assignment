import { expect, type Locator, type Page } from '@playwright/test';

export class InboxPage {
  constructor(
    private readonly page: Page,
    private readonly ownerName: string,
  ) {}

  async open() {
    // bez czekania na API "brak powiadomienia" przechodziłoby, zanim lista się wczyta
    const loaded = this.page.waitForResponse(
      (r) => r.url().includes('/notification-events?') && r.ok(),
    );
    await this.page.goto('/inbox');
    await loaded;
  }

  notification(text: string): Locator {
    return this.page.getByText(text);
  }

  // Powiadomienia przychodzą z opóźnieniem, więc odświeżamy /inbox do skutku
  async expectNotification(text: string, { soft = false, timeout = 20_000 } = {}) {
    const message = `Brak oczekiwanego powiadomienia ${text} u użytkownika: ${this.ownerName}`;
    await (soft ? expect.soft : expect)(async () => {
      await this.open();
      await expect(this.notification(text)).toBeVisible({ timeout: 2_000 });
    }, message).toPass({ timeout, intervals: [1_000, 2_000, 3_000] });
  }

  async expectNoNotification(text: string) {
    await this.open();
    await expect(
      this.notification(text),
      `Nieoczekiwane powiadomienie ${text} u użytkownika: ${this.ownerName}`,
    ).toHaveCount(0);
  }
}
