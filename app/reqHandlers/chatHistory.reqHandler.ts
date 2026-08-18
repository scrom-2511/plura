import { ApiResponse } from "@/types/types";
import axios from "axios";
import { z } from "zod";

const chatHistorySchema = z.object({
  userId: z.string().min(1),
  page: z.number().positive(),
});

export const chatHistory = async (userId: string, page: number): Promise<ApiResponse<any>> => {
  const validation = chatHistorySchema.safeParse({ userId, page });
  if (!validation.success) {
    console.warn(`Skipping API call: invalid parameters userId=${userId}, page=${page}`);
    return { success: false, data: null, error: "Invalid parameters" };
  }

  try {
    const res = await axios.post("/api/chatHistory", {
      userId,
      page,
    });

    return { success: true, data: res.data };
  } catch (error) {
    console.error("AxiosError:", error);
    return { success: false, data: null, error };
  }
};
