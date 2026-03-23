const rankData = [
  {
    name: 'Observer',
    tier: 'Entry Rank',
    promotionKey: 'EYE-07-OBSERVER',
    summary: 'The first rank for players who prove they can follow the signal and decode basic clues.',
    steps: [
      'Locate the first hidden phrase embedded in the public lore and submit it exactly as written.',
      'Match the repeated number sequence 07 to the correct archive section and recover the linked symbol.',
      'Use the Observer promotion key only after the phrase and symbol are verified by the owner panel checklist.'
    ]
  },
  {
    name: 'Signal Runner',
    tier: 'Rank II',
    promotionKey: 'GL1TCH-13-RUNNER',
    summary: 'Given to members who can trace false leads and recover the real channel hidden behind decoys.',
    steps: [
      'Complete all Observer tasks without hints.',
      'Decode the acrostic hidden across three clue drops and identify the decoy page.',
      'Collect the authentic channel code from the corrected page title, then use the Signal Runner key.'
    ]
  },
  {
    name: 'Cipher Warden',
    tier: 'Rank III',
    promotionKey: 'WARDEN-23-C1PHER',
    summary: 'Reserved for solvers who can extract meaning from layered ciphers and corrupted text.',
    steps: [
      'Finish the Signal Runner route and archive all discovered fragments in order.',
      'Solve the substitution cipher hidden in the glitched timestamps and convert it into the passphrase.',
      'Present the solved passphrase with the Cipher Warden key to unlock the next review step.'
    ]
  },
  {
    name: 'Blacksite Keeper',
    tier: 'Rank IV',
    promotionKey: 'KEEPER-NULL-404',
    summary: 'A high-trust rank for players who can survive dead ends, null pages, and false recoveries.',
    steps: [
      'Complete every prior rank chain in sequence.',
      'Recover the blacksite log from hidden metadata and prove which clues were intentional traps.',
      'Use the Blacksite Keeper key only after submitting the trap report and true log checksum.'
    ]
  },
  {
    name: 'Arg Architect',
    tier: 'Owner Route',
    promotionKey: 'ORPHEUS-OWNER-EYE',
    summary: 'The owner-facing route for managing ranks, clue sequencing, and final-stage promotions.',
    steps: [
      'Review every lower-rank solution path and confirm no promotion key is reused.',
      'Rotate clue order, update hidden prompts, and prepare the next signal drop with new bait clues.',
      'Trigger the Arg Architect key when the new seasonal ARG cycle is ready to go live.'
    ]
  }
];

const rankMenu = document.getElementById('rankMenu');
const rankDetails = document.getElementById('rankDetails');

function renderDetails(rank) {
  rankDetails.innerHTML = `
    <h4>${rank.name}</h4>
    <p>${rank.summary}</p>
    <div class="rank-meta">
      <span class="rank-chip">${rank.tier}</span>
      <span class="rank-chip">Promotion key: ${rank.promotionKey}</span>
      <span class="rank-chip">Steps: ${rank.steps.length}</span>
    </div>
    <h4>How to get this rank</h4>
    <ol>
      ${rank.steps.map((step) => `<li>${step}</li>`).join('')}
    </ol>
  `;
}

rankData.forEach((rank, index) => {
  const button = document.createElement('button');
  button.className = 'rank-button';
  button.type = 'button';
  button.setAttribute('role', 'tab');
  button.innerHTML = `${rank.name}<small>${rank.tier}</small>`;

  button.addEventListener('click', () => {
    document.querySelectorAll('.rank-button').forEach((item) => item.classList.remove('active'));
    button.classList.add('active');
    renderDetails(rank);
  });

  rankMenu.appendChild(button);

  if (index === 0) {
    button.classList.add('active');
    renderDetails(rank);
  }
});
