import {
  ResumeScore,
  JobMatchResult,
  InterviewQuestionData,
  ParsedResume,
  ALL_SKILLS,
  SKILL_CATEGORIES,
} from './types';

// ================================================================
// FALLBACK ANALYZER - Works without any external AI API
// Provides deterministic, rule-based analysis
// ================================================================

const IMPORTANT_SECTIONS = [
  'summary',
  'education',
  'skills',
  'experience',
  'projects',
  'certifications',
];

const RESUME_KEYWORDS = [
  'developed', 'implemented', 'designed', 'managed', 'led', 'created',
  'built', 'improved', 'reduced', 'increased', 'analyzed', 'deployed',
  'optimized', 'automated', 'collaborated', 'mentored', 'achieved',
  'delivered', 'launched', 'integrated', 'maintained', 'architected',
];

export function analyzeResumeFallback(parsed: ParsedResume): ResumeScore {
  const scores = {
    skills: scoreSkills(parsed),
    experience: scoreExperience(parsed),
    education: scoreEducation(parsed),
    formatting: scoreFormatting(parsed),
  };

  const missingSections = findMissingSections(parsed);
  const detectedSkills = parsed.skills.slice(0, 30);
  const suggestions = generateSuggestions(parsed, scores, missingSections);

  // ATS score: based on section presence, keywords, and formatting
  const atsScore = Math.round(
    (scores.skills * 0.3 + scores.experience * 0.25 + scores.education * 0.2 + scores.formatting * 0.25) *
    (1 - missingSections.length * 0.05)
  );

  const overall = Math.round(
    scores.skills * 0.25 + scores.experience * 0.25 + scores.education * 0.2 + scores.formatting * 0.15 +
    (100 - missingSections.length * 10) * 0.15
  );

  return {
    overall: clamp(overall, 0, 100),
    ats: clamp(atsScore, 0, 100),
    skills: clamp(scores.skills, 0, 100),
    experience: clamp(scores.experience, 0, 100),
    education: clamp(scores.education, 0, 100),
    formatting: clamp(scores.formatting, 0, 100),
    missingSections,
    detectedSkills,
    suggestions,
  };
}

function clamp(val: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, val));
}

function scoreSkills(parsed: ParsedResume): number {
  const count = parsed.skills.length;
  if (count === 0) return 15;
  if (count < 3) return 35;
  if (count < 6) return 55;
  if (count < 10) return 70;
  if (count < 15) return 85;
  return 95;
}

function scoreExperience(parsed: ParsedResume): number {
  let score = 30;

  // Projects count
  score += Math.min(parsed.projects.length * 12, 36);

  // Experience entries
  score += Math.min(parsed.experience.length * 15, 30);

  // Action verbs in text
  const lowerText = parsed.rawText.toLowerCase();
  const actionVerbCount = RESUME_KEYWORDS.filter(kw => lowerText.includes(kw)).length;
  score += Math.min(actionVerbCount * 2, 14);

  return clamp(score, 0, 100);
}

function scoreEducation(parsed: ParsedResume): number {
  if (parsed.education.length === 0) return 20;
  let score = 50;
  if (parsed.education.length > 0) score += 20;
  if (parsed.education.some(e => e.degree)) score += 15;
  if (parsed.education.some(e => e.year)) score += 10;
  if (parsed.education.some(e => e.institution)) score += 5;
  return clamp(score, 0, 100);
}

function scoreFormatting(parsed: ParsedResume): number {
  let score = 50;

  // Has contact info
  if (parsed.email) score += 10;
  if (parsed.phone) score += 10;
  if (parsed.name) score += 10;

  // Reasonable length
  const wordCount = parsed.rawText.split(/\s+/).length;
  if (wordCount > 100 && wordCount < 1200) score += 10;
  if (wordCount >= 200 && wordCount <= 800) score += 5;

  // Has sections
  const sections = Object.keys(SECTION_MAP).filter(s => {
    const regex = new RegExp(`(?:^|\\n)\\s*${s}`, 'i');
    return regex.test(parsed.rawText);
  });
  score += Math.min(sections.length * 3, 15);

  return clamp(score, 0, 100);
}

