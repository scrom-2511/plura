import { Conversation } from "@/app/generated/prisma/client";
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
  id: number;
  conversationID: string;
  prompt: string;
  gpt: string | null;
  gemini: string | null;
  meta: string | null;
  userID: number;
  chatID: string;
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
  userID: z.number().min(1, "User ID cannot be empty"),
  conversationID: z.string().min(1, "Conversation ID cannot be empty"),
  chatID: z.string().min(1, "Chat ID cannot be empty"),
})