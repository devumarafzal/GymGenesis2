
"use client";

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import type { User, Role } from '@prisma/client'; // Use Prisma's User type
import {
  getCurrentUser as authGetCurrentUser,
  signIn as authSignIn,
  signUp as authSignUp,
  signOut as authSignOut,
  // isAuthenticated as authIsAuthenticated, // Will use local state
  // getUserRole as authGetUserRole, // Will use local state
  updateUserName as authUpdateUserName,
  updateUserPassword as authUpdateUserPassword,
} from '@/lib/auth';

export interface AuthHook {
  currentUser: User | null;
  isAuthenticated: boolean; // Derived from currentUser state
  role: User['role'] | null; // Derived from currentUser state
  signIn: typeof authSignIn;
  signUp: typeof authSignUp;
  signOutAndRedirect: (redirectTo?: string) => void;
  isLoading: boolean;
  updateName: (newName: string) => Promise<{ success: boolean; message: string; updatedUser?: User }>;
  changePassword: (currentPassword: string, newPassword: string) => Promise<{ success: boolean; message: string }>;
}

export function useAuth(): AuthHook {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [role, setRole] = useState<Role | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  const updateUserState = useCallback(async () => {
    setIsLoading(true);
    const user = await authGetCurrentUser();
    setCurrentUser(user);
    setIsAuthenticated(!!user);
    setRole(user?.role || null);
    setIsLoading(false);
  }, []);

  useEffect(() => {
    updateUserState(); // Initial check

    const handleStorageChange = (event: StorageEvent) => {
      // Listen for changes to our specific session key or general storage events
      // that might indicate auth state change (e.g. logged out from another tab)
      if (event.key === 'gymCurrentUserId' || event.key === null) { // event.key is null for localStorage.clear()
        updateUserState();
      }
    };
    window.addEventListener('storage', handleStorageChange);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [updateUserState]);

  const signIn: typeof authSignIn = async (email, password) => {
    setIsLoading(true);
    const result = await authSignIn(email, password);
    if (result.success && result.user) {
      setCurrentUser(result.user);
      setIsAuthenticated(true);
      setRole(result.user.role);
    } else {
      // Ensure state reflects sign-in failure
      setCurrentUser(null);
      setIsAuthenticated(false);
      setRole(null);
    }
    setIsLoading(false);
    return result;
  };

  const signUp: typeof authSignUp = async (name, email, password) => {
    setIsLoading(true);
    const result = await authSignUp(name, email, password);
    // Sign up does not log the user in automatically in this setup
    setIsLoading(false);
    return result;
  };

  const signOutAndRedirect = (redirectTo: string = '/') => {
    authSignOut();
    setCurrentUser(null);
    setIsAuthenticated(false);
    setRole(null);
    router.push(redirectTo);
  };

  const updateName = async (newName: string) => {
    if (!currentUser) return { success: false, message: "Not authenticated." };
    setIsLoading(true);
    const result = await authUpdateUserName(currentUser.id, newName);
    if (result.success && result.updatedUser) {
      setCurrentUser(result.updatedUser); // Update local state
      setRole(result.updatedUser.role);
    }
    setIsLoading(false);
    return result;
  };

  const changePassword = async (currentPassword: string, newPassword: string) => {
    if (!currentUser) return { success: false, message: "Not authenticated." };
    setIsLoading(true);
    const result = await authUpdateUserPassword(currentUser.id, currentPassword, newPassword);
    // Password change doesn't alter the user object structure here, so no setCurrentUser needed unless session is invalidated
    setIsLoading(false);
    return result;
  };

  return {
    currentUser,
    isAuthenticated,
    role,
    signIn,
    signUp,
    signOutAndRedirect,
    isLoading,
    updateName,
    changePassword,
  };
}