const SECTION_MAP: Record<string, boolean> = {
  education: true,
  experience: true,
  skills: true,
  projects: true,
  certifications: true,
  summary: true,
  objective: true,
};

function findMissingSections(parsed: ParsedResume): string[] {
  const missing: string[] = [];
  if (!parsed.summary) missing.push('Summary/Objective');
  if (parsed.education.length === 0) missing.push('Education');
  if (parsed.skills.length === 0) missing.push('Skills');
  if (parsed.experience.length === 0 && parsed.projects.length === 0) {
    missing.push('Experience or Projects');
  }
  if (!parsed.email) missing.push('Email');
  if (!parsed.phone) missing.push('Phone Number');
  return missing;
}

function generateSuggestions(
  parsed: ParsedResume,
  scores: Record<string, number>,
  missing: string[]
): string[] {
  const suggestions: string[] = [];

  if (missing.length > 0) {
    suggestions.push(`Add missing sections: ${missing.join(', ')}`);
  }

  if (parsed.skills.length < 5) {
    suggestions.push('Add more technical skills relevant to your target roles');
  }

  if (parsed.projects.length < 2) {
    suggestions.push('Include at least 2-3 projects with technologies used and outcomes achieved');
  }

  if (!parsed.summary) {
    suggestions.push('Add a professional summary or career objective at the top');
  }

  if (parsed.experience.length === 0) {
    suggestions.push('Add internship or work experience if available');
  }

  const lowerText = parsed.rawText.toLowerCase();
  const actionVerbCount = RESUME_KEYWORDS.filter(kw => lowerText.includes(kw)).length;
  if (actionVerbCount < 5) {
    suggestions.push('Use more action verbs (developed, implemented, designed, led, etc.)');
  }

  if (parsed.certifications.length === 0) {
    suggestions.push('Consider adding relevant certifications or online courses');
  }

  const wordCount = parsed.rawText.split(/\s+/).length;
  if (wordCount < 150) {
    suggestions.push('Your resume appears too short. Add more details about your projects and skills.');
  }
  if (wordCount > 1000) {
    suggestions.push('Consider shortening your resume to 1-2 pages for better readability');
  }

  if (scores.formatting < 60) {
    suggestions.push('Improve formatting: ensure clear section headings and consistent structure');
  }

  return suggestions.slice(0, 10);
}

// ================================================================
// JOB MATCHING - Fallback
// ================================================================

export function matchJobFallback(
  parsed: ParsedResume,
  jobDescription: string,
  jobTitle: string
): JobMatchResult {
  const jdLower = jobDescription.toLowerCase();
  const jdWords = new Set(jdLower.split(/\W+/).filter(w => w.length > 2));

  // Extract required skills from JD
  const jdSkills = ALL_SKILLS.filter(skill => jdLower.includes(skill.toLowerCase()));
  const resumeSkills = new Set(parsed.skills.map(s => s.toLowerCase()));

  const matchingSkills = jdSkills.filter(s => resumeSkills.has(s.toLowerCase()));
  const missingSkills = jdSkills.filter(s => !resumeSkills.has(s.toLowerCase()));

  // Relevant projects
  const relevantProjects = parsed.projects
    .filter(p => {
      const pText = `${p.name} ${p.description} ${p.technologies.join(' ')}`.toLowerCase();
      return jdSkills.some(s => pText.includes(s.toLowerCase()));
    })
    .map(p => p.name);

  // Relevant experience
  const relevantExperience = parsed.experience
    .filter(e => {
      const eText = `${e.role} ${e.description}`.toLowerCase();
      return jdWords.has(jobTitle.toLowerCase().split(' ')[0]) ||
        jdSkills.some(s => eText.includes(s.toLowerCase()));
    })
    .map(e => `${e.role} at ${e.company}`);

  // Calculate match percentage
  const totalRequired = jdSkills.length || 1;
  const skillMatch = (matchingSkills.length / totalRequired) * 100;

  // Also consider keyword overlap
  const resumeWords = new Set(parsed.rawText.toLowerCase().split(/\W+/));
  const keywordOverlap = Array.from(jdWords).filter(w => resumeWords.has(w)).length;
  const keywordScore = Math.min((keywordOverlap / Math.max(jdWords.size, 1)) * 100, 100);

  const matchPercentage = Math.round(skillMatch * 0.6 + keywordScore * 0.4);

  // Extract important keywords from JD
  const keywords = extractKeywords(jobDescription);

  // Generate suggestions
  const suggestedChanges: string[] = [];
  if (missingSkills.length > 0) {
    suggestedChanges.push(`Add these skills if applicable: ${missingSkills.slice(0, 5).join(', ')}`);
  }
  if (relevantProjects.length === 0) {
    suggestedChanges.push(`Add projects relevant to "${jobTitle}"`);
  }
  suggestedChanges.push('Tailor your resume summary to match the job description');
  suggestedChanges.push('Include specific metrics and achievements where possible');

  const suggestedTopics = missingSkills.slice(0, 8).map(s => `Learn ${s}`);

  return {
    matchPercentage: clamp(matchPercentage, 0, 100),
    matchingSkills,
    missingSkills,
    relevantProjects,
    relevantExperience,
    suggestedChanges,
    suggestedTopics,
    keywords,
  };
}

