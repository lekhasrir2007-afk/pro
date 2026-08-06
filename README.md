# CareerPilot AI — Real-Time AI Interview Preparation Coach

CareerPilot AI is a full-stack Generative AI web application designed for undergraduate students and entry-level developers to prepare for technical software engineering interviews. It features real-time mock interview sessions, automated Gemini API scoring and feedback, expected answer evaluation, and personalized 7-day preparation study plans.

---

## 🛠 Tech Stack

- **Frontend**: React.js, TypeScript, Tailwind CSS, React Router v7, React Hook Form, Lucide Icons, `@supabase/supabase-js`, Zod
- **Backend**: Node.js, Express.js, TypeScript, `@google/genai` (Official Google GenAI SDK), Supabase JS, Helmet, CORS, Express Rate Limit, Zod
- **Database & Auth**: Supabase PostgreSQL, Supabase Auth, Row Level Security (RLS), Supabase Realtime

---

## 📁 Repository Structure

```
c:\Users\lekha\OneDrive\Desktop\pro\
├── client/                     # React + Vite Frontend
│   ├── src/
│   │   ├── components/         # Reusable UI component suite
│   │   ├── context/            # AuthContext & Session management
│   │   ├── hooks/              # Custom hooks
│   │   ├── lib/                # Supabase & API client utilities
│   │   ├── pages/              # Application Pages
│   │   └── types/              # TypeScript type definitions
│   ├── index.html
│   ├── tailwind.config.js
│   ├── vite.config.ts
│   └── package.json
├── server/                     # Express Backend Server
│   ├── src/
│   │   ├── controllers/        # Profile, Dashboard, Interview, Study Plan, Progress
│   │   ├── middleware/         # Auth verification & Rate limiters
│   │   ├── routes/             # API Router definitions
│   │   ├── services/           # Gemini API service (@google/genai SDK)
│   │   ├── validation/         # Zod schemas for payloads & AI JSON outputs
│   │   └── app.ts / server.ts  # Express app setup & server entry
│   └── package.json
├── supabase/
│   └── migrations/             # PostgreSQL database migrations & RLS policies
└── README.md
```

---

## 🚀 How to Run Locally

### 1. Prerequisite Check
Ensure you have **Node.js (v18+)** and **npm** installed.

### 2. Install Dependencies

In the root directory, install client and server dependencies:

```bash
# Install Client Dependencies
cd client
cmd /c npm install

# Install Server Dependencies
cd ../server
cmd /c npm install
```

### 3. Environment Variables Setup

#### Client (`client/.env`)
```env
VITE_SUPABASE_URL=https://your-supabase-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
VITE_API_BASE_URL=http://localhost:5000
```

#### Backend Server (`server/.env`)
```env
PORT=5000
SUPABASE_URL=https://your-supabase-project.supabase.co
SUPABASE_ANON_KEY=your-supabase-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key
GEMINI_API_KEY=your-gemini-api-key
CLIENT_URL=http://localhost:3000
```

*(Note: If `GEMINI_API_KEY` or `SUPABASE_URL` is omitted, the application automatically enters intelligent local workshop demo mode, enabling full feature testing without external API requirements).*

### 4. Database Setup & Migrations

1. Log in to your [Supabase Dashboard](https://supabase.com).
2. Go to **SQL Editor**.
3. Copy and execute the contents of [`supabase/migrations/20260805000000_initial_schema.sql`](file:///c:/Users/lekha/OneDrive/Desktop/pro/supabase/migrations/20260805000000_initial_schema.sql).
4. Verify that tables (`profiles`, `interview_sessions`, `interview_questions`, `interview_answers`, `study_plans`, `progress`) and RLS policies have been created.

### 3. Windows PowerShell Execution Policy Fix (If `npm.ps1 cannot be loaded` occurs)

If you see `npm.ps1 cannot be loaded because running scripts is disabled on this system` in Windows PowerShell, run this command once in PowerShell:

```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

Or run `npm.cmd run dev` / use **Command Prompt (`cmd.exe`)** instead of PowerShell.

### 4. Launch Application

Start the backend server and frontend development server:

```bash
# Terminal 1: Backend Server (Port 5000)
cd server
npm.cmd run dev

# Terminal 2: Frontend App (Port 3000)
cd client
npm.cmd run dev
```

Open `http://localhost:3000` in your web browser.

---

## 🔒 Security Measures

1. **Backend Secret Isolation**: `GEMINI_API_KEY` and `SUPABASE_SERVICE_ROLE_KEY` are kept strictly on the backend server.
2. **Hidden Evaluation Criteria**: Question `expected_points` are stored on the server database and stripped from frontend responses during active interviews to prevent client tampering.
3. **Supabase RLS**: All PostgreSQL tables enforce Row Level Security ensuring `auth.uid() = user_id`.
4. **Rate Limiting**: AI endpoints are rate-limited to 30 calls / 15 mins to prevent API quota abuse.
5. **Safe Error Handling**: Internal stack traces and raw AI model parse errors are logged privately on the server.

---

## 🌐 Deployment Instructions

- **Frontend**: Deploy `client/` to Vercel, Netlify, or Cloudflare Pages with `VITE_API_BASE_URL` pointing to your deployed Express backend API URL.
- **Backend**: Deploy `server/` to Render, Railway, or AWS App Runner as a Node service running `cmd /c npm run build` and `cmd /c npm start`.
