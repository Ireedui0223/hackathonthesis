import type { FastifyInstance } from "fastify";
import { prisma } from "../../config/prisma";
import { ok } from "../../shared/response";

async function totalScores() {
  const theses = await prisma.thesis.findMany({ include: { defenseScores: { include: { defenseStage: true } } } });
  return theses.map((thesis) => {
    const grouped = new Map<number, number[]>();
    for (const score of thesis.defenseScores) {
      const list = grouped.get(score.defenseStage.stageNumber) ?? [];
      list.push(score.score);
      grouped.set(score.defenseStage.stageNumber, list);
    }
    const total = [...grouped.values()].reduce((sum, scores) => sum + scores.reduce((a, b) => a + b, 0) / scores.length, 0);
    return { thesisId: thesis.id, total };
  });
}

export async function statisticsRoutes(app: FastifyInstance) {
  app.get("/statistics/overview", { preHandler: app.requireAdmin }, async () => {
    const [students, teachers, theses, groups, uploads, critiques, stages] = await Promise.all([
      prisma.studentProfile.count(),
      prisma.teacherProfile.count(),
      prisma.thesis.count(),
      prisma.critiqueGroup.count(),
      prisma.thesisFile.findMany({ take: 6, orderBy: { createdAt: "desc" }, include: { thesis: true, uploadedBy: true } }),
      prisma.critiqueReview.findMany({ take: 6, orderBy: { createdAt: "desc" }, include: { thesis: true, assignedTeacher: { include: { user: true } } } }),
      prisma.defenseStage.findMany({ include: { scores: true }, orderBy: { stageNumber: "asc" } }),
    ]);
    const totals = await totalScores();
    const avgTotalScore = totals.length ? totals.reduce((sum, item) => sum + item.total, 0) / totals.length : 0;
    return ok({
      counts: { students, teachers, theses, groups },
      avgTotalScore,
      stageAverages: stages.map((stage) => ({ stage: stage.name, stageNumber: stage.stageNumber, average: stage.scores.length ? stage.scores.reduce((sum, score) => sum + score.score, 0) / stage.scores.length : 0, completed: stage.scores.length })),
      recentUploads: uploads,
      recentCritiques: critiques,
    });
  });

  app.get("/statistics/seasons", { preHandler: app.requireAdmin }, async () => {
    const seasons = await prisma.academicSeason.findMany({ include: { theses: { include: { defenseScores: { include: { defenseStage: true } } } } } });
    return ok(seasons.map((season) => ({ id: season.id, name: season.name, students: season.theses.length, defending: season.theses.length })));
  });

  app.get("/statistics/defense-stages", { preHandler: app.requireAdmin }, async () => {
    const stages = await prisma.defenseStage.findMany({ include: { scores: true }, orderBy: { stageNumber: "asc" } });
    return ok(stages.map((stage) => ({ stage: stage.name, maxScore: stage.maxScore, average: stage.scores.length ? stage.scores.reduce((sum, score) => sum + score.score, 0) / stage.scores.length : 0, completed: stage.scores.length })));
  });

  app.get("/statistics/teachers", { preHandler: app.requireAdmin }, async () => {
    const teachers = await prisma.teacherProfile.findMany({ include: { user: true } });
    const rows = [];
    for (const teacher of teachers) {
      const scores = await prisma.defenseScore.findMany({ where: { scoredById: teacher.userId } });
      rows.push({ teacher: teacher.user.name, average: scores.length ? scores.reduce((sum, score) => sum + score.score, 0) / scores.length : 0, scores: scores.length });
    }
    return ok(rows);
  });

  app.get("/statistics/groups", { preHandler: app.requireAdmin }, async () => {
    const groups = await prisma.critiqueGroup.findMany({ include: { theses: { include: { defenseScores: true } } } });
    return ok(groups.map((group) => {
      const scores = group.theses.flatMap((thesis) => thesis.defenseScores);
      return { group: group.name, theses: group.theses.length, average: scores.length ? scores.reduce((sum, score) => sum + score.score, 0) / scores.length : 0 };
    }));
  });
}
