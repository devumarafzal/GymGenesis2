"use client";

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import type { User, Role } from '@prisma/client'; 
import {
  getCurrentUser as authGetCurrentUser,
  signIn as authSignIn,
  signUp as authSignUp,
  signOut as authSignOut,
  updateUserName as authUpdateUserName,
  updateUserPassword as authUpdateUserPassword,
  setPasswordAndClearFlag as authSetPasswordAndClearFlag,
} from '@/lib/auth';

export interface AuthHook {
  currentUser: User | null;
  isAuthenticated: boolean; 
  role: Role | null; 
  signIn: typeof authSignIn;
  signUp: typeof authSignUp;
  signOutAndRedirect: (redirectTo?: string) => void;
  isLoading: boolean;
  updateName: (newName: string) => Promise<{ success: boolean; message: string; updatedUser?: User }>;
  changePassword: (currentPassword: string, newPassword: string) => Promise<{ success: boolean; message: string }>;
  completePasswordSetup: (newPassword: string) => Promise<{ success: boolean; message: string; updatedUser?: User }>;
}

export function useAuth(): AuthHook {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [role, setRole] = useState<Role | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  const updateUserState = useCallback(async () => {
    setIsLoading(true);
    try {
      const user = await authGetCurrentUser();
      setCurrentUser(user);
      setIsAuthenticated(!!user);
      setRole(user?.role || null);
    } catch (error) {
      console.error("Error updating user state:", error);
      setCurrentUser(null);
      setIsAuthenticated(false);
      setRole(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    updateUserState(); 

    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === 'gymCurrentUserId' || event.key === null) { 
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
    try {
      const result = await authSignIn(email, password);
      if (result.success && result.user) {
        setCurrentUser(result.user);
        setIsAuthenticated(true);
        setRole(result.user.role);
        
        // Force a re-fetch of user data to ensure everything is in sync
        await updateUserState();
      } else {
        setCurrentUser(null);
        setIsAuthenticated(false);
        setRole(null);
      }
      return result;
    } catch (error) {
      console.error("Error during sign in:", error);
      return { success: false, message: 'An error occurred during sign in.' };
    } finally {
      setIsLoading(false);
    }
  };

  const signUp: typeof authSignUp = async (name, email, password) => {
    setIsLoading(true);
    const result = await authSignUp(name, email, password);
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
      setCurrentUser(result.updatedUser); 
      setRole(result.updatedUser.role);
    }
    setIsLoading(false);
    return result;
  };

  const changePassword = async (currentPassword: string, newPassword: string) => {
    if (!currentUser) return { success: false, message: "Not authenticated." };
    setIsLoading(true);
    const result = await authUpdateUserPassword(currentUser.id, currentPassword, newPassword);
    setIsLoading(false);
    return result;
  };

  const completePasswordSetup = async (newPassword: string) => {
    if (!currentUser) return { success: false, message: "Not authenticated." };
    setIsLoading(true);
    const result = await authSetPasswordAndClearFlag(currentUser.id, newPassword);
    if (result.success && result.updatedUser) {
      setCurrentUser(result.updatedUser); // Update local state with cleared flag
      setRole(result.updatedUser.role);
    }
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
    completePasswordSetup,
  };
}
