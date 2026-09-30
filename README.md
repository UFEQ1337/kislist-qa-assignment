# KIS List - testy systemu powiadomień o komentarzach

Zadanie praktyczne na stanowisko Tester aplikacji webowych (QA / Playwright).

- **Raport testerski** - poniżej
- **Plan testów z pełną macierzą przypadków i wynikami** - [`docs/test-plan.md`](docs/test-plan.md)
- **Testy E2E (Playwright + TypeScript)** - [`tests/`](tests)

---

## 1. Podsumowanie

Zgłoszenie Piotra się potwierdza. Członkowie zespołu dostają powiadomienie o komentarzu **tylko wtedy, gdy są jego bezpośrednim adresatem**:

- zostali oznaczeni przez `@`,
- ktoś odpowiedział na ich komentarz,
- są **właścicielem** listy, a komentarz dodał klient.

Powiadomienia do "wszystkich członków zespołu powiązanych z listą", których wymagają R1, R2 i R3, nie są wysyłane w ogóle.

| Wymaganie | Wynik | Błąd |
|---|---|---|
| R1 - klient komentuje propozycję → cały zespół | ❌ powiadomienie dostaje tylko właściciel listy (Piotr) | BUG-02 |
| R2 - klient komentuje udostępnioną listę → cały zespół | ❌ tylko właściciel listy; gdy klient jest zalogowany na konto KIS List - nikt | BUG-02, BUG-03 |
| R3 - członek zespołu komentuje element listy → pozostali członkowie | ❌ nikt nie dostaje powiadomienia (niezależnie od autora, także gdy autorem jest właściciel) | BUG-01 |
| E-mail o komentarzu klienta | ❌ trafia do samego klienta, a nie do zespołu | BUG-06 |
| Negatywne (autor, klient, duplikaty) | ✅ w aplikacji bez uwag; ❌ klient dostaje mail o własnym komentarzu | BUG-06 |

To tłumaczy, dlaczego Piotr "nie pamięta, których sytuacji dotyczy problem". Część powiadomień działa: oznaczenia, odpowiedzi i, u niego jako właściciela, komentarze klienta. Wrażenie jest więc takie, że powiadomienia działają "czasami".

## 2. Zakres i środowisko

| | |
|---|---|
| Aplikacja | https://kislist.com (produkcja), projekt "PROJEKT REKRUTACJA", lista "KOSZTORYS" |
| Data testów | 2026-09-30 |
| Przeglądarka | Chromium (Playwright 1.63.0), Windows 11 |
| Użytkownicy | Piotr - właściciel konta; Anna, Marcin, Michalina - Członek zespołu; Klient - odbiorca udostępnionej listy i propozycji |

**Kanały powiadomień:**
- **powiadomienia w aplikacji** (dzwonek i `/inbox`): sprawdzone u każdego użytkownika i dodatkowo przez endpoint `GET /notification-events`, z którego korzysta panel,
- **e-mail**: sprawdzony ręcznie w skrzynce, bo wszystkie konta testowe są aliasami jednej skrzynki.

**Poza zakresem:** komentarze-piny na wizualizacjach, ankiety i harmonogram.

### Przygotowanie środowiska - uwagi

- Konta Anny, Marcina i Michaliny założone wcześniej jako samodzielne konta **nie mogą** zostać dodane do zespołu Piotra. Serwer zwraca `400 team_member_exists_in_other_team` (BUG-04). Członków zespołu zaprosiłem więc na nowe adresy i zarejestrowałem ich z linku w zaproszeniu.
- Na prośbę do zespołu KIS List na kontach testowych wyłączono wymóg numeru telefonu i kod 2FA wysyłany e-mailem, żeby testy E2E mogły logować się automatycznie.

### Założenia i wykluczone alternatywne wyjaśnienia

Zanim uznałem brak powiadomień za błąd, a nie za skutek konfiguracji, sprawdziłem:

