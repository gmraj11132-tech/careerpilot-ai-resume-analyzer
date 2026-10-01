import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { getAuthUser } from '@/lib/session';
import { skillStatusSchema } from '@/lib/validations';
import { SKILL_CATEGORIES } from '@/lib/types';

export async function GET(request: NextRequest) {
  try {
    const user = await getAuthUser(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userSkills = await prisma.userSkill.findMany({
      where: { userId: user.userId },
      include: { skill: true },
    });

    // Group by category
    const grouped: Record<string, Array<{
      id: string;
      userSkillId: string;
      name: string;
      category: string;
      status: string;
    }>> = {};

    for (const us of userSkills) {
      const cat = us.skill.category || 'Other';
      if (!grouped[cat]) grouped[cat] = [];
      grouped[cat].push({
        id: us.skill.id,
        userSkillId: us.id,
        name: us.skill.name,
        category: cat,
        status: us.status,
      });
    }

    return NextResponse.json({
      skills: grouped,
      categories: Object.keys(SKILL_CATEGORIES),
    });
  } catch (error) {
    console.error('Skills list error:', error);
    return NextResponse.json({
      skills: {},
      categories: Object.keys(SKILL_CATEGORIES),
    });
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getAuthUser(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { name, category } = body;

    if (!name || typeof name !== 'string' || name.length < 1 || name.length > 100) {
      return NextResponse.json({ error: 'Valid skill name is required' }, { status: 400 });
    }

    const skill = await prisma.skill.upsert({
      where: { name },
      update: {},
      create: { name, category: category || 'Other' },
    });

    const userSkill = await prisma.userSkill.upsert({
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

    return NextResponse.json({ userSkill, skill }, { status: 201 });
  } catch (error) {
    console.error('Skill add error:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const user = await getAuthUser(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { userSkillId, status } = body;

    if (!userSkillId) {
      return NextResponse.json({ error: 'UserSkill ID is required' }, { status: 400 });
    }

    const parsed = skillStatusSchema.safeParse({ status });
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
    }

    // Verify ownership
    const existing = await prisma.userSkill.findFirst({
      where: { id: userSkillId, userId: user.userId },
    });
    if (!existing) {
      return NextResponse.json({ error: 'Skill not found' }, { status: 404 });
    }

    const updated = await prisma.userSkill.update({
      where: { id: userSkillId },
      data: { status: parsed.data.status },
      include: { skill: true },
    });

    return NextResponse.json({ userSkill: updated });
  } catch (error) {
    console.error('Skill update error:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}
