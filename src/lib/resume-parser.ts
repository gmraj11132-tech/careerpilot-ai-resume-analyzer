import { ParsedResume, ALL_SKILLS } from './types';

// Email pattern
const EMAIL_REGEX = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/;
// Phone pattern (various formats)
const PHONE_REGEX = /(?:\+?\d{1,3}[-.\s]?)?\(?\d{2,4}\)?[-.\s]?\d{3,4}[-.\s]?\d{3,4}/;

// Section header patterns
const SECTION_PATTERNS: Record<string, RegExp> = {
  education: /(?:^|\n)\s*(?:education|academics?|qualifications?|degrees?)\b[^\n]*\n?/i,
  experience: /(?:^|\n)\s*(?:work\s*experience|experiences?|work\s*history|employment|professional\s*experience|internships?)\b[^\n]*\n?/i,
  skills: /(?:^|\n)\s*(?:technical\s*skills?|skills?|technologies|competencies|proficiencies)\b[^\n]*\n?/i,
  projects: /(?:^|\n)\s*(?:personal\s*projects?|academic\s*projects?|key\s*projects?|projects?)\b[^\n]*\n?/i,
  certifications: /(?:^|\n)\s*(?:certifications?|certificates?|licenses?|awards?|achievements?)\b[^\n]*\n?/i,
  summary: /(?:^|\n)\s*(?:career\s*summary|professional\s*summary|summary|objective|profile|about\s*me|career\s*objective)\b[^\n]*\n?/i,
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
  const allSkills = ALL_SKILLS;
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
  if (fileType === 'txt') {
    return buffer.toString('utf-8');
  }
  throw new Error('Unsupported file type. Please upload PDF, DOCX, or TXT.');
}

async function extractTextFromPDF(buffer: Buffer): Promise<string> {
  // Strategy 1: Try modern pdf-parse v2
  try {
    const pdfModule = await import('pdf-parse');
    const PDFParse = (pdfModule as any).PDFParse || (pdfModule as any).default?.PDFParse || (pdfModule as any).default;
    if (PDFParse) {
      const parser = new PDFParse({ data: buffer });
      const result = await parser.getText();
      const text = typeof result === 'string' ? result : result?.text || '';
      if (text.trim().length > 15) {
        return text.trim();
      }
    }
  } catch (err) {
    console.warn('pdf-parse v2 extractor notice:', err);
  }

  // Strategy 2: Decompress /FlateDecode zlib streams (handles 95% of standard PDFs)
  try {
    const zlib = await import('zlib');
    const content = buffer.toString('latin1');
    const streamRegex = /stream\r?\n([\s\S]*?)\r?\nendstream/g;
    let streamMatch;
    const extractedParts: string[] = [];

    while ((streamMatch = streamRegex.exec(content)) !== null) {
      const rawStream = Buffer.from(streamMatch[1], 'latin1');
      let decompressed = '';
      try {
        decompressed = zlib.inflateSync(rawStream).toString('latin1');
      } catch {
        try {
          decompressed = zlib.inflateRawSync(rawStream).toString('latin1');
        } catch {
          continue;
        }
      }

      if (decompressed) {
        // Extract Tj strings
        const tjRegex = /\(([^)]+)\)\s*Tj/g;
        let tjMatch;
        while ((tjMatch = tjRegex.exec(decompressed)) !== null) {
          extractedParts.push(tjMatch[1]);
        }

        // Extract TJ array strings
        const tjArrayRegex = /\[((?:\([^)]*\)|[^[\]])*)\]\s*TJ/g;
        let arrayMatch;
        while ((arrayMatch = tjArrayRegex.exec(decompressed)) !== null) {
          const strRegex = /\(([^)]*)\)/g;
          let sMatch;
          while ((sMatch = strRegex.exec(arrayMatch[1])) !== null) {
            extractedParts.push(sMatch[1]);
          }
        }
      }
    }

    if (extractedParts.length > 0) {
      const decoded = decodePDFText(extractedParts.join(' '));
      if (decoded.trim().length > 15) {
        return decoded;
      }
    }
  } catch (err) {
    console.warn('zlib PDF stream decompression notice:', err);
  }

  // Strategy 3: Uncompressed BT/ET blocks
  const uncompressedText = extractTextFromUncompressedPDF(buffer);
  if (uncompressedText.trim().length > 15) {
    return uncompressedText;
  }

  // Strategy 4: Fallback printable sequence extraction
  const printableMatches = buffer.toString('latin1').match(/[A-Za-z0-9@._\s\-:,/]{5,}/g);
  if (printableMatches && printableMatches.length > 5) {
    const joined = printableMatches.join(' ').replace(/\s+/g, ' ').trim();
    if (joined.length > 30) {
      return joined;
    }
  }

  throw new Error(
    'Could not extract text from this PDF. It may be an image-only scan. You can paste your resume text directly using the "Paste Resume Text" tab.'
  );
}

function decodePDFText(raw: string): string {
  return raw
    .replace(/\\n/g, '\n')
    .replace(/\\r/g, '\r')
    .replace(/\\t/g, '\t')
    .replace(/\\\\/g, '\\')
    .replace(/\\([()])/g, '$1')
    .replace(/\s+/g, ' ')
    .trim();
}

function extractTextFromUncompressedPDF(buffer: Buffer): string {
  const content = buffer.toString('latin1');
  const textParts: string[] = [];

  const btEtRegex = /BT\s([\s\S]*?)ET/g;
  let match;

  while ((match = btEtRegex.exec(content)) !== null) {
    const block = match[1];
    const tjRegex = /\(([^)]*)\)\s*Tj/g;
    let tjMatch;
    while ((tjMatch = tjRegex.exec(block)) !== null) {
      textParts.push(tjMatch[1]);
    }

    const tjArrayRegex = /\[((?:\([^)]*\)|[^[\]])*)\]\s*TJ/g;
    let tjArrayMatch;
    while ((tjArrayMatch = tjArrayRegex.exec(block)) !== null) {
      const stringRegex = /\(([^)]*)\)/g;
      let strMatch;
      while ((strMatch = stringRegex.exec(tjArrayMatch[1])) !== null) {
        textParts.push(strMatch[1]);
      }
    }
  }

  return decodePDFText(textParts.join(' '));
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

