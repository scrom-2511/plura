import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

/**
 * Updates the chat name for a specific chat based on chatUUID.
 *
 * @param {NextRequest} req - The incoming request containing JSON body with newName and chatUUID.
 * @returns {Promise<NextResponse>} JSON response indicating success or failure of the update.
 */
export const POST = async (req: NextRequest): Promise<NextResponse> => {
  // Parse JSON body to extract newName and chatUUID
  const { newName, chatUUID } = await req.json();

  // Input validation: Ensure both fields are present and of correct type
  if (typeof newName !== "string" || !newName || typeof chatUUID !== "string" || !chatUUID) {
    return NextResponse.json({ error: "Invalid input", success: false }, { status: 400 });
  }

  try {
    // Update chat name in the database where chatUUID matches
    const updatedChat = await prisma.chat.update({
      where: { chatUUID },
      data: { chatName: newName },
    });

    // Return the updated chat data with a success flag
    return NextResponse.json({ data: updatedChat, success: true });
  } catch (error) {
    // Handle possible errors like chat not found or database issues
    return NextResponse.json({ error: "Failed to update chat name", success: false }, { status: 500 });
  }
};
