import React, { createContext, useContext, useEffect, useState } from 'react';
import { User as FirebaseUser, onAuthStateChanged } from 'firebase/auth';
import { auth } from '@/services/firebase/config';
import {
  UserProfile,
  createOrUpdateUserDoc,
  loginWithEmail,
  registerWithEmail,
  loginWithGoogle,
  logoutUser,
  sendPasswordReset,
} from '@/services/firebase/auth';

interface AuthContextType {
  currentUser: FirebaseUser | null;
  userProfile: UserProfile | null;
  isLoading: boolean;
  isAdmin: boolean;
  login: typeof loginWithEmail;
  register: typeof registerWithEmail;
  loginWithGoogle: typeof loginWithGoogle;
  logout: typeof logoutUser;
  resetPassword: typeof sendPasswordReset;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<FirebaseUser | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // লাইভ অথেন্টিকেশন স্টেট পরিবর্তন ট্র্যাকিং
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setIsLoading(true);
      try {
        if (user) {
          setCurrentUser(user);
          // Firestore থেকে ইউজারের প্রোফাইল এবং রোল লোড করা
          const profile = await createOrUpdateUserDoc(user);
          setUserProfile(profile);
        } else {
          setCurrentUser(null);
          setUserProfile(null);
        }
      } catch (error) {
        console.error('[AuthContext] Error syncing user profile:', error);
        setCurrentUser(null);
        setUserProfile(null);
      } finally {
        setIsLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  // অ্যাডমিন রোল চেক (মাস্টার প্রম্পটের ৩০ নং সেকশন অনুযায়ী)
  const isAdmin = userProfile?.role === 'admin';

  const value: AuthContextType = {
    currentUser,
    userProfile,
    isLoading,
    isAdmin,
    login: loginWithEmail,
    register: registerWithEmail,
    loginWithGoogle,
    logout: logoutUser,
    resetPassword: sendPasswordReset,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// অ্যাপের যেকোনো কম্পোনেন্ট থেকে সহজে ব্যবহারযোগ্য কাস্টম হুক
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};