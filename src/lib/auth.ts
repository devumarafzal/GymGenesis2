
// THIS IS CLIENT-SIDE AUTHENTICATION LOGIC INTERACTING WITH PRISMA
// Password handling is still simplified for this prototype.
// In a real app, use robust password hashing (e.g., bcrypt) on the server-side.

"use client"; // Ensure this can be used by client components

import prisma from './prisma';
import type { User as PrismaUser, Role } from '@prisma/client'; // Import Prisma generated types

// Re-export Prisma's User type or define a compatible one if needed for frontend
export type User = PrismaUser;

// Using localStorage for a simple session token (user ID)
const CURRENT_USER_ID_STORAGE_KEY = 'gymCurrentUserId';

// Helper to get current user ID from localStorage
const getCurrentUserId = (): string | null => {
  if (typeof window === 'undefined') return null;
  try {
    return localStorage.getItem(CURRENT_USER_ID_STORAGE_KEY);
  } catch (error) {
    console.error("Error accessing current user ID from localStorage:", error);
    return null;
  }
};

// Helper to set current user ID in localStorage
const setCurrentUserId = (userId: string | null): void => {
  if (typeof window === 'undefined') return;
  try {
    if (userId) {
      localStorage.setItem(CURRENT_USER_ID_STORAGE_KEY, userId);
    } else {
      localStorage.removeItem(CURRENT_USER_ID_STORAGE_KEY);
    }
    // Dispatch a storage event to notify other tabs/windows or hooks
    window.dispatchEvent(new Event('storage'));
  } catch (error) {
    console.error("Error setting current user ID in localStorage:", error);
  }
};

export const getCurrentUser = async (): Promise<User | null> => {
  if (typeof window === 'undefined') return null;
  const userId = getCurrentUserId();
  if (!userId) return null;

  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });
    return user;
  } catch (error) {
    console.error("Error fetching user from database:", error);
    setCurrentUserId(null); // Clear invalid session
    return null;
  }
};

export const signUp = async (name: string, email: string, password: string): Promise<{ success: boolean; message: string; user?: User }> => {
  try {
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return { success: false, message: 'Email already exists.' };
    }

    // IMPORTANT: In a real app, HASH THE PASSWORD securely here before saving.
    // Storing plain text passwords is a major security risk.
    const passwordHash = password; // Plain text for demo

    const newUser = await prisma.user.create({
      data: {
        name,
        email,
        passwordHash, // Store the "hashed" (plain text for demo) password
        role: 'MEMBER', // Default role
      },
    });
    return { success: true, message: 'Sign up successful!', user: newUser };
  } catch (error) {
    console.error("Error during sign up:", error);
    return { success: false, message: 'An error occurred during sign up.' };
  }
};

export const signIn = async (email: string, password: string): Promise<{ success: boolean; message: string; user?: User }> => {
  try {
    const user = await prisma.user.findUnique({
      where: { email },
    });

    // IMPORTANT: In a real app, compare the provided password with the stored HASH.
    if (user && user.passwordHash === password) { // Plain text comparison for demo
      setCurrentUserId(user.id);
      return { success: true, message: 'Sign in successful!', user };
    }
    return { success: false, message: 'Invalid email or password.' };
  } catch (error) {
    console.error("Error during sign in:", error);
    return { success: false, message: 'An error occurred during sign in.' };
  }
};

export const signOut = (): void => {
  setCurrentUserId(null);
};

export const isAuthenticated = async (): Promise<boolean> => {
  const user = await getCurrentUser();
  return !!user;
};

export const getUserRole = async (): Promise<Role | null> => {
  const user = await getCurrentUser();
  return user ? user.role : null;
};

export const updateUserName = async (userId: string, newName: string): Promise<{ success: boolean; message: string; updatedUser?: User }> => {
  if (typeof window === 'undefined') return { success: false, message: "Operation failed: No window context."};
  try {
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { name: newName },
    });

    // If the updated user is the currently logged-in one, refresh their session data lightly.
    // The useAuth hook will handle refreshing its own state.
    const currentSessionUserId = getCurrentUserId();
    if (currentSessionUserId === userId) {
      // The hook will refetch the user, so no direct action needed here other than ensuring ID is still set.
    }

    return { success: true, message: "Name updated successfully.", updatedUser };
  } catch (error) {
    console.error("Error updating user name:", error);
    return { success: false, message: "Failed to update name." };
  }
};

export const updateUserPassword = async (userId: string, currentPassword: string, newPassword: string): Promise<{ success: boolean; message: string }> => {
  if (typeof window === 'undefined') return { success: false, message: "Operation failed: No window context."};
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return { success: false, message: "User not found." };
    }

    // IMPORTANT: In a real app, compare currentPassword with the stored HASH.
    if (user.passwordHash !== currentPassword) { // Plain text comparison for demo
      return { success: false, message: "Current password does not match." };
    }

    // IMPORTANT: In a real app, HASH the newPassword securely here before saving.
    const newPasswordHash = newPassword; // Plain text for demo

    await prisma.user.update({
      where: { id: userId },
      data: { passwordHash: newPasswordHash },
    });
    
    // Password change might invalidate session tokens in real apps. Here, we just confirm.
    // The useAuth hook will manage its state.

    return { success: true, message: "Password updated successfully." };
  } catch (error) {
    console.error("Error updating user password:", error);
    return { success: false, message: "Failed to update password." };
  }
};
