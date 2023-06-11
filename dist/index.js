"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const createDriversRoute_1 = require("./createDriversRoute");
const createTeamsRoute_1 = require("./createTeamsRoute");
const app = (0, express_1.default)();
const port = 3000;
// Register the route handlers
app.get('/createDrivers', createDriversRoute_1.createDriversHandler);
app.get('/createTeams', createTeamsRoute_1.createTeamsHandler);
// Start the server
app.listen(port, () => {
    console.log(`API server listening at http://localhost:${port}`);
});
