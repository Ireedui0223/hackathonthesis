import bcrypt from "bcrypt";
import type { FastifyInstance } from "fastify";
import { z } from "zod";
import { prisma } from "../../config/prisma";
import { unauthorized } from "../../shared/errors";
import { ok } from "../../shared/response";
import type { JwtPayload } from "../../types";

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export async function authRoutes(app: FastifyInstance) {
  app.post("/login", async (request) => {
    const body = loginSchema.parse(request.body);
    const user = await prisma.user.findUnique({
      where: { email: body.email },
      include: { studentProfile: true, teacherProfile: true },
    });

    if (!user || !(await bcrypt.compare(body.password, user.passwordHash))) {
      throw unauthorized("Invalid email or password");
    }

    const payload: JwtPayload = {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      teacherType: user.teacherType,
    };

    return ok({
      token: app.jwt.sign(payload, { expiresIn: "7d" }),
      user: {
        ...payload,
        studentProfile: user.studentProfile,
        teacherProfile: user.teacherProfile,
      },
    });
  });

  app.get("/me", { preHandler: app.requireAuth }, async (request) => {
    const authUser = request.user as JwtPayload;
    const user = await prisma.user.findUnique({
      where: { id: authUser.id },
      include: { studentProfile: true, teacherProfile: true },
    });
    return ok(user);
  });

  app.post("/logout", async () => ok({ loggedOut: true }));
}
