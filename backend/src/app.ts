import Fastify from "fastify";
import { env } from "./config/env";
import { registerAuth } from "./plugins/auth";
import { registerErrorHandler } from "./plugins/errorHandler";
import { registerMultipart } from "./plugins/multipart";
import { registerSecurity } from "./plugins/cors";
import { registerSwagger } from "./plugins/swagger";
import { healthRoutes } from "./modules/health/routes";
import { authRoutes } from "./modules/auth/routes";
import { userRoutes } from "./modules/users/routes";
import { academicSeasonRoutes } from "./modules/academicSeasons/routes";
import { degreeTypeRoutes } from "./modules/degreeTypes/routes";
import { thesisRoutes } from "./modules/theses/routes";
import { thesisFileRoutes } from "./modules/thesisFiles/routes";
import { critiqueGroupRoutes } from "./modules/critiqueGroups/routes";
import { scheduleRoutes } from "./modules/schedules/routes";
import { defenseRoutes } from "./modules/defenses/routes";
import { critiqueRoutes } from "./modules/critiques/routes";
import { statisticsRoutes } from "./modules/statistics/routes";
import { dashboardRoutes } from "./modules/dashboard/routes";

export async function buildApp() {
  const app = Fastify({
    logger: { level: env.logLevel },
    bodyLimit: 100 * 1024 * 1024,
  });

  registerErrorHandler(app);
  await registerSecurity(app);
  await registerAuth(app);
  await registerMultipart(app);
  await registerSwagger(app);

  await app.register(healthRoutes);
  await app.register(authRoutes, { prefix: "/api/auth" });
  await app.register(userRoutes, { prefix: "/api" });
  await app.register(academicSeasonRoutes, { prefix: "/api" });
  await app.register(degreeTypeRoutes, { prefix: "/api" });
  await app.register(thesisRoutes, { prefix: "/api" });
  await app.register(thesisFileRoutes, { prefix: "/api" });
  await app.register(critiqueGroupRoutes, { prefix: "/api" });
  await app.register(scheduleRoutes, { prefix: "/api" });
  await app.register(defenseRoutes, { prefix: "/api" });
  await app.register(critiqueRoutes, { prefix: "/api" });
  await app.register(statisticsRoutes, { prefix: "/api" });
  await app.register(dashboardRoutes, { prefix: "/api" });

  return app;
}
