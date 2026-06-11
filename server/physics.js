const db = require('./database');

// Constants
const EARTH_RADIUS = 6371; // km
const MU = 398600; // Earth's standard gravitational parameter, km^3/s^2

class PhysicsEngine {
    constructor() {
        // Generate 100 satellites with individual physics states
        this.constellation = Array.from({ length: 100 }, (_, i) => {
            const altitude = 400 + Math.random() * 200; // km
            const a = EARTH_RADIUS + altitude; // Semi-major axis
            const e = Math.random() * 0.05; // Eccentricity
            const i_rad = (Math.random() * 90) * (Math.PI / 180); // Inclination in rads
            const raan = Math.random() * Math.PI * 2; // Right Ascension of Ascending Node
            const arg_p = Math.random() * Math.PI * 2; // Argument of periapsis
            const v = Math.sqrt(MU / a); // Approx velocity

            return {
                id: `ASTRA-${(i + 1).toString().padStart(3, '0')}`,
                status: 'NOMINAL',
                task: i % 5 === 0 ? 'COMM_RELAY' : 'EARTH_OBSERVATION',
                altitude: altitude,
                velocity: v,
                fuel: 80 + Math.random() * 20,
                battery: 90 + Math.random() * 10,
                // Keplerian Elements
                a: a,
                e: e,
                i: i_rad,
                raan: raan,
                arg_p: arg_p,
                trueAnomaly: Math.random() * Math.PI * 2, // Current position in orbit
            };
        });

        this.hazards = [
            { id: 'OBJ-409', distance: 50, speed: 1.2, approach_vector: [0.1, -0.05, 0.9] }
        ];

        this.globalKpis = {
            fleetSurvivalProbability: 97.4,
            missionSuccessRate: 84.1,
            overallFuelEfficiency: 91.0,
            activeAnomalies: [
                { node: 'NODE-12', threat: 'THERMAL_SPIKE', status: 'MITIGATING' }
            ],
            strategicForecasts: [
                { time: 'T+12H', type: 'SOLAR STORM', risk: 'HIGH', maneuver: 'Shielding Scheduled' },
                { time: 'T+48H', type: 'CONJUNCTION OBJ-992', risk: 'CRITICAL', maneuver: 'Preemptive 0.2m/s Burn' },
                { time: 'T+72H', type: 'BATTERY DEGRADATION', risk: 'LOW', maneuver: 'Load Balancing Active' }
            ],
            strategicHorizon: {
                tPlus12: { baseline: 85.2, optimized: 96.4 },
                tPlus24: { baseline: 72.1, optimized: 94.8 }
            }
        };

        this.timeMultiplier = 1;
        this.simulationTime = 0;
    }

    // 1Hz Tick Function
    tick() {
        if (this.timeMultiplier === 0) {
            return this._getState();
        }

        const delta = this.timeMultiplier;

        // Process all 100 satellites individually
        this.constellation.forEach(sat => {
            if (sat.status === 'OFFLINE') return;

            // Simple orbital decay
            sat.altitude -= 0.005 * delta;
            sat.a = EARTH_RADIUS + sat.altitude;
            sat.velocity = Math.sqrt(MU / sat.a);

            // Mean motion (n) = sqrt(mu / a^3)
            const n = Math.sqrt(MU / Math.pow(sat.a, 3));
            
            // Advance True Anomaly (approximate circular orbit for visual phase)
            sat.trueAnomaly += n * 60 * delta; // Speed up visual by 60x for coolness
            if (sat.trueAnomaly > Math.PI * 2) sat.trueAnomaly -= Math.PI * 2;

            // Consume power/fuel visibly
            sat.battery = Math.max(0, sat.battery - 0.02 * delta);
            sat.fuel = Math.max(0, sat.fuel - 0.01 * delta);
        });

        // Update hazards
        this.hazards.forEach(hazard => {
            hazard.distance -= hazard.speed * delta;
        });

        // Clean up passed hazards and spawn new ones randomly
        this.hazards = this.hazards.filter(h => h.distance > 0);
        if (Math.random() < 0.05 && this.hazards.length < 3) {
            this.hazards.push({
                id: `OBJ-${Math.floor(Math.random() * 1000)}`,
                distance: 100 + Math.random() * 50,
                speed: 0.5 + Math.random() * 2,
                approach_vector: [Math.random() - 0.5, Math.random() - 0.5, Math.random()]
            });
        }

        // Randomly fluctuate KPIs slightly to simulate a living global system
        if (Math.random() < 0.05 * delta) {
            this.globalKpis.fleetSurvivalProbability = Math.max(0, Math.min(100, this.globalKpis.fleetSurvivalProbability + (Math.random() - 0.5) * 0.5));
            this.globalKpis.missionSuccessRate = Math.max(0, Math.min(100, this.globalKpis.missionSuccessRate + (Math.random() - 0.5) * 1.0));
            this.globalKpis.overallFuelEfficiency = Math.max(0, Math.min(100, this.globalKpis.overallFuelEfficiency + (Math.random() - 0.5) * 0.2));
            
            // Fluctuate horizon predictions based on current survival
            const base = this.globalKpis.fleetSurvivalProbability;
            this.globalKpis.strategicHorizon.tPlus12.baseline = Math.max(0, base - 10 - Math.random() * 5);
            this.globalKpis.strategicHorizon.tPlus12.optimized = Math.min(100, base + Math.random() * 2);
            this.globalKpis.strategicHorizon.tPlus24.baseline = Math.max(0, base - 25 - Math.random() * 5);
            this.globalKpis.strategicHorizon.tPlus24.optimized = Math.min(100, base - 2 + Math.random() * 3);
        }

        // Cycle through strategic forecasts over time
        this.simulationTime += delta;
        if (this.simulationTime > 1000) {
            this.simulationTime = 0;
            // Shift forecasts to make the AI look like it's planning
            const old = this.globalKpis.strategicForecasts.shift();
            this.globalKpis.strategicForecasts.push({
                time: `T+${Math.floor(Math.random()*48 + 72)}H`,
                type: ['MICROMETEOROID SHOWER', 'ORBITAL DECAY', 'NETWORK BLACKOUT', 'THERMAL SPIKE'][Math.floor(Math.random()*4)],
                risk: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'][Math.floor(Math.random()*4)],
                maneuver: ['Course Correction', 'Handoff Pre-computed', 'Shields Armed', 'Load Shedding'][Math.floor(Math.random()*4)]
            });
        }

        return this._getState();
    }

    _getState() {
        return {
            timestamp: new Date().toISOString(),
            constellation: this.constellation, // Now contains all individual sat states
            hazards: this.hazards,
            timeMultiplier: this.timeMultiplier,
            globalKpis: this.globalKpis
        };
    }
}

module.exports = new PhysicsEngine();
