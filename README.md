# NeuroRecall AI — Flashcard & Revision Quiz Generator

A full-stack, production-grade **AI-Powered Flashcard & Revision Quiz Generator** built with **React (Vite) + Tailwind CSS + Framer Motion**, **Node.js + Express (ES Modules)**, **Supabase PostgreSQL + Auth (RLS)**, **Google Gemini 2.5 (`@google/genai`)**, and **Zod** validation.

---

## Project Folder Structure

```text
AI Flashcard/
├── frontend/                     # React (Vite) + Tailwind CSS + Framer Motion Client
│   ├── src/
│   │   ├── components/
│   │   │   ├── Navbar.jsx        # Navigation bar with profile & quick links
│   │   │   ├── Flashcard.jsx     # 3D Flip animation card with Easy / Difficult buttons
│   │   │   ├── QuizCard.jsx      # Multiple-choice question card with instant feedback
│   │   │   ├── ProgressChart.jsx # SVG score trajectory & difficulty breakdown charts
│   │   │   └── DeckCard.jsx      # Dashboard summary card with rename/delete & mastery
│   │   ├── context/
│   │   │   └── AuthContext.jsx   # Supabase Auth + Interactive Demo Sandbox provider
│   │   ├── lib/
│   │   │   ├── supabaseClient.js # Supabase client initialization
│   │   │   ├── validators.js     # Frontend Zod validation schemas
│   │   │   └── api.js            # Authenticated REST API client
│   │   ├── pages/
│   │   │   ├── AuthPage.jsx      # /login & /register pages
│   │   │   ├── Dashboard.jsx     # /dashboard — Saved decks & KPI overview
│   │   │   ├── CreateDeck.jsx    # /create — Topic/Notes/Upload AI generation form
│   │   │   ├── StudyDeck.jsx     # /deck/:id/study — Interactive 3D flip card player
│   │   │   ├── TakeQuiz.jsx      # /deck/:id/quiz — Interactive MCQ player & scorer
│   │   │   └── Analytics.jsx     # /analytics — Learning telemetry & deck breakdown
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   ├── .env                      # Frontend environment configuration
│   ├── .env.example
│   ├── index.html
│   ├── package.json
│   ├── postcss.config.js
│   ├── tailwind.config.js
│   └── vite.config.js
├── backend/                      # Node.js + Express (ES Modules) API Server
│   ├── config/
│   │   ├── gemini.js             # @google/genai initialization & AI system prompt
│   │   └── supabase.js           # Supabase Service Role admin client
│   ├── middleware/
│   │   └── auth.js               # Supabase JWT Bearer token verification middleware
│   ├── routes/
│   │   ├── generate.js           # POST /api/generate
│   │   ├── decks.js              # GET/PATCH/DELETE /api/decks, PATCH difficulty, POST quiz
│   │   └── analytics.js          # GET /api/analytics
│   ├── shared/
│   │   └── validators.js         # Backend Zod validation schemas
│   ├── utils/
│   │   └── sanitize.js           # Input sanitization & JSON extraction utilities
│   ├── .env                      # Backend environment configuration
│   ├── .env.example
│   ├── index.js                  # Express server entry point
│   └── package.json
├── superbase_setup.sql           # Production PostgreSQL schema & RLS setup script
├── supabase_setup.sql            # Production PostgreSQL schema & RLS setup script
├── .gitignore
└── README.md
```

---

## Step-by-Step Setup Guide

### 1. Database Setup (Supabase PostgreSQL & RLS)
1. Create a project at [https://supabase.com](https://supabase.com).
2. Open the **SQL Editor** in your Supabase dashboard.
3. Copy and execute the contents of [`superbase_setup.sql`](./superbase_setup.sql) (also mirrored in [`supabase_setup.sql`](./supabase_setup.sql)).
   - Creates `decks`, `flashcards`, `quiz_questions`, and `quiz_attempts` tables.
   - Enables Row Level Security (`RLS`) and strict user-isolation policies on all four tables.

### 2. Backend Configuration & Startup
1. Navigate into `backend/` and install dependencies:
   ```bash
   cd backend
   npm install
   ```
2. Update `backend/.env` with your real keys:
   ```env
   PORT=5000
   GEMINI_API_KEY=your_gemini_api_key_here
   SUPABASE_URL=your_supabase_project_url
   SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_key
   CLIENT_ORIGIN=http://localhost:5173
   ```
3. Start the Express server:
   ```bash
   npm run dev
   ```

### 3. Frontend Configuration & Startup
1. Navigate into `frontend/` and install dependencies:
   ```bash
   cd frontend
   npm install
   ```
2. Update `frontend/.env` with your Supabase project URL and anon key:
   ```env
   VITE_SUPABASE_URL=your_supabase_project_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   VITE_API_BASE_URL=http://localhost:5000/api
   ```
3. Start the Vite development server:
   ```bash
   npm run dev
   ```
   > **Note:** If you launch the frontend before configuring live Supabase/Gemini keys in `.env`, you can click **"Explore Instant Demo Workspace"** on `/login` to test the entire flashcard flip player, MCQ quiz engine, AI deck generator, and analytics dashboard immediately in local sandbox mode.

---

## Backend API Endpoints

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `POST` | `/api/generate` | Validates request with Zod, sanitizes input, calls Gemini 2.5 via `@google/genai`, validates JSON output with `GeminiResponseSchema`, and inserts deck, flashcards, and quiz questions into Supabase. |
| `GET` | `/api/decks` | Fetches the authenticated user's saved decks with progress and mastery metadata. |
| `GET` | `/api/decks/:id` | Fetches a single deck along with its `flashcards`, `quiz_questions`, and `quiz_attempts`. |
| `PATCH` | `/api/decks/:id` | Updates/renames a saved deck. |
| `DELETE` | `/api/decks/:id` | Deletes a saved deck (cascades to flashcards, quiz questions, and attempts). |
| `PATCH` | `/api/flashcards/:id/difficulty` | Updates a flashcard's `difficulty_status` (`easy`, `difficult`, or `unmarked`). |
| `POST` | `/api/quiz/submit` | Records a completed quiz attempt in `quiz_attempts` and returns comparative score analytics. |
| `GET` | `/api/analytics` | Returns aggregate mastery percentages, study streak days, card difficulty distribution, and quiz score history. |

