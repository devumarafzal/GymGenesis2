"use client"; 

import { prisma } from './prisma';
import type { User as PrismaUser, Role } from '@prisma/client'; 

export type User = PrismaUser;

// Local storage key for the current user ID
const CURRENT_USER_ID_KEY = 'gymCurrentUserId';

export const setCurrentUserId = (userId: string | null) => {
  if (typeof window === 'undefined') return;
  try {
    if (userId) {
      localStorage.setItem(CURRENT_USER_ID_KEY, userId);
    } else {
      localStorage.removeItem(CURRENT_USER_ID_KEY);
    }
    window.dispatchEvent(new Event('storage'));
  } catch (error) {
    console.error("Error setting current user ID in localStorage:", error);
  }
};

export const getCurrentUserId = () => {
  if (typeof window === 'undefined') return null;
  try {
    return localStorage.getItem(CURRENT_USER_ID_KEY);
  } catch (error) {
    console.error("Error accessing current user ID from localStorage:", error);
    return null;
  }
};

export const getCurrentUser = async (): Promise<User | null> => {
  const userId = getCurrentUserId();
  if (!userId) return null;

  try {
    const response = await fetch('/api/auth/me', {
      headers: {
        'x-user-id': userId
      }
    });
    if (!response.ok) {
      return null;
    }
    const data = await response.json();
    return data.user;
  } catch (error) {
    console.error("Error fetching current user:", error);
    return null;
  }
};

export const signUp = async (name: string, email: string, password: string): Promise<{ success: boolean; message: string; user?: User }> => {
  try {
    const response = await fetch('/api/auth/signup', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ name, email, password }),
    });

    const data = await response.json();
    if (data.success && data.user) {
      setCurrentUserId(data.user.id);
    }
    return data;
  } catch (error) {
    console.error("Error during sign up:", error);
    return { success: false, message: 'An error occurred during sign up.' };
  }
};

export const signIn = async (email: string, password: string): Promise<{ success: boolean; message: string; user?: User }> => {
  try {
    const response = await fetch('/api/auth/signin', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();
    if (data.success && data.user) {
      setCurrentUserId(data.user.id);
    }
    return data;
  } catch (error) {
    console.error("Error during sign in:", error);
    return { success: false, message: 'An error occurred during sign in.' };
  }
};

export const signOut = (): void => {
  setCurrentUserId(null);
};

export const updateUserName = async (userId: string, newName: string): Promise<{ success: boolean; message: string; updatedUser?: User }> => {
  try {
    const response = await fetch('/api/auth/update-name', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-user-id': userId
      },
      body: JSON.stringify({ newName }),
    });

    return await response.json();
  } catch (error) {
    console.error("Error updating user name:", error);
    return { success: false, message: "Failed to update name." };
  }
};

export const updateUserPassword = async (userId: string, currentPassword: string, newPassword: string): Promise<{ success: boolean; message: string }> => {
  try {
    const response = await fetch('/api/auth/update-password', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-user-id': userId
      },
      body: JSON.stringify({ currentPassword, newPassword }),
    });

    return await response.json();
  } catch (error) {
    console.error("Error updating user password:", error);
    return { success: false, message: "Failed to update password." };
  }
};

export const setPasswordAndClearFlag = async (userId: string, newPassword: string): Promise<{ success: boolean; message: string; updatedUser?: User }> => {
  try {
    const response = await fetch('/api/auth/set-password', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-user-id': userId
      },
      body: JSON.stringify({ currentPassword: 'changeme', newPassword }),
    });

    return await response.json();
  } catch (error) {
    console.error("Error setting new password:", error);
    return { success: false, message: "Failed to set new password." };
  }
};
