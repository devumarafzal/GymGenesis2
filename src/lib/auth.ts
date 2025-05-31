
// THIS IS A CLIENT-SIDE AUTHENTICATION MOCK USING LOCALSTORAGE
// DO NOT USE THIS IN PRODUCTION DUE TO SECURITY RISKS (e.g., plain text passwords)

"use client"; // Ensure this can be used by client components

export interface User {
  id: string;
  name: string;
  email: string;
  passwordHash: string; // In a real app, this would be a hash, not plain text
  role: 'member' | 'trainer' | 'admin';
}

const USERS_STORAGE_KEY = 'gymUsers';
const CURRENT_USER_STORAGE_KEY = 'gymCurrentUser';

// Helper to get users from localStorage
const getUsers = (): User[] => {
  if (typeof window === 'undefined') return [];
  try {
    const usersJson = localStorage.getItem(USERS_STORAGE_KEY);
    if (usersJson) {
      return JSON.parse(usersJson);
    } else {
      // Seed admin user if no users exist
      const adminUser: User = {
        id: 'admin-seed',
        name: 'Admin User',
        email: 'admin@gym.com',
        // IMPORTANT: Storing plain text passwords is a major security risk.
        // This is for demonstration purposes only. In a real app, hash passwords.
        passwordHash: 'admin123', // Plain text for demo
        role: 'admin',
      };
      localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify([adminUser]));
      return [adminUser];
    }
  } catch (error) {
    console.error("Error accessing users from localStorage:", error);
    return [];
  }
};

// Helper to save users to localStorage
const saveUsers = (users: User[]): void => {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
  } catch (error) {
    console.error("Error saving users to localStorage:", error);
  }
};

// Helper to get current user from localStorage
export const getCurrentUser = (): User | null => {
  if (typeof window === 'undefined') return null;
  try {
    const currentUserJson = localStorage.getItem(CURRENT_USER_STORAGE_KEY);
    return currentUserJson ? JSON.parse(currentUserJson) : null;
  } catch (error) {
    console.error("Error accessing current user from localStorage:", error);
    return null;
  }
};

// Helper to set current user in localStorage
const setCurrentUser = (user: User | null): void => {
  if (typeof window === 'undefined') return;
  try {
    if (user) {
      localStorage.setItem(CURRENT_USER_STORAGE_KEY, JSON.stringify(user));
    } else {
      localStorage.removeItem(CURRENT_USER_STORAGE_KEY);
    }
    // Dispatch a storage event to notify other tabs/windows or hooks
    window.dispatchEvent(new Event('storage'));
  } catch (error) {
    console.error("Error setting current user in localStorage:", error);
  }
};

export const signUp = async (name: string, email: string, password: string): Promise<{ success: boolean; message: string; user?: User }> => {
  const users = getUsers();
  if (users.find(u => u.email === email)) {
    return { success: false, message: 'Email already exists.' };
  }

  // In a real app, hash the password securely here
  const newUser: User = {
    id: Date.now().toString(),
    name,
    email,
    passwordHash: password, // Storing plain text for demo
    role: 'member', // Default role
  };

  saveUsers([...users, newUser]);
  return { success: true, message: 'Sign up successful!', user: newUser };
};

export const signIn = async (email: string, password: string): Promise<{ success: boolean; message: string; user?: User }> => {
  const users = getUsers();
  const user = users.find(u => u.email === email);

  if (user && user.passwordHash === password) { // Plain text comparison for demo
    setCurrentUser(user);
    return { success: true, message: 'Sign in successful!', user };
  }
  return { success: false, message: 'Invalid email or password.' };
};

export const signOut = (): void => {
  setCurrentUser(null);
};

export const isAuthenticated = (): boolean => {
  return !!getCurrentUser();
};

export const getUserRole = (): User['role'] | null => {
  const user = getCurrentUser();
  return user ? user.role : null;
};
