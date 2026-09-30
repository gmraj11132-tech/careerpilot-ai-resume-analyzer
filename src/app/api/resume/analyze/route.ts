import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { getAuthUser } from '@/lib/session';
import { analyzeResume } from '@/lib/ai-service';
import { ParsedResume, SKILL_CATEGORIES } from '@/lib/types';

export async function POST(request: NextRequest) {
  try {
    const user = await getAuthUser(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { resumeId } = body;

    if (!resumeId) {
      return NextResponse.json({ error: 'Resume ID is required' }, { status: 400 });
    }

    // Get resume
    const resume = await prisma.resume.findFirst({
      where: { id: resumeId, userId: user.userId },
    });

    if (!resume) {
      return NextResponse.json({ error: 'Resume not found' }, { status: 404 });
    }

    // Build parsed resume from stored data
    const parsed: ParsedResume = {
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

    // Run analysis
    const { score, mode } = await analyzeResume(parsed);

    // Save analysis
    const analysis = await prisma.resumeAnalysis.create({
      data: {
        resumeId: resume.id,
        userId: user.userId,
        overallScore: score.overall,
        atsScore: score.ats,
        skillsScore: score.skills,
        experienceScore: score.experience,
        educationScore: score.education,
        formattingScore: score.formatting,
        missingSections: JSON.parse(JSON.stringify(score.missingSections)),
        detectedSkills: JSON.parse(JSON.stringify(score.detectedSkills)),
        suggestions: JSON.parse(JSON.stringify(score.suggestions)),
        analysisType: mode,
      },
    });

    // Auto-create UserSkill entries for detected skills
    for (const skillName of score.detectedSkills) {
      const skill = await prisma.skill.upsert({
        where: { name: skillName },
        update: {},
        create: { name: skillName, category: categorizeSkill(skillName) },
      });

      await prisma.userSkill.upsert({
        where: {
          userId_skillId: { userId: user.userId, skillId: skill.id },
        },
        update: {},
        create: {
          userId: user.userId,
          skillId: skill.id,
          status: 'IDENTIFIED',
        },
      });
    }

    return NextResponse.json({
      analysis: {
        id: analysis.id,
        ...score,
        analysisType: mode,
      },
    });
  } catch (error) {
    console.error('Resume analysis error:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred during analysis' },
      { status: 500 }
    );
  }
}

function categorizeSkill(skillName: string): string {
  for (const [category, skills] of Object.entries(SKILL_CATEGORIES)) {
    if ((skills as string[]).some(s => s.toLowerCase() === skillName.toLowerCase())) {
      return category;
    }
  }
  return 'Other';
}

export async function GET(request: NextRequest) {
  try {
    const user = await getAuthUser(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const analyses = await prisma.resumeAnalysis.findMany({
      where: { userId: user.userId },
      include: {
        resume: { select: { fileName: true, name: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ analyses });
  } catch (error) {
    console.error('Analysis list error:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}
