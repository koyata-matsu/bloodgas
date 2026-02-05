import { shuffle } from "../utils/rand.js";
import { CASES } from "./stage6_cases.js";

const ABNORMALITY_CHOICES = [
  "代謝性アシドーシス",
  "AG開大型代謝性アシドーシス",
  "非開大型代謝性アシドーシス",
  "代謝性アルカローシス",
  "呼吸性アシドーシス",
  "呼吸性アルカローシス",
  "代謝性代償あり",
  "代謝性代償なし",
];

const TEST_POOL = [
  "血中乳酸",
  "血糖・尿ケトン",
  "BUN / Cr",
  "尿電解質",
  "尿Cl",
  "SpO₂",
  "胸部X線",
];

const PATHOLOGY_CHOICES = [
  "敗血症",
  "乳酸アシドーシス",
  "DKA",
  "アルコール性ケトアシドーシス",
  "ケトアシドーシス",
  "下痢",
  "RTA",
  "COPD増悪",
  "過換気症候群",
  "利尿薬使用",
  "嘔吐",
  "腎不全",
];



function calcAG({ na, cl, hco3 }) {
  return Math.round(na - (cl + hco3));
}

function normalizeSelection(selection) {
  if (Array.isArray(selection)) return selection;
  if (Number.isInteger(selection)) return [selection];
  return [];
}

function toLabelSet(indices, labels) {
  return new Set(indices.map((idx) => labels[idx]).filter(Boolean));
}

function sameLabelSet(a, b) {
  if (a.size !== b.size) return false;
  for (const value of a) if (!b.has(value)) return false;
  return true;
}

function applyStep(q) {
  const steps = [
    { title: "① 病態をすべて選択", prompt: "血液ガスから酸塩基異常をすべて選択せよ。", stepLabel: "1/3" },
    { title: "② 追加検査", prompt: "追加で確認すべき検査を選べ。", stepLabel: "2/3" },
    { title: "③ 病態を当てる", prompt: "最も考えられる病態を選択せよ。", stepLabel: "3/3" },
  ];
  const step = steps[q.step] || steps[0];
  q.stepTitle = step.title;
  q.prompt = step.prompt;
  q.stepLabel = step.stepLabel;
  q.showHistory = q.step >= 2;
  q.questionText = buildQuestionText(q);
}

function formatGasLine(q) {
  return [
    `pH ${Number(q.ph).toFixed(2)}`,
    `PaCO₂ ${q.paco2}`,
    `HCO₃⁻ ${q.hco3}`,
  ].join(" / ");
}

function formatElectrolyteLine(q) {
  return [
    `Na ${q.na}`,
    `Cl ${q.cl}`,
    `Alb ${Number(q.alb).toFixed(1)}`,
    `AG ${q.ag}`,
  ].join(" / ");
}

function buildQuestionText(q) {
  const lines = [
    `【設問${q.step + 1}】${q.prompt}`,
    `【血液ガス】${formatGasLine(q)}`,
    `【電解質】${formatElectrolyteLine(q)}`,
  ];
  if (q.showHistory && q.history) {
    lines.push(`【現病歴】${q.history}`);
  }
  return lines.filter(Boolean).join("\n");
}

function buildQuestion(caseDef) {
  const { gas } = caseDef;
  const q = {
    kind: "case",
    ph: gas.ph,
    paco2: gas.paco2,
    hco3: gas.hco3,
    na: gas.na,
    cl: gas.cl,
    alb: gas.alb,
    ag: calcAG(gas),
    step: 0,
    history: caseDef.history,
    abnormalities: caseDef.abnormalities,
    testsOptions: caseDef.tests.options,
    correctTests: caseDef.tests.correct,
    pathologies: caseDef.pathologies,
    hideCard: true,
  };
  applyStep(q);
  return q;
}

function makeBank(cases) {
  return shuffle(cases.map((c) => buildQuestion(c)));
}

function getStepOptions(q) {
  switch (q.step) {
    case 0:
      return ABNORMALITY_CHOICES;
    case 1:
      return q.testsOptions;
    default:
      return PATHOLOGY_CHOICES;
  }
}

function checkExactMatch(selected, correct, labels) {
  const selectedSet = toLabelSet(selected, labels);
  const correctSet = new Set(correct);
  return sameLabelSet(selectedSet, correctSet);
}

