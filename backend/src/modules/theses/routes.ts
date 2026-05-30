import type { FastifyInstance } from "fastify";
import { z } from "zod";
import { ThesisStatus, UserRole } from "@prisma/client";
import { prisma } from "../../config/prisma";
import { forbidden, notFound } from "../../shared/errors";
import { canAccessThesis, isAdmin } from "../../shared/permissions";
import { created, ok } from "../../shared/response";
import type { JwtPayload } from "../../types";

const thesisInclude = {
  student: { include: { user: true } },
  mentorTeacher: { include: { user: true } },
  critiqueGroup: true,
  academicSeason: true,
  degreeType: true,
  files: true,
  defenseScores: { include: { defenseStage: true, scoredBy: true } },
  critiques: { include: { assignedTeacher: { include: { user: true } } } },
};

const createThesisSchema = z.object({
  studentId: z.string().optional(),
  academicSeasonId: z.string(),
  degreeTypeId: z.string(),
  title: z.string().min(1),
  abstract: z.string().optional(),
  keywords: z.string().optional(),
  mentorTeacherCode: z.string().optional(),
});

function normalizeEmptyStrings(body: unknown) {
  if (!body || typeof body !== "object") return body;
  return Object.fromEntries(
    Object.entries(body as Record<string, unknown>).map(([key, value]) => [key, value === "" ? undefined : value]),
  );
}

async function resolveMentorTeacherId(mentorTeacherCode?: string) {
  if (!mentorTeacherCode) return undefined;
  const teacher = await prisma.teacherProfile.findUnique({
    where: { teacherCode: mentorTeacherCode },
    include: { user: true },
  });
  if (!teacher || (teacher.user.teacherType !== "MENTOR" && teacher.user.teacherType !== "BOTH")) {
    throw notFound("Mentor teacher code not found");
  }
  return teacher.id;
}

export async function thesisRoutes(app: FastifyInstance) {
  app.get("/theses", { preHandler: app.requireAuth }, async (request) => {
    const user = request.user as JwtPayload;
    if (user.role === UserRole.ADMIN) return ok(await prisma.thesis.findMany({ include: thesisInclude, orderBy: { updatedAt: "desc" } }));
    if (user.role === UserRole.STUDENT) {
      const student = await prisma.studentProfile.findUnique({ where: { userId: user.id } });
      return ok(student ? await prisma.thesis.findMany({ where: { studentId: student.id }, include: thesisInclude }) : []);
    }
    const teacher = await prisma.teacherProfile.findUnique({ where: { userId: user.id } });
    if (!teacher) return ok([]);
    const groups = await prisma.critiqueGroupTeacher.findMany({ where: { teacherId: teacher.id, isActive: true } });
    return ok(await prisma.thesis.findMany({
      where: { OR: [{ mentorTeacherId: teacher.id }, { critiqueGroupId: { in: groups.map((group) => group.groupId) } }] },
      include: thesisInclude,
      orderBy: { updatedAt: "desc" },
    }));
  });

  app.get("/theses/:id", { preHandler: app.requireAuth }, async (request) => {
    const user = request.user as JwtPayload;
    const { id } = z.object({ id: z.string() }).parse(request.params);
    if (!(await canAccessThesis(user, id))) throw forbidden();
    const thesis = await prisma.thesis.findUnique({ where: { id }, include: thesisInclude });
    if (!thesis) throw notFound("Thesis not found");
    return ok(thesis);
  });

  app.post("/theses", { preHandler: app.requireAuth }, async (request, reply) => {
    const user = request.user as JwtPayload;
    const body = createThesisSchema.parse(normalizeEmptyStrings(request.body));
    let studentId = body.studentId;
    if (!isAdmin(user)) {
      if (user.role !== UserRole.STUDENT) throw forbidden("Only students or admins can create thesis records");
      const student = await prisma.studentProfile.findUnique({ where: { userId: user.id } });
      if (!student) throw forbidden("Student profile required");
      studentId = student.id;
    }
    if (!studentId) throw forbidden("studentId is required");
    const mentorTeacherId = await resolveMentorTeacherId(body.mentorTeacherCode);
    const { mentorTeacherCode, ...thesisData } = body;
    const thesis = await prisma.thesis.create({ data: { ...thesisData, studentId, mentorTeacherId }, include: thesisInclude });
    reply.status(201);
    return created(thesis);
  });

  app.patch("/theses/:id", { preHandler: app.requireAuth }, async (request) => {
    const user = request.user as JwtPayload;
    const { id } = z.object({ id: z.string() }).parse(request.params);
    if (!(await canAccessThesis(user, id))) throw forbidden();
    const body = createThesisSchema.partial().extend({ status: z.nativeEnum(ThesisStatus).optional(), currentDefenseStage: z.number().optional() }).parse(normalizeEmptyStrings(request.body));
    const mentorTeacherId = await resolveMentorTeacherId(body.mentorTeacherCode);
    const { mentorTeacherCode, ...thesisData } = body;
    if (!isAdmin(user)) delete thesisData.status;
    return ok(await prisma.thesis.update({ where: { id }, data: { ...thesisData, mentorTeacherId }, include: thesisInclude }));
  });

  app.patch("/admin/theses/:id/assign-mentor", { preHandler: app.requireAdmin }, async (request) => {
    const { id } = z.object({ id: z.string() }).parse(request.params);
    const body = z.object({ mentorTeacherId: z.string() }).parse(request.body);
    return ok(await prisma.thesis.update({ where: { id }, data: { mentorTeacherId: body.mentorTeacherId }, include: thesisInclude }));
  });

  app.patch("/admin/theses/:id/assign-critique-group", { preHandler: app.requireAdmin }, async (request) => {
    const { id } = z.object({ id: z.string() }).parse(request.params);
    const body = z.object({ critiqueGroupId: z.string() }).parse(request.body);
    return ok(await prisma.thesis.update({ where: { id }, data: { critiqueGroupId: body.critiqueGroupId }, include: thesisInclude }));
  });
}
