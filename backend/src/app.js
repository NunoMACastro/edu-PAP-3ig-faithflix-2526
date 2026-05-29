import express from 'express';
import systemRouter from './modules/system/system.routes.js';

export function createApp() {
  const app = express();
  app.use(express.json({ limit: '1mb' }));
  app.use('/api', systemRouter);
  return app;
}