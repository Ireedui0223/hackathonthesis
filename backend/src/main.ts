import { env } from "./config/env";
import { prisma } from "./config/prisma";
import { buildApp } from "./app";

async function main() {
  const app = await buildApp();
  await app.listen({ host: env.host, port: env.port });

  const shutdown = async () => {
    await app.close();
    await prisma.$disconnect();
    process.exit(0);
  };

  process.on("SIGINT", shutdown);
  process.on("SIGTERM", shutdown);
}

void main().catch((error) => {
  console.error(error);
  process.exit(1);
});
