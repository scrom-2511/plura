"use client";

import React, { useState } from "react";
import Script from "next/script";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

const plans = [
  {
    name: "Starter",
    credits: 50,
    price: 100, // INR
    description: "Perfect for casual users who want to explore.",
    features: ["50 AI Prompts", "Standard Support", "Access to Basic Models"],
    popular: false,
  },
  {
    name: "Pro",
    credits: 500,
    price: 800, // INR
    description: "For professionals needing frequent AI assistance.",
    features: ["500 AI Prompts", "Priority Support", "Access to Advanced Models", "Faster Response"],
    popular: true,
  },
  {
    name: "Ultimate",
    credits: 2000,
    price: 2500, // INR
    description: "Power users and teams running intensive tasks.",
    features: ["2000 AI Prompts", "24/7 Dedicated Support", "All Models Included", "Maximum Speed"],
    popular: false,
  },
];

export default function CreditsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState<string | null>(null);

  const handlePayment = async (plan: typeof plans[0]) => {
    if (status !== "authenticated") {
      alert("Please sign in to buy credits.");
      router.push("/auth/signin");
      return;
    }

    setLoading(plan.name);

    try {
      const orderRes = await fetch("/api/payment/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: session.user?.id,
          amount: plan.price,
          credits: plan.credits,
        }),
      });
      const orderData = await orderRes.json();

      if (!orderData.success) {
        alert("Failed to create order");
        setLoading(null);
        return;
      }

      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: orderData.data.amount,
        currency: orderData.data.currency,
        name: "Plura AI",
        description: `Buy ${plan.credits} Credits`,
        order_id: orderData.data.id,
        handler: async (response: any) => {
          const verifyRes = await fetch("/api/payment/verify", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_signature: response.razorpay_signature,
            }),
          });
          const verifyData = await verifyRes.json();
          if (verifyData.success) {
            alert(`Payment successful! ${plan.credits} credits added.`);
            router.refresh();
          } else {
            alert("Payment verification failed");
          }
          setLoading(null);
        },
        prefill: {
          name: session.user?.name || "User",
          email: session.user?.email || "",
        },
        theme: {
          color: "#6366f1",
        },
        modal: {
          ondismiss: function () {
            setLoading(null);
          },
        },
      };

      const rzp = new (window as any).Razorpay(options);
      rzp.on("payment.failed", function (response: any) {
        alert("Payment Failed. " + response.error.description);
        setLoading(null);
      });
      rzp.open();
    } catch (error) {
      console.error(error);
      alert("Something went wrong");
      setLoading(null);
    }
  };

  return (
    <div
      className="min-h-screen flex flex-col items-center pt-24 pb-12 px-4 sm:px-6 lg:px-8 font-sans overflow-x-hidden"
      style={{ background: "var(--background)", color: "var(--foreground)" }}
    >
      <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="lazyOnload" />

      {/* Background Soft Glows */}
      <div
        className="absolute inset-0 pointer-events-none"
        aria-hidden="true"
        style={{
          background: `radial-gradient(circle at 20% 30%, var(--accent) 0%, transparent 50%), radial-gradient(circle at 80% 70%, var(--primary) 0%, transparent 50%)`,
          opacity: 0.15,
          filter: "blur(120px)",
        }}
      />

      {/* Header */}
      <div className="text-center max-w-3xl mx-auto mb-16 relative z-10">
        <h1
          className="text-5xl md:text-7xl font-extrabold tracking-tight mb-6 bg-clip-text text-transparent bg-linear-to-r from-accent via-[#9983ef] to-accent"
        >
          Supercharge Your AI
        </h1>
        <p className="text-lg md:text-xl text-neutral-400 font-medium leading-relaxed max-w-2xl mx-auto">
          Get the credits you need to unlock unlimited conversational power. Choose the plan that best fits your ambitions.
        </p>
      </div>

      {/* Pricing Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl w-full relative z-10">
        {plans.map((plan) => (
          <div
            key={plan.name}
            className={`relative flex flex-col p-8 rounded-3xl border transition-all duration-300 hover:scale-[1.02] hover:shadow-xl group`}
            style={{
              background: "var(--input-bg)",
              borderColor: plan.popular ? "var(--accent)" : "var(--input-border)",
              backdropFilter: "blur(12px)",
            }}
          >
            {plan.popular && (
              <div
                className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1.5 text-white text-xs font-bold uppercase tracking-widest rounded-full shadow-lg"
                style={{ background: "var(--accent)" }}
              >
                Most Popular
              </div>
            )}
            <div className="mb-8">
              <h3 className="text-2xl font-bold text-white mb-2">{plan.name}</h3>
              <p className="text-sm text-neutral-400">{plan.description}</p>
            </div>

            <div className="mb-8 flex items-baseline gap-2">
              <span className="text-5xl font-extrabold text-white">₹{plan.price}</span>
              <span className="text-sm font-medium text-neutral-500 uppercase tracking-wide">/ {plan.credits} Credits</span>
            </div>

            <ul className="space-y-4 mb-10 flex-1">
              {plan.features.map((feature, i) => (
                <li key={i} className="flex items-start gap-3 text-sm text-neutral-300">
                  <svg className="w-5 h-5 text-indigo-400 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="leading-tight">{feature}</span>
                </li>
              ))}
            </ul>

            <button
              onClick={() => handlePayment(plan)}
              disabled={loading === plan.name}
              className={`w-full py-4 px-6 rounded-2xl font-bold text-sm tracking-wide uppercase transition-all duration-300 flex items-center justify-center gap-2 cursorpo ${plan.popular
                ? "bg-linear-to-br from-accent via-[#9983ef] to-accent text-white shadow-xl shadow-accent/30 hover:shadow-accent/50 hover:-translate-y-1 transition-all duration-300"
                : "bg-neutral-800 text-white hover:bg-neutral-700"
                } disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              {loading === plan.name ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Processing...
                </>
              ) : (
                "Buy Now"
              )}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
