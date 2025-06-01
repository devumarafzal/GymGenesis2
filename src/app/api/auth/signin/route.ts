import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyPassword } from '@/lib/password-utils';

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();
    console.log('Attempting signin for email:', email);

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      console.log('User not found:', email);
      return NextResponse.json(
        { success: false, message: 'Invalid email or password.' },
        { status: 401 }
      );
    }

    if (!user.passwordHash) {
      console.log('No password hash found for user:', email);
      return NextResponse.json(
        { success: false, message: 'Invalid email or password.' },
        { status: 401 }
      );
    }

    console.log('Found user, verifying password. Hash format:', {
      hashLength: user.passwordHash.length,
      containsSeparator: user.passwordHash.includes('.'),
      isDefaultPassword: user.passwordHash === 'changeme'
    });

    const isValidPassword = await verifyPassword(user.passwordHash, password);
    if (!isValidPassword) {
      console.log('Invalid password for user:', email);
      return NextResponse.json(
        { success: false, message: 'Invalid email or password.' },
        { status: 401 }
      );
    }

    // Don't send the password hash back to the client
    const { passwordHash: _, ...userWithoutPassword } = user;

    console.log('Login successful for user:', email);
    return NextResponse.json(
      { 
        success: true, 
        message: 'Sign in successful!', 
        user: userWithoutPassword 
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error during sign in:", error);
    return NextResponse.json(
      { success: false, message: 'An error occurred during sign in.' },
      { status: 500 }
    );
  }
} 