import { Request, Response } from 'express';
import { Pool } from 'pg';

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
    
        const rankings = result.rows.map((row: any, index: number) => ({
            position: index + 1,
            time: '29m' + row.seconds,
            driver: row.fullname,
            team: row.team
          }));
          
        client.release();
        res.json(rankings);
      } catch (error) {
        console.error('Error retrieving driver rankings:', error);
        res.status(500).send('Internal Server Error');
      }
    
}