import express from 'express';
import { createDriversHandler } from './createDriversRoute';
import { createTeamsHandler } from './createTeamsRoute';

const app = express();
const port = 3000;

// Register the route handlers
app.get('/createDrivers', createDriversHandler);
app.get('/createTeams', createTeamsHandler);

// Start the server
app.listen(port, () => {
  console.log(`API server listening at http://localhost:${port}`);
});