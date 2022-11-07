import { prisma } from "../lib/prisma";

import { FastifyInstance } from "fastify";

export async function userRoutes(app: FastifyInstance) {
  app.get("/count", async () => {
    return prisma.user
      .count()
      .then((count) => {
        return { count };
      })
      .catch((error) => {
        console.error(error);
        return { error };
      });
  });
}
