    import React, { createContext, useState, useContext, useEffect } from 'react';
    import type { ReactNode } from 'react';

    // Define the shape of the user object (can be expanded)
    interface User {
      id: string;
      email: string;
      role: string; // e.g., 'admin', 'user'
      firstName?: string;
      lastName?: string;
    }

    // Define the shape of the authentication context state
    interface AuthContextType {
      isAuthenticated: boolean;
      user: User | null;
      token: string | null;
      isLoading: boolean;
      login: (token: string, userData: User) => void;
      logout: () => void;
      // register?: (userData: any) => Promise<void>; // Optional: if register also logs in
    }

    // Create the context with a default undefined value initially
    const AuthContext = createContext<AuthContextType | undefined>(undefined);

    // Define props for the AuthProvider component
    interface AuthProviderProps {
      children: ReactNode;
    }

    export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
      const [user, setUser] = useState<User | null>(null);
      const [token, setToken] = useState<string | null>(null);
      const [isLoading, setIsLoading] = useState<boolean>(true); // Start with loading true

      // Effect to check for existing token in localStorage on initial load
      useEffect(() => {
        try {
          const storedToken = localStorage.getItem('authToken');
          const storedUserString = localStorage.getItem('authUser');

          if (storedToken && storedUserString) {
            const storedUser: User = JSON.parse(storedUserString);
            setToken(storedToken);
            setUser(storedUser);
          }
        } catch (error) {
          console.error("Error loading auth state from localStorage:", error);
          // Clear potentially corrupted storage
          localStorage.removeItem('authToken');
          localStorage.removeItem('authUser');
        } finally {
          setIsLoading(false); // Finished loading initial auth state
        }
      }, []);

      const login = (newToken: string, userData: User) => {
        localStorage.setItem('authToken', newToken);
        localStorage.setItem('authUser', JSON.stringify(userData));
        setToken(newToken);
        setUser(userData);
      };

      const logout = () => {
        localStorage.removeItem('authToken');
        localStorage.removeItem('authUser');
        setToken(null);
        setUser(null);
        // Optionally, redirect to login page or homepage
        // window.location.href = '/login'; // Or use react-router navigate
      };

      const isAuthenticated = !!token && !!user;

      return (
        <AuthContext.Provider value={{ isAuthenticated, user, token, isLoading, login, logout }}>
          {children}
        </AuthContext.Provider>
      );
    };

    // Custom hook to use the AuthContext
    export const useAuth = (): AuthContextType => {
      const context = useContext(AuthContext);
      if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
      }
      return context;
    };
    