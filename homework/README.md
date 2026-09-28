# Homework photo check

A child photographs one worksheet. The page shrinks the picture, uploads it, and polls until the check is done. A wrong problem shows a hint, never an answer. The server decides the stars. This page only shows `stars_earned` and `balance`.

Copy this `homework/` folder onto another child's site unchanged. It reads `kid` and `functionsUrl` from `window.KIDS_CHAT`. The device token is the one chat stores at `localStorage` key `kidsChat.<kid>.token`.

The page needs a `#starbar` element. Stars fly into it. Load `stars/stars.js` before `client.js`. Network calls go through `KidsStars.postJson`, which sends `token` and `kid`, saves a renewed token, and maps the same errors as the star ledger.

## Photo

The long side is at most 1600 pixels. The JPEG stays under 2MB. It is drawn through `createImageBitmap` (or an `Image`) so EXIF rotation is kept. `image_base64` is raw base64, without a `data:` prefix.

## Calls

`POST ${functionsUrl}/kid-homework`

`{ token, kid, action: "upload", image_base64, resubmit_of? }`

Returns `{ ok, sheet_id, status: "checking" }`. HTTP 409 `duplicate` is the same photo. HTTP 409 `near_duplicate` is an almost-identical photo. Both say "I already checked this one! Fix a problem, then take a new photo." A fix sends `resubmit_of` set to the earlier `sheet_id`. The upload does not send `sheet_id`.

`{ token, kid, action: "status", sheet_id }`

Returns `{ status: "checking"|"checked"|"retake"|"not_homework", problems: [{ n, correct, hint }], message, stars_earned, balance, sheet_stars_total, sheet_cap, daily_remaining, reason }`. A finished check includes `sheet_stars_total`, `sheet_cap` (10), and `daily_remaining`. A retake includes `reason`. The page polls every 5 seconds while it is open. A check usually takes about a minute. The checking screen rotates encouraging lines, including "Looking at problem 1…" and "Sharpening my pencil…", and says "You can also chat with me about it 💬".

The pending `sheet_id` is stored at `kidsHomework.<kid>.pending`. Coming back to Homework resumes polling. After about 5 minutes the page says "Still checking — I'll tell you in the chat bubble too!" and offers a way home. Polling continues if she stays.

`{ token, kid, action: "list" }`

Returns `{ ok, sheets: [{ date, status, score, stars }] }`. The Homework screen shows "My homework" with the date, score, stars, and a status icon.

When `message` is present, that sentence is shown and read aloud. When `sheet_stars_total` is at least `sheet_cap`, the page adds "That's the most stars for one sheet (10) — amazing work!" When `daily_remaining` is 0, it adds "You've earned all 20 homework stars today! Your answers are still checked." A retake shows `reason`, or the default retake sentence when `reason` is absent. Upload still sends `image_base64` and `resubmit_of`. The page does not add up stars itself. After the result it calls `KidsChat.setStars(balance)` when that hook exists.

Other errors match the star ledger: HTTP 401 `locked`, `bad_token`, and `token_expired` mean locked. HTTP 403 `no_passcode_yet` or `origin_not_allowed`. HTTP 429 `slow_down` (one retry after `retry_after`) or `daily_cap`. HTTP 503 `not_configured`. HTTP 500 `server_error`. Anything else, including a photo the server rejects as too large, uses the generic waking-up line.

## Mock

Open `homework/index.html?starsmock=1`. Each photo cycles through checked, retake, duplicate, not homework, the daily cap, and a long checking wait. That preview stays on this iPad and does not call the server or change a real star balance.

Mock status stays `checking` for about 6 seconds, then returns the result. `slow` stays on checking and shows the long-wait line quickly, so that screen can be screenshotted. Nothing is uploaded.
