"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { 
  onAuthStateChanged, 
  signInWithEmailAndPassword, 
  signOut,
  User as FirebaseUser
} from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '@/backend/config';
import { User, AuthState, LoginCredentials } from '@/app/types';

interface AuthContextType extends AuthState {
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    isLoading: true,
    error: undefined
  });

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        await loadUserProfile(firebaseUser);
      } else {
        setAuthState({
          user: null,
          isAuthenticated: false,
          isLoading: false,
          error: undefined
        });
      }
    });

    return () => unsubscribe();
  }, []);

  const loadUserProfile = async (firebaseUser: FirebaseUser) => {
    try {
      const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
      
      if (userDoc.exists()) {
        const userData = userDoc.data() as Omit<User, 'id'>;
        const user: User = {
          id: firebaseUser.uid,
          ...userData,
          email: firebaseUser.email || userData.email,
          isEmailVerified: firebaseUser.emailVerified,
          lastLogin: new Date(),
          createdAt: userData.createdAt || new Date(),
          updatedAt: new Date()
        };

        setAuthState({
          user,
          isAuthenticated: true,
          isLoading: false,
          error: undefined
        });
      } else {
        // User document doesn't exist
        await signOut(auth);
        setAuthState({
          user: null,
          isAuthenticated: false,
          isLoading: false,
          error: 'User profile not found'
        });
      }
    } catch (error) {
      console.error('Error loading user profile:', error);
      setAuthState({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: 'Failed to load user profile'
      });
    }
  };

  const login = async (credentials: LoginCredentials) => {
    try {
      setAuthState(prev => ({ ...prev, isLoading: true, error: undefined }));
      
      const userCredential = await signInWithEmailAndPassword(
        auth, 
        credentials.email, 
        credentials.password
      );
      
      await loadUserProfile(userCredential.user);
    } catch (error: any) {
      setAuthState(prev => ({
        ...prev,
        isLoading: false,
        error: error.message || 'Login failed'
      }));
      throw error;
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
      setAuthState({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: undefined
      });
    } catch (error: any) {
      console.error('Logout error:', error);
      throw error;
    }
  };

  const refreshUser = async () => {
    if (auth.currentUser) {
      await loadUserProfile(auth.currentUser);
    }
  };

  const value: AuthContextType = {
    ...authState,
    login,
    logout,
    refreshUser
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export default AuthContext;
