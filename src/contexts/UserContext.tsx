import React, { createContext, useContext, useState, useEffect } from 'react';

interface UserData {
  name: string;
  role: 'user' | 'counsellor' | 'admin';
  email: string;
}

interface UserContextType {
  user: UserData | null;
  login: (userData: UserData) => void;
  logout: () => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserData | null>(null);

  useEffect(() => {
    // Prefer new MindMate key, but gracefully fall back to old MindCare key
    const storedUserNew = localStorage.getItem('mindmate_user');
    const storedUserOld = localStorage.getItem('mindcare_user');
    const storedUser = storedUserNew || storedUserOld;
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const login = (userData: UserData) => {
    setUser(userData);
    localStorage.setItem('mindmate_user', JSON.stringify(userData));
    // Maintain role-based registries locally to keep separate entries
    try {
      const key =
        userData.role === 'user'
          ? 'mindmate_registry_user'
          : userData.role === 'counsellor'
          ? 'mindmate_registry_counsellor'
          : 'mindmate_registry_admin';
      const existingRaw = localStorage.getItem(key);
      const existing: Array<{ name: string; email: string }> = existingRaw ? JSON.parse(existingRaw) : [];
      const already = existing.some((e) => e.email === userData.email);
      const updated = already ? existing : [...existing, { name: userData.name, email: userData.email }];
      localStorage.setItem(key, JSON.stringify(updated));
    } catch {}
  };

  const logout = () => {
    setUser(null);
    // Clear both new and legacy keys
    localStorage.removeItem('mindmate_user');
    localStorage.removeItem('mindcare_user');
    // Also clear Google auto-select to avoid immediate re-login
    try {
      // Disable auto-select session
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (window as any)?.google?.accounts?.id?.disableAutoSelect?.();
    } catch {}
  };

  return (
    <UserContext.Provider value={{ user, login, logout }}>
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
