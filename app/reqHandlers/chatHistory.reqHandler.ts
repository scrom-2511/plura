import { ApiResponse } from "@/types/types";
import axios from "axios";

export const chatHistory = async (userID: number, page: number): Promise<ApiResponse<any>> => {
  // Input validation: check if userID and page are valid positive numbers
  if (typeof userID !== "number" || userID <= 0 || typeof page !== "number" || page <= 0) {
    console.warn(`Skipping API call: invalid parameters userID=${userID}, page=${page}`);
    return { success: false, data: null, error: "Invalid parameters" };
  }

  try {
    // Make POST request to chatHistory API endpoint with provided parameters
    const res = await axios.post("http://localhost:3000/api/chatHistory", {
      userID,
      page,
    });

    // Return success response with received data
    return { success: true, data: res.data };
  } catch (error) {
    // Log error and return failure response with error details
    console.error("AxiosError:", error);
    return { success: false, data: null, error };
  }
};
