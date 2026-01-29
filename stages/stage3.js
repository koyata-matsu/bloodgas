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
    options, correctIndex
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
    options, correctIndex
  };
}

function makeQ_type3_corrHCO3(){
  const corrAg = to1(randInt(12,35));     // 補正AGを与える
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
    prompt: "AG開大性代謝性アシドーシスが見られた。補正HCO3の値は？ AG。。。。。",
    items: [
      { k:"補正AG", v: corrAg.toFixed(1) },
      { k:"HCO3", v: hco3.toFixed(1) },
    ],
    options, correctIndex
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
    id: 3,
    name: "ステージ3：AG計算と補正",
    unlockNeed: 18,      // ★18問で次ステージ解放
    clearCount: 30,
    overlapStart: 14,

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
        <p class="muted">（Alb=4.0の「補正不要」やAlb&gt;4.0の「補正なし」も出る）</p>
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
      return choiceIdx === q.correctIndex;
    },
  };
}
