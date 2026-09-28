# Book Club

A child types a book she has read. If it is long enough, she tells the bot about it in the chat, and that chat is the quiz. This page does not ask quiz questions. Copy this folder onto another site and set `window.KIDS_CHAT` before the scripts. Load `chat/chat.js` on the same page so the bubble is there. Do not edit `chat.js`.

The chat button clicks `.kc-fab`.

## Calls

All requests live in `client.js`.

`POST ${functionsUrl}/kid-books` with `token` and `kid`.

- `lookup` `{ title, author? }` → up to 5 Open Library results `{ work_id, title, author, cover_url, pages, pages_source }`. The page shows those cards, then "None of these". A missing cover gets a placeholder. HTTP 502 `library_unavailable` shows the server `message`. HTTP 429 `slow_down` (more than 30 lookups in 10 minutes) shows that message and `retry_after` when the server sends it.
- `start` `{ work_id }` only. The page never sends a page count. The server replies with `status` and a kid-friendly `message`. The page shows that message, reads it aloud, and puts an icon next to it.
  - `check` and `pages_unknown` — the server message, then "Open the chat bubble 💬 to answer some questions about your book!" The chat bubble opens when `KidsChat` is on the page.
  - `too_short`, `already_paid`, `in_progress`, and `tried_twice` — the server message and a matching icon. `tried_twice` means she already tried that book twice.
- `list` → "My books", with each book's status and stars.
- HTTP 400 `bad_work_id` and HTTP 404 `book_not_found` show the server message. HTTP 429 on start means more than 20 books in an hour. Token errors match the star ledger: 401 locked, 403 `no_passcode_yet` or `origin_not_allowed`, 503, and 500.

Any HTTP 401 is locked: "Ask a grown-up to unlock" and a button that opens the chat bubble. A missing server or a network failure shows "Book Club is waking up...".

## Mock

`?starsmock=1` skips the server. Lookup returns pretend books and the page shows five. Dear Zoo is too short, Frog and Toad is already in progress, Matilda is already paid, and Peter Rabbit was tried twice. The Boxcar Children has no page count (`start` with work id `box`).

```javascript
KidBooks.lookup("Charlotte's Web", "E. B. White")
KidBooks.start("cw")
KidBooks.list()
```