| Możliwe wyjaśnienie | Jak sprawdzone | Wynik |
|---|---|---|
| Członkowie zespołu nie są "powiązani z listą" | okno "Zaproś do współpracy" listy KOSZTORYS oraz projektu (panel projektu → "Dodaj współpracowników") | Anna, Marcin i Michalina są na obu poziomach jako "Członek zespołu", status "Potwierdzony" ([`project-team.png`](docs/evidence/project-team.png)) |
| Powiadomienia są wyłączone w ustawieniach użytkownika | profil, "Ustawienia" (wszystkie 6 zakładek), panel dzwonka, menu "⋮" listy | brak jakiejkolwiek opcji dotyczącej powiadomień, e-maili czy obserwowania listy |
| Powiadomienia przychodzą z opóźnieniem | `GET /notification-events` po kilku sekundach i ponownie po kilku minutach, skrzynka e-mail po ~30-45 min | brak zmian; powiadomienia, które działają (oznaczenie, odpowiedź), pojawiają się w ciągu kilku sekund |
| Problem leży w sposobie sprawdzania | test kontrolny i przypadki TC-P-07 / TC-P-10 | ten sam sposób sprawdzania wykrywa powiadomienia, które działają |

Nadal możliwe jest, że obecne działanie (powiadomienia tylko do bezpośredniego adresata) jest **zamierzone**. Wtedy BUG-01 i BUG-02 to rozbieżność między wymaganiami produktowymi a implementacją, do rozstrzygnięcia z zespołem produktowym. Zgłaszam je jako błędy, bo są niezgodne z wymaganiami podanymi w zadaniu.

BUG-03, BUG-05 i BUG-06 dotyczą zachowań, które mogą mieć uzasadnienie niewidoczne z zewnątrz. Oznaczam je jako **do potwierdzenia z produktem**.

## 3. Wyniki

Pełna macierz (11 przypadków pozytywnych, 8 negatywnych, wyniki dla kanału e-mail) jest w [`docs/test-plan.md`](docs/test-plan.md).
W skrócie:

| Kto komentuje / gdzie | Piotr | Anna | Marcin | Michalina |
|---|:-:|:-:|:-:|:-:|
| Klient (anonimowo) - propozycja (TC-P-01) | ✅ | ❌ | ❌ | ❌ |
| Klient (anonimowo) - udostępniona lista (TC-P-02b) | ✅ | ❌ | ❌ | ❌ |
| Klient (zalogowany na konto KIS List) - udostępniona lista (TC-P-02) | ❌ | ❌ | ❌ | ❌ |
| Piotr - komentarz prywatny (TC-P-03) | autor | ❌ | ❌ | ❌ |
| Anna - komentarz prywatny (TC-P-04) | ❌ | autor | ❌ | ❌ |
| Marcin - komentarz prywatny (TC-P-05) | ❌ | ❌ | autor | ❌ |
| Michalina - komentarz prywatny (TC-P-06) | ❌ | ❌ | ❌ | autor |
| Marcin - komentarz z `@Anna` (TC-P-07) | ❌ | ✅ oznaczenie | autor | ❌ |
| Anna - odpowiedź w wątku Marcina (TC-P-10) | ❌ | autor | ✅ odpowiedź | ❌ |

✅ - powiadomienie dotarło, ❌ - powinno dotrzeć, a nie dotarło.

Zrzuty ekranu `/inbox` wszystkich członków zespołu po testach: [`docs/evidence/`](docs/evidence).

## 4. Zgłoszone błędy

### BUG-01 - Komentarz członka zespołu nie generuje powiadomień dla pozostałych członków zespołu

**Priorytet:** wysoki (wymaganie R3 nie jest spełnione w żadnym wariancie)

**Kroki:**
1. Zaloguj się jako Anna (Członek zespołu) i otwórz listę KOSZTORYS.
2. Kliknij ikonę komentarzy przy produkcie "Narożnik rozkładany Botse...", zakładka "Prywatne".
3. Wpisz komentarz bez oznaczania nikogo i kliknij "Wyślij".
4. Zaloguj się jako Piotr, Marcin i Michalina i sprawdź dzwonek oraz `/inbox`.

**Oczekiwany wynik:** Piotr, Marcin i Michalina widzą powiadomienie "Członek zespołu dodał komentarz".

**Faktyczny wynik:** brak powiadomienia u wszystkich. `GET /notification-events` zwraca `total: 0`, także po kilku minutach. Komentarz zapisuje się poprawnie (`POST /list/{list}/item/{item}/comments` → `200`).

