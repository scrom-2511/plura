import { Conversation } from "@/generated/prisma/client";
import z from "zod";

export enum ModelTypes {
  GPT = "openai/gpt-oss-20b:free",
  GEMINI = "google/gemini-3.5-flash-lite",
  META = "meta-llama/llama-3.1-8b-instruct",
}

export const modelFieldMap: Record<ModelTypes, keyof Conversation> = {
  [ModelTypes.GPT]: "gpt",
  [ModelTypes.GEMINI]: "gemini",
  [ModelTypes.META]: "meta",
};

export type Message = {
  prompt: string;
  response: string;
};

export type ConversationEntry = {
  id: string;
  conversationId: string;
  prompt: string;
  gpt: string | null;
  gemini: string | null;
  meta: string | null;
  userId: string;
  chatId: string;
  createdAt: string;
  updatedAt: string;
};

export interface ApiResponse<T> {
  success: boolean;
  data: T | null;
  error?: any;
}

export const aiModelSchema = z.object({
  prompt: z.string().min(1, "Prompt cannot be empty"),
  userId: z.string().min(1, "User ID cannot be empty"),
  conversationId: z.string().min(1, "Conversation ID cannot be empty"),
  chatId: z.string().min(1, "Chat ID cannot be empty"),
})