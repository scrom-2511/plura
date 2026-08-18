import Link from 'next/link';
import React from 'react';

export default function Home() {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col font-sans overflow-x-hidden relative selection:bg-accent selection:text-white">
      {/* Background blobs / glows for a premium modern feel */}
      <div className="fixed inset-0 w-full h-full overflow-hidden pointer-events-none -z-10">
        <div className="absolute top-[-20%] left-[-10%] w-[50vw] h-[50vw] bg-accent opacity-20 blur-[120px] rounded-full animate-blob"></div>
        <div className="absolute top-[20%] right-[-10%] w-[40vw] h-[60vw] bg-accent opacity-10 blur-[150px] rounded-full animate-blob animation-delay-2000"></div>
        <div className="absolute bottom-[-20%] left-[20%] w-[60vw] h-[50vw] bg-accent opacity-20 blur-[150px] rounded-full animate-blob animation-delay-4000"></div>
      </div>

      {/* Navigation */}
      <header className="w-full flex items-center justify-between px-4 sm:px-6 py-4 sm:py-5 md:px-12 backdrop-blur-xl bg-background/70 sticky top-0 z-50 border-b border-input-border/50">
        <div className="flex items-center gap-3">
          <span className="text-xl sm:text-2xl font-extrabold tracking-[0.2em] uppercase text-primary">Plura</span>
        </div>
        <div className="flex items-center gap-4 sm:gap-6">
          <Link href="/auth/signin" className="text-sm font-medium text-secondary hover:text-primary transition-colors hidden sm:block">
            Sign In
          </Link>
          <Link
            href="/auth/signup"
            className="inline-flex items-center justify-center gap-2 sm:gap-3 bg-[#876eee] text-white px-5 sm:px-6 py-2 sm:py-2.5 rounded-full text-xs sm:text-sm font-bold shadow-md hover:scale-105 hover:bg-accent hover:text-white transition-all duration-300 relative z-10"
          >
            Get Started
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1 flex flex-col items-center justify-center text-center px-4 py-16 sm:py-24 md:py-32 z-10 w-full max-w-5xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full bg-input border border-input-border shadow-sm mb-8 sm:mb-10 transition-transform hover:scale-105 cursor-default">
          <span className="w-2 h-2 rounded-full bg-accent animate-pulse"></span>
          <span className="text-[10px] sm:text-xs md:text-sm font-medium text-secondary tracking-wide">Now supporting multiple top-tier LLMs</span>
        </div>

        <h1 className="text-4xl sm:text-5xl md:text-7xl lg:text-8xl font-extrabold tracking-tighter mb-6 md:mb-8 leading-[1.1]">
          One Platform. <br className="hidden md:block" />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent via-[#A993FE] to-accent animate-gradient-x">
            Infinite Intelligence.
          </span>
        </h1>

        <p className="text-base sm:text-lg md:text-2xl text-secondary max-w-3xl mb-10 md:mb-12 leading-relaxed">
          Chat with the world's most powerful language models in a single, unified interface. Plura brings all your AI conversations into one beautiful workspace.
        </p>

        <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-5 w-full sm:w-auto px-2 sm:px-0">
          <Link
            href="/auth/signup"
            className="group relative flex items-center justify-center gap-3 bg-linear-to-br from-accent via-[#9983ef] to-accent text-white px-6 sm:px-8 py-3.5 sm:py-4 rounded-full text-base sm:text-lg font-bold shadow-xl shadow-accent/30 hover:shadow-accent/50 hover:-translate-y-1 transition-all duration-300 w-full sm:w-auto overflow-hidden"
          >
            <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-20 transition-opacity"></div>
            Start Chatting for Free
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="group-hover:translate-x-1.5 transition-transform">
              <line x1="5" y1="12" x2="19" y2="12"></line>
              <polyline points="12 5 19 12 12 19"></polyline>
            </svg>
          </Link>
          <a
            href="#features"
            className="px-6 sm:px-8 py-3.5 sm:py-4 rounded-full text-base sm:text-lg font-bold bg-input/80 backdrop-blur-sm border border-input-border hover:bg-input hover:text-primary transition-all duration-300 flex items-center justify-center text-secondary w-full sm:w-auto hover:-translate-y-1"
          >
            Explore Features
          </a>
        </div>
      </main>

      {/* Models row visually showcasing 'multi llm' */}
      <section className="w-full pb-16 sm:pb-24 pt-8 sm:pt-10 border-t border-input-border/30 relative z-10 bg-gradient-to-b from-transparent to-input/20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <p className="text-center text-xs sm:text-sm font-bold text-secondary mb-8 sm:mb-12 uppercase tracking-[0.2em] sm:tracking-[0.3em]">Harness the power of the best models</p>
          <div className="flex flex-wrap justify-center items-center gap-6 sm:gap-10 md:gap-20 opacity-60 hover:opacity-100 grayscale hover:grayscale-0 transition-all duration-700">
            {/* OpenAI / GPT */}
            <div className="flex items-center gap-2 sm:gap-3 hover:scale-110 transition-transform cursor-default group">
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-primary flex items-center justify-center shadow-lg group-hover:shadow-primary/20 transition-shadow">
                <span className="text-background font-extrabold text-[10px] sm:text-sm">GPT</span>
              </div>
              <span className="font-bold text-base sm:text-xl text-primary">GPT</span>
            </div>

            {/* Anthropic / Claude */}
            <div className="flex items-center gap-2 sm:gap-3 hover:scale-110 transition-transform cursor-default group">
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-[#d97757] flex items-center justify-center shadow-lg group-hover:shadow-[#d97757]/20 transition-shadow">
                <span className="text-white font-serif italic font-bold text-sm sm:text-lg">C</span>
              </div>
              <span className="font-bold text-base sm:text-xl text-primary">Claude</span>
            </div>

            {/* Google / Gemini */}
            <div className="flex items-center gap-2 sm:gap-3 hover:scale-110 transition-transform cursor-default group">
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg group-hover:shadow-blue-500/20 transition-shadow">
                <span className="text-white font-bold text-[10px] sm:text-sm">G</span>
              </div>
              <span className="font-bold text-base sm:text-xl text-primary">Gemini</span>
            </div>

            {/* Meta / Llama */}
            <div className="flex items-center gap-2 sm:gap-3 hover:scale-110 transition-transform cursor-default group">
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl border-2 border-accent bg-accent/5 flex items-center justify-center shadow-lg group-hover:shadow-accent/20 transition-shadow">
                <span className="text-accent font-extrabold text-[10px] sm:text-sm">L</span>
              </div>
              <span className="font-bold text-base sm:text-xl text-primary">Llama</span>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Bento Box */}
      <section id="features" className="w-full py-16 sm:py-32 px-4 sm:px-6 relative z-10 bg-background">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12 sm:mb-20">
            <h2 className="text-3xl sm:text-4xl md:text-6xl font-extrabold mb-4 sm:mb-6 tracking-tight text-primary">Why choose Plura?</h2>
            <p className="text-base sm:text-lg md:text-xl text-secondary max-w-2xl mx-auto leading-relaxed">
              We built the ultimate conversational workspace designed to unlock the full potential of language models without boundaries.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
            <div className="col-span-1 md:col-span-2 bg-input rounded-[2rem] sm:rounded-[2.5rem] p-6 sm:p-10 border border-input-border hover:border-accent/40 transition-colors duration-500 group relative overflow-hidden">
              <div className="absolute top-0 right-0 w-48 sm:w-64 h-48 sm:h-64 bg-accent opacity-5 rounded-full blur-3xl group-hover:opacity-20 transition-opacity duration-700"></div>
              <h3 className="text-2xl sm:text-3xl font-bold mb-3 sm:mb-4 text-primary tracking-tight">Model Agnostic</h3>
              <p className="text-secondary text-sm sm:text-lg leading-relaxed max-w-xl">
                Don't get locked into a single ecosystem. Switch between different models within the same session to get the best answer every time, whether you need creative writing, coding, or data analysis.
              </p>
            </div>

            <div className="col-span-1 bg-input rounded-[2rem] sm:rounded-[2.5rem] p-6 sm:p-10 border border-input-border hover:border-accent/40 transition-colors duration-500 group relative overflow-hidden">
              <h3 className="text-2xl sm:text-3xl font-bold mb-3 sm:mb-4 text-primary tracking-tight">Privacy First</h3>
              <p className="text-secondary text-sm sm:text-lg leading-relaxed">
                Your conversations belong to you. We never use your private chat history for training generic AI models.
              </p>
            </div>

            <div className="col-span-1 bg-input rounded-[2rem] sm:rounded-[2.5rem] p-6 sm:p-10 border border-input-border hover:border-accent/40 transition-colors duration-500 group relative overflow-hidden">
              <h3 className="text-2xl sm:text-3xl font-bold mb-3 sm:mb-4 text-primary tracking-tight">Lightning Fast</h3>
              <p className="text-secondary text-sm sm:text-lg leading-relaxed">
                Streamed responses and an optimized responsive interface so you never have to wait.
              </p>
            </div>

            <div className="col-span-1 md:col-span-2 bg-gradient-to-br from-input to-input/50 rounded-[2rem] sm:rounded-[2.5rem] p-6 sm:p-10 border border-input-border hover:border-accent/40 transition-colors duration-500 group flex flex-col justify-center relative overflow-hidden">
              <div className="absolute right-0 bottom-0 w-64 sm:w-80 h-64 sm:h-80 bg-accent opacity-5 rounded-full blur-3xl group-hover:opacity-20 transition-opacity duration-700"></div>
              <h3 className="text-2xl sm:text-3xl font-bold mb-3 sm:mb-4 text-primary tracking-tight">Beautiful Design</h3>
              <p className="text-secondary text-sm sm:text-lg leading-relaxed mb-4 sm:mb-8 max-w-xl">
                Why should productivity apps be boring? Plura is crafted with a focus on typography, color theory, and micro-interactions, making every prompt a joy.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="w-full py-16 sm:py-32 px-4 sm:px-6 relative z-10">
        <div className="max-w-4xl mx-auto rounded-[2rem] sm:rounded-[3rem] bg-gradient-to-b from-input to-background border border-input-border p-8 sm:p-12 md:p-20 text-center relative overflow-hidden shadow-2xl">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[90%] sm:w-[80%] h-[90%] sm:h-[80%] bg-accent opacity-10 blur-3xl rounded-full pointer-events-none"></div>

          <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold mb-4 sm:mb-6 text-primary tracking-tight relative z-10">Ready to level up your AI game?</h2>
          <p className="text-base sm:text-xl text-secondary mb-8 sm:mb-10 max-w-2xl mx-auto relative z-10">
            Join thousands of users who are already experiencing the future of interacting with large language models.
          </p>

          <Link
            href="/auth/signup"
            className="inline-flex items-center justify-center gap-2 sm:gap-3 bg-primary text-background px-6 sm:px-10 py-4 sm:py-5 rounded-full text-base sm:text-xl font-bold shadow-2xl hover:scale-105 hover:bg-accent hover:text-white transition-all duration-300 relative z-10"
          >
            Create Your Free Account
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="w-full border-t border-input-border/50 bg-background py-8 sm:py-12 text-center relative z-10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 flex flex-col md:flex-row items-center justify-between gap-4 sm:gap-6">
          <div className="flex items-center gap-2">
            <span className="text-base sm:text-lg font-bold tracking-widest uppercase text-primary">Plura</span>
          </div>
          <p className="text-xs sm:text-sm font-medium text-secondary">
            © {new Date().getFullYear()} Plura AI. All rights reserved.
          </p>
          <div className="flex gap-4">
            <Link href="#" className="text-secondary hover:text-primary transition-colors text-sm sm:text-base">Twitter</Link>
            <Link href="https://github.com/scrom-2511/plura" className="text-secondary hover:text-primary transition-colors text-sm sm:text-base">GitHub</Link>
            <Link href="#" className="text-secondary hover:text-primary transition-colors text-sm sm:text-base">Discord</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
