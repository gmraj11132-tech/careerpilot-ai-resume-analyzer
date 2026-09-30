import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { getAuthUser } from '@/lib/session';
import { jobApplicationSchema } from '@/lib/validations';

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getAuthUser(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    // Verify ownership
    const existing = await prisma.jobApplication.findFirst({
      where: { id, userId: user.userId },
    });
    if (!existing) {
      return NextResponse.json({ error: 'Application not found' }, { status: 404 });
    }

    const body = await request.json();
    const parsed = jobApplicationSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const application = await prisma.jobApplication.update({
      where: { id },
      data: {
        ...parsed.data,
        appliedDate: new Date(parsed.data.appliedDate),
      },
    });

    return NextResponse.json({ application });
  } catch (error) {
    console.error('Application update error:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getAuthUser(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    // Verify ownership
    const existing = await prisma.jobApplication.findFirst({
      where: { id, userId: user.userId },
    });
    if (!existing) {
      return NextResponse.json({ error: 'Application not found' }, { status: 404 });
    }

    await prisma.jobApplication.delete({ where: { id } });

    return NextResponse.json({ message: 'Application deleted' });
  } catch (error) {
    console.error('Application delete error:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}
