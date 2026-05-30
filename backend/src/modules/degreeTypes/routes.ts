import type { FastifyInstance } from "fastify";
import { z } from "zod";
import { prisma } from "../../config/prisma";
import { created, ok } from "../../shared/response";

const schema = z.object({ name: z.string().min(1), description: z.string().optional() });

export async function degreeTypeRoutes(app: FastifyInstance) {
  app.get("/degree-types", { preHandler: app.requireAuth }, async () => ok(await prisma.degreeType.findMany({ orderBy: { name: "asc" } })));
  app.post("/admin/degree-types", { preHandler: app.requireAdmin }, async (request, reply) => {
    reply.status(201);
    return created(await prisma.degreeType.create({ data: schema.parse(request.body) }));
  });
  app.patch("/admin/degree-types/:id", { preHandler: app.requireAdmin }, async (request) => {
    const { id } = z.object({ id: z.string() }).parse(request.params);
    return ok(await prisma.degreeType.update({ where: { id }, data: schema.partial().parse(request.body) }));
  });
  app.delete("/admin/degree-types/:id", { preHandler: app.requireAdmin }, async (request) => {
    const { id } = z.object({ id: z.string() }).parse(request.params);
    await prisma.degreeType.delete({ where: { id } });
    return ok({ deleted: true });
  });
}
