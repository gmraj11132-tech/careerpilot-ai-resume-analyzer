import { NextRequest, NextResponse } from 'next/server';
import { getAuthUser } from '@/lib/session';

export async function GET(request: NextRequest) {
  try {
    const user = await getAuthUser(request);
    if (!user) {
      return NextResponse.json({ user: null }, { status: 401 });
    }
    return NextResponse.json({ user });
  } catch {
    return NextResponse.json({ user: null }, { status: 401 });
  }
}
