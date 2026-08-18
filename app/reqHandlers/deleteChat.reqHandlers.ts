import axios from "axios";
import { ApiResponse } from "@/types/types";
import { OptionsMenu } from "../zustand/store";
import { z } from "zod";

const deleteChatSchema = z.object({
  componentID: z.string(),
});

export const deleteChat = async (options: OptionsMenu): Promise<ApiResponse<void>> => {
  const validation = deleteChatSchema.safeParse(options);

  if (!validation.success) {
    return {
      success: false,
      data: null,
      error: "Invalid parameters: componentID must be a string",
    };
  }

  try {
    await axios.post("/api/deleteChat", { chatUUID: options.componentID }, { withCredentials: true });

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
