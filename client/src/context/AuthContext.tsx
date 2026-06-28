import React, { createContext, useContext, useState, useEffect } from 'react';
import { auth } from '../services/firebaseClient.js';
import { api } from '../services/api.js';

interface UserProfile {
  uid: string;
  email: string;
  name: string;
  role: 'citizen' | 'moderator' | 'officer' | 'admin';
  department?: string;
  reputationScore: number;
  xp: number;
  level: number;
  badges: string[];
  completedMissions: string[];
}

interface AuthContextType {
  currentUser: UserProfile | null;
  loading: boolean;
  loginWithEmail: (email: string, password: string) => Promise<any>;
  signupWithEmail: (email: string, name: string) => Promise<any>;
  loginWithGoogle: () => Promise<any>;
  logout: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  // Synchronize authenticated user profile with backend Firestore database
  const syncProfile = async (firebaseUser: any) => {
    if (!firebaseUser) {
      setCurrentUser(null);
      setLoading(false);
      return;
    }

    try {
      // Sync user profile with Express server
      const profile = await api.syncUser();
      setCurrentUser(profile);
    } catch (error) {
      console.error('Failed to sync user profile with database:', error);
      // Fallback stub representation if backend is down during setup
      setCurrentUser({
        uid: firebaseUser.uid,
        email: firebaseUser.email || '',
        name: firebaseUser.displayName || 'Civic Hero',
        role: firebaseUser.role || 'citizen',
        reputationScore: 100,
        xp: 0,
        level: 1,
        badges: [],
        completedMissions: []
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Firebase auth listener
    const unsubscribe = auth.onAuthStateChanged((user: any) => {
      setLoading(true);
      if (user) {
        syncProfile(user);
      } else {
        setCurrentUser(null);
        setLoading(false);
      }
    });

    return unsubscribe;
  }, []);

  const loginWithEmail = async (email: string, password: string) => {
    setLoading(true);
    try {
      const result = await auth.signInWithEmail(email, password);
      await syncProfile(result.user);
      return result;
    } catch (error) {
      setLoading(false);
      throw error;
    }
  };

  const signupWithEmail = async (email: string, name: string) => {
    setLoading(true);
    try {
      const result = await auth.signUpWithEmail(email, name);
      await syncProfile(result.user);
      return result;
    } catch (error) {
      setLoading(false);
      throw error;
    }
  };

  const loginWithGoogle = async () => {
    setLoading(true);
    try {
      const result = await auth.signInWithGoogle();
      await syncProfile(result.user);
      return result;
    } catch (error) {
      setLoading(false);
      throw error;
    }
  };

  const logout = async () => {
    setLoading(true);
    await auth.logout();
    setCurrentUser(null);
    setLoading(false);
  };

  const refreshProfile = async () => {
    if (!currentUser) return;
    try {
      const profile = await api.getUserProfile(currentUser.uid);
      setCurrentUser(profile);
    } catch (error) {
      console.error('Error refreshing profile:', error);
    }
  };

  return (
    <AuthContext.Provider value={{
      currentUser,
      loading,
      loginWithEmail,
      signupWithEmail,
      loginWithGoogle,
      logout,
      refreshProfile
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
