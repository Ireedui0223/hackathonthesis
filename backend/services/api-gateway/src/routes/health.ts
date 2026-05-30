import type { FastifyInstance } from "fastify";

export async function healthRoutes(app: FastifyInstance) {
  app.get("/health", async () => ({
    ok: true,
    data: {
      service: "api-gateway",
      status: "healthy",
      timestamp: new Date().toISOString(),
    },
  }));

  app.get("/api/health", async () => ({
    ok: true,
    data: {
      service: "api-gateway",
      status: "healthy",
      timestamp: new Date().toISOString(),
    },
  }));
}
