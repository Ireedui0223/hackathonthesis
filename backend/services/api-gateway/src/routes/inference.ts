import type { ApiResponse, InferenceRequest, InferenceResponse } from "@thesis/shared";
import type { FastifyInstance } from "fastify";
import { env } from "../config/env";

function httpError(message: string, statusCode: number): Error & { statusCode: number } {
  return Object.assign(new Error(message), { statusCode });
}

function isInferenceRequest(value: unknown): value is InferenceRequest {
  if (!value || typeof value !== "object") {
    return false;
  }

  const candidate = value as Record<string, unknown>;
  return typeof candidate.input === "string" && candidate.input.trim().length > 0;
}

export async function inferenceRoutes(app: FastifyInstance) {
  app.post("/api/inference/demo", async (request): Promise<ApiResponse<InferenceResponse>> => {
    if (!isInferenceRequest(request.body)) {
      throw httpError("Request body must include a non-empty input string", 400);
    }

    const response = await fetch(`${env.modelOrchestratorUrl}/inference/demo`, {
      method: "POST",
      headers: {
        "content-type": "application/json",
      },
      body: JSON.stringify(request.body),
    });

    if (!response.ok) {
      throw httpError("Model orchestrator inference request failed", 502);
    }

    return (await response.json()) as ApiResponse<InferenceResponse>;
  });
}
