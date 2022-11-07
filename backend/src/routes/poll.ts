import { z } from "zod";
import shortUniqueId from "short-unique-id";

import { prisma } from "../lib/prisma";

import { auth } from "../plugins/auth";

import { FastifyInstance } from "fastify";

export async function pollRoutes(app: FastifyInstance) {
  app.get("/count", async () => {
    return prisma.poll
      .count()
      .then((count) => {
        return { count };
      })
      .catch((error) => {
        console.error(error);
        return { error };
      });
  });

  app.post("/", async (request, reply) => {
    const createPollBody = z.object({
      title: z.string(),
    });

    const { title } = createPollBody.parse(request.body);

    const generatedId = new shortUniqueId({ length: 6 });
    const code = String(generatedId()).toUpperCase();

    try {
      await request.jwtVerify();

      await prisma.poll.create({
        data: {
          title,
          code,
          ownerId: request.user.sub,
          participants: {
            create: {
              userId: request.user.sub,
            },
          },
        },
      });
    } catch (error) {
      await prisma.poll.create({
        data: {
          title,
          code,
        },
      });
    }

    return reply.status(201).send({ code });
  });

  app.post("/join", { onRequest: [auth] }, async (request, reply) => {
    const joinPollBody = z.object({
      code: z.string(),
    });

    const { code } = joinPollBody.parse(request.body);

    const poll = await prisma.poll.findUnique({
      where: {
        code,
      },
      include: {
        participants: {
          where: {
            userId: request.user.sub,
          },
        },
      },
    });

    if (!poll) {
      return reply.status(404).send({ error: "Poll not found" });
    }

    if (poll.participants.length) {
      return reply.status(400).send({ error: "Already joined" });
    }

    if (!poll.ownerId) {
      await prisma.poll.update({
        where: {
          id: poll.id,
        },
        data: {
          ownerId: request.user.sub,
        },
      });
    }

    await prisma.participant.create({
      data: {
        userId: request.user.sub,
        pollId: poll.id,
      },
    });

    return reply.status(201).send();
  });

  app.get("/", { onRequest: [auth] }, async (request, reply) => {
    const polls = await prisma.poll.findMany({
      where: {
        participants: {
          some: {
            userId: request.user.sub,
          },
        },
      },
      include: {
        _count: {
          select: {
            participants: true,
          },
        },
        participants: {
          select: {
            id: true,
            user: {
              select: {
                avatarUrl: true,
              },
            },
          },
          take: 4,
        },
        owner: {
          select: {
            name: true,
            id: true,
          },
        },
      },
    });

    return polls;
  });

  app.get("/:id", { onRequest: [auth] }, async (request, reply) => {
    const getPollParams = z.object({
      id: z.string(),
    });

    const { id } = getPollParams.parse(request.params);

    const poll = await prisma.poll.findUnique({
      where: {
        id,
      },
      include: {
        _count: {
          select: {
            participants: true,
          },
        },
        participants: {
          select: {
            id: true,
            user: {
              select: {
                avatarUrl: true,
              },
            },
          },
          take: 4,
        },
        owner: {
          select: {
            name: true,
            id: true,
          },
        },
      },
    });

    return { poll };
  });
}
