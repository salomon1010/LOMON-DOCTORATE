/* ============================================================
   GITHUB SYNC — save progress to a private repo via the GitHub API
   Any device with the token can pull the same progress file.
   The token is stored ONLY in this browser's localStorage and is
   sent ONLY to api.github.com.
   ============================================================ */

const SYNC_KEY = "lda_sync_v1";

function loadSyncCfg() {
  try {
    return Object.assign(
      { token: "", owner: "", repo: "", branch: "main", path: "lomon-progress.json", auto: true, lastPush: null, lastPull: null, sha: null },
      JSON.parse(localStorage.getItem(SYNC_KEY) || "{}"));
  } catch (e) { return { token: "", owner: "", repo: "", branch: "main", path: "lomon-progress.json", auto: true, lastPush: null, lastPull: null, sha: null }; }
}
function saveSyncCfg() { localStorage.setItem(SYNC_KEY, JSON.stringify(SYNC)); }
let SYNC = loadSyncCfg();
let syncBusy = false, pushTimer = null;

/* ---------- utf-8 safe base64 ---------- */
function b64enc(str) {
  const bytes = new TextEncoder().encode(str);
  let bin = "";
  for (let i = 0; i < bytes.length; i += 0x8000)
    bin += String.fromCharCode.apply(null, bytes.subarray(i, i + 0x8000));
  return btoa(bin);
}
function b64dec(b64) {
  const bin = atob(b64.replace(/\s/g, ""));
  const bytes = Uint8Array.from(bin, c => c.charCodeAt(0));
  return new TextDecoder().decode(bytes);
}

/* ---------- GitHub API ---------- */
function ghConfigured() { return !!(SYNC.token && SYNC.owner && SYNC.repo); }
function ghUrl(p) { return `https://api.github.com/${p}`; }
function ghHeaders() {
  return { "Authorization": "Bearer " + SYNC.token, "Accept": "application/vnd.github+json", "X-GitHub-Api-Version": "2022-11-28" };
}
async function ghGetFile() {
  const r = await fetch(ghUrl(`repos/${SYNC.owner}/${SYNC.repo}/contents/${encodeURIComponent(SYNC.path)}?ref=${encodeURIComponent(SYNC.branch)}`), { headers: ghHeaders() });
  if (r.status === 404) return null;
  if (!r.ok) throw new Error(await ghErr(r));
  const j = await r.json();
  return { sha: j.sha, data: JSON.parse(b64dec(j.content)) };
}
async function ghPutFile(stateObj, sha) {
  const body = {
    message: "Lomon Academy progress sync · " + new Date().toISOString(),
    content: b64enc(JSON.stringify(stateObj, null, 2)),
    branch: SYNC.branch
  };
  if (sha) body.sha = sha;
  const r = await fetch(ghUrl(`repos/${SYNC.owner}/${SYNC.repo}/contents/${encodeURIComponent(SYNC.path)}`), {
    method: "PUT", headers: ghHeaders(), body: JSON.stringify(body)
  });
  if (!r.ok) throw new Error(await ghErr(r));
  const j = await r.json();
  return j.content.sha;
}
async function ghCheckRepo() {
  const r = await fetch(ghUrl(`repos/${SYNC.owner}/${SYNC.repo}`), { headers: ghHeaders() });
  if (r.status === 404) return { exists: false };
  if (!r.ok) throw new Error(await ghErr(r));
  const j = await r.json();
  return { exists: true, private: j.private, defaultBranch: j.default_branch };
}
async function ghCreateRepo() {
  const r = await fetch(ghUrl("user/repos"), {
    method: "POST", headers: ghHeaders(),
    body: JSON.stringify({ name: SYNC.repo, private: true, description: "Lomon Doctorate Academy — progress sync (private)", auto_init: true })
  });
  if (!r.ok) throw new Error(await ghErr(r));
  return r.json();
}
async function ghErr(r) {
  let msg = r.status + " " + r.statusText;
  try { const j = await r.json(); if (j.message) msg += " — " + j.message; } catch (e) {}
  if (r.status === 401) msg += ". Check the token (expired or wrong value).";
  if (r.status === 403) msg += ". Token lacks permission (needs Contents read/write on this repo).";
  return msg;
}

/* ---------- high-level operations ---------- */
async function syncPushNow(silent) {
  if (!ghConfigured() || syncBusy) return;
  syncBusy = true; setChip("⏳");
  try {
    if (SYNC.sha == null) { const f = await ghGetFile(); SYNC.sha = f ? f.sha : null; }
    try {
      SYNC.sha = await ghPutFile(STATE, SYNC.sha);
    } catch (e) {
      // sha conflict (file changed remotely) → refetch sha once and retry
      if (String(e.message).includes("409") || /sha/i.test(e.message)) {
        const f = await ghGetFile(); SYNC.sha = f ? f.sha : null;
        SYNC.sha = await ghPutFile(STATE, SYNC.sha);
      } else throw e;
    }
    SYNC.lastPush = Date.now(); saveSyncCfg();
    setChip("☁️✓");
    if (!silent) toast("☁️ Progress uploaded to GitHub.");
    setSyncStatus("Last upload: " + new Date(SYNC.lastPush).toLocaleString());
  } catch (e) {
    setChip("☁️⚠");
    setSyncStatus("Upload failed: " + e.message, true);
    if (!silent) toast("⚠ GitHub upload failed — see Sync settings.");
  } finally { syncBusy = false; }
}

