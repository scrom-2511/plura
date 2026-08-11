import { NextResponse } from "next/server";
import { prisma } from "@/app/api/lib/prisma";

export const POST = async (req: Request): Promise<NextResponse> => {
  try {
    // Parse and validate input
    const { email, username, password } = await req.json();

    if (
      typeof email !== "string" ||
      typeof username !== "string" ||
      typeof password !== "string"
    ) {
      return NextResponse.json(
        { message: "Missing or invalid required fields" },
        { status: 400 }
      );
    }

    // Create new user in the database
    await prisma.user.create({
      data: { email, username, password },
    });

    // Return successful response
    return NextResponse.json(
      { message: "Signup Successful", success: true },
      { status: 201 }
    );
  } catch (error) {
    // Handle server errors
    console.error("Signup Error:", error);
    return NextResponse.json(
      { message: "Internal Server Error", success: false },
      { status: 500 }
    );
  }
};
