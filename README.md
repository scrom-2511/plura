# Plura

**One Platform. Infinite Intelligence.**

Chat with the world's most powerful language models in a single, unified interface. Plura brings all your AI conversations into one customizable workspace.

## Overview
Plura is the ultimate conversational AI platform built to harness the top-tier Large Language Models (GPT, Claude, Gemini, and Llama) without getting locked into a single ecosystem. It offers a premium, minimalist, and deeply interactive user interface, heavily optimized for performance, scalability, and design.

## Features
- ⚡ **Multi-Model Support**: Interact with OpenAI's GPT, Anthropic's Claude, Google's Gemini, and Meta's Llama side by side.
- 🎨 **Beautiful UI/UX**: Crafted with a focus on modern aesthetics, fluid micro-interactions, responsive typography, and specialized color theory.
- 🔄 **Unified Workflow**: Switch models dynamically within the same conversation session depending on the prompt (coding, creative writing, data analysis).
- 🔒 **Privacy First**: Secure authentication and local/server storage options ensuring your conversation history remains completely yours.
- 💳 **Premium Subscriptions**: Integrated Razorpay for seamless payment handling, enabling premium tiers for pro-level platform usage.

## Tech Stack
- **Framework**: [Next.js 15](https://nextjs.org/) (App Directory) & React 19
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/)
- **Database & ORM**: PostgreSQL via [Prisma](https://www.prisma.io/)
- **State Management**: [Zustand](https://github.com/pmndrs/zustand)
- **Authentication**: [NextAuth.js](https://next-auth.js.org/)
- **Caching/Rate-Limiting**: Redis
- **Payments**: Razorpay
- **Data Validation**: Zod

## Getting Started

### Prerequisites
Make sure you have the following installed on your machine:
- [Node.js](https://nodejs.org/en/) (v18 or above)
- [PostgreSQL](https://www.postgresql.org/) (Local instance or cloud provider like Supabase/Neon)
- [Redis](https://redis.io/) 
- Accounts for API keys (OpenAI, Anthropic, Google AI, and Razorpay)

### Installation
1. **Clone the repository:**
   ```bash
   git clone https://github.com/scrom-2511/plura.git
   cd plura
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Set up Environment Variables:**
   Create a `.env` file in the root directory based on standard required variables:
   ```env
   # Database
   DATABASE_URL="postgresql://user:password@localhost:5432/plura?schema=public"

   # NextAuth
   NEXTAUTH_SECRET="your-secret-key"
   NEXTAUTH_URL="http://localhost:3000"

   # API Keys for AI Models
   OPENAI_API_KEY="your-openai-key"
   ANTHROPIC_API_KEY="your-anthropic-key"
   GEMINI_API_KEY="your-gemini-key"
   
   # Or via Azure Inference
   AZURE_AI_ENDPOINT="..."
   AZURE_AI_KEY="..."

   # Redis
   REDIS_URL="redis://127.0.0.1:6379"

   # Razorpay
   RAZORPAY_KEY_ID="your-razorpay-id"
   RAZORPAY_KEY_SECRET="your-razorpay-secret"
   ```

4. **Initialize the database:**
   ```bash
   npx prisma generate
   npx prisma db push
   ```

5. **Start the development server:**
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## License
© Plura AI. All rights reserved.
