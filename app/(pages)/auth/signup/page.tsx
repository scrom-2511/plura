"use client";
import { useRouter } from "next/navigation";
import React, { useState } from "react";
import Link from "next/link";

const SignUp = () => {
  const [firstName, setFirstName] = useState<string>("");
  const [lastName, setLastName] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleOnClickSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          username: `${firstName} ${lastName}`,
          password,
        }),
      });

      if (!res.ok) {
        throw new Error("Failed to sign up");
      }

      router.push("/auth/signin");
    } catch (err) {
      console.error(err);
      setError("Something went wrong, please try again.");
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-background text-foreground font-sans p-4">
      <div className="w-full max-w-[420px] flex flex-col space-y-8">
        <div className="flex flex-col space-y-2 text-center md:text-left">
          <h1 className="text-3xl font-semibold tracking-tight text-white">Create an account</h1>
        </div>

        <form className="flex flex-col space-y-5" onSubmit={handleOnClickSignUp}>
          <div className="flex gap-4">
            <div className="space-y-1 flex-1">
              <input
                type="text"
                placeholder="First Name"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-input-border bg-input text-white placeholder:text-secondary focus:outline-none focus:border-accent transition-colors"
                required
              />
            </div>
            <div className="space-y-1 flex-1">
              <input
                type="text"
                placeholder="Last Name"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-input-border bg-input text-white placeholder:text-secondary focus:outline-none focus:border-accent transition-colors"
                required
              />
            </div>
          </div>

          <div className="space-y-1">
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-input-border bg-input text-white placeholder:text-secondary focus:outline-none focus:border-accent transition-colors"
              required
            />
          </div>

          <div className="space-y-1">
            <input
              type="password"
              placeholder="Create Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-input-border bg-input text-white placeholder:text-secondary focus:outline-none focus:border-accent transition-colors"
              required
            />
          </div>

          <div className="flex items-center space-x-2">
            <input type="checkbox" id="terms" className="rounded bg-input border-input-border text-accent focus:ring-accent accent-accent w-4 h-4" required />
            <label htmlFor="terms" className="text-xs text-secondary select-none cursor-pointer">
              I agree to the <span className="font-semibold text-white">Terms & Conditions</span>
            </label>
          </div>

          {error && <p className="text-red-500 text-sm">{error}</p>}

          <button
            type="submit"
            className="w-full py-3 bg-accent text-white font-medium rounded-xl hover:opacity-90 transition-opacity"
          >
            Create account
          </button>
        </form>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-input-border" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-background px-2 text-secondary">Or</span>
          </div>
        </div>

        {/* <div className="flex gap-4">
          <button
            type="button"
            className="flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl border border-input-border bg-input hover:bg-input-border/50 transition-colors text-sm font-medium text-secondary"
          >
            <svg viewBox="0 0 24 24" className="w-5 h-5" aria-hidden="true">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
            </svg>
            Continue with Google
          </button>
          <button
            type="button"
            className="flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl border border-input-border bg-input hover:bg-input-border/50 transition-colors text-sm font-medium text-secondary"
          >
            <svg fill="currentColor" viewBox="0 0 24 24" className="w-5 h-5" aria-hidden="true">
              <path d="M12 2C6.477 2 2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12c0-5.523-4.477-10-10-10z" />
            </svg>
            Continue with Apple
          </button>
        </div> */}

        <div className="text-center space-y-2">
          <p className="text-sm text-secondary">
            Already have an account?{" "}
            <Link href="/auth/signin" className="text-white hover:underline">
              Log in
            </Link>
          </p>
          <p className="text-[10px] text-secondary">
            By signing up you agree to our privacy policy and terms.
          </p>
        </div>
      </div>
    </div>
  );
};

export default SignUp;
