import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export const POST = async (req: NextRequest): Promise<NextResponse> => {
  try {
    const { chatID, userID } = await req.json();

    if (!chatID || !userID) {
      return NextResponse.json({ error: "Invalid input", success: false }, { status: 400 });
    }

    const chats = await prisma.conversation.findMany({
      where: {
        chatID,
        userID,
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
