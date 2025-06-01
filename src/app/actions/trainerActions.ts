'use server';

import { prisma } from '@/lib/prisma';
import type { Trainer, User, GymClass, DayOfWeek as PrismaDayOfWeek } from '@prisma/client';
import type { GymClassWithDetails } from '@/app/actions/classActions'; // Re-use this type
import { hashPassword } from '@/lib/password-utils';

// This is a placeholder. In a real app, use a strong, random password generator
// and a secure way to communicate this to the trainer or force a reset.
const DEFAULT_TRAINER_PASSWORD = "changeme"; // This password will require an immediate change.

export interface TrainerWithUserDetails extends Trainer {
  user?: { email: string; requiresPasswordChange?: boolean };
}

export async function getTrainers(): Promise<TrainerWithUserDetails[]> {
  try {
    const trainers = await prisma.trainer.findMany({
      include: {
        user: {
          select: {
            email: true,
            requiresPasswordChange: true,
          },
        },
      },
      orderBy: {
        name: 'asc'
      }
    });
    return trainers;
  } catch (error) {
    console.error("Error fetching trainers:", error);
    return [];
  }
}

export async function addTrainer(data: { name: string; email: string; specialty: string; imageUrl: string }): Promise<{ success: boolean; message: string; trainer?: TrainerWithUserDetails }> {
  try {
    const existingUser = await prisma.user.findUnique({
      where: { email: data.email },
    });
    if (existingUser) {
      return { success: false, message: 'User with this email already exists.' };
    }

    const hashedPassword = await hashPassword(DEFAULT_TRAINER_PASSWORD);

    const newUser = await prisma.user.create({
      data: {
        name: data.name,
        email: data.email,
        passwordHash: hashedPassword,
        role: 'TRAINER',
        requiresPasswordChange: true, // Force password change on first login
      },
    });

    const newTrainer = await prisma.trainer.create({
      data: {
        name: data.name,
        specialty: data.specialty,
        imageUrl: data.imageUrl || 'https://placehold.co/300x300.png',
        userId: newUser.id,
      },
      include: {
        user: { select: { email: true, requiresPasswordChange: true } }
      }
    });

    return { success: true, message: `Trainer added successfully. They will be required to change their password ('${DEFAULT_TRAINER_PASSWORD}') on first login.`, trainer: newTrainer };
  } catch (error) {
    console.error("Error adding trainer:", error);
    if (error instanceof Error && 'code' in error && (error as any).code === 'P2002' && (error as any).meta?.target?.includes('userId')) {
         return { success: false, message: 'Trainer profile for this user might already exist or user ID issue.' };
    }
    return { success: false, message: 'Failed to add trainer.' };
  }
}

export async function updateTrainer(id: string, data: { name: string; specialty: string; imageUrl: string }): Promise<{ success: boolean; message: string; trainer?: TrainerWithUserDetails }> {
  try {
    const trainerToUpdate = await prisma.trainer.findUnique({ where: { id } });
    if (!trainerToUpdate) {
      return { success: false, message: 'Trainer not found.' };
    }

    const updatedTrainer = await prisma.trainer.update({
      where: { id },
      data: {
        name: data.name,
        specialty: data.specialty,
        imageUrl: data.imageUrl || 'https://placehold.co/300x300.png',
        user: { // This assumes the trainer's name on the User model should also be updated.
          update: {
            where: { id: trainerToUpdate.userId }, // Ensure we update the correct user.
            data: { name: data.name },
          },
        },
      },
      include: {
        user: { select: { email: true, requiresPasswordChange: true } }
      }
    });
    return { success: true, message: 'Trainer updated successfully.', trainer: updatedTrainer };
  } catch (error) {
    console.error("Error updating trainer:", error);
    return { success: false, message: 'Failed to update trainer.' };
  }
}

export async function deleteTrainer(id: string): Promise<{ success: boolean; message: string }> {
  try {
    // Find the trainer to get the userId before deleting.
    // This is important if you want to disassociate or handle the User account separately.
    // For now, we just delete the Trainer profile. Associated GymClasses' trainerId will be set to null due to schema's onDelete: SetNull.
    const trainer = await prisma.trainer.findUnique({ where: { id } });
    if (!trainer) {
        return { success: false, message: 'Trainer not found or already deleted.' };
    }
    
    await prisma.trainer.delete({
      where: { id },
    });
    // Note: The User account (trainer.userId) is NOT deleted here.
    // It could be an admin decision whether to delete the User account or just the Trainer role/profile.
    return { success: true, message: 'Trainer profile deleted successfully. The associated user account still exists.' };
  } catch (error) {
    console.error("Error deleting trainer:", error);
    if (error instanceof Error && 'code' in error && (error as any).code === 'P2025') { // Record to delete does not exist.
        return { success: false, message: 'Trainer not found or already deleted.' };
    }
    return { success: false, message: 'Failed to delete trainer.' };
  }
}


export async function getTrainerSchedule(userId: string): Promise<GymClassWithDetails[]> {
  try {
    const trainer = await prisma.trainer.findUnique({
      where: { userId: userId },
    });

    if (!trainer) {
      // If no trainer profile is found for this user, they have no schedule as a trainer.
      return [];
    }

    const classes = await prisma.gymClass.findMany({
      where: { trainerId: trainer.id },
      include: {
        trainer: { // Though we're fetching for a specific trainer, including it for consistency with GymClassWithDetails
          select: { name: true },
        },
        _count: {
          select: { bookings: true },
        },
      },
      orderBy: [
        // Prisma doesn't directly support custom enum sort order.
        // Client-side sorting for DayOfWeek will be needed if specific order is critical beyond alphabetical.
        { dayOfWeek: 'asc' },
        { startTime: 'asc' },
      ],
    });
    // Map to include bookedUserIds (empty array) if GymClassWithDetails expects it, for type consistency.
    return classes.map(c => ({ ...c, bookedUserIds: [] }));
  } catch (error) {
    console.error("Error fetching trainer's schedule:", error);
    return [];
  }
}
