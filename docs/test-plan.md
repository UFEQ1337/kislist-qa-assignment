# Plan testów i wyniki - powiadomienia o komentarzach

Data wykonania: 2026-09-30, środowisko produkcyjne https://kislist.com, Chromium (Playwright 1.63), Windows 11.

## Cel

Ustalić, w których sytuacjach członkowie zespołu nie dostają powiadomień o komentarzach (zgłoszenie Piotra),
oraz sprawdzić, czy powiadomienia nie trafiają do osób, do których nie powinny.

## Wymagania (z opisu zadania)

| ID | Autor | Miejsce komentarza | Kto powinien dostać powiadomienie |
|---|---|---|---|
| R1 | Klient | propozycja | wszyscy członkowie zespołu powiązani z listą |
| R2 | Klient | udostępniona lista (podgląd na żywo) | wszyscy członkowie zespołu powiązani z listą |
| R3 | Członek zespołu | element listy | pozostali członkowie zespołu powiązani z listą |

## Dane testowe

Projekt "PROJEKT REKRUTACJA", lista "KOSZTORYS", sekcja Salon.

| Użytkownik | Rola | Uwagi |
|---|---|---|
| Piotr | właściciel konta (Administrator) | konto główne |
| Anna | Członek zespołu | zaproszona z poziomu listy ("Zaproś do współpracy") |
| Marcin | Członek zespołu | j.w. |
| Michalina | Członek zespołu | j.w. |
| Klient | odbiorca udostępnionej listy i propozycji | osobne konto KIS List; część testów wykonana bez logowania (anonimowo z linku) |

Każdy komentarz zawiera ID przypadku (np. `[TC-P-04]`), więc wszystkie komentarze testowe można odnaleźć na liście KOSZTORYS.

## Sposób weryfikacji

- **Powiadomienia w aplikacji:** dzwonek "Pokaż powiadomienia" oraz strona `/inbox` (zakładka "Powiadomienia") u każdego użytkownika, sprawdzane w osobnych, równoległych sesjach przeglądarki.
- **Kontrola krzyżowa:** endpoint `GET /notification-events?page=1&limit=25`, z którego korzysta panel powiadomień. Dzięki temu wynik "brak powiadomienia" nie wynika z opóźnienia odświeżania UI: sprawdzane po kilku sekundach i ponownie po kilku minutach.
- **E-mail:** sprawdzany ręcznie w skrzynce (wszystkie konta to aliasy jednej skrzynki Gmail) - wyniki w sekcji "Kanał e-mail".

## Scenariusze pozytywne

| ID | Autor | Kontekst | Oczekiwani odbiorcy | Faktyczni odbiorcy | Wynik |
|---|---|---|---|---|---|
| TC-P-01 | Klient (bez logowania) | komentarz do produktu w propozycji | Piotr, Anna, Marcin, Michalina | Piotr | ❌ FAIL - BUG-02 |
| TC-P-02 | Klient zalogowany na swoje konto KIS List | komentarz na udostępnionej liście | Piotr, Anna, Marcin, Michalina | nikt | ❌ FAIL - BUG-03 |
| TC-P-02b | Klient (bez logowania) | komentarz na udostępnionej liście | Piotr, Anna, Marcin, Michalina | Piotr | ❌ FAIL - BUG-02 |
| TC-P-03 | Piotr | komentarz prywatny do produktu | Anna, Marcin, Michalina | nikt | ❌ FAIL - BUG-01 |
| TC-P-04 | Anna | komentarz prywatny do produktu | Piotr, Marcin, Michalina | nikt | ❌ FAIL - BUG-01 |
| TC-P-05 | Marcin | komentarz prywatny do produktu | Piotr, Anna, Michalina | nikt | ❌ FAIL - BUG-01 |
| TC-P-06 | Michalina | komentarz prywatny do produktu | Piotr, Anna, Marcin | nikt | ❌ FAIL - BUG-01 |
| TC-P-07 | Marcin | komentarz prywatny z oznaczeniem @Anna | Anna (oznaczenie) + Piotr, Michalina (R3) | Anna | ⚠️ oznaczenie działa, R3 nie - BUG-01 |
| TC-P-08 | Anna | komentarz w zakładce "Komentarze klienta" | Piotr, Marcin, Michalina | nikt | ❌ FAIL - BUG-01 |
| TC-P-09 | Anna | odpowiedź na komentarz klienta (wątek klienta) | Piotr, Marcin, Michalina | nikt | ❌ FAIL - BUG-01 |
| TC-P-10 | Anna | odpowiedź w prywatnym wątku Marcina | Marcin (odpowiedź) + Piotr, Michalina (R3) | Marcin | ⚠️ odpowiedź działa, R3 nie - BUG-01 |