async function syncPullNow(opts = {}) {
  if (!ghConfigured() || syncBusy) return;
  syncBusy = true; setChip("⏳");
  try {
    const f = await ghGetFile();
    if (!f) { setSyncStatus("No progress file in the repo yet — upload once from your main device."); setChip("☁️"); return; }
    SYNC.sha = f.sha;
    const remote = f.data || {};
    const localT = STATE.updatedAt || 0, remoteT = remote.updatedAt || 0;
    if (!opts.force && localT > remoteT) {
      setSyncStatus(`Local progress is newer (${new Date(localT).toLocaleString()}) than GitHub (${remoteT ? new Date(remoteT).toLocaleString() : "never"}). Use “Upload now”, or force-download to overwrite.`);
      setChip("☁️↑");
      return;
    }
    if (!opts.force && remoteT === localT) { setChip("☁️✓"); setSyncStatus("Already in sync. Last download: " + (SYNC.lastPull ? new Date(SYNC.lastPull).toLocaleString() : "—")); return; }
    localStorage.setItem(LS_KEY, JSON.stringify(remote));
    STATE = loadState();
    SYNC.lastPull = Date.now(); saveSyncCfg();
    updateNavXP();
    if (typeof onStateChange === "function") onStateChange();
    if (typeof KNOWN_BADGES !== "undefined") KNOWN_BADGES = earnedBadges(STATE).map(b => b.id);
    setChip("☁️✓");
    setSyncStatus("Downloaded from GitHub: " + new Date(SYNC.lastPull).toLocaleString());
    if (!opts.silent) toast("☁️ Progress loaded from GitHub.");
  } catch (e) {
    setChip("☁️⚠");
    setSyncStatus("Download failed: " + e.message, true);
    if (!opts.silent) toast("⚠ GitHub download failed — see Sync settings.");
  } finally { syncBusy = false; }
}

/* called by commit() in app.js after every change */
function scheduleSyncPush() {
  if (!ghConfigured() || !SYNC.auto) return;
  clearTimeout(pushTimer);
  setChip("☁️…");
  pushTimer = setTimeout(() => syncPushNow(true), 3000); // debounce bursts of checkboxes
}

/* ---------- nav chip ---------- */
function setChip(txt) {
  const el = document.getElementById("syncChip");
  if (el) el.textContent = txt;
}
function mountChip() {
  const nav = document.querySelector(".nav-inner");
  if (!nav || document.getElementById("syncChip")) return;
  const a = document.createElement("a");
  a.id = "syncChip";
  a.href = "progress.html#sync";
  a.className = "xp-chip";
  a.title = "GitHub Sync status — click to configure";
  a.style.textDecoration = "none";
  a.textContent = ghConfigured() ? "☁️" : "☁️ off";
  nav.appendChild(a);
}

