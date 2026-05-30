import type { ApiResponse, InferenceRequest, InferenceResponse } from "@thesis/shared";
import type { FastifyInstance } from "fastify";
import { runDemoPipeline } from "../services/pipelineService";

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
  app.post("/inference/demo", async (request): Promise<ApiResponse<InferenceResponse>> => {
    if (!isInferenceRequest(request.body)) {
      throw httpError("Request body must include a non-empty input string", 400);
    }

    return {
      ok: true,
      data: await runDemoPipeline(request.body),
    };
  });
}
