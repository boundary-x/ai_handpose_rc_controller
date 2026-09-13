# 🏎️ Boundary X - AI Hand Pose RC Controller

**Boundary X - AI Hand Pose RC Controller** is a web-based interface that controls a 2-motor RC car (Tank Drive) using hand gestures captured via webcam.

Powered by **Google MediaPipe Hand Landmarker**, it tracks both hands independently to control the left and right motors of a robot. The control data is transmitted to a **BBC Micro:bit** via **Web Bluetooth (BLE)**.

![Project Status](https://img.shields.io/badge/Status-Active-success)
![Platform](https://img.shields.io/badge/Platform-Web-blue)
![Tech](https://img.shields.io/badge/Stack-MediaPipe%20%7C%20Web%20Bluetooth-00E676)

## ✨ Key Features

### 1. 👐 Dual Hand "Tank Drive" Control
- **Independent Tracking:** The screen is split vertically. The **Left Hand** controls the Left Motor, and the **Right Hand** controls the Right Motor.
- **Intuitive Visuals:** Hand positions are visualized as circles on the canvas (Green for Forward, Red for Backward).

### 2. 🚦 Zone-Based Speed Control
The Y-axis of the camera feed determines the direction and speed:
- **Forward Zone (Top 0% ~ 40%):** Motor moves **Forward**. The higher the hand, the faster the speed (0 ~ 255).
- **Deadzone (Middle 40% ~ 60%):** Motor **Stops**. Prevents accidental movements.
- **Backward Zone (Bottom 60% ~ 100%):** Motor moves **Backward**. The lower the hand, the faster the speed (0 ~ 255).

### 3. 🔗 Wireless Connectivity (BLE)
- **Direct Connection:** Connects directly to **BBC Micro:bit** using the **Nordic UART Service**.
- **Responsive UI:** A responsive sidebar layout that works on PC and Tablets, showing real-time motor values and packet logs.

---

## 📡 Communication Protocol

The app transmits a formatted string packet via Bluetooth UART. Each packet controls both motors simultaneously. The string ends with `\r\n` (CR+LF).

**Data Format:**
```text
L{Dir}{Speed}R{Dir}{Speed}\r\n
```

**Parameters:**
- **L / R:** Left Motor / Right Motor indicator.
- **Dir:** Direction (`F` for Forward, `B` for Backward).
- **Speed:** 3-digit padded integer (000 ~ 255).

**Examples:**
- **Full Speed Forward (Both hands at top):** `LF255RF255`
- **Pivot Turn Left (Left hand down, Right hand up):** `LB255RF255`
- **Stop (Both hands in middle):** `LF000RF000`

---

## 📡Tech Stack
- **Frontend:** HTML5, CSS3
- **AI Engine:** MediaPipe Tasks Vision (Hand Landmarker)
- ** Connectivity:** Web Bluetooth API

--- 

## 📝 License
- Copyright © 2024 Boundary X Co. All rights reserved.
- All rights to the source code and design of this project belong to BoundaryX.
- Web: boundaryx.io
- Contact: https://boundaryx.io/contact

## Guide and Support

Open the header help button or expand **사용 가이드 및 지원** in the sidebar for a nine-step walkthrough, four micro:bit example links, packet reference and troubleshooting.

Motor assignment uses the wrist position on the mirrored screen, not anatomical handedness. The upper 40% moves forward, the middle 20% outputs zero and the lower 40% moves backward. Packets contain 10 characters followed by CRLF, for example `LF255RB150`. If either screen half lacks a detected hand, both motor outputs become zero. Motion resumes after a hand is present in each half continuously for 300 ms.

The guide does not pause inference or transmission. Run `node tests/support.cjs` with Playwright and Microsoft Edge for layout checks; the test mocks hand detection and uses a simulated camera. Physical Bluetooth and motor behavior require device testing.

### Hand visibility feedback

The existing landmarks are drawn as thin connections and small joints; the wrist remains the motor control point. A yellow message directs a detected hand away from the camera edges. After 300 ms without a hand on a screen side, that half receives a translucent red overlay and a hand-placement prompt. Only the message is delayed: both motor outputs become zero immediately when either side has no detected hand. Motion resumes after both sides remain detected for 300 ms. Guidance overlays follow the actual letterboxed camera image. No extra model inference is introduced.
