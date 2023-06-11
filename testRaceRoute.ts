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
      SELECT drivers.fullname, (60 - drivers.skill - teams.humanresources - (teams.power*0.5) - (teams.aero*0.5)) AS seconds,
       teams.name AS team, drivers.consistency, teams.reliability
      FROM drivers
      INNER JOIN teams ON drivers.team::INTEGER = teams.id
      WHERE teams.tier = 'wrl'
      ORDER BY seconds ASC
    `);

    const rankings: Ranking[] = result.rows.map((row: any, index: number) => {
      const randomValue = Math.random() * 2.5; // Generate a random value between 0 and 2.5 for each row
      const seconds = row.seconds - randomValue;
      const shouldCrash = Math.random() * 5 > row.consistency; // Determine if the driver should crash based on their consistency value
      const shouldDnf = Math.random() * 5 > row.reliability; 
      const time = shouldCrash ? 'crashed' : (shouldDnf ? 'DNF' : '29m' + seconds);
      return {
        position: index + 1,
        time,
        driver: row.fullname,
        team: row.team
      };
    });

    rankings.sort((a, b) => {
      if (a.time === 'crashed' && b.time !== 'crashed') {
        return 1; // 'crashed' should be considered the highest value and placed at the end
      }
      if (a.time !== 'crashed' && b.time === 'crashed') {
        return -1; // 'crashed' should be considered the highest value and placed at the end
      }
      if (a.time === 'DNF' && b.time !== 'DNF') {
        return 1; // 'DNF' should be considered higher than non-'DNF' times
      }
      if (a.time !== 'DNF' && b.time === 'DNF') {
        return -1; // 'DNF' should be considered higher than non-'DNF' times
      }
      const secondsA = a.time === 'crashed' || a.time === 'DNF' ? Infinity : parseFloat(a.time.substring(3));
      const secondsB = b.time === 'crashed' || b.time === 'DNF' ? Infinity : parseFloat(b.time.substring(3));
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
