"use strict";
/**
 * Serategna MVP — Phase 1 application logic.
 * Vanilla JS, no build step. Data lives in data.js; user state in localStorage.
 */

(function () {
  // ---------- State ----------

  const STORAGE_KEY = "serategna-mvp";

  function loadState() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY)) || {};
    } catch (err) {
      return {};
    }
  }

  const state = Object.assign(
    { role: null, name: "", phone: "", myJobs: [] },
    loadState()
  );

  function saveState() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (err) {
      /* private mode etc. — the demo still works, it just won't persist */
    }
  }

  const workerFilter = { query: "", category: "all" };
  let activeTab = "home";

  // ---------- Helpers ----------

  function esc(text) {
    return String(text)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function initials(name) {
    return name
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0].toUpperCase())
      .join("");
  }

  function catById(id) {
    return CATEGORIES.find((c) => c.id === id);
  }

  function soonById(id) {
    return SOON_FEATURES.find((f) => f.id === id);
  }

  function avatarHtml(name, color, extra) {
    return (
      `<span class="avatar ${extra || ""}" style="background:${esc(color || "#1a7a4a")}">` +
      esc(initials(name || "?")) +
      "</span>"
    );
  }

  const soonPill = '<span class="soon-pill">Soon</span>';

  // ---------- Rendering: Home ----------

  function renderHome() {
    const view = document.getElementById("view-home");
    const who = state.name ? `, ${esc(state.name.split(/\s+/)[0])}` : "";
    const topWorkers = WORKERS.slice()
      .sort((a, b) => b.rating - a.rating)
      .slice(0, 6);

    view.innerHTML = `
      <div class="greeting">
        <h2>Selam${who} 👋</h2>
        <p>Find trusted workers near you, or post a job in under a minute.</p>
      </div>

      <form class="search-row" data-action="home-search">
        <input type="search" name="q" placeholder="Search workers or skills…" aria-label="Search workers" />
        <button type="submit">Search</button>
      </form>

      <div>
        <div class="section-title"><h2>Categories</h2></div>
        <div class="category-grid" style="margin-top:0.6rem">
          ${CATEGORIES.map(
            (c) => `
            <button class="category-tile" data-action="category" data-id="${c.id}" type="button">
              <span class="icon">${c.icon}</span>
              <span>${esc(c.label)}</span>
              <span class="am">${esc(c.amharic)}</span>
            </button>`
          ).join("")}
        </div>
      </div>

      <div>
        <div class="section-title">
          <h2>Top rated workers</h2>
          <button class="hint" data-action="tab" data-id="workers" type="button"
                  style="background:none;border:none;cursor:pointer;color:var(--green);font-weight:600;font-size:0.8rem">
            See all →
          </button>
        </div>
        <div class="h-scroll" style="margin-top:0.6rem">
          ${topWorkers.map(
            (w) => `
            <button class="worker-mini" data-action="worker" data-id="${w.id}" type="button">
              ${avatarHtml(w.name, w.color)}
              <span class="name">${esc(w.name)}</span>
              <span class="meta">${esc(catById(w.category).label)} · ${esc(w.city)}</span>
              <span class="rating">⭐ ${w.rating}${w.verified ? ' <span class="verified">✔</span>' : ""}</span>
            </button>`
          ).join("")}
        </div>
      </div>

      <div class="card">
        <div class="section-title">
          <h2>Coming soon</h2>
          <span class="hint">the full picture</span>
        </div>
        <div class="soon-list" style="margin-top:0.4rem">
          ${SOON_FEATURES.map(
            (f) => `
            <button class="soon-row" data-action="soon" data-id="${f.id}" type="button">
              <span class="icon">${f.icon}</span>
              <span class="label">${esc(f.label)}</span>
              ${soonPill}
            </button>`
          ).join("")}
        </div>
      </div>
    `;
  }

  // ---------- Rendering: Jobs ----------

  function jobCard(job, mine) {
    const cat = catById(job.category);
    return `
      <div class="card job-card">
        <h3>${esc(job.title)} ${mine ? '<span class="mine-badge">Posted by you</span>' : ""}</h3>
        <div class="meta">
          ${cat ? cat.icon + " " + esc(cat.label) : ""} · 📍 ${esc(job.location)}
          · 💰 ${esc(job.budget)} · ${esc(job.posted)}
        </div>
        <div class="desc">${esc(job.description)}</div>
        <div class="job-actions">
          <a class="btn btn-primary" href="tel:${esc(job.phone)}">📞 Call</a>
          <button class="btn" data-action="soon" data-id="chat" type="button">💬 Apply in app ${soonPill}</button>
          ${mine ? `<button class="btn btn-danger" data-action="job-delete" data-id="${esc(job.id)}" type="button">Delete</button>` : ""}
        </div>
      </div>`;
  }

  function renderJobs() {
    const view = document.getElementById("view-jobs");
    const mine = state.myJobs.map((j) => jobCard(j, true)).join("");
    const rest = JOBS.map((j) => jobCard(j, false)).join("");
    view.innerHTML = `
      <div class="fab-row">
        <button class="btn btn-primary btn-block" data-action="post-job" type="button">＋ Post a job</button>
      </div>
      <div class="section-title">
        <h2>Open jobs</h2>
        <span class="hint">${state.myJobs.length + JOBS.length} listings</span>
      </div>
      <div class="list">${mine}${rest}</div>
    `;
  }

  // ---------- Rendering: Workers ----------

  function matchesFilter(worker) {
    if (workerFilter.category !== "all" && worker.category !== workerFilter.category) {
      return false;
    }
    const q = workerFilter.query.trim().toLowerCase();
    if (!q) return true;
    const cat = catById(worker.category);
    return (
      worker.name.toLowerCase().includes(q) ||
      worker.city.toLowerCase().includes(q) ||
      worker.bio.toLowerCase().includes(q) ||
      cat.label.toLowerCase().includes(q) ||
      cat.amharic.includes(q)
    );
  }

  function renderWorkers() {
    const view = document.getElementById("view-workers");
    const results = WORKERS.filter(matchesFilter);
    const chips = [{ id: "all", label: "All", icon: "✨" }].concat(CATEGORIES);

    view.innerHTML = `
      <form class="search-row" data-action="worker-search">
        <input type="search" name="q" placeholder="Search by name, skill, or area…"
               aria-label="Search workers" value="${esc(workerFilter.query)}" />
        <button type="submit">Search</button>
      </form>
      <div class="chip-row">
        ${chips.map(
          (c) => `
          <button class="chip ${workerFilter.category === c.id ? "active" : ""}"
                  data-action="chip" data-id="${c.id}" type="button">
            ${c.icon} ${esc(c.label)}
          </button>`
        ).join("")}
      </div>
      <div class="list">
        ${
          results.length === 0
            ? '<div class="empty">No workers match your search yet.<br/>More workers join every week.</div>'
            : results.map(
                (w) => `
              <button class="worker-card" data-action="worker" data-id="${w.id}" type="button">
                ${avatarHtml(w.name, w.color)}
                <span class="info">
                  <span class="name">${esc(w.name)}
                    ${w.verified ? '<span class="verified"> ✔ Verified</span>' : ""}
                  </span>
                  <div class="meta">${catById(w.category).icon} ${esc(catById(w.category).label)} · 📍 ${esc(w.city)}</div>
                  <div class="rate">${esc(w.rate)}</div>
                </span>
                <span class="rating">⭐ ${w.rating}</span>
              </button>`
              ).join("")
        }
      </div>
    `;
  }

  // ---------- Rendering: Profile ----------

  function renderProfile() {
    const view = document.getElementById("view-profile");
    const roleLabel =
      state.role === "hire" ? "Hiring workers" :
      state.role === "work" ? "Looking for work" : "Browsing";

    view.innerHTML = `
      <div class="card profile-head">
        ${avatarHtml(state.name || "Guest", "#1a7a4a")}
        <div>
          <div class="name">${esc(state.name || "Guest user")}</div>
          <div class="meta">${esc(roleLabel)}${state.phone ? " · " + esc(state.phone) : ""}</div>
        </div>
      </div>

      <form class="card" data-action="save-profile">
        <div class="field">
          <label for="pf-name">Your name</label>
          <input id="pf-name" name="name" type="text" value="${esc(state.name)}" placeholder="e.g. Moti Abelti" />
        </div>
        <div class="field">
          <label for="pf-phone">Phone number</label>
          <input id="pf-phone" name="phone" type="tel" value="${esc(state.phone)}" placeholder="+2519…" />
        </div>
        <div class="field">
          <label for="pf-role">I am here to</label>
          <select id="pf-role" name="role">
            <option value="hire" ${state.role === "hire" ? "selected" : ""}>Hire workers</option>
            <option value="work" ${state.role === "work" ? "selected" : ""}>Find work</option>
            <option value="browse" ${state.role === "browse" || !state.role ? "selected" : ""}>Just browse</option>
          </select>
        </div>
        <button class="btn btn-primary btn-block" type="submit">Save</button>
      </form>

      <div class="card">
        <div class="menu">
          <button class="menu-row" data-action="tab" data-id="jobs" type="button">
            <span class="icon">🧰</span><span class="label">My job posts (${state.myJobs.length})</span><span class="chev">›</span>
          </button>
          <button class="menu-row" data-action="soon" data-id="saved" type="button">
            <span class="icon">❤️</span><span class="label">Saved workers</span>${soonPill}
          </button>
          <button class="menu-row" data-action="soon" data-id="payments" type="button">
            <span class="icon">🔒</span><span class="label">Payments</span>${soonPill}
          </button>
          <button class="menu-row" data-action="soon" data-id="verification" type="button">
            <span class="icon">✅</span><span class="label">Get verified</span>${soonPill}
          </button>
          <button class="menu-row" data-action="soon" data-id="notifications" type="button">
            <span class="icon">🔔</span><span class="label">Notifications</span>${soonPill}
          </button>
          <button class="menu-row" data-action="soon" data-id="amharic" type="button">
            <span class="icon">🇪🇹</span><span class="label">ቋንቋ · Language</span>${soonPill}
          </button>
        </div>
      </div>

      <p class="empty" style="padding:0.5rem 1rem">
        Serategna MVP · Phase 1 demo · your data stays on this device
      </p>
    `;
  }

  // ---------- Tabs ----------

  const renderers = {
    home: renderHome,
    jobs: renderJobs,
    workers: renderWorkers,
    profile: renderProfile,
  };

  function switchTab(name) {
    activeTab = name;
    document.querySelectorAll(".view").forEach((v) => v.classList.remove("active"));
    document.getElementById("view-" + name).classList.add("active");
    document.querySelectorAll(".tab-bar .tab").forEach((t) => {
      t.classList.toggle("active", t.dataset.tab === name);
    });
    renderers[name]();
    window.scrollTo(0, 0);
  }

  // ---------- Bottom sheet ----------

  const backdrop = document.getElementById("backdrop");
  const sheet = document.getElementById("sheet");

  function openSheet(html) {
    sheet.innerHTML = '<div class="sheet-handle"></div>' + html;
    backdrop.classList.remove("hidden");
  }

  function closeSheet() {
    backdrop.classList.add("hidden");
    sheet.innerHTML = "";
  }

  backdrop.addEventListener("click", (e) => {
    if (e.target === backdrop) closeSheet();
  });

  function openWorkerSheet(id) {
    const w = WORKERS.find((x) => x.id === id);
    if (!w) return;
    const cat = catById(w.category);
    openSheet(`
      <div class="sheet-worker-head">
        ${avatarHtml(w.name, w.color)}
        <div>
          <h2 style="margin:0">${esc(w.name)}</h2>
          <div class="sub" style="margin:0">
            ${cat.icon} ${esc(cat.label)} · 📍 ${esc(w.city)}
            ${w.verified ? ' · <span class="verified">✔ Verified</span>' : ""}
          </div>
        </div>
      </div>
      <div class="stat-row">
        <div class="stat"><div class="num">⭐ ${w.rating}</div><div class="lbl">rating</div></div>
        <div class="stat"><div class="num">${w.jobsDone}</div><div class="lbl">jobs done</div></div>
        <div class="stat"><div class="num">${w.years} yrs</div><div class="lbl">experience</div></div>
        <div class="stat"><div class="num">${esc(w.rate.replace("ETB ", ""))}</div><div class="lbl">rate</div></div>
      </div>
      <p class="bio">${esc(w.bio)}</p>
      <div class="sheet-actions">
        <a class="btn btn-primary btn-block" href="tel:${esc(w.phone)}">📞 Call ${esc(w.name.split(" ")[0])}</a>
        <button class="btn btn-block" data-action="soon" data-id="chat" type="button">💬 Chat ${soonPill}</button>
        <button class="btn btn-block" data-action="soon" data-id="payments" type="button">🔒 Book &amp; pay in app ${soonPill}</button>
        <button class="btn btn-block" data-action="soon" data-id="reviews" type="button">⭐ Read all reviews ${soonPill}</button>
      </div>
    `);
  }

  function openSoonSheet(id) {
    const f = soonById(id);
    if (!f) return;
    openSheet(`
      <h2>${f.icon} ${esc(f.label)} ${soonPill}</h2>
      <p class="sub">Planned · ${esc(f.phase)}</p>
      <p class="bio">${esc(f.description)}</p>
      <div class="sheet-actions">
        <button class="btn btn-primary btn-block" data-action="close-sheet" type="button">Got it</button>
      </div>
    `);
  }

  function openPostJobSheet() {
    openSheet(`
      <h2>Post a job</h2>
      <p class="sub">Free while we're in MVP. Your post is saved on this device.</p>
      <form data-action="post-job-submit">
        <div class="field">
          <label for="job-title">What do you need done?</label>
          <input id="job-title" name="title" type="text" required maxlength="80"
                 placeholder="e.g. Deep clean a 2-bedroom apartment" />
        </div>
        <div class="field">
          <label for="job-cat">Category</label>
          <select id="job-cat" name="category">
            ${CATEGORIES.map((c) => `<option value="${c.id}">${c.icon} ${esc(c.label)}</option>`).join("")}
          </select>
        </div>
        <div class="field">
          <label for="job-loc">Location</label>
          <input id="job-loc" name="location" type="text" required maxlength="60" placeholder="e.g. Bole, Addis Ababa" />
        </div>
        <div class="field">
          <label for="job-budget">Budget</label>
          <input id="job-budget" name="budget" type="text" required maxlength="30" placeholder="e.g. ETB 1,000" />
        </div>
        <div class="field">
          <label for="job-phone">Contact phone</label>
          <input id="job-phone" name="phone" type="tel" required maxlength="20" placeholder="+2519…" />
        </div>
        <div class="field">
          <label for="job-desc">Details</label>
          <textarea id="job-desc" name="description" maxlength="300"
                    placeholder="Anything a worker should know before calling"></textarea>
        </div>
        <button class="btn btn-primary btn-block" type="submit">Post job</button>
      </form>
    `);
  }

  function openWelcomeSheet() {
    openSheet(`
      <h2>Welcome to Serategna 👋</h2>
      <p class="sub">ሰራተኛ — the easiest way to find trusted workers in Ethiopia. What brings you here?</p>
      <div class="role-grid">
        <button class="role-option" data-action="role" data-id="hire" type="button">
          <span class="icon">🏠</span>
          <span><span class="t">I want to hire</span><br/><span class="d">Find cleaners, plumbers, nannies and more</span></span>
        </button>
        <button class="role-option" data-action="role" data-id="work" type="button">
          <span class="icon">👷</span>
          <span><span class="t">I'm looking for work</span><br/><span class="d">Browse open jobs and get hired</span></span>
        </button>
        <button class="role-option" data-action="role" data-id="browse" type="button">
          <span class="icon">👀</span>
          <span><span class="t">Just browsing</span><br/><span class="d">Take a look around first</span></span>
        </button>
      </div>
    `);
  }

  // ---------- Toast ----------

  const toastEl = document.getElementById("toast");
  let toastTimer = null;

  function toast(message) {
    toastEl.textContent = message;
    toastEl.classList.remove("hidden");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toastEl.classList.add("hidden"), 2600);
  }

  // ---------- Event delegation ----------

  document.addEventListener("click", (e) => {
    const target = e.target.closest("[data-action]");
    if (!target || target.tagName === "FORM") return;
    const { action, id } = target.dataset;

    switch (action) {
      case "tab":
        switchTab(id);
        break;
      case "category":
        workerFilter.category = id;
        workerFilter.query = "";
        switchTab("workers");
        break;
      case "chip":
        workerFilter.category = id;
        renderWorkers();
        break;
      case "worker":
        openWorkerSheet(id);
        break;
      case "soon":
        openSoonSheet(id);
        break;
      case "post-job":
        openPostJobSheet();
        break;
      case "job-delete":
        state.myJobs = state.myJobs.filter((j) => j.id !== id);
        saveState();
        renderJobs();
        toast("Job post deleted");
        break;
      case "role":
        state.role = id;
        saveState();
        closeSheet();
        renderHome();
        toast(id === "work" ? "Welcome! Browse open jobs below." : "Welcome to Serategna!");
        if (id === "work") switchTab("jobs");
        break;
      case "close-sheet":
        closeSheet();
        break;
    }
  });

  document.addEventListener("submit", (e) => {
    const form = e.target.closest("form[data-action]");
    if (!form) return;
    e.preventDefault();
    const action = form.dataset.action;
    const data = Object.fromEntries(new FormData(form).entries());

    if (action === "home-search") {
      workerFilter.query = data.q || "";
      workerFilter.category = "all";
      switchTab("workers");
    } else if (action === "worker-search") {
      workerFilter.query = data.q || "";
      renderWorkers();
    } else if (action === "save-profile") {
      state.name = (data.name || "").trim();
      state.phone = (data.phone || "").trim();
      state.role = data.role || state.role;
      saveState();
      renderProfile();
      toast("Profile saved");
    } else if (action === "post-job-submit") {
      state.myJobs.unshift({
        id: "my-" + Date.now(),
        title: (data.title || "").trim(),
        category: data.category,
        location: (data.location || "").trim(),
        budget: (data.budget || "").trim(),
        phone: (data.phone || "").trim(),
        description: (data.description || "").trim(),
        posted: "just now",
      });
      saveState();
      closeSheet();
      switchTab("jobs");
      toast("Job posted 🎉 Workers can now call you.");
    }
  });

  document.querySelectorAll(".tab-bar .tab").forEach((tab) => {
    tab.addEventListener("click", () => switchTab(tab.dataset.tab));
  });

  // ---------- Boot ----------

  switchTab("home");
  if (!state.role) openWelcomeSheet();
})();
