import type { FastifyInstance } from "fastify";
import { ok } from "../../shared/response";

export async function healthRoutes(app: FastifyInstance) {
  app.get("/health", async () => ok({ service: "backend", status: "healthy", timestamp: new Date().toISOString() }));
}
