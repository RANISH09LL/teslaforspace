# StellarX: Technology Stack & Physics Engine

## 1. The Technology Stack

StellarX uses a split-deployment architecture to guarantee both extreme frontend performance and a persistent, unbroken backend physics loop.

### Frontend (Client-side)
*   **Vite & React:** Provides lightning-fast Hot Module Replacement (HMR) during development and heavily optimized production builds.
*   **TailwindCSS:** Powers the fluid, responsive design system. It allows for inline, utility-based styling which was crucial for rapid prototyping during the hackathon.
*   **Three.js & React Three Fiber (R3F):** The backbone of the 3D visualization. R3F allows us to write declarative 3D scenes as React components, mapping our real-time WebSocket data directly to 3D mesh properties (like satellite positions).
*   **Lucide React:** For crisp, scalable vector iconography.

### Backend (Server-side)
*   **Node.js & Express:** Serves as the HTTP framework and container for the application.
*   **WebSocket (`ws`):** Because HTTP polling is too slow for 10Hz live physics, we use pure WebSockets. The server constantly pushes a serialized state of the 100-satellite constellation directly to the React client.
*   **SQLite:** An embedded database used to persist "Agent Decisions." Every time the AI makes a choice, the fuel cost, mission delay, and LLM reasoning are saved locally for auditing.
*   **Google GenAI SDK (`@google/genai`):** Used to interface with the Gemini 2.5 Flash model for high-speed AI reasoning.

## 2. The Physics Engine (`physics.js`)
At the core of the backend is a custom physics engine running a continuous `tick()` loop. 

### Orbital Mechanics (Keplerian 2-Body)
The simulation creates 100 satellites, each assigned Keplerian elements:
*   `a` (Semi-major axis): Calculated as `EARTH_RADIUS (6371km) + altitude`.
*   `e` (Eccentricity): Defines how elliptical the orbit is.
*   `i` (Inclination): The tilt of the orbit relative to the equator.
*   `raan` & `arg_p`: Define the orientation of the orbit in 3D space.
*   `trueAnomaly`: The satellite's current position along its orbital path.

**The Math:**
During every tick, the engine calculates the **Mean Motion** ($n$), which is the angular speed required for a body to complete one orbit, using the standard gravitational parameter of Earth ($\mu \approx 398600 \text{ km}^3/\text{s}^2$):
$n = \sqrt{\frac{\mu}{a^3}}$
The `trueAnomaly` is then advanced by $n \times \text{timeDelta}$.

### Environmental Perturbations
*   **Atmospheric Drag:** Satellites slowly lose altitude over time (`sat.altitude -= 0.005 * delta`), requiring fuel burns to maintain their orbit.
*   **Resource Decay:** Battery and fuel deplete dynamically based on the active time multiplier.

## 3. The LLM & Agent Logic (`agents.js`)
StellarX utilizes a hybrid deterministic + probabilistic AI model.

### 1. Deterministic Utility Engine (The "Thinking")
Before touching the LLM, the system mathematically calculates the best course of action. It weighs options using a strict utility function:
`Utility = (0.35 * RiskReduction) + (0.25 * MissionSuccess) + (0.25 * CoverageRetention) - (0.15 * FuelCost)`
This ensures the system never hallucinates a catastrophic physical maneuver. The engine calculates `Option A` vs `Option B` and hard-selects the winner.

### 2. Probabilistic LLM Explainer (The "Responding")
Once the mathematical decision is made, the context (the Hazard, the Options, the Utility Score, and the Chosen Action) is bundled into a prompt and sent to **Gemini 2.5 Flash**.

The LLM is instructed to roleplay as three distinct entities:
1.  **Safety Agent:** Focuses purely on survival and collision probability.
2.  **Mission Agent:** Focuses on SLA penalties, economics, and coverage impact.
3.  **Commander:** The authoritative voice that summarizes why the chosen utility score justified the action.

The LLM returns a structured JSON payload which is then streamed to the frontend UI, providing human operators with easily digestible, contextual reasoning for why the autonomous system just burned 5.2% of a satellite's fuel.
