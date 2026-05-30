import type { ApiResponse, ModelInfo } from "@thesis/shared";
import type { FastifyInstance } from "fastify";
import { env } from "../config/env";

function httpError(message: string, statusCode: number): Error & { statusCode: number } {
  return Object.assign(new Error(message), { statusCode });
}

export async function modelRoutes(app: FastifyInstance) {
  app.get("/api/models", async (): Promise<ApiResponse<ModelInfo[]>> => {
    const response = await fetch(`${env.modelOrchestratorUrl}/models`);

    if (!response.ok) {
      throw httpError("Model orchestrator is unavailable", 502);
    }

    return (await response.json()) as ApiResponse<ModelInfo[]>;
  });
}
