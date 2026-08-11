import { NextRequest, NextResponse } from "next/server";
import { prisma } from "../lib/prisma";

export const POST = async (req: NextRequest): Promise<NextResponse> => {
  try {
    // Parse request body for chatID and userID
    const { chatID, userID } = await req.json();

    // Validate required inputs
    if (!chatID || !userID) {
      return NextResponse.json({ error: "Invalid input", success: false }, { status: 400 });
    }

    // Query conversations matching chatID and userID, ordered by most recently updated
    const chats = await prisma.conversation.findMany({
      where: {
        chatID,
        userID,
      },
      orderBy: {
        updatedAt: "asc",
      },
    });

    // Return successful response with conversation data
    return NextResponse.json({ data: chats, success: true });
  } catch (error) {
    // Log error details for debugging
    console.error("Error fetching conversations:", error);

    // Return generic error response to client
    return NextResponse.json({ error: "Something went wrong", success: false }, { status: 500 });
  }
};
