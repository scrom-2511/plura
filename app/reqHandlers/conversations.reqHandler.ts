import { ApiResponse } from "@/types/types";
import axios from "axios";

export const conversations = async (
  userID: number,
  chatID: string
): Promise<ApiResponse<any>> => {
  // Input validation: check userID is a positive number and chatID is a non-empty string
  if (
    typeof userID !== "number" ||
    userID <= 0 ||
    typeof chatID !== "string" ||
    chatID.trim() === ""
  ) {
    console.warn(
      `Skipping API call: invalid parameters userID=${userID}, chatID='${chatID}'`
    );
    return { success: false, data: null, error: "Invalid parameters" };
  }

  try {
    // Make POST request to conversations API endpoint with provided parameters
    const res = await axios.post("http://localhost:3000/api/conversations", {
      userID,
      chatID,
    });

    // Return success response with received data
    return { success: true, data: res.data };
  } catch (error) {
    // Log error and return failure response with error details
    console.error("Request failed in conversations:", error);
    return { success: false, data: null, error };
  }
};
