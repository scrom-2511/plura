import { ApiResponse } from "@/types/types";
import axios from "axios";

export const chatHistory = async (userID: number, page: number): Promise<ApiResponse<any>> => {
  if (typeof userID !== "number" || userID <= 0 || typeof page !== "number" || page <= 0) {
    console.warn(`Skipping API call: invalid parameters userID=${userID}, page=${page}`);
    return { success: false, data: null, error: "Invalid parameters" };
  }

  try {
    const res = await axios.post("http://localhost:3000/api/chatHistory", {
      userID,
      page,
    });

    return { success: true, data: res.data };
  } catch (error) {
    console.error("AxiosError:", error);
    return { success: false, data: null, error };
  }
};
