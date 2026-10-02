/* Pins every page to the visible viewport.
   100vh is stuck on some phones and foldables: it keeps the tall
   unfolded height, so the bottom bars sit below the screen.
   --app-h tracks the visual viewport and updates on resize,
   rotation, and fold or unfold. */
(function () {
  var root = document.documentElement;
  var scheduled = false;

  function readBox() {
    var vv = window.visualViewport;
    var h = vv && vv.height ? vv.height : window.innerHeight;
    var w = vv && vv.width ? vv.width : window.innerWidth;
    var top = vv && vv.offsetTop ? vv.offsetTop : 0;
    return {
      h: Math.round(h || 0),
      w: Math.round(w || 0),
      top: Math.round(top || 0)
    };
  }

  function apply() {
    var box = readBox();
    if (box.h > 0) root.style.setProperty("--app-h", box.h + "px");
    if (box.w > 0) root.style.setProperty("--app-w", box.w + "px");
    if (!document.body) return;
    /* A non-zero offset means the browser chrome shifted the visible
       area. Move the page with it. Leave the transform off otherwise
       so position:fixed still uses the real viewport. */
    if (box.top) document.body.style.transform = "translateY(" + box.top + "px)";
    else document.body.style.transform = "";
  }

  function schedule() {
    if (scheduled) return;
    scheduled = true;
    window.requestAnimationFrame(function () {
      scheduled = false;
      apply();
    });
  }

  function scheduleLater() {
    schedule();
    window.setTimeout(schedule, 120);
    window.setTimeout(schedule, 450);
  }

  apply();
  window.addEventListener("resize", scheduleLater);
  window.addEventListener("orientationchange", scheduleLater);
  window.addEventListener("pageshow", schedule);
  document.addEventListener("visibilitychange", function () {
    if (document.visibilityState === "visible") scheduleLater();
  });
  if (window.visualViewport) {
    window.visualViewport.addEventListener("resize", schedule);
    window.visualViewport.addEventListener("scroll", schedule);
  }
  if (window.screen && window.screen.orientation && window.screen.orientation.addEventListener) {
    window.screen.orientation.addEventListener("change", scheduleLater);
  }
  if (navigator.devicePosture && navigator.devicePosture.addEventListener) {
    navigator.devicePosture.addEventListener("change", scheduleLater);
  }
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", apply);
  }
})();