Typy powiadomień zaobserwowane w API: `list_item_comment_mention` (oznaczenie), `list_item_comment_reply` (odpowiedź),
`new_proposal_comment` i `new_live_proposal_comment` (komentarz klienta - tylko u właściciela listy).
Nie pojawiło się żadne powiadomienie typu "członek zespołu dodał komentarz".

## Kanał e-mail

Wszystkie konta to aliasy jednej skrzynki Gmail. Sprawdzone o 14:33, czyli około 30-45 minut po wykonaniu przypadków.

| Przypadek | Wysłany mail | Odbiorca | Wynik |
|---|---|---|---|
| TC-P-07 - oznaczenie @Anna (13:52) | 14:00, zbiorczy "Powiadomienia w KIS List:" - "1 Oznaczenia Ciebie w komentarzu do listy" | +anna.zespol | ✅ (mail zbiorczy, ok. 8 min później) |
| TC-P-02b - klient komentuje udostępnioną listę (14:01) | 14:01, "Klient zaktualizował(a) Twój projekt w KIS List" | **+klient - sam klient** | ❌ BUG-06 |
| TC-P-01 - klient komentuje propozycję (14:04) | brak | - | ❌ |
| TC-P-02 - klient zalogowany komentuje udostępnioną listę | brak | - | ❌ (jak BUG-03) |
| TC-P-03...06, 08, 09 - komentarze zespołu | brak | - | ❌ (spójne z BUG-01) |
| TC-P-10 - odpowiedź w wątku Marcina (14:05) | brak do chwili sprawdzenia | - | ℹ️ może trafić do kolejnego maila zbiorczego |

Piotr (właściciel) nie dostał żadnego maila o komentarzach klienta, choć w aplikacji ma oba powiadomienia.

## Scenariusze negatywne

| ID | Sytuacja | Oczekiwany wynik | Faktyczny wynik | Wynik |
|---|---|---|---|---|
| TC-N-01 | Autor dodaje komentarz (TC-P-03...06) | autor nie dostaje powiadomienia o własnym komentarzu | brak powiadomienia u autora | ✅ PASS |
| TC-N-02 | Wewnętrzne komentarze zespołu (TC-P-03...07) | klient nie dostaje powiadomienia (w aplikacji ani mailem) | Klient: 0 powiadomień, brak maili | ✅ PASS |
| TC-N-02b | Komentarz klienta (TC-P-02b) | klient nie dostaje powiadomienia o własnym komentarzu | klient dostał mail "Klient zaktualizował(a) Twój projekt" | ❌ FAIL - BUG-06 |
| TC-N-03 | Oznaczenie @Anna (TC-P-07) | Anna dostaje dokładnie jedno powiadomienie, bez duplikatów | 1 powiadomienie | ✅ PASS |
| TC-N-04 | Oznaczenie @Anna (TC-P-07) | pozostałe osoby nie dostają powiadomienia "oznaczył/a Ciebie" | brak u Piotra, Marcina, Michaliny | ✅ PASS |
| TC-N-05 | Użytkownik spoza zespołu (konto niepowiązane z listą) | brak dostępu do listy i brak powiadomień | - | ⏸ nie wykonano¹ |
| TC-N-06 | Edycja istniejącego komentarza | brak zduplikowanego powiadomienia | - | ⏸ nie wykonano¹ |
| TC-N-07 | Komentarz na innej liście | brak powiadomienia u osób powiązanych tylko z listą testową | - | ⏸ nie wykonano¹ |

¹ Świadomie odłożone. Przy braku powiadomień "pozytywnych" dla członków zespołu (BUG-01) te przypadki nie dałyby wiarygodnego wyniku:
brak powiadomienia byłby spodziewany niezależnie od tego, czy reguła negatywna działa. Warto je wykonać po poprawce BUG-01.

## Obserwacje dodatkowe

- Na liście podpowiedzi po wpisaniu "@" autor widzi także siebie (Marcin może oznaczyć Marcina).
- Okno komentarzy otwiera się domyślnie na zakładce "Komentarze klienta", jeśli produkt ma komentarze klienta. Łatwo wtedy przez pomyłkę napisać do klienta zamiast do zespołu (przycisk zmienia się na "Wyślij do klienta", co trochę pomaga).

## Dowody

Zrzuty `/inbox` każdego członka zespołu po wykonaniu przypadków: [`evidence/`](evidence).

- `inbox-piotr.png` - 2 powiadomienia "Klient/ka dodał/a komentarz" (TC-P-01, TC-P-02b), brak powiadomień od zespołu.
- `inbox-anna.png` - tylko "Marcin oznaczył/a Ciebie w komentarzu" (TC-P-07).
- `inbox-marcin.png` - tylko odpowiedź Anny w jego wątku (TC-P-10).
- `inbox-michalina.png` - pusto, mimo 8 komentarzy zespołu i 3 komentarzy klienta na liście.
