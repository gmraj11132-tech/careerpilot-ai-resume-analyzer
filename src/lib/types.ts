export interface ParsedResume {
  name: string;
  email: string;
  phone: string;
  education: EducationEntry[];
  skills: string[];
  projects: ProjectEntry[];
  experience: ExperienceEntry[];
  certifications: string[];
  summary: string;
  rawText: string;
}

export interface EducationEntry {
  institution: string;
  degree: string;
  field: string;
  year: string;
}

export interface ProjectEntry {
  name: string;
  description: string;
  technologies: string[];
}

export interface ExperienceEntry {
  company: string;
  role: string;
  duration: string;
  description: string;
}

export interface ResumeScore {
  overall: number;
  ats: number;
  skills: number;
  experience: number;
  education: number;
  formatting: number;
  missingSections: string[];
  detectedSkills: string[];
  suggestions: string[];
}

export interface JobMatchResult {
  matchPercentage: number;
  matchingSkills: string[];
  missingSkills: string[];
  relevantProjects: string[];
  relevantExperience: string[];
  suggestedChanges: string[];
  suggestedTopics: string[];
  keywords: string[];
}

export interface InterviewQuestionData {
  category: 'TECHNICAL' | 'HR' | 'BEHAVIORAL' | 'PROJECT';
  question: string;
  suggestedAnswer: string;
  keyPoints: string[];
  difficulty: 'EASY' | 'MEDIUM' | 'HARD';
}

// Skill categories
export const SKILL_CATEGORIES: Record<string, string[]> = {
  'Programming': [
    'JavaScript', 'TypeScript', 'Python', 'Java', 'C', 'C++', 'C#', 'Go', 'Rust',
    'Ruby', 'PHP', 'Swift', 'Kotlin', 'Scala', 'R', 'MATLAB', 'Dart', 'Lua',
  ],
  'Web Development': [
    'React', 'Next.js', 'Angular', 'Vue.js', 'Svelte', 'HTML', 'CSS', 'SASS',
    'Tailwind CSS', 'Bootstrap', 'jQuery', 'Node.js', 'Express.js', 'Django',
    'Flask', 'Spring Boot', 'ASP.NET', 'FastAPI', 'GraphQL', 'REST API',
  ],
  'Database': [
    'PostgreSQL', 'MySQL', 'MongoDB', 'SQLite', 'Redis', 'Elasticsearch',
    'Firebase', 'DynamoDB', 'Cassandra', 'Oracle', 'SQL Server', 'Prisma',
    'Sequelize', 'Mongoose',
  ],
  'Data Science': [
    'Pandas', 'NumPy', 'Scikit-learn', 'TensorFlow', 'PyTorch', 'Keras',
    'Jupyter', 'Matplotlib', 'Seaborn', 'Tableau', 'Power BI', 'Apache Spark',
    'Hadoop', 'Data Analysis', 'Statistics',
  ],
  'AI/ML': [
    'Machine Learning', 'Deep Learning', 'NLP', 'Computer Vision',
    'Neural Networks', 'Transformers', 'LLM', 'OpenAI', 'Gemini',
    'Langchain', 'Hugging Face', 'Reinforcement Learning',
  ],
  'Cloud/DevOps': [
    'AWS', 'Azure', 'GCP', 'Docker', 'Kubernetes', 'CI/CD', 'Jenkins',
    'GitHub Actions', 'Terraform', 'Ansible', 'Linux', 'Nginx', 'Vercel',
    'Netlify', 'Heroku',
  ],
  'Tools': [
    'Git', 'GitHub', 'GitLab', 'VS Code', 'Postman', 'Figma', 'Jira',
    'Slack', 'Notion', 'Webpack', 'Vite', 'npm', 'yarn',
  ],
  'Soft Skills': [
    'Leadership', 'Communication', 'Teamwork', 'Problem Solving',
    'Critical Thinking', 'Time Management', 'Adaptability', 'Creativity',
    'Project Management', 'Agile', 'Scrum',
  ],
};

export const ALL_SKILLS = Object.values(SKILL_CATEGORIES).flat();

// ================================================================
// MULTI-MODEL AI CONFIGURATION TYPES
// ================================================================

export type AIProvider = 'google' | 'openai' | 'anthropic' | 'groq' | 'fallback';

export interface AIModelOption {
  id: string;
  name: string;
  provider: AIProvider;
  model: string;
  description: string;
  badge?: string;
  speed: 'Ultra Fast' | 'Fast' | 'Balanced' | 'Deep Reasoning';
}

export interface ModelExecutionOptions {
  modelId?: string;
  provider?: AIProvider;
  customApiKey?: string;
}

export const AVAILABLE_MODELS: AIModelOption[] = [
  {
    id: 'gemini-2.0-flash',
    name: 'Gemini 2.0 Flash',
    provider: 'google',
    model: 'gemini-2.0-flash',
    description: 'Next-gen multimodal speed & precision from Google',
    badge: 'Recommended',
    speed: 'Ultra Fast',
  },
  {
    id: 'gemini-1.5-pro',
    name: 'Gemini 1.5 Pro',
    provider: 'google',
    model: 'gemini-1.5-pro',
    description: 'Advanced reasoning and deep structural analysis',
    speed: 'Deep Reasoning',
  },
  {
    id: 'gpt-4o',
    name: 'OpenAI GPT-4o',
    provider: 'openai',
    model: 'gpt-4o',
    description: 'Flagship omni-model for high-fidelity resume evaluation',
    speed: 'Balanced',
  },
  {
    id: 'gpt-4o-mini',
    name: 'OpenAI GPT-4o Mini',
    provider: 'openai',
    model: 'gpt-4o-mini',
    description: 'Ultra-fast and cost-effective intelligent feedback',
    speed: 'Fast',
  },
  {
    id: 'claude-3-5-sonnet',
    name: 'Claude 3.5 Sonnet',
    provider: 'anthropic',
    model: 'claude-3-5-sonnet-20241022',
    description: 'Nuanced career prose analysis and actionability',
    speed: 'Balanced',
  },
  {
    id: 'groq-llama-3.3-70b',
    name: 'Llama 3.3 70B (Groq)',
    provider: 'groq',
    model: 'llama-3.3-70b-versatile',
    description: 'Open-weights powerhouse on Groq LPUs for instant inference',
    speed: 'Ultra Fast',
  },
  {
    id: 'groq-deepseek-r1',
    name: 'DeepSeek R1 (Groq)',
    provider: 'groq',
    model: 'deepseek-r1-distill-llama-70b',
    description: 'Reasoning-distilled model optimized for technical ATS matching',
    speed: 'Fast',
  },
  {
    id: 'deterministic-fallback',
    name: 'Deterministic Heuristic Engine',
    provider: 'fallback',
    model: 'rule-based-v1',
    description: 'Zero-latency offline engine; ATS heuristics without external keys',
    badge: '100% Offline',
    speed: 'Ultra Fast',
  },
];

