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

Brain Breaks are the shared pause between play: a few questions instead of an ad. The module lives in `brain-break/` and is copied unchanged from `joyce-games` (keep the two copies in sync). Every game should use it, about every 90 seconds of active play and between levels. The home page does not trigger breaks.

From a game folder one level down from the site root:

```html
<link rel="stylesheet" href="../brain-break/brain-break.css">
<script src="../brain-break/brain-break.js"></script>
```

Then start it when the game starts. `isPaused` should be true on menus, how-to screens, and win screens, so the timer only counts active play. Call `betweenLevels()` after a level is solved and before the next one starts.

```javascript
var breaks = JoyceBrainBreaks.attach({
  isPaused: function () {
    return howtoOpen || justSolved || screen !== "play";
  }
});

breaks.betweenLevels().then(startNextLevel);
```

(The global is named `JoyceBrainBreaks` because the module is shared with Joyce's site; Miriam and Joyce each have their own saved levels and can switch players on the break screen.)

For testing, add `?bbtest=10` to a game URL for a 10 second timer.

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
