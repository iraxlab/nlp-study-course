/* NLP Study Course: a tiny static site.
   Pages are Markdown files listed in content/manifest.json. No build step. */
(function () {
  "use strict";
  var store = {
    get: function (k, d) { try { var v = localStorage.getItem(k); return v === null ? d : JSON.parse(v); } catch (e) { return d; } },
    set: function (k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} }
  };
  var $ = function (s) { return document.querySelector(s); };
  var manifest, pages = [], cache = {}, searchIndex = null;

  marked.setOptions({ gfm: true, breaks: false });

  function load(url) {
    if (cache[url]) return Promise.resolve(cache[url]);
    return fetch(url, { cache: "no-cache" }).then(function (r) {
      if (!r.ok) throw new Error(r.status + " " + url);
      return r.text();
    }).then(function (t) { cache[url] = t; return t; });
  }

  function studied() { return store.get("nlp-studied", {}); }

  function buildSidebar() {
    var done = studied(), html = "", total = 0, count = 0;
    manifest.modules.forEach(function (m) {
      html += '<div class="mod"><div class="mod-title">' + m.title + "</div>";
      m.pages.forEach(function (p) {
        total++; if (done[p.id]) count++;
        html += '<a href="#' + p.id + '" data-id="' + p.id + '" class="' + (done[p.id] ? "done" : "") + '"><span class="dot"></span><span>' + p.title + "</span></a>";
      });
      html += "</div>";
    });
    var pct = total ? Math.round(count / total * 100) : 0;
    $("#sidebar").innerHTML = '<div class="progress">Studied ' + count + " of " + total + ' pages<div class="bar"><span style="width:' + pct + '%"></span></div></div>' + html;
  }

  function markCurrent(id) {
    document.querySelectorAll(".sidebar a").forEach(function (a) { a.classList.toggle("current", a.dataset.id === id); });
    var cur = document.querySelector(".sidebar a.current");
    if (cur && cur.scrollIntoView) cur.scrollIntoView({ block: "nearest" });
  }

  function home() {
    document.title = manifest.title;
    var cards = manifest.modules.map(function (m) {
      var first = m.pages[0];
      return '<a class="card" href="#' + first.id + '"><h3>' + m.title + "</h3><p>" + m.pages.length + " page" + (m.pages.length > 1 ? "s" : "") + " · starts with " + first.title.replace(/^\d+\.\s*/, "") + "</p></a>";
    }).join("");
    $("#content").innerHTML =
      '<section class="hero"><h1>' + manifest.title + '</h1><p class="subtitle">' + manifest.subtitle + "</p>" +
      "<p>Work through the modules in order, or jump straight to a technique. Every chapter ends with a <b>Key Takeaway</b>, <b>Practice tasks</b> you can tick off, and a <b>Self-test</b> with hidden answers. Your ticks and progress are saved in this browser.</p>" +
      '<div class="legend"><span style="--c:var(--key);--b:var(--key-bg)">Key Takeaway</span><span style="--c:var(--extra);--b:var(--extra-bg)">Going deeper</span><span style="--c:var(--todo);--b:var(--todo-bg)">Practice tasks</span><span style="--c:var(--exam);--b:var(--exam-bg)">Self-test</span></div>' +
      '<div class="cards">' + cards + "</div>" +
      '<p class="subtitle" style="font-size:.9rem">These are study notes, not a substitute for supervised training. Techniques that touch trauma, depression or other mental health conditions belong with a qualified professional.</p></section>';
    $("#pager").innerHTML = "";
    markCurrent(null);
  }

  function enhance(id) {
    var root = $("#content");
    // Practice-task checkboxes, saved per page
    var key = "nlp-tasks-" + id, saved = store.get(key, {});
    root.querySelectorAll(".task input[type=checkbox]").forEach(function (cb, i) {
      cb.checked = !!saved[i];
      cb.closest(".task").classList.toggle("checked", cb.checked);
      cb.addEventListener("change", function () {
        var s = store.get(key, {}); s[i] = cb.checked; store.set(key, s);
        cb.closest(".task").classList.toggle("checked", cb.checked);
      });
    });
    // Self-test: hide answers behind a toggle
    root.querySelectorAll(".box.exam li").forEach(function (li) {
      var last = li.lastElementChild;
      if (last && last.tagName === "I" && /^\(.*\)$/.test(last.textContent.trim())) {
        var ans = last.innerHTML.trim().replace(/^\(|\)$/g, "");
        last.remove();
        var d = document.createElement("details");
        d.innerHTML = "<summary>Show answer</summary>" + ans;
        li.appendChild(d);
      }
    });
    // Headings get anchors for deep links
    root.querySelectorAll("h2,h3").forEach(function (h) {
      h.id = id + "--" + h.textContent.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
    });
    // "Mark as studied"
    var done = studied(), box = document.createElement("div");
    box.className = "studied";
    box.innerHTML = '<button type="button"></button><span>Tick this when you can explain the chapter without your notes.</span>';
    var btn = box.querySelector("button");
    function paint() { var on = !!studied()[id]; btn.textContent = on ? "✓ Studied" : "Mark as studied"; btn.classList.toggle("on", on); }
    btn.addEventListener("click", function () { var s = studied(); s[id] = !s[id]; store.set("nlp-studied", s); paint(); buildSidebar(); markCurrent(id); });
    paint(); root.appendChild(box);
  }

  function show(id, anchor) {
    var i = pages.findIndex(function (p) { return p.id === id; });
    if (i < 0) { $("#content").innerHTML = "<h1>Not found</h1><p>No page called “" + id + "”. <a href='#'>Go home</a>.</p>"; return; }
    var p = pages[i];
    $("#content").innerHTML = '<p class="loading">Loading…</p>';
    load(p.file).then(function (md) {
      $("#content").innerHTML = marked.parse(md);
      document.title = p.title + " · " + manifest.title;
      enhance(id);
      var prev = pages[i - 1], next = pages[i + 1];
      $("#pager").innerHTML =
        (prev ? '<a class="prev" href="#' + prev.id + '"><small>← Previous</small>' + prev.title + "</a>" : "") +
        (next ? '<a class="next" href="#' + next.id + '"><small>Next →</small>' + next.title + "</a>" : "");
      markCurrent(id);
      var target = anchor && document.getElementById(anchor);
      if (target) target.scrollIntoView(); else window.scrollTo(0, 0);
    }).catch(function (e) {
      $("#content").innerHTML = "<h1>Couldn't load this page</h1><p>" + e.message + "</p><p>If you opened index.html straight from your computer, run a small local server instead (see README).</p>";
    });
  }

  function route() {
    closeMenu();
    var h = decodeURIComponent(location.hash.replace(/^#\/?/, ""));
    if (!h) return home();
    var cut = h.indexOf("--");
    show(cut > 0 ? h.slice(0, cut) : h, cut > 0 ? h : null);
  }

  /* ---------- search ---------- */
  function plain(md) {
    return md.replace(/<[^>]+>/g, " ").replace(/[#*_`>|]/g, " ").replace(/&amp;/g, "&").replace(/&[a-z]+;/g, " ").replace(/\s+/g, " ").trim();
  }
  function buildIndex() {
    if (searchIndex) return Promise.resolve(searchIndex);
    return Promise.all(pages.map(function (p) {
      return load(p.file).then(function (md) {
        var sections = [], cur = { h: "", t: "" };
        md.split("\n").forEach(function (line) {
          var m = line.match(/^#{1,3}\s+(.*)/);
          if (m) { sections.push(cur); cur = { h: m[1].trim(), t: "" }; } else cur.t += " " + line;
        });
        sections.push(cur);
        return sections.filter(function (s) { return s.h || s.t.trim(); }).map(function (s) { return { page: p, h: s.h, t: plain(s.t) }; });
      }).catch(function () { return []; });
    })).then(function (all) { searchIndex = [].concat.apply([], all); return searchIndex; });
  }
  function esc(s) { return s.replace(/[&<>]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;" }[c]; }); }
  function doSearch(q) {
    var box = $("#results");
    q = q.trim();
    if (q.length < 2) { box.hidden = true; return; }
    buildIndex().then(function (idx) {
      var terms = q.toLowerCase().split(/\s+/);
      var hits = idx.map(function (s) {
        var hay = (s.h + " " + s.t).toLowerCase(), score = 0;
        for (var i = 0; i < terms.length; i++) { if (hay.indexOf(terms[i]) < 0) return null; score += (s.h.toLowerCase().indexOf(terms[i]) >= 0 ? 5 : 1); }
        if (s.page.title.toLowerCase().indexOf(terms[0]) >= 0) score += 3;
        return { s: s, score: score };
      }).filter(Boolean).sort(function (a, b) { return b.score - a.score; }).slice(0, 30);
      if (!hits.length) { box.innerHTML = '<div class="none">No matches for “' + esc(q) + "”</div>"; box.hidden = false; return; }
      var re = new RegExp("(" + terms.map(function (t) { return t.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"); }).join("|") + ")", "gi");
      box.innerHTML = hits.map(function (h) {
        var t = h.s.t, at = t.toLowerCase().indexOf(terms[0]);
        var snip = (at > 60 ? "…" : "") + t.slice(Math.max(0, at - 60), at + 120) + "…";
        var anchor = h.s.h ? "--" + h.s.h.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") : "";
        return '<a href="#' + h.s.page.id + anchor + '"><div class="r-title">' + esc(h.s.page.title) + (h.s.h && h.s.h !== h.s.page.title ? " › " + esc(h.s.h) : "") + '</div><div class="r-snip">' + esc(snip).replace(re, "<mark>$1</mark>") + "</div></a>";
      }).join("");
      box.hidden = false;
    });
  }

  /* ---------- UI wiring ---------- */
  function closeMenu() { $("#sidebar").classList.remove("open"); $("#scrim").hidden = true; }
  $("#menuBtn").addEventListener("click", function () { var o = $("#sidebar").classList.toggle("open"); $("#scrim").hidden = !o; });
  $("#scrim").addEventListener("click", closeMenu);
  $("#themeBtn").addEventListener("click", function () {
    var root = document.documentElement;
    var dark = root.dataset.theme ? root.dataset.theme === "dark" : matchMedia("(prefers-color-scheme: dark)").matches;
    root.dataset.theme = dark ? "light" : "dark"; store.set("nlp-theme-x", 1);
    try { localStorage.setItem("nlp-theme", root.dataset.theme); } catch (e) {}
  });
  var timer;
  $("#search").addEventListener("input", function (e) { clearTimeout(timer); timer = setTimeout(function () { doSearch(e.target.value); }, 150); });
  $("#search").addEventListener("keydown", function (e) {
    if (e.key === "Escape") { e.target.value = ""; $("#results").hidden = true; }
    if (e.key === "Enter") { var a = $("#results a"); if (a) { location.hash = a.getAttribute("href"); $("#results").hidden = true; } }
  });
  $("#results").addEventListener("click", function () { $("#results").hidden = true; $("#search").value = ""; });
  document.addEventListener("click", function (e) { if (!e.target.closest(".search-wrap")) $("#results").hidden = true; });
  document.addEventListener("keydown", function (e) { if (e.key === "/" && document.activeElement.tagName !== "INPUT") { e.preventDefault(); $("#search").focus(); } });
  window.addEventListener("hashchange", route);

  load("content/manifest.json").then(function (t) {
    manifest = JSON.parse(t);
    $("#brand").textContent = manifest.title;
    manifest.modules.forEach(function (m) { m.pages.forEach(function (p) { pages.push(p); }); });
    buildSidebar();
    route();
  }).catch(function (e) {
    $("#content").innerHTML = "<h1>Couldn't load the course</h1><p>" + e.message + "</p><p>Open this site through GitHub Pages or a local server (see README), not by double-clicking index.html.</p>";
  });
})();
