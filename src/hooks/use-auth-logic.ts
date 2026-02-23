import { useState, useCallback } from 'react';
import { toast } from 'sonner';
import { User } from '@/types/project';

export function useAuthLogic() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [authLoading, setAuthLoading] = useState(false);
  const [authForm, setAuthForm] = useState({
    nome: '',
    email: '',
    password: '',
    role: 'user',
    tipoOrganizacao: 'aldeia'
  });

  const checkAuth = useCallback(() => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    const userData = typeof window !== 'undefined' ? localStorage.getItem('user') : null;
    if (token && userData) {
      setUser(JSON.parse(userData));
    }
    setLoading(false);
  }, []);

  const handleLogout = useCallback(() => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    toast.success('Sessão terminada');
    setAuthForm({ nome: '', email: '', password: '', role: 'user', tipoOrganizacao: 'aldeia' });
  }, []);

  return {
    user,
    setUser,
    loading,
    setLoading,
    authModalOpen,
    setAuthModalOpen,
    authMode,
    setAuthMode,
    authLoading,
    setAuthLoading,
    authForm,
    setAuthForm,
    checkAuth,
    handleLogout
  };
}
