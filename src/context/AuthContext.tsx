import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

interface AuthUser {
  id: string;
  name: string;
  role: 'admin' | 'member' | 'ob';
  member_id: string | null;
}

interface AuthContextType {
  user: AuthUser | null;
  isAdmin: boolean;
  login: (name: string, password: string) => Promise<boolean>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  isAdmin: false,
  login: async () => false,
  logout: () => {},
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);

  useEffect(() => {
    const saved = sessionStorage.getItem('aing_user');
    if (saved) {
      try {
        setUser(JSON.parse(saved));
      } catch {
        sessionStorage.removeItem('aing_user');
      }
    }
  }, []);

  const login = async (name: string, password: string): Promise<boolean> => {
    // Try users table first
    try {
      const { data } = await supabase
        .from('users')
        .select('*')
        .eq('name', name)
        .eq('password_hash', password)
        .single();

      if (data) {
        const authUser: AuthUser = {
          id: data.id,
          name: data.name,
          role: data.role as 'admin' | 'member' | 'ob',
          member_id: data.member_id,
        };
        setUser(authUser);
        sessionStorage.setItem('aing_user', JSON.stringify(authUser));
        return true;
      }
    } catch {
      // users table may not exist yet, fall through
    }

    // Fallback: hardcoded admin
    if (name === 'admin' && password === '2026') {
      const adminUser: AuthUser = { id: 'admin', name: 'admin', role: 'admin', member_id: null };
      setUser(adminUser);
      sessionStorage.setItem('aing_user', JSON.stringify(adminUser));
      return true;
    }

    // Fallback: check members table by name + password_hash
    try {
      const { data: memberData } = await supabase
        .from('members')
        .select('id, name, password_hash')
        .ilike('name', name.trim())
        .single();

      if (memberData && memberData.password_hash === password) {
        const memberUser: AuthUser = {
          id: memberData.id,
          name: memberData.name,
          role: 'member',
          member_id: memberData.id,
        };
        setUser(memberUser);
        sessionStorage.setItem('aing_user', JSON.stringify(memberUser));
        return true;
      }
    } catch {
      // ignore
    }

    return false;
  };

  const logout = () => {
    setUser(null);
    sessionStorage.removeItem('aing_user');
    // Also clear legacy key
    sessionStorage.removeItem('aing_admin');
  };

  return (
    <AuthContext.Provider value={{ user, isAdmin: user?.role === 'admin', login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
