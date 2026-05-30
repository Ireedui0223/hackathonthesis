import type { FastifyInstance } from "fastify";
import { z } from "zod";
import { UserRole } from "@prisma/client";
import { prisma } from "../../config/prisma";
import { created, ok } from "../../shared/response";
import type { JwtPayload } from "../../types";

const schema = z.object({
  academicSeasonId: z.string(),
  degreeTypeId: z.string().optional().nullable(),
  defenseStageId: z.string(),
  title: z.string().min(1),
  defenseDate: z.string(),
  startTime: z.string().optional(),
  endTime: z.string().optional(),
  location: z.string().optional(),
  notes: z.string().optional(),
});

const include = { academicSeason: true, degreeType: true, defenseStage: true, createdBy: true };

export async function scheduleRoutes(app: FastifyInstance) {
  app.get("/schedules", { preHandler: app.requireAuth }, async (request) => {
    const user = request.user as JwtPayload;
    if (user.role === UserRole.ADMIN || user.role === UserRole.TEACHER) return ok(await prisma.defenseSchedule.findMany({ include, orderBy: { defenseDate: "asc" } }));
    const student = await prisma.studentProfile.findUnique({ where: { userId: user.id }, include: { thesis: true } });
    if (!student?.thesis) return ok([]);
    return ok(await prisma.defenseSchedule.findMany({ where: { academicSeasonId: student.thesis.academicSeasonId, OR: [{ degreeTypeId: null }, { degreeTypeId: student.thesis.degreeTypeId }] }, include, orderBy: { defenseDate: "asc" } }));
  });
  app.post("/admin/schedules", { preHandler: app.requireAdmin }, async (request, reply) => {
    const user = request.user as JwtPayload;
    const body = schema.parse(request.body);
    reply.status(201);
    return created(await prisma.defenseSchedule.create({ data: { ...body, defenseDate: new Date(body.defenseDate), createdById: user.id }, include }));
  });
  app.patch("/admin/schedules/:id", { preHandler: app.requireAdmin }, async (request) => {
    const { id } = z.object({ id: z.string() }).parse(request.params);
    const body = schema.partial().parse(request.body);
    return ok(await prisma.defenseSchedule.update({ where: { id }, data: { ...body, defenseDate: body.defenseDate ? new Date(body.defenseDate) : undefined }, include }));
  });
  app.delete("/admin/schedules/:id", { preHandler: app.requireAdmin }, async (request) => {
    const { id } = z.object({ id: z.string() }).parse(request.params);
    await prisma.defenseSchedule.delete({ where: { id } });
    return ok({ deleted: true });
  });
}
