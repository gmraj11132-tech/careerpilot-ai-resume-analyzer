import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { getAuthUser } from '@/lib/session';
import { extractTextFromFile, parseResumeText } from '@/lib/resume-parser';
import path from 'path';

const MAX_FILE_SIZE = (parseInt(process.env.MAX_FILE_SIZE_MB || '10') || 10) * 1024 * 1024;
const ALLOWED_EXTENSIONS = ['.pdf', '.docx', '.txt'];

function sanitizeFileName(name: string): string {
  return path.basename(name).replace(/[^a-zA-Z0-9._-]/g, '_').slice(0, 100);
}

export async function POST(request: NextRequest) {
  try {
    const user = await getAuthUser(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized. Please log in.' }, { status: 401 });
    }

    const contentType = request.headers.get('content-type') || '';

    let rawText = '';
    let fileName = 'Uploaded_Resume.pdf';
    let fileType = '.pdf';
    let fileSize = 0;

    // Handle direct text paste (JSON)
    if (contentType.includes('application/json')) {
      const body = await request.json();
      rawText = (body.rawText || body.text || '').trim();
      fileName = body.fileName ? sanitizeFileName(body.fileName) : 'Pasted_Resume.txt';
      fileType = '.txt';
      fileSize = Buffer.byteLength(rawText, 'utf8');

      if (rawText.length < 20) {
        return NextResponse.json(
          { error: 'Please enter at least 20 characters of resume content.' },
          { status: 400 }
        );
      }
    } else {
      // Handle Multipart File Upload
      const formData = await request.formData();
      const file = (formData.get('file') || formData.get('resume')) as File | null;

      if (!file) {
        return NextResponse.json({ error: 'No resume file selected.' }, { status: 400 });
      }

      const ext = path.extname(file.name).toLowerCase();
      if (!ALLOWED_EXTENSIONS.includes(ext)) {
        return NextResponse.json(
          { error: 'Invalid file format. Please upload a PDF, DOCX, or TXT file.' },
          { status: 400 }
        );
      }

      if (file.size > MAX_FILE_SIZE) {
        return NextResponse.json(
          { error: 'File size exceeds the 10MB limit.' },
          { status: 400 }
        );
      }

      fileName = sanitizeFileName(file.name);
      fileType = ext;
      fileSize = file.size;

      const buffer = Buffer.from(await file.arrayBuffer());
      const format = ext === '.pdf' ? 'pdf' : ext === '.docx' ? 'docx' : 'txt';

      try {
        rawText = await extractTextFromFile(buffer, format);
      } catch (error) {
        return NextResponse.json(
          {
            error:
              error instanceof Error
                ? error.message
                : 'Could not extract text from file. Please ensure it is not a scanned image.',
          },
          { status: 422 }
        );
      }
    }

    if (!rawText || rawText.trim().length < 10) {
      return NextResponse.json(
        {
          error:
            'Could not extract text from this resume. If it is an image scan, please copy and paste the text using the "Paste Text" tab.',
        },
        { status: 422 }
      );
    }

    // Parse resume sections & skills
    const parsed = parseResumeText(rawText);

    // Save resume to database
    const resume = await prisma.resume.create({
      data: {
        userId: user.userId,
        fileName,
        fileType,
        fileSize,
        rawText,
        parsedData: JSON.parse(JSON.stringify(parsed)),
        name: parsed.name || user.email.split('@')[0],
        email: parsed.email || user.email,
        phone: parsed.phone || '',
        education: JSON.parse(JSON.stringify(parsed.education)),
        skills: JSON.parse(JSON.stringify(parsed.skills)),
        projects: JSON.parse(JSON.stringify(parsed.projects)),
        experience: JSON.parse(JSON.stringify(parsed.experience)),
        certifications: JSON.parse(JSON.stringify(parsed.certifications)),
        summary: parsed.summary || '',
      },
    });

    return NextResponse.json(
      {
        message: 'Resume uploaded and parsed successfully',
        resume: {
          id: resume.id,
          fileName: resume.fileName,
          parsed,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Resume upload error:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred during upload. Please try again.' },
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
