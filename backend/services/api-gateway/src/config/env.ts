import { DEFAULT_PORTS } from "@thesis/shared";
import { loadServiceEnv, requiredEnv } from "@thesis/config";

const baseEnv = loadServiceEnv(DEFAULT_PORTS.apiGateway);

export const env = {
  ...baseEnv,
  modelOrchestratorUrl: baseEnv.modelOrchestratorUrl ?? requiredEnv("MODEL_ORCHESTRATOR_URL"),
};
