import { shuffle, randInt } from "../utils/rand.js";

/**
 * Stage2: 代謝性の代償（マジックナンバー15）
 * 予測PaCO2 = HCO3 + 15
 *
 * 二段階（同一問題を続けて判定）
 * 1) 病態分類（3択）
 * 2) 呼吸性合併（3択）
 */

const CHOICES_STAGE2_BASE = [
  "AG非開大性代謝性アシドーシス",
  "AG開大性代謝性アシドーシス",
  "代謝性アルカローシス",
];

const CHOICES_STAGE2_COMP = [
  "合併なし",
  "呼吸性アシドーシスの合併",
  "呼吸性アルカローシスの合併",
];

const TOL = 1; // 「実測＝予測」扱いの許容幅（±）

function predPaCO2(hco3) {
  return hco3 + 15;
}

function getAgStatus(ag) {
  return ag > 14 ? "AG高値" : "正常AG";
}

function getCompStatus(actual, predicted) {
  if (actual > predicted + TOL) return "呼吸性アシドーシス合併";
  if (actual < predicted - TOL) return "呼吸性アルカローシス合併";
  return "合併なし";
}

function makeBank() {
  const bank = [];
  const push = (ph, paco2, hco3, ag, baseKind, compKind) => (
    bank.push({ ph, paco2, hco3, ag, baseKind, compKind, step: 0 })
  );
  const normalAg = () => randInt(10, 14);
  const highAg = () => randInt(16, 28);

  // ---- Metabolic Acidosis ----
  // 合併なし：PaCO2 ≈ pred（正常AG）
  for (let i = 0; i < 60; i++) {
    const hco3 = randInt(6, 18);
    const pred = predPaCO2(hco3);
    const paco2 = pred + randInt(-TOL, TOL);
    const ph = Number((7.40 - (24 - hco3) * 0.015).toFixed(2));
    push(ph, paco2, hco3, normalAg(), "nagma", "none");
  }
  // 呼吸性アルカローシス合併：PaCO2 < pred（正常AG）
  for (let i = 0; i < 60; i++) {
    const hco3 = randInt(6, 18);
    const pred = predPaCO2(hco3);
    const paco2 = Math.max(10, pred - randInt(6, 14));
    const ph = Number((7.40 - (24 - hco3) * 0.015).toFixed(2));
    push(ph, paco2, hco3, normalAg(), "nagma", "resp_alk");
  }
  // 合併なし：PaCO2 ≈ pred（AG上昇）
  for (let i = 0; i < 60; i++) {
    const hco3 = randInt(6, 18);
    const pred = predPaCO2(hco3);
    const paco2 = pred + randInt(-TOL, TOL);
    const ph = Number((7.40 - (24 - hco3) * 0.015).toFixed(2));
    push(ph, paco2, hco3, highAg(), "agma", "none");
  }
  // 呼吸性アルカローシス合併：PaCO2 < pred（AG上昇）
  for (let i = 0; i < 60; i++) {
    const hco3 = randInt(6, 18);
    const pred = predPaCO2(hco3);
    const paco2 = Math.max(10, pred - randInt(6, 14));
    const ph = Number((7.40 - (24 - hco3) * 0.015).toFixed(2));
    push(ph, paco2, hco3, highAg(), "agma", "resp_alk");
  }

  // ---- Metabolic Alkalosis ----
  // 合併なし：PaCO2 ≈ pred
  for (let i = 0; i < 60; i++) {
    const hco3 = randInt(28, 44);
    const pred = predPaCO2(hco3);
    const paco2 = pred + randInt(-TOL, TOL);
    const ph = Number((7.40 + (hco3 - 24) * 0.010).toFixed(2));
    push(ph, paco2, hco3, normalAg(), "alk", "none");
  }
  // 呼吸性アシドーシス合併：PaCO2 > pred
  for (let i = 0; i < 60; i++) {
    const hco3 = randInt(28, 44);
    const pred = predPaCO2(hco3);
    const paco2 = pred + randInt(6, 14);
    const ph = Number((7.40 + (hco3 - 24) * 0.010).toFixed(2));
    push(ph, paco2, hco3, normalAg(), "alk", "resp_acid");
  }

  return shuffle(bank);
}

export function createStage2() {
  let bank = makeBank();
  let idx = 0;

  return {
    id: 3,
    name: "ステージ2：代謝性の代償と合併",
    unlockNeed: null,
    clearCount: 30,
    overlapStart: 14,
    getChoices(q) {
      return q?.step === 1 ? CHOICES_STAGE2_COMP : CHOICES_STAGE2_BASE;
    },
    hints: [
      "予測PaCO₂ = HCO₃⁻ + 15（±1）",
    ],

    // 10問目以降から2レーン
    maxConcurrent(correct, spawnedCount) {
      return (correct >= 9 || spawnedCount >= 9) ? 2 : 1;
    },

    lessonHTML: `
      <div class="lessonBox">
        <h3>ステージ2：代謝性の代償と合併</h3>
        <div class="oneBlock">
          <div>代謝性異常では、<b>呼吸性の代償が適切か</b>を必ず確認する。</div>
          <div>代償が「強すぎる / 弱すぎる」ときは<b>合併病態</b>を疑う。</div>
        </div>
      </div>

      <div class="lessonBox">
        <h3>マジックナンバー15</h3>
        <div class="oneBlock">
          <div><b>予測PaCO₂ = HCO₃⁻ + 15</b></div>
          <div>代謝性アシドーシス / アルカローシスのどちらも使える。</div>
        </div>
      </div>

      <div class="lessonBox">
        <h3>判定</h3>
        <div class="oneBlock">
          <div>★ 実測PaCO₂ ≈ 予測PaCO₂ → <b>代償は適切（合併なし）</b></div>
          <div>★ 実測PaCO₂ ＞ 予測PaCO₂ → <b>呼吸性アシドーシス合併</b></div>
          <div>★ 実測PaCO₂ ＜ 予測PaCO₂ → <b>呼吸性アルカローシス合併</b></div>
          <div>★ AGが高ければ<b>AG開大型</b>として分類を分ける。</div>
        </div>
      </div>
    `,

    startDesc: "まずAG/代謝性アシドーシス・アルカローシスを判定 → 次に呼吸性の合併を判定。",

    nextQuestion() {
      if (idx >= bank.length) {
        bank = shuffle(bank);
        idx = 0;
      }
      const q = bank[idx++];
      q.step = 0;
      return q;
    },

    checkChoice(q, choiceIdx) {
      const pred = predPaCO2(q.hco3);
      const comp = getCompStatus(q.paco2, pred);
      const agStatus = getAgStatus(q.ag);
      if (q.step === 0) {
        const expected = q.baseKind === "nagma" ? 0 : q.baseKind === "agma" ? 1 : 2;
        const correct = choiceIdx === expected;
        const label = CHOICES_STAGE2_BASE[expected];
        const explanation = `AG${q.ag}で${agStatus}。`;
        return {
          correct,
          done: false,
          pauseAfterCorrect: correct,
          pauseSeconds: 5,
          explanation,
          correctLabel: label,
        };
      }

      const expected = q.compKind === "none" ? 0 : q.compKind === "resp_acid" ? 1 : 2;
      const correct = choiceIdx === expected;
      const label = CHOICES_STAGE2_COMP[expected];
      const explanation = `予測PaCO₂=${q.hco3}+15=${pred}、実測${q.paco2}で${comp}。`;
      return {
        correct,
        explanation,
        correctLabel: label,
      };
    },
    advanceQuestion(q) {
      q.step = 1;
    },
  };
}
