import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export const POST = async (req: NextRequest): Promise<NextResponse> => {
  const { chatUUID } = await req.json();

  if (!chatUUID || typeof chatUUID !== "string") {
    return NextResponse.json(
      { error: "Invalid or missing 'chatUUID'", success: false },
      { status: 400 }
    );
  }

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