**Zakres:**
- ten sam wynik dla każdego autora (Piotr, Anna, Marcin, Michalina),
- ten sam wynik dla komentarza w zakładce "Komentarze klienta" i dla odpowiedzi na komentarz klienta.

**Co działa:**
- oznaczenie `@` (`list_item_comment_mention`) - tylko u oznaczonej osoby,
- odpowiedź w wątku (`list_item_comment_reply`) - tylko u autora komentarza, na który ktoś odpowiedział.

**Test regresyjny:** `R3: komentarz członka zespołu...` w [`tests/comment-notifications.spec.ts`](tests/comment-notifications.spec.ts).

### BUG-02 - Komentarz klienta trafia tylko do właściciela listy, a nie do całego zespołu

**Priorytet:** wysoki (wymagania R1 i R2)

**Kroki:**
1. Jako Piotr udostępnij listę klientowi ("Udostępnij listę") albo wyślij propozycję ("Utwórz propozycję dla klienta").
2. Otwórz link jako klient, bez logowania, i dodaj komentarz do produktu.
3. Sprawdź powiadomienia u Piotra, Anny, Marcina i Michaliny.

**Oczekiwany wynik:** powiadomienie "Klient dodał komentarz..." u wszystkich czterech osób.

**Faktyczny wynik:**
- **Piotr:** dostaje `new_live_proposal_comment` (lista) albo `new_proposal_comment` (propozycja).
- **Anna, Marcin, Michalina:** nie dostają nic.

**Test regresyjny:** `R2: komentarz klienta na udostępnionej liście...` w [`tests/comment-notifications.spec.ts`](tests/comment-notifications.spec.ts).

### BUG-03 - Komentarz klienta zalogowanego na własne konto KIS List nie generuje żadnego powiadomienia

**Priorytet:** średni · **do potwierdzenia z produktem**

**Kroki:** jak w BUG-02, ale klient otwiera link do udostępnionej listy w przeglądarce, w której jest zalogowany na swoje (darmowe) konto KIS List.

**Oczekiwany wynik:** jak w BUG-02.

**Faktyczny wynik:** komentarz zapisuje się (`POST /live-proposal/comments` → `200`, w odpowiedzi `editable: true`), ale **nikt**, łącznie z właścicielem listy, nie dostaje powiadomienia.

**Znaczenie:** udostępnienie przez e-mail zachęca do rejestracji, więc to całkiem prawdopodobny scenariusz: klient zakłada konto, żeby zobaczyć listę.

### BUG-04 - Zaproszenie do zespołu kończy się błędem, ale UI go nie pokazuje

**Priorytet:** niski (poza głównym zakresem, znalezione przy przygotowaniu środowiska)

**Kroki:** lista → "Dodaj członka zespołu lub współpracownika" → e-mail osoby, która ma już konto KIS List → rola "Członek zespołu" → "Zaproś".

**Oczekiwany wynik:** komunikat, dlaczego nie da się zaprosić tej osoby.

**Faktyczny wynik:**
- serwer zwraca `400` z czytelnym komunikatem ("Podany adres email jest już zajęty w systemie. Podaj inny adres email tego użytkownika."),
- okno nie pokazuje nic, osoba nie pojawia się na liście,
- błąd widać tylko w konsoli przeglądarki.

### BUG-05 - W oknie "Wyślij propozycję" pole e-mail ma domyślnie przykładowy adres jako wartość

**Priorytet:** niski · **do potwierdzenia z produktem**

**Kroki:** lista → "Utwórz propozycję dla klienta".

**Faktyczny wynik:** w polu "Adres(y) email" wpisany jest `jan.kowalski@email.pl` jako **wartość** pola, a nie podpowiedź (placeholder). W oknie "Udostępnij listę" ten sam tekst jest poprawnie podpowiedzią.

**Ryzyko:** wysłanie propozycji na przypadkowy adres, jeśli użytkownik nie zmieni pola. Wysyłki bez zmiany adresu celowo nie sprawdzałem.

### BUG-06 - E-mail o komentarzu klienta trafia do klienta zamiast do zespołu

