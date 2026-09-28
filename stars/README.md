# Stars

The star balance lives on the kids-chat server. This file sends the ledger calls and paints `#starbar` when that element is on the page. A daily-cap note is added beside it.

Read `kid` and `functionsUrl` from `window.KIDS_CHAT`. The device token is the one chat stores after the family code, at `localStorage` key `kidsChat.<kid>.token`. It is sent as `token` in the JSON body. `kid` is sent too. The token is what identifies the child. Do not put a passcode or a key in the page.

After a balance, earn, or spend response that includes `balance`, this file calls `KidsChat.setStars(balance)` when that hook exists. It also listens for `kidschat:stars` and paints `#starbar`. A renewed `token` on a successful response is saved at `kidsChat.<kid>.token`.

## Calls

`POST ${functionsUrl}/kid-stars`

- `{ token, kid, action: "balance" }` → `{ ok: true, kid, balance, earned_today, daily_cap }`. The cap is 100 stars a day. When `earned_today` has reached `daily_cap`, the page says "You've earned all your stars for today!"
- `{ token, kid, action: "earn", subject, question_id, qid, answer, level }` → `{ ok, balance, earned: 1, earned_today }`. `subject` is one of `math`, `verbal`, `english`, `hebrew`, `russian`, `parsha`. `question_id` and `qid` name the question. `answer` is what she picked. `level` is that question's difficulty, 1–10. The client does not send a star amount. The server decides `earned`.
- HTTP 429 `slow_down` includes `retry_after` seconds. This client retries that earn once after that pause (2 seconds when the field is missing). If it is still too fast, that answer is not counted and the question continues.
- HTTP 429 `daily_cap` shows the same daily-cap sentence. Practice keeps going.
- `{ token, kid, action: "spend", reason: "hint", item: "<game id>" }` costs 5 and returns `{ ok: true, balance }`, or HTTP 402 `{ ok: false, error: "not_enough_stars", cost, need, balance, message }`. Show `message` as the server wrote it.
- This client never sends `reason: "game"`. A new game costs 20 stars. The home page can call `KidsChat.requestGame`, and the server charges it in the chat.
- HTTP 401 `locked`, `bad_token`, and `token_expired` all mean locked.
- HTTP 403 `no_passcode_yet` says "Ask a grown-up to set up stars". HTTP 500 `server_error` says "Stars are napping, try again soon". HTTP 403 `origin_not_allowed` and HTTP 503 `not_configured` use the waking-up line.
- HTTP 409 is returned to the caller with the server's `error` and `message`. Homework uses that for `duplicate` and `near_duplicate`.

`KidsStars.postJson(path, body)` posts somewhere other than `/kid-stars`, including `/kid-homework`. It adds `token` and `kid`, saves a renewed token, and uses this same error map. It does not paint the star bar. The caller passes `balance` to `KidsStars.applyStars` when it is time to move the counter and call `KidsChat.setStars`.

`{ token, kid, action: "get_levels" }` → `{ ok, levels: { subject: level } }`.

`{ token, kid, action: "set_levels", levels: { subject: 1..10 } }` saves quest levels. Failures are ignored. The `localStorage` copy stays.

With no token, or on 401, show "Ask a grown-up to unlock stars" and point to the chat bubble. If the endpoint is missing (404) or the network fails, show "Stars are waking up..." and let practice continue without counting. The counter shows a balance only after the server sends one, or after the chat reports `kidschat:stars`. Nothing is saved as a balance the child can edit.

## Levels

On a quest or practice page, if this iPad has no saved quest levels and the server does, those server levels are copied into `level-test.<kid>`. If this iPad already has levels, they stay. After a subject finishes, the page calls `set_levels` with the saved levels.

## Mock

`?starsmock=1` keeps an in-memory balance that starts at 20, with `earned_today` and `daily_cap: 100`. It does not call the server, and it does not replace the saved device token. Use it to try earning, a hint, and the not-enough-stars message.

```javascript
KidsStars.balance()
KidsStars.earn({ subject: "math", level: 5, qid: "math-5-2+3" })
KidsStars.spend({ reason: "hint", item: "animal-puzzle" })
KidsStars.setLevels({ math: 6, parsha: 4 })
KidsStars.syncLevels()
```
