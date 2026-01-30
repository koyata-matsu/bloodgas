import { shuffle, randInt } from "../utils/rand.js";

const CHOICES_STAGE0 = ["高値", "正常値", "低値"];

const ITEMS = [
  {
    label: "pH",
    unit: "",
    decimals: 2,
    step: 0.01,
    ranges: {
      low: [7.1, 7.34],
      normal: [7.35, 7.45],
      high: [7.46, 7.6],
    },
  },
  {
    label: "PaCO₂",
    unit: "mmHg",
    decimals: 0,
    step: 1,
    ranges: {
      low: [20, 34],
      normal: [35, 45],
      high: [46, 60],
    },
  },
  {
    label: "PaO₂",
    unit: "mmHg",
    decimals: 0,
    step: 1,
    ranges: {
      low: [50, 79],
      normal: [80, 100],
      high: [101, 120],
    },
  },
  {
    label: "HCO₃⁻",
    unit: "mEq/L",
    decimals: 0,
    step: 1,
    ranges: {
      low: [10, 21],
      normal: [22, 26],
      high: [27, 40],
    },
  },
  {
    label: "AG",
    unit: "mEq/L",
    decimals: 0,
    step: 1,
    ranges: {
      low: [2, 9],
      normal: [10, 14],
      high: [15, 24],
    },
  },
];

function getItemByLabel(label) {
  return ITEMS.find((item) => item.label === label);
}

function randStep(min, max, step) {
  const scale = Math.round(1 / step);
  const minInt = Math.round(min * scale);
  const maxInt = Math.round(max * scale);
  return randInt(minInt, maxInt) / scale;
}

function formatValue(value, decimals) {
  if (decimals === 0) return String(Math.round(value));
  return value.toFixed(decimals);
}

function makeQuestion(item, band) {
  const range = item.ranges[band];
  const value = randStep(range[0], range[1], item.step);
  const ansIndex = band === "high" ? 0 : band === "normal" ? 1 : 2;

  return {
    kind: "norm",
    item: item.label,
    value: formatValue(value, item.decimals),
    unit: item.unit,
    ans: ansIndex,
  };
}

function makeBank() {
  const bank = [];
  ITEMS.forEach((item) => {
    for (let i = 0; i < 10; i++) {
      bank.push(makeQuestion(item, "low"));
      bank.push(makeQuestion(item, "normal"));
      bank.push(makeQuestion(item, "high"));
    }
  });
  return shuffle(bank);
}

export function createStage0() {
  let bank = makeBank();
  let idx = 0;

  return {
    id: 1,
    name: "ステージ0：正常値の判断",
    unlockNeed: 30,
    clearCount: 30,
    overlapStart: 14,
    twoLaneSpawnInterval: {
      start: 3.0,
      min: 0.8,
    },
    choices: CHOICES_STAGE0,
    hints: [
      "正常値レンジを思い出して、高値/正常/低値を即答。",
    ],

    lessonHTML: `
      <div class="lessonBox">
        <h3>ステージ0：正常値の判断</h3>
        <div class="oneBlock">
          <div>血液ガスは、異常を考える前にまず正常値を押さえる。</div>
          <div>表示された数値が <b>高値 / 正常値 / 低値</b> のどれかを判定しよう。</div>
        </div>
      </div>

      <div class="lessonBox">
        <h3>正常値</h3>
        <div class="oneBlock">
          <div><b>pH</b> 7.35–7.45</div>
          <div><b>PaCO₂</b> 35–45 mmHg</div>
          <div><b>PaO₂</b> 80–100 mmHg</div>
          <div><b>HCO₃⁻</b> 22–26 mEq/L</div>
          <div><b>AG</b> 10–14 mEq/L</div>
        </div>
      </div>
    `,

    startDesc: "数値が高いか低いかを即答できるように。",

    nextQuestion() {
      if (idx >= bank.length) {
        bank = makeBank();
        idx = 0;
      }
      return bank[idx++];
    },

    checkChoice(q, choiceIdx) {
      const correct = choiceIdx === q.ans;
      const item = getItemByLabel(q.item);
      const unit = item?.unit ? ` ${item.unit}` : "";
      const normalRange = item ? `${item.ranges.normal[0]}–${item.ranges.normal[1]}${unit}` : "";
      const explanation = item
        ? `${q.item}正常値は${normalRange}。提示値${q.value}${unit}は${CHOICES_STAGE0[q.ans]}。`
        : "正常値レンジと比較して判定。";
      return {
        correct,
        explanation,
        correctLabel: CHOICES_STAGE0[q.ans],
      };
    },
  };
}
