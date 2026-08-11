import axios from "axios";
import { ApiResponse } from "@/types/types";
import { OptionsMenu } from "../zustand/store";

export const deleteChat = async (options: OptionsMenu): Promise<ApiResponse<void>> => {
  // Input validation: Ensure options and componentID are valid
  if (!options || typeof options.componentID !== "string") {
    console.warn(`Skipping API call: invalid options provided: ${JSON.stringify(options)}`);
    return {
      success: false,
      data: null,
      error: "Invalid parameters: componentID must be a string",
    };
  }

  try {
    // Make POST request to deleteChat API endpoint with chatID
    await axios.post("http://localhost:3000/api/deleteChat", { chatUUID: options.componentID }, { withCredentials: true });

    // Return success response with no data
    return {
      success: true,
      data: null,
    };
  } catch (error) {
    // Log error and return failure response with error details
    console.error("AxiosError:", error);
    return {
      success: false,
      data: null,
      error,
    };
  }
};
