import type { FastifyInstance } from "fastify";

export function registerErrorHandler(app: FastifyInstance) {
  app.setErrorHandler((error, request, reply) => {
    const handledError = error as Error & { statusCode?: number };

    request.log.error({ error }, "request failed");

    const statusCode =
      handledError.statusCode && handledError.statusCode >= 400 ? handledError.statusCode : 500;

    reply.status(statusCode).send({
      ok: false,
      error: statusCode >= 500 ? "Internal server error" : handledError.message,
    });
  });
}
