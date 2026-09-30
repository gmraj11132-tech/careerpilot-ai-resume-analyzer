import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { getAuthUser } from '@/lib/session';
import { generateInterviewQuestions } from '@/lib/ai-service';
import { interviewSchema } from '@/lib/validations';

export async function POST(request: NextRequest) {
  try {
    const user = await getAuthUser(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const parsed = interviewSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { jobTitle, skills, difficulty } = parsed.data;
    const { modelId, provider: chosenProvider, customApiKey } = body;

    const { questions, mode, modelName, provider } = await generateInterviewQuestions(
      jobTitle,
      skills,
      difficulty,
      {
        modelId,
        provider: chosenProvider,
        customApiKey,
      }
    );

    // Save session and questions
    const session = await prisma.interviewSession.create({
      data: {
        userId: user.userId,
        jobTitle,
        skills: JSON.parse(JSON.stringify(skills)),
        difficulty,
        modelName,
        provider,
        questions: {
          create: questions.map(q => ({
            category: q.category,
            question: q.question,
            suggestedAnswer: q.suggestedAnswer,
            keyPoints: JSON.parse(JSON.stringify(q.keyPoints)),
            difficulty: q.difficulty,
          })),
        },
      },
      include: { questions: true },
    });

    return NextResponse.json({
      session: {
        ...session,
        analysisType: mode,
        modelName,
        provider,
      },
    }, { status: 201 });
  } catch (error) {
    console.error('Interview generation error:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
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

    const sessions = await prisma.interviewSession.findMany({
      where: { userId: user.userId },
      include: {
        questions: { orderBy: { createdAt: 'asc' } },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ sessions });
  } catch (error) {
    console.error('Interview list error:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}
