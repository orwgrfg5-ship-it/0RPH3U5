(function () {
  const session = window.argAuth?.requireSession({ minLevel: 1, redirect: "index.html" });
  if (!session) return;
  const CHAT_KEY = "orpheus_chat_v1";
  const log = document.getElementById("chat-log");
  const form = document.getElementById("chat-form");
  const input = document.getElementById("chat-input");
  const readChat = () => { try { return JSON.parse(localStorage.getItem(CHAT_KEY) || "[]"); } catch { return []; } };
  const writeChat = (messages) => localStorage.setItem(CHAT_KEY, JSON.stringify(messages.slice(-250)));
  function render() {
    const messages = readChat();
    log.innerHTML = messages.map((m) => `<div style="color:${m.rankColor || '#9fd9ff'}">${m.user}: ${m.text}</div>`).join("");
    log.scrollTop = log.scrollHeight;
  }
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const text = input.value.trim();
    if (!text) return;
    const userRecord = window.argAuth.getCurrentUser ? window.argAuth.getCurrentUser() : null;
    if (userRecord?.moderation?.muted) return alert("You are muted.");
    const messages = readChat();
    messages.push({ user: session.displayName, rankKey: session.rankKey, rankColor: session.rankColor, text, at: Date.now() });
    writeChat(messages);
    window.argAuth.recordProgress((p) => ({ ...p, chatsSent: (p.chatsSent || 0) + 1 }));
    input.value = "";
    render();
  });
  setInterval(render, 1500); render();
  document.getElementById("rankLegendList").innerHTML = (window.argAuth.RANKS || []).map((r, idx) => `<li><span class="rank-dot" style="background:${r.color}"></span>${r.name} (L${idx + 1})</li>`).join("");
  document.getElementById("rankInfoClose")?.addEventListener("click", () => { const panel = document.getElementById("rankInfoClose").closest("details"); if (panel) panel.open = false; });
})();
