import { createUI } from "./ui/dom.js";
import { createAudio } from "./ui/audio.js";
import { createGame } from "./engine/game.js";

import { createStage0 } from "./stages/stage0.js";
import { createStage1 } from "./stages/stage1.js";
import { createStage2 } from "./stages/stage2.js";
import { createStage3 } from "./stages/stage3.js";
import { createStage4 } from "./stages/stage4.js";
import { createStage5 } from "./stages/stage5.js";
import { createStage6 } from "./stages/stage6.js";
import { loadStage6Cases } from "./stages/stage6_cases.js";

const LS_UNLOCK_KEY = "bg_unlocked_stage_max";
const LS_CLEARED_KEY = "bg_cleared_stage_ids_v1";

let ui;
let audio;
let game;
let DEFAULT_CARD_MIN;
let DEFAULT_CARD_MAX;

let selectedStageId = 1;
let activeRunId = null;
let runStartAt = null;
let runEvents = [];
let stages = [];

const LS_LOG_KEY = "bg_game_logs_v1";
const LS_LOG_UPLOAD_URL_KEY = "bg_log_upload_url";
const LS_LOG_LAST_UPLOAD_KEY = "bg_log_last_upload_at";
const LS_STAGE6_CASES_URL_KEY = "bg_stage6_cases_url";
const DEFAULT_STAGE6_CASES_URL = "https://docs.google.com/spreadsheets/d/16jZF5LsRvIE1viFZTG5GEo2evPDuQnLOoVR6kx3z5LM/edit?gid=0#gid=0";
const FORCE_UNLOCK_ALL_STAGES = true;
const UPLOAD_INTERVAL_MS = 1000 * 60 * 60 * 24;
const DEFAULT_UPLOAD_URL = "https://script.google.com/macros/s/AKfycbwsDePBZyEwAluHo6n3p8XDtuECic04pFljbyZd-kqFS02VX6AIrQ5p3I1L5jpl_AH-/exec";

function loadLogStore() {
  try {
    const raw = localStorage.getItem(LS_LOG_KEY);
    const data = raw ? JSON.parse(raw) : null;
    if (data && Array.isArray(data.events)) return data;
  } catch (err) {
    console.warn("Failed to load logs", err);
  }
  return { version: 1, events: [] };
}

const logStore = loadLogStore();

function saveLogStore() {
  localStorage.setItem(LS_LOG_KEY, JSON.stringify(logStore));
}

function startRunSession() {
  activeRunId = `${Date.now()}-${Math.random().toString(16).slice(2, 8)}`;
  runStartAt = new Date().toISOString();
  runEvents = [];
}

function formatNumber(value, digits = 2) {
  if (value == null || Number.isNaN(value)) return "";
  return Number(value).toFixed(digits);
}

function formatQuestionSummary(q) {
  if (!q) return "";
  if (q.kind === "norm") {
    return `${q.item} ${q.value}${q.unit ? ` ${q.unit}` : ""}`;
  }
  if (q.kind === "calc" || q.kind === "judge") {
    const items = (q.items || [])
      .map(it => `${it.k}${it.v}${it.unit ? ` ${it.unit}` : ""}`)
      .join(" / ");
    return `${q.prompt || "計算"} | ${items}`;
  }
  if (q.kind === "case") {
    return [
      `pH ${formatNumber(q.ph)}`,
      `PaCO2 ${q.paco2}`,
      `HCO3 ${q.hco3}`,
      `Na ${q.na}`,
      `Cl ${q.cl}`,
      `Alb ${formatNumber(q.alb, 1)}`,
      `AG ${q.ag}`,
    ].join(" / ");
  }
  return [
    `pH ${formatNumber(q.ph)}`,
    `PaCO2 ${q.paco2}`,
    `HCO3 ${q.hco3}`,
    q.ag !== undefined ? `AG ${q.ag}` : null,
  ].filter(Boolean).join(" / ");
}

function recordLogEvent(event) {
  if (!activeRunId) startRunSession();
  const withMeta = {
    runId: activeRunId,
    timestamp: new Date().toISOString(),
    uploadedAt: null,
    ...event,
  };
  logStore.events.push(withMeta);
  runEvents.push(withMeta);
  saveLogStore();
}

function buildLogCsv() {
  const header = [
    "type",
    "runId",
    "timestamp",
    "stageId",
    "stageName",
    "outcome",
    "elapsedSec",
    "question",
    "choice",
    "correctLabel",
    "explanation",
    "correct",
    "misses",
    "totalQuestions",
    "rate",
    "avgCorrectSec",
    "runStartAt",
    "runEndAt",
    "wrongQuestions",
  ];
  const rows = logStore.events.map((event) => ([
    event.type || "",
    event.runId || "",
    event.timestamp || "",
    event.stageId ?? "",
    event.stageName || "",
    event.outcome || "",
    event.elapsedSec != null ? formatNumber(event.elapsedSec) : "",
    event.question || "",
    event.choice || "",
    event.correctLabel || "",
    event.explanation || "",
    event.correct ?? "",
    event.misses ?? "",
    event.totalQuestions ?? "",
    event.rate ?? "",
    event.avgCorrectSec != null ? formatNumber(event.avgCorrectSec) : "",
    event.runStartAt || "",
    event.runEndAt || "",
    event.wrongQuestions || "",
  ]));
  const csvLines = [header, ...rows].map((cols) =>
    cols.map((col) => `"${String(col).replace(/"/g, "\"\"")}"`).join(",")
  );
  return `\uFEFF${csvLines.join("\n")}`;
}