**Priorytet:** wysoki · **do potwierdzenia z produktem** (projektant nie dowiaduje się mailem o komentarzu klienta, a klient dostaje mylącą wiadomość)

**Kroki:**
1. Udostępnij listę klientowi na adres `+klient`.
2. Jako klient, bez logowania, dodaj komentarz do produktu (TC-P-02b, 14:01).
3. Sprawdź skrzynki wszystkich uczestników.

**Oczekiwany wynik:** członkowie zespołu dostają mail o nowym komentarzu klienta. Klient nie dostaje maila o własnym komentarzu.

**Faktyczny wynik:**
- mail "Klient zaktualizował(a) Twój projekt w KIS List" ("Klient wprowadził(a) nowe aktualizacje w Twoim projekcie...") przyszedł **na adres klienta**,
- Piotr, Anna, Marcin i Michalina nie dostali żadnego maila,
- w API powiadomienie Piotra ma `"sent_to_mails": ["...+klient@gmail.com"]`.

**Uwaga:** po komentarzu klienta do propozycji (TC-P-01) nie przyszedł żaden mail.

### Obserwacje (bez zgłoszenia)

- Oznaczenie `@` jest wysyłane mailem zbiorczym ("Powiadomienia w KIS List: 1 Oznaczenia Ciebie w komentarzu do listy"), około 8 minut po komentarzu. Wygląda to na celową agregację.

- W podpowiedziach po wpisaniu `@` autor widzi również siebie.
- Okno komentarzy otwiera się domyślnie na zakładce "Komentarze klienta", jeśli produkt ma komentarze klienta. Łatwo wtedy napisać do klienta zamiast wewnętrznie.

## 5. Testy automatyczne

Plik [`tests/comment-notifications.spec.ts`](tests/comment-notifications.spec.ts):

| Test | Co sprawdza | Oczekiwany wynik obecnie |
|---|---|---|
| oznaczenie @ ... (test kontrolny) | Marcin oznacza Annę, Anna widzi powiadomienie w `/inbox` | ✅ przechodzi |
| R3: komentarz członka zespołu ... `@bug` | Anna komentuje; powiadomienie u Piotra, Marcina, Michaliny; brak u Anny | ❌ **nie przechodzi - odtwarza BUG-01** |
| R2: komentarz klienta na udostępnionej liście ... `@bug` | anonimowy klient komentuje; powiadomienie u wszystkich 4 członków zespołu | ❌ **nie przechodzi - odtwarza BUG-02** |

Testy `@bug` są **celowo czerwone**. Sprawdzają zachowanie zgodne z wymaganiem, więc zaczną przechodzić dopiero po poprawce i od tej chwili będą pilnować regresji.
Test kontrolny pokazuje, że czerwony wynik nie bierze się z samego testu, bo ten sam mechanizm sprawdzania wykrywa powiadomienia, które działają.

Oczekiwany wynik uruchomienia (fragment):

```
Error: Brak oczekiwanego powiadomienia [E2E-R3 ...] u użytkownika: Piotr
Error: Brak oczekiwanego powiadomienia [E2E-R3 ...] u użytkownika: Marcin
Error: Brak oczekiwanego powiadomienia [E2E-R3 ...] u użytkownika: Michalina
Error: Brak oczekiwanego powiadomienia [E2E-R2 ...] u użytkownika: Anna
Error: Brak oczekiwanego powiadomienia [E2E-R2 ...] u użytkownika: Marcin
Error: Brak oczekiwanego powiadomienia [E2E-R2 ...] u użytkownika: Michalina
  2 failed
  1 passed
```

Jak działają testy:

