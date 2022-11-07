import { z } from "zod";

import { prisma } from "../lib/prisma";

import { auth } from "../plugins/auth";

import { FastifyInstance } from "fastify";

export async function guessRoutes(app: FastifyInstance) {
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

  app.post(
    "/polls/:pollId/games/:gameId/guesses",
    { onRequest: [auth] },
    async (request, reply) => {
      const createGuessParams = z.object({
        pollId: z.string(),
        gameId: z.string(),
      });

      const createGuessBody = z.object({
        firstTeamPoints: z.number(),
        secondTeamPoints: z.number(),
      });

      const { pollId, gameId } = createGuessParams.parse(request.params);
      const { firstTeamPoints, secondTeamPoints } = createGuessBody.parse(
        request.body
      );

      const participant = await prisma.participant.findUnique({
        where: {
          pollId_userId: {
            userId: request.user.sub,
            pollId,
          },
        },
      });

      if (!participant) {
        return reply.status(404).send({ message: "Participant not found" });
      }

      const guess = await prisma.guess.findUnique({
        where: {
          gameId_participantId: {
            participantId: participant.id,
            gameId,
          },
        },
      });

      if (guess) {
        return reply.status(409).send({ message: "Guess already exists" });
      }

      const game = await prisma.game.findUnique({
        where: {
          id: gameId,
        },
      });

      if (!game) {
        return reply.status(404).send({ message: "Game not found" });
      }

      if (game.date < new Date()) {
        return reply.status(409).send({ message: "Game already started" });
      }

      await prisma.guess.create({
        data: {
          gameId,
          firstTeamPoints,
          secondTeamPoints,
          participantId: participant.id,
        },
      });

      return reply.status(201).send();
    }
  );
}
