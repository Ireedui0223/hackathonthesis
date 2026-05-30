import { loadServiceEnv } from "@thesis/config";
import { DEFAULT_PORTS } from "@thesis/shared";

const baseEnv = loadServiceEnv(DEFAULT_PORTS.modelOrchestrator);

export const env = {
  ...baseEnv,
  modelProvider: baseEnv.modelProvider ?? "placeholder",
  modelServerUrl: baseEnv.modelServerUrl ?? "http://model-server:8000",
};
