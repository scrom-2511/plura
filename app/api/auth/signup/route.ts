import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

export const POST = async (req: Request): Promise<NextResponse> => {
  try {
    const { email, username, password } = await req.json();
    console.log("hi there", { email, username });

    await prisma.user.create({
      data: { email, username, password },
    });

    return NextResponse.json(
      { message: "Signup Successful", success: true },
      { status: 201 }
    );
  } catch (error) {
    console.error("Signup Error:", error);
    return NextResponse.json(
      { message: "Internal Server Error", success: false },
      { status: 500 }
    );
  }
};
