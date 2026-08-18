import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { z } from "zod";

const chatHistorySchema = z.object({
  userId: z.string().min(1),
  page: z.number().int().min(1),
});

export const POST = async (req: NextRequest): Promise<NextResponse> => {
  const body = await req.json();
  const parsed = chatHistorySchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input", success: false }, { status: 400 });
  }

  const { userId, page } = parsed.data;

  const chatHistory = await prisma.chat.findMany({
    where: { userId, deleted: false },
    select: {
      chatName: true,
      chatUUID: true,
    },
    orderBy: {
      updatedAt: "desc",
    },
    skip: (page - 1) * 10,
    take: 10,
  });

  return NextResponse.json({ data: chatHistory, success: true });
};
