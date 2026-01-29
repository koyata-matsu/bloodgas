export function createUI() {
  const $ = (id) => document.getElementById(id);

  const el = {
    screenMenu: $("screenMenu"),
    screenLesson: $("screenLesson"),
    screenGame: $("screenGame"),
    modeLabel: $("modeLabel"),

    lessonTitle: $("lessonTitle"),

    stageBtns: [...document.querySelectorAll(".stageBtn")],

    toLessonBtn: $("toLessonBtn"),
    toGameBtn: $("toGameBtn"),
    backToMenuBtn: $("backToMenuBtn"),

    hudStat: $("hudStat"),
    hudSub: $("hudSub"),

    toggleNormBtn: $("toggleNormBtn"),
    normPanel: $("normPanel"),

    healthFill: $("healthFill"),
    healthBar: document.querySelector(".healthBar"),

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

    hintArea: $("hintArea"),
    hintList: $("hintList"),

    judgeFx: $("judgeFx"),

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

    wrongModal: $("wrongModal"),
    wrongAnswer: $("wrongAnswer"),
    wrongExplain: $("wrongExplain"),
    wrongCloseBtn: $("wrongCloseBtn"),
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
  let onGoLesson = () => {};
  let onGoGame = () => {};
  let onBackToMenu = () => {};
  let onStart = () => {};
  let onToggleNormals = () => {};
  let onPauseToggle = () => {};
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
    el.screenLesson?.classList.toggle("hidden", name !== "lesson");
    el.screenGame?.classList.toggle("hidden", name !== "game");
    if (el.modeLabel) el.modeLabel.textContent = name[0].toUpperCase() + name.slice(1);
  }

  function setLessonTitle(title) {
    if (el.lessonTitle) el.lessonTitle.textContent = title;
  }

  function setStageButtons(unlockedMax) {
    el.stageBtns.forEach((b) => {
      const id = Number(b.dataset.stage || "1");
      b.disabled = id > unlockedMax;
    });
  }

  function enableNextToLesson(on) {
    if (el.toLessonBtn) el.toLessonBtn.disabled = !on;
  }

  function setHUD(stat, sub) {
    if (el.hudStat) el.hudStat.textContent = stat;
    if (el.hudSub) el.hudSub.textContent = sub;
  }

  function setLaneHeight(maxNow) {
    if (!el.lane) return;
    el.lane.style.height = (maxNow >= 2) ? "360px" : "170px";
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

  function toggleNormalsPanel() {
    el.normPanel?.classList.toggle("hidden");
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

  function setHints(hints, show) {
    if (!el.hintArea || !el.hintList) return;
    if (!Array.isArray(hints) || hints.length === 0) {
      el.hintArea.classList.add("hidden");
      el.hintList.innerHTML = "";
      return;
    }
    el.hintList.innerHTML = "";
    hints.forEach((text) => {
      const li = document.createElement("li");
      li.textContent = text;
      el.hintList.appendChild(li);
    });
    el.hintArea.classList.toggle("hidden", !show);
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
    const agHtml = q.ag !== undefined
      ? `
        <span class="qSep">/</span>
        <span class="qItem ag"><b>AG</b> <span class="vag">${q.ag}</span> <span class="unit">mEq/L</span></span>
      `
      : "";
    card.innerHTML = `
      <div class="qOne">
        <span class="qItem ph"><b>pH</b> <span class="vph">${Number(q.ph).toFixed(2)}</span></span>
        <span class="qSep">/</span>
        <span class="qItem co2"><b>PaCO₂</b> <span class="vpco2">${q.paco2}</span> <span class="unit">mmHg</span></span>
        <span class="qSep">/</span>
        <span class="qItem hco3"><b>HCO₃⁻</b> <span class="vhco3">${q.hco3}</span> <span class="unit">mEq/L</span></span>
        ${agHtml}
      </div>
      <div class="qIcon" aria-hidden="true">🚑</div>
    `;
  }

  function createCardElement(q) {
    const card = document.createElement("div");
    card.className = "qcard dynamic";
    renderCardInner(card, q);
    return card;
  }

  function updateCardElement(card, q) {
    renderCardInner(card, q);
  }


  function showResult(result) {
    if (!el.resultModal) return;
    el.resultModal.classList.remove("hidden");

    if (el.rankTitle) el.rankTitle.textContent = result.cleared ? "✅ ステージクリア！" : "💀 ゲームオーバー";
    if (el.scoreNum) el.scoreNum.textContent = `${result.correct} / ${result.clearCount}`;
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

  function showWrongModal(payload) {
    if (!el.wrongModal) return;
    if (el.wrongAnswer) el.wrongAnswer.textContent = payload?.answer || "-";
    if (el.wrongExplain) el.wrongExplain.textContent = payload?.explanation || "-";
    el.wrongModal.classList.remove("hidden");
  }

  function hideWrongModal() {
    el.wrongModal?.classList.add("hidden");
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

  el.toLessonBtn?.addEventListener("click", () => onGoLesson());
  el.backToMenuBtn?.addEventListener("click", () => onBackToMenu());
  el.toGameBtn?.addEventListener("click", () => onGoGame());
  el.startBtn?.addEventListener("click", () => onStart());

  el.toggleNormBtn?.addEventListener("click", () => onToggleNormals());
  el.pauseBtn?.addEventListener("click", () => onPauseToggle());
  el.restartBtn?.addEventListener("click", () => onRestart());
  el.exitBtn?.addEventListener("click", () => onExit());

  el.compOkBtn?.addEventListener("click", () => onComp(true));
  el.compNgBtn?.addEventListener("click", () => onComp(false));

  el.retryBtn?.addEventListener("click", () => onResultRetry());
  el.nextBtn?.addEventListener("click", () => onResultNext());
  el.menuBtn?.addEventListener("click", () => onResultMenu());
  el.downloadLogBtn?.addEventListener("click", () => onDownloadLog());
  el.resultModal?.querySelector(".modalBackdrop")?.addEventListener("click", () => hideResult());
  el.wrongCloseBtn?.addEventListener("click", () => hideWrongModal());
  el.wrongModal?.querySelector(".modalBackdrop")?.addEventListener("click", () => hideWrongModal());

  // init
  renderChoices(["代謝性アシドーシス","呼吸性アシドーシス","代謝性アルカローシス","呼吸性アルカローシス"]);
  showCompButtons(false);

  return {
    el,
    layout,

    showScreen,
    setLessonTitle,
    setStageButtons,
    enableNextToLesson,
    setHUD,
    setLaneHeight,
    setHP,
    shakeHP,
    setFeedback,
    showJudge,
    showStartOverlay,
    hideStartOverlay,
    toggleNormalsPanel,
    setPauseLabel,
    renderChoices,
    setHints,
    renderMultiChoices,
    showCompButtons,
    createCardElement,
    updateCardElement,
    showResult,
    hideResult,
    showWrongModal,
    hideWrongModal,

    onSelectStage: (fn) => (onSelectStage = fn),
    onGoLesson: (fn) => (onGoLesson = fn),
    onGoGame: (fn) => (onGoGame = fn),
    onBackToMenu: (fn) => (onBackToMenu = fn),
    onStart: (fn) => (onStart = fn),
    onToggleNormals: (fn) => (onToggleNormals = fn),
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
