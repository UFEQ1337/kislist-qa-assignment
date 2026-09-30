import fs from 'node:fs';
import { test as base, type BrowserContext, type Page } from '@playwright/test';
import { InboxPage } from './pages/inbox-page';
import { users, type UserKey } from './users';

type Fixtures = {
  pageAs: (user: UserKey) => Promise<Page>;
  inboxOf: (user: UserKey) => Promise<InboxPage>;
  // klient bez konta, wchodzi tylko z linku
  anonymousPage: Page;
};

type Internal = {
  // każdy użytkownik w osobnym kontekście, wszystkie zamykane po teście
  newContextPage: (storageState?: string) => Promise<Page>;
};

export const test = base.extend<Fixtures & Internal>({
  newContextPage: async ({ browser }, use) => {
    const contexts: BrowserContext[] = [];
    await use(async (storageState) => {
      const context = await browser.newContext(storageState ? { storageState } : {});
      contexts.push(context);
      return context.newPage();
    });
    await Promise.all(contexts.map((c) => c.close()));
  },

  pageAs: async ({ newContextPage }, use) => {
    await use((user) => {
      const { name, storageState } = users[user];
      if (!fs.existsSync(storageState)) {
        throw new Error(`Brak sesji dla ${name}. Uzupełnij dane logowania w .env i uruchom projekt setup`);
      }
      return newContextPage(storageState);
    });
  },

  inboxOf: async ({ pageAs }, use) => {
    await use(async (user) => new InboxPage(await pageAs(user), users[user].name));
  },

  anonymousPage: async ({ newContextPage }, use) => {
    await use(await newContextPage());
  },
});

export { expect } from '@playwright/test';
