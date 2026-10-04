/* Fisher-Yates used for every choice list. Pass a rng to share a
   sequence with the question picker; otherwise this uses Math.random. */
(function (root) {
  function shuffle(list, rng) {
    rng = rng || Math.random;
    var arr = list.slice();
    var i;
    for (i = arr.length - 1; i > 0; i--) {
      var j = Math.floor(rng() * (i + 1));
      var tmp = arr[i];
      arr[i] = arr[j];
      arr[j] = tmp;
    }
    return arr;
  }

  root.QShuffle = shuffle;
  if (typeof module !== "undefined" && module.exports) module.exports = shuffle;
})(typeof globalThis !== "undefined" ? globalThis : this);
