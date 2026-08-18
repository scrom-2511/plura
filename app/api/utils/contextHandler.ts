import { Message, modelFieldMap, ModelTypes } from "@/types/types";
import prisma from "@/lib/prisma";
import { client, connectClient } from "./redisClient.utils";

export const contextProvider = async (
  userId: string,
  model: ModelTypes,
  chatId: string
): Promise<string | null> => {
  if (!userId || !model || !chatId) {
    throw new Error("Invalid parameters: userId, model, and chatId are required");
  }

  const isRedisConnected = await connectClient();
  const cacheKey = `${userId}:${model}:${chatId}`;

  if (isRedisConnected) {
    try {
      const cached = await client.get(cacheKey);
      if (cached) return cached;
    } catch (e) {
      console.warn("Redis get context failed:", e);
    }
  }

  const data = await prisma.conversation.findMany({
    where: {
      chatId,
      userId,
      [modelFieldMap[model]]: { not: null },
    },
    orderBy: { updatedAt: "desc" },
    take: 20,
  });

  if (!data || data.length === 0) {
    return null;
  }

  const contextArr: Message[] = [];
  for (const d of data) {
    contextArr.push({ prompt: d.prompt, response: d[modelFieldMap[model] as keyof typeof d] as string });
  }

  contextArr.reverse();

  if (isRedisConnected) {
    try {
      await client.set(cacheKey, JSON.stringify(contextArr));
    } catch (e) {
      console.warn("Redis set context failed:", e);
    }
  }

  return JSON.stringify(contextArr);
};

export const contextSetter = async (
  userId: string,
  context: string | null,
  model: ModelTypes,
  conversation: Message,
  chatId: string
): Promise<void> => {
  if (!userId || !model || !chatId) {
    throw new Error("Invalid parameters: userId, model, and chatId are required");
  }
  if (!conversation || typeof conversation !== "object") {
    throw new Error("Invalid conversation parameter");
  }

  const isRedisConnected = await connectClient();
  const cacheKey = `${userId}:${model}:${chatId}`;

  let newContext: Message[] = [];
  if (!context) {
    newContext = [conversation];
  } else {
    try {
      const existingData: Array<Message> = typeof context === "string" ? JSON.parse(context) : context;
      if (existingData.length >= 20) {
        existingData.shift();
      }
      existingData.push(conversation);
      newContext = existingData;
    } catch (e) {
      newContext = [conversation];
    }
  }

  if (isRedisConnected) {
    try {
      await client.set(cacheKey, JSON.stringify(newContext));
    } catch (e) {
      console.warn("Redis set context failed:", e);
    }
  }
};
