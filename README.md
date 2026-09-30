<div align="center">

# 🚀 CareerPilot
### *AI-Based Smart Placement & Resume Analyzer*

[![Next.js](https://img.shields.io/badge/Next.js-16.3-black?style=for-the-badge&logo=next.js&logoColor=white)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19.3-blue?style=for-the-badge&logo=react&logoColor=61DAFB)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4.0-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Prisma ORM](https://img.shields.io/badge/Prisma-6.19-2D3748?style=for-the-badge&logo=prisma&logoColor=white)](https://www.prisma.io/)
[![License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)](LICENSE)
[![Build Status](https://img.shields.io/badge/Build-Passing-brightgreen?style=for-the-badge)]()
[![Tests](https://img.shields.io/badge/Tests-43%20Passed-success?style=for-the-badge)]()

**A production-ready, full-stack campus placement suite and resume optimization engine for engineering students.**

[Explore Features](#-core-features--modules) • [How It Solves Real-World Problems](#-real-world-problem--solution) • [Quick Setup](#-quick-start-guide) • [Deploy to Vercel](#-free-public-deployment-guide-vercel)

</div>

---

## 📌 Project Overview

**CareerPilot** is an end-to-end full-stack web platform built for computer science engineering students facing campus placement drives. It addresses the high failure rates caused by automated **Applicant Tracking Systems (ATS)**, unstructured interview preparation, and skill misalignments between academic curricula and hiring requirements.

Designed with a **hybrid AI architecture**, CareerPilot allows students to evaluate resumes against real-world job postings using state-of-the-art LLMs (**Google Gemini 2.0 Flash**, **OpenAI GPT-4o**, **Anthropic Claude 3.5**, **Groq LLaMA 3.3**) or a **100% offline, zero-cost Deterministic Heuristic Engine** that runs entirely locally without requiring credit cards or external API keys.

---

## 🎯 Real-World Problem & Solution

### 1. The Real-World Problem
* **The "ATS Black Hole"**: Over **75% of resumes** are automatically filtered out by company ATS algorithms before an HR or engineering manager ever reads them due to non-standard headings, missing keywords, and improper formatting.
* **Skill Misalignment**: Students frequently possess strong fundamentals but do not know which specific industry terms, frameworks, or cloud tools a company expects.
* **Expensive Proprietary Tools**: Commercial resume scanners (Jobscan, Enhancv) charge **\$30–\$50 per month**, making them unaffordable for college students.
* **Scattered Placement Tracking**: Students track dozens of company applications, assessments, and interview dates using unorganized Excel spreadsheets or WhatsApp chats, leading to missed deadlines.
* **Unstructured Interview Prep**: Generic Google search results for interview questions do not match the specific job requirements or candidate projects.

### 2. How CareerPilot Solves This
| Challenge Faced by Students | CareerPilot Solution | Real-World Impact |
|---|---|---|
| **ATS Rejections** | Weighted multi-metric ATS scoring & format audit | Eliminates parsing errors; maximizes keyword match density. |
| **Missing Tech Stack Skills** | Smart Job Description Matcher & Gap Matrix | Gives exact missing keywords and recommended learning paths. |
| **Tool Costs & API Dependency** | Hybrid AI + Offline Heuristic Fallback | 100% free; works out-of-the-box on any college lab machine. |
| **Disorganized Applications** | Integrated Kanban Pipeline Tracker | Centralizes applications across Saved, Assessment, Interview, Offer. |
| **Generic Interview Practice** | Role-tailored STAR methodology question generator | Generates technical, HR, behavioral, and project deep-dive questions with model answer structures. |

---

## ⚡ Core Features & Modules

```
CareerPilot Platform
├── 1. Multi-Format Resume Ingestion (PDF, DOCX, TXT, Direct Paste)
├── 2. Multi-Model AI Evaluation Dispatcher
│   ├── Google Gemini 2.0 Flash / 1.5 Pro
│   ├── OpenAI GPT-4o / GPT-4o Mini
│   ├── Anthropic Claude 3.5 Sonnet
│   ├── Groq Llama 3.3 70B & DeepSeek R1
│   └── 100% Offline Deterministic Heuristic Engine
├── 3. ATS Scoring & Section Quality Audit (0–100)
├── 4. Smart Job Description Matcher & Keyword Gap Analyzer
├── 5. Interactive Skill Matrix & Categorized Learning Tracker
├── 6. Placement Application Pipeline (Kanban Lifecycle)
├── 7. Role-Specific Mock Interview Studio (STAR Framework)
└── 8. Secure Role-Based Authentication (PBKDF2 SHA-512 + JWT)
```

### Module Breakdown

#### 📄 1. Resume Upload & Multi-Stage Parser (`/resume/upload`)
* **Multi-Format Extraction**: Supports `.pdf`, `.docx`, and `.txt` files up to 10MB.
* **Decompression Pipeline**: Employs `pdf-parse` v2 and Node.js `zlib` stream decompressors to extract text from compressed `/FlateDecode` PDF streams (Canva, Word, Google Docs exports).
* **Direct Text Paste**: Includes an alternate instant text-paste tab with sample resume loading for image-only scans.
* **Extracted Section Preview**: Visual verification of parsed contact details, education, technical skills, projects, and work experience before saving.

#### 🧠 2. Multi-Model Resume Analyzer (`/resume/analyze`)
* **CareerPilot Score (0–100)**: Internal composite evaluation with a comprehensive breakdown:
  * **ATS Readability**: Formatting, section demarcation, and parser compatibility.
  * **Skills Depth**: Coverage of technical and soft competencies.
  * **Experience & Projects**: Quantified impact, action verbs, and technical role descriptions.
  * **Education Integrity**: Academic institution and degree completeness.
* **Model Switcher**: Allows students to run evaluations with Gemini 2.0 Flash, GPT-4o, Claude 3.5, Groq, or the offline Heuristic Engine, displaying the model badge directly on results.

#### 🎯 3. Smart Job Matcher (`/jobs/match`)
* Paste any real job posting description from LinkedIn, Indeed, or campus placement portals.
* Computes an **alignment percentage**, highlighting **Matching Skills**, **Missing Skills**, **ATS Keywords**, and **Suggested Resume Changes**.

#### 📊 4. Skill Gap Matrix (`/skills`)
* Categorizes student competencies across **Programming**, **Web Development**, **Databases**, **Data Science**, **AI/ML**, **Cloud/DevOps**, **Tools**, and **Soft Skills**.
* Interactive status cycling: `Identified` ➔ `Learning` ➔ `Completed`.

#### 📋 5. Application Pipeline Tracker (`/applications`)
* Full lifecycle tracking for on-campus and off-campus placements:
  * `Saved` • `Applied` • `Assessment` • `Interview` • `Offer` • `Rejected`.
* Dynamic status filtering, keyword search, and statistics bar.

#### 🎤 6. AI Interview Studio (`/interview`)
* Generates role-specific questions categorized into:
  * **Technical**: Data structures, APIs, database design, system architecture.
  * **HR / Cultural**: Career aspirations, company alignment, conflict resolution.
  * **Behavioral**: STAR format (Situation, Task, Action, Result) scenario questions.
  * **Project Deep-Dive**: Technical trade-offs, architecture decisions, and debugging stories.

---

## 🏗️ System Architecture

```mermaid
flowchart TD
    subgraph Client [Frontend - Next.js 16 + React 19]
        Landing[Landing Page]
        Auth[Auth Module: Login/Register]
        Dash[Student Dashboard]
        UploadUI[Resume Ingestion UI]
        AnalyzeUI[Multi-Model Analyzer UI]
        MatchUI[Job Matcher UI]
        SkillsUI[Skill Gap UI]
        TrackUI[Application Tracker UI]
        PrepUI[Interview Prep Studio UI]
    end

    subgraph Server [Backend - Next.js App Router API]
        AuthAPI[/api/auth/*]
        ResumeAPI[/api/resume/*]
        JobAPI[/api/jobs/*]
        SkillsAPI[/api/skills/*]
        AppAPI[/api/applications/*]
        InterviewAPI[/api/interview/*]
    end

    subgraph Engine [AI Dispatcher & Parser Layer]
        Parser[Multi-Stage PDF/DOCX Parser]
        Router{Model Selector}
        Gemini[Google Gemini 2.0 Flash]
        OpenAI[OpenAI GPT-4o]
        Claude[Anthropic Claude 3.5]
        Groq[Groq Llama 3.3]
        Offline[Deterministic Heuristic Engine]
    end

    subgraph Storage [Data Layer]
        DB[(Prisma ORM - SQLite / PostgreSQL)]
    end

    Client --> Server
    ResumeAPI --> Parser
    AnalyzeAPI --> Router
    JobAPI --> Router
    InterviewAPI --> Router

    Router --> Gemini
    Router --> OpenAI
    Router --> Claude
    Router --> Groq
    Router --> Offline

    Server --> DB
```

---

## 🔒 Security & Engineering Best Practices

* **Password Security**: Passwords salted and hashed with **PBKDF2** (100,000 iterations, SHA-512). Passwords never stored in plaintext.
* **Session Management**: Dual cookie and Authorization header handling via **JSON Web Tokens (JWT HS256)** using `jose`.
* **Input Validation**: Strict **Zod schemas** validate every API input, preventing SQL injection and payload malformations.
* **File Upload Defense**: File size capped at 10MB; MIME types and extensions verified; safe filename sanitization prevents path traversal (`../`).
* **Zero Secret Exposure**: `.env` and SQLite databases strictly ignored by `.gitignore`.
* **Security Headers**: Middleware enforces `X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY`, `X-XSS-Protection`, and `Referrer-Policy`.

---

## 💻 Tech Stack

| Domain | Technology | Rationale |
|---|---|---|
| **Framework** | **Next.js 16.3 (App Router)** | Full-stack server-side rendering, API routes, Turbopack bundling. |
| **UI Library** | **React 19.3** | Modern state management, concurrent features, component isolation. |
| **Language** | **TypeScript 5.0** | End-to-end type safety, typed API responses, zero runtime regressions. |
| **Styling** | **Tailwind CSS 4.0** | Modern, responsive SaaS design, dark/light theme variables. |
| **ORM & Database** | **Prisma 6.19 + SQLite / PostgreSQL** | Type-safe schema migrations, relation modeling, seamless production swap. |
| **Security** | **PBKDF2 (SHA-512) + jose (JWT)** | Cryptographically resilient password derivation and stateless auth. |
| **File Processing** | **pdf-parse + mammoth + zlib** | Multi-layer PDF decompression and Word document text extraction. |
| **Testing** | **Jest + ts-jest** | 43 comprehensive unit and integration tests. |

---

## 🚀 Quick Start Guide

### Prerequisites
* **Node.js**: v18.0.0 or higher
* **Git**: Installed and configured

### 1. Clone the Repository
```bash
git clone https://github.com/gmraj11132-tech/careerpilot-ai-resume-analyzer.git
cd careerpilot-ai-resume-analyzer
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Configure Environment Variables
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```
*(CareerPilot runs 100% offline out-of-the-box. API keys are completely optional!)*

### 4. Initialize Database & Seed Demo Accounts
```bash
npx prisma generate
npx prisma db push
npx prisma db seed
```

### 5. Start Development Server
```bash
npm run dev
```
Open your browser and navigate to: **[http://localhost:3000](http://localhost:3000)**

---

## 🔑 Pre-Configured Demo Credentials

For quick testing and evaluations, use the pre-seeded accounts:

| Role | Email Address | Password | Purpose |
|---|---|---|---|
| **Student** | `demo@careerpilot.dev` | `Demo@1234` | Full access to resume upload, AI analysis, job matching, and trackers. |
| **Admin** | `admin@careerpilot.dev` | `Admin@1234` | Aggregate platform placement statistics and candidate overviews. |

*(The `/login` screen also includes **1-Click Quick Demo Login** buttons for instant testing!)*

---

## 🧪 Running the Test Suite

CareerPilot includes 43 unit and integration tests covering parser accuracy, scoring algorithms, multi-model routing, authentication, and validation:

```bash
npm test
```

Expected output:
```bash
PASS src/__tests__/core.test.ts
  Resume Parser
    ✓ extracts email correctly
    ✓ extracts phone number
    ✓ extracts name from first line
    ✓ extracts skills
    ✓ extracts education, projects, certifications, summary
  Fallback Resume Analyzer
    ✓ returns scores between 0 and 100
    ✓ detects missing sections and provides recommendations
  Fallback Job Matcher
    ✓ calculates match percentage and extracts key keywords
  Interview Question Generator
    ✓ generates categorized questions with model answer structures
  Input Validation
    ✓ rejects invalid passwords and malformed payloads
  Password Hashing
    ✓ hashes and verifies passwords using PBKDF2 (SHA-512)
  Multi-Model AI Service
    ✓ verifies all providers (Google, OpenAI, Claude, Groq, Fallback)

Test Suites: 1 passed, 1 total
Tests:       43 passed, 43 total
```

---

## 🌐 Free Public Deployment Guide (Vercel)

CareerPilot is engineered for 1-click deployment to **Vercel** with a free public domain (`*.vercel.app`):

### Step 1: Open Vercel Dashboard
1. Go to [https://vercel.com](https://vercel.com) and log in with your GitHub account.
2. Click **"Add New..."** ➔ **"Project"**.

### Step 2: Import Repository
1. Select **`careerpilot-ai-resume-analyzer`** from your GitHub repositories list.
2. Click **"Import"**.

### Step 3: Configure Environment Variables
In the Vercel **Environment Variables** section, add:
* `DATABASE_URL`: Your database connection string *(For production, use a free cloud PostgreSQL database like [Neon.tech](https://neon.tech), [Supabase](https://supabase.com), or [Railway](https://railway.app))*.
* `AUTH_SECRET`: A random 32+ character string (e.g. `careerpilot-secret-prod-auth-key-2025`).
* *(Optional)* `GEMINI_API_KEY`: Your Google Gemini API key if using AI mode in production.

### Step 4: Deploy
Click **"Deploy"**. Vercel will build and assign your free live public domain:
👉 `https://careerpilot-ai-resume-analyzer.vercel.app`

---

## 🎓 Academic Defense & Viva Q&A Guide

**Q1: Why create an internal scoring system instead of using an official ATS score?**  
> *A: Proprietary ATS systems (Workday, Taleo, Greenhouse) use closed-source, proprietary ranking algorithms. CareerPilot provides an honest, objective heuristic and AI-assisted guideline without making unverifiable claims.*

**Q2: How does the application function if external LLMs are down or unavailable?**  
> *A: CareerPilot features a built-in deterministic heuristic analyzer implemented in TypeScript (`src/lib/fallback-analyzer.ts`). It performs localized keyword tokenization, section completeness scans, and rule-based scoring with 0ms latency and 100% offline availability.*

**Q3: How are passwords stored and verified?**  
> *A: Passwords are salted with cryptographically secure random bytes and derived using PBKDF2 with SHA-512 over 100,000 iterations. Plaintext passwords are never logged or stored.*

---

## 📄 License

This project is licensed under the **MIT License** — see the [LICENSE](LICENSE) file for details.

---

<div align="center">
  <b>Developed by <a href="https://github.com/gmraj11132-tech">gmraj11132-tech</a></b><br>
  <i>B.Tech Computer Science & Engineering Capstone Project</i>
</div>
