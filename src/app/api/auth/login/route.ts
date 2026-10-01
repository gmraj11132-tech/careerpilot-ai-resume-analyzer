import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { verifyPassword, createToken } from '@/lib/auth';
import { setAuthCookie } from '@/lib/session';
import { loginSchema } from '@/lib/validations';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const parsed = loginSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Please enter a valid email and password' },
        { status: 400 }
      );
    }

    const { email, password } = parsed.data;
    const normalizedEmail = email.trim().toLowerCase();

    // Check for 1-Click Demo Credentials (guaranteed instant demo access even in serverless cold start)
    const isDemoStudent =
      normalizedEmail === 'demo@careerpilot.dev' &&
      (password === 'Demo@1234' || password === 'Demo@123' || password === 'password123');
    const isDemoAdmin =
      normalizedEmail === 'admin@careerpilot.dev' &&
      (password === 'Admin@1234' || password === 'Admin@123');

    let user = null;
    let dbError = null;

    try {
      user = await prisma.user.findFirst({
        where: {
          email: {
            equals: normalizedEmail,
          },
        },
      });
    } catch (err: any) {
      dbError = err;
      console.warn('Prisma user lookup warning:', err?.message || err);
    }

    // If user found in database, verify their password
    if (user) {
      let isValid = false;
      try {
        isValid = await verifyPassword(password, user.passwordHash);
      } catch {
        isValid = false;
      }

      // Also allow default demo password fallback for demo user accounts
      if (!isValid && ((isDemoStudent && user.email === 'demo@careerpilot.dev') || (isDemoAdmin && user.email === 'admin@careerpilot.dev'))) {
        isValid = true;
      }

      if (!isValid) {
        return NextResponse.json(
          { error: 'Incorrect password. Please try again.' },
          { status: 401 }
        );
      }

      const token = await createToken({
        userId: user.id,
        email: user.email,
        role: user.role,
      });

      const response = NextResponse.json({
        message: 'Login successful',
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
        token,
      });

      setAuthCookie(response, token);
      return response;
    }

    // If user was not in DB, but matches demo credentials (e.g. fresh ephemeral environment)
    if (isDemoStudent || isDemoAdmin) {
      const demoRole = isDemoAdmin ? 'ADMIN' : 'USER';
      const demoName = isDemoAdmin ? 'Admin User' : 'Alex Demo';
      const demoId = isDemoAdmin ? 'cmuofppap0001ixfof3ii56cy' : 'cmuofpouj0000ixfone1opx3y';

      const token = await createToken({
        userId: demoId,
        email: normalizedEmail,
        role: demoRole,
      });

      const response = NextResponse.json({
        message: 'Login successful',
        user: {
          id: demoId,
          name: demoName,
          email: normalizedEmail,
          role: demoRole,
        },
        token,
      });

      setAuthCookie(response, token);
      return response;
    }

    // If DB failed and it wasn't demo credentials
    if (dbError && !user) {
      return NextResponse.json(
        {
          error:
            'Database service is currently initializing. Please use the 1-Click Student Demo button to sign in immediately.',
        },
        { status: 503 }
      );
    }

    return NextResponse.json(
      { error: 'Account not found. Please check your email or click Student Demo to test.' },
      { status: 401 }
    );
  } catch (error: any) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: error?.message || 'An unexpected error occurred during login. Please try again.' },
      { status: 500 }
    );
  }
}
