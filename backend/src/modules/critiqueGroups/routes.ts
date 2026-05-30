import type { FastifyInstance } from "fastify";
import { z } from "zod";
import { prisma } from "../../config/prisma";
import { forbidden, notFound } from "../../shared/errors";
import { created, ok } from "../../shared/response";

const groupSchema = z.object({
  name: z.string().min(1),
  academicSeasonId: z.string(),
  degreeTypeId: z.string().optional().nullable(),
});

const include = {
  academicSeason: true,
  degreeType: true,
  teachers: { include: { teacher: { include: { user: true } } } },
  students: { include: { student: { include: { user: true, thesis: true } } } },
};

export async function critiqueGroupRoutes(app: FastifyInstance) {
  app.get("/critique-groups", { preHandler: app.requireAuth }, async () => ok(await prisma.critiqueGroup.findMany({ include, orderBy: { createdAt: "desc" } })));
  app.post("/admin/critique-groups", { preHandler: app.requireAdmin }, async (request, reply) => {
    reply.status(201);
    return created(await prisma.critiqueGroup.create({ data: groupSchema.parse(request.body), include }));
  });
  app.patch("/admin/critique-groups/:id", { preHandler: app.requireAdmin }, async (request) => {
    const { id } = z.object({ id: z.string() }).parse(request.params);
    return ok(await prisma.critiqueGroup.update({ where: { id }, data: groupSchema.partial().parse(request.body), include }));
  });
  app.delete("/admin/critique-groups/:id", { preHandler: app.requireAdmin }, async (request) => {
    const { id } = z.object({ id: z.string() }).parse(request.params);
    await prisma.critiqueGroup.delete({ where: { id } });
    return ok({ deleted: true });
  });
  app.post("/admin/critique-groups/:id/teachers", { preHandler: app.requireAdmin }, async (request) => {
    const { id } = z.object({ id: z.string() }).parse(request.params);
    const { teacherId } = z.object({ teacherId: z.string() }).parse(request.body);
    const activeCount = await prisma.critiqueGroupTeacher.count({ where: { groupId: id, isActive: true } });
    if (activeCount >= 6) throw forbidden("A critique group can have maximum 6 active teachers");
    return ok(await prisma.critiqueGroupTeacher.upsert({
      where: { groupId_teacherId: { groupId: id, teacherId } },
      update: { isActive: true, removedAt: null },
      create: { groupId: id, teacherId },
    }));
  });
  app.delete("/admin/critique-groups/:id/teachers/:teacherId", { preHandler: app.requireAdmin }, async (request) => {
    const { id, teacherId } = z.object({ id: z.string(), teacherId: z.string() }).parse(request.params);
    await prisma.critiqueGroupTeacher.update({ where: { groupId_teacherId: { groupId: id, teacherId } }, data: { isActive: false, removedAt: new Date() } });
    return ok({ removed: true });
  });
  app.patch("/admin/critique-groups/:id/teachers/:oldTeacherId/replace", { preHandler: app.requireAdmin }, async (request) => {
    const { id, oldTeacherId } = z.object({ id: z.string(), oldTeacherId: z.string() }).parse(request.params);
    const { newTeacherId } = z.object({ newTeacherId: z.string() }).parse(request.body);
    await prisma.critiqueGroupTeacher.update({ where: { groupId_teacherId: { groupId: id, teacherId: oldTeacherId } }, data: { isActive: false, removedAt: new Date() } });
    return ok(await prisma.critiqueGroupTeacher.upsert({ where: { groupId_teacherId: { groupId: id, teacherId: newTeacherId } }, update: { isActive: true, removedAt: null }, create: { groupId: id, teacherId: newTeacherId } }));
  });
  app.post("/admin/critique-groups/:id/students", { preHandler: app.requireAdmin }, async (request) => {
    const { id } = z.object({ id: z.string() }).parse(request.params);
    const { studentId } = z.object({ studentId: z.string() }).parse(request.body);
    const group = await prisma.critiqueGroup.findUnique({ where: { id } });
    if (!group) throw notFound("Group not found");
    await prisma.thesis.updateMany({ where: { studentId }, data: { critiqueGroupId: id } });
    return ok(await prisma.critiqueGroupStudent.upsert({ where: { groupId_studentId: { groupId: id, studentId } }, update: {}, create: { groupId: id, studentId } }));
  });
  app.delete("/admin/critique-groups/:id/students/:studentId", { preHandler: app.requireAdmin }, async (request) => {
    const { id, studentId } = z.object({ id: z.string(), studentId: z.string() }).parse(request.params);
    await prisma.critiqueGroupStudent.delete({ where: { groupId_studentId: { groupId: id, studentId } } });
    return ok({ removed: true });
  });
}
