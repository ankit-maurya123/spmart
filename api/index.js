// Vercel serverless entry — re-exports the Express app from server/server.js.
// On Vercel, env vars are injected via process.env (see Project → Settings → Env Vars).
const app = require('../server/server.js');
module.exports = app;
