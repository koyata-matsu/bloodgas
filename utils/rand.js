export const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));

export function shuffle(arr) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function randInt(a, b) {
  return a + Math.floor(Math.random() * (b - a + 1));
}
