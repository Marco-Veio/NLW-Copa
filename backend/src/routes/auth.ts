import { z } from "zod";

import { prisma } from "../lib/prisma";
import { api } from "../lib/axios";

import { auth } from "../plugins/auth";

import { FastifyInstance } from "fastify";

export async function authRoutes(app: FastifyInstance) {
  app.get(
    "/me",
    {
      onRequest: [auth],
    },
    async (request) => {
      return { user: request.user };
    }
  );

  app.post("/users", async (request) => {
    const createUserBody = z.object({
      access_token: z.string(),
    });

    const { access_token } = createUserBody.parse(request.body);

    const userData = await api.get("/userinfo", {
      headers: {
        Authorization: `Bearer ${access_token}`,
      },
    });

    const userInfoSchema = z.object({
      id: z.string(),
      email: z.string().email(),
      name: z.string(),
      picture: z.string().url(),
    });

    const userInfo = userInfoSchema.parse(userData.data);

    let user = await prisma.user.findUnique({
      where: {
        googleId: userInfo.id,
      },
    });

    if (!user) {
      user = await prisma.user.create({
        data: {
          googleId: userInfo.id,
          email: userInfo.email,
          name: userInfo.name,
          avatarUrl: userInfo.picture,
        },
      });
    }

    const token = app.jwt.sign(
      { name: user.name, avatarUrl: user.avatarUrl },
      { sub: user.id, expiresIn: "7 days" }
    );

    return { token };
  });
}
