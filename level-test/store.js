/* Saved quest progress. Keyed by the kid id in window.KIDS_CHAT so a
   copied site keeps each child's map separate. */
(function () {
  function kid() {
    var cfg = window.KIDS_CHAT || {};
    return cfg.kid || "kid";
  }

  function key() {
    return "level-test." + kid();
  }

  function empty() {
    return { results: {}, practice: {}, progress: null };
  }

  function load() {
    var data = empty();
    try {
      var saved = JSON.parse(localStorage.getItem(key()) || "null");
      if (!saved || typeof saved !== "object") return data;
      data.results = saved.results || {};
      data.practice = saved.practice || {};
      data.progress = saved.progress || null;
      return data;
    } catch (err) {
      return data;
    }
  }

  function save(data) {
    try {
      localStorage.setItem(key(), JSON.stringify(data));
    } catch (err) {
      /* Private mode can block storage. The quest still runs. */
    }
  }

  window.LevelStore = { load: load, save: save, key: key };
})();
