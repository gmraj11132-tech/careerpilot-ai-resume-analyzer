import {
  ResumeScore,
  JobMatchResult,
  InterviewQuestionData,
  ParsedResume,
  AIProvider,
  ModelExecutionOptions,
  AVAILABLE_MODELS,
} from './types';
import {
  analyzeResumeFallback,
  matchJobFallback,
  generateInterviewQuestionsFallback,
} from './fallback-analyzer';

// ================================================================
// MULTI-MODEL AI SERVICE ABSTRACTION
// Routes intelligently to selected LLM provider (Google Gemini,
// OpenAI, Anthropic Claude, Groq) or falls back seamlessly to
// the local deterministic heuristic analysis engine.
// ================================================================

export type AnalysisMode = 'AI' | 'FALLBACK';

interface ResolvedModelConfig {
  provider: AIProvider;
  model: string;
  displayName: string;
  apiKey?: string;
  isFallback: boolean;
}

function resolveModelConfig(options?: ModelExecutionOptions): ResolvedModelConfig {
  const modelId = options?.modelId || 'gemini-2.0-flash';
  const foundModel = AVAILABLE_MODELS.find(m => m.id === modelId || m.model === modelId);

  let provider: AIProvider = options?.provider || foundModel?.provider || 'google';
  let model = foundModel?.model || modelId;
  let displayName = foundModel?.name || modelId;

  if (modelId === 'deterministic-fallback' || provider === 'fallback') {
    return {
      provider: 'fallback',
      model: 'rule-based-v1',
      displayName: 'Deterministic Heuristic Engine',
      isFallback: true,
    };
  }

  // Determine API key
  let apiKey = options?.customApiKey?.trim();

  if (!apiKey) {
    if (provider === 'google') {
      apiKey = process.env.GEMINI_API_KEY || process.env.AI_API_KEY;
    } else if (provider === 'openai') {
      apiKey = process.env.OPENAI_API_KEY || process.env.AI_API_KEY;
    } else if (provider === 'anthropic') {
      apiKey = process.env.ANTHROPIC_API_KEY || process.env.AI_API_KEY;
    } else if (provider === 'groq') {
      apiKey = process.env.GROQ_API_KEY || process.env.AI_API_KEY;
    } else {
      apiKey = process.env.AI_API_KEY;
    }
  }

  const isFallback = !apiKey || apiKey.length === 0;

  return {
    provider,
    model,
    displayName,
    apiKey,
    isFallback,
  };
}

function cleanJsonString(raw: string): string {
  // Remove markdown codeblock fences if present
  let cleaned = raw.replace(/```(?:json)?\s*([\s\S]*?)\s*```/i, '$1').trim();
  
  // If still wrapped in quotes or extra text, locate first { or [ and matching last } or ]
  const firstBrace = cleaned.indexOf('{');
  const firstBracket = cleaned.indexOf('[');

  if (firstBrace !== -1 && (firstBracket === -1 || firstBrace < firstBracket)) {
    const lastBrace = cleaned.lastIndexOf('}');
    if (lastBrace !== -1) {
      cleaned = cleaned.slice(firstBrace, lastBrace + 1);
    }
  } else if (firstBracket !== -1) {
    const lastBracket = cleaned.lastIndexOf(']');
    if (lastBracket !== -1) {
      cleaned = cleaned.slice(firstBracket, lastBracket + 1);
    }
  }

  return cleaned;
}

// ================================================================
// PUBLIC API METHODS
// ================================================================

export async function analyzeResume(
  parsed: ParsedResume,
  options?: ModelExecutionOptions
): Promise<{
  score: ResumeScore;
  mode: AnalysisMode;
  modelName: string;
  provider: string;
}> {
  const config = resolveModelConfig(options);

  if (!config.isFallback && config.apiKey) {
    try {
      const score = await analyzeResumeWithAI(parsed, config);
      return {
        score,
        mode: 'AI',
        modelName: config.displayName,
        provider: config.provider,
      };
    } catch (error) {
      console.warn(
        `AI resume analysis with ${config.displayName} failed, falling back to rule-based:`,
        error
      );
    }
  }

  return {
    score: analyzeResumeFallback(parsed),
    mode: 'FALLBACK',
    modelName: 'Deterministic Heuristic Engine',
    provider: 'fallback',
  };
}

