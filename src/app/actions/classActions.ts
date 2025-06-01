
'use server';

import prisma from '@/lib/prisma';
import type { GymClass, Trainer, DayOfWeek as PrismaDayOfWeek } from '@prisma/client';

// Interface for class data returned to client, including trainer name and booking count
export interface GymClassWithDetails extends GymClass {
  trainer?: { name: string } | null; // Trainer can be null
  _count?: { bookings: number };
  bookedUserIds?: string[]; // Keep this for client-side compatibility temporarily if needed, but primarily rely on _count
}

export async function getClasses(): Promise<GymClassWithDetails[]> {
  try {
    const classes = await prisma.gymClass.findMany({
      include: {
        trainer: {
          select: { name: true },
        },
        _count: {
          select: { bookings: true },
        },
      },
      orderBy: [
        // Prisma doesn't directly support sorting by a custom DayOfWeek enum order.
        // We'll sort client-side if specific day order is crucial beyond alphabetical.
        // Or handle complex sorting on DB level if possible with raw queries or views.
        { dayOfWeek: 'asc' }, 
        { startTime: 'asc' },
      ],
    });
    // Map to include bookedUserIds if absolutely needed, though _count.bookings is preferred.
    // For this iteration, let's rely on _count and adapt client if necessary.
    return classes.map(c => ({...c, bookedUserIds: [] })); // Placeholder for bookedUserIds
  } catch (error) {
    console.error("Error fetching classes:", error);
    return [];
  }
}

interface AddClassData {
  serviceTitle: string;
  trainerId: string | null; // Trainer can be null
  dayOfWeek: PrismaDayOfWeek;
  startTime: string;
  endTime: string;
  capacity: number;
}

export async function addClass(data: AddClassData): Promise<{ success: boolean; message: string; class?: GymClassWithDetails }> {
  try {
    const newClass = await prisma.gymClass.create({
      data: {
        ...data,
        trainerId: data.trainerId || undefined, // Pass undefined if null to Prisma
      },
      include: {
        trainer: { select: { name: true } },
        _count: { select: { bookings: true } },
      },
    });
    return { success: true, message: 'Class added successfully.', class: {...newClass, bookedUserIds: []} };
  } catch (error) {
    console.error("Error adding class:", error);
    return { success: false, message: 'Failed to add class.' };
  }
}

interface UpdateClassData extends Partial<AddClassData> {}

export async function updateClass(id: string, data: UpdateClassData): Promise<{ success: boolean; message: string; class?: GymClassWithDetails }> {
  try {
    const updatedClass = await prisma.gymClass.update({
      where: { id },
      data: {
        ...data,
        trainerId: data.trainerId === '' ? null : data.trainerId, // Handle empty string for unassigning
      },
      include: {
        trainer: { select: { name: true } },
        _count: { select: { bookings: true } },
      },
    });
    return { success: true, message: 'Class updated successfully.', class: {...updatedClass, bookedUserIds: []} };
  } catch (error) {
    console.error("Error updating class:", error);
    return { success: false, message: 'Failed to update class.' };
  }
}

export async function deleteClass(id: string): Promise<{ success: boolean; message: string }> {
  try {
    // Bookings associated with this class will be cascade deleted by the DB.
    await prisma.gymClass.delete({
      where: { id },
    });
    return { success: true, message: 'Class deleted successfully.' };
  } catch (error) {
    console.error("Error deleting class:", error);
     if (error instanceof Error && 'code' in error && (error as any).code === 'P2025') {
        return { success: false, message: 'Class not found or already deleted.' };
    }
    return { success: false, message: 'Failed to delete class.' };
  }
}

// Action specifically for schedule page, might be identical to getClasses for now
export async function getClassesForSchedule(): Promise<GymClassWithDetails[]> {
    return getClasses();
}
