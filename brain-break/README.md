# Brain Breaks

A full-screen pause of about three questions at the end of a level. There is no timer. This folder is self-contained: copy it into a site and call one function. Site-specific names stay in the game, not in here.

## Add it to a game

From a page one folder down from the site root:

```html
<link rel="stylesheet" href="../brain-break/brain-break.css">
<script src="../brain-break/brain-break.js"></script>
```

`brain-break.js` loads the question files next to itself, so a `file://` page works.

## When a level ends

Call this on a win and on a loss, then wait. Go to the next level after a win. Retry the same level after a loss.

```javascript
JoyceBrainBreaks.levelEnd({ won: true, level: levelNumber }).then(function () {
  startNextLevel();
});

JoyceBrainBreaks.levelEnd({ won: false, level: levelNumber }).then(function () {
  retryLevel();
});
```

- `won` is `true` when the child beat the level and `false` when the level ended in a miss, a life lost, giving up, or a restart.
- `level` is the 1-based game level she just finished. A higher level makes that break's questions a little harder: the nudge is `min(3, floor((level - 1) / 2))`, added to the saved subject level and capped at that subject's max. The nudge is not written to storage.
- The promise resolves when she taps **Keep playing**.
- If a break is already on screen, you get that same promise. Do not start the next level until it resolves.
- Do not call it when she opens a level, opens a menu, or asks for a hint. Only when the level is actually over.

## Saved difficulty

Joyce and Miriam each have a math, word-problem, word-match, and Torah-portion level in `localStorage` under `joyce-brain-breaks`. A correct answer steps that subject up (faster until she is placed, then one step after a streak of three). A miss steps it down gently. Only a first-try answer counts. She can switch players on the break; the question on screen stays, and later questions rebuild for the new child.

## Seeding from a level test

A level quest can write starting levels after it measures the child. Call this once the results are in. It marks those subjects as placed, so the next answers adapt gently from the new level instead of jumping through the early placement steps.

```javascript
JoyceBrainBreaks.seedFromLevelTest({
  kid: window.KIDS_CHAT.kid,
  levels: { math: 6, verbal: 5, english: 4, hebrew: 7, russian: 3, parsha: 8 }
}).then(function (saved) {
  console.log(saved.plan);
});
```

The `levels` numbers are quest levels from 1 to 10. They map onto this module's own caps:

| Quest subject | Brain Break subject |
| --- | --- |
| math | math (max 12) |
| verbal | words (max 8) |
| english, hebrew, and russian | translate (max 4). If more than one language was tested, their average is used. |
| parsha | parsha (max 3) |

`kid` must be `joyce` or `miriam`, matching the saved player slots. The storage key stays `joyce-brain-breaks`.

```bash
node brain-break/test.js
```
