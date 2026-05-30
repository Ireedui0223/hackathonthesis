import type { FastifyInstance } from "fastify";

export async function healthRoutes(app: FastifyInstance) {
  app.get("/health", async () => ({
    ok: true,
    data: {
      service: "model-orchestrator",
      status: "healthy",
      timestamp: new Date().toISOString(),
    },
  }));
}
