import helmet from "@fastify/helmet";
import Fastify from "fastify";
import { env } from "./config/env";
import { healthRoutes } from "./routes/health";
import { inferenceRoutes } from "./routes/inference";
import { modelRoutes } from "./routes/models";

async function main() {
  const app = Fastify({
    bodyLimit: 1_048_576,
    logger: {
      level: env.logLevel,
    },
  });

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

  await app.register(helmet);
  await app.register(healthRoutes);
  await app.register(modelRoutes);
  await app.register(inferenceRoutes);

  await app.listen({
    host: env.host,
    port: env.port,
  });
}

void main().catch((error) => {
  // eslint-disable-next-line no-console
  console.error(error);
  process.exit(1);
});
