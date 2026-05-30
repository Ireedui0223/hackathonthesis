import { randomUUID } from "crypto";
import { createWriteStream, mkdirSync } from "fs";
import path from "path";
import { pipeline } from "stream/promises";
import type { MultipartFile } from "@fastify/multipart";
import { env } from "../config/env";

export async function saveUpload(file: MultipartFile) {
  mkdirSync(env.uploadDir, { recursive: true });
  const extension = path.extname(file.filename);
  const fileName = `${randomUUID()}${extension}`;
  const filePath = path.join(env.uploadDir, fileName);
  await pipeline(file.file, createWriteStream(filePath));
  return {
    fileName,
    originalName: file.filename,
    mimeType: file.mimetype,
    path: filePath,
  };
}
