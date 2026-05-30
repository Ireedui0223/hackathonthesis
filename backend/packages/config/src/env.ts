import dotenv from "dotenv";

dotenv.config();

export type NodeEnv = "development" | "test" | "production";

export interface ServiceEnv {
  nodeEnv: NodeEnv;
  port: number;
  host: string;
  logLevel: string;
  corsOrigin?: string;
  modelOrchestratorUrl?: string;
  modelProvider?: string;
  modelServerUrl?: string;
}

function readNumber(name: string, fallback: number): number {
  const value = process.env[name];

  if (!value) {
    return fallback;
  }

  const parsed = Number(value);

  if (!Number.isInteger(parsed) || parsed <= 0) {
    throw new Error(`Invalid numeric environment variable ${name}`);
  }

  return parsed;
}

function readNodeEnv(): NodeEnv {
  const value = process.env.NODE_ENV ?? "development";

  if (value === "development" || value === "test" || value === "production") {
    return value;
  }

  throw new Error("NODE_ENV must be development, test, or production");
}

export function loadServiceEnv(defaultPort: number): ServiceEnv {
  return {
    nodeEnv: readNodeEnv(),
    port: readNumber("PORT", defaultPort),
    host: process.env.HOST ?? "0.0.0.0",
    logLevel: process.env.LOG_LEVEL ?? "info",
    corsOrigin: process.env.CORS_ORIGIN,
    modelOrchestratorUrl: process.env.MODEL_ORCHESTRATOR_URL,
    modelProvider: process.env.MODEL_PROVIDER,
    modelServerUrl: process.env.MODEL_SERVER_URL,
  };
}

export function requiredEnv(name: string): string {
  const value = process.env[name];

  if (!value) {
    throw new Error(`Missing required environment variable ${name}`);
  }

  return value;
}
