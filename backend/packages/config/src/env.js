"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.loadServiceEnv = loadServiceEnv;
exports.requiredEnv = requiredEnv;
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
function readNumber(name, fallback) {
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
function readNodeEnv() {
    const value = process.env.NODE_ENV ?? "development";
    if (value === "development" || value === "test" || value === "production") {
        return value;
    }
    throw new Error("NODE_ENV must be development, test, or production");
}
function loadServiceEnv(defaultPort) {
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
function requiredEnv(name) {
    const value = process.env[name];
    if (!value) {
        throw new Error(`Missing required environment variable ${name}`);
    }
    return value;
}
//# sourceMappingURL=env.js.map