# CareerPilot — AI-Based Smart Placement & Resume Analyzer

## Description, Problem Statement, Objectives

**Description**: CareerPilot is an AI-powered platform designed to streamline the placement process for college students. It provides intelligent resume analysis, job matching, skill gap identification, and personalized interview preparation.

**Problem Statement**: College placement seasons are highly competitive and stressful. Students often struggle to optimize their resumes for Applicant Tracking Systems (ATS) and lack structured, personalized preparation tools. Manual resume review by career cells is time-consuming and difficult to scale.

**Objectives**:
- Automate resume parsing and scoring to provide instant, actionable feedback.
- Match students with suitable job opportunities based on their skills and profiles.
- Identify skill gaps and recommend areas for improvement.
- Provide tailored interview questions and preparation materials.
- Offer an intuitive application tracking system for students.

## Features

- **Multi-Model AI Resume Analysis**: Upload PDF or DOCX resumes and analyze with Google Gemini 2.0 Flash / 1.5 Pro, OpenAI GPT-4o / GPT-4o Mini, Anthropic Claude 3.5 Sonnet, or Groq Llama 3.3 70B, with automatic deterministic fallback.
- **CareerPilot ATS Scoring**: Comprehensive weighted scoring across ATS readability, skills match, experience, education, and structural formatting.
- **Job Matching & Keyword Alignment**: Paste any job opening requirements to compute match percentages, identify missing skills, and extract target ATS keywords.
- **Skill Gap Analysis**: Categorized skills tracker (Programming, Web Dev, Databases, AI/ML, Cloud/DevOps) with interactive status cycling (Identified, Learning, Completed).
- **Application Tracker**: Full pipeline tracking for applications (Saved, Applied, Assessment, Interview, Offer, Rejected) with search and filtering.
- **AI Interview Prep**: Generate realistic technical, HR, behavioral (STAR), and project questions tailored to target roles with structured model answers.
- **100% Offline Deterministic Engine**: Built-in deterministic rule engine guaranteeing zero-cost, instant offline evaluation without requiring external API keys.

## Tech Stack

| Category | Technology |
|---|---|
| Frontend | Next.js 15, React, TypeScript, Tailwind CSS, lucide-react, recharts |
| Backend | Next.js App Router (API Routes), Node.js |
| Database | Prisma ORM, SQLite (dev) / PostgreSQL (prod) |
| Authentication | custom JWT via `jose`, PBKDF2 |
| Validation | Zod |

## System Architecture Overview

CareerPilot follows a modern, decoupled architecture. The frontend is built with Next.js App Router, providing server-side rendering for optimal performance. The backend leverages Next.js API routes, interacting with the database via Prisma ORM. An AI Service layer handles intelligent features, with a robust fallback analyzer to ensure high availability. Authentication is securely managed using HTTP-only cookies and JWTs.

## Screenshots

<!-- Screenshots will be added -->
- *Dashboard View*
- *Resume Analysis Report*
- *Job Matching Interface*

## Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/gmraj11132-tech/careerpilot-ai-resume-analyzer.git
   cd careerpilot-ai-resume-analyzer
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Environment Setup**:
   ```bash
   cp .env.example .env
   ```
   *Fill in the required environment variables.*

4. **Database Setup**:
   ```bash
   npx prisma generate
   npx prisma db push
   npx prisma db seed
   ```

5. **Run Development Server**:
   ```bash
   npm run dev
   ```

## Environment Variables

| Variable | Description |
|---|---|
| `DATABASE_URL` | Connection string for the database (SQLite for dev, PostgreSQL for prod) |
| `AUTH_SECRET` | Secret key for JWT signing |
| `AI_API_KEY` | API key for external AI services (if applicable) |

## Running Locally

After following the installation steps, the application will be accessible at `http://localhost:3000`.

## Testing

Run the test suite using:
```bash
npm test
```

## Deployment

**Vercel Deployment**:
1. Push your code to a GitHub repository.
2. Import the repository in the Vercel dashboard.
3. Configure the environment variables (set `DATABASE_URL` to a PostgreSQL instance like Neon or Supabase).
4. Vercel will automatically build and deploy the Next.js application.
5. Run `npx prisma migrate deploy` against your production database.

## Future Scope

- Enhanced AI models for deeper insights and personalized learning paths.
- Integration of social logins (Google, LinkedIn).
- PDF export for resume analysis reports and application summaries.
- Dedicated mobile application (React Native / Flutter).
- Collaborative features for peer reviews and mock interviews.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---
**GitHub**: [gmraj11132-tech](https://github.com/gmraj11132-tech)
