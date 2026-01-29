import { shuffle, randInt } from "../utils/rand.js";

const CHOICES_STAGE4 = [
  "呼吸性アシドーシス　慢性であり、代謝性代償あり",
  "呼吸性アシドーシス　急性であり、代謝性代償なし",
  "呼吸性アルカローシス　慢性であり、代謝性代償あり",
  "呼吸性アルカローシス　急性であり、代謝性代償なし",
];

const NORMAL_HCO3 = { min: 22, max: 26 };
const NORMAL_PACO2 = 40;
const NORMAL_HCO3_CENTER = 24;
const ACUTE_HCO3_TOLERANCE = 2;

function isNormalHco3(hco3) {
  return hco3 >= NORMAL_HCO3.min && hco3 <= NORMAL_HCO3.max;
}

function getChoiceIndex(kind, isChronic) {
  if (kind === "acidosis") {
    return isChronic ? 0 : 1;
  }
  return isChronic ? 2 : 3;
}

function isAcuteByCompensation(kind, paco2, hco3) {
  const deltaPaco2 = paco2 - NORMAL_PACO2;
  const expectedDeltaHco3 = kind === "acidosis"
    ? deltaPaco2 * 0.1
    : deltaPaco2 * 0.2;
  const expectedHco3 = NORMAL_HCO3_CENTER + expectedDeltaHco3;
  return Math.abs(hco3 - expectedHco3) <= ACUTE_HCO3_TOLERANCE;
}

function getAnswerIndex(kind, paco2, hco3) {
  const isAcute = isNormalHco3(hco3) || isAcuteByCompensation(kind, paco2, hco3);
  return getChoiceIndex(kind, !isAcute);
}

function makeRespAcidosis(isChronic) {
  const paco2 = randInt(55, 80);
  const hco3 = isChronic ? randInt(28, 40) : randInt(22, 26);
  const phBase = isChronic ? 7.32 : 7.20;
  const ph = Number((phBase + randInt(0, 10) / 100).toFixed(2));
  return {
    ph,
    paco2,
    hco3,
    ans: getAnswerIndex("acidosis", paco2, hco3),
  };
}

function makeRespAlkalosis(isChronic) {
  const paco2 = randInt(20, 30);
  const hco3 = isChronic ? randInt(16, 20) : randInt(22, 26);
  const phBase = isChronic ? 7.44 : 7.48;
  const ph = Number((phBase + randInt(0, 10) / 100).toFixed(2));
  return {
    ph,
    paco2,
    hco3,
    ans: getAnswerIndex("alkalosis", paco2, hco3),
  };
}

function makeBank() {
  const bank = [];
  for (let i = 0; i < 25; i++) {
    bank.push(makeRespAcidosis(false));
    bank.push(makeRespAcidosis(true));
    bank.push(makeRespAlkalosis(false));
    bank.push(makeRespAlkalosis(true));
  }
  return shuffle(bank);
}

export function createStage4() {
  let bank = makeBank();
  let idx = 0;

  return {
    id: 5,
    name: "ステージ4：呼吸性異常の急性/慢性",
    unlockNeed: 18,
    clearCount: 30,
    overlapStart: 14,
    needsComp: false,
    choices: CHOICES_STAGE4,

    lessonHTML: `
      <div class="lessonBox">
        <h3>ステージ4：呼吸性異常の急性/慢性</h3>
        <div class="oneBlock">
          <div>呼吸性アシドーシス/アルカローシスに対して<b>腎性代償（HCO₃⁻の変化）</b>を見る。</div>
          <div>急性では代償が小さく、慢性ではHCO₃⁻が大きく動く。</div>
        </div>
      </div>

      <div class="lessonBox">
        <h3>判定ポイント</h3>
        <div class="oneBlock">
          <div><b>HCO₃⁻が正常域</b>なら急性。</div>
          <div>急性の代償式に合うならHCO₃⁻が正常域外でも急性。</div>
          <div><b>HCO₃⁻が高値/低値</b>なら慢性（代謝性代償あり）。</div>
          <div>PaCO₂の変化とHCO₃⁻の動きが<b>同方向</b>なら慢性。</div>
        </div>
      </div>

      <div class="lessonBox">
        <h3>実践メモ</h3>
        <div class="oneBlock">
          <div>呼吸性アシドーシス → HCO₃⁻が上がると慢性。</div>
          <div>呼吸性アルカローシス → HCO₃⁻が下がると慢性。</div>
          <div>迷ったら「HCO₃⁻のズレが大きいか」を優先して判断。</div>
        </div>
      </div>
    `,

    startDesc: "HCO₃⁻が動いているかで、呼吸性異常の種類＋急性/慢性（代償あり/なし）を4択で判定。",

    nextQuestion() {
      if (idx >= bank.length) {
        bank = makeBank();
        idx = 0;
      }
      return bank[idx++];
    },

    maxConcurrent(correct, spawnedCount) {
      return (correct >= 9 || spawnedCount >= 9) ? 2 : 1;
    },

    checkChoice(q, choiceIdx) {
      return choiceIdx === q.ans;
    },
  };
}
