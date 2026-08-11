import axios from "axios";
import { ApiResponse } from "@/types/types";
import { OptionsMenu } from "../zustand/store";

export const deleteChat = async (options: OptionsMenu): Promise<ApiResponse<void>> => {
  if (!options || typeof options.componentID !== "string") {
    console.warn(`Skipping API call: invalid options provided: ${JSON.stringify(options)}`);
    return {
      success: false,
      data: null,
      error: "Invalid parameters: componentID must be a string",
    };
  }

  try {
    await axios.post("http://localhost:3000/api/deleteChat", { chatUUID: options.componentID }, { withCredentials: true });

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
