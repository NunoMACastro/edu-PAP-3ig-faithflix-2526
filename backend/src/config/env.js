export const env = {
  nodeEnv: process.env.NODE_ENV ?? 'development',
  port: Number(process.env.PORT ?? 3000),
  serviceName: process.env.SERVICE_NAME ?? 'faithflix-api',
};