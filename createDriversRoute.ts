import { Request, Response } from 'express';
import { Pool } from 'pg';
import casual from 'casual';

export async function createDriversHandler(req: Request, res: Response) {
  try {
    const connectionConfig = {
      user: 'postgres',
      password: 'postgres',
      host: 'localhost',
      port: 5432,
      database: 'wrl',
    };

    const pool = new Pool(connectionConfig);
    const client = await pool.connect();

    // Create drivers table if it doesn't exist
    await client.query(`
      CREATE TABLE IF NOT EXISTS drivers (
        id SERIAL PRIMARY KEY,
        fullname VARCHAR(255),
        consistency INT,
        skill INT,
        age INT,
        driverindex INT,
        team VARCHAR(255) DEFAULT NULL
      )
    `);

    // Generate and insert 60 random drivers
    for (let i = 0; i < 60; i++) {
      const fullname = casual.full_name;
      const consistency = Math.floor(Math.random() * 10) + 1;
      const skill = Math.floor(Math.random() * 10) + 1;
      const age = Math.floor(Math.random() * (38 - 18 + 1)) + 18;
      const driverindex = (skill * 2) + consistency;

      await client.query(`
        INSERT INTO drivers (fullname, consistency, skill, age, driverindex)
        VALUES ($1, $2, $3, $4, $5)
      `, [fullname, consistency, skill, age, driverindex]);
    }

    client.release();
    res.send('Drivers table created and drivers inserted.');
  } catch (error) {
    console.error('Error creating drivers:', error);
    res.status(500).send('Internal Server Error');
  }
}
