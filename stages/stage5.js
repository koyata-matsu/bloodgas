import { shuffle, randInt } from "../utils/rand.js";

const GROUPS = [
  {
    key: "agHigh",
    label: "AG開大型代謝性アシドーシス",
    causes: [
      "乳酸アシドーシス",
      "ケトアシドーシス（DKA / アルコール / 飢餓）",
      "尿毒症（腎不全）",
      "中毒（メタノール・エチレングリコール）",
      "サリチル酸中毒",
    ],
  },
  {
    key: "agNormal",
    label: "非開大型（正常AG）代謝性アシドーシス",
    causes: [
      "下痢",
      "腎性尿細管性アシドーシス（RTA）",
      "大量生食負荷",
      "腎不全（初期）",
    ],
  },
  {
    key: "metAlk",
    label: "代謝性アルカローシス",
    causes: [
      "嘔吐 / 胃液喪失",
      "利尿薬",
      "低K血症",
      "ミネラルコルチコイド過剰",
    ],
  },
  {
    key: "respAcid",
    label: "呼吸性アシドーシス",
    causes: [
      "COPD",
      "中枢抑制（鎮静薬・麻薬）",
      "神経筋疾患",
      "気道閉塞",
    ],
  },
  {
    key: "respAlk",
    label: "呼吸性アルカローシス",
    causes: [
      "過換気症候群",
      "敗血症",
      "妊娠",
      "肝不全",
    ],
  },
];

function makeOtherPool(groupKey) {
  const pool = [];
  GROUPS.forEach((group) => {
    if (group.key === groupKey) return;
    group.causes.forEach((cause) => pool.push(cause));
  });
  return pool;
}

function makeOptions(correct, otherPool) {
  const set = new Set([correct]);
  while (set.size < 4) {
    const pick = otherPool[randInt(0, otherPool.length - 1)];
    set.add(pick);
  }
  return shuffle(Array.from(set));
}

function makeQuestion(group) {
  const correct = group.causes[randInt(0, group.causes.length - 1)];
  const otherPool = makeOtherPool(group.key);
  const options = makeOptions(correct, otherPool);

  return {
    kind: "judge",
    prompt: "この病態でまず考えるべき鑑別は？",
    items: [
      { k: "酸塩基異常", v: group.label },
    ],
    options,
    correctIndex: options.indexOf(correct),
  };
}

function makeBank() {
  const bank = [];
  const repeatPerCause = 6;
  GROUPS.forEach((group) => {
    group.causes.forEach(() => {
      for (let i = 0; i < repeatPerCause; i++) {
        bank.push(makeQuestion(group));
      }
    });
  });
  return shuffle(bank);
}

export function createStage5() {
  let bank = makeBank();
  let idx = 0;

  return {
    id: 6,
    name: "ステージ5：鑑別フェーズ（絶対覚えるもの）",
    unlockNeed: 18,
    clearCount: 30,
    overlapStart: 14,
    needsComp: false,

    lessonHTML: `
      <div class="lessonBox">
        <h3>ステージ5：鑑別フェーズ（絶対覚えるもの）</h3>
        <div class="oneBlock">
          <div>以下の酸塩基異常が認められた。</div>
          <div>この病態でまず考えるべき鑑別として最も適切なのはどれ？</div>
        </div>
      </div>

      <div class="lessonBox">
        <h3>① AG開大型代謝性アシドーシス</h3>
        <div class="oneBlock">
          <div><b>絶対覚える鑑別（5つ）</b></div>
          <div>・乳酸アシドーシス</div>
          <div>・ケトアシドーシス（DKA / アルコール / 飢餓）</div>
          <div>・尿毒症（腎不全）</div>
          <div>・中毒（メタノール・エチレングリコール）</div>
          <div>・サリチル酸中毒</div>
        </div>
        <p class="muted">国試・救急ともに超頻出。AG開大＝体内に酸が増えている。</p>
      </div>

      <div class="lessonBox">
        <h3>② 非開大型（正常AG）代謝性アシドーシス</h3>
        <div class="oneBlock">
          <div><b>絶対覚える鑑別（4つ）</b></div>
          <div>・下痢</div>
          <div>・腎性尿細管性アシドーシス（RTA）</div>
          <div>・大量生食負荷</div>
          <div>・腎不全（初期）</div>
        </div>
        <p class="muted">HCO₃⁻が失われているパターン。下痢とRTAは鉄板。</p>
      </div>

      <div class="lessonBox">
        <h3>③ 代謝性アルカローシス</h3>
        <div class="oneBlock">
          <div><b>絶対覚える鑑別（4つ）</b></div>
          <div>・嘔吐 / 胃液喪失</div>
          <div>・利尿薬</div>
          <div>・低K血症</div>
          <div>・ミネラルコルチコイド過剰</div>
        </div>
        <p class="muted">消化管・薬剤・Kは必須。Cl反応性／非反応性はこのステージでは扱わない。</p>
      </div>

      <div class="lessonBox">
        <h3>④ 呼吸性アシドーシス</h3>
        <div class="oneBlock">
          <div><b>絶対覚える鑑別（4つ）</b></div>
          <div>・COPD</div>
          <div>・中枢抑制（鎮静薬・麻薬）</div>
          <div>・神経筋疾患</div>
          <div>・気道閉塞</div>
        </div>
        <p class="muted">換気ができていない代表例。COPDは慢性の代表。</p>
      </div>

      <div class="lessonBox">
        <h3>⑤ 呼吸性アルカローシス</h3>
        <div class="oneBlock">
          <div><b>絶対覚える鑑別（4つ）</b></div>
          <div>・過換気症候群</div>
          <div>・敗血症</div>
          <div>・妊娠</div>
          <div>・肝不全</div>
        </div>
        <p class="muted">呼吸が速すぎる代表。敗血症はAG開大とのセットで出やすい。</p>
      </div>

      <div class="lessonBox">
        <h3>選択肢の作り方</h3>
        <div class="oneBlock">
          <div>鑑別は<b>4択</b>。</div>
          <div>正解は「代表的な原因」。</div>
          <div>残りは別タイプの酸塩基異常や、ありえなくはないが優先度が低いもの。</div>
        </div>
      </div>
    `,

    startDesc: "酸塩基異常から代表的な鑑別を4択で即答！",

    nextQuestion() {
      if (idx >= bank.length) {
        bank = makeBank();
        idx = 0;
      }
      return bank[idx++];
    },

    getChoices(q) {
      return q.options;
    },

    checkChoice(q, choiceIdx) {
      return choiceIdx === q.correctIndex;
    },

    maxConcurrent(correct, spawnedCount) {
      return (correct >= 9 || spawnedCount >= 9) ? 2 : 1;
    },
  };
}