function extractKeywords(text: string): string[] {
  const words = text.toLowerCase().split(/\W+/).filter(w => w.length > 3);
  const freq: Record<string, number> = {};
  const stopWords = new Set([
    'with', 'that', 'this', 'have', 'from', 'they', 'will', 'been', 'their',
    'said', 'each', 'which', 'about', 'other', 'were', 'there', 'what',
    'your', 'when', 'make', 'like', 'than', 'just', 'over', 'also',
    'should', 'would', 'could', 'into', 'after', 'before', 'must',
  ]);

  for (const word of words) {
    if (!stopWords.has(word)) {
      freq[word] = (freq[word] || 0) + 1;
    }
  }

  return Object.entries(freq)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 15)
    .map(([word]) => word);
}

// ================================================================
// INTERVIEW QUESTIONS - Fallback question bank
// ================================================================

const QUESTION_BANK: InterviewQuestionData[] = [
  // Technical
  {
    category: 'TECHNICAL',
    question: 'Explain the difference between SQL and NoSQL databases. When would you use each?',
    suggestedAnswer: 'SQL databases are relational and use structured schemas (e.g., PostgreSQL, MySQL). NoSQL databases are non-relational and support flexible schemas (e.g., MongoDB, Redis). Use SQL for structured data with complex queries; NoSQL for scalability and flexible data models.',
    keyPoints: ['Relational vs non-relational', 'Schema flexibility', 'ACID vs eventual consistency', 'Use cases'],
    difficulty: 'EASY',
  },
  {
    category: 'TECHNICAL',
    question: 'What is the difference between REST and GraphQL APIs?',
    suggestedAnswer: 'REST uses multiple endpoints with fixed data structures. GraphQL uses a single endpoint where clients can specify exactly what data they need, reducing over-fetching and under-fetching.',
    keyPoints: ['Endpoints', 'Over-fetching', 'Under-fetching', 'Type system'],
    difficulty: 'EASY',
  },
  {
    category: 'TECHNICAL',
    question: 'Explain how authentication works in web applications.',
    suggestedAnswer: 'Authentication verifies user identity. Common approaches include session-based auth (server stores session), token-based auth (JWT), and OAuth. Passwords should be hashed, tokens should be stored securely, and HTTPS should be used.',
    keyPoints: ['Session vs Token', 'JWT', 'Password hashing', 'HTTPS', 'Cookie security'],
    difficulty: 'MEDIUM',
  },
  {
    category: 'TECHNICAL',
    question: 'What is the difference between TCP and UDP protocols?',
    suggestedAnswer: 'TCP is connection-oriented, reliable, and ensures ordered delivery. UDP is connectionless, faster, but unreliable. TCP is used for web browsing, email; UDP for streaming, gaming.',
    keyPoints: ['Connection-oriented vs connectionless', 'Reliability', 'Speed', 'Use cases'],
    difficulty: 'EASY',
  },
  {
    category: 'TECHNICAL',
    question: 'Explain the concept of Big O notation and common time complexities.',
    suggestedAnswer: 'Big O describes the upper bound of an algorithm\'s time/space complexity. Common: O(1) constant, O(log n) logarithmic, O(n) linear, O(n log n) linearithmic, O(n²) quadratic, O(2^n) exponential.',
    keyPoints: ['Upper bound', 'Time vs space', 'Common complexities', 'Practical examples'],
    difficulty: 'MEDIUM',
  },
  {
    category: 'TECHNICAL',
    question: 'What are design patterns? Explain any two you have used.',
    suggestedAnswer: 'Design patterns are reusable solutions to common software problems. Singleton ensures one instance of a class. Observer pattern defines a one-to-many dependency for event handling. Factory pattern creates objects without specifying exact classes.',
    keyPoints: ['Creational patterns', 'Structural patterns', 'Behavioral patterns', 'Real-world usage'],
    difficulty: 'MEDIUM',
  },
  {
    category: 'TECHNICAL',
    question: 'Explain microservices architecture and its advantages over monolithic architecture.',
    suggestedAnswer: 'Microservices decompose an application into small, independent services. Each service handles a specific domain, can be deployed independently, and can use different tech stacks. Advantages: scalability, team autonomy, fault isolation. Challenges: complexity, distributed data management.',
    keyPoints: ['Independent deployment', 'Scalability', 'Fault isolation', 'Complexity trade-off'],
    difficulty: 'HARD',
  },
  {
    category: 'TECHNICAL',
    question: 'What is Docker and how does containerization differ from virtualization?',
    suggestedAnswer: 'Docker packages applications with dependencies into containers. Containers share the host OS kernel and are lightweight. VMs run complete OS instances and are heavier. Containers start faster and use fewer resources.',
    keyPoints: ['Containers vs VMs', 'Docker images', 'Isolation', 'Resource efficiency'],
    difficulty: 'MEDIUM',
  },
  // HR
  {
    category: 'HR',
    question: 'Tell me about yourself.',
    suggestedAnswer: 'Structure: Current status → Education → Key skills → Notable projects/experience → Career goals. Keep it 2-3 minutes, relevant to the role.',
    keyPoints: ['Current status', 'Relevant skills', 'Key achievements', 'Career goals'],
    difficulty: 'EASY',
  },
  {
    category: 'HR',
    question: 'What are your strengths and weaknesses?',
    suggestedAnswer: 'Strengths: Pick 2-3 relevant to the role with examples. Weaknesses: Choose genuine but non-critical weaknesses and explain how you are improving.',
    keyPoints: ['Relevant strengths', 'Genuine weakness', 'Self-awareness', 'Growth mindset'],
    difficulty: 'EASY',
  },
  {
    category: 'HR',
    question: 'Why do you want to work at our company?',
    suggestedAnswer: 'Research the company beforehand. Mention specific products, culture, or values that align with your goals. Show genuine interest and how you can contribute.',
    keyPoints: ['Company research', 'Cultural fit', 'Growth opportunity', 'Contribution'],
    difficulty: 'EASY',
  },
  {
    category: 'HR',
    question: 'Where do you see yourself in 5 years?',
    suggestedAnswer: 'Show ambition while being realistic. Focus on skill growth, potential leadership, and domain expertise. Align with the company\'s growth trajectory.',
    keyPoints: ['Career growth', 'Skill development', 'Realistic ambition', 'Company alignment'],
    difficulty: 'MEDIUM',
  },
  {
    category: 'HR',
    question: 'What motivates you?',
    suggestedAnswer: 'Discuss intrinsic motivators: solving problems, learning new things, building impactful products. Mention specific examples of what energized you in past projects.',
    keyPoints: ['Intrinsic motivation', 'Specific examples', 'Problem-solving', 'Growth'],
    difficulty: 'EASY',
  },
  // Behavioral
  {
    category: 'BEHAVIORAL',
    question: 'Describe a time when you had to work under pressure.',
    suggestedAnswer: 'Use STAR method: Situation (deadline/challenge), Task (your responsibility), Action (what you did), Result (outcome). Emphasize time management and staying focused.',
    keyPoints: ['STAR method', 'Time management', 'Stress handling', 'Positive outcome'],
    difficulty: 'MEDIUM',
  },
  {
    category: 'BEHAVIORAL',
    question: 'Tell me about a time you had a conflict with a team member.',
    suggestedAnswer: 'STAR: Describe the situation without blaming. Focus on how you communicated, found common ground, and resolved the conflict. Highlight what you learned.',
    keyPoints: ['Conflict resolution', 'Communication', 'Compromise', 'Learning'],
    difficulty: 'MEDIUM',
  },
  {
    category: 'BEHAVIORAL',
    question: 'Describe a time you failed. What did you learn?',
    suggestedAnswer: 'Choose a genuine failure. Explain the situation, what went wrong, and the specific lessons learned. Show how you applied those lessons afterward.',
    keyPoints: ['Honesty', 'Self-reflection', 'Lessons learned', 'Growth'],
    difficulty: 'MEDIUM',
  },
  {
    category: 'BEHAVIORAL',
    question: 'Give an example of when you showed leadership.',
    suggestedAnswer: 'Describe leading a project or team. Focus on how you motivated others, made decisions, handled challenges, and achieved results.',
    keyPoints: ['Initiative', 'Decision-making', 'Team motivation', 'Results'],
    difficulty: 'MEDIUM',
  },
  // Project-based
  {
    category: 'PROJECT',
    question: 'Walk me through your most complex project.',
    suggestedAnswer: 'Explain: Problem statement → Tech stack → Architecture → Your specific contributions → Challenges faced → How you solved them → Results/impact.',
    keyPoints: ['Problem definition', 'Architecture decisions', 'Personal contribution', 'Challenges and solutions'],
    difficulty: 'MEDIUM',
  },
  {
    category: 'PROJECT',
    question: 'What was the most challenging technical problem you solved?',
    suggestedAnswer: 'Describe the problem clearly. Explain your approach: research, debugging steps, solution attempts. Highlight the final solution and why it worked.',
    keyPoints: ['Problem identification', 'Debugging process', 'Creative solution', 'Technical depth'],
    difficulty: 'HARD',
  },
  {
    category: 'PROJECT',
    question: 'How do you handle version control and collaboration in your projects?',
    suggestedAnswer: 'Describe Git workflow: branching strategy, commit conventions, code reviews, CI/CD. Mention tools: GitHub, GitLab, pull requests, issue tracking.',
    keyPoints: ['Git workflow', 'Branching strategy', 'Code reviews', 'CI/CD'],
    difficulty: 'EASY',
  },
  {
    category: 'PROJECT',
    question: 'Explain a project where you had to learn a new technology.',
    suggestedAnswer: 'Describe the project requirement, the new technology, your learning approach (documentation, tutorials, practice), and how you successfully applied it.',
    keyPoints: ['Learning approach', 'Self-motivation', 'Application', 'Adaptability'],
    difficulty: 'EASY',
  },
];

