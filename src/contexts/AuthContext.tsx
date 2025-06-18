import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User } from '../types';
import usersData from '../data/users.json';

interface AuthContextType {
  user: User | null;
  login: (userId: string, password: string, companyId?: string) => Promise<{ success: boolean; message?: string; user?: User }>;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for existing session
    const storedUser = localStorage.getItem('currentUser');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setIsLoading(false);
  }, []);

  const login = async (userId: string, password: string, companyId?: string): Promise<{ success: boolean; message?: string; user?: User }> => {
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Find user in the JSON data
      const foundUser = usersData.users.find(u => u.userId === userId);

      if (!foundUser) {
        return { success: false, message: 'User ID not found' };
      }

      // Check password
      if (foundUser.password !== password) {
        return { success: false, message: 'Invalid password' };
      }

      // For business accounts, check company ID
      if (foundUser.userType === 'business') {
        if (!companyId) {
          return { success: false, message: 'Company ID is required for business accounts' };
        }
        if (foundUser.companyId !== companyId) {
          return { success: false, message: 'Invalid Company ID' };
        }
      } else if (foundUser.userType === 'personal' && companyId) {
        return { success: false, message: 'Company ID should not be provided for personal accounts' };
      }

      // Update last login
      const updatedUser: User = {
        ...foundUser,
        userType: foundUser.userType as 'personal' | 'business',
        lastLogin: new Date().toISOString()
      };
      
      // If 2FA is enabled, don't set the user yet
      if (foundUser.settings.twoFactorAuth) {
        return { success: true, user: updatedUser };
      }
      
      setUser(updatedUser);
      localStorage.setItem('currentUser', JSON.stringify(updatedUser));
      return { success: true, user: updatedUser };
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, message: 'An error occurred during login' };
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('currentUser');
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}; 