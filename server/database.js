const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.resolve(__dirname, 'database.db');
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('Error opening database', err.message);
    } else {
        console.log('Connected to the SQLite database.');
        db.serialize(() => {
            db.run(`CREATE TABLE IF NOT EXISTS satellites (
                id INTEGER PRIMARY KEY,
                name TEXT NOT NULL,
                altitude REAL NOT NULL,
                inclination REAL NOT NULL,
                velocity REAL NOT NULL,
                fuel REAL NOT NULL,
                battery REAL NOT NULL,
                status TEXT NOT NULL,
                active_task TEXT,
                last_updated DATETIME DEFAULT CURRENT_TIMESTAMP
            )`);

            db.run(`CREATE TABLE IF NOT EXISTS debris (
                id INTEGER PRIMARY KEY,
                norad_id INTEGER UNIQUE,
                semi_major_axis REAL NOT NULL,
                eccentricity REAL NOT NULL,
                inclination REAL NOT NULL,
                position_x REAL NOT NULL,
                position_y REAL NOT NULL,
                position_z REAL NOT NULL
            )`);

            db.run(`CREATE TABLE IF NOT EXISTS agent_decisions (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
                satellite_id INTEGER,
                incident_type TEXT NOT NULL,
                safety_agent_input TEXT NOT NULL,
                mission_agent_input TEXT NOT NULL,
                commander_decision TEXT NOT NULL,
                fuel_cost REAL NOT NULL,
                mission_delay REAL NOT NULL,
                FOREIGN KEY(satellite_id) REFERENCES satellites(id)
            )`);
            
            // Seed Astra-01 if not exists
            db.get(`SELECT id FROM satellites WHERE name = 'Astra-01'`, (err, row) => {
                if (!row) {
                    db.run(`INSERT INTO satellites (name, altitude, inclination, velocity, fuel, battery, status, active_task)
                            VALUES ('Astra-01', 500.0, 45.0, 7.66, 100.0, 100.0, 'active', 'Hurricane Imaging')`);
                    console.log('Seeded Astra-01');
                }
            });
        });
    }
});

module.exports = db;
