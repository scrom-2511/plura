import { Message, modelFieldMap, ModelTypes } from "@/types/types";
import { prisma } from "../lib/prisma";
import { client, connectClient } from "./redisClient.utils";

export const contextProvider = async (
  userID: number,
  model: ModelTypes,
  chatID: string
): Promise<string | null> => {
  // Input validation
  if (!userID || !model || !chatID) {
    throw new Error("Invalid parameters: userID, model, and chatID are required");
  }

  // Connect to the redis client if not already connected.
  await connectClient();

  // Compose cache key using user, model, and chat identifiers
  const cacheKey = `${userID}:${model}:${chatID}`;

  // Try fetching cached data from Redis
  const cached = await client.get(cacheKey);
  if (cached) return cached;

  // Fetch latest 20 conversation entries from database for the user, model, and chat
  const data = await prisma.conversation.findMany({
    where: {
      chatID,
      userID,
      [modelFieldMap[model]]: { not: null }, // Ensure the relevant model field is not null
    },
    orderBy: { updatedAt: "desc" },
    take: 20,
  });

  // Return null if no conversation data found
  if (!data || data.length === 0) {
    return null;
  }

  // Build context array with prompt-response pairs for the selected model
  const contextArr: Message[] = [];
  for (const d of data) {
    contextArr.push({ prompt: d.prompt, response: d[modelFieldMap[model]] as string });
  }

  // Reverse to have oldest first
  contextArr.reverse();

  // Cache the serialized context array in Redis for future quick access
  await client.set(cacheKey, JSON.stringify(contextArr));

  return JSON.stringify(contextArr);
};

/**
 * Updates the cached conversation context by adding a new message.
 *
 * @param {number} userID - The ID of the user.
 * @param {string | null} context - Current cached context as JSON string or null.
 * @param {ModelTypes} model - The model type.
 * @param {Message} conversation - New conversation message to add.
 * @param {string} chatID - The chat session ID.
 * @returns {Promise<void>}
 */
export const contextSetter = async (
  userID: number,
  context: string | null,
  model: ModelTypes,
  conversation: Message,
  chatID: string
): Promise<void> => {
  // Input validation
  if (!userID || !model || !chatID) {
    throw new Error("Invalid parameters: userID, model, and chatID are required");
  }
  if (!conversation || typeof conversation !== "object") {
    throw new Error("Invalid conversation parameter");
  }

  // Connect to the redis client if not already connected.
  await connectClient();

  const cacheKey = `${userID}:${model}:${chatID}`;

  if (!context) {
    // No existing context, initialize cache with the single conversation
    await client.set(cacheKey, JSON.stringify([conversation]));
  } else {
    // Parse existing cached context
    const existingData: Array<Message> = JSON.parse(context);

    // Keep max 20 messages by removing the oldest if exceeded
    if (existingData.length >= 20) {
      existingData.shift();
    }

    // Add new conversation message
    existingData.push(conversation);

    // Update Redis cache with the new conversation list
    await client.set(cacheKey, JSON.stringify(existingData));
  }
};