export async function matchJob(
  parsed: ParsedResume,
  jobDescription: string,
  jobTitle: string,
  options?: ModelExecutionOptions
): Promise<{
  result: JobMatchResult;
  mode: AnalysisMode;
  modelName: string;
  provider: string;
}> {
  const config = resolveModelConfig(options);

  if (!config.isFallback && config.apiKey) {
    try {
      const result = await matchJobWithAI(parsed, jobDescription, jobTitle, config);
      return {
        result,
        mode: 'AI',
        modelName: config.displayName,
        provider: config.provider,
      };
    } catch (error) {
      console.warn(
        `AI job matching with ${config.displayName} failed, falling back to rule-based:`,
        error
      );
    }
  }

  return {
    result: matchJobFallback(parsed, jobDescription, jobTitle),
    mode: 'FALLBACK',
    modelName: 'Deterministic Heuristic Engine',
    provider: 'fallback',
  };
}

export async function generateInterviewQuestions(
  jobTitle: string,
  skills: string[],
  difficulty: 'EASY' | 'MEDIUM' | 'HARD',
  options?: ModelExecutionOptions
): Promise<{
  questions: InterviewQuestionData[];
  mode: AnalysisMode;
  modelName: string;
  provider: string;
}> {
  const config = resolveModelConfig(options);

  if (!config.isFallback && config.apiKey) {
    try {
      const questions = await generateQuestionsWithAI(jobTitle, skills, difficulty, config);
      return {
        questions,
        mode: 'AI',
        modelName: config.displayName,
        provider: config.provider,
      };
    } catch (error) {
      console.warn(
        `AI question generation with ${config.displayName} failed, falling back:`,
        error
      );
    }
  }

  return {
    questions: generateInterviewQuestionsFallback(jobTitle, skills, difficulty),
    mode: 'FALLBACK',
    modelName: 'Deterministic Heuristic Engine',
    provider: 'fallback',
  };
}

// ================================================================
// MULTI-PROVIDER DISPATCHER
// ================================================================

async function callProviderAPI(
  prompt: string,
  config: ResolvedModelConfig
): Promise<string> {
  const { provider, model, apiKey } = config;
  if (!apiKey) throw new Error('API key is missing');

  switch (provider) {
    case 'google':
      return callGeminiAPI(apiKey, model, prompt);
    case 'openai':
      return callOpenAIAPI(apiKey, model, prompt);
    case 'anthropic':
      return callAnthropicAPI(apiKey, model, prompt);
    case 'groq':
      return callGroqAPI(apiKey, model, prompt);
    default:
      throw new Error(`Unsupported AI provider: ${provider}`);
  }
}

// Google Gemini API
async function callGeminiAPI(apiKey: string, model: string, prompt: string): Promise<string> {
  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.2,
          maxOutputTokens: 2500,
        },
      }),
    }
  );

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Gemini API error (${response.status}): ${errorText}`);
  }

  const data = await response.json();
  return data.candidates?.[0]?.content?.parts?.[0]?.text || '';
}

// OpenAI API (GPT-4o, GPT-4o-mini)
async function callOpenAIAPI(apiKey: string, model: string, prompt: string): Promise<string> {
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.2,
      max_tokens: 2500,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`OpenAI API error (${response.status}): ${errorText}`);
  }

  const data = await response.json();
  return data.choices?.[0]?.message?.content || '';
}

// Anthropic Claude API (Claude 3.5 Sonnet, Claude 3 Haiku)
async function callAnthropicAPI(apiKey: string, model: string, prompt: string): Promise<string> {
  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model,
      max_tokens: 2500,
      messages: [{ role: 'user', content: prompt }],
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Anthropic API error (${response.status}): ${errorText}`);
  }

  const data = await response.json();
  return data.content?.[0]?.text || '';
}

