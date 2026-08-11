import { NextRequest, NextResponse } from "next/server";
import { prisma } from "../lib/prisma";

export const POST = async (req: NextRequest): Promise<NextResponse> => {
  // Parse JSON body to extract userID and page number
  const { userID, page } = await req.json();

  // Input validation: Ensure userID exists and page is a valid positive number
  if (!userID || typeof page !== "number" || page < 1) {
    return NextResponse.json({ error: "Invalid input", success: false }, { status: 400 });
  }

  // Fetch chat history from the database with pagination and ordering
  const chatHistory = await prisma.chat.findMany({
    where: { userID, deleted: false },
    select: {
      chatName: true,
      chatUUID: true,
    },
    orderBy: {
      updatedAt: "desc",
    },
    skip: (page - 1) * 10, // Calculate offset for pagination
    take: 10, // Limit results to 10 per page
  });

  // Return the fetched chat history with a success flag
  return NextResponse.json({ data: chatHistory, success: true });
};
