import { ApiResponse } from "@/types/types";
import axios from "axios";

export const conversations = async (
  userID: number,
  chatID: string
): Promise<ApiResponse<any>> => {
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
    const res = await axios.post("http://localhost:3000/api/conversations", {
      userID,
      chatID,
    });

    return { success: true, data: res.data };
  } catch (error) {
    console.error("Request failed in conversations:", error);
    return { success: false, data: null, error };
  }
};
