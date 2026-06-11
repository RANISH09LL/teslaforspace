require('dotenv').config();
const { GoogleGenAI } = require('@google/genai');
const db = require('./database');

// Initialize Gemini Client (Used ONLY as an explainer now, not the decision maker)
const ai = process.env.GEMINI_API_KEY ? new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY }) : null;

class FleetOptimizationEngine {
    
    // Deterministic Utility Function
    // U = (w1 * RiskReduction) + (w2 * MissionSuccess) - (w3 * FuelCost)
    calculateUtility(fuelCost, riskReduction, missionImpact) {
        const w1 = 0.5; // Weight for risk reduction
        const w2 = 0.3; // Weight for mission success (impact is usually negative here)
        const w3 = 0.2; // Weight for fuel cost
        
        // Normalize mission impact (so 0 impact is 100% success, -100 is 0%)
        const missionSuccess = 100 + missionImpact; 

        const score = (w1 * riskReduction) + (w2 * missionSuccess) - (w3 * fuelCost);
        return Math.max(0, Math.min(100, score)); // Clamp 0-100
    }

    async evaluateHazard(hazardType, telemetry) {
        console.log(`[OPTIMIZATION ENGINE] Processing anomaly: ${hazardType}`);

        // 1. Math First: Generate Options
        let optionA, optionB;
        let hexPayload = '0x00 0x00 IDLE';
        let fuelCost = 0;

        if (hazardType === 'DEBRIS_STORM') {
            optionA = { id: 'A', description: "Evade Debris (Retrograde Burn)", fuelCost: 5.2, riskReduction: 98, missionImpact: -15 };
            optionB = { id: 'B', description: "Hold Course (Accept Risk)", fuelCost: 0, riskReduction: 0, missionImpact: 0 };
            hexPayload = '0xAA 0x01 BURN 0.40';
        } else if (hazardType === 'SOLAR_FLARE') {
            optionA = { id: 'A', description: "Full Shutdown (Maximum Protection)", fuelCost: 0, riskReduction: 90, missionImpact: -100 };
            optionB = { id: 'B', description: "Partial Feathering (Maintain Optics)", fuelCost: 1.5, riskReduction: 60, missionImpact: -60 };
            hexPayload = '0xAA 0x02 SHLD 0.60';
        } else if (hazardType === 'SYSTEM_FAILURE') {
            optionA = { id: 'A', description: "Attempt Reboot (Risk Total Loss)", fuelCost: 0, riskReduction: 10, missionImpact: -100 };
            optionB = { id: 'B', description: "Cross-Node Task Handoff to NODE-42", fuelCost: 0, riskReduction: 99, missionImpact: 0 };
            hexPayload = '0xFF 0x00 SLP_HANDOFF 42';
        }

        // 2. Score Options Deterministically
        optionA.finalScore = this.calculateUtility(optionA.fuelCost, optionA.riskReduction, optionA.missionImpact);
        optionB.finalScore = this.calculateUtility(optionB.fuelCost, optionB.riskReduction, optionB.missionImpact);

        const selectedOption = optionA.finalScore >= optionB.finalScore ? optionA : optionB;
        fuelCost = selectedOption.fuelCost;

        // 3. Calculate Confidence based on Utility Variance
        const variance = Math.abs(optionA.finalScore - optionB.finalScore);
        // Map variance (0 to 100) to confidence (50% to 99%)
        const confidence = Math.min(99, 50 + (variance * 0.5));

        const economics = {
            optionA,
            optionB,
            selectedOption: selectedOption.id
        };

        // 4. LLM / AI Explainer Layer
        let safetyResponse, missionResponse, commanderDecision;

        if (ai) {
            console.log('[AI EXPLAINER] Calling Gemini to generate human-readable report...');
            try {
                const prompt = `
                You are the AI Explainer for a deterministic Fleet Optimization Engine.
                Hazard: ${hazardType}.
                The math engine calculated scores for two options:
                Option A: ${optionA.description} (Score: ${optionA.finalScore.toFixed(1)})
                Option B: ${optionB.description} (Score: ${optionB.finalScore.toFixed(1)})
                The engine CHOSE Option ${selectedOption.id} with ${confidence.toFixed(1)}% confidence.

                Write 3 brief, robotic logs explaining the reasoning:
                1. safetyResponse: From the perspective of maximizing survival.
                2. missionResponse: From the perspective of economic mission impact.
                3. commanderDecision: A final authoritative summary declaring the chosen action.
                Format as JSON: { "safetyResponse": "...", "missionResponse": "...", "commanderDecision": "..." }
                `;

                const response = await ai.models.generateContent({
                    model: 'gemini-2.5-flash',
                    contents: prompt,
                    config: { responseMimeType: "application/json" }
                });
                const result = JSON.parse(response.text);
                safetyResponse = `[SAFETY] ${result.safetyResponse}`;
                missionResponse = `[MISSION] ${result.missionResponse}`;
                commanderDecision = `[CMDR] ${result.commanderDecision}`;
            } catch(e) {
                console.error("[AI EXPLAINER] Error, using fallback text:", e);
                safetyResponse = `[SAFETY] Evaluated risk parameters against deterministic model.`;
                missionResponse = `[MISSION] Computed economic impact matrices.`;
                commanderDecision = `[CMDR] Selected Option ${selectedOption.id} based on utility maximization. Confidence: ${confidence.toFixed(1)}%`;
            }
        } else {
            // Simulated Explainer
            if (hazardType === 'DEBRIS_STORM') {
                safetyResponse = `[SAFETY] Collision probability 98.4%. Immediate burn required to minimize asset loss.`;
                missionResponse = `[MISSION] Evasive burn will disrupt imaging, resulting in temporary SLA penalty.`;
                commanderDecision = `[CMDR] Utility Engine favors Option A. Survival outweighs temporary SLA penalty. Executing burn.`;
            } else if (hazardType === 'SOLAR_FLARE') {
                safetyResponse = `[SAFETY] Radiation threshold exceeded. Shutting down non-essential systems recommended.`;
                missionResponse = `[MISSION] Full shutdown causes unacceptable data loss. Suggesting partial feathering.`;
                commanderDecision = `[CMDR] Utility Engine favors Option B. Risk mitigation is sufficient while preserving 40% optics revenue.`;
            } else if (hazardType === 'SYSTEM_FAILURE') {
                safetyResponse = `[SAFETY] Primary hardware failure. Reboot attempt carries high risk of total loss.`;
                missionResponse = `[MISSION] Imaging contract SLA will be breached if node goes offline without backup.`;
                commanderDecision = `[CMDR] Utility Engine favors Option B. Initiating cross-node handoff to preserve SLA. Local hardware set to sleep.`;
            }
        }

        const decisionLog = {
            timestamp: new Date().toISOString(),
            incident: hazardType,
            safety: safetyResponse,
            mission: missionResponse,
            commander: commanderDecision,
            economics: economics,
            fuel_impact: fuelCost,
            hex_payload: hexPayload,
            confidence: confidence
        };

        // Log to DB
        db.run(`INSERT INTO agent_decisions (satellite_id, incident_type, safety_agent_input, mission_agent_input, commander_decision, fuel_cost, mission_delay)
                VALUES (1, ?, ?, ?, ?, ?, ?)`, 
                [hazardType, decisionLog.safety, decisionLog.mission, decisionLog.commander, fuelCost, 0], 
                (err) => { if (err) console.error('[DB]', err); });

        return decisionLog;
    }
}

module.exports = new FleetOptimizationEngine();
