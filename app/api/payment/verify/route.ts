import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import prisma from "@/lib/prisma";
import { z } from "zod";

const verifyPaymentSchema = z.object({
  razorpay_payment_id: z.string(),
  razorpay_order_id: z.string(),
  razorpay_signature: z.string(),
});

export const POST = async (req: NextRequest) => {
  try {
    const body = await req.json();
    const parsed = verifyPaymentSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid input", success: false }, { status: 400 });
    }

    const { razorpay_payment_id, razorpay_order_id, razorpay_signature } = parsed.data;

    const secret = process.env.RAZORPAY_KEY_SECRET;
    if (!secret) {
      throw new Error("RAZORPAY_KEY_SECRET is not defined");
    }

    const hmac = crypto.createHmac("sha256", secret);
    hmac.update(razorpay_order_id + "|" + razorpay_payment_id);
    const generatedSignature = hmac.digest("hex");

    if (generatedSignature !== razorpay_signature) {
      return NextResponse.json({ error: "Invalid signature", success: false }, { status: 400 });
    }

    const order = await prisma.order.findUnique({
      where: { razorPayOrderId: razorpay_order_id },
    });

    if (!order) {
      return NextResponse.json({ error: "Order not found", success: false }, { status: 404 });
    }

    if (order.status !== "pending") {
      return NextResponse.json({ error: "Order is already processed", success: false }, { status: 400 });
    }

    // Update order status
    await prisma.order.update({
      where: { razorPayOrderId: razorpay_order_id },
      data: {
        status: "successful",
        razorPayPaymentId: razorpay_payment_id,
      },
    });

    // Add credits to user
    await prisma.user.update({
      where: { id: order.userId },
      data: {
        credits: {
          increment: order.creditsAdded,
        },
      },
    });

    return NextResponse.json({ success: true, message: "Payment verified successfully" });
  } catch (error) {
    console.error("Error verifying razorpay payment:", error);
    return NextResponse.json({ error: "Internal server error", success: false }, { status: 500 });
  }
};
