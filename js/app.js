/* ============================================================
   LOMON DOCTORATE ACADEMY — shared app logic
   ============================================================ */

const LS_KEY = "lda_state_v2";

const DEFAULT_STATE = {
  days: {},        // {dayNumber: true}
  quizzes: {},     // {"stat_m1": 92, ...}
  modules: {},     // {"stat_m1": true} content complete
  summaries: {},   // {courseId: true}
  outside: {},     // {courseId: true}
  practice: { total: 0, correct: 0, bySubject: {} },
  papers: [],      // [{title, venue, problem, method, limitation, why, date}]
  topics: [
    { title: "", notes: "" },
    { title: "", notes: "" },
    { title: "", notes: "" }
  ],
  research: { memoDone: false, memoNotes: "", memoProgress: 0 },
  journal: {}      // {week: "text"}
};

function loadState() {
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (!raw) return structuredClone(DEFAULT_STATE);
    const s = Object.assign(structuredClone(DEFAULT_STATE), JSON.parse(raw));
    s.practice = Object.assign({ total: 0, correct: 0, bySubject: {} }, s.practice);
    s.research = Object.assign({ memoDone: false, memoNotes: "", memoProgress: 0 }, s.research);
    if (!Array.isArray(s.topics) || s.topics.length < 3) s.topics = structuredClone(DEFAULT_STATE.topics);
    return s;
  } catch (e) { return structuredClone(DEFAULT_STATE); }
}
function saveState(s) { localStorage.setItem(LS_KEY, JSON.stringify(s)); }

let STATE = loadState();

/* ---------- date helpers ---------- */
function todayDayNumber() {
  const ms = new Date().setHours(0,0,0,0) - new Date(START_DATE).setHours(0,0,0,0);
  return Math.floor(ms / 86400000) + 1; // day 1 = start date; may be <1 or >105
}
function dateOfDay(n) {
  const d = new Date(START_DATE); d.setDate(d.getDate() + (n - 1)); return d;
}
function fmtDate(d) {
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}
function fmtDateLong(d) {
  return d.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" });
}

/* ---------- derived stats ---------- */
function doneDays(s) { return Object.values(s.days).filter(Boolean).length; }

function courseDone(s, cid) {
  return [1,2,3,4,5].every(m => (s.quizzes[cid + "_m" + m] || 0) >= 80);
}
function courseProgress(s, cid) {
  let pts = 0;
  [1,2,3,4,5].forEach(m => {
    if ((s.quizzes[cid + "_m" + m] || 0) >= 80) pts += 1;
    else if (s.modules[cid + "_m" + m]) pts += 0.5;
  });
  return pts / 5;
}

function currentStreak(s) {
  const t = Math.min(todayDayNumber(), TOTAL_DAYS);
  if (t < 1) return 0;
  let streak = 0;
  let d = s.days[t] ? t : t - 1; // today not done yet doesn't break the streak
  for (; d >= 1; d--) {
    if (s.days[d]) streak++;
    else break;
  }
  return streak;
}
function bestStreak(s) {
  let best = 0, run = 0;
  for (let d = 1; d <= TOTAL_DAYS; d++) {
    if (s.days[d]) { run++; best = Math.max(best, run); }
    else run = 0;
  }
  return Math.max(best, currentStreak(s));
}

function totalXP(s) {
  let xp = doneDays(s) * XP.day;
  Object.values(s.quizzes).forEach(v => {
    if (v >= 80) xp += XP.quizPass;
    if (v >= 90) xp += XP.quizAce;
  });
  xp += Object.values(s.modules).filter(Boolean).length * XP.moduleGate;
  xp += (s.practice.correct || 0) * XP.practiceCorrect;
  xp += (s.papers || []).length * XP.paper;
  xp += Object.values(s.summaries || {}).filter(Boolean).length * XP.summary;
  xp += Object.values(s.outside || {}).filter(Boolean).length * XP.outside;
  return xp;
}
function levelOf(xp) {
  let lvl = LEVELS[0], next = null;
  for (let i = 0; i < LEVELS.length; i++) {
    if (xp >= LEVELS[i].xp) { lvl = LEVELS[i]; next = LEVELS[i+1] || null; }
  }
  return { lvl, next };
}
function earnedBadges(s) { return BADGES.filter(b => { try { return b.test(s); } catch(e) { return false; } }); }

/* ---------- nav ---------- */
const NAV_LINKS = [
  ["index.html", "🏛️ Command Center"],
  ["plan.html", "🗓️ 15-Week Plan"],
  ["courses.html", "📚 Courses"],
  ["practice.html", "🎯 Practice Arena"],
  ["research.html", "🔬 D.Eng. Repair"],
  ["progress.html", "🏅 Achievements"]
];
function renderNav() {
  const here = location.pathname.split("/").pop() || "index.html";
  const el = document.getElementById("nav");
  if (!el) return;
  el.innerHTML = `
    <div class="nav-inner">
      <a class="brand" href="index.html"><span class="brand-mark">Λ</span> Lomon <em>Doctorate</em> Academy</a>
      <button class="nav-toggle" onclick="document.getElementById('nav').classList.toggle('open')">☰</button>
      <div class="nav-links">
        ${NAV_LINKS.map(([h, l]) =>
          `<a href="${h}" class="${h === here ? "active" : ""}">${l}</a>`).join("")}
      </div>
      <div class="nav-xp" id="navXp"></div>
    </div>`;
  updateNavXP();
}
function updateNavXP() {
  const el = document.getElementById("navXp");
  if (!el) return;
  const xp = totalXP(STATE);
  const { lvl } = levelOf(xp);
  el.innerHTML = `<span class="xp-chip">⚡ ${xp.toLocaleString()} XP</span><span class="lvl-chip">${lvl.name}</span>`;
}

/* ---------- toast + confetti ---------- */
let KNOWN_BADGES = null;
function toast(msg, ms = 2600) {
  let t = document.getElementById("toast");
  if (!t) { t = document.createElement("div"); t.id = "toast"; document.body.appendChild(t); }
  t.textContent = msg; t.classList.add("show");
  clearTimeout(t._h); t._h = setTimeout(() => t.classList.remove("show"), ms);
}
function checkNewBadges() {
  const now = earnedBadges(STATE).map(b => b.id);
  if (KNOWN_BADGES) {
    now.filter(id => !KNOWN_BADGES.includes(id)).forEach(id => {
      const b = BADGES.find(x => x.id === id);
      toast(`${b.icon} Badge earned: ${b.name}!`, 3500);
      burst();
    });
  }
  KNOWN_BADGES = now;
}
function burst() {
  for (let i = 0; i < 24; i++) {
    const p = document.createElement("div");
    p.className = "confetti";
    p.style.left = (35 + Math.random() * 30) + "vw";
    p.style.background = ["#f7b731","#4ecdc4","#a55eea","#fc5c65","#45aaf2"][i % 5];
    p.style.animationDelay = (Math.random() * 0.3) + "s";
    document.body.appendChild(p);
    setTimeout(() => p.remove(), 2200);
  }
}

/* mutate helper: change state, persist, refresh chrome */
function commit(fn) {
  fn(STATE);
  STATE.updatedAt = Date.now();
  saveState(STATE);
  updateNavXP();
  checkNewBadges();
  if (typeof onStateChange === "function") onStateChange();
  if (typeof scheduleSyncPush === "function") scheduleSyncPush(); // GitHub auto-sync
}

document.addEventListener("DOMContentLoaded", () => {
  renderNav();
  KNOWN_BADGES = earnedBadges(STATE).map(b => b.id);
});
