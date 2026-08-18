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
    <div className="min-h-screen bg-black text-white selection:bg-indigo-500/30 flex flex-col items-center pt-24 pb-12 px-4 sm:px-6 lg:px-8 font-sans overflow-x-hidden">
      <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="lazyOnload" />

      {/* Background Gradients */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-[40rem] opacity-30 pointer-events-none blur-[120px] bg-gradient-to-b from-indigo-600 via-purple-600 to-transparent -z-10 rounded-full" />
      <div className="absolute top-1/3 left-0 w-96 h-96 opacity-20 pointer-events-none blur-[100px] bg-indigo-500 -z-10 rounded-full mix-blend-screen" />
      <div className="absolute bottom-1/3 right-0 w-96 h-96 opacity-20 pointer-events-none blur-[100px] bg-purple-500 -z-10 rounded-full mix-blend-screen" />

      {/* Header */}
      <div className="text-center max-w-3xl mx-auto mb-16 relative z-10">
        <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-6 bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 drop-shadow-sm">
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
            className={`relative flex flex-col bg-neutral-900/50 backdrop-blur-xl border ${
              plan.popular ? "border-indigo-500 shadow-[0_0_40px_rgba(99,102,241,0.2)]" : "border-white/10"
            } rounded-3xl p-8 transition-all duration-300 hover:scale-[1.02] hover:bg-neutral-900/80 hover:border-indigo-500/50 hover:shadow-2xl hover:shadow-indigo-500/20 group`}
          >
            {plan.popular && (
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1.5 bg-gradient-to-r from-indigo-500 to-purple-500 text-white text-xs font-bold uppercase tracking-widest rounded-full shadow-lg">
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
              className={`w-full py-4 px-6 rounded-2xl font-bold text-sm tracking-wide uppercase transition-all duration-300 flex items-center justify-center gap-2 ${
                plan.popular
                  ? "bg-white text-black hover:bg-indigo-50 hover:scale-[1.02] shadow-lg hover:shadow-indigo-500/25"
                  : "bg-neutral-800 text-white hover:bg-neutral-700 hover:scale-[1.02] border border-white/5"
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
