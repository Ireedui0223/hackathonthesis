import type { FastifyInstance } from "fastify";
import { z } from "zod";
import { prisma } from "../../config/prisma";
import { created, ok } from "../../shared/response";

const schema = z.object({
  name: z.string().min(1),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  isActive: z.boolean().optional(),
});

export async function academicSeasonRoutes(app: FastifyInstance) {
  app.get("/academic-seasons", { preHandler: app.requireAuth }, async () => ok(await prisma.academicSeason.findMany({ orderBy: { name: "desc" } })));
  app.post("/admin/academic-seasons", { preHandler: app.requireAdmin }, async (request, reply) => {
    const body = schema.parse(request.body);
    reply.status(201);
    return created(await prisma.academicSeason.create({ data: { ...body, startDate: body.startDate ? new Date(body.startDate) : undefined, endDate: body.endDate ? new Date(body.endDate) : undefined } }));
  });
  app.patch("/admin/academic-seasons/:id", { preHandler: app.requireAdmin }, async (request) => {
    const { id } = z.object({ id: z.string() }).parse(request.params);
    const body = schema.partial().parse(request.body);
    return ok(await prisma.academicSeason.update({ where: { id }, data: { ...body, startDate: body.startDate ? new Date(body.startDate) : undefined, endDate: body.endDate ? new Date(body.endDate) : undefined } }));
  });
  app.delete("/admin/academic-seasons/:id", { preHandler: app.requireAdmin }, async (request) => {
    const { id } = z.object({ id: z.string() }).parse(request.params);
    await prisma.academicSeason.delete({ where: { id } });
    return ok({ deleted: true });
  });
}
