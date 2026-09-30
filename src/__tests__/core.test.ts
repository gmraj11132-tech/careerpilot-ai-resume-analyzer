import { parseResumeText } from '../lib/resume-parser';
import { analyzeResumeFallback, matchJobFallback, generateInterviewQuestionsFallback } from '../lib/fallback-analyzer';
import { ParsedResume } from '../lib/types';
import { registerSchema, loginSchema, jobApplicationSchema } from '../lib/validations';
import { hashPassword, verifyPassword } from '../lib/auth';

// ================================================================
// UNIT TESTS - Resume Parser
// ================================================================

describe('Resume Parser', () => {
  const sampleResumeText = `John Smith
john.smith@example.com
+91-9876543210

Summary
Experienced software developer with 3 years of experience in web development.

Education
B.Tech Computer Science
ABC University
2020 - 2024

Skills
JavaScript, TypeScript, React, Node.js, Python, Git, Docker

Projects
E-Commerce Platform
Built a full-stack e-commerce application with payment integration.
Technologies: React, Node.js, MongoDB

Chat Application
Real-time messaging application with websocket support.
Technologies: React, Socket.io, Express

Experience
Software Developer Intern
XYZ Corp
Jan 2024 - Jun 2024
Developed and maintained web applications using React and Node.js.

Certifications
AWS Cloud Practitioner
Google Analytics Certified`;

  test('extracts email correctly', () => {
    const result = parseResumeText(sampleResumeText);
    expect(result.email).toBe('john.smith@example.com');
  });

  test('extracts phone number', () => {
    const result = parseResumeText(sampleResumeText);
    expect(result.phone).toBeTruthy();
  });

  test('extracts name from first line', () => {
    const result = parseResumeText(sampleResumeText);
    expect(result.name).toBe('John Smith');
  });

  test('extracts skills', () => {
    const result = parseResumeText(sampleResumeText);
    expect(result.skills.length).toBeGreaterThan(0);
    expect(result.skills).toContain('JavaScript');
    expect(result.skills).toContain('React');
  });

  test('extracts education', () => {
    const result = parseResumeText(sampleResumeText);
    expect(result.education.length).toBeGreaterThan(0);
  });

  test('extracts projects', () => {
    const result = parseResumeText(sampleResumeText);
    expect(result.projects.length).toBeGreaterThan(0);
  });

  test('extracts certifications', () => {
    const result = parseResumeText(sampleResumeText);
    expect(result.certifications.length).toBeGreaterThan(0);
  });

  test('extracts summary', () => {
    const result = parseResumeText(sampleResumeText);
    expect(result.summary).toBeTruthy();
    expect(result.summary).toContain('software developer');
  });

  test('preserves raw text', () => {
    const result = parseResumeText(sampleResumeText);
    expect(result.rawText).toBeTruthy();
    expect(result.rawText.length).toBeGreaterThan(100);
  });

  test('handles empty resume', () => {
    const result = parseResumeText('');
    expect(result.name).toBe('');
    expect(result.email).toBe('');
    expect(result.skills).toEqual([]);
  });

  test('handles resume with only name and email', () => {
    const result = parseResumeText('Jane Doe\njane@example.com');
    expect(result.name).toBe('Jane Doe');
    expect(result.email).toBe('jane@example.com');
  });
});

// ================================================================
// UNIT TESTS - Fallback Analyzer
// ================================================================

