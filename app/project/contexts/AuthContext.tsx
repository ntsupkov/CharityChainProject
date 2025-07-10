'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, UserRole, AuthContextType } from '@/types';
import { mockUsers } from '@/lib/mock-data';

const AuthContext = createContext<AuthContextType | null>(null);

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

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      const parsedUser = JSON.parse(savedUser);
      if (parsedUser.createdAt) {
        parsedUser.createdAt = new Date(parsedUser.createdAt);
      }
      if (!parsedUser.walletAddress) {
        parsedUser.walletAddress = '0xFAKEWALLET' + parsedUser.id;
      }
      setUser(parsedUser);
    }
    setLoading(false);
  }, []);

  const BACKEND_URL = 'http://localhost:8001';

  const login = async (email: string, password: string) => {
    const res = await fetch(`${BACKEND_URL}/auth/signin`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    if (!res.ok) {
      const data = await res.json();
      throw new Error(data.detail || 'Ошибка входа');
    }
    const user = await res.json();
    if (!user.walletAddress) {
      user.walletAddress = '0xFAKEWALLET' + user.id;
    }
    setUser(user);
    localStorage.setItem('user', JSON.stringify(user));
  };

  const register = async (name: string, email: string, password: string, role: UserRole) => {
    const res = await fetch(`${BACKEND_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password, role })
    });
    if (!res.ok) {
      const data = await res.json();
      throw new Error(data.detail || 'Ошибка регистрации');
    }
    const user = await res.json();
    if (!user.walletAddress) {
      user.walletAddress = '0xFAKEWALLET' + user.id;
    }
    setUser(user);
    localStorage.setItem('user', JSON.stringify(user));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
  };

  const connectWallet = async () => {
    if (typeof window !== 'undefined' && window.ethereum) {
      try {
        const accounts = await window.ethereum.request({
          method: 'eth_requestAccounts',
        });
        if (user && accounts[0]) {
          const updatedUser = { ...user, walletAddress: accounts[0] };
          setUser(updatedUser);
          localStorage.setItem('user', JSON.stringify(updatedUser));
        }
      } catch (error) {
        console.error('Ошибка подключения кошелька:', error);
        throw new Error('Не удалось подключить кошелёк');
      }
    } else {
      throw new Error('MetaMask не установлен');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-amber-50 to-stone-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-500"></div>
      </div>
    );
  }

  return (
    <AuthContext.Provider value={{ user, login, register, logout, connectWallet }}>
      {children}
    </AuthContext.Provider>
  );
};