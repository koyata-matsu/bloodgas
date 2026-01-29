import { createUI } from "./ui/dom.js";
import { createAudio } from "./ui/audio.js";
import { createGame } from "./engine/game.js";

import { createStage0 } from "./stages/stage0.js";
import { createStage1 } from "./stages/stage1.js";
import { createStage2 } from "./stages/stage2.js";
import { createStage3 } from "./stages/stage3.js";
import { createStage4 } from "./stages/stage4.js";
import { createStage5 } from "./stages/stage5.js";

const LS_UNLOCK_KEY = "bg_unlocked_stage_max";

const ui = createUI();
const audio = createAudio();

const stages = [
  createStage0(),
  createStage1(),
  createStage2(),
  createStage3(),
  createStage4(),
  createStage5(),
];

const game = createGame({ ui, audio, stages });

let selectedStageId = 1;

function getUnlockedMax() {
  return 6;
}
function setUnlockedMax(v) {
  localStorage.setItem(LS_UNLOCK_KEY, String(v));
}
function unlockUpTo(stageId) {
  const cur = getUnlockedMax();
  if (stageId > cur) setUnlockedMax(stageId);
  ui.setStageButtons(getUnlockedMax());
}

function applyStageToLesson(stageId) {
  const st = stages[stageId - 1];
  ui.setLessonTitle(st.name);
  const lessonBody = document.getElementById("lessonBody");
  if (lessonBody) lessonBody.innerHTML = st.lessonHTML || "";
  ui.enableNextToLesson(true);

  // start overlay text
  const startTitle = document.getElementById("startTitle");
  const startDesc = document.getElementById("startDesc");
  if (startTitle) startTitle.textContent = st.name;
  if (startDesc) startDesc.textContent = st.startDesc || "スタートして開始";
}

// ---- menu stage selection ----
ui.onSelectStage((stageId) => {
  selectedStageId = stageId;
  game.setStage(stageId);
  applyStageToLesson(stageId);
  ui.showScreen("lesson"); // ★ステージ2は必ず解説ページへ → 全ステージこれで統一
});

// ---- screen navigation ----
ui.onGoLesson(() => ui.showScreen("lesson"));
ui.onBackToMenu(() => ui.showScreen("menu"));

ui.onGoGame(() => {
  ui.showScreen("game");
  game.prepareRun();
});

ui.onStart(() => {
  audio.unlockByGesture();
  audio.click();
  ui.hideStartOverlay();
  game.startRun();
});

ui.onToggleNormals(() => ui.toggleNormalsPanel());
ui.onPauseToggle(() => game.togglePause());

ui.onRestart(() => game.prepareRun());
ui.onExit(() => {
  game.stop();
  audio.stopBGM();
  ui.showScreen("menu");
});

// result modal
ui.onResultRetry(() => {
  ui.hideResult();
  game.prepareRun();
});

ui.onResultMenu(() => {
  ui.hideResult();
  game.stop();
  audio.stopBGM();
  ui.showScreen("menu");
});

ui.onResultNextStage(() => {
  ui.hideResult();
  const nextId = Math.min(selectedStageId + 1, stages.length);
  if (nextId <= getUnlockedMax()) {
    selectedStageId = nextId;
    game.setStage(nextId);
    applyStageToLesson(nextId);
    ui.showScreen("lesson");
  } else {
    ui.showScreen("menu");
  }
});

// ---- game callbacks ----
game.onUnlockStage((stageId) => {
  unlockUpTo(stageId);
  audio.unlock();
});

game.onBgmMode((mode) => audio.bgm(mode));

game.onSFX((name) => {
  if (name === "ok") audio.ok();
  if (name === "bad") audio.bad();
  if (name === "finish") audio.finish();
  if (name === "gameover") audio.gameover();
});

game.onHUD((hud) => ui.setHUD(hud.stat, hud.sub));
game.onHP((hp, hpMax, anim) => ui.setHP(hp, hpMax, anim));
game.onFeedback((text) => ui.setFeedback(text));
game.onJudgeFX((ok) => ui.showJudge(ok));

game.onResult((result) => {
  // 18問到達で解放 or クリアで次解放
  if (result.unlockedNextStageId) unlockUpTo(result.unlockedNextStageId);
  if (result.cleared) unlockUpTo(Math.min(result.stageId + 1, stages.length));

  // 次ボタンを押せるように
  ui.showResult(result);
});

// init
ui.setStageButtons(getUnlockedMax());
applyStageToLesson(1);
ui.showScreen("menu");
