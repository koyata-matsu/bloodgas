(() => {
  "use strict";

  // ========= Rules =========
  const CHOICES = [
    "代謝性アシドーシス",
    "呼吸性アシドーシス",
    "代謝性アルカローシス",
    "呼吸性アルカローシス",
  ];

  const UNLOCK_NEED = 18;
  const CLEAR_COUNT = 30;
  const OVERLAP_START = 14; // 15問目から2枚

  // 2レーン時のグローバル出題間隔（上下まとめて）
  const MIN_GAP_TWO_LANE = 0.8;
  let lastSpawnAt = -999; // seconds

  const CFG = {
    startTimeLimitSec: 15.0,
    minTimeLimitSec: 4.5,
    accelPerCorrect: 0.55,
    accelPerSpawn: 0.08,

    hpMax: 100,
    hpStart: 60,
    hpDrainBasePerSec: 0.9,
    hpDrainGrow: 0.015,
    hpGainBase: 5,
    hpGainPerSecLeft: 0.9,
    hpLossWrong: 10,
    hpLossMiss: 14,

    spawnIntervalStart: 2.8,
    spawnIntervalEnd: 1.2,
    spawnIntervalMin: 0.8, // 0.8未満にしない
  };

  // ========= Layout =========
  const PAD = 12;
  const COL_GAP = 12;
  const CARD_W_MIN = 260;
  const CARD_W_MAX = 360;

  const TOP_Y = 14;
  const ROW_GAP = 180;

  const LANE_ONE_H = 170;
  const LANE_TWO_H = 360;

  const MISS_X = 8;

  // ========= Slow on wrong =========
  let slowHoldSec = 0;
  let slowMult = 1.0;
  function triggerSlowOnWrong(){
    slowHoldSec = 1.0;
    slowMult = 0.18;
  }

  // ========= Utils =========
  const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));
  const shuffle = (arr) => {
    const a = arr.slice();
    for (let i=a.length-1;i>0;i--){
      const j=Math.floor(Math.random()*(i+1));
      [a[i],a[j]]=[a[j],a[i]];
    }
    return a;
  };

  // ========= Bank 100 =========
  function makeBank100(){
    const bank=[];
    const push=(ph,paco2,hco3,ans)=>bank.push({ph,paco2,hco3,ans});

    for(let i=0;i<25;i++){
      const ph=Number((7+(8+(i%8))/100).toFixed(2));
      push(ph,22+(i%13),7+(i%10),0);
    }
    for(let i=0;i<25;i++){
      const ph=Number((7+(18+(i%12))/100).toFixed(2));
      push(ph,55+(i%26),25+(i%9),1);
    }
    for(let i=0;i<25;i++){
      const ph=Number((7+(46+(i%15))/100).toFixed(2));
      push(ph,43+(i%14),30+(i%20),2);
    }
    for(let i=0;i<25;i++){
      const ph=Number((7+(46+(i%13))/100).toFixed(2));
      push(ph,22+(i%13),18+(i%8),3);
    }
    return bank;
  }

  let bank = shuffle(makeBank100());
  let bankIndex = 0;
  function nextQuestion(){
    if(bankIndex>=bank.length){ bank=shuffle(bank); bankIndex=0; }
    return bank[bankIndex++];
  }

  // ========= DOM =========
  const $ = (id)=>document.getElementById(id);

  const screenMenu = $("screenMenu");
  const screenLesson = $("screenLesson");
  const screenGame = $("screenGame");

  const toLessonBtn = $("toLessonBtn");
  const toGameBtn = $("toGameBtn");
  const backToMenuBtn = $("backToMenuBtn");

  const hudStat = $("hudStat");
  const hudSub = $("hudSub");

  const toggleNormBtn = $("toggleNormBtn");
  const normPanel = $("normPanel");

  const healthFill = $("healthFill");
  const healthBar = document.querySelector(".healthBar");
  const lane = document.querySelector(".lane");

  const choicesEl = $("choices");
  const feedbackEl = $("feedback");

  const pauseBtn = $("pauseBtn");
  const restartBtn = $("restartBtn");
  const exitBtn = $("exitBtn");

  const startOverlay = $("startOverlay");
  const startBtn = $("startBtn");

  const judgeFx = $("judgeFx");

  const resultModal = $("resultModal");
  const rankTitleEl = $("rankTitle");
  const scoreNum = $("scoreNum");
  const scoreRate = $("scoreRate");
  const missNum = $("missNum");
  const unlockMsg = $("unlockMsg");
  const retryBtn = $("retryBtn");
  const nextBtn = $("nextBtn");
  const menuBtn = $("menuBtn");

  const diffBtns = [...document.querySelectorAll(".difficulty .choice")];

  // audio
  const bgmEarly = $("bgmEarly");
  const bgmLate  = $("bgmLate");
  const seOk = $("seOk");
  const seBad = $("seBad");
  const seFinish = $("seFinish");
  const seGameover = $("seGameover");
  const seUnlock = $("seUnlock");
  const seClick = $("seClick");

  let audioReady=false;
  function initAudioOnce(){
    if(audioReady) return;
    audioReady=true;
    if(bgmEarly) bgmEarly.volume=0.12;
    if(bgmLate)  bgmLate.volume=0.12;
    if(seOk) seOk.volume=0.6;
    if(seBad) seBad.volume=0.6;
    if(seFinish) seFinish.volume=0.7;
    if(seGameover) seGameover.volume=0.7;
    if(seUnlock) seUnlock.volume=0.7;
    if(seClick) seClick.volume=0.35;
  }
  function playSE(a){
    if(!a) return;
    try{ a.currentTime=0; }catch{}
    a.play().catch(()=>{});
  }
  function clickSE(){ initAudioOnce(); playSE(seClick); }
  function stopBGM(){
    [bgmEarly,bgmLate].forEach(a=>{
      if(!a) return;
      a.pause(); try{a.currentTime=0;}catch{}
    });
  }
  function playBGM(mode){
    if(!audioReady) return;
    const V=0.12;
    if(bgmEarly) bgmEarly.volume=V;
    if(bgmLate)  bgmLate.volume=V;
    if(mode==="late"){
      if(bgmEarly && !bgmEarly.paused) bgmEarly.pause();
      if(bgmLate && bgmLate.paused) bgmLate.play().catch(()=>{});
    }else{
      if(bgmLate && !bgmLate.paused) bgmLate.pause();
      if(bgmEarly && bgmEarly.paused) bgmEarly.play().catch(()=>{});
    }
  }

  // ========= State =========
  let running=false, paused=false;
  let rafId=null, lastTs=null;

  let hp=CFG.hpStart;
  let timeLimitSec=CFG.startTimeLimitSec;

  let spawnedCount=0;
  let correct=0;
  let misses=0;

  let spawnCooldown=1.6;
  let inputLocked=false;

  // cards: {q, laneId, baseLeft, x, bornAt, el}
  let activeCards=[];

  // ========= UI =========
  function showScreen(name){
    if(screenMenu) screenMenu.classList.toggle("hidden", name!=="menu");
    if(screenLesson) screenLesson.classList.toggle("hidden", name!=="lesson");
    if(screenGame) screenGame.classList.toggle("hidden", name!=="game");
    const modeLabel = $("modeLabel");
    if (modeLabel) modeLabel.textContent = name[0].toUpperCase() + name.slice(1);
  }
  function stopLoop(){
    if(rafId!=null) cancelAnimationFrame(rafId);
    rafId=null; lastTs=null;
  }
  function setFeedback(t){
    if(feedbackEl) feedbackEl.textContent=t||"";
  }
  function setHud(){
    const remainUnlock=Math.max(0, UNLOCK_NEED - correct);
    const remainClear=Math.max(0, CLEAR_COUNT - correct);
    if(hudStat) hudStat.textContent = `次ステージまで ${remainUnlock} 問`;
    if(hudSub) hudSub.textContent = `クリアまで ${remainClear} 問 / ミス ${misses}`;
    if(nextBtn) nextBtn.disabled = (correct < UNLOCK_NEED);
  }
  function setHp(v, anim=null){
    hp = clamp(v, 0, CFG.hpMax);
    if(healthFill){
      healthFill.style.width = `${(hp/CFG.hpMax)*100}%`;
      healthFill.classList.remove("hpGain","hpLoss");
      if(anim==="gain"){ healthFill.classList.add("hpGain"); setTimeout(()=>healthFill.classList.remove("hpGain"),280); }
      if(anim==="loss"){ healthFill.classList.add("hpLoss"); setTimeout(()=>healthFill.classList.remove("hpLoss"),280); }
    }
    if(running && hp<=0) finishGame(false);
  }
  function barShake(){
    if(!healthBar) return;
    healthBar.classList.remove("hpBarShake");
    void healthBar.offsetWidth;
    healthBar.classList.add("hpBarShake");
  }
  function showJudge(ok){
    if(!judgeFx) return;
    judgeFx.textContent = ok ? "○" : "×";
    judgeFx.classList.remove("hidden","ok","ng","show");
    judgeFx.classList.add(ok ? "ok":"ng");
    requestAnimationFrame(()=>judgeFx.classList.add("show"));
    setTimeout(()=>{
      judgeFx.classList.remove("show");
      setTimeout(()=>judgeFx.classList.add("hidden"),160);
    },260);
  }

  function getMaxConcurrent(){
    return (spawnedCount >= OVERLAP_START) ? 2 : 1;
  }
  function updateLaneHeight(){
    if(!lane) return;
    lane.style.height = (getMaxConcurrent()>=2) ? `${LANE_TWO_H}px` : `${LANE_ONE_H}px`;
  }
  function laneTopPx(laneId){
    return TOP_Y + laneId * ROW_GAP;
  }
  function getCols(){
    const laneW = lane.clientWidth;
    const usable = Math.max(320, laneW - PAD*2 - COL_GAP);
    const colW = Math.floor(usable/2);
    const left0 = PAD;
    const left1 = PAD + colW + COL_GAP;
    return { colW, left0, left1 };
  }
  function getFreeLaneId(){
    const used0 = activeCards.some(c=>c.laneId===0);
    const used1 = activeCards.some(c=>c.laneId===1);
    if(!used0) return 0;
    if(!used1) return 1;
    return null;
  }

  // ========= Card content =========
  function pickGasDisplayMode(){
    if(spawnedCount < 9) return "normal";
    const r=Math.random();
    if(r<0.25) return "normal";
    if(r<0.50) return "swap";
    if(r<0.75) return "onlyCO2";
    return "onlyHCO3";
  }
  function buildCardInnerHTML(q){
    const mode = pickGasDisplayMode();
    const ph = `<span class="qItem ph"><b>pH</b> <span class="vph">${q.ph.toFixed(2)}</span></span>`;
    const co2 = `<span class="qItem co2"><b>PaCO₂</b> <span class="vpco2">${q.paco2}</span> <span class="unit">mmHg</span></span>`;
    const hco3 = `<span class="qItem hco3"><b>HCO₃⁻</b> <span class="vhco3">${q.hco3}</span> <span class="unit">mEq/L</span></span>`;
    const sep = `<span class="qSep">/</span>`;
    let rest="";
    if(mode==="onlyCO2") rest = `${sep}${co2}`;
    else if(mode==="onlyHCO3") rest = `${sep}${hco3}`;
    else if(mode==="swap") rest = `${sep}${hco3}${sep}${co2}`;
    else rest = `${sep}${co2}${sep}${hco3}`;
    return `<div class="qOne">${ph}${rest}</div><div class="qIcon" aria-hidden="true">🚑</div>`;
  }

  function applyLayoutForCard(el, laneId){
    const laneW = lane.clientWidth;
    const maxNow = getMaxConcurrent();

    el.style.top = `${laneTopPx(laneId)}px`;

    if(maxNow >= 2){
      const cols = getCols();
      const baseLeft = (laneId===0) ? cols.left0 : cols.left1;
      const w = clamp(cols.colW, CARD_W_MIN, CARD_W_MAX);
      el.style.left = `${baseLeft}px`;
      el.style.width = `${w}px`;
      return baseLeft;
    }else{
      const w = clamp(laneW - PAD*2, CARD_W_MIN, CARD_W_MAX);
      el.style.left = `${PAD}px`;
      el.style.width = `${w}px`;
      return PAD;
    }
  }

  function createCardEl(q, laneId){
    const el=document.createElement("div");
    el.className="qcard dynamic";
    el.style.position="absolute";
    el.style.boxSizing="border-box";

    const baseLeft = applyLayoutForCard(el, laneId);
    el.style.transform = `translateX(${lane.clientWidth}px)`;
    el.innerHTML = buildCardInnerHTML(q);
    lane.appendChild(el);

    return { el, baseLeft };
  }

  function getTargetIndex(){
    if(activeCards.length===0) return -1;
    let best=0;
    for(let i=1;i<activeCards.length;i++){
      const a=(activeCards[i].baseLeft||0)+activeCards[i].x;
      const b=(activeCards[best].baseLeft||0)+activeCards[best].x;
      if(a<b) best=i;
    }
    return best;
  }

  function forceRelayoutAll(){
    const tIdx = getTargetIndex();
    activeCards.forEach((c,i)=>{
      if(!c.el) return;
      c.baseLeft = applyLayoutForCard(c.el, c.laneId);
      c.el.style.transform = `translateX(${c.x}px)`;

      if(i===tIdx){
        c.el.style.border="2px solid rgba(40,90,255,0.35)";
        c.el.style.boxShadow="0 0 0 2px rgba(40,90,255,0.10)";
      }else{
        c.el.style.border="1px solid rgba(0,0,0,0.06)";
        c.el.style.boxShadow="none";
      }
    });
    updateLaneHeight();
  }

  function removeCardAt(idx){
    if(idx<0||idx>=activeCards.length) return;
    const c=activeCards[idx];
    if(c?.el) c.el.remove();
    activeCards.splice(idx,1);
    forceRelayoutAll();
  }

  function updateCardTransforms(){
    forceRelayoutAll();
  }

  function calcSpawnIntervalSec(){
    const t = clamp((spawnedCount-OVERLAP_START)/20, 0, 1);
    const v = CFG.spawnIntervalStart + (CFG.spawnIntervalEnd-CFG.spawnIntervalStart)*t;
    return Math.max(CFG.spawnIntervalMin, v);
  }

  function spawnCard(){
    if(!lane) return;
    if(activeCards.length >= getMaxConcurrent()) return;

    const laneId = getFreeLaneId();
    if(laneId===null) return;

    const q = nextQuestion();
    const { el, baseLeft } = createCardEl(q, laneId);

    activeCards.push({
      q,
      laneId,
      baseLeft,
      x: lane.clientWidth + 30,
      bornAt: performance.now(),
      el
    });

    spawnedCount++;
    lastSpawnAt = performance.now()/1000;

    if(running && spawnedCount>=OVERLAP_START) playBGM("late");
    forceRelayoutAll();
  }

  // ========= Choices =========
  function renderChoices(){
    if(!choicesEl) return;
    choicesEl.innerHTML="";
    CHOICES.forEach((label,i)=>{
      const b=document.createElement("button");
      b.className="choiceBtn";
      b.textContent=label;
      b.addEventListener("click", ()=>{
        if(!running || paused || inputLocked) return;
        if(activeCards.length===0) return;
        inputLocked=true;
        judge(i);
      });
      choicesEl.appendChild(b);
    });
  }

  // ========= Judge =========
  function judge(choiceIdx){
    const tIdx = getTargetIndex();
    if(tIdx<0){ inputLocked=false; return; }
    const t = activeCards[tIdx];

    const limit=timeLimitSec;
    const elapsed=(performance.now()-t.bornAt)/1000;
    const timeLeft=Math.max(0, limit-elapsed);

    if(choiceIdx===t.q.ans){
      correct++;
      playSE(seOk);

      setHp(hp + (CFG.hpGainBase + CFG.hpGainPerSecLeft*timeLeft), "gain");
      timeLimitSec = Math.max(CFG.minTimeLimitSec, timeLimitSec - CFG.accelPerCorrect);

      showJudge(true);
      removeCardAt(tIdx);

      if(correct === UNLOCK_NEED) playSE(seUnlock);
      if(correct >= CLEAR_COUNT){ finishGame(true); return; }

      setHud();
      setFeedback("OK！");
      inputLocked=false;
      return;
    }

    // 不正解：HP減少、カードは消して次（再出題しない）
    misses++;
    playSE(seBad);
    triggerSlowOnWrong();

    setHp(hp - CFG.hpLossWrong, "loss");
    barShake();
    showJudge(false);

    removeCardAt(tIdx);

    setHud();
    setFeedback("ミス！");
    inputLocked=false;
  }

  // ========= Result =========
  function showResultModal(cleared){
    if(!resultModal) return;

    const rate = Math.round((correct/Math.max(1,spawnedCount))*100);
    if(rankTitleEl) rankTitleEl.textContent = cleared ? "✅ ステージクリア！" : "💀 ゲームオーバー";
    if(scoreNum) scoreNum.textContent = String(correct);
    if(scoreRate) scoreRate.textContent = String(rate);
    if(missNum) missNum.textContent = String(misses);

    if(unlockMsg){
      unlockMsg.innerHTML =
        `<div style="line-height:1.6;">`+
          `<div style="font-size:22px;font-weight:900;">正解：<b>${correct}</b> / ${CLEAR_COUNT}</div>`+
          `<div style="margin-top:6px;opacity:.9;">次ステージ解放：${UNLOCK_NEED}（${correct>=UNLOCK_NEED?"✅解放":"未解放"}）</div>`+
          `<div style="margin-top:6px;opacity:.9;">ミス：${misses}　出題：${spawnedCount}</div>`+
        `</div>`;
    }

    if(nextBtn) nextBtn.disabled = !(correct>=UNLOCK_NEED);
    resultModal.classList.remove("hidden");
  }

  function hideResultModal(){
    if(resultModal) resultModal.classList.add("hidden");
  }

  function finishGame(cleared){
    running=false; paused=true; inputLocked=true;
    stopLoop(); stopBGM();
    if(cleared) playSE(seFinish); else playSE(seGameover);
    showResultModal(cleared);
  }

  // ========= Loop =========
  function loop(ts){
    if(!running || paused) return;

    if(lastTs==null){
      lastTs=ts;
      rafId=requestAnimationFrame(loop);
      return;
    }

    let dt=(ts-lastTs)/1000;
    lastTs=ts;
    if(!Number.isFinite(dt)||dt<0||dt>0.25) dt=0;

    // slow effect
    let mult;
    if(slowHoldSec>0){
      slowHoldSec -= dt;
      mult = 0.18;
      if(slowHoldSec<=0) slowHoldSec=0;
    }else{
      if(slowMult<1.0) slowMult = Math.min(1.0, slowMult + dt*0.9);
      mult = slowMult;
    }

    // HP drain
    setHp(hp - (CFG.hpDrainBasePerSec + CFG.hpDrainGrow*spawnedCount)*dt, null);
    if(hp<=0) return;

    // ===== spawn gating (IMPORTANT) =====
    const nowSec = performance.now()/1000;
    const maxNow = getMaxConcurrent();

    spawnCooldown -= dt;

    if (maxNow === 1) {
      if (activeCards.length === 0 && spawnCooldown <= 0) {
        spawnCard();
        spawnCooldown = calcSpawnIntervalSec();
      }
    } else {
      // 2レーン：上下共通で0.8秒未満は出さない & 1回に1枚だけ
      const gapOk = (nowSec - lastSpawnAt) >= MIN_GAP_TWO_LANE;
      if (activeCards.length < 2 && spawnCooldown <= 0 && gapOk) {
        spawnCard();
        spawnCooldown = calcSpawnIntervalSec();
      }
    }

    // move
    const startX = lane.clientWidth + 30;
    const dist = Math.max(1, startX - MISS_X);
    const baseSpeed = dist / Math.max(0.001, timeLimitSec);
    const speed = baseSpeed * mult;

    activeCards.forEach(c=>{ c.x -= speed*dt; });

    // miss check (target only)
    const tIdx = getTargetIndex();
    if(tIdx>=0){
      const t = activeCards[tIdx];
      const effX = (t.baseLeft||0) + t.x;

      if(effX <= MISS_X){
        misses++;
        playSE(seBad);
        triggerSlowOnWrong();

        setHp(hp - CFG.hpLossMiss, "loss");
        barShake();
        showJudge(false);

        // 取り逃し：カード消して次（再出題しない）
        removeCardAt(tIdx);

        setHud();
        setFeedback("取り逃し！");
      }
    }

    forceRelayoutAll();
    rafId=requestAnimationFrame(loop);
  }

  // ========= Prepare/Start =========
  function clearLane(){
    if(!lane) return;
    lane.querySelectorAll(".qcard.dynamic").forEach(el=>el.remove());
    activeCards=[];
    updateLaneHeight();
  }

  function prepareGame(){
    hideResultModal();

    running=false; paused=false; inputLocked=true;
    stopLoop(); stopBGM();

    bank = shuffle(makeBank100());
    bankIndex = 0;

    spawnedCount=0;
    correct=0;
    misses=0;

    hp = CFG.hpStart;
    timeLimitSec = CFG.startTimeLimitSec;

    slowHoldSec=0; slowMult=1.0;
    spawnCooldown=1.6;
    lastSpawnAt=-999;

    clearLane();
    renderChoices();
    updateLaneHeight();

    setHp(hp, null);
    setHud();
    setFeedback("");

    if(startOverlay){
      startOverlay.style.display="";
      startOverlay.classList.remove("hidden");
    }

    showScreen("game");
  }

  function startRun(){
    if(running) return;
    running=true; paused=false; inputLocked=false;
    lastTs=null;

    // まず1枚だけ出す（2枚目は0.8秒後以降）
    if(activeCards.length===0) {
      spawnCard();
    }
    forceRelayoutAll();

    playBGM("early");

    stopLoop();
    rafId=requestAnimationFrame(loop);
  }

  // ========= wiring =========
  diffBtns.forEach(btn=>{
    btn.addEventListener("click", ()=>{
      if(btn.disabled) return;
      clickSE();
      diffBtns.forEach(b=>b.classList.remove("selected"));
      btn.classList.add("selected");
      if(toLessonBtn) toLessonBtn.disabled=false;
    });
  });

  if(toLessonBtn) toLessonBtn.addEventListener("click", ()=>{ clickSE(); showScreen("lesson"); });
  if(backToMenuBtn) backToMenuBtn.addEventListener("click", ()=>{ clickSE(); showScreen("menu"); });
  if(toGameBtn) toGameBtn.addEventListener("click", ()=>{ clickSE(); prepareGame(); });

  if(toggleNormBtn) toggleNormBtn.addEventListener("click", ()=>{
    clickSE();
    if(normPanel) normPanel.classList.toggle("hidden");
  });

  if(pauseBtn) pauseBtn.addEventListener("click", ()=>{
    if(!running) return;
    clickSE();
    paused = !paused;
    pauseBtn.textContent = paused ? "再開" : "一時停止";
    if(!paused){
      lastTs=null;
      stopLoop();
      rafId=requestAnimationFrame(loop);
    }else{
      stopLoop();
    }
  });

  if(restartBtn) restartBtn.addEventListener("click", ()=>{ clickSE(); prepareGame(); });
  if(exitBtn) exitBtn.addEventListener("click", ()=>{ clickSE(); stopLoop(); stopBGM(); showScreen("menu"); });

  if(startBtn) startBtn.addEventListener("click", ()=>{
    initAudioOnce();
    clickSE();
    if(startOverlay){
      startOverlay.style.display="none";
      startOverlay.classList.add("hidden");
    }
    startRun();
  });

  if(retryBtn) retryBtn.addEventListener("click", ()=>{ clickSE(); hideResultModal(); prepareGame(); });
  if(menuBtn) menuBtn.addEventListener("click", ()=>{ clickSE(); hideResultModal(); stopBGM(); showScreen("menu"); });

  if(nextBtn) nextBtn.addEventListener("click", ()=>{
    if(correct < UNLOCK_NEED) return;
    clickSE();
    hideResultModal();
    showScreen("lesson");
  });

  if(resultModal){
    const bd=resultModal.querySelector(".modalBackdrop");
    if(bd) bd.addEventListener("click", ()=>hideResultModal());
  }

  window.addEventListener("resize", ()=>forceRelayoutAll());

  // init
  showScreen("menu");
  setHud();
})();