function downloadLogCsv() {
  if (!logStore.events.length) {
    if (typeof ui.flashMessage === "function") {
      ui.flashMessage("ログがまだありません。");
    } else {
      window.alert("ログがまだありません。");
    }
    return;
  }
  const csv = buildLogCsv();
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `bloodgas_logs_${new Date().toISOString().slice(0, 10)}.csv`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

function getUploadUrl() {
  return window.BG_LOG_UPLOAD_URL
    || localStorage.getItem(LS_LOG_UPLOAD_URL_KEY)
    || DEFAULT_UPLOAD_URL;
}

function normalizeStage6CasesUrl(rawUrl) {
  if (!rawUrl) return "";
  try {
    const url = new URL(rawUrl);
    if (url.hostname.includes("docs.google.com") && url.pathname.includes("/spreadsheets/d/")) {
      const [, , , , sheetId] = url.pathname.split("/");
      const gid = url.searchParams.get("gid");
      const exportUrl = new URL(`https://docs.google.com/spreadsheets/d/${sheetId}/export`);
      exportUrl.searchParams.set("format", "csv");
      if (gid) exportUrl.searchParams.set("gid", gid);
      return exportUrl.toString();
    }
    return rawUrl;
  } catch (error) {
    return rawUrl;
  }
}

function getStage6CasesUrl() {
  return normalizeStage6CasesUrl(DEFAULT_STAGE6_CASES_URL);
}

function getLastUploadAt() {
  const raw = localStorage.getItem(LS_LOG_LAST_UPLOAD_KEY);
  return raw ? Number(raw) : 0;
}

function setLastUploadAt(value) {
  localStorage.setItem(LS_LOG_LAST_UPLOAD_KEY, String(value));
}

async function bootApp() {
  ui = createUI();
  audio = createAudio();
  DEFAULT_CARD_MIN = ui.layout.CARD_W_MIN;
  DEFAULT_CARD_MAX = ui.layout.CARD_W_MAX;
  const stage6Cases = await loadStage6Cases(getStage6CasesUrl());
  stages = [
    createStage0(),
    createStage1(),
    createStage2(),
    createStage3(),
    createStage4(),
    createStage5(),
    createStage6(stage6Cases),
  ];
  game = createGame({ ui, audio, stages });
}

function collectPendingEvents() {
  return logStore.events.filter(event => !event.uploadedAt);
}

async function uploadLogsIfDue() {
  const uploadUrl = getUploadUrl();
  if (!uploadUrl) return;

  const now = Date.now();
  const lastUploadAt = getLastUploadAt();
  if (now - lastUploadAt < UPLOAD_INTERVAL_MS) return;

  const pending = collectPendingEvents();
  if (!pending.length) return;

  try {
    const res = await fetch(uploadUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        generatedAt: new Date().toISOString(),
        source: "bloodgas",
        events: pending,
      }),
    });
    if (!res.ok) {
      console.warn("Log upload failed", res.status);
      return;
    }
    const uploadedAt = new Date().toISOString();
    pending.forEach((event) => {
      event.uploadedAt = uploadedAt;
    });
    setLastUploadAt(now);
    saveLogStore();
  } catch (err) {
    console.warn("Log upload error", err);
  }
}

function getUnlockedMax() {
  if (FORCE_UNLOCK_ALL_STAGES) return stages.length;
  const raw = localStorage.getItem(LS_UNLOCK_KEY);
  const parsed = Number.parseInt(raw ?? "", 10);
  if (!Number.isFinite(parsed) || parsed < 1) return 1;
  return Math.min(parsed, stages.length);
}
function setUnlockedMax(v) {
  const safe = Math.min(Math.max(1, v), stages.length);
  localStorage.setItem(LS_UNLOCK_KEY, String(safe));
}

