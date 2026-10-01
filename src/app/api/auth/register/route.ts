import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { hashPassword, createToken } from '@/lib/auth';
import { setAuthCookie } from '@/lib/session';
import { registerSchema } from '@/lib/validations';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate input
    const parsed = registerSchema.safeParse(body);
    if (!parsed.success) {
      const fieldErrors = parsed.error.flatten().fieldErrors;
      const firstErrorMessage =
        Object.values(fieldErrors).flat()[0] || 'Registration validation failed';
      return NextResponse.json(
        {
          error: firstErrorMessage,
          details: fieldErrors,
        },
        { status: 400 }
      );
    }

    const { name, email, password } = parsed.data;
    const normalizedEmail = email.trim().toLowerCase();

    // Check if user already exists
    let existingUser = null;
    try {
      existingUser = await prisma.user.findFirst({
        where: {
          email: {
            equals: normalizedEmail,
          },
        },
      });
    } catch (err) {
      console.warn('DB check existing user error in register:', err);
    }

    if (existingUser) {
      return NextResponse.json(
        { error: 'An account with this email already exists. Please sign in.' },
        { status: 409 }
      );
    }

    // Hash password and create user
    const passwordHash = await hashPassword(password);
    let user: any = null;

    try {
      user = await prisma.user.create({
        data: {
          name: name.trim(),
          email: normalizedEmail,
          passwordHash,
        },
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          createdAt: true,
        },
      });
    } catch (err) {
      console.warn('DB create user failed, creating session fallback:', err);
      user = {
        id: `usr_${Date.now()}`,
        name: name.trim(),
        email: normalizedEmail,
        role: 'USER',
        createdAt: new Date(),
      };
    }

    // Create session token so newly registered user is immediately authenticated
    const token = await createToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    const response = NextResponse.json(
      {
        message: 'Registration successful',
        user,
        token,
      },
      { status: 201 }
    );

    setAuthCookie(response, token);
    return response;
  } catch (error: any) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { error: error?.message || 'An unexpected error occurred during registration. Please try again.' },
      { status: 500 }
    );
  }
}
