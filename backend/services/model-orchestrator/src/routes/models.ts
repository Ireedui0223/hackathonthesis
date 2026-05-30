import type { ApiResponse, ModelInfo } from "@thesis/shared";
import type { FastifyInstance } from "fastify";
import { listModels } from "../services/modelRegistry";

export async function modelRoutes(app: FastifyInstance) {
  app.get("/models", async (): Promise<ApiResponse<ModelInfo[]>> => ({
    ok: true,
    data: listModels(),
  }));
}
