import { z } from "zod";

import { prisma } from "../lib/prisma";

import { auth } from "../plugins/auth";

import { FastifyInstance } from "fastify";

export async function gameRoutes(app: FastifyInstance) {
  app.get("/polls/:id/games", { onRequest: [auth] }, async (request) => {
    const getPollGamesParams = z.object({
      id: z.string(),
    });

    const { id } = getPollGamesParams.parse(request.params);

    const games = await prisma.game.findMany({
      orderBy: {
        date: "desc",
      },
      include: {
        guesses: {
          where: {
            participant: {
              userId: request.user.sub,
              pollId: id,
            },
          },
        },
      },
    });

    return {
      games: games.map((game) => {
        return {
          ...game,
          guess: game.guesses.length ? game.guesses[0] : null,
          guesses: undefined,
        };
      }),
    };
  });
}
