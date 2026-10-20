/**
 * Novel content bridge.
 * Maps each novel id (from window.NOVELS) to its chapter blocks so the
 * Novel Library / Chapter Index / Reader can be driven from one place.
 *
 * - "skills"  -> window.NOVEL.chapters           (js/chapters.js)
 * - "myar-pahad" -> derived from window.POSTS[0]  (js/posts.js)
 *
 * Must be loaded AFTER js/chapters.js and js/posts.js.
 */
(function () {
  function splitPostIntoChapters(post, shape) {
    if (!post || !post.body || !post.body.length) return [];

    var parts = [];
    var per = Math.ceil(post.body.length / shape.length);
    shape.forEach(function (meta, i) {
      parts.push({
        n: meta.n,
        label: meta.label,
        title: meta.title,
        sub: meta.sub,
        blocks: post.body.slice(i * per, (i + 1) * per)
      });
    });
    return parts;
  }

  function buildContent() {
    var map = {};

    if (window.NOVEL && window.NOVEL.chapters) {
      map.skills = window.NOVEL.chapters;
    }

    if (window.POSTS && window.POSTS.length) {
      var myar = window.POSTS[0];
      var shape = [];
      if (window.NOVELS) {
        var meta = window.NOVELS.filter(function (b) { return b.id === "myar-pahad"; })[0];
        if (meta && meta.chapters) shape = meta.chapters;
      }
      map["myar-pahad"] = splitPostIntoChapters(myar, shape);
    }

    window.NOVEL_CONTENT = map;
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", buildContent);
  } else {
    buildContent();
  }
})();
