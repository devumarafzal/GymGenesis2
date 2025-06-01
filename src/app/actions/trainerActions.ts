
'use server';

import prisma from '@/lib/prisma';
import type { Trainer, User } from '@prisma/client';

// This is a placeholder. In a real app, use a strong, random password generator
// and a secure way to communicate this to the trainer or force a reset.
const DEFAULT_TRAINER_PASSWORD = "changeme";

export interface TrainerWithUserDetails extends Trainer {
  user?: { email: string };
}

export async function getTrainers(): Promise<TrainerWithUserDetails[]> {
  try {
    const trainers = await prisma.trainer.findMany({
      include: {
        user: {
          select: {
            email: true,
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
    // Check if email already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: data.email },
    });
    if (existingUser) {
      return { success: false, message: 'User with this email already exists.' };
    }

    // Create User record for the trainer
    // IMPORTANT: Hashing the password should be done here in a real app
    const newUser = await prisma.user.create({
      data: {
        name: data.name,
        email: data.email,
        passwordHash: DEFAULT_TRAINER_PASSWORD, // Store plain text for demo - HASH IN PRODUCTION
        role: 'TRAINER',
      },
    });

    // Create Trainer profile
    const newTrainer = await prisma.trainer.create({
      data: {
        name: data.name,
        specialty: data.specialty,
        imageUrl: data.imageUrl || 'https://placehold.co/300x300.png',
        userId: newUser.id,
      },
      include: {
        user: { select: { email: true } }
      }
    });

    return { success: true, message: 'Trainer added successfully.', trainer: newTrainer };
  } catch (error) {
    console.error("Error adding trainer:", error);
    // Attempt to clean up user if trainer creation failed
    // This is a simplified cleanup. Transactional operations are better for robust atomicity.
    if (error instanceof Error && 'code' in error && (error as any).code === 'P2002' && (error as any).meta?.target?.includes('userId')) {
        // This means trainer profile for this user already exists or other unique constraint on userId
         return { success: false, message: 'Trainer profile for this user might already exist or user ID issue.' };
    }
    // if (newUser) { // This variable won't be in scope here if user creation was the failing part
    //   await prisma.user.delete({ where: { id: newUser.id } }).catch(e => console.error("Cleanup failed for user:", e));
    // }
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
        // Also update the associated User's name if the trainer's name changed
        user: {
          update: {
            name: data.name,
          },
        },
      },
      include: {
        user: { select: { email: true } }
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
    // Unassign trainer from any classes first
    // This is handled by onDelete: SetNull in Prisma schema now
    // await prisma.gymClass.updateMany({
    //   where: { trainerId: id },
    //   data: { trainerId: null },
    // });

    // Delete the Trainer profile
    await prisma.trainer.delete({
      where: { id },
    });
    // Note: The associated User record is NOT deleted by this action.
    // It can be managed/deleted separately if needed.
    return { success: true, message: 'Trainer profile deleted successfully.' };
  } catch (error) {
    console.error("Error deleting trainer:", error);
    if (error instanceof Error && 'code' in error && (error as any).code === 'P2025') { // Record to delete does not exist.
        return { success: false, message: 'Trainer not found or already deleted.' };
    }
    return { success: false, message: 'Failed to delete trainer. They might be assigned to active classes that prevent deletion due to DB constraints if SetNull isn't working as expected or if other issues arise.' };
  }
}
