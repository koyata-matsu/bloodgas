import { createUI } from "./ui/dom.js";
import { createAudio } from "./ui/audio.js";
import { createGame } from "./engine/game.js";

import { stage1 } from "./stages/stage1.js";
import { stage2 } from "./stages/stage2.js";
import { stage3 } from "./stages/stage3.js";
import { stage4 } from "./stages/stage4.js";
import { stage5 } from "./stages/stage5.js";

const LS_UNLOCK_KEY = "bg_unlocked_stage_max";

export function bootApp() {
  const ui = createUI();
  const audio = createAudio(ui);
  const stages = [stage1, stage2, stage3, stage4, stage5];

  const game = createGame({ ui, audio, stages });

  // --- unlock ---
  const getUnlockedMax = () => Number(localStorage.getItem(LS_UNLOCK_KEY) || "1");
  const setUnlockedMax = (v) => localStorage.setItem(LS_UNLOCK_KEY, String(v));

  function applyUnlockUI() {
    const unlockedMax = getUnlockedMax();
    ui.setStageButtons(stages.map((stage) => ({
      id: stage.id,
      status: stage.id > unlockedMax ? "locked" : "unlocked",
    })));
  }

  function unlockStage(stageId) {
    const unlockedMax = getUnlockedMax();
    if (stageId > unlockedMax) setUnlockedMax(stageId);
    applyUnlockUI();
  }

  // --- UI events ---
  ui.onSelectStage((stageId) => {
    const unlockedMax = getUnlockedMax();
    if (stageId > unlockedMax) return; // locked
    game.setStage(stageId);
    ui.enableNextToLesson(true);
  });

  ui.onGoLesson(() => ui.showScreen("lesson"));
  ui.onBackToMenu(() => ui.showScreen("menu"));

  ui.onGoGame(() => {
    ui.showScreen("game");
    game.prepareRun();
  });

  ui.onStart(() => {
    audio.unlockByGesture(); // autoplay対策
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
    // 次ステージへ（解放済みなら）
    const next = Math.min(game.stage.id + 1, stages.length);
    const unlockedMax = getUnlockedMax();
    if (next <= unlockedMax) {
      game.setStage(next);
      ui.showScreen("lesson"); // 次ステージ説明画面へ（今は共通）
      ui.setLessonTitle(stages[next - 1].name);
    } else {
      ui.showScreen("menu");
    }
  });

  // --- Game callbacks ---
  game.onUnlockStage((stageId) => {
    unlockStage(stageId);
    audio.unlock();
    ui.flashMessage(`✅ ステージ${stageId} 解放！`);
  });

  game.onBgmMode((mode) => audio.bgm(mode)); // "early" | "late"
  game.onSFX((name) => audio.sfx(name));     // "ok" | "bad" | "finish" | "gameover"

  game.onHUD((hud) => ui.setHUD(hud));
  game.onHP((hp) => ui.setHP(hp));
  game.onFeedback((text) => ui.setFeedback(text));
  game.onJudgeFX((ok) => ui.showJudge(ok));

  game.onShowCompPrompt(() => ui.showCompButtons(true));
  game.onHideCompPrompt(() => ui.showCompButtons(false));

  game.onResult((result) => {
    // クリアしたら次ステージ解放（最低でも次のIDまで）
    if (result.cleared) unlockStage(Math.min(game.stage.id + 1, stages.length));
    // 18問到達でも解放（Stage1/2共通）
    if (result.unlockedNextStageId) unlockStage(result.unlockedNextStageId);

    ui.showResult(result);
  });

  // 初期表示
  applyUnlockUI();
  ui.setLessonTitle(stage1.name);
  ui.showScreen("menu");
}
