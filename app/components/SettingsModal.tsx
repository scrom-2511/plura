"use client";

import React, { useEffect, useState } from "react";
import Script from "next/script";
import { useSession } from "next-auth/react";
import Link from "next/link";

type UserDetails = {
  id: string;
  username: string;
  email: string;
  credits: number;
  premium: boolean;
};

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SettingsModal({ isOpen, onClose }: SettingsModalProps) {
  const { data: session, status } = useSession();
  const [activeTab, setActiveTab] = useState<"profile" | "credits">("profile");
  const [userDetails, setUserDetails] = useState<UserDetails | null>(null);
  const [loadingUser, setLoadingUser] = useState(true);

  const fetchUserDetails = async () => {
    try {
      const res = await fetch("/api/user/details");
      const data = await res.json();
      if (data.success) {
        setUserDetails(data.data);
      }
    } catch (err) {
      console.error("Failed to fetch user details", err);
    } finally {
      setLoadingUser(false);
    }
  };

  useEffect(() => {
    if (status === "authenticated" && isOpen) {
      fetchUserDetails();
    } else if (status === "unauthenticated") {
      setLoadingUser(false);
    }
  }, [status, isOpen]);

  if (!isOpen) return null;

  if (status === "loading" || loadingUser) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
        <div className="w-full max-w-4xl bg-background border border-input-border rounded-3xl shadow-2xl flex items-center justify-center min-h-[400px]">
          <svg className="animate-spin h-8 w-8 text-accent" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        </div>
      </div>
    );
  }

  if (status === "unauthenticated") {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
        <div className="w-full max-w-4xl bg-background border border-input-border rounded-3xl shadow-2xl flex flex-col items-center justify-center min-h-[400px]">
          <p className="text-xl mb-4 text-foreground">Please sign in to view settings.</p>
          <button onClick={onClose} className="bg-accent text-white px-6 py-2 rounded-xl">
            Close
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 sm:p-6 overflow-y-auto">
      <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="lazyOnload" />
      <div className="w-full max-w-4xl bg-background border border-input-border rounded-3xl shadow-2xl relative flex flex-col my-auto max-h-[95vh] sm:max-h-[90vh]">
        <div className="flex items-center justify-between border-b border-input-border p-5 sm:p-6 md:px-8 shrink-0">
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Settings</h1>
          <button onClick={onClose} className="p-2 hover:bg-input rounded-xl transition-all text-secondary hover:text-foreground">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18" /><path d="m6 6 12 12" /></svg>
          </button>
        </div>

        <div className="flex flex-col md:flex-row items-start p-5 sm:p-6 md:p-8 gap-6 md:gap-8 overflow-y-auto">
          {/* Sidebar Tabs */}
          <div className="w-full md:w-64 flex flex-row md:flex-col gap-2 shrink-0 overflow-x-auto pb-2 md:pb-0 scrollbar-hide">
            <button
              onClick={() => setActiveTab("profile")}
              className={`flex-1 md:w-full flex items-center justify-center md:justify-start gap-2 sm:gap-3 px-3 sm:px-4 py-3 rounded-xl transition-all text-sm font-semibold whitespace-nowrap ${activeTab === "profile" ? "bg-accent/10 text-accent border border-accent/20" : "text-secondary hover:bg-input border border-transparent"}`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>
              Basic Details
            </button>
            <button
              onClick={() => setActiveTab("credits")}
              className={`flex-1 md:w-full flex items-center justify-center md:justify-start gap-2 sm:gap-3 px-3 sm:px-4 py-3 rounded-xl transition-all text-sm font-semibold whitespace-nowrap ${activeTab === "credits" ? "bg-accent/10 text-accent border border-accent/20" : "text-secondary hover:bg-input border border-transparent"}`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0"><path d="M12 2v20" /><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" /></svg>
              Credits & Billing
            </button>
          </div>

          {/* Tab Content */}
          <div className={`flex-1 w-full flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 relative overflow-hidden rounded-2xl md:p-8 ${activeTab === "credits"
            ? "bg-linear-to-br from-accent/20 to-transparent border border-accent/30 shadow-xl"
            : "bg-input border border-input-border shadow-sm"
            }`}>
            {activeTab === "profile" && (
              <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500 w-full">
                <div>
                  <h2 className="text-xl font-bold mb-1 text-foreground">Basic Details</h2>
                  <p className="text-sm text-secondary">Manage your personal information.</p>
                </div>

                <div className="flex flex-col sm:flex-row gap-4 justify-between w-full">
                  <div className="flex flex-col gap-1.5 w-full">
                    <label className="text-sm font-medium text-secondary">Username</label>
                    <div className="px-4 py-3 bg-background border border-input-border rounded-xl text-foreground font-medium">
                      {userDetails?.username || "Not set"}
                    </div>
                  </div>

                  <div className="flex flex-col gap-1.5 w-full">
                    <label className="text-sm font-medium text-secondary">Email Address</label>
                    <div className="px-4 py-3 bg-background border border-input-border rounded-xl text-foreground font-medium">
                      {userDetails?.email || "Not set"}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "credits" && (
              <>
                <div className="absolute top-0 right-0 p-4 opacity-10">
                  <svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" className="text-accent"><path d="M12 2v20" /><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" /></svg>
                </div>
                <div className="relative z-10 w-full flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h2 className="text-lg font-medium text-secondary mb-1">Current Balance</h2>
                    <div className="flex items-baseline gap-2">
                      <span className="text-4xl font-extrabold text-white">{userDetails?.credits ?? 0}</span>
                      <span className="text-sm font-medium text-accent">Credits</span>
                    </div>
                  </div>
                  <Link
                    href="/credits"
                    onClick={onClose}
                    className="bg-accent text-white px-5 py-2.5 rounded-xl font-semibold shadow-lg shadow-accent/20 hover:bg-accent/90 transition-all flex items-center justify-center gap-2"
                  >
                    Buy More Credits
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14" /><path d="m12 5 7 7-7 7" /></svg>
                  </Link>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
