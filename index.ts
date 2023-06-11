import express from 'express';
import { createDriversHandler } from './createDriversRoute';
import { createTeamsHandler } from './createTeamsRoute';
import { testRaceHandler } from './testRaceRoute';

const app = express();
const port = 3000;

// Register the route handlers
app.get('/createDrivers', createDriversHandler);
app.get('/createTeams', createTeamsHandler);
app.get('/testRace', testRaceHandler);

// Start the server
app.listen(port, () => {
  console.log(`API server listening at http://localhost:${port}`);
});