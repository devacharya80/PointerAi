# PointerAI

An adaptive AI learning workspace built for students across disciplines.

---

## What is PointerAI?

PointerAI is a personalized AI learning platform designed to help students learn,
understand, and practice subjects across different academic fields. Instead of
generating the same response for everyone, PointerAI uses a student's learning
level, goals, preferences, and interaction history to provide more relevant and
targeted learning experiences.

The platform combines conversational AI, adaptive questioning, intelligent web
search, and a personalized learning profile into a single student-focused workspace.

---

## Features

### Current MVP

- 🔐 **Authentication & Authorization**
  - Secure registration and login (email/password + Google OAuth)
  - Session management with HTTP-only cookies
  - Protected routes and user-specific data isolation

- 💬 **AI Conversations**
  - Persistent conversations with history
  - Streaming AI responses
  - Markdown and code block rendering
  - Create, rename, and delete conversations

- 🧠 **Adaptive AI Questioning**
  - Gathers student context before answering when needed
  - Determines knowledge level (beginner / intermediate / advanced)
  - Understands learning goal (exam, interview, deep understanding)
  - Adapts explanation style to student preferences
  - Avoids unnecessary questions when sufficient context already exists

- 👤 **Personalized Learning Profile**
  - Academic field and subjects
  - Learning goals and knowledge level
  - Preferred explanation depth and response style
  - Personalization improves with every interaction

- 🌐 **Intelligent Web Search**
  - Automatically decides when current information is required
  - Grounds AI responses using relevant, up-to-date sources
  - Displays source citations to the user
  - Avoids hallucination on time-sensitive questions

### Planned

- 📄 Document upload and RAG (Retrieval-Augmented Generation)
- 🖼️ Image understanding for diagrams, notes, and problems
- 🎓 Learning modes (Quiz, Flashcards, Study, Practice, Summarize)
- 📊 Personal learning space with progress and recommendations
- 📧 Email notifications
- 💬 Real-time collaborative study rooms (WebSockets)

---

## Tech Stack

### Frontend
- React, TypeScript, Vite
- Tailwind CSS, Motion
- TanStack Query

### Backend
- Node.js, Express, TypeScript
- PostgreSQL, Prisma ORM
- Zod, Redis

### AI
- Groq API (provider-agnostic abstraction layer)
- Context engineering and adaptive prompting
- Intelligent web search integration

### Infrastructure
- Docker, Docker Compose
- GitHub Actions (CI/CD)
- Cloud deployment (planned)

---

## Architecture

Modular monolith with an AI abstraction layer.

```text
Frontend (React)
      │
      ▼
API Gateway (Express)
Auth · Rate Limiting · Logging
      │
      ├── Auth Module
      ├── User / Profile Module
      ├── Conversation Module
      └── AI Module
            │
            ├── Personalization Layer
            │     └── Context Builder
            ├── AI Service (abstracted)
            │     └── Groq Provider
            └── Search Service

Data Layer
├── PostgreSQL (Prisma) — persistent data
└── Redis — rate limiting, caching
```

### Backend Module Structure

```text
src/
├── config/
├── middleware/
├── modules/
│   ├── auth/
│   ├── users/
│   ├── conversations/
│   ├── messages/
│   ├── ai/
│   ├── personalization/
│   ├── search/
│   └── common/
├── lib/
├── app.ts
└── server.ts
```

---

## Project Vision

> AI should adapt to the student — not force every student to adapt to the AI.

PointerAI is built around the idea that personalization is not a feature, it is
the foundation. Every response is shaped by who the student is, what they are
trying to achieve, and how they learn best.

---

## Getting Started

Coming soon.

---

## Roadmap

- [x] Phase 0 — Product & Architecture
- [ ] Phase 1 — Project Foundation
- [ ] Phase 2 — Authentication (Email + OAuth)
- [ ] Phase 3 — AI Chat with Streaming
- [ ] Phase 4 — Personalization & Adaptive Questioning
- [ ] Phase 5 — Intelligent Web Search
- [ ] Phase 6 — Production Engineering (Redis, Rate Limiting, Docker, CI/CD)
- [ ] Phase 7 — Documents, Images, Learning Modes
- [ ] Phase 8 — UX & Product Polish

---

## License

To be determined.