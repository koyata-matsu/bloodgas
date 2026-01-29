import { shuffle } from "../utils/rand.js";

const CHOICES_STAGE1 = [
  "代謝性アシドーシス",
  "呼吸性アシドーシス",
  "代謝性アルカローシス",
  "呼吸性アルカローシス",
];

function makeBank100() {
  const bank = [];
  const push = (ph, paco2, hco3, ans) => bank.push({ ph, paco2, hco3, ans });

  for (let i = 0; i < 25; i++) {
    const ph = Number((7 + (8 + (i % 8)) / 100).toFixed(2));
    push(ph, 22 + (i % 13), 7 + (i % 10), 0);
  }
  for (let i = 0; i < 25; i++) {
    const ph = Number((7 + (18 + (i % 12)) / 100).toFixed(2));
    push(ph, 55 + (i % 26), 25 + (i % 9), 1);
  }
  for (let i = 0; i < 25; i++) {
    const ph = Number((7 + (46 + (i % 15)) / 100).toFixed(2));
    push(ph, 43 + (i % 14), 30 + (i % 20), 2);
  }
  for (let i = 0; i < 25; i++) {
    const ph = Number((7 + (46 + (i % 13)) / 100).toFixed(2));
    push(ph, 22 + (i % 13), 18 + (i % 8), 3);
  }
  return bank;
}

export function createStage1() {
  let bank = shuffle(makeBank100());
  let idx = 0;

  return {
    id: 1,
    name: "ステージ1：分類",
    unlockNeed: 18,
    clearCount: 30,
    overlapStart: 14,
    needsComp: false,
    choices: CHOICES_STAGE1,

    nextQuestion() {
      if (idx >= bank.length) {
        bank = shuffle(bank);
        idx = 0;
      }
      return bank[idx++];
    },

    checkChoice(q, choiceIdx) {
      return choiceIdx === q.ans;
    },
  };
}
