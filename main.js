import { mountUI } from "./ui/dom.js";
import { createGame } from "./engine/game.js";
import { stage1 } from "./stages/stage1.js";
import { stage2 } from "./stages/stage2.js";

const ui = mountUI();
const game = createGame(ui, {
  stages: [stage1, stage2], // 3〜5も追加していく
});

game.boot(); // メニュー表示→ステージ選択→開始
