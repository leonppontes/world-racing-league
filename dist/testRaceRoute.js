"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.testRaceHandler = void 0;
const pg_1 = require("pg");
async function testRaceHandler(req, res) {
    try {
        const connectionConfig = {
            user: 'postgres',
            password: 'postgres',
            host: 'localhost',
            port: 5432,
            database: 'wrl',
        };
        const pool = new pg_1.Pool(connectionConfig);
        const client = await pool.connect();
        // Retrieve drivers from the teams with tier 'wrl' and calculate their rankings
        const result = await client.query(`
      SELECT drivers.fullname, (60 - drivers.skill - teams.humanresources - (teams.power*0.5) - (teams.aero*0.5)) AS seconds, teams.name AS team
      FROM drivers
      INNER JOIN teams ON drivers.team::INTEGER = teams.id
      WHERE teams.tier = 'wrl'
      ORDER BY seconds ASC
    `);
        const rankings = result.rows.map((row, index) => {
            const randomValue = Math.random() * 2.5; // Generate a random value between 0 and 2.5 for each row
            const seconds = row.seconds - randomValue;
            return {
                position: index + 1,
                time: '29m' + seconds,
                driver: row.fullname,
                team: row.team
            };
        });
        client.release();
        res.json(rankings);
    }
    catch (error) {
        console.error('Error retrieving driver rankings:', error);
        res.status(500).send('Internal Server Error');
    }
}
exports.testRaceHandler = testRaceHandler;
