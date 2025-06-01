import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const userId = request.headers.get('x-user-id');
    if (!userId) {
      return NextResponse.json(
        { success: false, message: 'Not authenticated' },
        { status: 401 }
      );
    }

    const { newName } = await request.json();
    if (!newName || typeof newName !== 'string' || newName.length < 2) {
      return NextResponse.json(
        { success: false, message: 'Invalid name provided' },
        { status: 400 }
      );
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { name: newName },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        requiresPasswordChange: true,
        createdAt: true,
        updatedAt: true,
      }
    });

    return NextResponse.json(
      { 
        success: true, 
        message: 'Name updated successfully!',
        updatedUser
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error updating user name:", error);
    return NextResponse.json(
      { success: false, message: 'An error occurred while updating the name.' },
      { status: 500 }
    );
  }
} 