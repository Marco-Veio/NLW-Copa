import fastify from "fastify";
import cors from "@fastify/cors";

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient({ log: ["query"] });

async function bootstrap() {
  const app = fastify({ logger: true });

  await app.register(cors, { origin: true });

  app.get("/pools/count", async (request, reply) => {
    return prisma.pool
      .count()
      .then((count) => {
        return { count };
      })
      .catch((error) => {
        console.error(error);
        return { error };
      });
  });

  await app.listen({
    port: 3333,
    // host: "0.0.0.0"
  });
}

bootstrap();
