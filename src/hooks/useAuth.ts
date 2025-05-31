
"use client";

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import type { User } from '@/lib/auth';
import {
  getCurrentUser as authGetCurrentUser,
  signIn as authSignIn,
  signUp as authSignUp,
  signOut as authSignOut,
  isAuthenticated as authIsAuthenticated,
  getUserRole as authGetUserRole,
  updateUserName as authUpdateUserName,
  updateUserPassword as authUpdateUserPassword,
} from '@/lib/auth';

export interface AuthHook {
  currentUser: User | null;
  isAuthenticated: boolean;
  role: User['role'] | null;
  signIn: typeof authSignIn;
  signUp: typeof authSignUp;
  signOutAndRedirect: (redirectTo?: string) => void;
  isLoading: boolean;
  updateName: (newName: string) => Promise<{ success: boolean; message: string; updatedUser?: User }>;
  changePassword: (currentPassword: string, newPassword: string) => Promise<{ success: boolean; message: string }>;
}

export function useAuth(): AuthHook {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  const updateUserState = useCallback(() => {
    const user = authGetCurrentUser();
    setCurrentUser(user);
    setIsLoading(false);
  }, []);

  useEffect(() => {
    updateUserState(); // Initial check

    // Listen for storage changes to sync auth state across tabs/windows
    const handleStorageChange = () => {
      updateUserState();
    };
    window.addEventListener('storage', handleStorageChange);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [updateUserState]);

  const signIn: typeof authSignIn = async (email, password) => {
    setIsLoading(true);
    const result = await authSignIn(email, password);
    updateUserState(); // Update state after sign-in attempt
    return result;
  };

  const signUp: typeof authSignUp = async (name, email, password) => {
    setIsLoading(true);
    const result = await authSignUp(name, email, password);
    // No automatic sign-in after sign-up, user should explicitly sign in
    updateUserState(); // Update state if needed (though signup doesn't log in)
    setIsLoading(false);
    return result;
  };

  const signOutAndRedirect = (redirectTo: string = '/') => {
    authSignOut();
    updateUserState(); // Update state after sign-out
    router.push(redirectTo);
  };

  const updateName = async (newName: string) => {
    if (!currentUser) return { success: false, message: "Not authenticated." };
    setIsLoading(true);
    const result = await authUpdateUserName(currentUser.id, newName);
    updateUserState();
    setIsLoading(false);
    return result;
  };

  const changePassword = async (currentPassword: string, newPassword: string) => {
    if (!currentUser) return { success: false, message: "Not authenticated." };
    setIsLoading(true);
    const result = await authUpdateUserPassword(currentUser.id, currentPassword, newPassword);
    // No need to updateUserState here if password change doesn't affect display name/email immediately
    // but if it logs user out or changes session, then yes. For now, assume it doesn't.
    // If session token changes, updateUserState would be vital.
    setIsLoading(false);
    return result;
  };

  return {
    currentUser,
    isAuthenticated: authIsAuthenticated(), // More reliable to call the direct check
    role: authGetUserRole(),
    signIn,
    signUp,
    signOutAndRedirect,
    isLoading,
    updateName,
    changePassword,
  };
}
