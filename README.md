# Noebase: Production-Ready AI Workflow Automation Platform

Nodebase is a visual, node-based workflow automation platform that allows users to build, orchestrate, and execute complex AI-driven pipelines. Featuring a drag-and-drop canvas, multi-LLM integrations, robust background job processing, and full SaaS monetization capabilities.

## 🚀 Key Features

### 🎨 Visual Workflow Builder
* **React Flow Canvas:** Interactive drag-and-drop user interface for constructing intricate visual logic paths.
* **Flexible Node Architecture:** Seamlessly connect triggers, AI models, and messaging outputs.

### 🎯 Trigger Nodes
* **Webhook & HTTP:** Ingest external HTTP requests to kick off automated pipelines.
* **Integrations:** Native-like triggers for Google Forms, Stripe events, or manual execution.

### 🤖 AI Orchestration
* **Multi-Model Support:** Native integrations with **OpenAI**, **Anthropic (Claude)**, and **Google Generative AI (Gemini)**.
* **Context-Aware Chaining:** Pass outputs from one AI model directly into subsequent prompt nodes.

### 💬 Messaging & Notifications
* **Slack & Discord Nodes:** Streamline team alerts or construct interactive chatbots powered by your underlying workflows.

### ⚡ Infrastructure & Architecture
* **Background Execution:** Powering resilient, event-driven, and fault-tolerant queue execution via **Inngest**.
* **Type Safety:** End-to-end type safety across frontend and backend boundaries using **TypeScript** and **tRPC**.
* **Database & ORM:** **Neon Postgres** serverless database layered with **Prisma ORM**.
* **Security:** Cryptographic node data protection using localized symmetrical `ENCRYPTION_KEY` and initialization vectors.

### 💳 Production SaaS Elements
* **Authentication:** Modern, secure session management powered by **Better Auth** (supporting GitHub and Google OAuth).
* **Monetization:** Subscription management, usage gating, and localized billing checkout using **Polar**.
* **Observability:** Full-stack error capturing and real-time AI performance monitoring using **Sentry**.

---

## 🛠️ Tech Stack

* **Framework:** Next.js 15 (App Router)
* **UI/Styling:** Tailwind CSS, React Flow
* **API Layer:** tRPC, Webhooks
* **Database:** Neon Postgres, Prisma ORM
* **Queues/Workers:** Inngest
* **Auth:** Better Auth (OAuth 2.0)
* **Payments:** Polar
* **Monitoring & CI:** Sentry

---

## ⚙️ Getting Started

### Prerequisites

Ensure you have **Node.js** and **npm** installed on your machine.

### 1. Clone the Repository
```bash
git clone [https://github.com/hasheddev/nodebase.git](https://github.com/hasheddev/nodebase.git)
cd nodebase
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Environment Configuration
Create a .env file in the root directory and populate it with your credentials:

```
DATABASE_URL="postgresql://..."

# Better Auth Configuration
BETTER_AUTH_SECRET=your_better_auth_secret
BETTER_AUTH_URL=http://localhost:3000
APP_URL=http://localhost:3000
NEXT_PUBLIC_APP_URL=http://localhost:3000

# AI Provider API Keys
OPENAI_API_KEY="sk-proj-..."
ANTHROPIC_API_KEY="sk-ant-..."
GOOGLE_GENERATIVE_AI_API_KEY="AIzaSy..."

# Monitoring & Error Tracking
SENTRY_AUTH_TOKEN=your_sentry_token

# Polar Monetization
POLAR_ACCESS_TOKEN=your_polar_token
POLAR_ORG_SLUG=your_org_slug
POLAR_SUCCESS_URL=http://localhost:3000

# Local Development Tunneling
NGROK_URL=your_ngrok_url

# Security & Data Encryption
ENCRYPTION_KEY=your_32_byte_hex_encryption_key
INITALIZATION_VECTOR=your_16_byte_hex_iv

# OAuth Credentials
GITHUB_CLIENT_ID=your_github_id
GITHUB_CLIENT_SECRET=your_github_secret
GOOGLE_CLIENT_ID=your_google_id
GOOGLE_CLIENT_SECRET=your_google_secret
```

### 4. Database Setup
```bash
npx prisma db push
```

### 5 Run App

```bash
npm run dev
npx inngest-cli@latest dev
```