function loadClearedStageIds() {
  try {
    const raw = localStorage.getItem(LS_CLEARED_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    if (Array.isArray(parsed)) return new Set(parsed.map(Number).filter(Number.isFinite));
  } catch (err) {
    console.warn("Failed to load cleared stages", err);
  }
  return new Set();
}

function saveClearedStageIds(ids) {
  localStorage.setItem(LS_CLEARED_KEY, JSON.stringify([...ids]));
}

const clearedStageIds = loadClearedStageIds();

function markStageCleared(stageId) {
  if (clearedStageIds.has(stageId)) return;
  clearedStageIds.add(stageId);
  saveClearedStageIds(clearedStageIds);
}

function buildStageStates() {
  const unlockedMax = getUnlockedMax();
  return stages.map((stage) => {
    if (stage.id > unlockedMax) return { id: stage.id, status: "locked" };
    if (clearedStageIds.has(stage.id)) return { id: stage.id, status: "cleared" };
    if (stage.id === selectedStageId) return { id: stage.id, status: "challenging" };
    return { id: stage.id, status: "unlocked" };
  });
}

function refreshStageButtons() {
  ui.setStageButtons(buildStageStates());
}
function unlockUpTo(stageId) {
  const cur = getUnlockedMax();
  if (stageId > cur) setUnlockedMax(stageId);
  refreshStageButtons();
}

function applyStageMeta(stageId) {
  const st = stages[stageId - 1];
  const startTitle = document.getElementById("startTitle");
  const startDesc = document.getElementById("startDesc");
  if (startTitle) startTitle.textContent = st.name;
  if (startDesc) startDesc.textContent = st.startDesc || "スタートして開始";
}

function setStageLayout(stageId) {
  if (stageId === 1) {
    ui.layout.CARD_W_MIN = 220;
    ui.layout.CARD_W_MAX = 300;
    return;
  }
  ui.layout.CARD_W_MIN = DEFAULT_CARD_MIN;
  ui.layout.CARD_W_MAX = DEFAULT_CARD_MAX;
}

function setStageMode(stageId) {
  document.body.classList.toggle("stage6-mode", stageId === 7);
  document.body.classList.toggle("stage1-mode", stageId === 2);
  setStageLayout(stageId);
}

async function initApp() {
  await bootApp();

  // ---- menu stage selection ----
  ui.onSelectStage((stageId) => {
    selectedStageId = stageId;
    ui.setPauseLabel("一時停止");
    game.setStage(stageId);
    applyStageMeta(stageId);
    audio.stopBGM();
    setStageMode(stageId);
    ui.showScreen("game");
    startRunSession();
    game.prepareRun();
    refreshStageButtons();
  });

  uploadLogsIfDue();

  ui.onStart(() => {
    audio.unlockByGesture();
    audio.click();
    ui.hideStartOverlay();
    ui.showLessonIntro(game.stage, () => {
      game.startRun();
    });
  });

  ui.onPauseToggle(() => game.togglePause());
  ui.onRestart(() => {
    startRunSession();
    game.prepareRun();
  });
  ui.onExit(() => {
    const ended = game.endRun();
    if (!ended) {
      game.stop();
      audio.stopBGM();
      setStageMode(null);
      ui.showScreen("menu");
    }
  });

  // result modal
  ui.onResultRetry(() => {
    ui.hideResult();
    startRunSession();
    game.prepareRun();
  });

  ui.onResultMenu(() => {
    ui.hideResult();
    game.stop();
    audio.stopBGM();
    setStageMode(null);
    ui.showScreen("menu");
  });

  ui.onResultNextStage(() => {
    ui.hideResult();
    const nextId = Math.min(selectedStageId + 1, stages.length);
    if (nextId <= getUnlockedMax()) {
      selectedStageId = nextId;
      game.setStage(nextId);
      applyStageMeta(nextId);
      audio.stopBGM();
      setStageMode(nextId);
      ui.showScreen("game");
      startRunSession();
      game.prepareRun();
    } else {
      setStageMode(null);
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
  ui.onDownloadLog(() => downloadLogCsv());

  game.onLog((payload) => {
    recordLogEvent({
      type: payload.type,
      stageId: payload.stageId,
      stageName: payload.stageName,
      outcome: payload.outcome,
      elapsedSec: payload.elapsedSec,
      question: formatQuestionSummary(payload.q),
      choice: payload.choiceLabel || "",
      correctLabel: payload.correctLabel || "",
      explanation: payload.explanation || "",
    });
  });

  game.onResult((result) => {
    // 18問到達で解放 or クリアで次解放
    if (result.unlockedNextStageId) unlockUpTo(result.unlockedNextStageId);
    if (result.cleared) {
      markStageCleared(result.stageId);
      unlockUpTo(Math.min(result.stageId + 1, stages.length));
    }
    refreshStageButtons();

    // 次ボタンを押せるように
    ui.showResult(result);

    const correctTimes = runEvents
      .filter(event => event.type === "question" && event.outcome === "correct")
      .map(event => event.elapsedSec)
      .filter(value => Number.isFinite(value));
    const avgCorrectSec = correctTimes.length
      ? correctTimes.reduce((sum, value) => sum + value, 0) / correctTimes.length
      : null;
    const wrongQuestions = runEvents
      .filter(event => event.type === "question" && event.outcome !== "correct")
      .map(event => event.question)
      .filter(Boolean)
      .join(" | ");
    recordLogEvent({
      type: "stage",
      stageId: result.stageId,
      stageName: result.stageName,
      correct: result.correct,
      misses: result.misses,
      totalQuestions: result.correct + result.misses,
      rate: result.rate,
      avgCorrectSec,
      runStartAt,
      runEndAt: new Date().toISOString(),
      wrongQuestions,
    });
    void uploadLogsIfDue();
  });

  // init
  refreshStageButtons();
  applyStageMeta(1);
  ui.setPauseLabel("一時停止");
  ui.showScreen("menu");
}

void initApp();
