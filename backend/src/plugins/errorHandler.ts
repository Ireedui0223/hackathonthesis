import type { FastifyInstance } from "fastify";
import { AppError } from "../shared/errors";

export function registerErrorHandler(app: FastifyInstance) {
  app.setErrorHandler((error, request, reply) => {
    request.log.error({ error }, "request failed");
    if (error instanceof AppError) {
      reply.status(error.statusCode).send({ success: false, message: error.message });
      return;
    }
    const statusCode = (error as Error & { statusCode?: number }).statusCode ?? 500;
    const handledError = error as Error;
    reply.status(statusCode).send({
      success: false,
      message: statusCode >= 500 ? "Internal server error" : handledError.message,
    });
  });
}
