import { NextRequest, NextResponse } from "next/server";
import { prisma } from "../lib/prisma";

export const POST = async (req: NextRequest): Promise<NextResponse> => {
  // Parse and validate input
  const { chatUUID } = await req.json();

  // Input validation: Ensure chatUUID is a non-empty string
  if (!chatUUID || typeof chatUUID !== "string") {
    return NextResponse.json(
      { error: "Invalid or missing 'chatUUID'", success: false },
      { status: 400 }
    );
  }

  try {
    // Update chat record to soft-delete
    const deletedChat = await prisma.chat.update({
      where: { chatUUID },
      data: { deleted: true },
    });

    // Return success response
    return NextResponse.json({ data: deletedChat, success: true });

  } catch (error) {
    // Handle errors during DB operation
    console.error("Error updating chat:", error);

    return NextResponse.json(
      { error: "Failed to delete chat", success: false },
      { status: 500 }
    );
  }
};
