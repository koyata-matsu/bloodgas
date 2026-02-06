import { shuffle } from "../utils/rand.js";
import { CASES } from "./stage6_cases.js";

const PRIMARY_CHOICES = [
  "代謝性アシドーシス",
  "代謝性アルカローシス",
  "呼吸性アシドーシス",
  "呼吸性アルカローシス",
];

const MET_COMP_CHOICES = [
  "代償なし",
  "呼吸性アシドーシス",
  "呼吸性アルカローシス",
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

const COMP_MIX_CHOICES = [
  "純粋なAG開大型代謝性アシドーシス",
  "非開大型代謝性アシドーシスの合併",
  "代謝性アルカローシスの合併",
];

const BASE_AG = 12;



function calcAG({ na, cl, hco3 }) {
  return Math.round(na - (cl + hco3));
}

function to1(x) {
  return Math.round(x * 10) / 10;
}

function calcCorrAG(ag, alb) {
  return ag + 2.5 * Math.max(0, 4.0 - alb);
}

function calcCorrHCO3(hco3, corrAg) {
  return hco3 + (corrAg - BASE_AG);
}

function makeWrong10to20_1dp() {
  const base = Math.floor(Math.random() * 11) + 10;
  const dec = Math.floor(Math.random() * 10) / 10;
  return to1(base + dec);
}

function makeOptions(correct) {
  const set = new Set([correct]);
  while (set.size < 4) {
    let w;
    if (Math.random() < 0.7) {
      w = makeWrong10to20_1dp();
    } else {
      w = to1(correct + (Math.floor(Math.random() * 51) - 25) / 10);
    }
    if (!Number.isFinite(w)) continue;
    if (w < 0) continue;
    set.add(w);
  }
  const arr = Array.from(set);
  for (let i = arr.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return { options: arr, correctIndex: arr.indexOf(correct) };
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
  const stepLabel = `${q.step + 1}/7`;
  let title = "";
  let prompt = "";
  if (q.step === 0) {
    title = "① 主病態を選択";
    prompt = "酸塩基異常の主病態を選べ。";
  } else if (q.step === 1) {
    title = "② 代償/慢性判定";
    if (q.primaryKind.startsWith("met")) {
      prompt = "代償は？";
    } else {
      prompt = "慢性？急性？";
    }
  } else if (q.step === 2) {
    title = "③ 補正AGは？";
    prompt = "補正AGを選べ。";
  } else if (q.step === 3) {
    title = "④ 補正HCO3は？";
    prompt = "補正HCO3を選べ。";
  } else if (q.step === 4) {
    title = "⑤ 補正HCO3から鑑別";
    prompt = "補正HCO3から考えられる合併を選べ。";
  } else if (q.step === 5) {
    title = "⑥ 次に出すべき検査";
    prompt = "次に出すべき検査を選べ（複数選択）。";
  } else {
    title = "⑦ 最も考えられる疾患";
    prompt = "最も考えられる疾患を選べ。";
  }
  q.stepTitle = title;
  q.prompt = prompt;
  q.stepLabel = stepLabel;
  q.showHistory = true;
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
  if (q.history) {
    lines.push(`【現病歴】${q.history}`);
  }
  if (q.explainLines.length) {
    lines.push(`【解説】${q.explainLines.join("\n")}`);
  }
  return lines.filter(Boolean).join("\n");
}

function detectPrimary(abnormalities, q) {
  if (abnormalities.includes("代謝性アシドーシス")
    || abnormalities.includes("AG開大型代謝性アシドーシス")
    || abnormalities.includes("非開大型代謝性アシドーシス")) {
    return "met_acidosis";
  }
  if (abnormalities.includes("代謝性アルカローシス")) {
    return "met_alkalosis";
  }
  if (abnormalities.includes("呼吸性アシドーシス")) {
    return "resp_acidosis";
  }
  if (abnormalities.includes("呼吸性アルカローシス")) {
    return "resp_alkalosis";
  }
  if (q.ph < 7.35) {
    return q.hco3 < 22 ? "met_acidosis" : "resp_acidosis";
  }
  if (q.ph > 7.45) {
    return q.hco3 > 26 ? "met_alkalosis" : "resp_alkalosis";
  }
  return q.hco3 < 22 ? "met_acidosis" : "resp_acidosis";
}

function detectCompKind(abnormalities, primaryKind) {
  if (primaryKind.startsWith("met")) {
    if (abnormalities.includes("呼吸性アシドーシス")) return "resp_acidosis";
    if (abnormalities.includes("呼吸性アルカローシス")) return "resp_alkalosis";
    return "none";
  }
  if (abnormalities.includes("代謝性代償あり")) return "chronic";
  return "acute";
}

function buildPathologyOptions(correctList) {
  const options = new Set(correctList);
  while (options.size < 4 && options.size < PATHOLOGY_CHOICES.length) {
    const pick = PATHOLOGY_CHOICES[Math.floor(Math.random() * PATHOLOGY_CHOICES.length)];
    options.add(pick);
  }
  return Array.from(options);
}

function buildQuestion(caseDef) {
  const { gas } = caseDef;
  const abnormalities = caseDef.abnormalities || [];
  const ag = calcAG(gas);
  const corrAg = to1(calcCorrAG(ag, gas.alb));
  const corrHco3 = to1(calcCorrHCO3(gas.hco3, corrAg));
  const corrAgOptions = makeOptions(corrAg);
  const corrHco3Options = makeOptions(corrHco3);
  const primaryKind = detectPrimary(abnormalities, gas);
  const compKind = detectCompKind(abnormalities, primaryKind);
  const mixLabel = corrHco3 > 26
    ? "代謝性アルカローシスの合併"
    : corrHco3 < 22
      ? "非開大型代謝性アシドーシスの合併"
      : "純粋なAG開大型代謝性アシドーシス";
  const pathologyOptions = buildPathologyOptions(caseDef.pathologies || []);
  const q = {
    kind: "case",
    ph: gas.ph,
    paco2: gas.paco2,
    hco3: gas.hco3,
    na: gas.na,
    cl: gas.cl,
    alb: gas.alb,
    ag,
    step: 0,
    history: caseDef.history,
    abnormalities,
    testsOptions: caseDef.tests.options,
    correctTests: caseDef.tests.correct,
    pathologies: caseDef.pathologies,
    primaryKind,
    compKind,
    corrAg,
    corrAgOptions: corrAgOptions.options,
    corrAgCorrectIndex: corrAgOptions.correctIndex,
    corrHco3,
    corrHco3Options: corrHco3Options.options,
    corrHco3CorrectIndex: corrHco3Options.correctIndex,
    corrMixLabel: mixLabel,
    pathologyOptions,
    explainLines: [],
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
      return PRIMARY_CHOICES;
    case 1:
      if (q.primaryKind.startsWith("met")) return MET_COMP_CHOICES;
      return [
        "急性",
        q.primaryKind === "resp_acidosis"
          ? "慢性であり、代謝性アルカローシスが代償している"
          : "慢性であり、代謝性アシドーシスが代償している",
      ];
    case 2:
      return q.corrAgOptions.map((value) => value.toFixed(1));
    case 3:
      return q.corrHco3Options.map((value) => value.toFixed(1));
    case 4:
      return COMP_MIX_CHOICES;
    case 5:
      return q.testsOptions;
    default:
      return q.pathologyOptions;
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

function addExplainLine(q, label) {
  if (!label) return;
  const line = `・${label}`;
  if (!q.explainLines.includes(line)) q.explainLines.push(line);
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
    timeLimitStart: 10,
    timeLimitMin: 3,
    timeLimitDecay: 0.8,
    timeLimitRecover: 0.8,

    nextQuestion() {
      if (idx >= bank.length) {
        bank = makeBank(cases);
        idx = 0;
      }
      return bank[idx++];
    },

    getChoices(q) {
      const labels = getStepOptions(q);
      if (q.step === 5) {
        return { labels, multi: true, submitLabel: "決定" };
      }
      return { labels, multi: false };
    },

    advanceQuestion(q) {
      q.step = Math.min(q.step + 1, 6);
      applyStep(q);
    },

    checkChoice(q, selection) {
      const stepOptions = getStepOptions(q);
      const selected = normalizeSelection(selection);

      if (q.step === 0) {
        const expected = q.primaryKind === "met_acidosis"
          ? 0
          : q.primaryKind === "met_alkalosis"
            ? 1
            : q.primaryKind === "resp_acidosis"
              ? 2
              : 3;
        const correct = selection === expected;
        if (correct) addExplainLine(q, PRIMARY_CHOICES[expected]);
        return {
          correct,
          done: false,
          explanation: `主病態は「${PRIMARY_CHOICES[expected]}」。`,
          correctLabel: PRIMARY_CHOICES[expected],
        };
      }

      if (q.step === 1) {
        if (q.primaryKind.startsWith("met")) {
          const expected = q.compKind === "none" ? 0 : q.compKind === "resp_acidosis" ? 1 : 2;
          const correct = selection === expected;
          const label = MET_COMP_CHOICES[expected];
          if (correct && q.compKind !== "none") addExplainLine(q, label);
          return {
            correct,
            done: false,
            explanation: `代償は「${label}」。`,
            correctLabel: label,
          };
        }
        const label = q.primaryKind === "resp_acidosis"
          ? "慢性であり、代謝性アルカローシスが代償している"
          : "慢性であり、代謝性アシドーシスが代償している";
        const expected = q.compKind === "chronic" ? 1 : 0;
        const correct = selection === expected;
        if (correct && q.compKind === "chronic") {
          addExplainLine(q, q.primaryKind === "resp_acidosis" ? "代謝性アルカローシス" : "代謝性アシドーシス");
        }
        return {
          correct,
          done: false,
          explanation: expected === 0 ? "急性。" : `慢性で代償あり。`,
          correctLabel: expected === 0 ? "急性" : label,
        };
      }

      if (q.step === 2) {
        const correct = selection === q.corrAgCorrectIndex;
        const label = q.corrAgOptions[q.corrAgCorrectIndex].toFixed(1);
        return {
          correct,
          done: false,
          explanation: `補正AG=${q.corrAg.toFixed(1)}。`,
          correctLabel: label,
        };
      }

      if (q.step === 3) {
        const correct = selection === q.corrHco3CorrectIndex;
        const label = q.corrHco3Options[q.corrHco3CorrectIndex].toFixed(1);
        return {
          correct,
          done: false,
          explanation: `補正HCO₃=${q.corrHco3.toFixed(1)}。`,
          correctLabel: label,
        };
      }

      if (q.step === 4) {
        const expected = COMP_MIX_CHOICES.indexOf(q.corrMixLabel);
        const correct = selection === expected;
        if (correct) {
          if (q.corrMixLabel === "非開大型代謝性アシドーシスの合併") {
            addExplainLine(q, "非開大型代謝性アシドーシス");
          }
          if (q.corrMixLabel === "代謝性アルカローシスの合併") {
            addExplainLine(q, "代謝性アルカローシス");
          }
        }
        return {
          correct,
          done: false,
          explanation: `補正HCO₃から「${q.corrMixLabel}」。`,
          correctLabel: q.corrMixLabel,
        };
      }

      if (q.step === 5) {
        const correct = checkExactMatch(selected, q.correctTests, stepOptions);
        const label = formatList(q.correctTests);
        return {
          correct,
          done: false,
          explanation: `追加検査は「${label}」を優先。`,
          correctLabel: label,
        };
      }

      const correct = stepOptions[selection] && q.pathologies.includes(stepOptions[selection]);
      const label = q.pathologies[0] || "";
      return {
        correct,
        done: true,
        explanation: `最も考えられる疾患は「${label}」。`,
        correctLabel: label,
      };
    },
  };
}

export { PRIMARY_CHOICES, MET_COMP_CHOICES, TEST_POOL, PATHOLOGY_CHOICES };
