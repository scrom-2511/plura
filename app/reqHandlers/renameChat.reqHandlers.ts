import axios from "axios";
import { ApiResponse } from "@/types/types";
import { OptionsMenu } from "../zustand/store";

export const renameChat = async (options: OptionsMenu, newName: string): Promise<ApiResponse<void>> => {
  if (!options || typeof options.componentID !== "string" || typeof newName !== "string" || newName.trim().length === 0) {
    console.warn(`Skipping API call: invalid parameters provided. componentID=${options?.componentID}, newName=${newName}`);
    return {
      success: false,
      data: null,
      error: "Invalid parameters: componentID and newName are required.",
    };
  }

  try {
    await axios.post(
      "http://localhost:3000/api/renameChat",
      {
        chatUUID: options.componentID,
        newName,
      },
      { withCredentials: true }
    );

    return {
      success: true,
      data: null,
    };
  } catch (error) {
    console.error("AxiosError:", error);
    return {
      success: false,
      data: null,
      error,
    };
  }
};
