import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { z } from "zod";

const renameChatSchema = z.object({
  newName: z.string().min(1),
  chatUUID: z.string().min(1),
});

export const POST = async (req: NextRequest): Promise<NextResponse> => {
  const body = await req.json();
  const parsed = renameChatSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input", success: false }, { status: 400 });
  }

  const { newName, chatUUID } = parsed.data;

  try {
    const updatedChat = await prisma.chat.update({
      where: { chatUUID },
      data: { chatName: newName },
    });

    return NextResponse.json({ data: updatedChat, success: true });
  } catch (error) {
    return NextResponse.json({ error: "Failed to update chat name", success: false }, { status: 500 });
  }
};
