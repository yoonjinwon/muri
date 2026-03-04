/* Minimal client-side talks view toggles (no build step). */
(function () {
  function parseTalkDate(text) {
    const m = /^\s*(\d{2})\/(\d{4})\s*$/.exec(String(text || ""));
    if (!m) return 0;
    const month = Number(m[1]);
    const year = Number(m[2]);
    if (!year || !month) return 0;
    return year * 100 + month;
  }

  function sortTalksByDateDesc() {
    const ul = document.querySelector("#talks-all .talks");
    if (!ul) return;
    if (ul.dataset.sorted === "true") return;

    const items = Array.from(ul.querySelectorAll("li"));
    items.sort((a, b) => {
      const ad = parseTalkDate(a.querySelector(".talk-date")?.textContent || "");
      const bd = parseTalkDate(b.querySelector(".talk-date")?.textContent || "");
      if (ad !== bd) return bd - ad;
      const at = (a.querySelector(".talk-title")?.textContent || "").trim();
      const bt = (b.querySelector(".talk-title")?.textContent || "").trim();
      return at.localeCompare(bt);
    });

    for (const li of items) ul.appendChild(li);
    ul.dataset.sorted = "true";
  }

  function buildTalksByAuthor() {
    const source = document.querySelector("#talks-all .talks");
    const target = document.getElementById("talks-author");
    const nav = document.querySelector(".talks-nav");
    if (!source || !target) return;
    if (target.dataset.built === "true") return;

    sortTalksByDateDesc();
    const items = Array.from(source.querySelectorAll("li"));
    /** @type {Map<string, HTMLLIElement[]>} */
    const groups = new Map();

    for (const li of items) {
      const chip = li.querySelector(".talk-title .chip");
      const author = (chip ? chip.textContent : "Won")?.trim() || "Won";
      if (!groups.has(author)) groups.set(author, []);
      groups.get(author).push(li);
    }

    const preferredOrder = ["Won", "Wu", "Miljkovic", "Bucci", "Chandramowlishwaran"];
    const authors = Array.from(groups.keys()).sort((a, b) => {
      const ai = preferredOrder.indexOf(a);
      const bi = preferredOrder.indexOf(b);
      if (ai !== -1 || bi !== -1) return (ai === -1 ? 999 : ai) - (bi === -1 ? 999 : bi);
      return a.localeCompare(b);
    });

    const slug = (t) => String(t || "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");

    const html = authors
      .map((author) => {
        const id = `talk-author-${slug(author) || "other"}`;
        const lis = groups
          .get(author)
          .map((li) => li.outerHTML)
          .join("");
        return `<section class="talks-author-section" id="${id}"><h3 class="talks-author-heading">${author}</h3><ul class="talks">${lis}</ul></section>`;
      })
      .join("");

    target.innerHTML = html || '<p class="pub-empty">No talks to show.</p>';

    if (nav) {
      const links = authors
        .map((a) => `<a class="pub-nav-link" href="#talk-author-${slug(a)}">${a}</a>`)
        .join("");
      nav.innerHTML = `<div class="pub-nav-row"><span class="pub-nav-label">Author:</span>${links}</div>`;
    }

    target.dataset.built = "true";
  }

  function setTalksMode(mode) {
    const selectedView = document.getElementById("talks-recent");
    const authorView = document.getElementById("talks-author");
    const dateView = document.getElementById("talks-all");
    const nav = document.querySelector(".talks-nav");
    if (!selectedView || !authorView || !dateView) return;

    const buttons = Array.from(document.querySelectorAll(".talks-toggle"));
    for (const btn of buttons) {
      const isActive = btn.dataset.mode === mode;
      btn.classList.toggle("is-active", isActive);
      btn.setAttribute("aria-pressed", isActive ? "true" : "false");
    }

    if (mode === "author") {
      buildTalksByAuthor();
      selectedView.hidden = true;
      authorView.hidden = false;
      dateView.hidden = true;
      if (nav) nav.hidden = false;
    } else if (mode === "date") {
      sortTalksByDateDesc();
      selectedView.hidden = true;
      authorView.hidden = true;
      dateView.hidden = false;
      if (nav) nav.hidden = true;
    } else {
      authorView.hidden = true;
      dateView.hidden = true;
      selectedView.hidden = false;
      if (nav) nav.hidden = true;
    }
  }

  document.addEventListener("click", (e) => {
    const btn = e.target && e.target.closest ? e.target.closest(".talks-toggle") : null;
    if (!btn) return;
    e.preventDefault();
    setTalksMode(btn.dataset.mode || "selected");
  });

  // Default mode.
  setTalksMode("selected");
})();
