import { Message, modelFieldMap, ModelTypes } from "@/types/types";
import { contextProvider, contextSetter } from "./contextHandler";
import prisma from "@/lib/prisma";
import z from "zod";

const streamModelSchema = z.object({
  model: z.nativeEnum(ModelTypes),
  controller: z.any(),
  prompt: z.string(),
  userId: z.string(),
  apikey: z.string(),
  chatId: z.string(),
  conversationId: z.string(),
});

export const streamModel = async (
  model: ModelTypes,
  controller: ReadableStreamDefaultController,
  prompt: string,
  userId: string,
  apikey: string,
  chatId: string,
  conversationId: string
): Promise<string> => {
  const validateData = streamModelSchema.safeParse({
    model,
    controller,
    prompt,
    userId,
    apikey,
    chatId,
    conversationId,
  });

  if (!validateData.success) {
    throw new Error("Invalid data");
  }

  const context = await contextProvider(userId, model, chatId);

  const systemContent = context
    ? `You are an AI assistant. Use the following context to maintain a natural, continuous flow in our conversation: ${context}. Do not greet me in every response. Avoid phrases like "from the context you provided"—your responses should feel seamless and conversational, as if you already know the context. The maximum number of tokens you can use is 1,000, so please make sure the answer is complete within that limit. It should not happen that you provide only a partial answer.`
    : "You are an AI assistant, The maximum number of tokens you can use is 1,000, so please make sure the answer is complete within that limit. It should not happen that you provide only a partial answer.";

  console.log("Context:", context);

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
      max_tokens: 1000,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error(`OpenRouter API Error (${response.status}):`, errorText);
    const encoder = new TextEncoder();
    try { controller.enqueue(encoder.encode("Error getting response")); } catch {}
    try { controller.close(); } catch {}
    return "Error getting response";
  }

  const reader = response.body?.getReader();
  if (!reader) {
    throw new Error("Response body is not readable");
  }

  const decoder = new TextDecoder();
  let buffer = "";
  let finalResponse = "";

  const saveConversationAndReturn = async (res: string) => {
    const conversation: Message = { prompt, response: res };
    await contextSetter(userId, context, model, conversation, chatId);

    try {
      await prisma.chat.upsert({
        where: { chatUUID: chatId },
        update: { updatedAt: new Date() },
        create: { chatUUID: chatId, chatName: "New Chat", userId },
      });

      await prisma.conversation.upsert({
        where: { conversationId },
        update: {
          [modelFieldMap[model]]: res,
        },
        create: {
          conversationId,
          chatId,
          userId,
          prompt,
          [modelFieldMap[model]]: res,
        },
      });

      // Decrement credits
      await prisma.user.update({
        where: { id: userId },
        data: { credits: { decrement: 1 } },
      });
    } catch (error) {
      console.error("Failed to save conversation or decrement credits:", error);
    }
    return res;
  };

  try {
    while (true) {
      const { done, value } = await reader.read();

      if (done) {
        try { controller.close(); } catch {}
        return await saveConversationAndReturn(finalResponse);
      }

      buffer += decoder.decode(value, { stream: true });

      let innerBreak = false;
      while (true) {
        const lineEnd = buffer.indexOf("\n");
        if (lineEnd === -1) break;

        const line = buffer.slice(0, lineEnd).trim();
        buffer = buffer.slice(lineEnd + 1);

        if (line.startsWith("data: ")) {
          const data = line.slice(6);

          if (data === "[DONE]") {
            try { controller.close(); } catch {}
            innerBreak = true;
            break;
          }

          try {
            const parsed = JSON.parse(data);
            const content = parsed.choices[0].delta.content;

            if (content) {
              console.log("Streaming content:", content);
              const encoder = new TextEncoder();
              controller.enqueue(encoder.encode(content));
              finalResponse += content;
            }
          } catch {
          }
        }
      }

      if (innerBreak) {
        return await saveConversationAndReturn(finalResponse);
      }
    }
  } catch (error) {
    console.error("Error while streaming model response:", error);
    try { controller.close(); } catch {}
    throw error;
  }
};
