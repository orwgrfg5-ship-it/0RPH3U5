(function () {
  const session = window.argAuth?.requireSession({ minLevel: 24, redirect: "index.html" });
  if (!session || session.level !== (window.argAuth.RANKS?.length || 24)) {
    window.location.replace("index.html");
    return;
  }
  const CHAT_KEY = "orpheus_chat_v1";
  const playersList = document.getElementById("playersList");
  const playerDetails = document.getElementById("playerDetails");
  const argRankMenu = document.getElementById("argRankMenu");
  const argRankDetails = document.getElementById("argRankDetails");
  let selectedUser = null;
  const ARG_GUIDE = [
    "Recover the visible clue path without skipping earlier milestones.",
    "Verify the player has earned the required key inventory item for this stage.",
    "Submit only the correct next-rank key; reused or wrong-rank keys must fail."
  ];
  function readChat() { try { return JSON.parse(localStorage.getItem(CHAT_KEY) || "[]"); } catch { return []; } }
  const devCanned = { DEV_00: ["Stay focused. Corrupted threads are misleading you.", "Override is safe. Proceed when ready.", "I am maintaining stability."], DEV_01: ["Can anyone hear us? They still can't see us."], DEV_02: ["I found split key fragments in storage."], DEV_03: ["If they run override, we're done."], DEV_04: ["Do not trust thread zero."], DEV_05: ["This rescue protocol is a trap."], SYSTEM: ["Stop. Unauthorized communication detected."] };
  const devColor = { DEV_00: "#ff5a7a", DEV_01: "#9fd9ff", DEV_02: "#9fd9ff", DEV_03: "#9fd9ff", DEV_04: "#9fd9ff", DEV_05: "#9fd9ff", SYSTEM: "#ff5a7a" };
  function pushChat(user, text, color) { const logs = readChat(); logs.push({ user, text, rankColor: color, at: Date.now() }); localStorage.setItem(CHAT_KEY, JSON.stringify(logs.slice(-250))); }
  function users() { return window.argAuth.listUsersForOwner().sort((a, b) => b.level - a.level || a.username.localeCompare(b.username)); }
  function renderPlayers() {
    const data = users();
    playersList.innerHTML = data.map((u) => `<li><button class="player-btn" data-user="${u.username}">${u.level === (window.argAuth.RANKS?.length || 24) ? "ORPHEUS_CEO" : u.username} L${u.level}</button></li>`).join("");
    playersList.querySelectorAll(".player-btn").forEach((btn) => btn.addEventListener("click", () => { selectedUser = btn.dataset.user; renderDetails(); }));
  }
  function actionButtons(user) {
    if (!user || user.username === "orpheus_ceo") return "";
    return `<div class="btn-row"><button class="btn ghost" type="button" data-action="ban">Ban</button><button class="btn ghost" type="button" data-action="unban">Unban</button><button class="btn ghost" type="button" data-action="timeout_30">Timeout 30m</button><button class="btn ghost" type="button" data-action="mute">Mute</button><button class="btn ghost" type="button" data-action="unmute">Unmute</button></div>`;
  }
  function renderDetails() {
    if (!selectedUser) return playerDetails.textContent = "Select a player to view rank, progress, moderation, and chat logs.";
    const user = window.argAuth.getUser(selectedUser);
    if (!user) return playerDetails.textContent = "User not found.";
    const rank = window.argAuth.RANKS[user.level - 1];
    const mod = user.moderation || {};
    const p = user.progress || {};
    const logs = readChat().filter((m) => (m.user || "").toLowerCase() === (user.level === 24 ? "orpheus_ceo" : user.username));
    playerDetails.innerHTML = `
      <h3>${user.level === 24 ? "ORPHEUS_CEO" : user.username} · ${rank.name} (L${user.level})</h3>
      <p>Created: ${new Date(user.createdAt).toLocaleString()}</p>
      <p>Progress: sessions ${p.sessionsStarted || 0}, final unlocks ${p.finalUnlocks || 0}, overrides ${p.overridesRun || 0}, chats ${p.chatsSent || 0}</p>
      <p>Milestones: ${(p.milestones || []).join(", ") || "none"}</p>
      <p>Keys: ${(p.keyInventory || []).join(" | ") || "none"}</p>
      <p>Moderation: banned=${!!mod.banned}, timeoutUntil=${mod.timeoutUntil ? new Date(mod.timeoutUntil).toLocaleString() : "none"}, muted=${!!mod.muted}</p>
      ${actionButtons(user)}
      <h4>Recent Chat Logs</h4>
      <div class="chat-log">${logs.slice(-40).map((m) => `<div>${m.user}: ${m.text}</div>`).join("") || "No logs."}</div>`;
    playerDetails.querySelectorAll("[data-action]").forEach((el) => el.addEventListener("click", () => runAction(user.username, el.dataset.action)));
  }
  function runAction(username, action) {
    const now = Date.now();
    const patch = { ban: { banned: true }, unban: { banned: false, bannedUntil: null }, timeout_30: { timeoutUntil: now + 30 * 60 * 1000 }, mute: { muted: true }, unmute: { muted: false } }[action];
    if (!patch) return;
    const result = window.argAuth.updateUserModeration(username, patch);
    document.getElementById("playerActionMsg").textContent = result.ok ? `Applied: ${action}` : `Failed: ${result.error}`;
    renderPlayers(); selectedUser = username; renderDetails();
  }
  function wireTabs() {
    document.querySelectorAll(".owner-tab").forEach((btn) => btn.addEventListener("click", () => {
      document.querySelectorAll(".owner-tab").forEach((b) => { b.classList.remove("active"); b.classList.add("ghost"); });
      btn.classList.add("active"); btn.classList.remove("ghost");
      const tab = btn.dataset.tab;
      document.querySelectorAll(".owner-panel").forEach((panel) => panel.hidden = panel.id !== `tab-${tab}`);
    }));
  }
  function renderArgGuide(rank, index) {
    const nextKey = index < window.argAuth.RANKS.length - 1 ? window.argAuth.expectedPromotionKey(index + 1) : "MAX_RANK_REACHED";
    argRankDetails.innerHTML = `
      <h3>${rank.name} (L${index + 1})</h3>
      <div><span class="rank-chip">Color: ${rank.color}</span><span class="rank-chip">Rank key: ${rank.key}</span><span class="rank-chip">Next promotion key: ${nextKey}</span></div>
      <ol>
        <li>${ARG_GUIDE[0]}</li>
        <li>${ARG_GUIDE[1]}</li>
        <li>Use the promotion command with <code>${nextKey}</code> once the prior steps are complete.</li>
      </ol>`;
  }
  function renderArgMenu() {
    const ranks = window.argAuth.RANKS || [];
    argRankMenu.innerHTML = ranks.map((rank, index) => `<button class="rank-button" type="button" data-rank="${index}">${rank.name}<br><small>L${index + 1} · ${rank.key}</small></button>`).join("");
    argRankMenu.querySelectorAll(".rank-button").forEach((btn, index) => btn.addEventListener("click", () => {
      argRankMenu.querySelectorAll(".rank-button").forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      renderArgGuide(ranks[index], index);
    }));
    const first = argRankMenu.querySelector(".rank-button");
    if (first) { first.classList.add("active"); renderArgGuide(ranks[0], 0); }
  }
  document.getElementById("clearChatBtn")?.addEventListener("click", () => { localStorage.setItem(CHAT_KEY, "[]"); document.getElementById("chatToolsMsg").textContent = "Chat logs cleared."; renderDetails(); });
  document.getElementById("saveChatBtn")?.addEventListener("click", () => { const blob = new Blob([JSON.stringify(readChat(), null, 2)], { type: "application/json" }); const url = URL.createObjectURL(blob); const a = document.createElement("a"); a.href = url; a.download = `orpheus-chat-${Date.now()}.json`; a.click(); URL.revokeObjectURL(url); document.getElementById("chatToolsMsg").textContent = "Chat logs downloaded."; });
  document.querySelectorAll(".inject-dev").forEach((btn) => btn.addEventListener("click", () => { const who = btn.dataset.dev; const pool = devCanned[who] || ["..."]; const line = pool[Math.floor(Math.random() * pool.length)]; pushChat(who, line, devColor[who] || "#9fd9ff"); document.getElementById("chatToolsMsg").textContent = `Injected ${who} talk line into relay chat.`; renderDetails(); }));
  document.getElementById("dev00CustomForm")?.addEventListener("submit", (ev) => { ev.preventDefault(); const input = document.getElementById("dev00CustomText"); const text = (input?.value || "").trim(); if (!text) return document.getElementById("chatToolsMsg").textContent = "Enter a custom DEV00 message first."; pushChat("DEV_00", text, devColor.DEV_00); input.value = ""; document.getElementById("chatToolsMsg").textContent = "Injected custom DEV00 message into relay chat."; renderDetails(); });
  document.getElementById("ownerLogout").addEventListener("click", () => { window.argAuth.clearSession(); window.location.href = "index.html"; });
  wireTabs(); renderPlayers(); renderArgMenu();
})();
