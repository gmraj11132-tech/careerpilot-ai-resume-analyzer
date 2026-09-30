import { ParsedResume } from './types';

// Email pattern
const EMAIL_REGEX = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/;
// Phone pattern (various formats)
const PHONE_REGEX = /(?:\+?\d{1,3}[-.\s]?)?\(?\d{2,4}\)?[-.\s]?\d{3,4}[-.\s]?\d{3,4}/;

// Section header patterns
const SECTION_PATTERNS: Record<string, RegExp> = {
  education: /(?:^|\n)\s*(?:education|academic|qualification|degree)/i,
  experience: /(?:^|\n)\s*(?:experience|work\s*history|employment|professional\s*experience|internship)/i,
  skills: /(?:^|\n)\s*(?:skills|technical\s*skills|technologies|competencies|proficiencies)/i,
  projects: /(?:^|\n)\s*(?:projects|personal\s*projects|academic\s*projects|key\s*projects)/i,
  certifications: /(?:^|\n)\s*(?:certification|certificate|licenses|awards|achievements)/i,
  summary: /(?:^|\n)\s*(?:summary|objective|profile|about\s*me|career\s*objective)/i,
};

function extractName(text: string): string {
  const lines = text.split('\n').filter(l => l.trim().length > 0);
  // First non-empty line is usually the name
  if (lines.length > 0) {
    const firstLine = lines[0].trim();
    // Simple heuristic: if it looks like a name (2-5 words, no special chars)
    if (firstLine.length < 60 && /^[A-Za-z\s.'-]+$/.test(firstLine)) {
      return firstLine;
    }
  }
  return '';
}

function extractEmail(text: string): string {
  const match = text.match(EMAIL_REGEX);
  return match ? match[0] : '';
}

function extractPhone(text: string): string {
  const match = text.match(PHONE_REGEX);
  return match ? match[0].trim() : '';
}

function extractSection(text: string, sectionName: string, nextSections: string[]): string {
  const sectionRegex = SECTION_PATTERNS[sectionName];
  if (!sectionRegex) return '';

  const match = text.match(sectionRegex);
  if (!match || match.index === undefined) return '';

  const startIdx = match.index + match[0].length;

  // Find the start of the next section
  let endIdx = text.length;
  for (const next of nextSections) {
    const nextRegex = SECTION_PATTERNS[next];
    if (!nextRegex) continue;
    const nextMatch = text.slice(startIdx).match(nextRegex);
    if (nextMatch && nextMatch.index !== undefined) {
      const candidateEnd = startIdx + nextMatch.index;
      if (candidateEnd < endIdx) {
        endIdx = candidateEnd;
      }
    }
  }

  return text.slice(startIdx, endIdx).trim();
}

function extractEducation(text: string): { institution: string; degree: string; field: string; year: string }[] {
  const section = extractSection(text, 'education', ['experience', 'skills', 'projects', 'certifications']);
  if (!section) return [];

  const entries: { institution: string; degree: string; field: string; year: string }[] = [];
  const lines = section.split('\n').filter(l => l.trim());

  // Try to group lines into education entries
  let currentEntry = { institution: '', degree: '', field: '', year: '' };
  const yearRegex = /\b(19|20)\d{2}\b/;
  const degreeRegex = /\b(B\.?Tech|B\.?E|M\.?Tech|M\.?E|B\.?Sc|M\.?Sc|B\.?A|M\.?A|MBA|Ph\.?D|Bachelor|Master|Diploma|B\.?C\.?A|M\.?C\.?A|BCA|MCA)\b/i;

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;

    const yearMatch = trimmed.match(yearRegex);
    const degreeMatch = trimmed.match(degreeRegex);

    if (degreeMatch) {
      if (currentEntry.degree && currentEntry.institution) {
        entries.push({ ...currentEntry });
        currentEntry = { institution: '', degree: '', field: '', year: '' };
      }
      currentEntry.degree = degreeMatch[0];
      currentEntry.field = trimmed.replace(degreeMatch[0], '').replace(yearMatch?.[0] || '', '').replace(/[-–|,]/g, '').trim();
    }

    if (yearMatch) {
      currentEntry.year = yearMatch[0];
    }

    if (!degreeMatch && !currentEntry.institution) {
      currentEntry.institution = trimmed.replace(yearMatch?.[0] || '', '').replace(/[-–|,]/g, '').trim();
    }
  }

  if (currentEntry.degree || currentEntry.institution) {
    entries.push(currentEntry);
  }

  return entries.length > 0 ? entries : [{ institution: lines[0] || '', degree: '', field: '', year: '' }];
}

