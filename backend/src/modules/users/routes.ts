import bcrypt from "bcrypt";
import type { FastifyInstance } from "fastify";
import { z } from "zod";
import { TeacherType, UserRole } from "@prisma/client";
import { prisma } from "../../config/prisma";
import { created, ok } from "../../shared/response";
import type { JwtPayload } from "../../types";

const createUserSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6).default("password123"),
  name: z.string().min(1),
  role: z.nativeEnum(UserRole),
  teacherType: z.nativeEnum(TeacherType).optional(),
  studentCode: z.string().optional(),
  teacherCode: z.string().optional(),
  department: z.string().optional(),
  title: z.string().optional(),
  phone: z.string().optional(),
});

function normalizeEmptyStrings(body: unknown) {
  if (!body || typeof body !== "object") return body;
  return Object.fromEntries(
    Object.entries(body as Record<string, unknown>).map(([key, value]) => [key, value === "" ? undefined : value]),
  );
}

export async function userRoutes(app: FastifyInstance) {
  app.get("/admin/users", { preHandler: app.requireAdmin }, async () => {
    const users = await prisma.user.findMany({
      orderBy: { createdAt: "desc" },
      include: { studentProfile: true, teacherProfile: true },
    });
    return ok(users);
  });

  app.post("/admin/users", { preHandler: app.requireAdmin }, async (request, reply) => {
    const body = createUserSchema.parse(normalizeEmptyStrings(request.body));
    const user = await prisma.user.create({
      data: {
        email: body.email,
        name: body.name,
        role: body.role,
        teacherType: body.role === UserRole.TEACHER ? body.teacherType ?? TeacherType.MENTOR : undefined,
        passwordHash: await bcrypt.hash(body.password, 10),
        studentProfile:
          body.role === UserRole.STUDENT
            ? { create: { studentCode: body.studentCode, department: body.department, phone: body.phone } }
            : undefined,
        teacherProfile:
          body.role === UserRole.TEACHER
            ? { create: { teacherCode: body.teacherCode, department: body.department, title: body.title, phone: body.phone } }
            : undefined,
      },
      include: { studentProfile: true, teacherProfile: true },
    });
    reply.status(201);
    return created(user);
  });

  app.patch("/admin/users/:id", { preHandler: app.requireAdmin }, async (request) => {
    const params = z.object({ id: z.string() }).parse(request.params);
    const body = createUserSchema.partial().parse(normalizeEmptyStrings(request.body));
    const user = await prisma.user.update({
      where: { id: params.id },
      data: {
        email: body.email,
        name: body.name,
        role: body.role,
        teacherType: body.teacherType,
        passwordHash: body.password ? await bcrypt.hash(body.password, 10) : undefined,
      },
    });
    return ok(user);
  });

  app.patch("/me/teacher-code", { preHandler: app.requireAuth }, async (request) => {
    const user = request.user as JwtPayload;
    const body = z.object({ teacherCode: z.string().min(1) }).parse(normalizeEmptyStrings(request.body));
    const teacherProfile = await prisma.teacherProfile.update({
      where: { userId: user.id },
      data: { teacherCode: body.teacherCode },
      include: { user: true },
    });
    return ok(teacherProfile);
  });

  app.delete("/admin/users/:id", { preHandler: app.requireAdmin }, async (request) => {
    const params = z.object({ id: z.string() }).parse(request.params);
    await prisma.user.delete({ where: { id: params.id } });
    return ok({ deleted: true });
  });

  app.get("/admin/students", { preHandler: app.requireAdmin }, async () => {
    const students = await prisma.studentProfile.findMany({ include: { user: true, thesis: true }, orderBy: { createdAt: "desc" } });
    return ok(students);
  });

  app.get("/admin/teachers", { preHandler: app.requireAdmin }, async () => {
    const teachers = await prisma.teacherProfile.findMany({ include: { user: true }, orderBy: { createdAt: "desc" } });
    return ok(teachers);
  });
}
