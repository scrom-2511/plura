import { NextRequest, NextResponse } from "next/server";
import { razorpay } from "@/lib/razorpay";
import prisma from "@/lib/prisma";
import { z } from "zod";

const createOrderSchema = z.object({
  userId: z.string(),
  amount: z.number().min(1), // amount in INR
  credits: z.number().min(1),
});

export const POST = async (req: NextRequest) => {
  try {
    const body = await req.json();
    const parsed = createOrderSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid input", success: false }, { status: 400 });
    }

    const { userId, amount, credits } = parsed.data;

    const options = {
      amount: amount * 100, // amount in smallest currency unit (paise)
      currency: "INR",
      receipt: `receipt_${Date.now()}`,
    };

    const order = await razorpay.orders.create(options);

    if (!order) {
      return NextResponse.json({ error: "Failed to create order", success: false }, { status: 500 });
    }

    await prisma.order.create({
      data: {
        razorPayOrderId: order.id,
        amount: amount,
        status: "pending",
        creditsAdded: credits,
        userId: userId,
      },
    });

    return NextResponse.json({
      success: true,
      data: {
        id: order.id,
        currency: order.currency,
        amount: order.amount,
      },
    });
  } catch (error) {
    console.error("Error creating razorpay order:", error);
    return NextResponse.json({ error: "Internal server error", success: false }, { status: 500 });
  }
};
