import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { useLocation } from "wouter";
import { User, useGetMe } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (token: string, user: User) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();
  const token = localStorage.getItem("vigora_token");
  const [isAuthenticated, setIsAuthenticated] = useState(!!token);

  // Use the generated hook to fetch user profile if authenticated
  const { data: user, isLoading: isUserLoading } = useGetMe({
    query: {
      enabled: isAuthenticated,
      retry: false,
    }
  });

  useEffect(() => {
    const handleUnauthorized = () => {
      logout();
    };

    window.addEventListener('auth:unauthorized', handleUnauthorized);
    return () => window.removeEventListener('auth:unauthorized', handleUnauthorized);
  }, []);

  const login = (newToken: string, newUser: User) => {
    localStorage.setItem("vigora_token", newToken);
    setIsAuthenticated(true);
    queryClient.setQueryData(['/api/auth/me'], newUser);
    setLocation("/");
  };

  const logout = () => {
    localStorage.removeItem("vigora_token");
    setIsAuthenticated(false);
    queryClient.clear();
    setLocation("/login");
  };

  const value = {
    user: user || null,
    isLoading: isAuthenticated && isUserLoading,
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
