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

export function createStage5() {
  let bank = shuffle([...QUESTION_BANK]);
  let idx = 0;

  return {
    id: 6,
    name: "ステージ5：原因検索",
    unlockNeed: 18,
    clearCount: 30,
    overlapStart: 14,
    needsComp: false,
    choices: CHOICES_STAGE5,

    lessonHTML: `
      <div class="lessonBox">
        <h3>ステージ5：原因検索</h3>
        <div class="oneBlock">
          <div>酸塩基異常を見つけたら、次に<b>原因検索</b>へ進む。</div>
          <div>病態ごとに次に確認すべき項目を押さえる。</div>
        </div>
      </div>

      <div class="lessonBox">
        <h3>AG開大型代謝性アシドーシス</h3>
        <div class="oneBlock">
          <div><b>乳酸</b> → 敗血症・ショック</div>
          <div><b>浸透圧ギャップ</b> → 中毒</div>
          <div><b>血糖、尿ケトン</b></div>
        </div>
      </div>

      <div class="lessonBox">
        <h3>非開大型（正常AG）代謝性アシドーシス</h3>
        <div class="oneBlock">
          <div><b>尿中AG</b></div>
          <div><b>尿中浸透圧</b></div>
        </div>
      </div>

      <div class="lessonBox">
        <h3>代謝性アルカローシス</h3>
        <div class="oneBlock">
          <div><b>尿Cl</b></div>
        </div>
      </div>

      <div class="lessonBox">
        <h3>呼吸性アシドーシス</h3>
        <div class="oneBlock">
          <div><b>換気低下の原因検索</b></div>
          <div>COPD・肺炎・中枢抑制（麻薬の使用歴）</div>
        </div>
      </div>

      <div class="lessonBox">
        <h3>呼吸性アルカローシス</h3>
        <div class="oneBlock">
          <div><b>過換気だけじゃない！</b></div>
          <div>低酸素</div>
          <div>敗血症の除外</div>
        </div>
      </div>
    `,

    startDesc: "病態から次に確認すべき項目を即答！",

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
      return choiceIdx === q.ans;
    },
  };
}