- **Logowanie:** projekt `setup` ([`tests/auth.setup.ts`](tests/auth.setup.ts)) loguje każdego użytkownika i zapisuje sesję do `.auth/<user>.json`.
- **Kilku użytkowników w jednym teście:** każda osoba ma własny kontekst przeglądarki (fixture'y `pageAs` i `inboxOf` w [`tests/support/fixtures.ts`](tests/support/fixtures.ts)). Dzięki temu da się dodać komentarz jako jedna osoba i od razu sprawdzić powiadomienia u pozostałych. Konteksty zamyka jeden wspólny fixture.
- **Unikalny znacznik:** każdy komentarz ma znacznik z datą i godziną (np. `[E2E-R3 20260930122602]`). Testy nie wymagają sprzątania danych, a powiadomienie z danego przebiegu da się jednoznacznie znaleźć.
- **Czekanie na powiadomienia:** przychodzą asynchronicznie, więc `/inbox` jest przeładowywany do skutku, maksymalnie 20 s na osobę.
- **Soft asercje:** kolejni odbiorcy są sprawdzani przez `expect.soft`. Raport pokazuje wszystkich, do których powiadomienie nie dotarło, a nie tylko pierwszego.
- **Page Object Model:**
  - strony w [`tests/support/pages/`](tests/support/pages): lista zespołu, widok klienta, inbox,
  - edytor komentarza, wspólny dla widoku zespołu i klienta, jako osobny komponent [`CommentEditor`](tests/support/components/comment-editor.ts),
  - spec nie zawiera selektorów, tylko wywołania metod.
- **Selektory:** tam, gdzie to możliwe, role i teksty widoczne dla użytkownika (`getByRole`, `getByTitle`). Aplikacja prawie nie ma atrybutów `data-testid`, więc część selektorów opiera się na klasach CSS (`.list-section-row`, `.proposal-item`, `.mention-items`). Dodanie `data-testid` do tych elementów uodporniłoby testy na zmiany wyglądu.
- **Panel onboardingu** ("KIS tip") zasłania produkty przy mniejszej rozdzielczości, dlatego zamyka go `page.addLocatorHandler`.

Przypadek R1 (propozycja) sprawdziłem tylko ręcznie. Automatyczny test wysyłałby przy każdym uruchomieniu nową propozycję mailem, a przyczyna jest ta sama co w R2.

## 6. Uruchomienie testów E2E

### Wymagania

- Node.js 20+
- Konta KIS List dla ról z `.env.example`, logowanie e-mailem i hasłem, bez 2FA:
  - Piotr - właściciel listy,
  - Anna, Marcin i Michalina - "Członek zespołu" w zespole Piotra,
  - Klient - konto potrzebne tylko do projektu `setup`.
- Lista z projektu testowego (`LIST_URL`), udostępniona klientowi ("Udostępnij listę"). Bez udostępnienia test R2 zostanie pominięty z komunikatem.

### Instalacja

```bash
npm ci
npx playwright install chromium
cp .env.example .env
```

Uzupełnij `.env`. Plik `.env` i katalog `.auth/` są w `.gitignore`.

### Uruchomienie

```bash
npm test                 # logowanie (projekt setup) + testy
npm run test:headed      # z widoczną przeglądarką
npm run report           # raport HTML z ostatniego uruchomienia (zrzuty ekranu, trace)
npm run typecheck        # kontrola typów TypeScript
```

Jeden przebieg trwa około 2-3 minut. Większość tego czasu to czekanie na powiadomienia, które nie przychodzą (20 s na osobę).

### CI

Workflow [`.github/workflows/playwright.yml`](.github/workflows/playwright.yml) uruchamia się ręcznie (`workflow_dispatch`), bo testy działają na produkcyjnym KIS List.
Dane logowania trzeba dodać jako GitHub Secrets pod tymi samymi nazwami co w `.env.example`. Raport HTML jest zapisywany jako artefakt.

## 7. Struktura repozytorium

```
tests/
  auth.setup.ts                  logowanie użytkowników i zapis sesji
  comment-notifications.spec.ts  testy E2E powiadomień
  support/
    fixtures.ts                  pageAs / inboxOf / anonymousPage - osobne konteksty przeglądarki
    users.ts                     role testowe i dane z .env
    test-data.ts                 produkty z projektu testowego, unikalne znaczniki
    pages/                       Page Objecty: lista, widok klienta, inbox
    components/comment-editor.ts edytor komentarza (wspólny dla zespołu i klienta)
docs/
  test-plan.md                   plan testów - macierz przypadków i wyniki
  evidence/                      zrzuty ekranu do raportu
.github/workflows/playwright.yml
playwright.config.ts
```
