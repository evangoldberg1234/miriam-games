# Miriam's Rainbow Arcade

A small static site of games for Miriam. GitHub Pages serves this folder from the project root, so the pages are plain HTML, CSS, and JavaScript with relative links. No build step.

Open `index.html` and tap a game. On the iPad, use Safari's Share button, then "Add to Home Screen" for a full-screen app icon.

## Add a game

1. Make a new folder with its own `index.html` (for example `color-match/index.html`).
2. Add one object to the list in `games.js`:

```javascript
const MIRIAM_GAMES = [
  {
    title: "Color Match",
    emoji: "🎨",
    about: "Tap the color that matches!",
    href: "color-match/index.html",
    color: "red" // red, orange, yellow, green, blue, indigo, or violet
  }
];
```

While the list is empty, the home page shows a "Games coming soon!" card.

## Brain Breaks

Brain Breaks are a short set of questions at the end of every level, instead of an ad. There is no timer. The module lives in `brain-break/` and is copied unchanged from `joyce-games` (keep the two copies in sync). See `brain-break/README.md` for the full game-author notes. The home page does not trigger breaks.

From a game folder one level down from the site root:

```html
<link rel="stylesheet" href="../brain-break/brain-break.css">
<script src="../brain-break/brain-break.js"></script>
```

At the end of every level, on a win and on a loss, call `levelEnd` and wait. Go to the next level after a win. Retry the same level after a loss.

```javascript
JoyceBrainBreaks.levelEnd({ won: true, level: levelNumber }).then(function () {
  startNextLevel();
});

JoyceBrainBreaks.levelEnd({ won: false, level: levelNumber }).then(function () {
  retryLevel();
});
```

`won` is `true` when she beat the level and `false` when the level ended in a miss, a life lost, giving up, or a restart. `level` is the 1-based game level she just finished. A higher level nudges that break's questions a little harder; the nudge is not saved. The promise resolves when she taps Keep playing. If a break is already on screen, you get that same promise. Do not start the next level until it resolves. Do not call it when she opens a level, opens a menu, or asks for a hint. Only when the level is actually over.

(The global is named `JoyceBrainBreaks` because the module is shared with Joyce's site. Miriam and Joyce each have their own saved levels for math, word problems, word match, and the weekly Torah portion, and they can switch players on the break screen.)

```bash
node brain-break/test.js
```

## Chat with Mirlil

`chat/` is a floating chat bubble (from `kids-chat`) that lets Miriam message Mirlil, her Grok Bot. It is set up at the bottom of `index.html`:

```html
<script>
  window.KIDS_CHAT = { kid: "miriam", kidName: "Miriam", botName: "Mirlil", botEmoji: "🦄", theme: "rainbow", functionsUrl: "" };
</script>
<script src="chat/chat.js" defer></script>
```

While `functionsUrl` is empty, the bubble shows "Chat is sleeping". Once the Supabase backend is deployed, set it to `https://<project-ref>.supabase.co/functions/v1`. No keys or passcodes go in the page: Miriam types the family code once, and the iPad keeps a signed token that expires.
