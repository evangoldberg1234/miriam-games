# Question bank

Shared questions for the level quest and for practice. Copy this folder unchanged. The host page sets `window.KIDS_CHAT` and the colors through CSS variables (`--sky-deep`, `--ink`, `--line`, `--sun`). Nothing in here names a particular child.

## Files

- `math.js` builds arithmetic for levels 1–10. Each item keeps a `spec` so the answer can be recomputed.
- `verbal.js`, `english.js`, `hebrew.js`, `russian.js`, and `parsha.js` are checked multiple-choice banks. Every level has at least 6 items.
- `bank.js` picks an item for a subject and level.
- `ask.js` and `ask.css` draw the question. Hebrew text is `dir="rtl"` and `lang="he"`, with a font stack that can show nikud on iOS. A Hear it button appears only when `speechSynthesis` has a voice for that language (`he-IL`, `ru-RU`, or `en-US`).
- Russian uses Cyrillic and the letter ё where it belongs. There are no stress marks.

## Check

```bash
node questions/validate.js
```

The checker requires unique ids, the answer to be one of the choices, no duplicate choices, six items at each level, Hebrew letters (and nikud from level 2 up), and Cyrillic without stress marks. Math answers are solved again from the stored operation.

Parsha dates for Sukkot 5787 follow the Hebcal diaspora calendar: the holiday begins on the evening of September 25, 2026, Hoshana Rabbah is October 2, Shemini Atzeret is October 3, and Simchat Torah is October 4.
