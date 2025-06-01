'use server';

import { prisma } from '@/lib/prisma';
import type { Booking, GymClass, Trainer } from '@prisma/client';

export interface BookingWithDetails extends Booking {
  gymClass: GymClass & {
    trainer: Trainer | null;
    _count?: { bookings: number }; // Include booking count for the class
  };
}

export async function getBookingsForUser(userId: string): Promise<BookingWithDetails[]> {
  try {
    const bookings = await prisma.booking.findMany({
      where: { userId },
      include: {
        gymClass: {
          include: {
            trainer: true,
            _count: { select: { bookings: true } },
          },
        },
      },
      orderBy: [
        // Order by day of week then start time (requires mapping day to a sortable value)
        // For simplicity, this might be handled client-side or by a more complex query if needed.
        // Prisma doesn't easily sort by enum order directly.
        { gymClass: { dayOfWeek: 'asc' } }, // Alphabetical sort for day
        { gymClass: { startTime: 'asc' } },
      ],
    });
    return bookings;
  } catch (error) {
    console.error("Error fetching user bookings:", error);
    return [];
  }
}

export async function bookClass(userId: string, classId: string): Promise<{ success: boolean; message: string; booking?: Booking }> {
  try {
    // 1. Check if class exists and get its capacity and current bookings
    const gymClass = await prisma.gymClass.findUnique({
      where: { id: classId },
      include: { _count: { select: { bookings: true } } },
    });

    if (!gymClass) {
      return { success: false, message: 'Class not found.' };
    }

    // 2. Check if user is already booked
    const existingBooking = await prisma.booking.findUnique({
      where: {
        userId_classId: {
          userId,
          classId,
        },
      },
    });

    if (existingBooking) {
      return { success: false, message: 'You have already booked this class.' };
    }

    // 3. Check if class is full
    if (gymClass._count.bookings >= gymClass.capacity) {
      return { success: false, message: 'Sorry, this class is already full.' };
    }

    // 4. Create booking
    const newBooking = await prisma.booking.create({
      data: {
        userId,
        classId,
      },
    });

    return { success: true, message: 'Class booked successfully!', booking: newBooking };
  } catch (error) {
    console.error("Error booking class:", error);
    // Check for unique constraint violation (P2002) in case the already booked check failed or race condition
     if (error instanceof Error && 'code' in error && (error as any).code === 'P2002') {
        return { success: false, message: 'You might already be booked in this class (concurrent request) or other booking conflict.' };
    }
    return { success: false, message: 'Failed to book class.' };
  }
}

export async function cancelBooking(bookingId: string, userId: string): Promise<{ success: boolean; message: string }> {
  // We also pass userId to ensure a user can only cancel their own bookings,
  // even if they somehow get another booking's ID.
  try {
    const booking = await prisma.booking.findUnique({
        where: {id: bookingId}
    });

    if (!booking) {
        return { success: false, message: 'Booking not found.' };
    }
    if (booking.userId !== userId) {
        return { success: false, message: 'You are not authorized to cancel this booking.' };
    }

    await prisma.booking.delete({
      where: { id: bookingId, userId: userId }, // Ensure user owns the booking
    });
    return { success: true, message: 'Booking cancelled successfully.' };
  } catch (error) {
    console.error("Error cancelling booking:", error);
    if (error instanceof Error && 'code' in error && (error as any).code === 'P2025') { // Record to delete does not exist.
        return { success: false, message: 'Booking not found or already cancelled.' };
    }
    return { success: false, message: 'Failed to cancel booking.' };
  }
}
