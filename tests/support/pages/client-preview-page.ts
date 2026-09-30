import type { Page } from '@playwright/test';
import { CommentEditor } from '../components/comment-editor';

// Widok klienta: udostępniona lista (podgląd na żywo) otwierana z linku
export class ClientPreviewPage {
  constructor(private readonly page: Page) {}

  async open(previewUrl: string) {
    await this.page.goto(previewUrl);
    await this.page.locator('.proposal-item').first().waitFor();
  }

  async addComment(productName: string, text: string) {
    const product = this.page.locator('.proposal-item').filter({ hasText: productName });
    await product.getByRole('button', { name: 'Napisz komentarz' }).click();

    const editor = new CommentEditor(this.page, product);
    await editor.write(text);
    await editor.send(/\/live-proposal\/comments$/);
  }
}