describe('Fallback Resume Analyzer', () => {
  const sampleParsed: ParsedResume = {
    name: 'Test User',
    email: 'test@example.com',
    phone: '+1-555-0100',
    education: [{ institution: 'Test University', degree: 'B.Tech', field: 'CS', year: '2024' }],
    skills: ['JavaScript', 'React', 'Node.js', 'Python', 'TypeScript', 'Git'],
    projects: [
      { name: 'Project A', description: 'Built a web app', technologies: ['React', 'Node.js'] },
      { name: 'Project B', description: 'ML model', technologies: ['Python', 'TensorFlow'] },
    ],
    experience: [
      { company: 'Corp A', role: 'Intern', duration: 'Jun 2024 - Aug 2024', description: 'Developed web apps' },
    ],
    certifications: ['AWS Certified'],
    summary: 'Motivated developer with experience in web development.',
    rawText: 'Test User test@example.com Summary Motivated developer with experience in web development and machine learning. Developed and implemented multiple projects.',
  };

  test('returns scores between 0 and 100', () => {
    const result = analyzeResumeFallback(sampleParsed);
    expect(result.overall).toBeGreaterThanOrEqual(0);
    expect(result.overall).toBeLessThanOrEqual(100);
    expect(result.ats).toBeGreaterThanOrEqual(0);
    expect(result.ats).toBeLessThanOrEqual(100);
    expect(result.skills).toBeGreaterThanOrEqual(0);
    expect(result.skills).toBeLessThanOrEqual(100);
  });

  test('higher skill count gives higher skill score', () => {
    const lowSkills = { ...sampleParsed, skills: ['JavaScript'] };
    const highSkills = { ...sampleParsed, skills: ['JavaScript', 'React', 'Node.js', 'Python', 'TypeScript', 'Git', 'Docker', 'AWS', 'MongoDB', 'SQL', 'HTML', 'CSS'] };

    const lowResult = analyzeResumeFallback(lowSkills);
    const highResult = analyzeResumeFallback(highSkills);

    expect(highResult.skills).toBeGreaterThan(lowResult.skills);
  });

  test('detects missing sections', () => {
    const noSummary = { ...sampleParsed, summary: '' };
    const result = analyzeResumeFallback(noSummary);
    expect(result.missingSections).toContain('Summary/Objective');
  });

  test('provides suggestions', () => {
    const result = analyzeResumeFallback(sampleParsed);
    expect(result.suggestions.length).toBeGreaterThan(0);
  });

  test('returns detected skills', () => {
    const result = analyzeResumeFallback(sampleParsed);
    expect(result.detectedSkills.length).toBeGreaterThan(0);
  });
});

// ================================================================
// UNIT TESTS - Job Matching
// ================================================================

describe('Fallback Job Matcher', () => {
  const sampleParsed: ParsedResume = {
    name: 'Test User',
    email: 'test@example.com',
    phone: '+1-555-0100',
    education: [{ institution: 'Test Uni', degree: 'B.Tech', field: 'CS', year: '2024' }],
    skills: ['JavaScript', 'React', 'Node.js', 'Python', 'TypeScript'],
    projects: [
      { name: 'Web App', description: 'React web application', technologies: ['React', 'Node.js'] },
    ],
    experience: [
      { company: 'Corp', role: 'Frontend Developer', duration: '2024', description: 'Built React apps' },
    ],
    certifications: [],
    summary: 'Frontend developer',
    rawText: 'JavaScript React Node.js Python TypeScript frontend developer React apps',
  };

  const jobDescription = `
    We are looking for a Frontend Developer with experience in React, TypeScript, and Node.js.
    Requirements:
    - Proficiency in React and TypeScript
    - Experience with Node.js and REST APIs
    - Knowledge of CSS and responsive design
    - Experience with Git version control
    - Nice to have: Docker, AWS, GraphQL
  `;

  test('returns match percentage between 0 and 100', () => {
    const result = matchJobFallback(sampleParsed, jobDescription, 'Frontend Developer');
    expect(result.matchPercentage).toBeGreaterThanOrEqual(0);
    expect(result.matchPercentage).toBeLessThanOrEqual(100);
  });

  test('identifies matching skills', () => {
    const result = matchJobFallback(sampleParsed, jobDescription, 'Frontend Developer');
    expect(result.matchingSkills.length).toBeGreaterThan(0);
  });

  test('identifies missing skills', () => {
    const result = matchJobFallback(sampleParsed, jobDescription, 'Frontend Developer');
    // Docker, AWS, or GraphQL should be missing
    expect(result.missingSkills.length).toBeGreaterThan(0);
  });

  test('extracts keywords', () => {
    const result = matchJobFallback(sampleParsed, jobDescription, 'Frontend Developer');
    expect(result.keywords.length).toBeGreaterThan(0);
  });

  test('provides suggested changes', () => {
    const result = matchJobFallback(sampleParsed, jobDescription, 'Frontend Developer');
    expect(result.suggestedChanges.length).toBeGreaterThan(0);
  });

  test('higher skill match gives higher percentage', () => {
    const lowSkillResume = { ...sampleParsed, skills: ['Python'] };
    const highSkillResume = { ...sampleParsed, skills: ['React', 'TypeScript', 'Node.js', 'CSS', 'Git'] };

    const lowResult = matchJobFallback(lowSkillResume, jobDescription, 'Frontend Developer');
    const highResult = matchJobFallback(highSkillResume, jobDescription, 'Frontend Developer');

    expect(highResult.matchPercentage).toBeGreaterThan(lowResult.matchPercentage);
  });
});