export function generateInterviewQuestionsFallback(
  jobTitle: string,
  skills: string[],
  difficulty: 'EASY' | 'MEDIUM' | 'HARD'
): InterviewQuestionData[] {
  const difficultyOrder = { EASY: 0, MEDIUM: 1, HARD: 2 };
  const targetDiff = difficultyOrder[difficulty];

  // Score each question by relevance
  const scored = QUESTION_BANK.map(q => {
    let score = 0;
    const qDiff = difficultyOrder[q.difficulty];

    // Exact difficulty match = high score
    if (qDiff === targetDiff) score += 10;
    else if (Math.abs(qDiff - targetDiff) === 1) score += 5;

    // Skill relevance
    const qLower = `${q.question} ${q.suggestedAnswer}`.toLowerCase();
    for (const skill of skills) {
      if (qLower.includes(skill.toLowerCase())) score += 3;
    }

    // Job title relevance
    if (qLower.includes(jobTitle.toLowerCase())) score += 5;

    // Add some deterministic variety based on question category
    return { question: q, score };
  });

  // Sort by score descending, pick diverse categories
  scored.sort((a, b) => b.score - a.score);

  const result: InterviewQuestionData[] = [];
  const categoryCount: Record<string, number> = {};
  const maxPerCategory = 3;

  for (const { question } of scored) {
    if (result.length >= 10) break;
    const cat = question.category;
    if ((categoryCount[cat] || 0) >= maxPerCategory) continue;
    categoryCount[cat] = (categoryCount[cat] || 0) + 1;
    result.push(question);
  }

  return result;
}
