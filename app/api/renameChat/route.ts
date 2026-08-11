import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export const POST = async (req: NextRequest): Promise<NextResponse> => {
  const { newName, chatUUID } = await req.json();

  if (typeof newName !== "string" || !newName || typeof chatUUID !== "string" || !chatUUID) {
    return NextResponse.json({ error: "Invalid input", success: false }, { status: 400 });
  }

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
