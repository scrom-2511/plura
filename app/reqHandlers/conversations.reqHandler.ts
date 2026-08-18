import { ApiResponse } from "@/types/types";
import axios from "axios";
import { z } from "zod";

const conversationsSchema = z.object({
  userId: z.string().min(1),
  chatId: z.string().trim().min(1),
});

export const conversations = async (
  userId: string,
  chatId: string
): Promise<ApiResponse<any>> => {
  const validation = conversationsSchema.safeParse({ userId, chatId });

  if (!validation.success) {
    return { success: false, data: null, error: "Invalid parameters" };
  }

  try {
    const res = await axios.post("/api/conversations", {
      userId,
      chatId,
    });

    return { success: true, data: res.data };
  } catch (error) {
    console.error("Request failed in conversations:", error);
    return { success: false, data: null, error };
  }
};
