// backend/src/server.js
import { createApp } from './app.js';
import { env } from './config/env.js';

const app = createApp();

app.listen(env.port, () => {
  console.log(JSON.stringify({
    level: 'info',
    message: 'FaithFlix API started',
    service: env.serviceName,
    port: env.port,
  }));
});