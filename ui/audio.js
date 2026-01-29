export function createAudio() {
  const $ = (id) => document.getElementById(id);

  const a = {
    bgmEarly: $("bgmEarly"),
    bgmLate: $("bgmLate"),
    ok: $("seOk"),
    bad: $("seBad"),
    finish: $("seFinish"),
    gameover: $("seGameover"),
    unlock: $("seUnlock"),
    click: $("seClick"),
  };

  let ready = false;

  function unlockByGesture() {
    if (ready) return;
    ready = true;

    if (a.bgmEarly) a.bgmEarly.volume = 0.12;
    if (a.bgmLate) a.bgmLate.volume = 0.12;

    if (a.ok) a.ok.volume = 0.6;
    if (a.bad) a.bad.volume = 0.6;
    if (a.finish) a.finish.volume = 0.7;
    if (a.gameover) a.gameover.volume = 0.7;
    if (a.unlock) a.unlock.volume = 0.7;
    if (a.click) a.click.volume = 0.35;
  }

  function playOnce(x) {
    if (!x) return;
    try { x.currentTime = 0; } catch {}
    x.play().catch(() => {});
  }

  function stopBGM() {
    [a.bgmEarly, a.bgmLate].forEach(x => {
      if (!x) return;
      x.pause();
      try { x.currentTime = 0; } catch {}
    });
  }

  function bgm(mode) {
    if (!ready) return;
    if (mode === "late") {
      if (a.bgmEarly) a.bgmEarly.pause();
      if (a.bgmLate && a.bgmLate.paused) a.bgmLate.play().catch(()=>{});
    } else {
      if (a.bgmLate) a.bgmLate.pause();
      if (a.bgmEarly && a.bgmEarly.paused) a.bgmEarly.play().catch(()=>{});
    }
  }

  return {
    unlockByGesture,
    stopBGM,
    bgm,
    click: () => { unlockByGesture(); playOnce(a.click); },
    ok: () => { unlockByGesture(); playOnce(a.ok); },
    bad: () => { unlockByGesture(); playOnce(a.bad); },
    finish: () => { unlockByGesture(); playOnce(a.finish); },
    gameover: () => { unlockByGesture(); playOnce(a.gameover); },
    unlock: () => { unlockByGesture(); playOnce(a.unlock); },
  };
}
