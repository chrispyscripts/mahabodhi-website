// ===== Mahabodhi — renders editable sections from /content/*.json =====
// These JSON files are what the client edits via the CMS at /admin.
(function () {
  const esc = (s) => String(s == null ? "" : s).replace(/[&<>"]/g,
    (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));

  async function load(path) {
    const r = await fetch(path, { cache: "no-store" });
    if (!r.ok) throw new Error("Failed to load " + path);
    return r.json();
  }

  /* ---------- Group Training: activities ---------- */
  function renderActivities(data) {
    const el = document.getElementById("activitiesGrid");
    if (!el || !data.activities) return;
    el.innerHTML = data.activities.map((a) => `
      <article class="activity reveal in">
        <div class="activity__top"><h3>${esc(a.name)}</h3><span class="pill pill--${esc(a.pill)}">${esc(a.category)}</span></div>
        <p>${esc(a.description)}</p>
        <div class="activity__meta"><span><b>${esc(a.duration)}</b> min</span><span>Intensity <b>${esc(a.intensity)}</b></span><span>${esc(a.level)}</span></div>
      </article>`).join("");
  }

  /* ---------- Group Training: weekly schedule ---------- */
  function renderSchedule(data) {
    const el = document.getElementById("scheduleGrid");
    if (!el || !data.days) return;
    el.innerHTML = data.days.map((d) => `
      <div class="sched-day reveal in">
        <div class="sched-day__name">${esc(d.day)}</div>
        <div class="sched-slots">${(d.slots || []).map((s) =>
          `<div class="slot"><b>${esc(s.time)}</b><span>${esc(s.class)}</span></div>`).join("")}</div>
      </div>`).join("");
    const note = document.getElementById("schedNote");
    if (note && data.note) note.textContent = "* " + data.note;
  }

  /* ---------- Our Team ---------- */
  function renderTeam(data) {
    const note = document.getElementById("teamNote");
    if (note && data.note) note.textContent = data.note;
    const grid = document.getElementById("teamGrid");
    if (!grid || !data.members) return;
    grid.innerHTML = data.members.map((m) => {
      const avatar = m.photo
        ? `<img src="${esc(m.photo)}" alt="${esc(m.name)}" style="width:100%;height:100%;object-fit:cover;opacity:1" />`
        : `<img src="assets/logo-tree.png" alt="" />`;
      return `
      <article class="coach ${m.photo ? "" : "coach--tba"} reveal in">
        <div class="coach__avatar">${avatar}</div>
        <h3>${esc(m.name)}</h3>
        <p class="coach__role">${esc(m.role)}</p>
        <p class="coach__bio">${esc(m.bio)}</p>
      </article>`;
    }).join("");
  }

  /* ---------- Restaurant: venues + menu ---------- */
  function renderRestaurant(data) {
    const vWrap = document.getElementById("venuesWrap");
    if (vWrap && data.venues) {
      vWrap.innerHTML = data.venues.map((v) => {
        const img = v.image
          ? `<div class="venue__img" style="background-image:url('${esc(v.image)}')"></div>`
          : `<div class="venue__img venue__img--brand"><img src="assets/logo-tree.png" alt="Maha Bodhi mark" /></div>`;
        const parts = String(v.hours || "").split("·");
        const hours = parts.length > 1
          ? `${esc(parts[0])}· <b>${esc(parts.slice(1).join("·").trim())}</b>`
          : esc(v.hours);
        return `
        <article class="venue reveal in">
          ${img}
          <div class="venue__body">
            <span class="venue__floor">${esc(v.floor)}</span>
            <h2>${esc(v.name)}</h2>
            <p>${esc(v.description)}</p>
            <ul class="chips">${(v.tags || []).map((t) => `<li>${esc(t)}</li>`).join("")}</ul>
            <p class="venue__hours">${hours}</p>
          </div>
        </article>`;
      }).join("");
    }
    const menu = document.getElementById("menuGrid");
    if (menu && data.menuGroups) {
      menu.innerHTML = data.menuGroups.map((g) => `
        <div class="menu__col reveal in">
          <h3>${esc(g.title)}</h3>
          <ul>${(g.items || []).map((i) => `<li>${esc(i.name)} <span>${esc(i.price)}</span></li>`).join("")}</ul>
        </div>`).join("");
    }
  }

  document.addEventListener("DOMContentLoaded", async () => {
    try {
      if (document.getElementById("activitiesGrid")) renderActivities(await load("content/activities.json"));
      if (document.getElementById("scheduleGrid")) renderSchedule(await load("content/schedule.json"));
      if (document.getElementById("teamGrid")) renderTeam(await load("content/team.json"));
      if (document.getElementById("venuesWrap") || document.getElementById("menuGrid")) renderRestaurant(await load("content/restaurant.json"));
    } catch (e) {
      console.error("[content] " + e.message);
    }
  });
})();
