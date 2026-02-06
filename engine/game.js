import { clamp } from "../utils/rand.js";
import { applyLayout, pickTargetIndex, effectiveX } from "./layout.js";

export function createGame({ ui, audio, stages }) {
  const WRONG_SLOW_SEC = 0.5;
  const WRONG_SLOW_MULT = 0.35;
  const MIN_TIME_LIMIT_SEC = 2.5;

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

    bgmMode: "early",

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
  let cbLog = () => {};

  function logEvent(payload) {
    cbLog({
      stageId: state.stage.id,
      stageName: state.stage.name,
      ...payload,
    });
  }

  function setBgmMode(mode) {
    state.bgmMode = mode;
    cbBgmMode(mode);
  }

  function getChoiceLabelsForQuestion(q) {
    if (typeof state.stage.getChoices === "function") {
      const choicePayload = state.stage.getChoices(q);
      if (Array.isArray(choicePayload)) return choicePayload;
      if (choicePayload?.labels) return choicePayload.labels;
    }
    if (Array.isArray(state.stage.choices)) return state.stage.choices;
    return null;
  }

  function formatChoiceLabel(choiceIdx, labels) {
    if (!labels) return "";
    if (Array.isArray(choiceIdx)) {
      return choiceIdx.map(idx => labels[idx]).filter(Boolean).join(" / ");
    }
    return labels[choiceIdx] ?? "";
  }

  function getCorrectInfoForQuestion(q) {
    const labels = getChoiceLabelsForQuestion(q);
    if (labels && labels.length) {
      for (let i = 0; i < labels.length; i += 1) {
        const result = state.stage.checkChoice(q, i);
        if (result?.correct) {
          return {
            correctLabel: result.correctLabel || labels[i],
            explanation: result.explanation || "",
          };
        }
      }
      return {
        correctLabel: labels[0] ?? "正解",
        explanation: "",
      };
    }
    const result = state.stage.checkChoice(q, 0);
    return {
      correctLabel: result?.correctLabel || "正解",
      explanation: result?.explanation || "",
    };
  }

  function getMaxConcurrent() {
    return state.stage.maxConcurrent
      ? state.stage.maxConcurrent(state.correct, state.spawnedCount)
      : (state.spawnedCount >= state.stage.overlapStart ? 2 : 1);
  }

  function updateChoicesForTarget() {
    if (!state.cards.length) {
      // 何も無い時は固定choicesがあれば出す
      if (state.stage.choices) ui.renderChoices(state.stage.choices);
      updateQuestionForTarget();
      return;
    }
    const tIdx = pickTargetIndex(state.cards);
    if (tIdx < 0) return;
    const q = state.cards[tIdx].q;

    // ★毎問違うchoices（Stage3など）
    if (typeof state.stage.getChoices === "function") {
      const choicePayload = state.stage.getChoices(q);
      if (Array.isArray(choicePayload)) {
        ui.renderChoices(choicePayload);
        updateQuestionForTarget();
        return;
      }
      if (choicePayload?.multi) {
        ui.renderMultiChoices(choicePayload.labels, choicePayload.submitLabel);
        updateQuestionForTarget();
        return;
      }
      if (choicePayload?.labels) {
        ui.renderChoices(choicePayload.labels);
        updateQuestionForTarget();
        return;
      }
      ui.renderChoices(["..."]);
      updateQuestionForTarget();
      return;
    }
    // ★固定choices（Stage1/2など）
    if (state.stage.choices) {
      ui.renderChoices(state.stage.choices);
      updateQuestionForTarget();
      return;
    }
    // fallback
    ui.renderChoices(["..."]);
    updateQuestionForTarget();
  }

  function updateQuestionForTarget() {
    const showQuestion = Boolean(state.stage.questionMode);
    ui.showQuestionArea(showQuestion);
    if (!showQuestion) return;
    if (!state.cards.length) {
      ui.setQuestionText("");
      ui.setQuestionStep("");
      ui.setTimerProgress(1);
      return;
    }
    const tIdx = pickTargetIndex(state.cards);
    if (tIdx < 0) return;
    const q = state.cards[tIdx].q;
    ui.setQuestionText(q.questionText || q.prompt || "");
    ui.setQuestionStep(q.stepLabel || "");
  }

  function forceRelayoutAll() {
    const maxNow = getMaxConcurrent();
    const tIdx = pickTargetIndex(state.cards);

    for (let i = 0; i < state.cards.length; i++) {
      const c = state.cards[i];
      const prevEffectiveX = effectiveX(c);
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
      c.x = prevEffectiveX - c.baseLeft;
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
    if (state.running && state.hp <= 0) finish("hp");
  }

  function setHUD() {
    const isClearFinite = Number.isFinite(state.stage.clearCount);
    const remainClear = isClearFinite
      ? Math.max(0, state.stage.clearCount - state.correct)
      : null;
    const clearText = isClearFinite
      ? (remainClear === 0 ? "クリア達成！" : `クリアまであと ${remainClear}問`)
      : "クリアまであと何問";
    cbHUD({
      stat: `${state.stage.name}`,
      sub: `${clearText} / ミス ${state.misses}`,
    });
  }

  function triggerSlow() {
    state.slowHoldSec = WRONG_SLOW_SEC;
    state.slowMult = WRONG_SLOW_MULT;
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
    state.timeLimitSec = state.stage.timeLimitStart ?? 15.0;

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
    setBgmMode("early");

    ui.showCompButtons(false);

    setHP(state.hp, null);
    setHUD();
    cbFeedback("");
    ui.setLaneHeight(getMaxConcurrent());
    updateQuestionForTarget();

    // ★ここでchoicesを安全に描画
    updateChoicesForTarget();
  }

  function spawnCard() {
    const maxNow = getMaxConcurrent();
    if (state.cards.length >= maxNow) return false;

    // lane assignment: 0 then 1
    const used0 = state.cards.some(c => c.laneId === 0);
    const used1 = state.cards.some(c => c.laneId === 1);
    const laneId = !used0 ? 0 : (!used1 ? 1 : null);
    if (laneId == null) return false;

    const q = state.stage.nextQuestion();
    const el = ui.createCardElement(q);
    ui.el.lane.appendChild(el);

    state.cards.push({
      q,
      laneId,
      baseLeft: 0,
      x: state.stage.staticQuestion ? 0 : ui.el.lane.clientWidth + 30,
      bornAt: performance.now(),
      el,
    });

    state.spawnedCount += 1;
    if (!state.stage.staticQuestion) {
      state.timeLimitSec = Math.max(MIN_TIME_LIMIT_SEC, state.timeLimitSec - 0.08);
    }
    state.lastSpawnAt = performance.now() / 1000;

    setBgmMode(state.spawnedCount >= state.stage.overlapStart ? "late" : "early");
    forceRelayoutAll();

    // ★ターゲットが変わるので必ず更新
    updateChoicesForTarget();
    return true;
  }

  function calcSpawnIntervalSec(maxNow) {
    const defaultInterval = {
      start: 2.8,
      end: 1.2,
      min: 0.2,
    };
    const interval =
      maxNow === 2 && state.stage.twoLaneSpawnInterval
        ? { ...defaultInterval, ...state.stage.twoLaneSpawnInterval }
        : defaultInterval;
    const t = (state.spawnedCount - state.stage.overlapStart) / 20;
    const v = interval.start + (interval.end - interval.start) * t;
    return Math.max(interval.min, v);
  }

  function ensureSpawn(dt) {
    state.spawnCooldown -= dt;

    const maxNow = getMaxConcurrent();
    const nowSec = performance.now() / 1000;

    if (maxNow === 1) {
      if (state.cards.length === 0 && state.spawnCooldown <= 0) {
        const spawned = spawnCard();
        if (spawned) state.spawnCooldown = calcSpawnIntervalSec(getMaxConcurrent());
      }
      return;
    }

    // 2レーン：上下まとめて0.8秒未満禁止、1回に1枚だけ
    const gapOk = (nowSec - state.lastSpawnAt) >= state.minGapTwoLane;
    if (state.cards.length < 2 && state.spawnCooldown <= 0 && gapOk) {
      const spawned = spawnCard();
      if (spawned) state.spawnCooldown = calcSpawnIntervalSec(getMaxConcurrent());
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

  function getNextStageId() {
    const nextId = state.stage.id + 1;
    if (nextId > stages.length) return null;
    return nextId;
  }

  function getUnlockedNextStageId() {
    if (state.correct >= state.stage.unlockNeed) return getNextStageId();
    return null;
  }

  function finish(reason = "gameover") {
    state.running = false;
    state.paused = true;
    stop();
    audio.stopBGM();

    const cleared = Number.isFinite(state.stage.clearCount)
      && state.correct >= state.stage.clearCount;
    if (cleared) {
      cbSfx("finish");
    } else if (reason !== "manual") {
      cbSfx("gameover");
    }

    const unlockedNextStageId = getUnlockedNextStageId();
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

  function handleWrong(text, loss, meta = {}) {
    if (meta?.q) {
      logEvent({
        type: "question",
        outcome: meta.outcome || "wrong",
        elapsedSec: meta.elapsedSec ?? null,
        q: meta.q,
        choiceIdx: meta.choiceIdx ?? null,
        choiceLabel: meta.choiceLabel ?? "",
        correctLabel: meta.correctLabel ?? "",
        explanation: meta.explanation ?? "",
      });
    }
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

    const result = state.stage.checkChoice(card.q, choiceIdx);
    let alreadyHandled = false;
    const labels = getChoiceLabelsForQuestion(card.q);
    const choiceLabel = formatChoiceLabel(choiceIdx, labels);
    const elapsedSec = (performance.now() - card.bornAt) / 1000;
    if (typeof result === "object") {
      if (!result.correct) {
        const feedbackText = result.explanation
          ? `ミス！ ${result.explanation}`
          : (result.feedback || "ミス！");
        handleWrong(feedbackText, 10, {
          outcome: "wrong",
          q: card.q,
          elapsedSec,
          choiceIdx,
          choiceLabel,
          correctLabel: result.correctLabel || "",
          explanation: result.explanation || "",
        });
        return;
      }

      const okText = result.explanation
        ? `OK！ ${result.explanation}`
        : (result.feedback || "OK！");
      handleCorrect(okText);
      alreadyHandled = true;
      if (typeof state.stage.advanceQuestion === "function" && result.done === false) {
        state.stage.advanceQuestion(card.q);
        ui.updateCardElement(card.el, card.q);
        if (result.resetCard) {
          const startX = ui.el.lane.clientWidth + 30;
          const baseLeft = card.baseLeft || 0;
          card.x = startX - baseLeft;
          card.bornAt = performance.now();
          card.el.style.transform = `translateX(${card.x}px)`;
        }
        updateChoicesForTarget();
        return;
      }

      if (result.done === false) {
        updateChoicesForTarget();
        return;
      }
    } else if (!result) {
      handleWrong("ミス！", 10, {
        outcome: "wrong",
        q: card.q,
        elapsedSec,
        choiceIdx,
        choiceLabel,
      });
      return;
    }

    if (!alreadyHandled) handleCorrect();

    // complete card
    state.correct += 1;

    const timeLeft = Math.max(0, state.timeLimitSec - elapsedSec);

    setHP(state.hp + (5 + 0.9 * timeLeft), "gain");
    if (state.stage.staticQuestion) {
      const minLimit = state.stage.timeLimitMin ?? 0.2;
      const decay = state.stage.timeLimitDecay ?? 2;
      state.timeLimitSec = Math.max(minLimit, state.timeLimitSec - decay);
    } else {
      state.timeLimitSec = Math.max(0.2, state.timeLimitSec - 0.55);
    }

    removeCardAt(tIdx);

    logEvent({
      type: "question",
      outcome: "correct",
      elapsedSec,
      q: card.q,
      choiceIdx,
      choiceLabel,
      correctLabel: result?.correctLabel || "",
      explanation: result?.explanation || "",
    });

    const unlocked = unlockNextIfNeeded();
    setHUD();

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

    if (state.stage.staticQuestion) {
      const tIdx = pickTargetIndex(state.cards);
      if (tIdx >= 0) {
        const t = state.cards[tIdx];
        const elapsed = (performance.now() - t.bornAt) / 1000;
        const timeLeft = Math.max(0, state.timeLimitSec - elapsed);
        ui.setTimerProgress(timeLeft / Math.max(0.001, state.timeLimitSec));
        if (timeLeft <= 0) {
          handleWrong("時間切れ！", 12);
          if (state.running && !state.paused) state.rafId = requestAnimationFrame(loop);
          return;
        }
      } else {
        ui.setTimerProgress(1);
      }
      forceRelayoutAll();
      state.rafId = requestAnimationFrame(loop);
      return;
    }

    // move
    const startX = ui.el.lane.clientWidth + 30;
    const dist = Math.max(1, startX - ui.layout.MISS_X);
    const baseSpeed = dist / Math.max(0.001, state.timeLimitSec);
    const speed = baseSpeed * mult;

    for (const c of state.cards) {
      const cardSpeedMult = Number.isFinite(c.q?.speedMult) ? c.q.speedMult : 1.0;
      c.x -= speed * dt * cardSpeedMult;
    }

    // miss check
    const tIdx = pickTargetIndex(state.cards);
    if (tIdx >= 0) {
      const t = state.cards[tIdx];
      if (effectiveX(t) <= ui.layout.MISS_X) {
        const elapsedSec = (performance.now() - t.bornAt) / 1000;
        const missInfo = getCorrectInfoForQuestion(t.q);
        const feedbackText = missInfo.explanation
          ? `ミス！ ${missInfo.explanation}`
          : "ミス！";
        handleWrong(feedbackText, 14, {
          outcome: "miss",
          q: t.q,
          elapsedSec,
          correctLabel: missInfo.correctLabel,
          explanation: missInfo.explanation,
        });
      }
    }

    forceRelayoutAll();
    state.rafId = requestAnimationFrame(loop);
  }

  function prepareRun() {
    resetRun();
    ui.showStartOverlay(state.stage.name);
    ui.setTimerProgress(1);

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

    if (state.cards.length === 0) {
      const spawned = spawnCard();
      if (spawned) state.spawnCooldown = calcSpawnIntervalSec(getMaxConcurrent());
    }
    setBgmMode("early");
    audio.bgm("early");

    stop();
    state.rafId = requestAnimationFrame(loop);
  }

  function togglePause() {
    if (!state.running) return;
    state.paused = !state.paused;
    ui.setPauseLabel(state.paused ? "再開" : "一時停止");
    if (!state.paused) {
      ui.hidePauseGuide();
      state.lastTs = null;
      audio.bgm(state.bgmMode);
      stop();
      state.rafId = requestAnimationFrame(loop);
    } else {
      ui.showPauseGuide(state.stage);
      audio.pauseBGM();
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
    endRun: () => {
      if (!state.running) return false;
      finish("manual");
      return true;
    },
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
    onLog: (fn) => (cbLog = fn),
  };
}
