import { createReadStream, statSync } from "fs";
import type { FastifyInstance } from "fastify";
import { z } from "zod";
import { ThesisFileType, UserRole } from "@prisma/client";
import { prisma } from "../../config/prisma";
import { forbidden, notFound } from "../../shared/errors";
import { canAccessThesis } from "../../shared/permissions";
import { ok } from "../../shared/response";
import { saveUpload } from "../../shared/upload";
import type { JwtPayload } from "../../types";

export async function thesisFileRoutes(app: FastifyInstance) {
  app.get("/theses/:id/files", { preHandler: app.requireAuth }, async (request) => {
    const user = request.user as JwtPayload;
    const { id } = z.object({ id: z.string() }).parse(request.params);
    if (!(await canAccessThesis(user, id))) throw forbidden();
    return ok(await prisma.thesisFile.findMany({ where: { thesisId: id }, orderBy: { createdAt: "desc" } }));
  });

  app.get("/theses/:id/files/:fileId/view", { preHandler: app.requireAuth }, async (request, reply) => {
    const user = request.user as JwtPayload;
    const { id, fileId } = z.object({ id: z.string(), fileId: z.string() }).parse(request.params);
    if (!(await canAccessThesis(user, id))) throw forbidden();

    const file = await prisma.thesisFile.findFirst({ where: { id: fileId, thesisId: id } });
    if (!file) throw notFound("File not found");

    reply
      .header("content-type", file.mimeType)
      .header("content-disposition", `inline; filename="${encodeURIComponent(file.originalName)}"`);

    return reply.send(createReadStream(file.path));
  });

  app.post("/theses/:id/files", { preHandler: app.requireAuth }, async (request) => {
    const user = request.user as JwtPayload;
    const { id } = z.object({ id: z.string() }).parse(request.params);
    if (!(await canAccessThesis(user, id))) throw forbidden();
    const thesis = await prisma.thesis.findUnique({ where: { id }, include: { student: true } });
    if (!thesis) throw notFound("Thesis not found");
    if (user.role === UserRole.STUDENT && thesis.student.userId !== user.id) throw forbidden();

    const parts = request.parts();
    let fileType: ThesisFileType = ThesisFileType.OTHER;
    let notes: string | undefined;
    let saved: Awaited<ReturnType<typeof saveUpload>> | undefined;

    for await (const part of parts) {
      if (part.type === "file") saved = await saveUpload(part);
      if (part.type === "field" && part.fieldname === "fileType") fileType = String(part.value) as ThesisFileType;
      if (part.type === "field" && part.fieldname === "notes") notes = String(part.value);
    }
    if (!saved) throw forbidden("File is required");

    const size = statSync(saved.path).size;
    return ok(await prisma.thesisFile.create({
      data: {
        thesisId: id,
        uploadedById: user.id,
        fileName: saved.fileName,
        originalName: saved.originalName,
        mimeType: saved.mimeType,
        size,
        path: saved.path,
        fileType,
        notes,
      },
    }));
  });
}