// ================================================================
// UNIT TESTS - Interview Questions
// ================================================================

describe('Interview Question Generator', () => {
  test('generates questions', () => {
    const questions = generateInterviewQuestionsFallback('Software Developer', ['JavaScript', 'React'], 'MEDIUM');
    expect(questions.length).toBeGreaterThan(0);
    expect(questions.length).toBeLessThanOrEqual(10);
  });

  test('questions have required fields', () => {
    const questions = generateInterviewQuestionsFallback('Frontend Developer', ['React'], 'EASY');
    for (const q of questions) {
      expect(q.category).toBeDefined();
      expect(q.question).toBeTruthy();
      expect(q.suggestedAnswer).toBeTruthy();
      expect(q.keyPoints.length).toBeGreaterThan(0);
      expect(q.difficulty).toBeDefined();
    }
  });

  test('includes multiple categories', () => {
    const questions = generateInterviewQuestionsFallback('Developer', ['JavaScript'], 'MEDIUM');
    const categories = new Set(questions.map(q => q.category));
    expect(categories.size).toBeGreaterThanOrEqual(2);
  });

  test('works with HARD difficulty', () => {
    const questions = generateInterviewQuestionsFallback('Senior Developer', ['Java', 'Docker'], 'HARD');
    expect(questions.length).toBeGreaterThan(0);
  });
});

// ================================================================
// UNIT TESTS - Validation
// ================================================================

describe('Input Validation', () => {

  test('register: rejects short password', () => {
    const result = registerSchema.safeParse({
      name: 'Test',
      email: 'test@test.com',
      password: 'short',
    });
    expect(result.success).toBe(false);
  });

  test('register: rejects invalid email', () => {
    const result = registerSchema.safeParse({
      name: 'Test',
      email: 'not-an-email',
      password: 'ValidPass1',
    });
    expect(result.success).toBe(false);
  });

  test('register: accepts valid input', () => {
    const result = registerSchema.safeParse({
      name: 'Test User',
      email: 'test@example.com',
      password: 'ValidPass1',
    });
    expect(result.success).toBe(true);
  });

  test('register: requires uppercase in password', () => {
    const result = registerSchema.safeParse({
      name: 'Test',
      email: 'test@test.com',
      password: 'alllowercase1',
    });
    expect(result.success).toBe(false);
  });

  test('login: accepts valid credentials', () => {
    const result = loginSchema.safeParse({
      email: 'test@test.com',
      password: 'anypassword',
    });
    expect(result.success).toBe(true);
  });

  test('application: requires company and title', () => {
    const result = jobApplicationSchema.safeParse({
      company: '',
      jobTitle: '',
      appliedDate: '2024-01-01',
      status: 'SAVED',
    });
    expect(result.success).toBe(false);
  });

  test('application: accepts valid input', () => {
    const result = jobApplicationSchema.safeParse({
      company: 'Test Corp',
      jobTitle: 'Developer',
      appliedDate: '2024-01-01',
      status: 'APPLIED',
      location: 'Remote',
    });
    expect(result.success).toBe(true);
  });

  test('application: rejects invalid status', () => {
    const result = jobApplicationSchema.safeParse({
      company: 'Test',
      jobTitle: 'Dev',
      appliedDate: '2024-01-01',
      status: 'INVALID_STATUS',
    });
    expect(result.success).toBe(false);
  });
});

