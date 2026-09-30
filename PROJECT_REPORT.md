# 1. Title: CareerPilot — AI-Based Smart Placement & Resume Analyzer

## 2. Abstract
The modern college placement season is highly competitive, requiring students to present optimized profiles to prospective employers. However, many students lack the necessary guidance to format resumes effectively for Applicant Tracking Systems (ATS) or to identify critical skill gaps. This project introduces CareerPilot, an AI-Based Smart Placement and Resume Analyzer designed to bridge this gap. Built as a comprehensive full-stack application using Next.js, React, and PostgreSQL, CareerPilot automates the resume evaluation process. It provides immediate ATS scoring, keyword extraction, and structural feedback. Furthermore, the system incorporates an intelligent job matching engine that aligns student skills with relevant industry roles, alongside an integrated application tracker and tailored interview preparation modules. By digitizing and enhancing the placement preparation workflow, CareerPilot empowers students to significantly improve their employability and streamlines the traditionally manual efforts of college career cells.

## 3. Introduction
The transition from academia to the professional world is a critical juncture for college students. During campus placements, the resume serves as the first point of contact between a student and a potential employer. With the widespread adoption of Applicant Tracking Systems (ATS) by HR departments, a well-qualified candidate might be rejected simply due to poor resume formatting or missing keywords. CareerPilot aims to contextualize this challenge by providing an accessible, AI-driven platform that mimics industry ATS behavior, offering students a strategic advantage in their job search.

## 4. Problem Statement
Students often struggle to optimize their resumes without personalized feedback. Manual resume review by college career cells is unscalable and subjective. Furthermore, students lack structured, centralized tools to track their applications, understand their skill gaps relative to market demands, and prepare for role-specific interviews, leading to disorganized and inefficient placement efforts.

## 5. Existing System
Current solutions mostly consist of generic online resume builders or premium ATS checking services. These tools are often fragmented; a student must use one platform for resume scoring, another for job hunting, and yet another (like Excel) for tracking applications. They often lack contextual integration specific to a college student's placement journey and rarely offer robust, personalized interview preparation in the same ecosystem.

## 6. Proposed System
CareerPilot is a unified, intelligent platform that replaces fragmented tools. It acts as an end-to-end placement assistant. The system processes uploaded resumes to extract text, analyzes it against industry standards, and returns an ATS score. It then leverages this data to match the user with suitable job profiles, highlight skill deficiencies, and generate targeted interview questions, all manageable from a central dashboard.

## 7. Objectives
- To develop an automated system for parsing and analyzing student resumes.
- To provide actionable feedback and ATS scoring to improve resume quality.
- To implement an algorithm that matches student profiles with relevant job descriptions.
- To identify missing skills required for target roles (Skill Gap Analysis).
- To create a centralized dashboard for tracking job applications.
- To generate role-specific interview preparation materials using AI.
- To ensure the system remains functional via fallback mechanisms if external AI fails.

## 8. Scope
**In Scope:** Resume parsing (PDF/TXT), AI and rule-based ATS scoring, skill matching, application tracking board, interview question generation, and user authentication.
**Out of Scope:** Direct integration with company HR portals, live video mock interviews, and automated job applying (botting).

## 9. Functional Requirements
- **User Authentication Module:** Secure registration, login, and session management.
- **Resume Analysis Module:** File upload, text extraction, ATS score calculation, and feedback generation.
- **Job Matching Module:** Algorithm to compare user skills against job requirements and return ranked matches.
- **Application Tracking Module:** CRUD operations for job applications categorized by status (e.g., Applied, Interviewing).
- **Interview Prep Module:** Generation of customized questions based on target roles.

## 10. Non-functional Requirements
- **Performance:** Resume analysis should return results within 5 seconds.
- **Security:** Passwords must be hashed; sensitive data protected via JWT; file uploads validated against malicious scripts.
- **Usability:** The interface must be responsive, intuitive, and accessible on both desktop and mobile browsers.
- **Reliability:** Fallback mechanisms must ensure basic analysis is available even during external API downtimes.

## 11. System Architecture
The application utilizes a decoupled client-server architecture built on the Next.js App Router framework. 
*(Please refer to ARCHITECTURE.md for detailed Mermaid diagrams including the High-Level Architecture, DB ER Diagram, and data flows).*
The frontend communicates via RESTful API routes to a backend service layer, which interfaces with a PostgreSQL database via Prisma ORM and external AI services.

## 12. Technology Stack

| Component | Technology |
|---|---|
| Frontend | Next.js 15, React, TypeScript, Tailwind CSS |
| Backend | Node.js, Next.js API Routes |
| Database | PostgreSQL (Production) / SQLite (Development) |
| ORM | Prisma |
| Authentication | Custom JWT via `jose`, PBKDF2 hashing |
| Validation | Zod |

## 13. Database Design
The database schema is designed around the `User` entity. Key relationships include:
- `User` 1:N `Resume`
- `Resume` 1:1 `ResumeAnalysis`
- `User` 1:N `JobApplication`
- `User` 1:N `UserSkill`
*(See ARCHITECTURE.md for the complete ER Diagram).*

## 14. Module Description
- **Authentication:** Uses secure HTTP-only cookies storing JWTs.
- **Resume Engine:** Accepts PDF/TXT, utilizes parsing libraries to extract raw text, and feeds it to the AI/Fallback services to generate an ATS score and keyword list.
- **Dashboard:** An aggregated view presenting recent applications, average scores, and pending tasks using Recharts for visual analytics.
- **Job Matcher:** Cross-references parsed skills with a database of job descriptions to output a match percentage.

## 15. API Design
The RESTful API provides structured endpoints for all functionalities. For example, `POST /api/resume/analyze` handles the core processing, while `GET /api/applications` retrieves user-specific tracking data. *(Refer to API.md for full endpoint specifications).*

## 16. Security
Security is implemented at multiple layers: PBKDF2 for password hashing, strict Zod schemas to prevent injection attacks, sanitized file uploads to prevent path traversal, and route-level authorization checks to ensure data privacy. *(Refer to SECURITY.md for details).*

## 17. Testing
The project employs a mix of unit tests for core logic (e.g., scoring algorithms) and integration tests for API endpoints. Testing ensures features like JWT validation and resume parsing perform correctly under various conditions. *(Refer to TESTING.md for details).*

## 18. Results
The deployed system successfully automates resume evaluation, returning accurate ATS feedback in real-time. The application tracker provides a clean, visual representation of a student's placement journey, significantly reducing the friction associated with managing multiple job applications.

## 19. Limitations
Currently, the system's AI features are dependent on the latency of external LLM APIs. The file parser handles standard formats but may struggle with highly complex, multi-column image-based PDFs. The platform also lacks real-time social or collaborative features.

## 20. Future Scope
Future enhancements include implementing OCR for image-based PDFs, integrating social logins (Google/LinkedIn) for frictionless onboarding, developing a dedicated mobile app, and adding a collaborative peer-review module for resumes.

## 21. Conclusion
CareerPilot successfully addresses the inefficiencies in the college placement preparation process. By unifying resume analysis, job matching, and application tracking into a single AI-enhanced platform, it empowers students to approach their job search analytically and confidently, ultimately improving placement outcomes.

## 22. References
1. Next.js Documentation. Vercel. https://nextjs.org/docs
2. Prisma Documentation. Prisma Data Inc. https://www.prisma.io/docs
3. Tailwind CSS Documentation. Tailwind Labs. https://tailwindcss.com/docs
4. OWASP Top Ten Web Application Security Risks. Open Web Application Security Project. https://owasp.org/www-project-top-ten/
