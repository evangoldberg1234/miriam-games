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

## Treasure Map and stars

Treasure Map (`level-test/`) finds a level in math, verbal, English, Hebrew, Russian, and Parsha, then seeds Brain Breaks and saves those levels on the star server when it is reachable. Miriam starts at the upper end of 1st grade. After that, the staircase adapts. Practice (`practice/`) asks more questions at that level. A right answer can earn one star, up to 100 a day, when the star server accepts it. Asking Mirlil for a new game costs 20 stars, and that charge happens in the chat. The shared pieces are `questions/`, `level-test/`, `practice/`, and `stars/`. Book Club (`books/`) lets her log a finished book. The quiz happens in the chat. A long book can earn 20 stars. Homework (`homework/`) checks a photo of one worksheet. The check can take about a minute. A sheet can earn up to 10 stars, and homework stars stop at 20 for the day. Homework stays off in `settings.js` until that backend is deployed.

Treasure Map and Practice still run if the backend is unreachable or `functionsUrl` is empty. Stars, Book Club, and Homework then stay on a friendly screen (the server is napping, or the feature needs the server) instead of breaking the page.

## Brain Breaks

Brain Breaks are a short set of questions at the end of every level, instead of an ad. There is no timer. The module lives in `brain-break/` and is copied unchanged from `joyce-games` (keep the two copies in sync). See `brain-break/README.md` for the full game-author notes. The home page does not trigger breaks.

From a game folder one level down from the site root:

```html
<link rel="stylesheet" href="../brain-break/brain-break.css">
<script src="../settings.js"></script>
<script src="../brain-break/brain-break.js"></script>
```

Load `settings.js` before the shared modules. At the end of every level, on a win and on a loss, call `levelEnd` and wait. Go to the next level after a win. Retry the same level after a loss.

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
node questions/validate.js
node level-test/test.js
node tests/client-safety.test.js
```

## Chat with Mirlil

`chat/` is a floating chat bubble that lets Miriam message Mirlil, her Grok Bot. `settings.js` builds `window.KIDS_CHAT` (kid `miriam`, rainbow theme, and the functions address). The home page loads that file first:

```html
<script src="settings.js"></script>
<script src="chat/chat.js" defer></script>
```

While `functionsUrl` is empty, the bubble stays hidden and the games still play. Once the Supabase backend is deployed, `settings.js` points it at `https://<project-ref>.supabase.co/functions/v1`. No keys or passcodes go in the page: Miriam types the family code once, and the iPad keeps a signed token that expires.

## Safety rules

Stars and prices are enforced on the server only. The site can show a balance the server sent. It cannot grant stars. Editing `settings.js` or the data saved on the iPad cannot create stars. The chat cannot change settings. Only a parent can change settings, by editing `settings.js`.

## Set this up for your own kids

You can make a copy of Miriam's site for your own child.

1. On GitHub, open this project and click **Fork**. That makes your own copy.
2. Delete the `CNAME` file, or replace what is inside it with your own web address. That file points at Miriam's website. A fork should remove it, or use its own domain.
3. Open `settings.js`. Change the name, age, grade, subjects, and languages. That is the only file that is different for each child. Leave the game folders as they are.
4. Turn on GitHub Pages. Go to **Settings**, then **Pages**, then **Deploy from a branch**. Choose branch `main` and the `/` (root) folder.

Your site will show up at `https://<username>.github.io/<repo>/`.

Chat and stars are optional. The games work fine without them. A backend can be self-hosted later if you want chat and stars. See [BACKEND.md](BACKEND.md). This project does not include any passwords or secret keys.
