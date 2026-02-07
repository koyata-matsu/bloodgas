export function createUI() {
  const $ = (id) => document.getElementById(id);

  const el = {
    screenMenu: $("screenMenu"),
    screenGame: $("screenGame"),

    stageBtns: [...document.querySelectorAll(".stageBtn")],

    hudStat: $("hudStat"),
    hudSub: $("hudSub"),

    healthFill: $("healthFill"),
    healthBar: document.querySelector(".healthBar"),

    questionArea: $("questionArea"),
    questionStep: $("questionStep"),
    questionText: $("questionText"),
    timeCount: $("timeCount"),
    timeFill: $("timeFill"),

    lane: document.querySelector(".lane"),

    choices: $("choices"),
    compChoices: $("compChoices"),
    compOkBtn: $("compOkBtn"),
    compNgBtn: $("compNgBtn"),

    feedback: $("feedback"),

    pauseBtn: $("pauseBtn"),
    restartBtn: $("restartBtn"),
    exitBtn: $("exitBtn"),

    startOverlay: $("startOverlay"),
    startBtn: $("startBtn"),
    startTitle: $("startTitle"),
    startDesc: $("startDesc"),

    judgeFx: $("judgeFx"),

    pauseModal: $("pauseModal"),
    pauseTitle: document.querySelector("#pauseModal .rankTitle"),
    pauseContent: $("pauseContent"),
    pauseCloseBtn: $("pauseCloseBtn"),

    resultModal: $("resultModal"),
    rankTitle: $("rankTitle"),
    scoreNum: $("scoreNum"),
    scoreRate: $("scoreRate"),
    missNum: $("missNum"),
    unlockMsg: $("unlockMsg"),
    retryBtn: $("retryBtn"),
    nextBtn: $("nextBtn"),
    menuBtn: $("menuBtn"),
    downloadLogBtn: $("downloadLogBtn"),

  };

  // constants shared with engine/layout.js
  const layout = {
    TOP_Y: 14,
    ROW_GAP: 180,
    PAD: 12,
    COL_GAP: 12,
    CARD_W_MIN: 260,
    CARD_W_MAX: 360,
    MISS_X: 8,
    TARGET_BORDER: "2px solid rgba(40,90,255,0.35)",
    TARGET_SHADOW: "0 0 0 2px rgba(40,90,255,0.10)",
    NORMAL_BORDER: "1px solid rgba(0,0,0,0.06)",
  };

  // callbacks
  let onSelectStage = () => {};
  let onStart = () => {};
  let onPauseToggle = () => {};
  let onPauseAction = () => onPauseToggle();
  let onRestart = () => {};
  let onExit = () => {};
  let onChoice = () => {};
  let onComp = () => {};
  let onResultRetry = () => {};
  let onResultNext = () => {};
  let onResultMenu = () => {};
  let onDownloadLog = () => {};

  function showScreen(name) {
    el.screenMenu?.classList.toggle("hidden", name !== "menu");
    el.screenGame?.classList.toggle("hidden", name !== "game");
  }

  const stageStatusLabels = {
    locked: "ロック中",
    challenging: "挑戦中",
    unlocked: "解放",
    cleared: "クリア",
  };

  function setStageButtons(stageStates = []) {
    const statusById = new Map(stageStates.map((state) => [state.id, state.status]));
    el.stageBtns.forEach((b) => {
      const id = Number(b.dataset.stage || "1");
      const status = statusById.get(id) || "locked";
      b.disabled = status === "locked";

      const row = b.querySelector(".stageRow");
      let tag = b.querySelector(".stageTag");
      if (!tag && row) {
        tag = document.createElement("span");
        tag.className = "stageTag";
        row.appendChild(tag);
      }
      if (tag) {
        tag.textContent = stageStatusLabels[status] || stageStatusLabels.locked;
        tag.classList.remove("locked", "challenging", "unlocked", "cleared", "live");
        tag.classList.add(status);
      }
    });
  }

  function setHUD(stat, sub) {
    if (el.hudStat) el.hudStat.textContent = stat;
    if (el.hudSub) el.hudSub.textContent = sub;
  }

  function setLaneHeight(maxNow) {
    if (!el.lane) return;
    const lanes = Math.max(1, Number.isFinite(maxNow) ? maxNow : 1);
    const baseCardHeight = 96;
    const minHeight = 96;
    const height = layout.TOP_Y + layout.ROW_GAP * (lanes - 1) + baseCardHeight;
    el.lane.style.height = `${Math.max(minHeight, Math.round(height))}px`;
  }

  function setHP(hp, hpMax, anim) {
    if (!el.healthFill) return;
    el.healthFill.style.width = `${(hp / hpMax) * 100}%`;
    el.healthFill.classList.remove("hpGain", "hpLoss");
    if (anim === "gain") {
      el.healthFill.classList.add("hpGain");
      setTimeout(() => el.healthFill.classList.remove("hpGain"), 280);
    } else if (anim === "loss") {
      el.healthFill.classList.add("hpLoss");
      setTimeout(() => el.healthFill.classList.remove("hpLoss"), 280);
    }
  }

  function showQuestionArea(on) {
    if (!el.questionArea) return;
    el.questionArea.classList.toggle("hidden", !on);
  }

  function setQuestionText(text) {
    if (el.questionText) el.questionText.textContent = text || "";
  }

  function setQuestionStep(step) {
    if (el.questionStep) el.questionStep.textContent = step || "";
  }

  function setTimerProgress(ratio) {
    if (!el.timeFill) return;
    const safeRatio = Math.max(0, Math.min(1, ratio));
    el.timeFill.style.transform = `scaleX(${safeRatio})`;
  }

  function setTimerText(seconds) {
    if (!el.timeCount) return;
    if (!Number.isFinite(seconds)) {
      el.timeCount.textContent = "";
      return;
    }
    el.timeCount.textContent = `${Math.ceil(seconds)}s`;
  }

  function shakeHP() {
    if (!el.healthBar) return;
    el.healthBar.classList.remove("hpBarShake");
    void el.healthBar.offsetWidth;
    el.healthBar.classList.add("hpBarShake");
  }

  function setFeedback(text) {
    if (el.feedback) el.feedback.textContent = text || "";
  }

  function showJudge(ok) {
    if (!el.judgeFx) return;
    el.judgeFx.textContent = ok ? "○" : "×";
    el.judgeFx.classList.remove("hidden", "ok", "ng", "show");
    el.judgeFx.classList.add(ok ? "ok" : "ng");
    requestAnimationFrame(() => el.judgeFx.classList.add("show"));
    setTimeout(() => {
      el.judgeFx.classList.remove("show");
      setTimeout(() => el.judgeFx.classList.add("hidden"), 160);
    }, 260);
  }

  function showStartOverlay(stageName) {
    if (el.startTitle) el.startTitle.textContent = stageName || "血ガスゲーム";
    if (el.startOverlay) {
      el.startOverlay.style.display = "";
      el.startOverlay.classList.remove("hidden");
    }
  }

  function hideStartOverlay() {
    if (!el.startOverlay) return;
    el.startOverlay.style.display = "none";
    el.startOverlay.classList.add("hidden");
  }

  function setPauseLabel(text) {
    if (el.pauseBtn) el.pauseBtn.textContent = text;
  }

  function renderChoices(labels) {
    if (!el.choices) return;
    el.choices.innerHTML = "";
    labels.forEach((label, i) => {
      const b = document.createElement("button");
      b.className = "choiceBtn";
      b.textContent = label;
      b.addEventListener("click", () => onChoice(i));
      el.choices.appendChild(b);
    });
  }

  function showPauseGuide(stage) {
    if (!el.pauseModal || !el.pauseContent) return;
    const hints = Array.isArray(stage?.hints) ? stage.hints : [];
    const hintHtml = hints.length
      ? `<div class="pauseHints"><h4>ヒント</h4><ul>${hints.map((text) => `<li>${text}</li>`).join("")}</ul></div>`
      : "";
    const lessonHtml = stage?.lessonHTML || "<p>このステージの解説はありません。</p>";
    el.pauseContent.innerHTML = `${lessonHtml}${hintHtml}`;
    if (el.pauseTitle) el.pauseTitle.textContent = "一時停止中：知識メモ";
    if (el.pauseCloseBtn) el.pauseCloseBtn.textContent = "再開";
    onPauseAction = () => onPauseToggle();
    el.pauseModal.classList.remove("hidden");
  }

  function hidePauseGuide() {
    if (!el.pauseModal) return;
    el.pauseModal.classList.add("hidden");
  }

  function showLessonIntro(stage, onConfirm) {
    if (!el.pauseModal || !el.pauseContent) return;
    const hints = Array.isArray(stage?.hints) ? stage.hints : [];
    const hintHtml = hints.length
      ? `<div class="pauseHints"><h4>ヒント</h4><ul>${hints.map((text) => `<li>${text}</li>`).join("")}</ul></div>`
      : "";
    const lessonHtml = stage?.lessonHTML || "<p>このステージの解説はありません。</p>";
    el.pauseContent.innerHTML = `${lessonHtml}${hintHtml}`;
    if (el.pauseTitle) el.pauseTitle.textContent = "開始前：解説";
    if (el.pauseCloseBtn) el.pauseCloseBtn.textContent = "スタート";
    onPauseAction = () => {
      hidePauseGuide();
      onConfirm?.();
    };
    el.pauseModal.classList.remove("hidden");
  }

  function renderMultiChoices(labels, submitLabel = "決定") {
    if (!el.choices) return;
    el.choices.innerHTML = "";
    labels.forEach((label, i) => {
      const wrapper = document.createElement("label");
      wrapper.className = "choiceCheck";
      const input = document.createElement("input");
      input.type = "checkbox";
      input.value = String(i);
      const text = document.createElement("span");
      text.textContent = label;
      wrapper.appendChild(input);
      wrapper.appendChild(text);
      el.choices.appendChild(wrapper);
    });

    const submit = document.createElement("button");
    submit.className = "choiceBtn choiceSubmit";
    submit.type = "button";
    submit.textContent = submitLabel;
    submit.addEventListener("click", () => {
      const selected = [...el.choices.querySelectorAll("input[type='checkbox']:checked")];
      const indexes = selected.map((node) => Number(node.value));
      onChoice(indexes);
    });
    el.choices.appendChild(submit);
  }

  function showCompButtons(on) {
    if (!el.compChoices) return;
    el.compChoices.classList.toggle("hidden", !on);
  }

  function renderCardInner(card, q) {
    if (!card) return;

    // Stage0: 正常値判定
    if (q && q.kind === "norm") {
      const unit = q.unit ? ` <span class="unit">${q.unit}</span>` : "";
      card.innerHTML = `
        <div class="qOne">
          <span class="qItem norm"><b>${q.item}</b> <span class="vval">${q.value}</span>${unit}</span>
        </div>
        <div class="qIcon" aria-hidden="true">🧪</div>
      `;
      return;
    }

    // Stage3など：Na/Cl/HCO3/Alb
    if (q && (q.kind === "calc" || q.kind === "judge")) {
      const itemsHtml = (q.items || []).map(it => {
        const unit = it.unit ? ` <span class="unit">${it.unit}</span>` : "";
        return `<span class="qItem"><b>${it.k}</b> <span>${it.v}</span>${unit}</span>`;
      }).join(`<span class="qSep">/</span>`);

      card.innerHTML = `
        <div class="qOne">
          <span class="qItem"><b>${q.prompt || "計算"}</b></span>
          <span class="qSep">/</span>
          ${itemsHtml}
        </div>
        <div class="qIcon" aria-hidden="true">🧮</div>
      `;
      return;
    }

    if (q && q.kind === "topic") {
      const itemsHtml = (q.items || [])
        .map(it => `<span class="qItem"><b>${it.k}</b> <span>${it.v}</span></span>`)
        .join(`<span class="qSep">/</span>`);
      card.innerHTML = `
        <div class="qOne">
          <span class="qItem"><b>${q.prompt || "問題"}</b></span>
          ${itemsHtml ? `<span class="qSep">/</span>${itemsHtml}` : ""}
        </div>
        <div class="qIcon" aria-hidden="true">📌</div>
      `;
      return;
    }

    if (q && q.kind === "case") {
      const row1 = `
        <div class="caseRow">
          <span class="qItem ph"><b>pH</b> <span class="vph">${Number(q.ph).toFixed(2)}</span></span>
          <span class="qSep">/</span>
          <span class="qItem co2"><b>PaCO₂</b> <span class="vpco2">${q.paco2}</span> <span class="unit">mmHg</span></span>
          <span class="qSep">/</span>
          <span class="qItem hco3"><b>HCO₃⁻</b> <span class="vhco3">${q.hco3}</span> <span class="unit">mEq/L</span></span>
        </div>
      `;
      const row2 = `
        <div class="caseRow">
          <span class="qItem"><b>Na</b> <span>${q.na}</span> <span class="unit">mEq/L</span></span>
          <span class="qSep">/</span>
          <span class="qItem"><b>Cl</b> <span>${q.cl}</span> <span class="unit">mEq/L</span></span>
          <span class="qSep">/</span>
          <span class="qItem"><b>Alb</b> <span>${Number(q.alb).toFixed(1)}</span> <span class="unit">g/dL</span></span>
          <span class="qSep">/</span>
          <span class="qItem ag"><b>AG</b> <span class="vag">${q.ag}</span> <span class="unit">mEq/L</span></span>
        </div>
      `;
      const historyHtml = q.showHistory
        ? `
          <div class="caseHistory">
            <div class="caseLabel">現病歴</div>
            <div>${q.history || "（情報なし）"}</div>
          </div>
        `
        : "";
      card.innerHTML = `
        <div class="qOne case">
          <div class="caseTitle">① 血ガス提示</div>
          ${row1}
          ${row2}
          <div class="caseStep">
            <div class="caseStepTitle">${q.stepTitle || ""}</div>
            <div class="casePrompt">${q.prompt || ""}</div>
          </div>
          ${historyHtml}
        </div>
        <div class="qIcon" aria-hidden="true">🧠</div>
      `;
      return;
    }

    // 既存：pH/PaCO2/HCO3（必要ならAG追加）
    const row1 = `
      <div class="qRow">
        <span class="qItem ph"><b>pH</b> <span class="vph">${Number(q.ph).toFixed(2)}</span></span>
        <span class="qSep">/</span>
        <span class="qItem co2"><b>PaCO₂</b> <span class="vpco2">${q.paco2}</span> <span class="unit">mmHg</span></span>
        <span class="qSep">/</span>
        <span class="qItem hco3"><b>HCO₃⁻</b> <span class="vhco3">${q.hco3}</span> <span class="unit">mEq/L</span></span>
      </div>
    `;
    const row2 = q.ag !== undefined
      ? `
        <div class="qRow">
          <span class="qItem ag"><b>AG</b> <span class="vag">${q.ag}</span> <span class="unit">mEq/L</span></span>
        </div>
      `
      : "";
    card.innerHTML = `
      <div class="qOne">
        ${row1}
        ${row2}
      </div>
      <div class="qIcon" aria-hidden="true">🚑</div>
    `;
  }

  function createCardElement(q) {
    const card = document.createElement("div");
    card.className = "qcard dynamic";
    if (q?.hideCard) card.classList.add("hidden");
    renderCardInner(card, q);
    return card;
  }

  function updateCardElement(card, q) {
    if (q?.hideCard) {
      card.classList.add("hidden");
    } else {
      card.classList.remove("hidden");
    }
    renderCardInner(card, q);
  }


  function showResult(result) {
    if (!el.resultModal) return;
    el.resultModal.classList.remove("hidden");

    if (el.rankTitle) el.rankTitle.textContent = result.cleared ? "ステージクリア！！" : "💀 ゲームオーバー";
    if (el.scoreNum) {
      const clearCount = result.clearCount;
      const scoreText = Number.isFinite(clearCount)
        ? `${result.correct} / ${clearCount}`
        : `${result.correct}`;
      el.scoreNum.textContent = scoreText;
    }
    if (el.scoreRate) el.scoreRate.textContent = String(result.rate);
    if (el.missNum) el.missNum.textContent = String(result.misses);

    if (el.unlockMsg) {
      const unlockText = result.unlockedNextStageId
        ? `✅ 次ステージ解放（ステージ${result.unlockedNextStageId}）`
        : `🔒 次ステージ未解放（18問正解が必要）`;
      el.unlockMsg.innerHTML =
        `<div style="line-height:1.6;">` +
          `<div style="font-size:18px;font-weight:900;">${unlockText}</div>` +
        `</div>`;
    }
    if (el.nextBtn) el.nextBtn.disabled = !result.canGoNext;
  }

  function hideResult() {
    el.resultModal?.classList.add("hidden");
  }

  // events
  el.stageBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      if (btn.disabled) return;
      el.stageBtns.forEach(b => b.classList.remove("selected"));
      btn.classList.add("selected");
      onSelectStage(Number(btn.dataset.stage || "1"));
    });
  });

  el.startBtn?.addEventListener("click", () => onStart());

  el.pauseBtn?.addEventListener("click", () => onPauseToggle());
  el.pauseCloseBtn?.addEventListener("click", () => onPauseAction());
  el.restartBtn?.addEventListener("click", () => onRestart());
  el.exitBtn?.addEventListener("click", () => onExit());

  el.compOkBtn?.addEventListener("click", () => onComp(true));
  el.compNgBtn?.addEventListener("click", () => onComp(false));

  el.retryBtn?.addEventListener("click", () => onResultRetry());
  el.nextBtn?.addEventListener("click", () => onResultNext());
  el.menuBtn?.addEventListener("click", () => onResultMenu());
  el.downloadLogBtn?.addEventListener("click", () => onDownloadLog());
  el.resultModal?.querySelector(".modalBackdrop")?.addEventListener("click", () => hideResult());
  el.pauseModal?.querySelector(".modalBackdrop")?.addEventListener("click", () => onPauseAction());

  // init
  renderChoices(["代謝性アシドーシス","呼吸性アシドーシス","代謝性アルカローシス","呼吸性アルカローシス"]);
  showCompButtons(false);

  return {
    el,
    layout,

    showScreen,
    setStageButtons,
    setHUD,
    setLaneHeight,
    setHP,
    showQuestionArea,
    setQuestionText,
    setQuestionStep,
    setTimerProgress,
    setTimerText,
    shakeHP,
    setFeedback,
    showJudge,
    showStartOverlay,
    hideStartOverlay,
    setPauseLabel,
    renderChoices,
    renderMultiChoices,
    showCompButtons,
    showPauseGuide,
    hidePauseGuide,
    showLessonIntro,
    createCardElement,
    updateCardElement,
    showResult,
    hideResult,

    onSelectStage: (fn) => (onSelectStage = fn),
    onStart: (fn) => (onStart = fn),
    onPauseToggle: (fn) => (onPauseToggle = fn),
    onRestart: (fn) => (onRestart = fn),
    onExit: (fn) => (onExit = fn),
    onChoice: (fn) => (onChoice = fn),
    onCompChoice: (fn) => (onComp = fn),
    onResultRetry: (fn) => (onResultRetry = fn),
    onResultNextStage: (fn) => (onResultNext = fn),
    onResultMenu: (fn) => (onResultMenu = fn),
    onDownloadLog: (fn) => (onDownloadLog = fn),
  };
}
