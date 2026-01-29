import { clamp } from "../utils/rand.js";
import { applyLayout, pickTargetIndex, effectiveX } from "./layout.js";

export function createGame({ ui, audio, stages }) {
  const state = {
    stage: stages[0],

    running: false,
    paused: false,
    rafId: null,
    lastTs: null,

    hp: 60,
    hpMax: 100,
    timeLimitSec: 15.0,

    spawnedCount: 0,
    correct: 0,
    misses: 0,

    spawnCooldown: 1.6,
    lastSpawnAt: -999, // sec
    minGapTwoLane: 0.8,

    inputLocked: false,

    slowHoldSec: 0,
    slowMult: 1.0,

    cards: [], // {q, laneId, baseLeft, x, bornAt, el}
  };

  // callbacks
  let cbUnlockStage = () => {};
  let cbBgmMode = () => {};
  let cbSfx = () => {};
  let cbHUD = () => {};
  let cbHP = () => {};
  let cbFeedback = () => {};
  let cbJudgeFX = () => {};
  let cbResult = () => {};

  function getMaxConcurrent() {
    return state.stage.maxConcurrent
      ? state.stage.maxConcurrent(state.correct, state.spawnedCount)
      : (state.spawnedCount >= state.stage.overlapStart ? 2 : 1);
  }

  function updateChoicesForTarget() {
    if (!state.cards.length) {
      // 何も無い時は固定choicesがあれば出す
      if (state.stage.choices) ui.renderChoices(state.stage.choices);
      return;
    }
    const tIdx = pickTargetIndex(state.cards);
    if (tIdx < 0) return;
    const q = state.cards[tIdx].q;

    // ★毎問違うchoices（Stage3など）
    if (typeof state.stage.getChoices === "function") {
      ui.renderChoices(state.stage.getChoices(q));
      return;
    }
    // ★固定choices（Stage1/2など）
    if (state.stage.choices) {
      ui.renderChoices(state.stage.choices);
      return;
    }
    // fallback
    ui.renderChoices(["..."]);
  }

  function forceRelayoutAll() {
    const maxNow = getMaxConcurrent();
    const tIdx = pickTargetIndex(state.cards);

    for (let i = 0; i < state.cards.length; i++) {
      const c = state.cards[i];
      c.baseLeft = applyLayout({
        laneEl: ui.el.lane,
        el: c.el,
        laneId: c.laneId,
        maxConcurrent: maxNow,
        topY: ui.layout.TOP_Y,
        rowGap: ui.layout.ROW_GAP,
        pad: ui.layout.PAD,
        gap: ui.layout.COL_GAP,
        cardMinW: ui.layout.CARD_W_MIN,
        cardMaxW: ui.layout.CARD_W_MAX,
      });
      c.el.style.transform = `translateX(${c.x}px)`;

      if (i === tIdx) {
        c.el.style.border = ui.layout.TARGET_BORDER;
        c.el.style.boxShadow = ui.layout.TARGET_SHADOW;
      } else {
        c.el.style.border = ui.layout.NORMAL_BORDER;
        c.el.style.boxShadow = "none";
      }
    }
    ui.setLaneHeight(maxNow);
  }

  function stop() {
    if (state.rafId != null) cancelAnimationFrame(state.rafId);
    state.rafId = null;
    state.lastTs = null;
  }

  function setHP(v, anim = null) {
    state.hp = clamp(v, 0, state.hpMax);
    cbHP(state.hp, state.hpMax, anim);
    ui.setHP(state.hp, state.hpMax, anim);
    if (state.running && state.hp <= 0) finish(false, null);
  }

  function setHUD() {
    const remainUnlock = Math.max(0, state.stage.unlockNeed - state.correct);
    const remainClear = Math.max(0, state.stage.clearCount - state.correct);
    cbHUD({
      stat: `${state.stage.name} / 次ステージまで ${remainUnlock}問`,
      sub: `クリアまで ${remainClear}問 / ミス ${state.misses}`,
    });
  }

  function triggerSlow() {
    state.slowHoldSec = 1.0;
    state.slowMult = 0.18;
  }

  function clearCards() {
    for (const c of state.cards) c.el?.remove();
    state.cards = [];
  }

  function resetRun() {
    state.running = false;
    state.paused = false;
    stop();

    state.hpMax = 100;
    state.hp = 60;
    state.timeLimitSec = 15.0;

    state.spawnedCount = 0;
    state.correct = 0;
    state.misses = 0;

    state.spawnCooldown = 1.6;
    state.lastSpawnAt = -999;
    state.inputLocked = false;

    state.slowHoldSec = 0;
    state.slowMult = 1.0;

    clearCards();
    audio.stopBGM();
    cbBgmMode("early");

    ui.showCompButtons(false);

    setHP(state.hp, null);
    setHUD();
    cbFeedback("");
    ui.setLaneHeight(getMaxConcurrent());

    // ★ここでchoicesを安全に描画
    updateChoicesForTarget();
  }

  function spawnCard() {
    const maxNow = getMaxConcurrent();
    if (state.cards.length >= maxNow) return;

    // lane assignment: 0 then 1
    const used0 = state.cards.some(c => c.laneId === 0);
    const used1 = state.cards.some(c => c.laneId === 1);
    const laneId = !used0 ? 0 : (!used1 ? 1 : null);
    if (laneId == null) return;

    const q = state.stage.nextQuestion();
    const el = ui.createCardElement(q);
    ui.el.lane.appendChild(el);

    state.cards.push({
      q,
      laneId,
      baseLeft: 0,
      x: ui.el.lane.clientWidth + 30,
      bornAt: performance.now(),
      el,
    });

    state.spawnedCount += 1;
    state.timeLimitSec = Math.max(4.5, state.timeLimitSec - 0.08);
    state.lastSpawnAt = performance.now() / 1000;

    cbBgmMode(state.spawnedCount >= state.stage.overlapStart ? "late" : "early");
    forceRelayoutAll();

    // ★ターゲットが変わるので必ず更新
    updateChoicesForTarget();
  }

  function calcSpawnIntervalSec() {
    const t = clamp((state.spawnedCount - state.stage.overlapStart) / 20, 0, 1);
    const v = 2.8 + (1.2 - 2.8) * t;
    return Math.max(0.8, v);
  }

  function ensureSpawn(dt) {
    state.spawnCooldown -= dt;

    const maxNow = getMaxConcurrent();
    const nowSec = performance.now() / 1000;

    if (maxNow === 1) {
      if (state.cards.length === 0 && state.spawnCooldown <= 0) {
        spawnCard();
        state.spawnCooldown = calcSpawnIntervalSec();
      }
      return;
    }

    // 2レーン：上下まとめて0.8秒未満禁止、1回に1枚だけ
    const gapOk = (nowSec - state.lastSpawnAt) >= state.minGapTwoLane;
    if (state.cards.length < 2 && state.spawnCooldown <= 0 && gapOk) {
      spawnCard();
      state.spawnCooldown = calcSpawnIntervalSec();
    }
  }

  function removeCardAt(idx) {
    const c = state.cards[idx];
    if (!c) return;
    c.el?.remove();
    state.cards.splice(idx, 1);
    forceRelayoutAll();

    // ★カードが消えたらターゲットが変わるので更新
    updateChoicesForTarget();
  }

  function unlockNextIfNeeded() {
    if (state.correct >= state.stage.unlockNeed) {
      const nextId = Math.min(state.stage.id + 1, stages.length);
      cbUnlockStage(nextId);
      return nextId;
    }
    return null;
  }

  function finish(cleared, unlockedNextStageId) {
    state.running = false;
    state.paused = true;
    stop();
    audio.stopBGM();

    cbSfx(cleared ? "finish" : "gameover");

    cbResult({
      stageId: state.stage.id,
      stageName: state.stage.name,
      cleared,
      correct: state.correct,
      clearCount: state.stage.clearCount,
      misses: state.misses,
      rate: Math.round((state.correct / Math.max(1, state.spawnedCount)) * 100),
      unlockedNextStageId,
      canGoNext: Boolean(unlockedNextStageId),
    });
  }

  function handleWrong(text, loss) {
    state.misses += 1;
    cbSfx("bad");
    cbJudgeFX(false);
    cbFeedback(text);
    triggerSlow();

    setHP(state.hp - loss, "loss");
    ui.shakeHP();

    const tIdx = pickTargetIndex(state.cards);
    if (tIdx >= 0) removeCardAt(tIdx);

    setHUD();
    const unlocked = unlockNextIfNeeded();

    if (state.correct >= state.stage.clearCount) {
      finish(true, unlocked ?? Math.min(state.stage.id + 1, stages.length));
    }
  }

  function handleCorrect(text = "OK！") {
    cbSfx("ok");
    cbJudgeFX(true);
    cbFeedback(text);
  }

  function answer(choiceIdx) {
    if (!state.running || state.paused || state.inputLocked) return;
    if (!state.cards.length) return;

    const tIdx = pickTargetIndex(state.cards);
    if (tIdx < 0) return;

    const card = state.cards[tIdx];

    const ok = state.stage.checkChoice(card.q, choiceIdx);
    if (!ok) {
      handleWrong("ミス！", 10);
      return;
    }

    handleCorrect();

    // complete card
    state.correct += 1;

    const elapsed = (performance.now() - card.bornAt) / 1000;
    const timeLeft = Math.max(0, state.timeLimitSec - elapsed);

    setHP(state.hp + (5 + 0.9 * timeLeft), "gain");
    state.timeLimitSec = Math.max(4.5, state.timeLimitSec - 0.55);

    removeCardAt(tIdx);

    const unlocked = unlockNextIfNeeded();
    setHUD();

    if (state.correct >= state.stage.clearCount) {
      finish(true, unlocked ?? Math.min(state.stage.id + 1, stages.length));
    }
  }

  function loop(ts) {
    if (!state.running || state.paused) return;

    if (state.lastTs == null) {
      state.lastTs = ts;
      state.rafId = requestAnimationFrame(loop);
      return;
    }

    let dt = (ts - state.lastTs) / 1000;
    state.lastTs = ts;
    if (!Number.isFinite(dt) || dt < 0 || dt > 0.25) dt = 0;

    // slow
    let mult = 1.0;
    if (state.slowHoldSec > 0) {
      state.slowHoldSec -= dt;
      mult = 0.18;
      if (state.slowHoldSec <= 0) state.slowHoldSec = 0;
    } else {
      if (state.slowMult < 1.0) state.slowMult = Math.min(1.0, state.slowMult + dt * 0.9);
      mult = state.slowMult;
    }

    // HP drain
    setHP(state.hp - (0.9 + 0.015 * state.spawnedCount) * dt, null);
    if (state.hp <= 0) return;

    ensureSpawn(dt);

    // move
    const startX = ui.el.lane.clientWidth + 30;
    const dist = Math.max(1, startX - ui.layout.MISS_X);
    const baseSpeed = dist / Math.max(0.001, state.timeLimitSec);
    const speed = baseSpeed * mult;

    for (const c of state.cards) c.x -= speed * dt;

    // miss check
    const tIdx = pickTargetIndex(state.cards);
    if (tIdx >= 0) {
      const t = state.cards[tIdx];
      if (effectiveX(t) <= ui.layout.MISS_X) {
        handleWrong("取り逃し！", 14);
      }
    }

    forceRelayoutAll();
    state.rafId = requestAnimationFrame(loop);
  }

  function prepareRun() {
    resetRun();
    ui.showStartOverlay(state.stage.name);

    // ★ここが重要：固定choicesが無いステージでも落ちない
    if (state.stage.choices) {
      ui.renderChoices(state.stage.choices);
    } else {
      ui.renderChoices(["スタートしてね"]);
    }
  }

  function startRun() {
    if (state.running) return;
    state.running = true;
    state.paused = false;
    state.lastTs = null;

    if (state.cards.length === 0) spawnCard();
    cbBgmMode("early");
    audio.bgm("early");

    stop();
    state.rafId = requestAnimationFrame(loop);
  }

  function togglePause() {
    if (!state.running) return;
    state.paused = !state.paused;
    ui.setPauseLabel(state.paused ? "再開" : "一時停止");
    if (!state.paused) {
      state.lastTs = null;
      stop();
      state.rafId = requestAnimationFrame(loop);
    } else {
      stop();
    }
  }

  // wire UI choice buttons
  ui.onChoice((idx) => answer(idx));

  return {
    get stage() { return state.stage; },

    setStage: (stageId) => {
      const s = stages.find(x => x.id === stageId) || stages[0];
      state.stage = s;
      resetRun();
    },

    prepareRun,
    startRun,
    togglePause,
    stop,

    onUnlockStage: (fn) => (cbUnlockStage = fn),
    onBgmMode: (fn) => (cbBgmMode = fn),
    onSFX: (fn) => (cbSfx = fn),
    onHUD: (fn) => (cbHUD = fn),
    onHP: (fn) => (cbHP = fn),
    onFeedback: (fn) => (cbFeedback = fn),
    onJudgeFX: (fn) => (cbJudgeFX = fn),
    onResult: (fn) => (cbResult = fn),
  };
}
