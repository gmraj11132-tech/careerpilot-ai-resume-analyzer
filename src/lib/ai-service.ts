import {
  ResumeScore,
  JobMatchResult,
  InterviewQuestionData,
  ParsedResume,
} from './types';
import {
  analyzeResumeFallback,
  matchJobFallback,
  generateInterviewQuestionsFallback,
} from './fallback-analyzer';

// ================================================================
// AI SERVICE ABSTRACTION
// Routes to LLM provider when API key is available,
// falls back to deterministic analysis otherwise
// ================================================================

export type AnalysisMode = 'AI' | 'FALLBACK';

function getAnalysisMode(): AnalysisMode {
  const apiKey = process.env.AI_API_KEY;
  return apiKey && apiKey.trim().length > 0 ? 'AI' : 'FALLBACK';
}

export async function analyzeResume(parsed: ParsedResume): Promise<{
  score: ResumeScore;
  mode: AnalysisMode;
}> {
  const mode = getAnalysisMode();

  if (mode === 'AI') {
    try {
      const score = await analyzeResumeWithAI(parsed);
      return { score, mode: 'AI' };
    } catch (error) {
      console.warn('AI analysis failed, falling back to rule-based:', error);
      return { score: analyzeResumeFallback(parsed), mode: 'FALLBACK' };
    }
  }

  return { score: analyzeResumeFallback(parsed), mode: 'FALLBACK' };
}

export async function matchJob(
  parsed: ParsedResume,
  jobDescription: string,
  jobTitle: string
): Promise<{
  result: JobMatchResult;
  mode: AnalysisMode;
}> {
  const mode = getAnalysisMode();

  if (mode === 'AI') {
    try {
      const result = await matchJobWithAI(parsed, jobDescription, jobTitle);
      return { result, mode: 'AI' };
    } catch (error) {
      console.warn('AI matching failed, falling back to rule-based:', error);
      return { result: matchJobFallback(parsed, jobDescription, jobTitle), mode: 'FALLBACK' };
    }
  }

  return { result: matchJobFallback(parsed, jobDescription, jobTitle), mode: 'FALLBACK' };
}

export async function generateInterviewQuestions(
  jobTitle: string,
  skills: string[],
  difficulty: 'EASY' | 'MEDIUM' | 'HARD'
): Promise<{
  questions: InterviewQuestionData[];
  mode: AnalysisMode;
}> {
  const mode = getAnalysisMode();

  if (mode === 'AI') {
    try {
      const questions = await generateQuestionsWithAI(jobTitle, skills, difficulty);
      return { questions, mode: 'AI' };
    } catch (error) {
      console.warn('AI question generation failed, falling back:', error);
      return {
        questions: generateInterviewQuestionsFallback(jobTitle, skills, difficulty),
        mode: 'FALLBACK',
      };
    }
  }

  return {
    questions: generateInterviewQuestionsFallback(jobTitle, skills, difficulty),
    mode: 'FALLBACK',
  };
}

// ================================================================
// AI PROVIDER IMPLEMENTATIONS
// These use the configured AI_API_KEY and AI_PROVIDER
// ================================================================

async function callAI(prompt: string): Promise<string> {
  const apiKey = process.env.AI_API_KEY;
  const provider = process.env.AI_PROVIDER || 'gemini';

  if (!apiKey) throw new Error('No AI API key configured');

  if (provider === 'gemini') {
    return callGemini(apiKey, prompt);
  }

  throw new Error(`Unsupported AI provider: ${provider}`);
}

async function callGemini(apiKey: string, prompt: string): Promise<string> {
  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.3,
          maxOutputTokens: 2048,
        },
      }),
    }
  );

  if (!response.ok) {
    throw new Error(`Gemini API error: ${response.status}`);
  }

  const data = await response.json();
  return data.candidates?.[0]?.content?.parts?.[0]?.text || '';
}

async function analyzeResumeWithAI(parsed: ParsedResume): Promise<ResumeScore> {
  const prompt = `Analyze this resume and return a JSON object with scores (0-100) and suggestions.

Resume data:
- Name: ${parsed.name}
- Skills: ${parsed.skills.join(', ')}
- Education: ${JSON.stringify(parsed.education)}
- Projects: ${parsed.projects.length} projects
- Experience: ${parsed.experience.length} entries
- Has summary: ${!!parsed.summary}
- Has certifications: ${parsed.certifications.length > 0}

Return ONLY a valid JSON object with this exact structure:
{
  "overall": number,
  "ats": number,
  "skills": number,
  "experience": number,
  "education": number,
  "formatting": number,
  "missingSections": string[],
  "detectedSkills": string[],
  "suggestions": string[]
}`;

  const response = await callAI(prompt);
  const jsonMatch = response.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error('Invalid AI response format');

  return JSON.parse(jsonMatch[0]) as ResumeScore;
}

async function matchJobWithAI(
  parsed: ParsedResume,
  jobDescription: string,
  jobTitle: string
): Promise<JobMatchResult> {
  const prompt = `Compare this resume against a job description and return match analysis as JSON.

Resume Skills: ${parsed.skills.join(', ')}
Resume Projects: ${parsed.projects.map(p => p.name).join(', ')}
Resume Experience: ${parsed.experience.map(e => e.role).join(', ')}

Job Title: ${jobTitle}
Job Description: ${jobDescription.slice(0, 2000)}

Return ONLY a valid JSON object:
{
  "matchPercentage": number,
  "matchingSkills": string[],
  "missingSkills": string[],
  "relevantProjects": string[],
  "relevantExperience": string[],
  "suggestedChanges": string[],
  "suggestedTopics": string[],
  "keywords": string[]
}`;

  const response = await callAI(prompt);
  const jsonMatch = response.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error('Invalid AI response format');

  return JSON.parse(jsonMatch[0]) as JobMatchResult;
}

async function generateQuestionsWithAI(
  jobTitle: string,
  skills: string[],
  difficulty: string
): Promise<InterviewQuestionData[]> {
  const prompt = `Generate 8 interview questions for a ${jobTitle} position.
Skills: ${skills.join(', ')}
Difficulty: ${difficulty}

Return ONLY a valid JSON array of objects:
[{
  "category": "TECHNICAL" | "HR" | "BEHAVIORAL" | "PROJECT",
  "question": string,
  "suggestedAnswer": string,
  "keyPoints": string[],
  "difficulty": "${difficulty}"
}]

Include at least 2 technical, 2 HR, 2 behavioral, and 2 project-based questions.`;

  const response = await callAI(prompt);
  const jsonMatch = response.match(/\[[\s\S]*\]/);
  if (!jsonMatch) throw new Error('Invalid AI response format');

  return JSON.parse(jsonMatch[0]) as InterviewQuestionData[];
}
