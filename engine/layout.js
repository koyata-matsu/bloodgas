import { clamp } from "../utils/rand.js";

export function laneTopPx(topY, rowGap, laneId) {
  return topY + rowGap * laneId;
}

export function getCols(laneEl, pad, gap) {
  const laneW = laneEl.clientWidth;
  const usable = Math.max(320, laneW - pad * 2 - gap);
  const colW = Math.floor(usable / 2);
  return {
    colW,
    left0: pad,
    left1: pad + colW + gap,
  };
}

export function applyLayout({
  laneEl,
  el,
  laneId,
  maxConcurrent,
  topY,
  rowGap,
  pad,
  gap,
  cardMinW,
  cardMaxW,
}) {
  el.style.position = "absolute";
  el.style.boxSizing = "border-box";

  // y
  el.style.top = `${laneTopPx(topY, rowGap, laneId)}px`;

  // x & width
  const laneW = laneEl.clientWidth;

  if (maxConcurrent >= 2) {
    const cols = getCols(laneEl, pad, gap);
    const baseLeft = laneId === 0 ? cols.left0 : cols.left1;
    const w = clamp(cols.colW, cardMinW, cardMaxW);
    el.style.left = `${baseLeft}px`;
    el.style.width = `${w}px`;
    return baseLeft;
  }

  const w = clamp(laneW - pad * 2, cardMinW, cardMaxW);
  el.style.left = `${pad}px`;
  el.style.width = `${w}px`;
  return pad;
}

export function effectiveX(card) {
  return (card.baseLeft || 0) + card.x;
}

export function pickTargetIndex(cards) {
  if (!cards.length) return -1;
  let best = 0;
  for (let i = 1; i < cards.length; i++) {
    if (effectiveX(cards[i]) < effectiveX(cards[best])) best = i;
  }
  return best;
}
