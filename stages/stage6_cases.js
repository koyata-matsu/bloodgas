export const CASES = [
  {
    id: "ag-01",
    gas: { ph: 7.32, paco2: 28, hco3: 14, na: 140, cl: 100, alb: 4.0 },
    abnormalities: ["代謝性アシドーシス", "AG開大型代謝性アシドーシス", "呼吸性アルカローシス"],
    tests: { options: ["血中乳酸", "SpO₂", "胸部X線", "BUN / Cr"], correct: ["血中乳酸"] },
    history: "高熱と悪寒を主訴に来院。血圧低下あり。呼吸数 30回/分。",
    pathologies: ["敗血症", "乳酸アシドーシス"],
  },
  {
    id: "ag-02",
    gas: { ph: 7.28, paco2: 26, hco3: 12, na: 138, cl: 98, alb: 3.8 },
    abnormalities: ["代謝性アシドーシス", "AG開大型代謝性アシドーシス", "呼吸性アルカローシス"],
    tests: { options: ["血中乳酸", "胸部X線", "SpO₂", "BUN / Cr"], correct: ["血中乳酸"] },
    history: "重症肺炎で入院中。意識低下と頻呼吸が出現。",
    pathologies: ["敗血症", "乳酸アシドーシス"],
  },
  {
    id: "ag-03",
    gas: { ph: 7.30, paco2: 30, hco3: 15, na: 135, cl: 95, alb: 4.2 },
    abnormalities: ["代謝性アシドーシス", "AG開大型代謝性アシドーシス"],
    tests: { options: ["血糖・尿ケトン", "BUN / Cr", "SpO₂", "尿電解質"], correct: ["血糖・尿ケトン"] },
    history: "若年男性。口渇・多飲・嘔吐。インスリン自己中断。",
    pathologies: ["DKA", "ケトアシドーシス"],
  },
  {
    id: "ag-04",
    gas: { ph: 7.24, paco2: 24, hco3: 11, na: 142, cl: 104, alb: 4.1 },
    abnormalities: ["代謝性アシドーシス", "AG開大型代謝性アシドーシス", "呼吸性アルカローシス"],
    tests: { options: ["血糖・尿ケトン", "血中乳酸", "SpO₂", "胸部X線"], correct: ["血糖・尿ケトン"] },
    history: "腹痛と悪心で受診。糖尿病の既往あり。",
    pathologies: ["DKA", "ケトアシドーシス"],
  },
  {
    id: "ag-05",
    gas: { ph: 7.31, paco2: 29, hco3: 14, na: 137, cl: 96, alb: 4.0 },
    abnormalities: ["代謝性アシドーシス", "AG開大型代謝性アシドーシス"],
    tests: { options: ["血糖・尿ケトン", "BUN / Cr", "尿電解質", "血中乳酸"], correct: ["血糖・尿ケトン"] },
    history: "飲酒量が増え、食事摂取が不良。嘔吐が続いている。",
    pathologies: ["アルコール性ケトアシドーシス", "ケトアシドーシス"],
  },
  {
    id: "ag-06",
    gas: { ph: 7.26, paco2: 27, hco3: 12, na: 139, cl: 99, alb: 3.6 },
    abnormalities: ["代謝性アシドーシス", "AG開大型代謝性アシドーシス", "呼吸性アルカローシス"],
    tests: { options: ["血糖・尿ケトン", "血中乳酸", "SpO₂", "尿電解質"], correct: ["血糖・尿ケトン"] },
    history: "長期飲酒後に嘔吐が持続。食事摂取が困難。",
    pathologies: ["アルコール性ケトアシドーシス", "ケトアシドーシス"],
  },
  {
    id: "ag-07",
    gas: { ph: 7.29, paco2: 31, hco3: 15, na: 145, cl: 106, alb: 3.4 },
    abnormalities: ["代謝性アシドーシス", "AG開大型代謝性アシドーシス"],
    tests: { options: ["BUN / Cr", "血中乳酸", "尿電解質", "SpO₂"], correct: ["BUN / Cr"] },
    history: "倦怠感が強く、尿量低下。浮腫が目立つ。",
    pathologies: ["腎不全"],
  },
  {
    id: "ag-08",
    gas: { ph: 7.22, paco2: 32, hco3: 13, na: 141, cl: 102, alb: 3.9 },
    abnormalities: ["代謝性アシドーシス", "AG開大型代謝性アシドーシス"],
    tests: { options: ["BUN / Cr", "血中乳酸", "尿電解質", "血糖・尿ケトン"], correct: ["BUN / Cr"] },
    history: "数日前から食欲不振。慢性腎臓病の既往あり。",
    pathologies: ["腎不全"],
  },
  {
    id: "ag-09",
    gas: { ph: 7.27, paco2: 25, hco3: 12, na: 136, cl: 96, alb: 4.3 },
    abnormalities: ["代謝性アシドーシス", "AG開大型代謝性アシドーシス", "呼吸性アルカローシス"],
    tests: { options: ["血中乳酸", "血糖・尿ケトン", "SpO₂", "胸部X線"], correct: ["血中乳酸"] },
    history: "痙攣発作後に意識混濁。頻呼吸が目立つ。",
    pathologies: ["乳酸アシドーシス"],
  },
  {
    id: "ag-10",
    gas: { ph: 7.20, paco2: 29, hco3: 11, na: 143, cl: 104, alb: 4.1 },
    abnormalities: ["代謝性アシドーシス", "AG開大型代謝性アシドーシス"],
    tests: { options: ["血中乳酸", "SpO₂", "胸部X線", "BUN / Cr"], correct: ["血中乳酸"] },
    history: "大量出血後に血圧低下。末梢冷感あり。",
    pathologies: ["乳酸アシドーシス"],
  },
  {
    id: "ag-11",
    gas: { ph: 7.33, paco2: 33, hco3: 17, na: 139, cl: 100, alb: 4.0 },
    abnormalities: ["代謝性アシドーシス", "AG開大型代謝性アシドーシス"],
    tests: { options: ["血糖・尿ケトン", "血中乳酸", "BUN / Cr", "尿電解質"], correct: ["血糖・尿ケトン"] },
    history: "インスリンを切らして数日。体重減少が顕著。",
    pathologies: ["DKA", "ケトアシドーシス"],
  },
  {
    id: "ag-12",
    gas: { ph: 7.25, paco2: 28, hco3: 12, na: 144, cl: 103, alb: 3.7 },
    abnormalities: ["代謝性アシドーシス", "AG開大型代謝性アシドーシス", "呼吸性アルカローシス"],
    tests: { options: ["血中乳酸", "胸部X線", "SpO₂", "BUN / Cr"], correct: ["血中乳酸"] },
    history: "高熱と頻呼吸。敗血症性ショック疑い。",
    pathologies: ["敗血症", "乳酸アシドーシス"],
  },
  {
    id: "ag-13",
    gas: { ph: 7.29, paco2: 27, hco3: 13, na: 134, cl: 94, alb: 4.2 },
    abnormalities: ["代謝性アシドーシス", "AG開大型代謝性アシドーシス", "呼吸性アルカローシス"],
    tests: { options: ["血糖・尿ケトン", "血中乳酸", "BUN / Cr", "尿電解質"], correct: ["血糖・尿ケトン"] },
    history: "糖尿病患者。腹痛と嘔吐で受診。",
    pathologies: ["DKA", "ケトアシドーシス"],
  },
  {
    id: "ag-14",
    gas: { ph: 7.27, paco2: 31, hco3: 14, na: 146, cl: 107, alb: 3.5 },
    abnormalities: ["代謝性アシドーシス", "AG開大型代謝性アシドーシス"],
    tests: { options: ["BUN / Cr", "血中乳酸", "SpO₂", "胸部X線"], correct: ["BUN / Cr"] },
    history: "慢性腎臓病で透析中断。浮腫が増悪。",
    pathologies: ["腎不全"],
  },
  {
    id: "ag-15",
    gas: { ph: 7.30, paco2: 30, hco3: 14, na: 138, cl: 98, alb: 4.1 },
    abnormalities: ["代謝性アシドーシス", "AG開大型代謝性アシドーシス"],
    tests: { options: ["血中乳酸", "血糖・尿ケトン", "SpO₂", "胸部X線"], correct: ["血中乳酸"] },
    history: "呼吸数が増加し、四肢冷感。循環不全を疑う。",
    pathologies: ["乳酸アシドーシス"],
  },
  {
    id: "nag-01",
    gas: { ph: 7.28, paco2: 30, hco3: 14, na: 140, cl: 114, alb: 4.0 },
    abnormalities: ["代謝性アシドーシス", "非開大型代謝性アシドーシス", "呼吸性アルカローシス"],
    tests: { options: ["尿電解質", "BUN / Cr", "血糖・尿ケトン", "尿Cl"], correct: ["尿電解質"] },
    history: "水様性下痢が続き、脱水が進行。",
    pathologies: ["下痢"],
  },
  {
    id: "nag-02",
    gas: { ph: 7.30, paco2: 32, hco3: 16, na: 136, cl: 110, alb: 3.9 },
    abnormalities: ["代謝性アシドーシス", "非開大型代謝性アシドーシス"],
    tests: { options: ["尿電解質", "尿Cl", "BUN / Cr", "SpO₂"], correct: ["尿電解質"] },
    history: "下痢が数日続き、体重が減少。",
    pathologies: ["下痢"],
  },
  {
    id: "nag-03",
    gas: { ph: 7.26, paco2: 29, hco3: 13, na: 142, cl: 116, alb: 4.2 },
    abnormalities: ["代謝性アシドーシス", "非開大型代謝性アシドーシス", "呼吸性アルカローシス"],
    tests: { options: ["尿電解質", "尿Cl", "BUN / Cr", "血糖・尿ケトン"], correct: ["尿電解質"] },
    history: "激しい下痢で来院。腹痛あり。",
    pathologies: ["下痢"],
  },
  {
    id: "nag-04",
    gas: { ph: 7.29, paco2: 31, hco3: 15, na: 138, cl: 112, alb: 3.8 },
    abnormalities: ["代謝性アシドーシス", "非開大型代謝性アシドーシス"],
    tests: { options: ["尿電解質", "BUN / Cr", "尿Cl", "SpO₂"], correct: ["尿電解質"] },
    history: "慢性的な下痢で体重減少。",
    pathologies: ["下痢"],
  },
  {
    id: "nag-05",
    gas: { ph: 7.31, paco2: 33, hco3: 17, na: 140, cl: 113, alb: 4.1 },
    abnormalities: ["代謝性アシドーシス", "非開大型代謝性アシドーシス"],
    tests: { options: ["尿電解質", "尿Cl", "BUN / Cr", "血糖・尿ケトン"], correct: ["尿電解質"] },
    history: "便が水様で回数が多い。",
    pathologies: ["下痢"],
  },
  {
    id: "nag-06",
    gas: { ph: 7.27, paco2: 35, hco3: 16, na: 137, cl: 111, alb: 4.0 },
    abnormalities: ["代謝性アシドーシス", "非開大型代謝性アシドーシス"],
    tests: { options: ["尿電解質", "尿Cl", "BUN / Cr", "血糖・尿ケトン"], correct: ["尿電解質"] },
    history: "尿路結石の既往。慢性的に代謝性アシドーシス。",
    pathologies: ["RTA"],
  },
  {
    id: "nag-07",
    gas: { ph: 7.33, paco2: 34, hco3: 18, na: 138, cl: 110, alb: 3.7 },
    abnormalities: ["代謝性アシドーシス", "非開大型代謝性アシドーシス"],
    tests: { options: ["尿電解質", "尿Cl", "BUN / Cr", "SpO₂"], correct: ["尿電解質"] },
    history: "多尿と腎結石。尿細管性アシドーシス疑い。",
    pathologies: ["RTA"],
  },
  {
    id: "nag-08",
    gas: { ph: 7.25, paco2: 32, hco3: 14, na: 141, cl: 115, alb: 4.2 },
    abnormalities: ["代謝性アシドーシス", "非開大型代謝性アシドーシス", "呼吸性アルカローシス"],
    tests: { options: ["尿電解質", "尿Cl", "BUN / Cr", "血糖・尿ケトン"], correct: ["尿電解質"] },
    history: "尿pHが高く、腎機能障害を指摘されている。",
    pathologies: ["RTA"],
  },
  {
    id: "nag-09",
    gas: { ph: 7.30, paco2: 34, hco3: 17, na: 136, cl: 109, alb: 3.9 },
    abnormalities: ["代謝性アシドーシス", "非開大型代謝性アシドーシス"],
    tests: { options: ["尿電解質", "尿Cl", "BUN / Cr", "SpO₂"], correct: ["尿電解質"] },
    history: "下痢はないが、尿pH異常を指摘。",
    pathologies: ["RTA"],
  },
  {
    id: "nag-10",
    gas: { ph: 7.32, paco2: 33, hco3: 17, na: 139, cl: 112, alb: 4.0 },
    abnormalities: ["代謝性アシドーシス", "非開大型代謝性アシドーシス"],
    tests: { options: ["尿電解質", "尿Cl", "BUN / Cr", "SpO₂"], correct: ["尿電解質"] },
    history: "慢性腎疾患でRTAの指摘あり。",
    pathologies: ["RTA"],
  },
  {
    id: "alk-01",
    gas: { ph: 7.52, paco2: 48, hco3: 36, na: 138, cl: 92, alb: 4.0 },
    abnormalities: ["代謝性アルカローシス", "呼吸性アシドーシス"],
    tests: { options: ["尿Cl", "BUN / Cr", "SpO₂", "尿電解質"], correct: ["尿Cl"] },
    history: "嘔吐が続き、脱水を伴う。",
    pathologies: ["嘔吐"],
  },
  {
    id: "alk-02",
    gas: { ph: 7.50, paco2: 46, hco3: 34, na: 136, cl: 90, alb: 4.1 },
    abnormalities: ["代謝性アルカローシス", "呼吸性アシドーシス"],
    tests: { options: ["尿Cl", "BUN / Cr", "SpO₂", "尿電解質"], correct: ["尿Cl"] },
    history: "胃管からの吸引が続いている。",
    pathologies: ["嘔吐"],
  },
  {
    id: "alk-03",
    gas: { ph: 7.48, paco2: 44, hco3: 32, na: 140, cl: 95, alb: 4.0 },
    abnormalities: ["代謝性アルカローシス"],
    tests: { options: ["尿Cl", "BUN / Cr", "SpO₂", "尿電解質"], correct: ["尿Cl"] },
    history: "利尿薬を使用中。",
    pathologies: ["利尿薬使用"],
  },
  {
    id: "alk-04",
    gas: { ph: 7.49, paco2: 45, hco3: 33, na: 139, cl: 94, alb: 3.9 },
    abnormalities: ["代謝性アルカローシス"],
    tests: { options: ["尿Cl", "BUN / Cr", "SpO₂", "尿電解質"], correct: ["尿Cl"] },
    history: "嘔吐が長引き、体重が減少。",
    pathologies: ["嘔吐"],
  },
  {
    id: "alk-05",
    gas: { ph: 7.46, paco2: 42, hco3: 30, na: 138, cl: 93, alb: 4.2 },
    abnormalities: ["代謝性アルカローシス"],
    tests: { options: ["尿Cl", "尿電解質", "SpO₂", "BUN / Cr"], correct: ["尿Cl"] },
    history: "慢性の嘔吐がある。",
    pathologies: ["嘔吐"],
  },
  {
    id: "alk-06",
    gas: { ph: 7.47, paco2: 46, hco3: 32, na: 140, cl: 91, alb: 4.0 },
    abnormalities: ["代謝性アルカローシス", "呼吸性アシドーシス"],
    tests: { options: ["尿Cl", "BUN / Cr", "SpO₂", "尿電解質"], correct: ["尿Cl"] },
    history: "利尿薬で治療中。",
    pathologies: ["利尿薬使用"],
  },
  {
    id: "resp-01",
    gas: { ph: 7.30, paco2: 60, hco3: 30, na: 139, cl: 102, alb: 4.0 },
    abnormalities: ["呼吸性アシドーシス", "代謝性代償あり"],
    tests: { options: ["SpO₂", "胸部X線", "尿電解質", "BUN / Cr"], correct: ["SpO₂", "胸部X線"] },
    history: "COPDで在宅酸素。呼吸困難が増悪。",
    pathologies: ["COPD増悪"],
  },
  {
    id: "resp-02",
    gas: { ph: 7.32, paco2: 58, hco3: 29, na: 138, cl: 101, alb: 4.1 },
    abnormalities: ["呼吸性アシドーシス", "代謝性代償あり"],
    tests: { options: ["SpO₂", "胸部X線", "尿電解質", "BUN / Cr"], correct: ["SpO₂", "胸部X線"] },
    history: "COPD既往。喫煙歴が長い。",
    pathologies: ["COPD増悪"],
  },
  {
    id: "resp-03",
    gas: { ph: 7.28, paco2: 62, hco3: 28, na: 140, cl: 103, alb: 3.8 },
    abnormalities: ["呼吸性アシドーシス", "代謝性代償あり"],
    tests: { options: ["SpO₂", "胸部X線", "尿電解質", "BUN / Cr"], correct: ["SpO₂", "胸部X線"] },
    history: "慢性閉塞性肺疾患で入院歴あり。",
    pathologies: ["COPD増悪"],
  },
  {
    id: "resp-04",
    gas: { ph: 7.36, paco2: 52, hco3: 29, na: 137, cl: 100, alb: 4.0 },
    abnormalities: ["呼吸性アシドーシス", "代謝性代償あり"],
    tests: { options: ["SpO₂", "胸部X線", "BUN / Cr", "尿電解質"], correct: ["SpO₂", "胸部X線"] },
    history: "慢性の喫煙歴。労作時呼吸困難。",
    pathologies: ["COPD増悪"],
  },
  {
    id: "resp-05",
    gas: { ph: 7.28, paco2: 66, hco3: 30, na: 139, cl: 102, alb: 4.2 },
    abnormalities: ["呼吸性アシドーシス", "代謝性代償あり"],
    tests: { options: ["SpO₂", "胸部X線", "BUN / Cr", "尿電解質"], correct: ["SpO₂", "胸部X線"] },
    history: "慢性肺疾患の既往あり。",
    pathologies: ["COPD増悪"],
  },
  {
    id: "resp-06",
    gas: { ph: 7.46, paco2: 30, hco3: 22, na: 140, cl: 102, alb: 4.0 },
    abnormalities: ["呼吸性アルカローシス", "代謝性代償なし"],
    tests: { options: ["SpO₂", "胸部X線", "BUN / Cr", "尿電解質"], correct: ["SpO₂", "胸部X線"] },
    history: "若年女性。急な息切れと不安発作。",
    pathologies: ["過換気症候群"],
  },
  {
    id: "resp-07",
    gas: { ph: 7.48, paco2: 28, hco3: 21, na: 138, cl: 101, alb: 4.1 },
    abnormalities: ["呼吸性アルカローシス", "代謝性代償なし"],
    tests: { options: ["SpO₂", "胸部X線", "BUN / Cr", "尿電解質"], correct: ["SpO₂", "胸部X線"] },
    history: "過換気発作で来院。胸部異常なし。",
    pathologies: ["過換気症候群"],
  },
  {
    id: "resp-08",
    gas: { ph: 7.47, paco2: 29, hco3: 22, na: 137, cl: 100, alb: 3.9 },
    abnormalities: ["呼吸性アルカローシス", "代謝性代償なし"],
    tests: { options: ["SpO₂", "胸部X線", "BUN / Cr", "尿電解質"], correct: ["SpO₂", "胸部X線"] },
    history: "精神的ストレス後に頻呼吸。",
    pathologies: ["過換気症候群"],
  },
  {
    id: "resp-09",
    gas: { ph: 7.44, paco2: 32, hco3: 22, na: 139, cl: 102, alb: 4.0 },
    abnormalities: ["呼吸性アルカローシス", "代謝性代償なし"],
    tests: { options: ["SpO₂", "胸部X線", "BUN / Cr", "尿電解質"], correct: ["SpO₂", "胸部X線"] },
    history: "検査結果を待つ間に過換気が出現。",
    pathologies: ["過換気症候群"],
  },
  {
    id: "resp-10",
    gas: { ph: 7.45, paco2: 31, hco3: 22, na: 136, cl: 99, alb: 4.2 },
    abnormalities: ["呼吸性アルカローシス", "代謝性代償なし"],
    tests: { options: ["SpO₂", "胸部X線", "尿電解質", "BUN / Cr"], correct: ["SpO₂", "胸部X線"] },
    history: "不安感が強く過換気が続く。",
    pathologies: ["過換気症候群"],
  },
];