function formatList(list) {
  return list.join("・");
}

function buildStepInfo(q) {
  if (q.step === 0) {
    const label = formatList(q.abnormalities);
    return {
      correctLabel: label,
      explanation: `酸塩基異常は「${label}」。`,
    };
  }
  if (q.step === 1) {
    const label = formatList(q.correctTests);
    return {
      correctLabel: label,
      explanation: `追加検査は「${label}」を優先。`,
    };
  }
  const label = formatList(q.pathologies);
  return {
    correctLabel: label,
    explanation: `病態は「${label}」。`,
  };
}

export function createStage6(cases = CASES) {
  let bank = makeBank(cases);
  let idx = 0;

  return {
    id: 7,
    name: "ステージ6：症例ベース総合問題",
    unlockNeed: 30,
    clearCount: Infinity,
    overlapStart: 14,
    needsComp: false,
    hints: [
      "病態→追加検査→病歴の順で考える。",
    ],

    lessonHTML: `
      <div class="lessonBox">
        <h3>ステージ6：症例ベース総合問題</h3>
        <div class="oneBlock">
          <div>血ガス提示 → 酸塩基異常の複数選択 → 追加検査 → 現病歴 → 病態推論の流れ。</div>
          <div>複数選択の問題では、該当するものを<b>すべて</b>選んで決定。</div>
        </div>
      </div>

      <div class="lessonBox">
        <h3>読む順番</h3>
        <div class="oneBlock">
          <div>① pHで方向 → ② PaCO₂/HCO₃⁻で主病態</div>
          <div>③ AGと補正AGで開大性か判断</div>
          <div>④ 代償の過不足があれば混合を疑う</div>
        </div>
      </div>

      <div class="lessonBox">
        <h3>追加検査の考え方</h3>
        <div class="oneBlock">
          <div>AG開大型 → <b>乳酸</b> / <b>血糖・尿ケトン</b> / <b>腎機能</b></div>
          <div>非開大型 → <b>尿電解質</b> / <b>尿Cl</b></div>
          <div>呼吸性 → <b>SpO₂</b> / <b>胸部X線</b></div>
        </div>
      </div>

      <div class="lessonBox">
        <h3>症例のコツ</h3>
        <div class="oneBlock">
          <div>病歴で「感染・糖尿病・嘔吐・下痢・利尿薬・慢性肺疾患」を拾う。</div>
          <div>血ガスだけでなく<b>背景情報もセットで推論</b>する。</div>
        </div>
      </div>
    `,

    startDesc: "血ガスと病歴を統合して、複数ステップで病態推論。",

    maxConcurrent() {
      return 1;
    },
    staticQuestion: true,
    questionMode: true,
    centerCards: true,
    timeLimitStart: 50,
    timeLimitMin: 20,
    timeLimitDecay: 2,

    nextQuestion() {
      if (idx >= bank.length) {
        bank = makeBank(cases);
        idx = 0;
      }
      return bank[idx++];
    },

    getChoices(q) {
      const labels = getStepOptions(q);
      if (q.step === 0 || q.step === 2) {
        return { labels, multi: true, submitLabel: "決定" };
      }
      if (q.step === 1) {
        const multi = q.correctTests.length > 1;
        return multi
          ? { labels, multi: true, submitLabel: "決定" }
          : { labels, multi: false };
      }
      return { labels, multi: false };
    },

    advanceQuestion(q) {
      q.step = Math.min(q.step + 1, 2);
      applyStep(q);
    },

    checkChoice(q, selection) {
      const stepOptions = getStepOptions(q);
      const selected = normalizeSelection(selection);
      const info = buildStepInfo(q);

      if (q.step === 0) {
        return {
          correct: checkExactMatch(selected, q.abnormalities, stepOptions),
          done: false,
          explanation: info.explanation,
          correctLabel: info.correctLabel,
        };
      }
      if (q.step === 1) {
        return {
          correct: checkExactMatch(selected, q.correctTests, stepOptions),
          done: false,
          explanation: info.explanation,
          correctLabel: info.correctLabel,
        };
      }
      return {
        correct: checkExactMatch(selected, q.pathologies, stepOptions),
        done: true,
        explanation: info.explanation,
        correctLabel: info.correctLabel,
      };
    },
  };
}

export { ABNORMALITY_CHOICES, TEST_POOL, PATHOLOGY_CHOICES };
