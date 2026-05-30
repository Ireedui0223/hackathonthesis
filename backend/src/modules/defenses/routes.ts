import type { FastifyInstance } from "fastify";
import { z } from "zod";
import { ThesisStatus } from "@prisma/client";
import { prisma } from "../../config/prisma";
import { forbidden, notFound } from "../../shared/errors";
import { canAccessThesis, canScoreThesis } from "../../shared/permissions";
import { ok } from "../../shared/response";
import type { JwtPayload } from "../../types";

const scoreSchema = z.object({ defenseStageId: z.string(), score: z.number().min(0), comment: z.string().optional() });

const statusByStage: Record<number, ThesisStatus> = {
  1: ThesisStatus.DEFENSE_1_COMPLETED,
  2: ThesisStatus.DEFENSE_2_COMPLETED,
  3: ThesisStatus.DEFENSE_3_COMPLETED,
  4: ThesisStatus.COMPLETED,
};

export async function defenseRoutes(app: FastifyInstance) {
  app.get("/defense-stages", { preHandler: app.requireAuth }, async () => ok(await prisma.defenseStage.findMany({ orderBy: { stageNumber: "asc" } })));
  app.patch("/admin/defense-stages/:id", { preHandler: app.requireAdmin }, async (request) => {
    const { id } = z.object({ id: z.string() }).parse(request.params);
    const body = z.object({ name: z.string().optional(), maxScore: z.number().positive().optional(), description: z.string().optional(), isActive: z.boolean().optional() }).parse(request.body);
    return ok(await prisma.defenseStage.update({ where: { id }, data: body }));
  });
  app.get("/theses/:id/scores", { preHandler: app.requireAuth }, async (request) => {
    const user = request.user as JwtPayload;
    const { id } = z.object({ id: z.string() }).parse(request.params);
    if (!(await canAccessThesis(user, id))) throw forbidden();
    const scores = await prisma.defenseScore.findMany({ where: { thesisId: id }, include: { defenseStage: true, scoredBy: true } });
    return ok(scores);
  });
  app.post("/theses/:id/defense-scores", { preHandler: app.requireAuth }, async (request) => {
    const user = request.user as JwtPayload;
    const { id } = z.object({ id: z.string() }).parse(request.params);
    const body = scoreSchema.parse(request.body);
    const thesis = await prisma.thesis.findUnique({ where: { id } });
    const stage = await prisma.defenseStage.findUnique({ where: { id: body.defenseStageId } });
    if (!thesis || !stage) throw notFound("Thesis or defense stage not found");
    if (!(await canScoreThesis(user, thesis, stage))) throw forbidden("You cannot score this defense stage");
    if (body.score > stage.maxScore) throw forbidden(`Score must be <= ${stage.maxScore}`);
    const score = await prisma.defenseScore.upsert({
      where: { thesisId_defenseStageId_scoredById: { thesisId: id, defenseStageId: body.defenseStageId, scoredById: user.id } },
      update: { score: body.score, comment: body.comment },
      create: { thesisId: id, defenseStageId: body.defenseStageId, scoredById: user.id, score: body.score, comment: body.comment },
    });
    await prisma.thesis.update({ where: { id }, data: { status: statusByStage[stage.stageNumber], currentDefenseStage: Math.min(stage.stageNumber + 1, 4) } });
    return ok(score);
  });
  app.patch("/defense-scores/:id", { preHandler: app.requireAuth }, async (request) => {
    const { id } = z.object({ id: z.string() }).parse(request.params);
    const body = z.object({ score: z.number().min(0), comment: z.string().optional() }).parse(request.body);
    const existing = await prisma.defenseScore.findUnique({ where: { id }, include: { thesis: true, defenseStage: true } });
    if (!existing) throw notFound("Score not found");
    if (body.score > existing.defenseStage.maxScore) throw forbidden(`Score must be <= ${existing.defenseStage.maxScore}`);
    return ok(await prisma.defenseScore.update({ where: { id }, data: body }));
  });
}
