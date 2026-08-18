import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { z } from "zod";

const conversationsSchema = z.object({
  chatId: z.string().min(1),
  userId: z.string().min(1),
});

export const POST = async (req: NextRequest): Promise<NextResponse> => {
  try {
    const body = await req.json();
    const parsed = conversationsSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid input", success: false }, { status: 400 });
    }

    const { chatId, userId } = parsed.data;

    const chats = await prisma.conversation.findMany({
      where: {
        chatId,
        userId,
      },
      orderBy: {
        updatedAt: "asc",
      },
    });

    return NextResponse.json({ data: chats, success: true });
  } catch (error) {
    console.error("Error fetching conversations:", error);

    return NextResponse.json({ error: "Something went wrong", success: false }, { status: 500 });
  }
};
