import { shuffle } from "../utils/rand.js";

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

const CASES = [
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
    history: "利尿薬を開始してからめまいが出現。",
    pathologies: ["利尿薬使用"],
  },
  {
    id: "alk-04",
    gas: { ph: 7.53, paco2: 50, hco3: 39, na: 142, cl: 94, alb: 3.9 },
    abnormalities: ["代謝性アルカローシス", "呼吸性アシドーシス"],
    tests: { options: ["尿Cl", "尿電解質", "BUN / Cr", "SpO₂"], correct: ["尿Cl"] },
    history: "ループ利尿薬の内服を継続中。",
    pathologies: ["利尿薬使用"],
  },
  {
    id: "alk-05",
    gas: { ph: 7.49, paco2: 47, hco3: 35, na: 137, cl: 91, alb: 4.2 },
    abnormalities: ["代謝性アルカローシス", "呼吸性アシドーシス"],
    tests: { options: ["尿Cl", "尿電解質", "BUN / Cr", "SpO₂"], correct: ["尿Cl"] },
    history: "反復する嘔吐。低カリウム血症がある。",
    pathologies: ["嘔吐"],
  },
  {
    id: "alk-06",
    gas: { ph: 7.51, paco2: 45, hco3: 35, na: 139, cl: 93, alb: 4.0 },
    abnormalities: ["代謝性アルカローシス"],
    tests: { options: ["尿Cl", "尿電解質", "BUN / Cr", "SpO₂"], correct: ["尿Cl"] },
    history: "利尿薬を自己判断で増量。",
    pathologies: ["利尿薬使用"],
  },
  {
    id: "alk-07",
    gas: { ph: 7.47, paco2: 42, hco3: 31, na: 135, cl: 92, alb: 3.8 },
    abnormalities: ["代謝性アルカローシス"],
    tests: { options: ["尿Cl", "尿電解質", "BUN / Cr", "SpO₂"], correct: ["尿Cl"] },
    history: "摂食障害があり、嘔吐を繰り返している。",
    pathologies: ["嘔吐"],
  },
  {
    id: "alk-08",
    gas: { ph: 7.54, paco2: 52, hco3: 41, na: 141, cl: 96, alb: 4.1 },
    abnormalities: ["代謝性アルカローシス", "呼吸性アシドーシス"],
    tests: { options: ["尿Cl", "尿電解質", "SpO₂", "BUN / Cr"], correct: ["尿Cl"] },
    history: "長期間の利尿薬使用と食欲低下。",
    pathologies: ["利尿薬使用"],
  },
  {
    id: "alk-09",
    gas: { ph: 7.46, paco2: 43, hco3: 30, na: 138, cl: 94, alb: 4.0 },
    abnormalities: ["代謝性アルカローシス"],
    tests: { options: ["尿Cl", "尿電解質", "BUN / Cr", "SpO₂"], correct: ["尿Cl"] },
    history: "嘔吐後に脱水症状が強い。",
    pathologies: ["嘔吐"],
  },
  {
    id: "alk-10",
    gas: { ph: 7.52, paco2: 49, hco3: 37, na: 140, cl: 93, alb: 4.2 },
    abnormalities: ["代謝性アルカローシス", "呼吸性アシドーシス"],
    tests: { options: ["尿Cl", "尿電解質", "BUN / Cr", "SpO₂"], correct: ["尿Cl"] },
    history: "利尿薬使用中で、最近体重減少が進む。",
    pathologies: ["利尿薬使用"],
  },
  {
    id: "resp-01",
    gas: { ph: 7.29, paco2: 62, hco3: 24, na: 138, cl: 102, alb: 4.0 },
    abnormalities: ["呼吸性アシドーシス", "代謝性代償なし"],
    tests: { options: ["胸部X線", "SpO₂", "血中乳酸", "BUN / Cr"], correct: ["胸部X線"] },
    history: "急な呼吸困難。喘鳴が強い。",
    pathologies: ["COPD増悪"],
  },
  {
    id: "resp-02",
    gas: { ph: 7.33, paco2: 58, hco3: 30, na: 140, cl: 100, alb: 3.9 },
    abnormalities: ["呼吸性アシドーシス", "代謝性代償あり"],
    tests: { options: ["胸部X線", "SpO₂", "BUN / Cr", "尿電解質"], correct: ["胸部X線"] },
    history: "長期喫煙歴あり。慢性的な呼吸苦。",
    pathologies: ["COPD増悪"],
  },
  {
    id: "resp-03",
    gas: { ph: 7.25, paco2: 70, hco3: 28, na: 137, cl: 98, alb: 4.1 },
    abnormalities: ["呼吸性アシドーシス", "代謝性代償あり"],
    tests: { options: ["胸部X線", "SpO₂", "BUN / Cr", "血中乳酸"], correct: ["胸部X線"] },
    history: "COPDで在宅酸素療法中。咳嗽増悪。",
    pathologies: ["COPD増悪"],
  },
  {
    id: "resp-04",
    gas: { ph: 7.31, paco2: 65, hco3: 26, na: 139, cl: 101, alb: 4.0 },
    abnormalities: ["呼吸性アシドーシス", "代謝性代償なし"],
    tests: { options: ["SpO₂", "胸部X線", "BUN / Cr", "血中乳酸"], correct: ["SpO₂"] },
    history: "鎮静薬使用後に呼吸が浅い。",
    pathologies: ["COPD増悪"],
  },
  {
    id: "resp-05",
    gas: { ph: 7.35, paco2: 60, hco3: 33, na: 141, cl: 100, alb: 3.8 },
    abnormalities: ["呼吸性アシドーシス", "代謝性代償あり"],
    tests: { options: ["胸部X線", "SpO₂", "BUN / Cr", "尿電解質"], correct: ["胸部X線"] },
    history: "慢性呼吸不全で定期通院中。",
    pathologies: ["COPD増悪"],
  },
  {
    id: "resp-06",
    gas: { ph: 7.55, paco2: 24, hco3: 23, na: 139, cl: 103, alb: 4.2 },
    abnormalities: ["呼吸性アルカローシス", "代謝性代償なし"],
    tests: { options: ["SpO₂", "胸部X線", "血中乳酸", "BUN / Cr"], correct: ["SpO₂"] },
    history: "不安発作で過呼吸。手指のしびれあり。",
    pathologies: ["過換気症候群"],
  },
  {
    id: "resp-07",
    gas: { ph: 7.48, paco2: 28, hco3: 20, na: 138, cl: 102, alb: 4.0 },
    abnormalities: ["呼吸性アルカローシス", "代謝性代償あり"],
    tests: { options: ["SpO₂", "胸部X線", "血中乳酸", "BUN / Cr"], correct: ["SpO₂"] },
    history: "発熱と呼吸数増加。",
    pathologies: ["過換気症候群"],
  },
  {
    id: "resp-08",
    gas: { ph: 7.52, paco2: 26, hco3: 21, na: 140, cl: 105, alb: 3.9 },
    abnormalities: ["呼吸性アルカローシス", "代謝性代償あり"],
    tests: { options: ["SpO₂", "胸部X線", "血中乳酸", "BUN / Cr"], correct: ["SpO₂"] },
    history: "めまいと動悸。過呼吸が続く。",
    pathologies: ["過換気症候群"],
  },
  {
    id: "resp-09",
    gas: { ph: 7.50, paco2: 29, hco3: 22, na: 137, cl: 101, alb: 4.1 },
    abnormalities: ["呼吸性アルカローシス", "代謝性代償なし"],
    tests: { options: ["SpO₂", "胸部X線", "血中乳酸", "BUN / Cr"], correct: ["SpO₂"] },
    history: "急な不安と過呼吸。",
    pathologies: ["過換気症候群"],
  },
  {
    id: "resp-10",
    gas: { ph: 7.46, paco2: 32, hco3: 22, na: 140, cl: 103, alb: 4.0 },
    abnormalities: ["呼吸性アルカローシス", "代謝性代償なし"],
    tests: { options: ["SpO₂", "胸部X線", "血中乳酸", "BUN / Cr"], correct: ["SpO₂"] },
    history: "緊張で呼吸数が増加。",
    pathologies: ["過換気症候群"],
  },
  {
    id: "mix-01",
    gas: { ph: 7.40, paco2: 30, hco3: 18, na: 138, cl: 98, alb: 4.1 },
    abnormalities: ["代謝性アシドーシス", "AG開大型代謝性アシドーシス", "代謝性アルカローシス"],
    tests: { options: ["血糖・尿ケトン", "尿Cl", "血中乳酸", "BUN / Cr"], correct: ["血糖・尿ケトン", "尿Cl"] },
    history: "糖尿病患者。嘔吐が続いている。",
    pathologies: ["DKA", "嘔吐"],
  },
  {
    id: "mix-02",
    gas: { ph: 7.28, paco2: 60, hco3: 26, na: 140, cl: 104, alb: 4.0 },
    abnormalities: ["代謝性アシドーシス", "非開大型代謝性アシドーシス", "呼吸性アシドーシス"],
    tests: { options: ["尿電解質", "胸部X線", "SpO₂", "BUN / Cr"], correct: ["尿電解質", "胸部X線"] },
    history: "慢性の下痢に加えて呼吸困難が出現。",
    pathologies: ["下痢", "COPD増悪"],
  },
  {
    id: "mix-03",
    gas: { ph: 7.37, paco2: 25, hco3: 14, na: 139, cl: 101, alb: 3.9 },
    abnormalities: ["代謝性アシドーシス", "AG開大型代謝性アシドーシス", "呼吸性アルカローシス"],
    tests: { options: ["血中乳酸", "血糖・尿ケトン", "SpO₂", "胸部X線"], correct: ["血中乳酸", "SpO₂"] },
    history: "敗血症の治療中に過呼吸が出現。",
    pathologies: ["敗血症", "乳酸アシドーシス"],
  },
  {
    id: "mix-04",
    gas: { ph: 7.34, paco2: 52, hco3: 28, na: 137, cl: 95, alb: 4.2 },
    abnormalities: ["呼吸性アシドーシス", "代謝性アルカローシス", "代謝性代償あり"],
    tests: { options: ["胸部X線", "尿Cl", "SpO₂", "BUN / Cr"], correct: ["胸部X線", "尿Cl"] },
    history: "COPDで利尿薬使用中。浮腫と呼吸苦が悪化。",
    pathologies: ["COPD増悪", "利尿薬使用"],
  },
  {
    id: "mix-05",
    gas: { ph: 7.42, paco2: 32, hco3: 20, na: 140, cl: 100, alb: 4.0 },
    abnormalities: ["代謝性アシドーシス", "AG開大型代謝性アシドーシス", "呼吸性アルカローシス"],
    tests: { options: ["血糖・尿ケトン", "血中乳酸", "SpO₂", "BUN / Cr"], correct: ["血糖・尿ケトン", "血中乳酸"] },
    history: "糖尿病患者で発熱と頻呼吸。",
    pathologies: ["DKA", "乳酸アシドーシス"],
  },
  {
    id: "ag-16",
    gas: { ph: 7.18, paco2: 30, hco3: 11, na: 142, cl: 100, alb: 3.2 },
    abnormalities: ["代謝性アシドーシス", "AG開大型代謝性アシドーシス", "呼吸性アルカローシス"],
    tests: { options: ["血中乳酸", "胸部X線", "SpO₂", "BUN / Cr"], correct: ["血中乳酸"] },
    history: "敗血症疑いでショック。冷汗と頻呼吸。",
    pathologies: ["敗血症", "乳酸アシドーシス"],
  },
  {
    id: "ag-17",
    gas: { ph: 7.24, paco2: 27, hco3: 12, na: 137, cl: 96, alb: 4.0 },
    abnormalities: ["代謝性アシドーシス", "AG開大型代謝性アシドーシス", "呼吸性アルカローシス"],
    tests: { options: ["血糖・尿ケトン", "血中乳酸", "BUN / Cr", "胸部X線"], correct: ["血糖・尿ケトン"] },
    history: "口渇と多尿。インスリン未使用が続いている。",
    pathologies: ["DKA", "ケトアシドーシス"],
  },
  {
    id: "ag-18",
    gas: { ph: 7.27, paco2: 29, hco3: 13, na: 139, cl: 98, alb: 4.1 },
    abnormalities: ["代謝性アシドーシス", "AG開大型代謝性アシドーシス"],
    tests: { options: ["血糖・尿ケトン", "BUN / Cr", "尿電解質", "血中乳酸"], correct: ["血糖・尿ケトン"] },
    history: "絶食が続いた後に嘔吐。飲酒歴あり。",
    pathologies: ["アルコール性ケトアシドーシス", "ケトアシドーシス"],
  },
  {
    id: "nag-11",
    gas: { ph: 7.29, paco2: 33, hco3: 16, na: 141, cl: 112, alb: 3.9 },
    abnormalities: ["代謝性アシドーシス", "非開大型代謝性アシドーシス"],
    tests: { options: ["尿電解質", "尿Cl", "BUN / Cr", "SpO₂"], correct: ["尿電解質"] },
    history: "腎結石の既往。尿pH高値でRTA疑い。",
    pathologies: ["RTA"],
  },
  {
    id: "nag-12",
    gas: { ph: 7.31, paco2: 34, hco3: 17, na: 138, cl: 111, alb: 4.0 },
    abnormalities: ["代謝性アシドーシス", "非開大型代謝性アシドーシス"],
    tests: { options: ["尿電解質", "BUN / Cr", "尿Cl", "SpO₂"], correct: ["尿電解質"] },
    history: "水様性下痢が続き、脱水症状が強い。",
    pathologies: ["下痢"],
  },
  {
    id: "alk-11",
    gas: { ph: 7.50, paco2: 46, hco3: 34, na: 137, cl: 90, alb: 4.0 },
    abnormalities: ["代謝性アルカローシス", "呼吸性アシドーシス"],
    tests: { options: ["尿Cl", "尿電解質", "BUN / Cr", "SpO₂"], correct: ["尿Cl"] },
    history: "反復する嘔吐と脱水。",
    pathologies: ["嘔吐"],
  },
  {
    id: "alk-12",
    gas: { ph: 7.48, paco2: 45, hco3: 33, na: 139, cl: 92, alb: 4.1 },
    abnormalities: ["代謝性アルカローシス"],
    tests: { options: ["尿Cl", "尿電解質", "BUN / Cr", "SpO₂"], correct: ["尿Cl"] },
    history: "利尿薬を追加してから筋力低下。",
    pathologies: ["利尿薬使用"],
  },
  {
    id: "resp-11",
    gas: { ph: 7.28, paco2: 64, hco3: 24, na: 140, cl: 101, alb: 3.8 },
    abnormalities: ["呼吸性アシドーシス", "代謝性代償なし"],
    tests: { options: ["SpO₂", "胸部X線", "BUN / Cr", "血中乳酸"], correct: ["SpO₂"] },
    history: "COPD既往。急な呼吸苦とCO₂貯留。",
    pathologies: ["COPD増悪"],
  },
  {
    id: "resp-12",
    gas: { ph: 7.36, paco2: 58, hco3: 32, na: 138, cl: 99, alb: 4.0 },
    abnormalities: ["呼吸性アシドーシス", "代謝性代償あり"],
    tests: { options: ["胸部X線", "SpO₂", "BUN / Cr", "尿電解質"], correct: ["胸部X線"] },
    history: "長期喫煙歴。慢性的に息切れ。",
    pathologies: ["COPD増悪"],
  },
  {
    id: "resp-13",
    gas: { ph: 7.54, paco2: 26, hco3: 22, na: 139, cl: 104, alb: 4.1 },
    abnormalities: ["呼吸性アルカローシス", "代謝性代償なし"],
    tests: { options: ["SpO₂", "胸部X線", "血中乳酸", "BUN / Cr"], correct: ["SpO₂"] },
    history: "強い不安と過換気。手指のしびれ。",
    pathologies: ["過換気症候群"],
  },
  {
    id: "mix-06",
    gas: { ph: 7.36, paco2: 50, hco3: 28, na: 138, cl: 94, alb: 4.2 },
    abnormalities: ["呼吸性アシドーシス", "代謝性アルカローシス", "代謝性代償あり"],
    tests: { options: ["胸部X線", "尿Cl", "SpO₂", "BUN / Cr"], correct: ["胸部X線", "尿Cl"] },
    history: "COPDで利尿薬使用中。嘔吐もある。",
    pathologies: ["COPD増悪", "利尿薬使用", "嘔吐"],
  },
  {
    id: "mix-07",
    gas: { ph: 7.40, paco2: 28, hco3: 17, na: 141, cl: 100, alb: 4.0 },
    abnormalities: ["代謝性アシドーシス", "AG開大型代謝性アシドーシス", "呼吸性アルカローシス"],
    tests: { options: ["血中乳酸", "血糖・尿ケトン", "SpO₂", "胸部X線"], correct: ["血中乳酸", "SpO₂"] },
    history: "肺炎で入院中。呼吸数増加と低酸素。",
    pathologies: ["敗血症", "乳酸アシドーシス"],
  },
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

function makeBank() {
  return shuffle(CASES.map((c) => buildQuestion(c)));
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

export function createStage6() {
  let bank = makeBank();
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
        bank = makeBank();
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
