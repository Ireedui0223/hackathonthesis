import jwt from "@fastify/jwt";
import type { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import { UserRole } from "@prisma/client";
import { env } from "../config/env";
import { unauthorized, forbidden } from "../shared/errors";
import type { JwtPayload } from "../types";

export async function registerAuth(app: FastifyInstance) {
  await app.register(jwt, { secret: env.jwtSecret });

  app.decorate("requireAuth", async (request: FastifyRequest, _reply: FastifyReply) => {
    try {
      await request.jwtVerify();
    } catch {
      throw unauthorized();
    }
  });

  app.decorate("requireAdmin", async (request: FastifyRequest, reply: FastifyReply) => {
    await app.requireAuth(request, reply);
    const user = request.user as JwtPayload;
    if (user.role !== UserRole.ADMIN) {
      throw forbidden("Admin access required");
    }
  });
}
