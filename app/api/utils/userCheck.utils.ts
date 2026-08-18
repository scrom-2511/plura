import prisma from "@/lib/prisma";
import { client, connectClient } from "./redisClient.utils";

export const userCheck = async (userId: string): Promise<boolean> => {
  try {
    const isRedisConnected = await connectClient();
    const key = `user:${userId}`;

    if (isRedisConnected) {
      try {
        const cachedUser = await client.get(key);
        if (cachedUser !== null && cachedUser !== undefined) {
          return JSON.parse(cachedUser) === true;
        }
      } catch (e) {
        console.warn("Redis get user failed:", e);
      }
    }

    let userFromDB = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!userFromDB) {
      userFromDB = await prisma.user.create({
        data: {
          id: userId,
          username: "User",
          email: `${userId}@example.com`,
          password: "password",
          premium: true,
        },
      });
    }

    if (isRedisConnected) {
      try {
        await client.set(key, JSON.stringify(userFromDB.premium), {
          expiration: { type: "EX", value: 300 }, // 300 seconds = 5 minutes
        });
      } catch (e) {
        console.warn("Redis set user failed:", e);
      }
    }

    return true;
  } catch (error) {
    console.error("Error checking user:", error);
    return true;
  }
};
