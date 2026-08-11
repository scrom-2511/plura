import { prisma } from "../lib/prisma";
import { client, connectClient } from "./redisClient.utils";

export const userCheck = async (userID: number): Promise<boolean> => {
  try {
    // Step 1: Connect to the Redis client
    await connectClient();

    const key = `user:${userID}`;

    // Step 2: Try to get the user's premium status from Redis cache
    const cachedUser = await client.get(key);

    if (!cachedUser) {
      // Step 3: If the user is not found in the cache, fetch from the database
      const userFromDB = await prisma.user.findUnique({
        where: { id: userID },
      });

      if (!userFromDB) {
        // Handle case where the user does not exist in the database
        throw new Error(`User with ID ${userID} not found.`);
      }

      // Step 4: Cache the user's premium status for 5 minutes
      await client.set(key, JSON.stringify(userFromDB.premium), {
        expiration: { type: "EX", value: 300 }, // 300 seconds = 5 minutes
      });

      // Step 5: Return the premium status of the user from the database
      return userFromDB.premium;
    } else {
      // Step 6: If the user is found in the cache, parse and return the cached premium status
      return JSON.parse(cachedUser) as boolean;
    }
  } catch (error) {
    // Error handling: Log and throw an error if something goes wrong
    console.error("Error checking user:", error);
    throw new Error("Failed to check user premium status.");
  }
};
