export function createStage4() {
  return {
    id: 5,
    name: "ステージ4：混合（準備中）",
    unlockNeed: 18,
    clearCount: 30,
    overlapStart: 14,
    needsComp: false,

    nextQuestion() { return { ph: 7.40, paco2: 40, hco3: 24, ans: 0 }; },

    maxConcurrent(correct, spawnedCount) {
      return (correct >= 9 || spawnedCount >= 9) ? 2 : 1;
    },

    checkClassify() { return true; },
    checkComp() { return true; },
  };
}
