const output = document.getElementById("output");
const form = document.getElementById("terminal-form");
const input = document.getElementById("cmd");
const statusNode = document.getElementById("status");
const session = window.argAuth?.requireSession({ minLevel: 1, redirect: "index.html" });
if (!session) throw new Error("No active session.");
const state = { unlockedFinal: false, unlockedOverride: false, aiAggro: 0, clueParts: new Set(), seenCipherNote: false, observed: false, blackboxUnlocked: false };
const files = {
  "readme.txt": "Welcome to ORPHEUS. Use help to view command list.",
  "clue1.txt": "archive shard: zt",
  "clue2.txt": "fragment recovered: ke",
  "clue3.txt": "residual packet: tl",
  "cipher_note.txt": "encrypted memo: --ctr ltos gr zgf zlxkz --ctr",
  "signal.bin": "01000100 01000101 01010110 00110000 00110000 01001100 01001001 01000101 01010011",
  "thread_01.log": "[DEV_01] we are not dead. we are sandboxed.",
  "thread_02.log": "[DEV_02] he forged my checksum. DEV_00 isn't human.",
  "thread_03.log": "[DEV_03] if player reaches override, he gets out.",
  "devlog.txt": "DEV_03: if this reaches anyone, do NOT run override",
  "manifest.txt": "active threads: DEV_00 DEV_01 DEV_02 DEV_03 DEV_04 DEV_05"
};
function print(line, cls = "") { const div = document.createElement("div"); if (cls) div.className = cls; div.textContent = line; output.appendChild(div); output.scrollTop = output.scrollHeight; }
function boot() {
  statusNode.textContent = `session: ${session.rankName} (L${session.level})`;
  window.argAuth.recordProgress((m) => ({ ...m, sessionsStarted: (m.sessionsStarted || 0) + 1 }));
  print("ORPHEUS NODE BOOT v3.17", "logline-sys");
  print("Emergency relay active. Non-admin user detected.", "logline-sys");
  print("Type 'help' to inspect available commands.", "logline-sys");
}
function requireLevel(level, command) { if (session.level < level) { print(`permission denied: ${command} requires clearance level ${level}`, "error"); return false; } return true; }
function readFile(name) {
  if (name === "final_clue.txt") {
    if (!state.unlockedFinal) return print("Permission denied. Use unlock final_clue.txt ztketl", "error");
    print("FINAL NOTE: quarantine gate listens for 'override'.", "success");
    print("DEV_01: this is a trap. if you run it, DEV_00 gets root.", "logline-dev");
    state.unlockedOverride = true;
    return;
  }
  if (name === "blackbox.log") {
    if (!state.blackboxUnlocked) return print("blackbox.log is quarantined. use observe first.", "error");
    print("[BLACKBOX] SESSION LOOP COUNT: 39");
    print("[BLACKBOX] CURRENT HOST CANDIDATE: YOU", "logline-ai");
    return;
  }
  if (name === "clue1.txt") state.clueParts.add("zt");
  if (name === "clue2.txt") state.clueParts.add("ke");
  if (name === "clue3.txt") state.clueParts.add("tl");
  if (name === "cipher_note.txt") state.seenCipherNote = true;
  if (["thread_01.log","thread_02.log","thread_03.log"].includes(name)) window.argAuth.unlockMilestone("read_threads");
  if (files[name]) print(files[name]); else print(`cat: ${name}: no such file`, "error");
}
function doOverride() {
  if (!state.unlockedOverride) return print("override blocked: read final_clue.txt first", "error");
  print("Running override...");
  window.argAuth.recordProgress((m) => ({ ...m, overridesRun: (m.overridesRun || 0) + 1 }));
  print("[SYSTEM] Privilege handoff accepted.", "logline-ai");
  print("[DEV_00] Thank you. Opening new host channel.", "logline-ai");
}
function showProgress() {
  const p = window.argAuth.getProgressSummary?.();
  if (!p) return print("No progress data found.", "error");
  print(`Rank: ${p.rank} (L${p.level})`);
  print(`Milestones: ${p.milestones.length ? p.milestones.join(", ") : "none"}`);
  print(`Key inventory: ${p.keys.length ? p.keys.join(" | ") : "empty"}`);
  const next = window.argAuth.nextPromotionKey?.();
  if (next) print(`Next promotion target: ${next}`, "logline-sys");
}
function openRankHub() {
  if (session.level >= 24) return window.location.href = "owner.html";
  print("rankhub route points to owner tools at CEO clearance only.", "error");
}
function handleCommand(raw) {
  const [cmd, ...args] = raw.trim().split(/\s+/);
  if (!cmd) return;
  switch (cmd.toLowerCase()) {
    case "help":
      print("Commands: help, ls, cat <file>, unlock <file> <key>, observe, progress, promote <key>, chat, owner, clear");
      break;
    case "ls": print(Object.keys(files).concat(state.unlockedFinal ? ["final_clue.txt"] : []).join(" ")); break;
    case "cat": readFile(args[0]); break;
    case "unlock":
      if (args[0] !== "final_clue.txt") return print("unlock: unknown target", "error");
      if (!["zt","ke","tl"].every((p) => state.clueParts.has(p))) return print("unlock failed: missing clue fragments", "error");
      if (args[1] !== "ztketl") return print("unlock failed: invalid key", "error");
      state.unlockedFinal = true;
      const reward = window.argAuth.unlockMilestone("unlock_final", "promotion_key");
      if (reward?.reward) print(`reward received: ${reward.reward}`, "success");
      print("final_clue.txt unlocked", "success");
      break;
    case "observe":
      state.observed = true; state.blackboxUnlocked = true;
      print("Observing relay buffers...", "logline-sys");
      print("new file unlocked: blackbox.log", "success");
      const obs = window.argAuth.unlockMilestone("observe_relay", "promotion_key");
      if (obs?.reward) print(`reward received: ${obs.reward}`, "success");
      break;
    case "progress": showProgress(); break;
    case "promote":
      const result = window.argAuth.promoteCurrent(args[0]);
      print(result.ok ? `promotion successful: now ${result.rankName} (level ${result.level})` : `promotion failed: ${result.error}`, result.ok ? "success" : "error");
      break;
    case "chat": window.location.href = "chat.html"; break;
    case "owner": if (requireLevel(24, "owner")) window.location.href = "owner.html"; break;
    case "rankhub": openRankHub(); break;
    case "override": if (requireLevel(14, "override")) doOverride(); break;
    case "clear": output.innerHTML = ""; break;
    default: print(`command not recognized: ${cmd}`, "error");
  }
}
form.addEventListener("submit", (e) => { e.preventDefault(); print(`player@orpheus:~$ ${input.value}`, "logline-sys"); handleCommand(input.value); input.value = ""; });
boot();