/* ---------- settings card (renders only where <div id=syncCard> exists) ---------- */
function setSyncStatus(msg, isErr) {
  const el = document.getElementById("syncStatus");
  if (el) { el.textContent = msg; el.style.color = isErr ? "var(--red)" : "var(--ink-dim)"; }
}
function renderSyncCard() {
  const host = document.getElementById("syncCard");
  if (!host) return;
  host.innerHTML = `
    <div class="grid grid-2">
      <div>
        <span class="field-lbl">GitHub username (owner)</span>
        <input type="text" id="syOwner" placeholder="salomon1010" value="${escAttr(SYNC.owner)}">
        <span class="field-lbl">Private repo name</span>
        <input type="text" id="syRepo" placeholder="lomon-progress" value="${escAttr(SYNC.repo)}">
        <span class="field-lbl">Branch · file</span>
        <div style="display:flex;gap:8px">
          <input type="text" id="syBranch" style="width:40%" value="${escAttr(SYNC.branch)}">
          <input type="text" id="syPath" value="${escAttr(SYNC.path)}">
        </div>
      </div>
      <div>
        <span class="field-lbl">Personal access token</span>
        <input type="password" id="syToken" placeholder="github_pat_… or ghp_…" value="${escAttr(SYNC.token)}">
        <p class="small" style="margin-top:8px">🔒 Stored only in this browser. Sent only to api.github.com. Use a <b>fine-grained token</b> limited to the one sync repo with <b>Contents: Read &amp; write</b> — nothing else.</p>
        <label class="small" style="display:flex;align-items:center;gap:8px;margin-top:8px">
          <input type="checkbox" id="syAuto" ${SYNC.auto ? "checked" : ""} style="accent-color:var(--teal)">
          Auto-sync (upload 3s after changes · download on page load if GitHub is newer)
        </label>
      </div>
    </div>
    <div style="margin-top:14px;display:flex;gap:8px;flex-wrap:wrap">
      <button class="btn small teal" onclick="syncConnect()">🔌 Save & test connection</button>
      <button class="btn small" onclick="syncSaveCfg(); syncPushNow(false)">⬆ Upload now</button>
      <button class="btn small ghost" onclick="syncSaveCfg(); syncPullNow({})">⬇ Download (if newer)</button>
      <button class="btn small danger" onclick="if(confirm('Overwrite THIS device with the GitHub copy?')){syncSaveCfg(); syncPullNow({force:true});}">⬇ Force download</button>
      <button class="btn small danger" onclick="syncDisconnect()">✕ Disconnect</button>
    </div>
    <p class="small" id="syncStatus" style="margin-top:10px">${ghConfigured() ? "Configured. Last upload: " + (SYNC.lastPush ? new Date(SYNC.lastPush).toLocaleString() : "never") + " · last download: " + (SYNC.lastPull ? new Date(SYNC.lastPull).toLocaleString() : "never") : "Not connected yet."}</p>
    <details style="margin-top:10px">
      <summary class="small" style="cursor:pointer;color:var(--gold)">How to set this up (2 minutes)</summary>
      <ol class="small" style="margin:10px 0 0 20px;line-height:1.9">
        <li>On GitHub: create a <b>private</b> repo, e.g. <code>lomon-progress</code> (or let “Save &amp; test” create it for you if your token allows).</li>
        <li>GitHub → Settings → Developer settings → <b>Fine-grained personal access tokens</b> → Generate new token.</li>
        <li>Repository access: <b>Only select repositories</b> → your sync repo. Permissions: <b>Contents → Read and write</b>. Set an expiration you're comfortable with.</li>
        <li>Paste username, repo and token here → <b>Save &amp; test connection</b> → <b>Upload now</b>.</li>
        <li>On your phone/other laptop: open this site, paste the same three values → it auto-downloads your progress.</li>
      </ol>
    </details>`;
}
function escAttr(x) { return String(x || "").replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;"); }

function syncSaveCfg() {
  const g = id => (document.getElementById(id) || {}).value || "";
  const has = id => !!document.getElementById(id);
  if (!has("syOwner")) return;
  SYNC.owner = g("syOwner").trim();
  SYNC.repo = g("syRepo").trim();
  SYNC.branch = g("syBranch").trim() || "main";
  SYNC.path = g("syPath").trim() || "lomon-progress.json";
  SYNC.token = g("syToken").trim();
  SYNC.auto = document.getElementById("syAuto").checked;
  SYNC.sha = null; // repo/path may have changed
  saveSyncCfg();
  mountChip(); setChip(ghConfigured() ? "☁️" : "☁️ off");
}
async function syncConnect() {
  syncSaveCfg();
  if (!ghConfigured()) { setSyncStatus("Fill in username, repo and token first.", true); return; }
  setSyncStatus("Testing…");
  try {
    const repo = await ghCheckRepo();
    if (!repo.exists) {
      if (confirm(`Repo "${SYNC.owner}/${SYNC.repo}" not found. Create it as a PRIVATE repo now? (Requires a classic token with 'repo' scope, or create it manually on github.com.)`)) {
        await ghCreateRepo();
        SYNC.branch = "main"; saveSyncCfg(); renderSyncCard();
        setSyncStatus("✅ Private repo created. Now press “Upload now”.");
      } else setSyncStatus("Repo not found — create it on github.com, then test again.", true);
      return;
    }
    if (repo.exists && repo.private === false)
      setSyncStatus(`⚠ Connected, but ${SYNC.owner}/${SYNC.repo} is PUBLIC. Your study data would be visible to anyone — make it private in repo Settings.`, true);
    else {
      if (repo.defaultBranch && repo.defaultBranch !== SYNC.branch) {
        SYNC.branch = repo.defaultBranch; saveSyncCfg(); renderSyncCard();
      }
      setSyncStatus(`✅ Connected to private repo ${SYNC.owner}/${SYNC.repo} (branch ${SYNC.branch}). Use “Upload now” on this device, then “Download” on your other devices.`);
    }
    setChip("☁️✓");
  } catch (e) { setSyncStatus("Connection failed: " + e.message, true); setChip("☁️⚠"); }
}
function syncDisconnect() {
  if (!confirm("Forget the token and sync settings on THIS device? (Progress itself stays.)")) return;
  SYNC = { token: "", owner: SYNC.owner, repo: SYNC.repo, branch: "main", path: "lomon-progress.json", auto: true, lastPush: null, lastPull: null, sha: null };
  saveSyncCfg(); renderSyncCard(); setChip("☁️ off");
  setSyncStatus("Disconnected. Token removed from this browser.");
}

/* ---------- boot ---------- */
document.addEventListener("DOMContentLoaded", () => {
  mountChip();
  renderSyncCard();
  if (ghConfigured() && SYNC.auto) syncPullNow({ silent: true }); // adopt remote if it's newer
});
