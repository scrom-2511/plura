import { Message, modelFieldMap, ModelTypes } from "@/types/types";
import { contextProvider, contextSetter } from "./contextHandler";
import prisma from "@/lib/prisma";

export const streamModel = async (
  model: ModelTypes,
  controller: ReadableStreamDefaultController,
  prompt: string,
  userID: number,
  apikey: string,
  chatID: string,
  conversationID: string
): Promise<string> => {
  // --- Input validation ---
  if (!model) throw new Error("Model is required");
  if (!controller) throw new Error("ReadableStreamDefaultController is required");
  if (!prompt || typeof prompt !== "string") throw new Error("Valid prompt is required");
  if (!userID || typeof userID !== "number") throw new Error("Valid userID is required");
  if (!apikey || typeof apikey !== "string") throw new Error("Valid apikey is required");
  if (!chatID || typeof chatID !== "string") throw new Error("Valid chatID is required");
  if (!conversationID || typeof conversationID !== "string") throw new Error("Valid conversationID is required");

  // --- Fetch conversation context ---
  const context = await contextProvider(userID, model, chatID);

  // Prepare system message content based on available context
  const systemContent = context
    ? `You are an AI assistant. Use the following context to maintain a natural, continuous flow in our conversation: ${context}. Do not greet me in every response. Avoid phrases like "from the context you provided"—your responses should feel seamless and conversational, as if you already know the context.`
    : "You are an AI assistant";

  console.log("Context:", context);

  // --- API call to openrouter.ai ---
  const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apikey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model,
      messages: [
        { role: "system", content: systemContent },
        { role: "user", content: prompt },
      ],
      stream: true,
      max_tokens: 500,
    }),
  });

  // Get the reader from response body to read streamed data
  const reader = response.body?.getReader();
  if (!reader) {
    throw new Error("Response body is not readable");
  }

  const decoder = new TextDecoder();
  let buffer = "";
  let finalResponse = "";

  try {
    // --- Read stream loop ---
    while (true) {
      const { done, value } = await reader.read();

      // If stream is done, save conversation and return the full response
      if (done) {
        const conversation: Message = { prompt, response: finalResponse };
        await contextSetter(userID, context, model, conversation, chatID);

        // --- Persist chat and conversation to database ---
        try {
          await prisma.chat.upsert({
            where: { chatUUID: chatID },
            update: { updatedAt: new Date() },
            create: { chatUUID: chatID, chatName: "New Chat", userID },
          });

          await prisma.conversation.upsert({
            where: { conversationID },
            update: {
              [modelFieldMap[model]]: finalResponse,
            },
            create: {
              conversationID,
              chatID,
              userID,
              prompt,
              [modelFieldMap[model]]: finalResponse,
            },
          });
        } catch (error) {
          console.error("Failed to save conversation:", error);
        }

        return finalResponse;
      }

      // Decode chunk and append to buffer
      buffer += decoder.decode(value, { stream: true });

      // Process lines in buffer (each line corresponds to a data event)
      while (true) {
        const lineEnd = buffer.indexOf("\n");
        if (lineEnd === -1) break;

        const line = buffer.slice(0, lineEnd).trim();
        buffer = buffer.slice(lineEnd + 1);

        if (line.startsWith("data: ")) {
          const data = line.slice(6);

          // Stream end marker detected
          if (data === "[DONE]") {
            controller.close();
            break;
          }

          try {
            // Parse JSON chunk from stream
            const parsed = JSON.parse(data);
            const content = parsed.choices[0].delta.content;

            // If content exists, enqueue and append to final response
            if (content) {
              console.log("Streaming content:", content);
              controller.enqueue(content);
              finalResponse += content;
            }
          } catch {
            // Ignore invalid JSON chunks silently
          }
        }
      }
    }
  } catch (error) {
    console.error("Error while streaming model response:", error);
    throw error;
  }
};
