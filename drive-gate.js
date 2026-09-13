// Require a hand in each screen half continuously before allowing motion.
export function createDriveGate(resumeDelayMs = 300) {
  let bothSince = null;
  return (hands, now) => {
    const left = hands.some(h => h[0] && 1 - h[0].x < 0.5);
    const right = hands.some(h => h[0] && 1 - h[0].x >= 0.5);
    if (!left || !right) {
      bothSince = null;
      return {ready:false, text:'양손을 인식시키세요 · 정지 중'};
    }
    if (bothSince === null) bothSince = now;
    const ready = now - bothSince >= resumeDelayMs;
    return {ready, text:ready ? '' : '양손 인식 확인 중 · 정지 중'};
  };
}
