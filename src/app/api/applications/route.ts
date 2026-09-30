import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { getAuthUser } from '@/lib/session';
import { jobApplicationSchema } from '@/lib/validations';

export async function GET(request: NextRequest) {
  try {
    const user = await getAuthUser(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const search = searchParams.get('search');
    const sortBy = searchParams.get('sortBy') || 'createdAt';
    const sortOrder = searchParams.get('sortOrder') || 'desc';

    const where: Record<string, unknown> = { userId: user.userId };
    if (status && status !== 'ALL') {
      where.status = status;
    }
    if (search) {
      where.OR = [
        { company: { contains: search } },
        { jobTitle: { contains: search } },
        { location: { contains: search } },
      ];
    }

    const validSortFields = ['createdAt', 'appliedDate', 'company', 'status'];
    const field = validSortFields.includes(sortBy) ? sortBy : 'createdAt';
    const order = sortOrder === 'asc' ? 'asc' : 'desc';

    const applications = await prisma.jobApplication.findMany({
      where,
      orderBy: { [field]: order },
    });

    // Statistics
    const stats = await prisma.jobApplication.groupBy({
      by: ['status'],
      where: { userId: user.userId },
      _count: true,
    });

    return NextResponse.json({
      applications,
      stats: stats.map(s => ({ status: s.status, count: s._count })),
    });
  } catch (error) {
    console.error('Applications list error:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getAuthUser(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const parsed = jobApplicationSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const application = await prisma.jobApplication.create({
      data: {
        userId: user.userId,
        ...parsed.data,
        appliedDate: new Date(parsed.data.appliedDate),
      },
    });

    return NextResponse.json({ application }, { status: 201 });
  } catch (error) {
    console.error('Application create error:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}
