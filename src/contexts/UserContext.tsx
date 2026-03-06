import React, { createContext, useContext, useState, useEffect } from 'react';
// TODO: Switch back to Cognito once AWS is set up
// import { getCognitoCurrentUser, getCognitoUserAttributes, cognitoSignOut } from '@/lib/cognito-auth';
import { getTempCurrentUser, getTempUserAttributes, tempSignOut } from '@/lib/tempAuth';

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
        // TODO: Switch to Cognito
        // const currentUser = await getCognitoCurrentUser();
        const currentUser = await getTempCurrentUser();
        
        if (currentUser) {
          // TODO: Switch to Cognito
          // const attributes = await getCognitoUserAttributes();
          const attributes = await getTempUserAttributes();
          
          if (attributes) {
            setUser({
              userId: currentUser.userId,
              name: attributes.name,
              email: attributes.email,
              role: attributes.role as 'user' | 'counsellor' | 'admin',
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
      // TODO: Switch to Cognito
      // await cognitoSignOut();
      await tempSignOut();
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
