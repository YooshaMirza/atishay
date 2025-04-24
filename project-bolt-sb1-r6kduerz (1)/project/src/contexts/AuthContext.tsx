import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User as FirebaseUser } from 'firebase/auth';
import { 
  subscribeToAuthChanges, 
  getUserData 
} from '../services/firebase';
import { User, PoliticalLeaning } from '../types';

interface AuthContextType {
  currentUser: FirebaseUser | null;
  userData: User | null;
  loading: boolean;
  setUserPoliticalLeaning: (leaning: PoliticalLeaning) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<FirebaseUser | null>(null);
  const [userData, setUserData] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = subscribeToAuthChanges(async (user) => {
      setCurrentUser(user);
      
      if (user) {
        try {
          const userDataFromFirestore = await getUserData(user.uid);
          setUserData(userDataFromFirestore);
        } catch (error) {
          console.error('Error fetching user data:', error);
        }
      } else {
        setUserData(null);
      }
      
      setLoading(false);
    });
    
    return unsubscribe;
  }, []);

  const setUserPoliticalLeaning = async (leaning: PoliticalLeaning) => {
    if (!currentUser) return;
    
    try {
      // Here you would call your Firebase service function to update the user's political leaning
      // For now, let's just update the local state for demonstration
      setUserData(prev => prev ? { ...prev, politicalLeaning: leaning, surveyCompleted: true } : null);
      
      // In a real implementation, you would call a function like:
      // await updateUserPoliticalLeaning(currentUser.uid, leaning);
    } catch (error) {
      console.error('Error updating political leaning:', error);
      throw error;
    }
  };

  const value = {
    currentUser,
    userData,
    loading,
    setUserPoliticalLeaning
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};