import {
  HandLandmarker,
  FilesetResolver
} from "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.0";
import { HAND_CONNECTIONS, createHandFeedback } from './hand-feedback.js';
import { createDriveGate } from './drive-gate.js';
const checkDrive = createDriveGate();
let driveState = {ready:false, text:'양손을 인식시키세요 · 정지 중'};

const getHandFeedback = createHandFeedback();
const feedbackNodes = {};
const overlay = document.querySelector('.overlay-guide-container');
const driveNotice = document.createElement('div');
driveNotice.className = 'drive-notice';
driveNotice.setAttribute('role', 'status');
overlay.appendChild(driveNotice);
for (const side of ['left', 'right']) {
  const node = document.createElement('div');
  node.className = 'hand-feedback hand-feedback-' + side;
  node.dataset.state = 'pending';
  const message = document.createElement('span');
  message.setAttribute('role', 'status');
  message.setAttribute('aria-live', 'polite');
  node.appendChild(message);
  overlay.appendChild(node);
  feedbackNodes[side] = node;
}

// Align guide zones and feedback with the actual object-fit:contain video area.
function alignVideoOverlay() {
  if (!webcam || !webcam.videoWidth) return;
  const wrapper = document.querySelector('.canvas-wrapper');
  const scale = Math.min(wrapper.clientWidth / webcam.videoWidth, wrapper.clientHeight / webcam.videoHeight);
  const width = webcam.videoWidth * scale, height = webcam.videoHeight * scale;
  Object.assign(overlay.style, {width:width+'px',height:height+'px',left:(wrapper.clientWidth-width)/2+'px',top:(wrapper.clientHeight-height)/2+'px'});
}
new ResizeObserver(alignVideoOverlay).observe(document.querySelector('.canvas-wrapper'));

/** * 설정 변수 */
const DEADZONE_MIN = 0.40; // 0~40% 전진
const DEADZONE_MAX = 0.60; // 60~100% 후진
const BLUETOOTH_UUID_SERVICE = "6e400001-b5a3-f393-e0a9-e50e24dcca9e";
// RX UUID (Write): 끝자리 3
const BLUETOOTH_UUID_RX = "6e400003-b5a3-f393-e0a9-e50e24dcca9e"; 

let handLandmarker = undefined;
let webcam = null;
let canvas, ctx;
let lastVideoTime = -1;
let results = undefined;

// 블루투스 변수
let bluetoothDevice, rxCharacteristic;
let isConnected = false;
let isSendingData = false; // 전송 락

// DOM 요소
const btnConnect = document.getElementById("connect-btn");
const btnDisconnect = document.getElementById("disconnect-btn");
const statusBt = document.getElementById("bt-status");
const logLeft = document.getElementById("log-left");
const logRight = document.getElementById("log-right");
const logPacket = document.getElementById("packet-log");
const modelStatus = document.getElementById("model-status");

// 1. 모델 초기화
async function createHandLandmarker() {
  const vision = await FilesetResolver.forVisionTasks(
    "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.0/wasm"
  );
  
  handLandmarker = await HandLandmarker.createFromOptions(vision, {
    baseOptions: {
      modelAssetPath: `https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task`,
      delegate: "GPU"
    },
    runningMode: "VIDEO",
    numHands: 2
  });
  
  modelStatus.innerText = "AI 모델 준비 완료";
  modelStatus.classList.add("ready");
  startWebcam();
}

// 2. 웹캠 시작
function startWebcam() {
  webcam = document.getElementById("webcam");
  canvas = document.getElementById("output_canvas");
  ctx = canvas.getContext("2d");

  // 가로 모드 최적화 해상도
  const constraints = { video: { width: 1280, height: 720 } };

  navigator.mediaDevices.getUserMedia(constraints).then((stream) => {
    webcam.srcObject = stream;
    webcam.addEventListener("loadeddata", alignVideoOverlay);
    webcam.addEventListener("loadeddata", predictWebcam);
  });
}

