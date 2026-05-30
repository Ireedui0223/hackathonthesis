import Fastify from "fastify";
import { env } from "./config/env";
import { healthRoutes } from "./routes/health";
import { inferenceRoutes } from "./routes/inference";
import { modelRoutes } from "./routes/models";
import { registerErrorHandler } from "./plugins/errorHandler";
import { registerSecurityPlugins } from "./plugins/security";

async function main() {
  const app = Fastify({
    bodyLimit: 1_048_576,
    logger: {
      level: env.logLevel,
    },
  });

  registerErrorHandler(app);
  await registerSecurityPlugins(app);
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
