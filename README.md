# StellarX (Autonomous Space Constellation OS)

> **StellarX** is a next-generation command interface and autonomous orchestration system designed to manage large constellations of satellites. It simulates real-time orbital physics and dynamically resolves critical space hazards using Google Gemini AI.

![StellarX Preview](https://github.com/RANISH09LL/teslaforspace/assets/placeholder) <!-- Replace with a screenshot if you have one -->

## 🚀 Features & Highlights (Hackathon Showcase)

- **Live Orbital Physics Engine:** A custom Node.js backend running a 10Hz physics loop that calculates Keplerian orbits, atmospheric drag, and velocity/altitude metrics in real time.
- **AI-Driven Orchestration (Google Gemini):** When a crisis occurs (like a Debris Storm or Solar Flare), the system pauses to consult the **Google Gemini API**. Gemini roleplays as a Safety Agent, Mission Economics Agent, and Commander to weigh fuel costs vs. mission success before deciding on an autonomous recovery maneuver.
- **Real-Time WebSocket Telemetry:** The backend streams live telemetry data, physics updates, and AI decisions to the frontend instantaneously via WebSockets.
- **Stunning 3D Visualization:** Built with `Three.js` and `react-three-fiber`. Features interactive 3D globes, dynamic satellite rendering, and an immersive "Ego View" radar that projects predicted collision paths.
- **Premium Fluid Responsiveness:** A meticulously crafted UI built with TailwindCSS. It features a massive command center view for desktop monitors, and completely transforms into a sleek, app-like bottom-tab navigation experience on mobile phones.

## 🛠️ Technology Stack

1. **Frontend (Hosted on Vercel):**
   - **React (Vite)** for lightning-fast component rendering.
   - **TailwindCSS** for custom, fluid, responsive styling and micro-animations.
   - **Three.js & React Three Fiber** for 3D graphics and orbital rendering.
   - **Lucide React** for crisp, scalable iconography.

2. **Backend (Hosted on Render):**
   - **Node.js + Express** HTTP server.
   - **WebSocket Server (`ws`)** for uninterrupted 10Hz live data streaming.
   - **SQLite** database for persistent event logging and AI decision metrics.
   - **@google/genai** official SDK for real-time AI reasoning.

## ⚙️ Architecture Design

StellarX uses a split-deployment architecture to guarantee maximum performance and reliability:

- The **Frontend** is deployed serverlessly on Vercel to leverage their global edge CDN for incredibly fast asset delivery and 3D model loading.
- The **Backend** is deployed on a stateful Node.js container (Render) because the simulation requires a continuous, unbroken physics loop and persistent WebSocket connections, which are not possible on serverless edge functions.

## 💻 Local Development Setup

To run this project locally, you will need Node.js (v18+) installed.

### 1. Start the Telemetry Backend
The backend runs the physics simulation and WebSocket server on port 8080.
```bash
cd server
npm install
# Ensure you have a GEMINI_API_KEY in your .env file
node index.js
```

### 2. Start the Frontend UI
The Vite frontend runs on port 5173. Open a new terminal window:
```bash
npm install
npm run dev
```

*Note: The frontend is hardcoded to connect to `ws://localhost:8080` when run locally, and automatically switches to the live Render WebSocket URL when deployed in production.*

---
*Built with ❤️ for the Hackathon.*