function extractSkills(text: string): string[] {
  const section = extractSection(text, 'skills', ['projects', 'experience', 'education', 'certifications']);

  // Also scan entire text for known skills
  const { ALL_SKILLS } = require('./types');
  const allSkills: string[] = ALL_SKILLS as string[];
  const found = new Set<string>();

  // From skills section
  if (section) {
    const items = section
      .split(/[,\n•·|]/)
      .map(s => s.trim())
      .filter(s => s.length > 0 && s.length < 50);
    items.forEach(item => found.add(item));
  }

  // Scan full text for known skills
  const lowerText = text.toLowerCase();
  for (const skill of allSkills) {
    if (lowerText.includes(skill.toLowerCase())) {
      found.add(skill);
    }
  }

  return Array.from(found).slice(0, 50);
}

function extractProjects(text: string): { name: string; description: string; technologies: string[] }[] {
  const section = extractSection(text, 'projects', ['experience', 'skills', 'education', 'certifications']);
  if (!section) return [];

  const projects: { name: string; description: string; technologies: string[] }[] = [];
  const lines = section.split('\n').filter(l => l.trim());

  let currentProject = { name: '', description: '', technologies: [] as string[] };

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;

    // Detect new project (typically bold or starts with bullet)
    if (trimmed.length < 80 && !trimmed.includes('.') && /^[A-Z]/.test(trimmed)) {
      if (currentProject.name) {
        projects.push({ ...currentProject });
      }
      currentProject = { name: trimmed, description: '', technologies: [] };
    } else if (currentProject.name) {
      if (/tech|stack|built with|using/i.test(trimmed)) {
        currentProject.technologies = trimmed
          .replace(/tech(nologies)?:?\s*|stack:?\s*|built with:?\s*|using:?\s*/i, '')
          .split(/[,|]/)
          .map(t => t.trim())
          .filter(t => t);
      } else {
        currentProject.description += (currentProject.description ? ' ' : '') + trimmed;
      }
    }
  }

  if (currentProject.name) {
    projects.push(currentProject);
  }

  return projects;
}

