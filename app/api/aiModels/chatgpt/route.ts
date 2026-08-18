import { aiModelSchema, ModelTypes } from "@/types/types";
import { NextRequest, NextResponse } from "next/server";
import { streamModel } from "../../utils/streamModel.utils";
import { userCheck } from "../../utils/userCheck.utils";

export const POST = async (req: NextRequest): Promise<NextResponse> => {
  const { prompt, userId, conversationId, chatId } = await req.json();

  const validateData = aiModelSchema.safeParse({ prompt, userId, conversationId, chatId });

  if (!validateData.success) return NextResponse.json({ message: "Invalid input parameters", success: false });

  const user = await userCheck(userId);
  if (!user) {
    return NextResponse.json({ message: "You are not a paid user. Please pay to use our services.", success: false });
  }

  const stream = new ReadableStream({
    async start(controller) {
      try {
        await streamModel(ModelTypes.GPT, controller, prompt, userId, process.env.OPENROUTER_KEY_1 as string, chatId, conversationId);
      } catch (error) {
        controller.error(error);
      }
    },
  });

  return new NextResponse(stream);
};
