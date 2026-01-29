import { shuffle } from "../utils/rand.js";

const CHOICES_STAGE5 = [
  "乳酸・浸透圧ギャップ・血糖/尿ケトン",
  "尿中AG・尿中浸透圧",
  "尿Cl",
  "換気低下の原因検索（COPD・肺炎・中枢抑制）",
  "低酸素/敗血症の除外（過換気だけじゃない）",
];

const QUESTION_BANK = [
  { condition: "AG開大型代謝性アシドーシス", ans: 0 },
  { condition: "非開大型（正常AG）代謝性アシドーシス", ans: 1 },
  { condition: "代謝性アルカローシス", ans: 2 },
  { condition: "呼吸性アシドーシス", ans: 3 },
  { condition: "呼吸性アルカローシス", ans: 4 },
];

const CONDITION_EXPLAIN = {
  "AG開大型代謝性アシドーシス": "乳酸・浸透圧ギャップ・血糖/尿ケトンを優先。",
  "非開大型（正常AG）代謝性アシドーシス": "尿中AGや尿中浸透圧で腎性/腸管性を評価。",
  "代謝性アルカローシス": "尿Clで嘔吐/利尿薬などの反応性を確認。",
  "呼吸性アシドーシス": "換気低下の原因（COPD・肺炎・中枢抑制）を探す。",
  "呼吸性アルカローシス": "低酸素・敗血症・過換気の鑑別を急ぐ。",
};

export function createStage5() {
  let bank = shuffle([...QUESTION_BANK]);
  let idx = 0;

  return {
    id: 6,
    name: "ステージ5：原因検索の優先順位",
    unlockNeed: 18,
    clearCount: 30,
    overlapStart: 14,
    needsComp: false,
    choices: CHOICES_STAGE5,
    hints: [
      "正常値: AG 8–12 / HCO₃⁻ 22–26",
      "計算式: 病態の分類が先（AG開大/非開大、呼吸性か代謝性か）",
      "覚える: 病態ごとの最初の検査を1つずつ覚える",
    ],

    lessonHTML: `
      <div class="lessonBox">
        <h3>ステージ5：原因検索の優先順位</h3>
        <div class="oneBlock">
          <div>酸塩基異常を見つけたら、次に<b>原因検索</b>へ進む。</div>
          <div>病態ごとに「最初に確認すべき検査」を整理する。</div>
        </div>
      </div>

      <div class="lessonBox">
        <h3>AG開大型代謝性アシドーシス</h3>
        <div class="oneBlock">
          <div><b>乳酸</b> → 敗血症・ショックを評価</div>
          <div><b>血糖/尿ケトン</b> → DKA・ケトアシドーシス</div>
          <div><b>浸透圧ギャップ</b> → 中毒性アシドーシス</div>
        </div>
      </div>

      <div class="lessonBox">
        <h3>非開大型（正常AG）代謝性アシドーシス</h3>
        <div class="oneBlock">
          <div><b>尿中AG</b> → 腎性（RTA）と腸管性（下痢）を区別</div>
          <div><b>尿中浸透圧</b> → NH₄⁺排泄の低下を評価</div>
        </div>
      </div>

      <div class="lessonBox">
        <h3>代謝性アルカローシス</h3>
        <div class="oneBlock">
          <div><b>尿Cl</b>で反応性（嘔吐/利尿薬）を評価</div>
        </div>
      </div>

      <div class="lessonBox">
        <h3>呼吸性アシドーシス</h3>
        <div class="oneBlock">
          <div><b>換気低下の原因検索</b></div>
          <div>COPD・肺炎・中枢抑制（鎮静薬/麻薬）</div>
        </div>
      </div>

      <div class="lessonBox">
        <h3>呼吸性アルカローシス</h3>
        <div class="oneBlock">
          <div><b>過換気だけじゃない！</b></div>
          <div>低酸素・敗血症・疼痛/不安も評価</div>
        </div>
      </div>
    `,

    startDesc: "病態別に「最初に確認すべき検査」を即答！",

    nextQuestion() {
      if (idx >= bank.length) {
        bank = shuffle([...QUESTION_BANK]);
        idx = 0;
      }
      const q = bank[idx++];
      return {
        kind: "topic",
        prompt: "次に確認すべき項目は？",
        items: [{ k: "病態", v: q.condition }],
        ans: q.ans,
      };
    },

    maxConcurrent(correct, spawnedCount) {
      return (correct >= 9 || spawnedCount >= 9) ? 2 : 1;
    },

    checkChoice(q, choiceIdx) {
      const correct = choiceIdx === q.ans;
      const label = CHOICES_STAGE5[q.ans];
      const explanation = CONDITION_EXPLAIN[q.items[0].v] || "病態ごとの優先検査を確認。";
      return {
        correct,
        explanation,
        correctLabel: label,
      };
    },
  };
}
