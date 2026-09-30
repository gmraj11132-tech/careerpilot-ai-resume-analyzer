import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { getAuthUser } from '@/lib/session';
import { matchJob } from '@/lib/ai-service';
import { jobMatchSchema } from '@/lib/validations';
import { ParsedResume } from '@/lib/types';

export async function POST(request: NextRequest) {
  try {
    const user = await getAuthUser(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const parsed = jobMatchSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { jobTitle, companyName, jobDescription } = parsed.data;
    const { modelId, provider: chosenProvider, customApiKey } = body;

    // Get latest resume
    const resume = await prisma.resume.findFirst({
      where: { userId: user.userId },
      orderBy: { createdAt: 'desc' },
    });

    if (!resume) {
      return NextResponse.json(
        { error: 'Please upload a resume first before matching with a job' },
        { status: 400 }
      );
    }

    const resumeParsed: ParsedResume = {
      name: resume.name || '',
      email: resume.email || '',
      phone: resume.phone || '',
      education: (resume.education as unknown as ParsedResume['education']) || [],
      skills: (resume.skills as unknown as string[]) || [],
      projects: (resume.projects as unknown as ParsedResume['projects']) || [],
      experience: (resume.experience as unknown as ParsedResume['experience']) || [],
      certifications: (resume.certifications as unknown as string[]) || [],
      summary: resume.summary || '',
      rawText: resume.rawText || '',
    };

    const { result, mode, modelName, provider } = await matchJob(
      resumeParsed,
      jobDescription,
      jobTitle,
      {
        modelId,
        provider: chosenProvider,
        customApiKey,
      }
    );

    // Save match result
    const jobMatch = await prisma.jobMatch.create({
      data: {
        userId: user.userId,
        resumeId: resume.id,
        jobTitle,
        jobDescription,
        companyName: companyName || '',
        matchPercentage: result.matchPercentage,
        matchingSkills: JSON.parse(JSON.stringify(result.matchingSkills)),
        missingSkills: JSON.parse(JSON.stringify(result.missingSkills)),
        relevantProjects: JSON.parse(JSON.stringify(result.relevantProjects)),
        relevantExperience: JSON.parse(JSON.stringify(result.relevantExperience)),
        suggestedChanges: JSON.parse(JSON.stringify(result.suggestedChanges)),
        suggestedTopics: JSON.parse(JSON.stringify(result.suggestedTopics)),
        keywords: JSON.parse(JSON.stringify(result.keywords)),
        analysisType: mode,
        modelName,
        provider,
      },
    });

    return NextResponse.json({
      match: {
        id: jobMatch.id,
        ...result,
        analysisType: mode,
        modelName,
        provider,
      },
    });
  } catch (error) {
    console.error('Job matching error:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred during matching' },
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

    const matches = await prisma.jobMatch.findMany({
      where: { userId: user.userId },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        jobTitle: true,
        companyName: true,
        matchPercentage: true,
        matchingSkills: true,
        missingSkills: true,
        analysisType: true,
        createdAt: true,
      },
    });

    return NextResponse.json({ matches });
  } catch (error) {
    console.error('Job matches list error:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}
