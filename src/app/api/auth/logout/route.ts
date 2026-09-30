import { NextResponse } from 'next/server';
import { createLogoutCookieHeader } from '@/lib/session';

export async function POST() {
  const response = NextResponse.json({ message: 'Logged out successfully' });
  response.headers.set('Set-Cookie', createLogoutCookieHeader());
  return response;
}
