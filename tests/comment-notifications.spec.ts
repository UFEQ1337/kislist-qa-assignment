import { test } from './support/fixtures';
import type { InboxPage } from './support/pages/inbox-page';
import { ClientPreviewPage } from './support/pages/client-preview-page';
import { ListPage } from './support/pages/list-page';
import { listUrl, products, uniqueTag } from './support/test-data';
import { teamMembers, users, type TestUser, type UserKey } from './support/users';

// soft, żeby w raporcie było widać wszystkich, do których powiadomienie nie doszło
async function expectNotificationFor(
  recipients: TestUser[],
  tag: string,
  inboxOf: (user: UserKey) => Promise<InboxPage>,
) {
  for (const { key, name } of recipients) {
    await test.step(`${name} widzi powiadomienie`, async () => {
      await (await inboxOf(key)).expectNotification(tag, { soft: true });
    });
  }
}

test.describe('Powiadomienia o komentarzach', () => {
  test.describe.configure({ timeout: 150_000 });

  test('oznaczenie @ - oznaczona osoba dostaje powiadomienie (test kontrolny)', async ({ pageAs, inboxOf }) => {
    // Oznaczenia działają - jeśli ten test przechodzi, czerwone testy niżej to nie wina samego testu
    const tag = uniqueTag('E2E-MENTION');
    const list = new ListPage(await pageAs('marcin'));

    await list.open(listUrl());
    await list.openComments(products.armchair);
    await list.addPrivateComment(`${tag} sprawdzisz wymiary tego fotela?`, users.anna.name);

    await (await inboxOf('anna')).expectNotification(tag);
  });

  test(
    'R3: komentarz członka zespołu - powiadomienie dostają pozostali członkowie zespołu',
    { tag: '@bug', annotation: { type: 'issue', description: 'BUG-01 w README' } },
    async ({ pageAs, inboxOf }) => {
      const tag = uniqueTag('E2E-R3');
      const author = users.anna;

      await test.step(`${author.name} dodaje komentarz do produktu`, async () => {
        const list = new ListPage(await pageAs(author.key));
        await list.open(listUrl());
        await list.openComments(products.sofa);
        await list.addPrivateComment(`${tag} Marcin, sprawdzisz dostępność tego narożnika?`);
      });

      await expectNotificationFor(
        teamMembers.filter((u) => u.key !== author.key),
        tag,
        inboxOf,
      );

      await test.step('autor nie dostaje powiadomienia o własnym komentarzu', async () => {
        await (await inboxOf(author.key)).expectNoNotification(tag);
      });
    },
  );

  test(
    'R2: komentarz klienta na udostępnionej liście - powiadomienie dostają wszyscy członkowie zespołu',
    { tag: '@bug', annotation: { type: 'issue', description: 'BUG-02 w README' } },
    async ({ pageAs, inboxOf, anonymousPage }) => {
      const tag = uniqueTag('E2E-R2');

      const previewUrl = await test.step('właściciel pobiera link do udostępnionej listy', async () => {
        const owner = new ListPage(await pageAs('piotr'));
        await owner.open(listUrl());
        return owner.getSharedPreviewUrl();
      });
      test.skip(!previewUrl, 'Lista nie jest udostępniona klientowi (Udostępnij listę)');

      await test.step('klient (bez logowania) komentuje produkt', async () => {
        const client = new ClientPreviewPage(anonymousPage);
        await client.open(previewUrl!);
        await client.addComment(products.coffeeTable, `${tag} Czy ten stolik jest też w wersji 100 cm?`);
      });

      await expectNotificationFor(teamMembers, tag, inboxOf);
    },
  );
});