function extractExperience(text: string): { company: string; role: string; duration: string; description: string }[] {
  const section = extractSection(text, 'experience', ['skills', 'projects', 'education', 'certifications']);
  if (!section) return [];

  const entries: { company: string; role: string; duration: string; description: string }[] = [];
  const lines = section.split('\n').filter(l => l.trim());
  const dateRegex = /\b(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\.?\s*\d{4}\s*[-–]\s*(?:(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\.?\s*\d{4}|Present|Current)\b/i;

  let currentEntry = { company: '', role: '', duration: '', description: '' };

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;

    const dateMatch = trimmed.match(dateRegex);
    if (dateMatch) {
      if (currentEntry.company || currentEntry.role) {
        entries.push({ ...currentEntry });
      }
      currentEntry = {
        company: trimmed.replace(dateMatch[0], '').replace(/[-–|,]/g, '').trim(),
        role: '',
        duration: dateMatch[0],
        description: '',
      };
    } else if (currentEntry.company && !currentEntry.role && trimmed.length < 80) {
      currentEntry.role = trimmed;
    } else if (currentEntry.company) {
      currentEntry.description += (currentEntry.description ? ' ' : '') + trimmed;
    }
  }

  if (currentEntry.company || currentEntry.role) {
    entries.push(currentEntry);
  }

  return entries;
}

function extractCertifications(text: string): string[] {
  const section = extractSection(text, 'certifications', ['education', 'skills', 'projects', 'experience']);
  if (!section) return [];

  return section
    .split('\n')
    .map(l => l.trim().replace(/^[•·\-*]\s*/, ''))
    .filter(l => l.length > 3 && l.length < 200);
}

function extractSummary(text: string): string {
  const section = extractSection(text, 'summary', ['education', 'skills', 'projects', 'experience', 'certifications']);
  return section ? section.slice(0, 500) : '';
}

export function parseResumeText(rawText: string): ParsedResume {
  const text = rawText.replace(/\r\n/g, '\n').replace(/\r/g, '\n');

  return {
    name: extractName(text),
    email: extractEmail(text),
    phone: extractPhone(text),
    education: extractEducation(text),
    skills: extractSkills(text),
    projects: extractProjects(text),
    experience: extractExperience(text),
    certifications: extractCertifications(text),
    summary: extractSummary(text),
    rawText: text,
  };
}

// Extract text from uploaded file buffer
export async function extractTextFromFile(
  buffer: Buffer,
  fileType: string
): Promise<string> {
  if (fileType === 'application/pdf' || fileType === 'pdf') {
    return extractTextFromPDF(buffer);
  }
  if (
    fileType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
    fileType === 'docx'
  ) {
    return extractTextFromDOCX(buffer);
  }
  throw new Error('Unsupported file type. Please upload PDF or DOCX.');
}

async function extractTextFromPDF(buffer: Buffer): Promise<string> {
  // Use a simple PDF text extraction approach
  // We'll extract text by parsing the PDF buffer for text content
  const text = extractTextFromPDFBuffer(buffer);
  if (text.trim().length < 10) {
    throw new Error('Could not extract text from PDF. The file may be image-based or corrupted.');
  }
  return text;
}

function extractTextFromPDFBuffer(buffer: Buffer): string {
  // Simple PDF text extraction without heavy dependencies
  const content = buffer.toString('latin1');
  const textParts: string[] = [];

  // Extract text between BT and ET markers (text blocks in PDF)
  const btEtRegex = /BT\s([\s\S]*?)ET/g;
  let match;

  while ((match = btEtRegex.exec(content)) !== null) {
    const block = match[1];
    // Extract text from Tj and TJ operators
    const tjRegex = /\(([^)]*)\)\s*Tj/g;
    let tjMatch;
    while ((tjMatch = tjRegex.exec(block)) !== null) {
      textParts.push(tjMatch[1]);
    }

    // Extract text from TJ arrays
    const tjArrayRegex = /\[((?:\([^)]*\)|[^[\]])*)\]\s*TJ/g;
    let tjArrayMatch;
    while ((tjArrayMatch = tjArrayRegex.exec(block)) !== null) {
      const arrayContent = tjArrayMatch[1];
      const stringRegex = /\(([^)]*)\)/g;
      let strMatch;
      while ((strMatch = stringRegex.exec(arrayContent)) !== null) {
        textParts.push(strMatch[1]);
      }
    }
  }

  // Decode PDF string escapes
  let text = textParts
    .map(t => t
      .replace(/\\n/g, '\n')
      .replace(/\\r/g, '\r')
      .replace(/\\t/g, '\t')
      .replace(/\\\\/g, '\\')
      .replace(/\\([()])/g, '$1')
    )
    .join(' ');

  // Clean up extra whitespace
  text = text.replace(/\s+/g, ' ').trim();

  return text;
}

async function extractTextFromDOCX(buffer: Buffer): Promise<string> {
  try {
    const mammoth = await import('mammoth');
    const result = await mammoth.extractRawText({ buffer });
    return result.value;
  } catch {
    throw new Error('Could not extract text from DOCX file.');
  }
}
