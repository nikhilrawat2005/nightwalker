/**
 * Novel content bridge.
 * Maps novel id to its chapter blocks strictly for the Novel page.
 * Blog stories ("म्यूर पहाड़") stay exclusively in the Blog section.
 */
(function () {
  function buildContent() {
    var map = {};
    if (window.NOVEL && window.NOVEL.chapters) {
      map.skills = window.NOVEL.chapters;
    }
    window.NOVEL_CONTENT = map;
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", buildContent);
  } else {
    buildContent();
  }
})();
