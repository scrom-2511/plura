import axios from "axios";
import { ApiResponse } from "@/types/types";
import { OptionsMenu } from "../zustand/store";
import { z } from "zod";

const renameChatSchema = z.object({
  options: z.object({
    componentID: z.string(),
  }),
  newName: z.string().trim().min(1),
});

export const renameChat = async (options: OptionsMenu, newName: string): Promise<ApiResponse<void>> => {
  const validation = renameChatSchema.safeParse({ options, newName });
  if (!validation.success) {
    return {
      success: false,
      data: null,
      error: "Invalid parameters: componentID and newName are required.",
    };
  }

  try {
    await axios.post("/api/renameChat",
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
