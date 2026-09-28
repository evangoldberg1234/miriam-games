# Practice

Extra questions for stars. The child picks a subject and gets items at her saved level. A correct answer steps that level up one. A wrong answer steps it down one. The practice level starts from the treasure-map result when there is one, otherwise from 5. It is stored in the same `level-test.<kid>` record, under `practice`, and does not erase the quest result.

Each correct answer calls `KidsStars.earn({ subject, level, qid })`. `subject` is `math`, `verbal`, `english`, `hebrew`, `russian`, or `parsha`. That is worth 1 star when the server accepts it.

- No token, or any 401: the page says to ask a grown-up to unlock stars and points at the chat bubble. Questions still work.
- If two earns are less than 2 seconds apart, the client retries once. If it is still too fast, that answer is not counted.
- At the daily cap (100), the page says "You've earned all your stars for today!" Questions still work.
- If the star endpoint is missing or the network fails: "Stars are waking up..." Questions still work, and no star is counted on this device.
- The balance is not stored as the source of truth. The star bubble only shows the last number the server (or mock mode) returned.
- If this iPad has no quest levels yet, levels saved on the server are used.

Add `?starsmock=1` to try it with an in-memory balance that starts at 20.

Load `window.KIDS_CHAT` before `stars/stars.js`. Copy this folder with `questions/`, `level-test/store.js`, and `stars/`.
