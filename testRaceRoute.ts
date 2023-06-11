import { Request, Response } from 'express';
import { Pool } from 'pg';

interface Ranking {
  position: number;
  time: string;
  driver: any;
  team: any;
}

export async function testRaceHandler(req: Request, res: Response) {
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

    // Retrieve drivers from the teams with tier 'wrl' and calculate their rankings
    const result = await client.query(`
      SELECT drivers.fullname, (60 - drivers.skill - teams.humanresources - (teams.power*0.5) - (teams.aero*0.5)) AS seconds, teams.name AS team
      FROM drivers
      INNER JOIN teams ON drivers.team::INTEGER = teams.id
      WHERE teams.tier = 'wrl'
      ORDER BY seconds ASC
    `);

    const rankings: Ranking[] = result.rows.map((row: any, index: number) => {
      const randomValue = Math.random() * 2.5; // Generate a random value between 0 and 2.5 for each row
      const seconds = row.seconds - randomValue;
      return {
        position: index + 1,
        time: '29m' + seconds,
        driver: row.fullname,
        team: row.team
      };
    });

    rankings.sort((a, b) => {
      const secondsA = parseFloat(a.time.substring(3));
      const secondsB = parseFloat(b.time.substring(3));
      return secondsA - secondsB;
    });

    rankings.forEach((ranking, index) => {
      ranking.position = index + 1;
    });

    client.release();
    res.json(rankings);
  } catch (error) {
    console.error('Error retrieving driver rankings:', error);
    res.status(500).send('Internal Server Error');
  }
}
