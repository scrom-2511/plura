import { ModelTypes } from "@/types/types";
import { NextRequest, NextResponse } from "next/server";
import { streamModel } from "../../utils/streamModel.utils";
import { prisma } from "../../lib/prisma";
import { userCheck } from "../../utils/userCheck.utils";
import { success } from "zod";

export const POST = async (req: NextRequest): Promise<NextResponse> => {
  // Parse request JSON body and validate inputs
  const { prompt, userID, conversationID, chatID } = await req.json();

  if (
    typeof prompt !== "string" ||
    !prompt.trim() ||
    typeof userID !== "number" ||
    typeof conversationID !== "string" ||
    typeof chatID !== "string"
  ) {
    return new NextResponse("Invalid input parameters", { status: 400 });
  }

  // Check if a user is paid or not, if not paid then return
  const user = await userCheck(userID);
  if (!user) {
    return NextResponse.json({ message: "You are not a paid user. Please pay to use our services.", success: false });
  }

  // Create a readable stream to handle streaming model output
  const stream = new ReadableStream({
    async start(controller) {
      try {
        // Stream the model response using provided parameters and API key
        await streamModel(ModelTypes.GPT, controller, prompt, userID, process.env.OPEN_ROUTER_API_KEY1 as string, chatID, conversationID);
      } catch (error) {
        // If an error occurs during streaming, close the stream controller with error
        controller.error(error);
      }
    },
  });

  // Return the streaming response
  return new NextResponse(stream);
};
