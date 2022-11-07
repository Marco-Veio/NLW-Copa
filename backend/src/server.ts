import fastify from "fastify";
import cors from "@fastify/cors";
import jwt from "@fastify/jwt";

import { authRoutes } from "./routes/auth";
import { gameRoutes } from "./routes/game";
import { guessRoutes } from "./routes/guess";
import { pollRoutes } from "./routes/poll";
import { userRoutes } from "./routes/user";

async function bootstrap() {
  const app = fastify({ logger: true });

  await app.register(cors, { origin: true });
  await app.register(jwt, { secret: process.env.JWT_SECRET! });

  await app.register(authRoutes);
  await app.register(gameRoutes);
  await app.register(guessRoutes);
  await app.register(pollRoutes, { prefix: "/polls" });
  await app.register(userRoutes, { prefix: "/users" });

  await app.listen({
    port: 3333,
    host: "0.0.0.0",
  });
}

bootstrap();
