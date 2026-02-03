import { shuffle } from "../utils/rand.js";

const CHOICES_STAGE1 = [
  "代謝性アシドーシス",
  "呼吸性アシドーシス",
  "代謝性アルカローシス",
  "呼吸性アルカローシス",
];

const NORMALS = {
  ph: [7.35, 7.45],
  paco2: [35, 45],
  hco3: [22, 26],
};

function dir(value, [min, max]) {
  if (value < min) return "低下";
  if (value > max) return "上昇";
  return "正常";
}

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
    id: 2,
    name: "ステージ1：酸塩基の4分類",
    unlockNeed: 30,
    clearCount: Infinity,
    overlapStart: 14,
    needsComp: false,
    choices: CHOICES_STAGE1,
    hints: [
      "pHでアシドーシス/アルカローシスを決める。",
      "pH方向と一致するPaCO₂/HCO₃⁻を主病態にする。",
    ],

    lessonHTML: `
      <div class="lessonBox">
        <h3>ステージ1：酸塩基の4分類</h3>
        <div class="oneBlock">
          <div>まず<b>pH</b>で「アシドーシス / アルカローシス」を決める。</div>
          <div>次に<b>PaCO₂</b>と<b>HCO₃⁻</b>のどちらがpHの変化方向と一致しているかを見る。</div>
        </div>
      </div>

      <div class="lessonBox">
        <h3>判定の流れ</h3>
        <div class="oneBlock">
          <div><b>pH↓</b> → アシドーシス</div>
          <div>・PaCO₂↑なら <b>呼吸性アシドーシス</b></div>
          <div>・HCO₃⁻↓なら <b>代謝性アシドーシス</b></div>
          <div><b>pH↑</b> → アルカローシス</div>
          <div>・PaCO₂↓なら <b>呼吸性アルカローシス</b></div>
          <div>・HCO₃⁻↑なら <b>代謝性アルカローシス</b></div>
        </div>
      </div>

      <div class="lessonBox">
        <h3>コツ</h3>
        <div class="oneBlock">
          <div>まず<b>pH</b>だけ見て方向を決める。</div>
          <div>次に「pHを<b>説明できる</b>パラメータ」を主病態として選択。</div>
          <div>もう片方は<b>代償</b>の可能性が高い。</div>
        </div>
      </div>
    `,

    startDesc: "pH → PaCO₂/HCO₃⁻の一致方向で主病態を4分類する。",

    nextQuestion() {
      if (idx >= bank.length) {
        bank = shuffle(bank);
        idx = 0;
      }
      return bank[idx++];
    },

    checkChoice(q, choiceIdx) {
      const correct = choiceIdx === q.ans;
      const phDir = dir(q.ph, NORMALS.ph);
      const co2Dir = dir(q.paco2, NORMALS.paco2);
      const hco3Dir = dir(q.hco3, NORMALS.hco3);
      const label = CHOICES_STAGE1[q.ans];
      const explanation = `pH${phDir}で${label.includes("アシドーシス") ? "アシドーシス" : "アルカローシス"}。` +
        `PaCO₂${co2Dir} / HCO₃⁻${hco3Dir}より${label}。`;
      return {
        correct,
        explanation,
        correctLabel: label,
      };
    },
  };
}
