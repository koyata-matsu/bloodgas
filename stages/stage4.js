import { shuffle, randInt } from "../utils/rand.js";

const CHOICES_STAGE4 = [
  "慢性であり、代謝性代償あり",
  "急性であり、代謝性代償なし",
];

const NORMAL_HCO3 = { min: 22, max: 26 };

function isNormalHco3(hco3) {
  return hco3 >= NORMAL_HCO3.min && hco3 <= NORMAL_HCO3.max;
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
    ans: isNormalHco3(hco3) ? 1 : 0,
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
    ans: isNormalHco3(hco3) ? 1 : 0,
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
    name: "ステージ4：呼吸性異常と代謝性代償",
    unlockNeed: 18,
    clearCount: 30,
    overlapStart: 14,
    needsComp: false,
    choices: CHOICES_STAGE4,

    lessonHTML: `
      <div class="lessonBox">
        <h3>ステージ4：呼吸性異常と代謝性代償</h3>
        <div class="oneBlock">
          <div>呼吸性アシドーシス／呼吸性アルカローシスに対して<b>代謝性代償があるか</b>を判定。</div>
          <div>腎臓の反応は時間がかかるため、<b>急性ではほぼ代償なし</b>。</div>
        </div>
      </div>

      <div class="lessonBox">
        <h3>判定ポイント</h3>
        <div class="oneBlock">
          <div><b>HCO₃⁻が動いているかどうか</b>だけを見る。</div>
          <div>HCO₃⁻がほぼ正常 → 代謝性代償なし（急性）</div>
          <div>HCO₃⁻が明らかに高値/低値 → 代謝性代償あり（慢性）</div>
        </div>
      </div>
    `,

    startDesc: "HCO₃⁻が動いているかで、急性/慢性＋代償あり/なしを2択で判定。",

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