// 3. 메인 루프
async function predictWebcam() {
  if (canvas.width !== webcam.videoWidth || canvas.height !== webcam.videoHeight) {
    canvas.width = webcam.videoWidth;
    canvas.height = webcam.videoHeight;
  }

  let startTimeMs = performance.now();
  if (lastVideoTime !== webcam.currentTime) {
    lastVideoTime = webcam.currentTime;
    results = handLandmarker.detectForVideo(webcam, startTimeMs);
    driveState = checkDrive(results?.landmarks || [], startTimeMs);
  }

  // 화면 그리기 (거울 모드)
  ctx.save();
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.translate(canvas.width, 0);
  ctx.scale(-1, 1);
  ctx.drawImage(webcam, 0, 0, canvas.width, canvas.height);
  ctx.restore();

  // 손 인식 및 모터 값 계산
  let leftMotor = { dir: 'F', speed: 0 };
  let rightMotor = { dir: 'F', speed: 0 };

  const hands = results?.landmarks || [];
  for (const [side, feedback] of Object.entries(getHandFeedback(hands, startTimeMs))) {
    const node = feedbackNodes[side];
    node.dataset.state = feedback.state === 'edge' ? 'tracked' : feedback.state;
    const text = feedback.state === 'missing' && feedback.text ? `${side === 'left' ? '왼쪽' : '오른쪽'} · ${feedback.text}` : '';
    if (node.firstChild.textContent !== text) node.firstChild.textContent = text;
  }
  if (hands.length) {
    for (const landmarks of hands) {
      const wrist = landmarks[0]; 
      const visualX = 1 - wrist.x; // 좌우 반전 좌표
      const visualY = wrist.y;

      const motorData = driveState.ready ? calculateMotorValue(visualY) : {dir:'F', speed:0};
      drawHandSkeleton(landmarks);

      // 화면 왼쪽(0~0.5)은 Left Motor
      if (visualX < 0.5) {
        leftMotor = motorData;
        drawHandIndicator(visualX, visualY, motorData, "L");
      } else {
        rightMotor = motorData;
        drawHandIndicator(visualX, visualY, motorData, "R");
      }
    }
  }

  if (!driveState.ready) {
    leftMotor = {dir:'F', speed:0};
    rightMotor = {dir:'F', speed:0};
  }
  if (driveNotice.textContent !== driveState.text) driveNotice.textContent = driveState.text;
  driveNotice.hidden = driveState.ready;
  updateUI(leftMotor, rightMotor);
  
  // 패킷 생성 (LFxxxRFxxx)
  const lSpeedStr = String(leftMotor.speed).padStart(3, '0');
  const rSpeedStr = String(rightMotor.speed).padStart(3, '0');
  const packet = `L${leftMotor.dir}${lSpeedStr}R${rightMotor.dir}${rSpeedStr}`;
  
  sendBluetoothData(packet);

  window.requestAnimationFrame(predictWebcam);
}

// 모터 값 계산 (Deadzone 적용)
function calculateMotorValue(y) {
  let speed = 0;
  let dir = 'F';

  if (y < DEADZONE_MIN) {
    // 전진 (0 ~ 0.4)
    let ratio = (DEADZONE_MIN - y) / 0.20;
    speed = Math.min(180, Math.round(ratio * 180));
    dir = 'F';
  } else if (y > DEADZONE_MAX) {
    // 후진 (0.6 ~ 1.0)
    let ratio = (y - DEADZONE_MAX) / 0.20;
    speed = Math.min(180, Math.round(ratio * 180));
    dir = 'B';
  } else {
    // 정지
    speed = 0;
  }
  return { dir, speed };
}

// 손 위치 시각화 (동그라미)
function drawHandSkeleton(landmarks) {
  ctx.save();
  ctx.shadowBlur = 0;
  ctx.strokeStyle = 'rgba(255,255,255,0.85)';
  ctx.lineWidth = 2;
  ctx.beginPath();
  for (const [a,b] of HAND_CONNECTIONS) {
    if (!landmarks[a] || !landmarks[b]) continue;
    ctx.moveTo((1-landmarks[a].x)*canvas.width,landmarks[a].y*canvas.height);
    ctx.lineTo((1-landmarks[b].x)*canvas.width,landmarks[b].y*canvas.height);
  }
  ctx.stroke();
  ctx.fillStyle = '#8be9ff';
  for (const p of landmarks.slice(1)) {
    ctx.beginPath();ctx.arc((1-p.x)*canvas.width,p.y*canvas.height,4,0,Math.PI*2);ctx.fill();
  }
  ctx.restore();
}

