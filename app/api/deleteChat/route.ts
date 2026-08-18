import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { z } from "zod";

const deleteChatSchema = z.object({
  chatUUID: z.string().min(1),
});

export const POST = async (req: NextRequest): Promise<NextResponse> => {
  const body = await req.json();
  const parsed = deleteChatSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid or missing 'chatUUID'", success: false },
      { status: 400 }
    );
  }

  const { chatUUID } = parsed.data;

  try {
    const deletedChat = await prisma.chat.update({
      where: { chatUUID },
      data: { deleted: true },
    });

    return NextResponse.json({ data: deletedChat, success: true });
  } catch (error) {
    console.error("Error updating chat:", error);

    return NextResponse.json(
      { error: "Failed to delete chat", success: false },
      { status: 500 }
    );
  }
};
