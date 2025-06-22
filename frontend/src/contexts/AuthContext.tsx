import React, { createContext, useContext, useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { setUser, clearUser } from '@/store/slices/userSlice';
import { useLoginMutation, useGetCurrentUserQuery } from '@/services/api';
import { User } from '@/types';

interface AuthContextType {
  isAuthenticated: boolean;
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  loading: boolean;
  error: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUserState] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [loginMutation] = useLoginMutation();
  const { data: currentUser, isLoading: isLoadingUser } = useGetCurrentUserQuery(undefined, {
    skip: !localStorage.getItem('token'),
  });

  useEffect(() => {
    if (currentUser) {
      setUserState(currentUser);
      setIsAuthenticated(true);
      dispatch(setUser(currentUser));
    }
    setLoading(isLoadingUser);
  }, [currentUser, isLoadingUser, dispatch]);

  const login = async (email: string, password: string) => {
    try {
      const response = await loginMutation({ email, password }).unwrap();
      localStorage.setItem('token', response.access);
      setUserState(response.user);
      setIsAuthenticated(true);
      dispatch(setUser(response.user));
      navigate('/');
    } catch (err) {
      setError('Неверный email или пароль');
      throw err;
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    dispatch(clearUser());
    setUserState(null);
    setIsAuthenticated(false);
    navigate('/login');
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, login, logout, loading, error }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}; 