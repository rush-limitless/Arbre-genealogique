import React from 'react';
import { authService, type AuthUser } from '../services/api';

interface AuthContextValue {
  user: AuthUser | null;
  loading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<boolean>;
  register: (email: string, password: string, name: string) => Promise<boolean>;
  logout: () => void;
  clearError: () => void;
}

const AuthContext = React.createContext<AuthContextValue | null>(null);

const getErrorMessage = (error: unknown) => {
  return error instanceof Error ? error.message : 'Une erreur est survenue.';
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = React.useState<AuthUser | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    const token = window.localStorage.getItem('token');
    if (!token) {
      setLoading(false);
      return;
    }

    authService
      .getCurrentUser()
      .then((currentUser) => {
        setUser(currentUser);
        setError(null);
      })
      .catch((requestError) => {
        window.localStorage.removeItem('token');
        setUser(null);
        setError(getErrorMessage(requestError));
      })
      .finally(() => setLoading(false));
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const session = await authService.login(email, password);
      window.localStorage.setItem('token', session.token);
      setUser(session.user);
      setError(null);
      return true;
    } catch (requestError) {
      setError(getErrorMessage(requestError));
      return false;
    }
  };

  const register = async (email: string, password: string, name: string) => {
    try {
      const session = await authService.register(email, password, name);
      window.localStorage.setItem('token', session.token);
      setUser(session.user);
      setError(null);
      return true;
    } catch (requestError) {
      setError(getErrorMessage(requestError));
      return false;
    }
  };

  const logout = () => {
    window.localStorage.removeItem('token');
    setUser(null);
    setError(null);
  };

  const clearError = () => setError(null);

  return (
    <AuthContext.Provider value={{ user, loading, error, login, register, logout, clearError }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = React.useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used inside AuthProvider');
  }
  return context;
};
