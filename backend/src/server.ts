import fastify from "fastify";
import cors from "@fastify/cors";
import { z } from "zod";
import shortUniqueId from "short-unique-id";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient({ log: ["query"] });

async function bootstrap() {
  const app = fastify({ logger: true });

  await app.register(cors, { origin: true });

  app.get("/pools/count", async () => {
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

  app.post("/pools", async (request, reply) => {
    const createPoolBody = z.object({
      title: z.string(),
    });

    const { title } = createPoolBody.parse(request.body);

    const generatedId = new shortUniqueId({ length: 6 });

    const pool = await prisma.pool.create({
      data: {
        title,
        code: String(generatedId()).toUpperCase(),
      },
    });

    return reply.status(201).send(pool);
  });

  app.get("/users/count", async () => {
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

  app.get("/guesses/count", async () => {
    return prisma.guess
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
