const express = require('express');
const { WebSocketServer } = require('ws');
const http = require('http');
const physicsEngine = require('./physics');
const agentOrchestrator = require('./agents');
const db = require('./database');

const app = express();
const server = http.createServer(app);
const wss = new WebSocketServer({ server });

app.get('/health', (req, res) => {
    res.json({ status: 'ASTRAPILOT X Backend Online' });
});

// WebSocket connection handler
wss.on('connection', (ws) => {
    console.log('[WS] Client connected to telemetry stream.');

    ws.on('message', async (message) => {
        try {
            const data = JSON.parse(message);
            console.log('[WS] Received command:', data);
            
            // Handle frontend commands like CHAOS INJECTION
            if (data.type === 'INJECT_CHAOS') {
                const hazardType = data.payload;
                
                if (hazardType === 'DEBRIS_STORM') {
                    physicsEngine.hazards.push({
                        id: `CRITICAL-OBJ-${Math.floor(Math.random() * 1000)}`,
                        distance: 20,
                        speed: 5,
                        approach_vector: [0, 0, 1]
                    });
                    physicsEngine.globalKpis.activeAnomalies.push({ node: 'ASTRA-001', threat: 'DEBRIS_STORM', status: 'MANEUVERING' });
                } else if (hazardType === 'SOLAR_FLARE') {
                    physicsEngine.constellation[0].battery -= 25;
                    physicsEngine.constellation[0].status = 'POWER_CRITICAL';
                    physicsEngine.globalKpis.activeAnomalies.push({ node: 'ASTRA-001', threat: 'SOLAR_FLARE', status: 'SHIELDING' });
                } else if (hazardType === 'SYSTEM_FAILURE') {
                    physicsEngine.constellation[0].battery = 0;
                    physicsEngine.constellation[0].status = 'OFFLINE';
                    physicsEngine.globalKpis.activeAnomalies.push({ node: 'ASTRA-001', threat: 'SYSTEM_FAILURE', status: 'HANDOFF TO NODE-42' });
                }

                // Keep anomalies list manageable
                if (physicsEngine.globalKpis.activeAnomalies.length > 5) {
                    physicsEngine.globalKpis.activeAnomalies.shift();
                }

                // 2. Trigger the Multi-Agent Debate
                const decision = await agentOrchestrator.evaluateHazard(hazardType, physicsEngine.constellation[0]);
                
                // 3. Apply the Commander's decision to the physics state
                if (decision.fuel_impact > 0) {
                    physicsEngine.constellation[0].fuel -= decision.fuel_impact;
                }

                // 4. Broadcast the decision back to clients immediately
                wss.clients.forEach((client) => {
                    if (client.readyState === 1) {
                        client.send(JSON.stringify({ type: 'AGENT_DECISION', data: decision }));
                    }
                });
            } else if (data.type === 'SET_TIME_MULTIPLIER') {
                physicsEngine.timeMultiplier = data.payload;
                console.log(`[PHYSICS] Time Dilation Set: ${physicsEngine.timeMultiplier}x`);
            }
        } catch (e) {
            console.error('[WS] Failed to parse message', e);
        }
    });

    ws.on('close', () => {
        console.log('[WS] Client disconnected.');
    });
});

// 10Hz Master Loop for smooth rendering during fast-forward
setInterval(() => {
    const telemetry = physicsEngine.tick();
    
    // Broadcast telemetry to all connected WebSocket clients
    const payload = JSON.stringify({ type: 'TELEMETRY_STREAM', data: telemetry });
    wss.clients.forEach((client) => {
        if (client.readyState === 1) { // OPEN
            client.send(payload);
        }
    });

}, 100);

const PORT = 8080;
server.listen(PORT, () => {
    console.log(`[ASTRAPILOT X] Backend Node Online on port ${PORT}`);
    console.log(`[ASTRAPILOT X] Telemetry stream broadcasting at ws://localhost:${PORT}`);
});
