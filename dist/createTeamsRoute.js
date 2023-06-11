"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createTeamsHandler = void 0;
const pg_1 = require("pg");
const casual_1 = __importDefault(require("casual"));
async function fetchDrivers(client) {
    const result = await client.query('SELECT * FROM drivers');
    return result.rows.map((row) => {
        return {
            id: row.id,
            fullname: row.fullname,
            consistency: row.consistency,
            skill: row.skill,
            age: row.age,
            driverindex: row.driverindex,
            team: row.team
        };
    });
}
async function createTeamsHandler(req, res) {
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
        // Create teams table if it doesn't exist
        await client.query(`
      CREATE TABLE IF NOT EXISTS teams (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255),
        power INT,
        aero INT,
        humanResources INT,
        sponsorship INT,
        powerIndex INT,
        tier VARCHAR(255),
        reliability INT,
        driver1 INT REFERENCES drivers(id),
        driver2 INT REFERENCES drivers(id),
        driver3 INT REFERENCES drivers(id)
      )
    `);
        // Fetch drivers from the database
        const drivers = await fetchDrivers(client);
        // Generate and insert 20 random teams with driver references based on powerIndex
        const driverIds = drivers.map(driver => driver.id);
        const teamsData = generateRandomTeamsData(driverIds, 20, drivers);
        for (const teamData of teamsData) {
            const { name, power, aero, humanResources, sponsorship, powerIndex, tier, reliability, driver1, driver2, driver3 } = teamData;
            const values = [name, power, aero, humanResources, sponsorship, powerIndex, tier, reliability, driver1, driver2, driver3];
            const result = await client.query(`
        INSERT INTO teams (name, power, aero, humanResources, sponsorship, powerIndex, tier, reliability, driver1, driver2, driver3)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
        RETURNING id
      `, values);
            const teamId = result.rows[0].id;
            // Update the driver records with the team ID
            await client.query(`
        UPDATE drivers
        SET team = $1
        WHERE id IN ($2, $3, $4)
      `, [teamId, driver1, driver2, driver3]);
        }
        client.release();
        res.send('Teams table created and teams inserted.');
    }
    catch (error) {
        console.error('Error creating teams:', error);
        res.status(500).send('Internal Server Error');
    }
}
exports.createTeamsHandler = createTeamsHandler;
function generateRandomTeamsData(driverIds, count, drivers) {
    if (driverIds.length < count * 3) {
        throw new Error('Insufficient number of drivers to generate teams.');
    }
    const sortedDrivers = drivers.slice().sort((a, b) => b.driverindex - a.driverindex); // Sort drivers based on driverindex (descending order)
    const teamsData = [];
    for (let i = 0; i < count; i++) {
        const name = casual_1.default.last_name + ' ' + generateRandomWord(['Racing', 'Team', 'Motorsport']);
        const power = Math.floor(Math.random() * 10) + 1;
        const aero = Math.floor(Math.random() * 10) + 1;
        const humanResources = Math.floor(Math.random() * 10) + 1;
        const sponsorship = Math.floor(Math.random() * 10) + 1;
        const reliability = Math.floor(Math.random() * 10) + 1;
        const powerIndex = power + aero + humanResources + sponsorship + reliability;
        teamsData.push({ name, power, aero, humanResources, sponsorship, powerIndex, reliability });
    }
    // Sort teams based on powerIndex (descending order)
    teamsData.sort((a, b) => b.powerIndex - a.powerIndex);
    // Assign tier to the top 10 teams
    for (let i = 0; i < 10; i++) {
        teamsData[i].tier = 'wrl';
        teamsData[teamsData.length - i - 1].tier = 'cs';
    }
    // Assign drivers to teams
    for (let i = 0; i < teamsData.length; i++) {
        const driver1 = sortedDrivers[i].id;
        const driver2 = sortedDrivers[20 + i].id;
        const driver3 = sortedDrivers[40 + i].id;
        teamsData[i].driver1 = driver1;
        teamsData[i].driver2 = driver2;
        teamsData[i].driver3 = driver3;
    }
    return teamsData;
}
function generateRandomWord(words) {
    const randomIndex = Math.floor(Math.random() * words.length);
    return words[randomIndex];
}