const LIST_SEPARATORS = /[|、・;]/;

function splitList(value) {
  if (!value) return [];
  if (Array.isArray(value)) return value.map((item) => String(item).trim()).filter(Boolean);
  return String(value)
    .split(LIST_SEPARATORS)
    .map((item) => item.trim())
    .filter(Boolean);
}

function parseNumber(value) {
  if (value == null || value === "") return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function normalizeCase(raw, index) {
  const gas = {
    ph: parseNumber(raw.ph),
    paco2: parseNumber(raw.paco2),
    hco3: parseNumber(raw.hco3),
    na: parseNumber(raw.na),
    cl: parseNumber(raw.cl),
    alb: parseNumber(raw.alb),
  };
  const testsOptions = splitList(raw.testsOptions ?? raw.tests_options ?? raw.tests);
  const correctTests = splitList(raw.correctTests ?? raw.correct_tests ?? raw.tests_correct);
  return {
    id: raw.id || `case-${index + 1}`,
    gas,
    abnormalities: splitList(raw.abnormalities),
    tests: {
      options: testsOptions,
      correct: correctTests,
    },
    history: raw.history || "",
    pathologies: splitList(raw.pathologies),
  };
}

function parseCsv(text) {
  const rows = [];
  let current = "";
  let row = [];
  let inQuotes = false;
  for (let i = 0; i < text.length; i += 1) {
    const char = text[i];
    if (char === '"') {
      if (inQuotes && text[i + 1] === '"') {
        current += '"';
        i += 1;
      } else {
        inQuotes = !inQuotes;
      }
      continue;
    }
    if (!inQuotes && (char === "," || char === "\n")) {
      row.push(current.trim());
      current = "";
      if (char === "\n") {
        rows.push(row);
        row = [];
      }
      continue;
    }
    if (char === "\r") continue;
    current += char;
  }
  if (current.length || row.length) {
    row.push(current.trim());
    rows.push(row);
  }
  return rows.filter((cols) => cols.some((value) => value !== ""));
}

function buildCasesFromRows(rows) {
  if (!rows.length) return [];
  const [headerRow, ...dataRows] = rows;
  const headers = headerRow.map((key) => key.trim());
  return dataRows.map((cols, index) => {
    const raw = {};
    headers.forEach((key, i) => {
      raw[key] = cols[i] ?? "";
    });
    return normalizeCase(raw, index);
  });
}

function buildCasesFromJson(data) {
  if (!data) return [];
  const rawCases = Array.isArray(data) ? data : data.cases;
  if (!Array.isArray(rawCases)) return [];
  return rawCases.map((raw, index) => normalizeCase(raw, index));
}

export async function loadStage6Cases(url) {
  if (!url) return CASES;
  try {
    const response = await fetch(url, { cache: "no-store" });
    if (!response.ok) throw new Error(`Failed to load cases: ${response.status}`);
    const contentType = response.headers.get("content-type") || "";
    if (contentType.includes("application/json") || url.endsWith(".json")) {
      const data = await response.json();
      const cases = buildCasesFromJson(data);
      return cases.length ? cases : CASES;
    }
    const text = await response.text();
    const rows = parseCsv(text);
    const cases = buildCasesFromRows(rows);
    return cases.length ? cases : CASES;
  } catch (error) {
    console.warn("Failed to load Stage 6 cases", error);
    return CASES;
  }
}
