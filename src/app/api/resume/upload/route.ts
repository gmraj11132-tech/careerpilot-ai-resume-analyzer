import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { getAuthUser } from '@/lib/session';
import { extractTextFromFile, parseResumeText } from '@/lib/resume-parser';
import path from 'path';

const MAX_FILE_SIZE = (parseInt(process.env.MAX_FILE_SIZE_MB || '5') || 5) * 1024 * 1024;
const ALLOWED_TYPES = [
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
];
const ALLOWED_EXTENSIONS = ['.pdf', '.docx'];

function sanitizeFileName(name: string): string {
  // Remove path traversal characters and sanitize
  return path.basename(name).replace(/[^a-zA-Z0-9._-]/g, '_').slice(0, 100);
}

export async function POST(request: NextRequest) {
  try {
    const user = await getAuthUser(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await request.formData();
    const file = (formData.get('file') || formData.get('resume')) as File | null;

    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }

    // Validate file type
    const ext = path.extname(file.name).toLowerCase();
    if (!ALLOWED_EXTENSIONS.includes(ext)) {
      return NextResponse.json(
        { error: 'Invalid file type. Only PDF and DOCX files are supported.' },
        { status: 400 }
      );
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: `File size exceeds ${process.env.MAX_FILE_SIZE_MB || 5}MB limit` },
        { status: 400 }
      );
    }

    // Read file buffer
    const buffer = Buffer.from(await file.arrayBuffer());

    // Extract text
    const fileType = ext === '.pdf' ? 'pdf' : 'docx';
    let rawText: string;
    try {
      rawText = await extractTextFromFile(buffer, fileType);
    } catch (error) {
      return NextResponse.json(
        { error: error instanceof Error ? error.message : 'Could not extract text from file' },
        { status: 422 }
      );
    }

    if (!rawText || rawText.trim().length < 10) {
      return NextResponse.json(
        { error: 'Could not extract meaningful text from the file. Please ensure the file contains text content.' },
        { status: 422 }
      );
    }

    // Parse resume
    const parsed = parseResumeText(rawText);

    // Save to database
    const resume = await prisma.resume.create({
      data: {
        userId: user.userId,
        fileName: sanitizeFileName(file.name),
        fileType: ext,
        fileSize: file.size,
        rawText,
        parsedData: JSON.parse(JSON.stringify(parsed)),
        name: parsed.name,
        email: parsed.email,
        phone: parsed.phone,
        education: JSON.parse(JSON.stringify(parsed.education)),
        skills: JSON.parse(JSON.stringify(parsed.skills)),
        projects: JSON.parse(JSON.stringify(parsed.projects)),
        experience: JSON.parse(JSON.stringify(parsed.experience)),
        certifications: JSON.parse(JSON.stringify(parsed.certifications)),
        summary: parsed.summary,
      },
    });

    return NextResponse.json({
      message: 'Resume uploaded and parsed successfully',
      resume: {
        id: resume.id,
        fileName: resume.fileName,
        parsed,
      },
    }, { status: 201 });
  } catch (error) {
    console.error('Resume upload error:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred during upload' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const user = await getAuthUser(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const resumes = await prisma.resume.findMany({
      where: { userId: user.userId },
      select: {
        id: true,
        fileName: true,
        fileType: true,
        fileSize: true,
        name: true,
        email: true,
        skills: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ resumes });
  } catch (error) {
    console.error('Resume list error:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}
