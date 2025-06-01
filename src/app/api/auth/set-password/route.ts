import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { scrypt, randomBytes } from 'crypto';
import { promisify } from 'util';

const scryptAsync = promisify(scrypt);

async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16).toString('hex');
  const buf = await scryptAsync(password, salt, 64) as Buffer;
  return `${buf.toString('hex')}.${salt}`;
}

async function verifyPassword(storedPassword: string, suppliedPassword: string): Promise<boolean> {
  // Special case: If the stored password is the default unhashed 'changeme'
  if (storedPassword === 'changeme' && suppliedPassword === 'changeme') {
    return true;
  }

  // Check if the stored password is in the correct format (hashed.salt)
  const parts = storedPassword.split('.');
  if (parts.length !== 2) {
    // If not in correct format and not the default password, it's invalid
    console.error('Invalid password format in database');
    return false;
  }

  const [hashedPassword, salt] = parts;
  try {
    const buf = await scryptAsync(suppliedPassword, salt, 64) as Buffer;
    return buf.toString('hex') === hashedPassword;
  } catch (error) {
    console.error('Error verifying password:', error);
    return false;
  }
}

export async function POST(request: Request) {
  try {
    const userId = request.headers.get('x-user-id');
    if (!userId) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { currentPassword, newPassword } = await request.json();

    if (!currentPassword || !newPassword) {
      return NextResponse.json(
        { success: false, message: 'Current password and new password are required' },
        { status: 400 }
      );
    }

    // Get user with password
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, passwordHash: true, requiresPasswordChange: true }
    });

    if (!user) {
      return NextResponse.json(
        { success: false, message: 'User not found' },
        { status: 404 }
      );
    }

    if (!user.passwordHash) {
      return NextResponse.json(
        { success: false, message: 'Invalid password state' },
        { status: 400 }
      );
    }

    // Only verify current password if not in forced password change mode
    if (!user.requiresPasswordChange) {
      const isValidPassword = await verifyPassword(user.passwordHash, currentPassword);
      if (!isValidPassword) {
        return NextResponse.json(
          { success: false, message: 'Current password is incorrect' },
          { status: 400 }
        );
      }
    }

    // Hash new password
    const hashedPassword = await hashPassword(newPassword);

    // Update password and set requiresPasswordChange to false
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        passwordHash: hashedPassword,
        requiresPasswordChange: false
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        requiresPasswordChange: true
      }
    });

    return NextResponse.json({
      success: true,
      message: 'Password updated successfully',
      user: updatedUser
    });
  } catch (error) {
    console.error('Error in set-password route:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to update password' },
      { status: 500 }
    );
  }
} 