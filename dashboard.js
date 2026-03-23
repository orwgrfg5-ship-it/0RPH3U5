const session = window.argAuth?.requireSession({ minLevel: 1, redirect: "login.html" });

if (!session) {
  throw new Error("No active session.");
}

const bootLines = [
  "[BOOT] Mounting ORPHEUS workstation image...",
  "[BOOT] Restoring recruit-safe shell...",
  "[BOOT] Checking archive corruption markers...",
  "[BOOT] DEV_00 advisory channel connected.",
  "[BOOT] Ready for operator input.",
];

const bootLog = document.getElementById("boot-log");
const bootSequence = document.getElementById("boot-sequence");
const continueBtn = document.getElementById("boot-continue");
const subtitle = document.getElementById("dashboard-subtitle");
const rankNode = document.getElementById("dashboard-rank");
const levelNode = document.getElementById("dashboard-level");
const preview = document.getElementById("filesystem-preview");

function renderPreview() {
  preview.innerHTML = [
    "root/",
    "├── inbox/",
    "│   ├── readme.txt",
    "│   ├── clue1.txt",
    "│   └── clue2.txt",
    "├── archive/",
    "│   ├── clue3.txt",
    "│   ├── thread_01.log",
    "│   ├── thread_02.log",
    "│   └── thread_03.log",
    "├── sys/",
    "│   ├── manifest.txt",
    "│   ├── signal.bin",
    "│   └── cipher_note.txt",
    "└── quarantine/",
    "    └── final_clue.txt",
  ].map((line) => `<div>${line}</div>`).join("");
}

function markBootSeen() {
  sessionStorage.setItem("orpheus_boot_seen", "1");
}

function bootDashboard() {
  rankNode.textContent = session.rankName;
  levelNode.textContent = `L${session.level}`;
  subtitle.textContent = `Operator ${session.displayName} authenticated. Explore the offline foundation before adding backend systems.`;
  renderPreview();

  if (sessionStorage.getItem("orpheus_boot_seen") === "1") {
    bootSequence.hidden = true;
    return;
  }

  let index = 0;
  const timer = setInterval(() => {
    const line = document.createElement("div");
    line.textContent = bootLines[index];
    bootLog.appendChild(line);
    index += 1;

    if (index >= bootLines.length) {
      clearInterval(timer);
      continueBtn.hidden = false;
      markBootSeen();
    }
  }, 550);
}

continueBtn?.addEventListener("click", () => {
  bootSequence.hidden = true;
});

bootDashboard();
