import type { Locator, Page } from '@playwright/test';
import { CommentEditor } from '../components/comment-editor';

export class ListPage {
  constructor(private readonly page: Page) {}

  async open(listUrl: string) {
    // panel "KIS tip" na dole ekranu zasłania produkty przy 1280x720
    await this.page.addLocatorHandler(this.page.locator('#list-guide .ui-guide-steps'), async () => {
      await this.page.locator('#list-guide .ui-guide-divider button').click();
    });
    await this.page.goto(listUrl);
    await this.page.locator('.list-section-row').first().waitFor();
  }

  private productRow(productName: string): Locator {
    return this.page.locator('.list-section-row').filter({ hasText: productName });
  }

  private get commentsDialog(): Locator {
    return this.page.getByRole('dialog').filter({ hasText: 'Komentarze:' });
  }

  async openComments(productName: string) {
    // ikona jest w DOM kilka razy (różne widoki listy), klikamy widoczną
    await this.productRow(productName)
      .getByTitle('Zobacz komentarze do produktu')
      .filter({ visible: true })
      .first()
      .click();
    await this.commentsDialog.waitFor();
  }

  async addPrivateComment(text: string, mention?: string) {
    // jeśli produkt ma komentarze klienta, okno otwiera się na ich zakładce
    await this.commentsDialog.getByText('Prywatne', { exact: true }).click();

    const editor = new CommentEditor(this.page, this.page.locator('.kis-comments-form-private'));
    await editor.write(text, mention);
    await editor.send(/\/item\/[^/]+\/comments$/);
  }

  async getSharedPreviewUrl(): Promise<string | null> {
    const shareButton = this.page.getByTitle(/^Lista udostępniona/);
    if ((await shareButton.count()) === 0) return null;

    // okna nie zamykamy - dodatkowy klik mógłby zmienić ustawienia udostępnienia
    await shareButton.click();
    const dialog = this.page.getByRole('dialog').filter({ hasText: 'udostępnionej listy' });
    return dialog.locator('a[href*="/list-preview/"]').getAttribute('href');
  }
}
