// Visual feedback only. Motor values are calculated independently on every frame.
export const HAND_CONNECTIONS = [
  [0,1],[1,2],[2,3],[3,4],[0,5],[5,6],[6,7],[7,8],
  [5,9],[9,10],[10,11],[11,12],[9,13],[13,14],[14,15],[15,16],
  [13,17],[0,17],[17,18],[18,19],[19,20]
];

export function edgeHint(landmarks) {
  const edges = [
    [Math.min(...landmarks.map(p => p.y)), '손을 조금 내려주세요'],
    [1-Math.max(...landmarks.map(p => p.y)), '손을 조금 올려주세요'],
    [Math.min(...landmarks.map(p => 1-p.x)), '손을 조금 오른쪽으로 옮겨주세요'],
    [1-Math.max(...landmarks.map(p => 1-p.x)), '손을 조금 왼쪽으로 옮겨주세요']
  ];
  edges.sort((a,b)=>a[0]-b[0]);
  return edges[0][0] < 0.06 ? edges[0][1] : '';
}

export function createHandFeedback(delayMs = 300) {
  const missingSince = {left:null,right:null};
  return (hands, now) => {
    const sides = {left:[],right:[]};
    for (const hand of hands) {
      if (hand.length) sides[1-hand[0].x < 0.5 ? 'left' : 'right'].push(hand);
    }
    return Object.fromEntries(Object.entries(sides).map(([side,group]) => {
      if (group.length) {
        missingSince[side]=null;
        const hint=group.map(edgeHint).find(Boolean)||'';
        return [side,{state:hint?'edge':'tracked',text:hint}];
      }
      if(missingSince[side]===null) missingSince[side]=now;
      const missing=now-missingSince[side]>=delayMs;
      return [side,{state:missing?'missing':'pending',text:missing?'손을 인식시키세요':''}];
    }));
  };
}
