import type { FastifyInstance } from "fastify";
import { UserRole } from "@prisma/client";
import { prisma } from "../../config/prisma";
import { ok } from "../../shared/response";
import type { JwtPayload } from "../../types";

export async function dashboardRoutes(app: FastifyInstance) {
  app.get("/dashboard", { preHandler: app.requireAuth }, async (request) => {
    const user = request.user as JwtPayload;
    if (user.role === UserRole.ADMIN) {
      const [users, theses, groups, schedules] = await Promise.all([
        prisma.user.count(),
        prisma.thesis.count(),
        prisma.critiqueGroup.count(),
        prisma.defenseSchedule.count(),
      ]);
      return ok({ role: user.role, cards: [{ label: "Users", value: users }, { label: "Theses", value: theses }, { label: "Groups", value: groups }, { label: "Schedules", value: schedules }] });
    }
    if (user.role === UserRole.STUDENT) {
      const student = await prisma.studentProfile.findUnique({ where: { userId: user.id }, include: { thesis: { include: { defenseScores: { include: { defenseStage: true } }, critiques: true } } } });
      return ok({ role: user.role, student });
    }
    const teacher = await prisma.teacherProfile.findUnique({ where: { userId: user.id }, include: { user: true, mentoredTheses: true, critiqueGroups: true, assignedCritiques: true } });
    return ok({ role: user.role, teacher });
  });
}
