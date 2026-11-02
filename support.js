(()=>{'use strict';const $=id=>document.getElementById(id);const support=$('support-card');support.innerHTML="<summary><span><strong>사용 가이드 및 지원</strong><small>사용법 · 예제 코드 · 문제 해결</small></span><span class=\"support-chevron\" aria-hidden=\"true\">⌄</span></summary><div class=\"support-content\"><p>손목의 위치와 높이로 모터를 조종해보세요. 손 스켈레톤으로 인식 상태를 확인하세요.</p><div class=\"support-actions\"><button type=\"button\" data-tour=\"all\" class=\"support-primary\">사용법 둘러보기 →</button></div><details class=\"support-section\" id=\"help-examples\"><summary>내 기기에 맞는 예제</summary><div class=\"support-answer device-examples\"><p class=\"device-intro\">사용할 기기에 맞는 예제를 선택해주세요.</p><div class=\"device-prepare\"><span class=\"prepare-label\">공통 준비</span><a href=\"https://makecode.microbit.org/#pub:69459-03613-85562-69852\" target=\"_blank\" rel=\"noopener noreferrer\">블루투스 이름 확인 코드 <span aria-hidden=\"true\">↗</span></a><p>연결할 마이크로비트의 LED에 표시되는 이름(알파벳 소문자 5자리)을 확인한 뒤 아래 예제를 다운로드하세요.</p></div><div class=\"device-example-list\"><article class=\"device-example-card\"><div class=\"device-example-heading\"><h4>마이크로비트 기본</h4><span class=\"device-tag\">모터 연결 필요</span></div><p>사용하는 모터와 연결에 맞춰 제어 블록을 구성하세요.</p><div class=\"device-example-links\"><a id=\"project-example-link\" href=\"https://makecode.microbit.org/#pub:76025-51154-59856-52806\" target=\"_blank\" rel=\"noopener noreferrer\">DC 모터(기타 로봇) 예제 <span aria-hidden=\"true\">↗</span></a><a href=\"https://makecode.microbit.org/#pub:79538-64066-68825-04846\" target=\"_blank\" rel=\"noopener noreferrer\">180도 서보모터 예제 <span aria-hidden=\"true\">↗</span></a></div></article><article class=\"device-example-card\"><div class=\"device-example-heading\"><h4>AI 포니봇</h4><span class=\"device-tag\">포니봇 사용</span></div><p>양손의 위치와 높이로 AI 포니봇을 조종해보세요.</p><div class=\"device-example-links\"><a href=\"https://makecode.microbit.org/#pub:88313-78238-87311-42152\" target=\"_blank\" rel=\"noopener noreferrer\">손의 움직임으로 조종하는 모션 제어 로봇 <span aria-hidden=\"true\">↗</span></a></div></article><article class=\"device-example-card\"><div class=\"device-example-heading\"><h4>비트런(이족보행로봇)</h4><span class=\"device-tag\">비트런 사용</span></div><p>양손의 위치와 높이로 비트런의 좌우 바퀴 방향과 속도를 각각 조절해보세요.</p><div class=\"device-example-links\"><a href=\"https://makecode.microbit.org/#pub:53790-43070-81120-54417\" target=\"_blank\" rel=\"noopener noreferrer\">손의 움직임으로 조종하는 모션 제어 로봇 <span aria-hidden=\"true\">↗</span></a></div></article></div><p class=\"device-note\">MakeCode 프로젝트 설정에서 블루투스 페어링을 필요하지 않음으로 설정하세요. 예제를 다운로드하면 마이크로비트의 기존 코드가 교체됩니다.</p></div></details><details class=\"support-section\"><summary>모터 제어 · 전송 데이터</summary><div class=\"support-answer\"><p>손목 높이가 영상 상단 40%에 있으면 전진(F), 중앙 20%이면 속도 0, 하단 40%이면 후진(B)입니다. 전진 영역 중간(영상 위에서 20%), 후진 영역 중간(80%)에서 최대 속도 180에 도달하며 그 바깥에서도 180을 유지합니다.</p><p><code>LF180RB150</code>: 왼쪽 전진 180, 오른쪽 후진 150. 10자리 문자열 뒤에 줄바꿈(<code>\\r\\n</code>)을 붙입니다. 양쪽 정지는 <code>LF000RF000</code>입니다.</p><p>모델과 카메라가 준비되면 인식이 자동 시작됩니다. 블루투스 연결 후 계산된 출력이 반복 전송됩니다.</p></div></details><details class=\"support-section\" id=\"help-troubleshooting\"><summary>문제 해결</summary><div class=\"support-answer support-faq\"><details id=\"help-connection\"><summary>연결이 안 돼요</summary><p>전원·UART 예제·장치 이름을 확인하고 다른 앱의 연결을 해제하세요. PC는 Chrome·Edge, 안드로이드 태블릿은 Chrome, 아이패드는 Bluefy를 사용하세요.</p></details><details ><summary>카메라나 모델이 준비되지 않아요</summary><p>카메라 권한과 인터넷 연결을 확인하세요. 다른 앱에서 카메라를 사용 중이면 종료하고 페이지를 다시 여세요. 넓은 화면의 PC·태블릿을 권장합니다.</p></details><details ><summary>손과 모터의 좌우가 다르게 느껴져요</summary><p>거울처럼 보이는 영상에서 손목이 화면 왼쪽에 있으면 LEFT, 오른쪽에 있으면 RIGHT를 제어합니다. 실제 왼손·오른손 구분이 아닙니다. 손을 중앙선 너머로 옮기면 제어하는 모터도 바뀝니다. 양손을 각각 다른 쪽에 두세요.</p></details><details ><summary>손을 치우면 어떻게 되나요?</summary><p>인식 루프가 실행 중이면 화면 좌우 중 한쪽이라도 손이 없을 때 양쪽 모터를 즉시 속도 0으로 처리합니다. 좌우에 손이 하나씩 0.3초간 인식되면 주행을 재개합니다. 약 0.3초 동안 인식되지 않으면 해당 화면에 빨간 배경과 손을 인식시키세요 안내가 나타납니다. 한쪽이라도 손이 없으면 LF000RF000을 전송합니다. 연결이 끊기면 이 패킷을 전달할 수 없으므로 연결 해제 전에 출력이 0인지 확인하세요.</p></details><details ><summary>출력과 로봇 동작이 달라요</summary><p>LEFT·RIGHT는 계산 결과이고 전송 패킷은 전송을 시도한 값입니다. 기기의 수신 확인은 아닙니다. 예제의 모터 연결·방향과 수신 문자열 처리를 확인하세요.</p></details><details ><summary>가이드를 열면 조종이 멈추나요?</summary><p>가이드는 화면만 안내합니다. 손 인식과 연결된 기기로의 전송은 계속됩니다. 연결 전에 가이드를 둘러보는 것이 편리합니다.</p></details></div></details><details class=\"support-section\" id=\"help-updates\"><summary>업데이트 노트</summary><div class=\"support-answer\"><p class=\"support-release\">2026.11.02 · 기기별 예제 카드 구성 통일</p><ul><li>공통 준비와 마이크로비트 기본·AI 포니봇·비트런(이족보행로봇) 카드를 구분</li><li>블루투스 이름 확인·서보모터·DC 모터(기타 로봇) 예제 링크 업데이트</li><li>AI 포니봇 모션 제어 예제 링크 업데이트</li><li>비트런 양손 모션 제어 MakeCode 예제 추가</li><li>다른 웹앱과 카드 디자인 및 모바일 배치 통일</li></ul><ul><li>노란 가장자리 안내 제거, 전진·후진 영역 중간에서 최대 속도 180 적용</li><li>한쪽 손 미인식 시 양쪽 정지, 양손 인식 0.3초 유지 후 재개</li><li>손 스켈레톤·좌우별 미인식 표시 추가</li><li>기기 준비부터 손목 위치·속도 조절·출력 확인까지 화면 안내 추가</li><li>DC 모터·서보모터·포니봇 예제 연결</li><li>화면 좌우 기준과 전송 패킷 안내</li></ul></div></details><p><a href=\"https://boundaryx.io/ai/?bmode=view&idx=169414932&t=board\" target=\"_blank\" rel=\"noopener noreferrer\">소개 · 프로젝트 아이디어 ↗</a></p></div>";const allSteps=[["#project-example-link","모터 예제를 준비하세요","장치 이름을 확인하고 사용할 모터에 맞는 예제를 다운로드하세요."],["#model-status","모델과 카메라를 준비하세요","모델 준비 완료를 기다리고 카메라 권한을 허용하세요. 인식은 자동 시작됩니다."],["#bt-status","기기를 연결하세요","기기 찾기를 눌러 확인한 마이크로비트를 선택하세요. 연결 후 모터 출력이 반복 전송됩니다."],[".center-line","화면 좌우로 모터를 구분합니다","손목이 화면 왼쪽이면 LEFT, 오른쪽이면 RIGHT입니다. 양손을 각각 다른 쪽에 두세요."],[".forward-zone","손을 올리면 전진합니다","손목이 영상 상단 40%에 있으면 전진합니다. 영상 위에서 20% 지점에서 최대 180에 도달하며 더 올려도 180을 유지합니다."],[".stop-zone","중앙 높이에서 정지합니다","중앙 20%는 속도 0입니다. 양손의 손목을 이 높이에 두면 양쪽 모터가 정지합니다."],[".backward-zone","손을 내리면 후진합니다","손목이 영상 하단 40%에 있으면 후진합니다. 영상 위에서 80% 지점에서 최대 180에 도달하며 더 내려도 180을 유지합니다."],[".monitor-row","계산된 출력을 확인하세요","LEFT·RIGHT의 F는 전진, B는 후진입니다. 한쪽이라도 손이 인식되지 않으면 양쪽 속도가 0이 됩니다."],["#packet-log","정지 출력을 확인하고 마치세요","양쪽이 LF000RF000인지 확인한 뒤 연결을 해제하세요. 이 표시는 기기의 수신 확인은 아니므로 실제 동작도 확인하세요."]];const chapters=[{label:'기기 준비',start:0},{label:'모션 제어',start:3},{label:'출력 확인',start:7}];
const dialog = document.createElement('dialog');
  dialog.id = 'guide-dialog';
  dialog.setAttribute('aria-labelledby', 'guide-title');
  dialog.setAttribute('aria-describedby', 'guide-description');
  dialog.innerHTML = `<div id="guide-spotlight" aria-hidden="true"></div><section id="guide-panel"><div class="guide-topline"><span id="guide-progress"></span><button id="guide-close" type="button" aria-label="화면 안내 종료">닫기 ×</button></div><nav class="guide-chapters" aria-label="안내 구간">${chapters.map((chapter, i) => `<button type="button" data-chapter="${i}" aria-pressed="false">${chapter.label}</button>`).join('')}</nav><div aria-live="polite" aria-atomic="true"><h2 id="guide-title"></h2><p id="guide-description"></p></div><p class="guide-caption">안내 중에도 연결된 기기로 전송이 계속됩니다.</p><button id="guide-skip-device" type="button" hidden>기기 연결 건너뛰기 →</button><div class="guide-navigation"><button id="guide-prev" type="button">이전</button><button id="guide-next" type="button">다음</button></div></section>`;
  document.body.appendChild(dialog);
  let steps = [], index = 0, target = null, opener = null, originalScroll = 0, pendingFrame = 0;

  let examplesWereOpen = false;

  function openHelp(section) {
    support.open = true;
    if (section) {
      $('help-troubleshooting').open = true;
      $(section).open = true;
    }
    const heading = (section ? $(section) : support).querySelector('summary');
    heading.scrollIntoView({block: 'center', behavior: 'instant'});
    heading.focus({preventScroll: true});
  }
  document.querySelectorAll('[data-help]').forEach(button => button.addEventListener('click', () => openHelp(button.dataset.help || null)));

  function renderStep() {
    const [selector, title, description] = steps[index];
    if (selector === '#project-example-link') $('help-examples').open = true;
    target = document.querySelector(selector);
    const chapterIndex = index < chapters[1].start ? 0 : index < chapters[2].start ? 1 : 2;
    dialog.querySelectorAll('[data-chapter]').forEach((button, i) => button.setAttribute('aria-pressed', String(i === chapterIndex)));
    $('guide-skip-device').hidden = true;
    $('guide-progress').textContent = `${chapters[chapterIndex].label}${''} · ${index + 1} / ${steps.length}`;
    $('guide-title').textContent = title;
    $('guide-description').textContent = description;
    $('guide-prev').disabled = index === 0;
    $('guide-next').textContent = index === steps.length - 1 ? '안내 마치기' : '다음';
    if (target) target.scrollIntoView({block: 'center', behavior: 'instant'});
    positionGuide(true);
  }

  function positionGuide(reveal = false) {
    if (!dialog.open) return;
    const panel = $('guide-panel'), spot = $('guide-spotlight');
    const width = window.innerWidth, height = window.innerHeight, gap = 16;
    panel.style.width = Math.min(360, width - 24) + 'px';
    const ph = panel.getBoundingClientRect().height, pw = panel.getBoundingClientRect().width;
    const headerBottom = document.querySelector('header').getBoundingClientRect().bottom;
    let r = target ? target.getBoundingClientRect() : null;
    // Narrow screens reserve the lower area for the explanation. A temporary bottom
    // spacer allows the last control to scroll above it without altering saved data.
    const narrow = width < 700;
    if (reveal && r && narrow) {
      const top = Math.max(12, headerBottom + 16);
      window.scrollBy({top: r.top - top, behavior: 'instant'});
      r = target.getBoundingClientRect();
    }
    let x = width - pw - 12, y = height - ph - 12;
    if (r && !narrow) {
      const candidates = [
        [r.left - pw - gap, Math.max(12, Math.min(r.top, height - ph - 12))],
        [r.right + gap, Math.max(12, Math.min(r.top, height - ph - 12))],
        [Math.max(12, Math.min(r.left, width - pw - 12)), r.bottom + gap],
        [Math.max(12, Math.min(r.left, width - pw - 12)), r.top - ph - gap]
      ];
      const fit = candidates.find(([cx, cy]) => cx >= 12 && cy >= 12 && cx + pw <= width - 12 && cy + ph <= height - 12);
      if (fit) [x,y] = fit;
      // Keep the target's full width even when the explanation must overlay it.
    }
    panel.style.left = x + 'px'; panel.style.top = Math.max(12, y) + 'px';
    if (r) {
      const top = Math.max(4, r.top - 5), left = Math.max(4, r.left - 5);
      const bottom = Math.min(height - 4, narrow ? y - 12 : height - 4, r.bottom + 5);
      spot.hidden = bottom <= top || r.right <= 0 || r.left >= width;
      Object.assign(spot.style, {left: left + 'px', top: top + 'px', width: Math.max(0, Math.min(width - 4, r.right + 5) - left) + 'px', height: Math.max(0, bottom - top) + 'px'});
    } else spot.hidden = true;
  }
  function startTour(kind, button) {
    if (kind !== 'all') return;
    opener = button; originalScroll = window.scrollY;
    steps = allSteps; index = 0;
    examplesWereOpen = $('help-examples').open;
    document.body.classList.add('guide-active');
    dialog.showModal();
    renderStep();
    $('guide-next').focus({preventScroll:true});
  }
  support.querySelectorAll('[data-tour]').forEach(button => button.addEventListener('click', () => startTour(button.dataset.tour, button)));
  $('guide-prev').addEventListener('click', () => { if (index > 0) { index--; renderStep(); } });
  $('guide-next').addEventListener('click', () => { if (index === steps.length - 1) dialog.close(); else { index++; renderStep(); } });
  dialog.querySelectorAll('[data-chapter]').forEach(button => button.addEventListener('click', () => { index = chapters[Number(button.dataset.chapter)].start; renderStep(); }));
  $('guide-skip-device').addEventListener('click', () => { index = chapters[2].start; renderStep(); $('guide-next').focus({preventScroll:true}); });
  $('guide-close').addEventListener('click', () => dialog.close());
  dialog.addEventListener('close', () => {
    document.body.classList.remove('guide-active');
    $('help-examples').open = examplesWereOpen;
    window.scrollTo({top:originalScroll, behavior:'instant'});
    if (opener) opener.focus({preventScroll:true});
  });
  const reposition = () => {
    if (!dialog.open || pendingFrame) return;
    pendingFrame = requestAnimationFrame(() => { pendingFrame = 0; positionGuide(); });
  };
  window.addEventListener('resize', () => { if (dialog.open) renderStep(); });
  window.addEventListener('scroll', reposition, {passive:true});
  if (location.hash === '#support-card') requestAnimationFrame(() => openHelp());
})();





