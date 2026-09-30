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
