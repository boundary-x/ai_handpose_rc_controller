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