// Groq API (Llama 3.3 70B, DeepSeek R1, Mixtral)
async function callGroqAPI(apiKey: string, model: string, prompt: string): Promise<string> {
  const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.2,
      max_tokens: 2500,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Groq API error (${response.status}): ${errorText}`);
  }

  const data = await response.json();
  return data.choices?.[0]?.message?.content || '';
}

// ================================================================
// AI EXECUTION HANDLERS
// ================================================================

async function analyzeResumeWithAI(
  parsed: ParsedResume,
  config: ResolvedModelConfig
): Promise<ResumeScore> {
  const prompt = `You are CareerPilot's expert ATS & Resume Evaluation Engine.
Analyze this resume data and return a JSON object with scores (0-100) and actionable recommendations.

Resume Candidate Data:
- Candidate Name: ${parsed.name || 'Not specified'}
- Extracted Skills: ${parsed.skills.join(', ') || 'None detected'}
- Education: ${JSON.stringify(parsed.education)}
- Projects (${parsed.projects.length}): ${parsed.projects.map(p => p.name).join(', ')}
- Work Experience (${parsed.experience.length}): ${parsed.experience.map(e => e.role).join(', ')}
- Certifications: ${parsed.certifications.join(', ') || 'None'}
- Summary Present: ${Boolean(parsed.summary)}

Evaluation Criteria:
1. "overall": composite weighted score (0-100).
2. "ats": ATS readability, keyword density, section structuring (0-100).
3. "skills": breadth and depth of technical/soft skills (0-100).
4. "experience": internships, real-world impact, responsibilities (0-100).
5. "education": completeness of academic details (0-100).
6. "formatting": clarity, consistency, structure (0-100).
7. "missingSections": list of standard sections missing (e.g. "Work Experience", "Certifications", "Professional Summary").
8. "detectedSkills": list of all verified skills found in the profile.
9. "suggestions": 4 to 6 specific, actionable tips to improve the resume for campus placements.

Return ONLY a valid JSON object matching this exact schema:
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

  const rawText = await callProviderAPI(prompt, config);
  const jsonStr = cleanJsonString(rawText);
  return JSON.parse(jsonStr) as ResumeScore;
}

async function matchJobWithAI(
  parsed: ParsedResume,
  jobDescription: string,
  jobTitle: string,
  config: ResolvedModelConfig
): Promise<JobMatchResult> {
  const prompt = `You are CareerPilot's Smart Job Matching Engine.
Compare this candidate's resume against the target job posting and output a detailed gap analysis as JSON.

Candidate Profile:
- Skills: ${parsed.skills.join(', ')}
- Projects: ${parsed.projects.map(p => `${p.name} (${p.technologies.join(', ')})`).join('; ')}
- Experience: ${parsed.experience.map(e => `${e.role} at ${e.company}`).join('; ')}

Target Position:
- Job Title: ${jobTitle}
- Job Description:
${jobDescription.slice(0, 3000)}

Return ONLY a valid JSON object matching this schema:
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

  const rawText = await callProviderAPI(prompt, config);
  const jsonStr = cleanJsonString(rawText);
  return JSON.parse(jsonStr) as JobMatchResult;
}

async function generateQuestionsWithAI(
  jobTitle: string,
  skills: string[],
  difficulty: string,
  config: ResolvedModelConfig
): Promise<InterviewQuestionData[]> {
  const prompt = `You are CareerPilot's AI Technical Interviewer.
Generate 8 comprehensive interview questions for a ${jobTitle} campus placement candidate.
Key Skills Tested: ${skills.join(', ')}
Target Difficulty: ${difficulty}

Include:
- 2 TECHNICAL questions
- 2 HR / Culture fit questions
- 2 BEHAVIORAL questions (STAR methodology)
- 2 PROJECT / Architecture deep-dive questions

Return ONLY a valid JSON array of objects with this schema:
[
  {
    "category": "TECHNICAL" | "HR" | "BEHAVIORAL" | "PROJECT",
    "question": string,
    "suggestedAnswer": string,
    "keyPoints": string[],
    "difficulty": "${difficulty}"
  }
]`;

  const rawText = await callProviderAPI(prompt, config);
  const jsonStr = cleanJsonString(rawText);
  return JSON.parse(jsonStr) as InterviewQuestionData[];
}
