import { statSync } from "fs";
import type { FastifyInstance } from "fastify";
import { z } from "zod";
import { CritiqueStatus, ThesisFileType, ThesisStatus, UserRole } from "@prisma/client";
import { prisma } from "../../config/prisma";
import { forbidden, notFound } from "../../shared/errors";
import { ok } from "../../shared/response";
import { saveUpload } from "../../shared/upload";
import type { JwtPayload } from "../../types";

const include = {
  thesis: { include: { student: { include: { user: true } } } },
  assignedTeacher: { include: { user: true } },
  revisionFile: true,
  defenseStage: true,
};

async function assignedTeacherForUser(userId: string) {
  return prisma.teacherProfile.findUnique({ where: { userId } });
}

export async function critiqueRoutes(app: FastifyInstance) {
  app.post("/admin/theses/:id/assign-specific-critique-teacher", { preHandler: app.requireAdmin }, async (request) => {
    const user = request.user as JwtPayload;
    const { id } = z.object({ id: z.string() }).parse(request.params);
    const body = z.object({ assignedTeacherId: z.string(), dueDate: z.string().optional() }).parse(request.body);
    const thesis = await prisma.thesis.findUnique({ where: { id } });
    if (!thesis?.critiqueGroupId) throw forbidden("Thesis must have critique group");
    const membership = await prisma.critiqueGroupTeacher.findUnique({ where: { groupId_teacherId: { groupId: thesis.critiqueGroupId, teacherId: body.assignedTeacherId } } });
    if (!membership?.isActive) throw forbidden("Assigned teacher must be active in the thesis critique group");
    const stageThree = await prisma.defenseStage.findUnique({ where: { stageNumber: 3 } });
    const critique = await prisma.critiqueReview.create({
      data: {
        thesisId: id,
        assignedTeacherId: body.assignedTeacherId,
        assignedById: user.id,
        defenseStageId: stageThree?.id,
        dueDate: body.dueDate ? new Date(body.dueDate) : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        status: CritiqueStatus.ASSIGNED,
      },
      include,
    });
    await prisma.thesis.update({ where: { id }, data: { status: ThesisStatus.CRITIQUE_ASSIGNED } });
    return ok(critique);
  });

  app.get("/critiques", { preHandler: app.requireAuth }, async (request) => {
    const user = request.user as JwtPayload;
    if (user.role === UserRole.ADMIN) return ok(await prisma.critiqueReview.findMany({ include, orderBy: { createdAt: "desc" } }));
    if (user.role === UserRole.STUDENT) {
      const student = await prisma.studentProfile.findUnique({ where: { userId: user.id } });
      if (!student) return ok([]);
      return ok(await prisma.critiqueReview.findMany({ where: { thesis: { studentId: student.id } }, include, orderBy: { createdAt: "desc" } }));
    }
    const teacher = await assignedTeacherForUser(user.id);
    return ok(teacher ? await prisma.critiqueReview.findMany({ where: { assignedTeacherId: teacher.id }, include, orderBy: { createdAt: "desc" } }) : []);
  });

  app.get("/critiques/:id", { preHandler: app.requireAuth }, async (request) => {
    const { id } = z.object({ id: z.string() }).parse(request.params);
    const critique = await prisma.critiqueReview.findUnique({ where: { id }, include });
    if (!critique) throw notFound("Critique not found");
    return ok(critique);
  });

  app.patch("/critiques/:id/feedback", { preHandler: app.requireAuth }, async (request) => {
    const user = request.user as JwtPayload;
    const { id } = z.object({ id: z.string() }).parse(request.params);
    const body = z.object({ feedback: z.string().min(1), requiredChanges: z.string().optional() }).parse(request.body);
    const teacher = await assignedTeacherForUser(user.id);
    const critique = await prisma.critiqueReview.findUnique({ where: { id } });
    if (!critique || (!teacher && user.role !== UserRole.ADMIN)) throw forbidden();
    if (user.role !== UserRole.ADMIN && critique.assignedTeacherId !== teacher?.id) throw forbidden();
    await prisma.thesis.update({ where: { id: critique.thesisId }, data: { status: ThesisStatus.REVISION_REQUIRED } });
    return ok(await prisma.critiqueReview.update({ where: { id }, data: { ...body, status: CritiqueStatus.FEEDBACK_GIVEN }, include }));
  });

  app.post("/critiques/:id/submit-revision", { preHandler: app.requireAuth }, async (request) => {
    const user = request.user as JwtPayload;
    const { id } = z.object({ id: z.string() }).parse(request.params);
    const critique = await prisma.critiqueReview.findUnique({ where: { id }, include: { thesis: { include: { student: true } } } });
    if (!critique || critique.thesis.student.userId !== user.id) throw forbidden("Only the thesis student can submit revision");
    const file = await request.file();
    if (!file) throw forbidden("Revision file is required");
    const saved = await saveUpload(file);
    const size = statSync(saved.path).size;
    const thesisFile = await prisma.thesisFile.create({
      data: {
        thesisId: critique.thesisId,
        uploadedById: user.id,
        fileName: saved.fileName,
        originalName: saved.originalName,
        mimeType: saved.mimeType,
        size,
        path: saved.path,
        fileType: ThesisFileType.REVISION,
        notes: "Critique revision submission",
      },
    });
    await prisma.thesis.update({ where: { id: critique.thesisId }, data: { status: ThesisStatus.REVISION_SUBMITTED } });
    return ok(await prisma.critiqueReview.update({ where: { id }, data: { revisionFileId: thesisFile.id, submittedAt: new Date(), status: CritiqueStatus.REVISION_SUBMITTED }, include }));
  });

  app.patch("/critiques/:id/final-decision", { preHandler: app.requireAuth }, async (request) => {
    const user = request.user as JwtPayload;
    const { id } = z.object({ id: z.string() }).parse(request.params);
    const body = z.object({ status: z.enum(["APPROVED", "NEEDS_MORE_WORK"]), teacherFinalComment: z.string().optional() }).parse(request.body);
    const teacher = await assignedTeacherForUser(user.id);
    const critique = await prisma.critiqueReview.findUnique({ where: { id } });
    if (!critique || (user.role !== UserRole.ADMIN && critique.assignedTeacherId !== teacher?.id)) throw forbidden();
    return ok(await prisma.critiqueReview.update({ where: { id }, data: { status: body.status as CritiqueStatus, teacherFinalComment: body.teacherFinalComment }, include }));
  });
}
