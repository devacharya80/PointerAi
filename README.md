# PointerAI

An adaptive AI learning workspace built for students across disciplines.

---

## What is PointerAI?

PointerAI is a personalized AI learning platform designed to help students learn,
understand, and practice subjects across different academic fields. Instead of
generating the same response for everyone, PointerAI uses a student's learning
level, goals, preferences, stored learning history, and interaction context to
provide more relevant and targeted learning explanations.

The platform combines conversational AI, adaptive questioning, intelligent web
search, streaming responses, and a personalized learning profile into a single
student-focused workspace.

---

## Features

- 🔐 **Authentication & Authorization**
  - Secure registration and login (email/password + Google OAuth)
  - JWT access + refresh token flow with revocable sessions
  - Session management with HTTP-only cookies
  - Protected routes and user-specific data isolation

- 💬 **AI Conversations**
  - Persistent conversations with history
  - Real-time streaming AI responses (Server-Sent Events)
  - Sliding-window context management
  - Auto-generated conversation titles
  - Create, list, and delete conversations

- 🧠 **Adaptive AI Questioning**
  - Detects genuinely ambiguous questions and asks a single clarifying question
    before answering, with clickable multiple-choice options when applicable
  - Skips clarification when the question is already clear
  - Uses the student's stored profile only as a hint, never as a hard rule

- 👤 **Personalized Learning Profile**
  - Academic field, current level, and preferred explanation depth
  - Learning goals
  - Personalization shapes the AI's system prompt directly — depth, level, and
    field all change how answers are written, without ever exposing the
    profile back to the student in the response

- 🧩 **Cross-Conversation Memory**
  - Extracts durable, factual context about the student (e.g. goals, weak
    areas, recurring topics) from conversations once they've gone quiet
  - Facts are deduplicated on extraction and capped per student
  - Reused across future conversations to personalize answers without the
    student repeating themselves

- 🌐 **Intelligent Web Search**
  - AI-based classifier decides when a question needs current information
  - Grounds AI responses using real, ranked web sources (Tavily)
  - Displays source citations tied to each AI response
  - Falls back safely to the model's own knowledge if search fails

- ⚡ **Rate Limiting & Performance**
  - Redis-backed sliding-window rate limiting (Upstash)
  - Separate limiters for auth, AI, and general API traffic
  - Streaming responses abort the upstream AI call on client disconnect

---

## Tech Stack

### Frontend
- React, TypeScript, Vite
- Tailwind CSS, Motion
- TanStack Query

### Backend
- Node.js, Express, TypeScript (ESM)
- PostgreSQL (Neon), Prisma ORM
- Zod, Redis (Upstash)

### AI
- Groq API (provider-agnostic abstraction layer)
- Context engineering: sliding window history, profile-aware prompting,
  cross-conversation fact memory
- Intelligent web search integration (Tavily)

### Infrastructure
- GitHub Actions (CI/CD, planned)
- Cloud deployment (planned)

---

## Architecture

Modular monolith with an AI abstraction layer.

```text
Frontend (React)
      │
      ▼
API Gateway (Express)
Auth · Rate Limiting · Logging · CORS · Helmet
      │
      ├── Auth Module (email/password + Google OAuth)
      ├── User Module
      ├── Profile Module
      └── Conversation Module
            │
            ├── Personalization Layer
            │     ├── Profile-aware prompt builder
            │     └── Cross-conversation fact memory
            ├── AI Service (abstracted)
            │     └── Groq Provider
            └── Search Service (Tavily)

Data Layer
├── PostgreSQL (Prisma) — persistent data
└── Redis (Upstash) — rate limiting
```

### Backend Module Structure

```text
src/
├── config/
├── middleware/
├── modules/
│   ├── auth/
│   ├── users/
│   ├── profile/
│   ├── conversations/
│   │   ├── providers/       # Tavily
│   │   ├── utils/           # classifiers, fact extraction, prompt builders
│   │   └── types/
│   └── ai/
│       └── providers/       # Groq
├── lib/
├── app.ts
└── server.ts
```

---

## Project Vision

> AI should adapt to the student — not force every student to adapt to the AI.

PointerAI is built around the idea that personalization is not a feature, it is
the foundation. Every response is shaped by who the student is, what they are
trying to achieve, and how they learn best — without ever making that scaffolding
visible in the conversation itself.

---

## Getting Started

### Prerequisites
- Node.js 20+
- A PostgreSQL database (this project uses [Neon](https://neon.tech))
- Accounts/API keys for: [Groq](https://console.groq.com), [Tavily](https://tavily.com), [Upstash Redis](https://upstash.com), and a [Google OAuth](https://console.cloud.google.com) client

### 1. Clone and install
```bash
git clone https://github.com/devacharya80/PointerAi.git
cd PointerAi/server
npm install
```

### 2. Configure environment variables
Copy `.env.example` to `.env` and fill in your own values:
```bash
cp .env.example .env
```

### 3. Set up the database
```bash
npx prisma migrate dev
npx prisma generate
```

### 4. Run the server
```bash
npm run dev
```

The API will be available at `http://localhost:3000`. Check `GET /health` to
confirm it's running.

---

## Roadmap

- [x] Phase 0 — Product & Architecture
- [x] Phase 1 — Project Foundation
- [x] Phase 2 — Authentication (Email + Google OAuth)
- [x] Phase 3 — AI Chat with Streaming
- [x] Phase 4 — Personalization, Adaptive Questioning & Cross-Conversation Memory
- [x] Phase 5 — Intelligent Web Search
- [x] Rate Limiting + Redis
- [ ] Phase 6 — Frontend
- [ ] Phase 7 — V2: Real-time collaborative study chat, notifications, email
- [ ] Phase 8 — Documents/RAG, image understanding, learning modes (quiz, flashcards)
- [ ] Phase 9 — Production Engineering (Docker, CI/CD, deployment, testing)

---

## License

To be determined.