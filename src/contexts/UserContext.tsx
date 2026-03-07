import React, { createContext, useContext, useState, useEffect } from 'react';
import { getCognitoCurrentUser, getCognitoUserAttributes, cognitoSignOut } from '@/lib/cognito-auth';

interface UserData {
  name: string;
  role: 'user' | 'counsellor' | 'admin';
  email: string;
  userId?: string;
}

interface UserContextType {
  user: UserData | null;
  login: (userData: UserData) => void;
  logout: () => Promise<void>;
  loading: boolean;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for existing session on mount
    const checkAuth = async () => {
      try {
        const currentUser = await getCognitoCurrentUser();

        if (currentUser) {
          const attributes = await getCognitoUserAttributes();

          if (attributes) {
            setUser({
              userId: currentUser.userId,
              name: attributes.name,
              email: attributes.email,
              role: (attributes.role as 'user' | 'counsellor' | 'admin') || 'user',
            });
          }
        }
      } catch (error) {
        console.error('Auth check error:', error);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  const login = (userData: UserData) => {
    setUser(userData);
  };

  const logout = async () => {
    try {
      await cognitoSignOut();
      setUser(null);
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <UserContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};
