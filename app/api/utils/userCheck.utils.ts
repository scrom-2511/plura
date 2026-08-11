import prisma from "@/lib/prisma";
import { client, connectClient } from "./redisClient.utils";

export const userCheck = async (userID: number): Promise<boolean> => {
  try {
    await connectClient();

    const key = `user:${userID}`;

    const cachedUser = await client.get(key);

    if (!cachedUser) {
      const userFromDB = await prisma.user.findUnique({
        where: { id: userID },
      });

      if (!userFromDB) {
        throw new Error(`User with ID ${userID} not found.`);
      }

      await client.set(key, JSON.stringify(userFromDB.premium), {
        expiration: { type: "EX", value: 300 }, // 300 seconds = 5 minutes
      });

      return userFromDB.premium;
    } else {
      return JSON.parse(cachedUser) as boolean;
    }
  } catch (error) {
    // Error handling: Log and throw an error if something goes wrong
    console.error("Error checking user:", error);
    throw new Error("Failed to check user premium status.");
  }
};
