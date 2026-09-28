# A backend is optional

The games, Brain Breaks, Treasure Map, and Practice all work with no server. Levels stay on the iPad.

Chat, stars, homework photos, and Book Club need a backend. To run without one, open `settings.js` and set `functionsUrl` to `''` (empty quotes). The chat bubble, star counter, Homework tile, and Book Club stay hidden. Treasure Map and Practice still load and work on the iPad.

A family can self-host a backend later and paste its address into `functionsUrl`. This page has no passwords, keys, or private setup steps.
