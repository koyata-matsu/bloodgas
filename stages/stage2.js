import { shuffle, randInt } from "../utils/rand.js";

/**
 * Stage2: 代謝性の代償（マジックナンバー15）
 * 予測PaCO2 = HCO3 + 15
 *
 * 選択肢（6つ固定）
 * 0: 代謝性アシドーシス　合併なし
 * 1: 代謝性アシドーシス＋呼吸性アルカローシス合併
 * 2: AG開大型代謝性アシドーシス　合併なし
 * 3: AG開大型代謝性アシドーシス＋呼吸性アルカローシス合併
 * 4: 代謝性アルカローシス　合併なし
 * 5: 代謝性アルカローシス＋呼吸性アシドーシス合併
 */

const CHOICES_STAGE2 = [
  "代謝性アシドーシス　合併なし",
  "代謝性アシドーシス＋呼吸性アルカローシス合併",
  "AG開大型代謝性アシドーシス　合併なし",
  "AG開大型代謝性アシドーシス＋呼吸性アルカローシス合併",
  "代謝性アルカローシス　合併なし",
  "代謝性アルカローシス＋呼吸性アシドーシス合併",
];

const TOL = 1; // 「実測＝予測」扱いの許容幅（±）

function predPaCO2(hco3) {
  return hco3 + 15;
}

function makeBank() {
  const bank = [];
  const push = (ph, paco2, hco3, ag, ans) => bank.push({ ph, paco2, hco3, ag, ans });
  const normalAg = () => randInt(8, 12);
  const highAg = () => randInt(16, 28);

  // ---- Metabolic Acidosis ----
  // 合併なし：PaCO2 ≈ pred（正常AG）
  for (let i = 0; i < 60; i++) {
    const hco3 = randInt(6, 18);
    const pred = predPaCO2(hco3);
    const paco2 = pred + randInt(-TOL, TOL);
    const ph = Number((7.40 - (24 - hco3) * 0.015).toFixed(2));
    push(ph, paco2, hco3, normalAg(), 0);
  }
  // 呼吸性アルカローシス合併：PaCO2 < pred（正常AG）
  for (let i = 0; i < 60; i++) {
    const hco3 = randInt(6, 18);
    const pred = predPaCO2(hco3);
    const paco2 = Math.max(10, pred - randInt(6, 14));
    const ph = Number((7.40 - (24 - hco3) * 0.015).toFixed(2));
    push(ph, paco2, hco3, normalAg(), 1);
  }
  // 合併なし：PaCO2 ≈ pred（AG上昇）
  for (let i = 0; i < 60; i++) {
    const hco3 = randInt(6, 18);
    const pred = predPaCO2(hco3);
    const paco2 = pred + randInt(-TOL, TOL);
    const ph = Number((7.40 - (24 - hco3) * 0.015).toFixed(2));
    push(ph, paco2, hco3, highAg(), 2);
  }
  // 呼吸性アルカローシス合併：PaCO2 < pred（AG上昇）
  for (let i = 0; i < 60; i++) {
    const hco3 = randInt(6, 18);
    const pred = predPaCO2(hco3);
    const paco2 = Math.max(10, pred - randInt(6, 14));
    const ph = Number((7.40 - (24 - hco3) * 0.015).toFixed(2));
    push(ph, paco2, hco3, highAg(), 3);
  }

  // ---- Metabolic Alkalosis ----
  // 合併なし：PaCO2 ≈ pred
  for (let i = 0; i < 60; i++) {
    const hco3 = randInt(28, 44);
    const pred = predPaCO2(hco3);
    const paco2 = pred + randInt(-TOL, TOL);
    const ph = Number((7.40 + (hco3 - 24) * 0.010).toFixed(2));
    push(ph, paco2, hco3, normalAg(), 4);
  }
  // 呼吸性アシドーシス合併：PaCO2 > pred
  for (let i = 0; i < 60; i++) {
    const hco3 = randInt(28, 44);
    const pred = predPaCO2(hco3);
    const paco2 = pred + randInt(6, 14);
    const ph = Number((7.40 + (hco3 - 24) * 0.010).toFixed(2));
    push(ph, paco2, hco3, normalAg(), 5);
  }

  return shuffle(bank);
}

export function createStage2() {
  let bank = makeBank();
  let idx = 0;

  return {
    id: 2,
    name: "ステージ2：代謝性の代償について",
    unlockNeed: 18,
    clearCount: 30,
    overlapStart: 14,

    choices: CHOICES_STAGE2,

    // 10問目以降から2レーン
    maxConcurrent(correct, spawnedCount) {
      return (correct >= 9 || spawnedCount >= 9) ? 2 : 1;
    },

    lessonHTML: `
      <div class="lessonBox">
        <h3>ステージ2：代謝性の代償について</h3>
        <div class="oneBlock">
          <div>代謝性アシドーシスの時は、<b>AG開大</b>かどうか＋<b>呼吸性アルカローシス</b>があるか</div>
          <div>代謝性アルカローシスの時は、<b>呼吸性アシドーシス</b>があるか</div>
        </div>
      </div>

      <div class="lessonBox">
        <h3>マジックナンバー15</h3>
        <div class="oneBlock">
          <div><b>予測PaCO₂ = HCO₃ + 15</b></div>
        </div>
      </div>

      <div class="lessonBox">
        <h3>判定</h3>
        <div class="oneBlock">
          <div>★ 実測PaCO₂ = 予測PaCO₂ → <b>正常の代償機構（合併なし）</b></div>
          <div>★ 実測PaCO₂ ＞ 予測PaCO₂ → <b>呼吸性アシドーシスの合併</b></div>
          <div>★ 実測PaCO₂ ＜ 予測PaCO₂ → <b>呼吸性アルカローシスの合併</b></div>
        </div>
      </div>
    `,

    startDesc: "pH/PaCO₂/HCO₃⁻/AGを見て、HCO₃ + 15 で予測PaCO₂を出し、合併を6択で判定。",

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
