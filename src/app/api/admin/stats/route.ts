import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { getAuthUser } from '@/lib/session';

export async function GET(request: NextRequest) {
  try {
    const user = await getAuthUser(request);
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Aggregate non-sensitive statistics only
    const [userCount, resumeCount, analysisCount, matchCount, applicationCount] =
      await Promise.all([
        prisma.user.count(),
        prisma.resume.count(),
        prisma.resumeAnalysis.count(),
        prisma.jobMatch.count(),
        prisma.jobApplication.count(),
      ]);

    return NextResponse.json({
      stats: {
        totalUsers: userCount,
        totalResumes: resumeCount,
        totalAnalyses: analysisCount,
        totalMatches: matchCount,
        totalApplications: applicationCount,
      },
    });
  } catch (error) {
    console.error('Admin stats error:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}