// ================================================================
// UNIT TESTS - Auth
// ================================================================

describe('Password Hashing', () => {

  test('hashes password', async () => {
    const hash = await hashPassword('TestPassword1');
    expect(hash).toBeTruthy();
    expect(hash).not.toBe('TestPassword1');
    expect(hash).toContain(':');
  });

  test('verifies correct password', async () => {
    const hash = await hashPassword('TestPassword1');
    const isValid = await verifyPassword('TestPassword1', hash);
    expect(isValid).toBe(true);
  });

  test('rejects wrong password', async () => {
    const hash = await hashPassword('TestPassword1');
    const isValid = await verifyPassword('WrongPassword1', hash);
    expect(isValid).toBe(false);
  });

  test('different hashes for same password', async () => {
    const hash1 = await hashPassword('TestPassword1');
    const hash2 = await hashPassword('TestPassword1');
    expect(hash1).not.toBe(hash2); // Different salts
  });
});

// ================================================================
// UNIT TESTS - Multi-Model AI Service & Model Options
// ================================================================

import { AVAILABLE_MODELS } from '../lib/types';
import { analyzeResume, matchJob, generateInterviewQuestions } from '../lib/ai-service';

describe('Multi-Model AI Service', () => {
  const sampleParsed: ParsedResume = {
    name: 'Jane Doe',
    email: 'jane@example.com',
    phone: '+91-9999999999',
    education: [
      { institution: 'ABC University', degree: 'B.Tech', field: 'CSE', year: '2025' }
    ],
    skills: ['Python', 'React', 'TypeScript', 'SQL', 'FastAPI'],
    projects: [
      { name: 'AI Portal', description: 'Web app with AI', technologies: ['React', 'FastAPI'] }
    ],
    experience: [],
    certifications: ['AWS Cloud Practitioner'],
    summary: 'Aspiring software engineer with full-stack skills.',
    rawText: 'Jane Doe resume text',
  };

  test('AVAILABLE_MODELS contains all target providers', () => {
    const providers = AVAILABLE_MODELS.map(m => m.provider);
    expect(providers).toContain('google');
    expect(providers).toContain('openai');
    expect(providers).toContain('anthropic');
    expect(providers).toContain('groq');
    expect(providers).toContain('fallback');
  });

  test('analyzeResume falls back gracefully when API key is missing', async () => {
    const result = await analyzeResume(sampleParsed, {
      modelId: 'deterministic-fallback',
      provider: 'fallback',
    });
    expect(result.mode).toBe('FALLBACK');
    expect(result.score.overall).toBeGreaterThanOrEqual(0);
    expect(result.score.overall).toBeLessThanOrEqual(100);
    expect(result.modelName).toBe('Deterministic Heuristic Engine');
  });

  test('analyzeResume routes properly with explicit model selection', async () => {
    const result = await analyzeResume(sampleParsed, {
      modelId: 'gemini-2.0-flash',
      provider: 'google',
    });
    // In test environment without GEMINI_API_KEY, gracefully falls back to deterministic engine
    expect(result.score).toBeDefined();
    expect(result.score.ats).toBeGreaterThan(0);
  });

  test('matchJob works with custom model parameter', async () => {
    const match = await matchJob(
      sampleParsed,
      'Seeking a React and TypeScript engineer with Python skills.',
      'Software Engineer',
      { modelId: 'gpt-4o', provider: 'openai' }
    );
    expect(match.result).toBeDefined();
    expect(match.result.matchPercentage).toBeGreaterThan(0);
    expect(match.result.matchingSkills).toContain('React');
  });

  test('generateInterviewQuestions works across difficulty levels with model options', async () => {
    const result = await generateInterviewQuestions(
      'Full Stack Developer',
      ['React', 'TypeScript', 'Node.js'],
      'HARD',
      { modelId: 'groq-llama-3.3-70b', provider: 'groq' }
    );
    expect(result.questions.length).toBeGreaterThan(0);
    expect(result.questions[0].difficulty).toBe('HARD');
  });
});

