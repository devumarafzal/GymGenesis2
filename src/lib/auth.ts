
"use client"; 

import prisma from './prisma';
import type { User as PrismaUser, Role } from '@prisma/client'; 

export type User = PrismaUser;

const CURRENT_USER_ID_STORAGE_KEY = 'gymCurrentUserId';

const getCurrentUserId = (): string | null => {
  if (typeof window === 'undefined') return null;
  try {
    return localStorage.getItem(CURRENT_USER_ID_STORAGE_KEY);
  } catch (error) {
    console.error("Error accessing current user ID from localStorage:", error);
    return null;
  }
};

const setCurrentUserId = (userId: string | null): void => {
  if (typeof window === 'undefined') return;
  try {
    if (userId) {
      localStorage.setItem(CURRENT_USER_ID_STORAGE_KEY, userId);
    } else {
      localStorage.removeItem(CURRENT_USER_ID_STORAGE_KEY);
    }
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
    setCurrentUserId(null); 
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

    const passwordHash = password; 

    const newUser = await prisma.user.create({
      data: {
        name,
        email,
        passwordHash, 
        role: 'MEMBER',
        requiresPasswordChange: false, // Standard members don't require immediate change
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

    if (user && user.passwordHash === password) { 
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

export const updateUserName = async (userId: string, newName: string): Promise<{ success: boolean; message: string; updatedUser?: User }> => {
  if (typeof window === 'undefined') return { success: false, message: "Operation failed: No window context."};
  try {
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { name: newName },
    });
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

    if (user.passwordHash !== currentPassword) { 
      return { success: false, message: "Current password does not match." };
    }

    const newPasswordHash = newPassword; 

    await prisma.user.update({
      where: { id: userId },
      data: { passwordHash: newPasswordHash },
    });
    
    return { success: true, message: "Password updated successfully." };
  } catch (error) {
    console.error("Error updating user password:", error);
    return { success: false, message: "Failed to update password." };
  }
};

export const setPasswordAndClearFlag = async (userId: string, newPassword: string): Promise<{ success: boolean; message: string; updatedUser?: User }> => {
  if (typeof window === 'undefined') return { success: false, message: "Operation failed: No window context."};
  try {
    const newPasswordHash = newPassword; // Plain text for demo
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        passwordHash: newPasswordHash,
        requiresPasswordChange: false,
      },
    });
    return { success: true, message: "Password set successfully.", updatedUser };
  } catch (error) {
    console.error("Error setting new password:", error);
    return { success: false, message: "Failed to set new password." };
  }
};
