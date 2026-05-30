import type { UserRole, TeacherType } from "@prisma/client";

export interface JwtPayload {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  teacherType?: TeacherType | null;
}

declare module "fastify" {
  interface FastifyInstance {
    requireAuth: any;
    requireAdmin: any;
  }
}
