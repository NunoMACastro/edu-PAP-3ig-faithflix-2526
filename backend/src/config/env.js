const DEFAULT_PORT = 3000;

function parsePort(value) {
  if (value === undefined || value === "") return DEFAULT_PORT;

  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed <= 0 || parsed > 65535) {
    throw new Error("PORT deve ser um numero inteiro entre 1 e 65535.");
  }

  return parsed;
}

export const env = {
  nodeEnv: process.env.NODE_ENV ?? "development",
  port: parsePort(process.env.PORT),
  serviceName: process.env.SERVICE_NAME ?? "faithflix-api",
  mongoUri: process.env.MONGODB_URI ?? "mongodb+srv://mabastos23ig_db_user:NFpU6mLz97xRweEO@testespap.auurs2x.mongodb.net/?appName=testesPAP",
  mongoDbName: process.env.MONGODB_DB_NAME ?? "faithflix",
};

export const isProduction = env.nodeEnv === "production";