function drawHandIndicator(x, y, data, side) {
  ctx.save();
  const px = x * canvas.width;
  const py = y * canvas.height;
  
  ctx.beginPath();
  ctx.arc(px, py, 20, 0, 2 * Math.PI); 
  ctx.fillStyle = data.speed > 0 ? (data.dir === 'F' ? "#00E676" : "#EA4335") : "#888";
  ctx.fill();
  ctx.lineWidth = 4;
  ctx.strokeStyle = "#fff";
  ctx.stroke();

  // 텍스트 라벨
  ctx.fillStyle = "#fff";
  ctx.font = "bold 24px Pretendard";
  ctx.shadowColor = "rgba(0,0,0,0.8)";
  ctx.shadowBlur = 4;
  ctx.fillText(`${side}`, px + 25, py + 8);
  ctx.restore();
}

function updateUI(l, r) {
  logLeft.innerText = l.speed === 0 ? "Stop" : `${l.dir} ${l.speed}`;
  logRight.innerText = r.speed === 0 ? "Stop" : `${r.dir} ${r.speed}`;
  
  logLeft.style.color = l.speed === 0 ? "#aaa" : (l.dir === 'F' ? "#00aa00" : "#d00");
  logRight.style.color = r.speed === 0 ? "#aaa" : (r.dir === 'F' ? "#00aa00" : "#d00");
}

/* --- 블루투스 로직 --- */
btnConnect.addEventListener('click', async () => {
  try {
    bluetoothDevice = await navigator.bluetooth.requestDevice({
      filters: [{ namePrefix: "BBC micro:bit" }],
      optionalServices: [BLUETOOTH_UUID_SERVICE]
    });
    
    bluetoothDevice.addEventListener('gattserverdisconnected', onDisconnected);
    const server = await bluetoothDevice.gatt.connect();
    const service = await server.getPrimaryService(BLUETOOTH_UUID_SERVICE);
    // RX (Write) 주소 사용
    rxCharacteristic = await service.getCharacteristic(BLUETOOTH_UUID_RX);

    isConnected = true;
    statusBt.innerText = "연결됨: " + bluetoothDevice.name;
    statusBt.classList.add("status-connected");
    btnConnect.classList.add("hidden");
    btnDisconnect.classList.remove("hidden");
    
  } catch (error) {
    console.log(error);
    alert("연결 실패: " + error);
  }
});

function onDisconnected() {
  isConnected = false;
  statusBt.innerText = "연결 해제됨";
  statusBt.classList.remove("status-connected");
  btnConnect.classList.remove("hidden");
  btnDisconnect.classList.add("hidden");
  isSendingData = false;
}

btnDisconnect.addEventListener('click', () => {
    if(bluetoothDevice && bluetoothDevice.gatt.connected) {
        bluetoothDevice.gatt.disconnect();
    }
});

async function sendBluetoothData(str) {
  if (!isConnected || !rxCharacteristic) { logPacket.innerText = '전송할 데이터: ' + str; return; }
  if (isSendingData) return;
  const target = rxCharacteristic;

  try {
    isSendingData = true; 
    const encoder = new TextEncoder();
    // ★ 줄바꿈 문자 \r\n 추가
    await target.writeValue(encoder.encode(str + "\r\n"));
    if (isConnected && target === rxCharacteristic) logPacket.innerText = '전송됨: ' + str;
  } catch (e) {
    console.error("TX Error", e);
    if (isConnected && target === rxCharacteristic) logPacket.innerText = '전송 실패: ' + str;
  } finally {
    isSendingData = false; 
  }
}

// 앱 시작
createHandLandmarker();


