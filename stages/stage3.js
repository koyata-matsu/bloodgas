import { shuffle, randInt } from "../utils/rand.js";

// Stage3: 3 patterns
// (1) Na,Cl,HCO3 -> AG
// (2) AG,Alb -> corrAG (Alb=4.0も混ぜる)
// (3) corrAG,HCO3 -> corrHCO3

const BASE_AG = 12;

function to1(x){ return Math.round(x * 10) / 10; }

function calcAG(na, cl, hco3){
  return na - (cl + hco3);
}
function calcCorrAG(ag, alb){
  return ag + 2.5 * Math.max(0, 4.0 - alb);
}
function calcCorrHCO3(hco3, corrAg){
  return hco3 + (corrAg - BASE_AG);
}

function makeWrong10to20_1dp(){
  const base = randInt(10, 20);
  const dec = randInt(0, 9) / 10;
  return to1(base + dec);
}

function makeOptions(correct){
  // correctは小数1桁で統一
  const set = new Set([correct]);
  while(set.size < 4){
    let w;
    if(Math.random() < 0.7){
      w = makeWrong10to20_1dp();
    } else {
      w = to1(correct + randInt(-25, 25)/10); // 近傍
    }
    if(!Number.isFinite(w)) continue;
    if(w < 0) continue;
    set.add(w);
  }
  const arr = Array.from(set);
  for(let i=arr.length-1;i>0;i--){
    const j = Math.floor(Math.random()*(i+1));
    [arr[i],arr[j]]=[arr[j],arr[i]];
  }
  return { options: arr, correctIndex: arr.indexOf(correct) };
}

function makeQ_type1_AG(){
  const na = randInt(125,155);
  const cl = randInt(90,120);
  const hco3 = randInt(4,28);
  const ag = to1(calcAG(na,cl,hco3));

  const {options, correctIndex} = makeOptions(ag);

  return {
    kind: "calc",
    prompt: "AGは？",
    items: [
      { k:"Na", v: String(na) },
      { k:"Cl", v: String(cl) },
      { k:"HCO3", v: String(hco3) },
    ],
    options, correctIndex,
    correctValue: ag,
    calc: { na, cl, hco3 },
  };
}

function makeQ_type2_corrAG(){
  // Alb=4.0（補正不要）を混ぜる：30%
  const alb = (Math.random() < 0.30) ? 4 : randInt(2, 5); // 2〜5 g/dL
  const ag = to1(randInt(6,30)); // AGを与える（計算しない）
  const corrAg = to1(calcCorrAG(ag, alb));

  const {options, correctIndex} = makeOptions(corrAg);

  return {
    kind: "calc",
    prompt: "補正AGは？",
    items: [
      { k:"AG", v: ag.toFixed(1) },
      { k:"Alb", v: alb.toFixed(1), unit:"g/dL" },
    ],
    options,
    correctIndex,
    correctValue: corrAg,
    calc: { ag, alb },
    speedMult: 0.85,
  };
}

function makeQ_type3_corrHCO3(){
  const corrAg = to1(randInt(15,35));     // 補正AGを与える（14以下にしない）
  const hco3 = to1(randInt(4,28));        // HCO3を与える
  const corrHco3 = to1(calcCorrHCO3(hco3, corrAg));
  let correctLabel = "純粋なAG開大型";
  if(corrHco3 > 26) correctLabel = "代謝性アルカローシス合併";
  if(corrHco3 < 22) correctLabel = "非開大型代謝性アシドーシス合併";
  const options = shuffle([
    "代謝性アルカローシス合併",
    "非開大型代謝性アシドーシス合併",
    "純粋なAG開大型",
  ]);
  const correctIndex = options.indexOf(correctLabel);

  return {
    kind: "judge",
    prompt: "補正AG:〇〇、HCO3：〇〇\n補正HCO3から鑑別せよ",
    items: [
      { k:"補正AG", v: corrAg.toFixed(1) },
      { k:"HCO3", v: hco3.toFixed(1) },
    ],
    options, correctIndex,
    correctValue: corrHco3,
  };
}

function makeQuestion(){
  const r = Math.random();
  if(r < 0.34) return makeQ_type1_AG();
  if(r < 0.67) return makeQ_type2_corrAG();
  return makeQ_type3_corrHCO3();
}

export function createStage3(){
  let bank = shuffle(Array.from({length: 240}, () => makeQuestion()));
  let idx = 0;

  return {
    id: 4,
    name: "ステージ3：AG計算と補正",
    unlockNeed: 30,
    clearCount: Infinity,
    overlapStart: 15,
    hints: [
      "AG=Na-(Cl+HCO₃) / 補正AG=AG+2.5×(4.0-Alb) / 補正HCO₃=HCO₃+(補正AG-12)",
    ],

    // 2レーンなし（速度のみ上昇）
    maxConcurrent(){
      return 1;
    },

    lessonHTML: `
      <div class="lessonBox">
        <h3>ステージ3：AG計算と補正</h3>
        <div class="oneBlock">
          <div><b>① AG = Na − (Cl + HCO₃)</b></div>
          <div><b>② 補正AG = AG + 2.5 × max(0, 4.0 − Alb)</b></div>
          <div><b>③ 補正HCO₃ = HCO₃ + (補正AG − 12)</b></div>
        </div>
        <p class="muted">Albが4.0なら補正不要。Albが高い場合は補正しない。</p>
      </div>

      <div class="lessonBox">
        <h3>補正HCO₃の読み方</h3>
        <div class="oneBlock">
          <div><b>22〜26</b> → 純粋なAG開大型代謝性アシドーシス</div>
          <div><b>&lt;22</b> → 非開大型代謝性アシドーシスの合併</div>
          <div><b>&gt;26</b> → 代謝性アルカローシスの合併</div>
        </div>
      </div>

      <div class="lessonBox">
        <h3>実戦の流れ</h3>
        <div class="oneBlock">
          <div>① AGで開大の有無 → ② Albで補正 → ③ 補正HCO₃で混合を判断。</div>
          <div>数値を拾いながら<b>順番に計算</b>するとミスが減る。</div>
        </div>
      </div>
    `,
    startDesc: "3パターン（AG / 補正AG / 補正HCO3）を4択で計算！",

    nextQuestion(){
      if(idx >= bank.length){
        bank = shuffle(Array.from({length: 240}, () => makeQuestion()));
        idx = 0;
      }
      return bank[idx++];
    },

    // 毎問choicesが違う
    getChoices(q){
      if(q.kind === "judge") return q.options;
      return q.options.map(x => Number(x).toFixed(1));
    },

    checkChoice(q, choiceIdx){
      const correct = choiceIdx === q.correctIndex;
      let explanation = "";
      let correctLabel = "";
      if (q.kind === "calc" && q.prompt === "AGは？") {
        const calc = q.calc || {};
        explanation = `AG=${calc.na}-(${calc.cl}+${calc.hco3})=${q.correctValue.toFixed(1)}。`;
        correctLabel = q.options[q.correctIndex].toFixed(1);
      } else if (q.kind === "calc") {
        const calc = q.calc || {};
        explanation = `補正AG=${calc.ag.toFixed(1)}+2.5×(4.0-${calc.alb.toFixed(1)})=${q.correctValue.toFixed(1)}。`;
        correctLabel = q.options[q.correctIndex].toFixed(1);
      } else {
        const corr = q.correctValue;
        const label = q.options[q.correctIndex];
        explanation = `補正HCO₃=${corr.toFixed(1)}なので「${label}」。`;
        correctLabel = label;
      }
      return {
        correct,
        explanation,
        correctLabel,
      };
    },
  };
}
