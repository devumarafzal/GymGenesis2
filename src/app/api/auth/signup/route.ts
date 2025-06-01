import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { hashPassword } from '@/lib/password-utils';

export async function POST(request: Request) {
  try {
    const { name, email, password } = await request.json();

    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { success: false, message: 'Email already exists.' },
        { status: 400 }
      );
    }

    const passwordHash = await hashPassword(password);

    const newUser = await prisma.user.create({
      data: {
        name,
        email,
        passwordHash,
        role: 'MEMBER',
        requiresPasswordChange: false,
      },
    });

    // Don't send the password hash back to the client
    const { passwordHash: _, ...userWithoutPassword } = newUser;

    return NextResponse.json(
      { 
        success: true, 
        message: 'Sign up successful! Please sign in.', 
        user: userWithoutPassword 
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error during sign up:", error);
    return NextResponse.json(
      { success: false, message: 'An error occurred during sign up.' },
      { status: 500 }
    );
  }
} 