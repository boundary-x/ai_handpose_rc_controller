import {
  HandLandmarker,
  FilesetResolver
} from "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.0";

/** * 설정 변수 
 */
const DEADZONE_MIN = 0.40; // 중앙 데드존 상한 (0~1)
const DEADZONE_MAX = 0.60; // 중앙 데드존 하한 (0~1)
const BLUETOOTH_UUID_SERVICE = "6e400001-b5a3-f393-e0a9-e50e24dcca9e";
const BLUETOOTH_UUID_RX = "6e400002-b5a3-f393-e0a9-e50e24dcca9e";

let handLandmarker = undefined;
let webcam = null;
let canvas, ctx;
let lastVideoTime = -1;
let results = undefined;

// 블루투스 변수
let bluetoothDevice, rxCharacteristic;
let isConnected = false;
let lastSendTime = 0;
const SEND_INTERVAL = 80; // 80ms마다 전송 (과부하 방지)

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
    numHands: 2 // 양손 인식
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

  const constraints = { video: { width: 1280, height: 720 } };

  navigator.mediaDevices.getUserMedia(constraints).then((stream) => {
    webcam.srcObject = stream;
    webcam.addEventListener("loadeddata", predictWebcam);
  });
}

// 3. 메인 루프 (인식 및 그리기)
async function predictWebcam() {
  // 캔버스 크기를 비디오 비율에 맞춤
  if (canvas.width !== webcam.videoWidth) {
    canvas.width = webcam.videoWidth;
    canvas.height = webcam.videoHeight;
  }

  let startTimeMs = performance.now();
  if (lastVideoTime !== webcam.currentTime) {
    lastVideoTime = webcam.currentTime;
    results = handLandmarker.detectForVideo(webcam, startTimeMs);
  }

  // A. 화면 초기화 및 비디오 그리기 (거울 모드)
  ctx.save();
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.translate(canvas.width, 0);
  ctx.scale(-1, 1);
  ctx.drawImage(webcam, 0, 0, canvas.width, canvas.height);
  ctx.restore();

  // B. 가이드라인 그리기
  drawGuides();

  // C. 손 인식 및 데이터 계산
  let leftMotor = { dir: 'F', speed: 0 };
  let rightMotor = { dir: 'F', speed: 0 };
  let leftHandFound = false;
  let rightHandFound = false;

  if (results.landmarks) {
    for (const landmarks of results.landmarks) {
      // 손목 좌표 (0~1)
      const wrist = landmarks[0]; 
      // 거울모드이므로 x좌표 반전 생각해야 함.
      // 화면상 보이는 위치: x가 1에 가까우면(원본) -> 거울모드에선 왼쪽
      // x가 0에 가까우면(원본) -> 거울모드에선 오른쪽
      // 헷갈리므로 '보이는 좌표'로 변환: visualX = 1 - wrist.x
      const visualX = 1 - wrist.x;
      const visualY = wrist.y;

      // 모터 값 계산
      const motorData = calculateMotorValue(visualY);

      // 화면 좌측(0~0.5)은 왼쪽 모터, 우측(0.5~1.0)은 오른쪽 모터
      if (visualX < 0.5) {
        leftMotor = motorData;
        leftHandFound = true;
        drawHandIndicator(visualX, visualY, motorData, "L");
      } else {
        rightMotor = motorData;
        rightHandFound = true;
        drawHandIndicator(visualX, visualY, motorData, "R");
      }
    }
  }

  // D. UI 업데이트 및 데이터 전송
  updateUI(leftMotor, rightMotor);
  
  // 패킷 생성: LF255RF255\n
  // 속도는 3자리 패딩 (0 -> 000, 50 -> 050)
  const lSpeedStr = String(leftMotor.speed).padStart(3, '0');
  const rSpeedStr = String(rightMotor.speed).padStart(3, '0');
  const packet = `L${leftMotor.dir}${lSpeedStr}R${rightMotor.dir}${rSpeedStr}`;
  
  sendBluetoothData(packet);

  window.requestAnimationFrame(predictWebcam);
}

// 모터 값 계산 로직 (Y좌표 -> 속도/방향)
function calculateMotorValue(y) {
  let speed = 0;
  let dir = 'F';

  if (y < DEADZONE_MIN) {
    // 전진 구역 (0 ~ 0.4) -> 위로 갈수록 빠름
    // 0.4일때 0, 0.0일때 255
    let ratio = (DEADZONE_MIN - y) / DEADZONE_MIN; // 0~1
    speed = Math.min(255, Math.floor(ratio * 255));
    dir = 'F';
  } else if (y > DEADZONE_MAX) {
    // 후진 구역 (0.6 ~ 1.0) -> 아래로 갈수록 빠름
    // 0.6일때 0, 1.0일때 255
    let ratio = (y - DEADZONE_MAX) / (1.0 - DEADZONE_MAX);
    speed = Math.min(255, Math.floor(ratio * 255));
    dir = 'B';
  } else {
    // 데드존
    speed = 0;
  }
  return { dir, speed };
}

// 화면 가이드라인 그리기
function drawGuides() {
  const w = canvas.width;
  const h = canvas.height;

  ctx.strokeStyle = "rgba(255, 255, 255, 0.2)";
  ctx.lineWidth = 2;
  ctx.setLineDash([10, 10]);

  // 중앙 세로선 (좌우 구분)
  ctx.beginPath();
  ctx.moveTo(w / 2, 0);
  ctx.lineTo(w / 2, h);
  ctx.stroke();

  // 데드존 영역 표시 (가로 띠)
  ctx.fillStyle = "rgba(255, 255, 255, 0.05)";
  ctx.fillRect(0, h * DEADZONE_MIN, w, h * (DEADZONE_MAX - DEADZONE_MIN));
  
  ctx.setLineDash([]);
}

// 손 위치 시각화
function drawHandIndicator(x, y, data, side) {
  const px = x * canvas.width;
  const py = y * canvas.height;
  
  // 원 그리기
  ctx.beginPath();
  ctx.arc(px, py, 15, 0, 2 * Math.PI);
  ctx.fillStyle = data.speed > 0 ? (data.dir === 'F' ? "#00E676" : "#EA4335") : "#888";
  ctx.fill();
  ctx.lineWidth = 3;
  ctx.strokeStyle = "#fff";
  ctx.stroke();

  // 텍스트
  ctx.fillStyle = "#fff";
  ctx.font = "bold 20px Pretendard";
  ctx.fillText(`${side}: ${data.dir}${data.speed}`, px + 20, py);
}

function updateUI(l, r) {
  logLeft.innerText = l.speed === 0 ? "Stop" : `${l.dir} ${l.speed}`;
  logRight.innerText = r.speed === 0 ? "Stop" : `${r.dir} ${r.speed}`;
  
  // 색상 변경
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
}

btnDisconnect.addEventListener('click', () => {
    if(bluetoothDevice && bluetoothDevice.gatt.connected) {
        bluetoothDevice.gatt.disconnect();
    }
});

async function sendBluetoothData(str) {
  if (!isConnected || !rxCharacteristic) return;
  
  // UI 로그
  logPacket.innerText = str;

  // 전송 주기 제한 (Throttling)
  const now = Date.now();
  if (now - lastSendTime < SEND_INTERVAL) return;
  lastSendTime = now;

  try {
    const encoder = new TextEncoder();
    await rxCharacteristic.writeValue(encoder.encode(str + "\n"));
  } catch (e) {
    console.error("TX Error", e);
  }
}

// 앱 시작
createHandLandmarker();
