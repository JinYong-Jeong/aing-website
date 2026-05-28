import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { Session } from '@supabase/supabase-js';
import { isSupabaseConfigured, supabase } from '../lib/supabase';

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'ops' | 'member' | 'ob';
  member_id: string;
}

interface AuthContextType {
  user: AuthUser | null;
  loading: boolean;
  authError: string | null;
  isAdmin: boolean;
  sendLoginLink: (email: string, redirectTo?: string) => Promise<{ ok: boolean; error?: string }>;
  refreshUser: () => Promise<void>;
  logout: () => Promise<void>;
}

const SCHOOL_DOMAIN = 'gachon.ac.kr';

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  authError: null,
  isAdmin: false,
  sendLoginLink: async () => ({ ok: false, error: '인증 초기화 중입니다.' }),
  refreshUser: async () => {},
  logout: async () => {},
});

const normalizeEmail = (email: string) => email.trim().toLowerCase();

const isSchoolEmail = (email: string) => {
  const domain = normalizeEmail(email).split('@')[1] || '';
  return domain === SCHOOL_DOMAIN || domain.endsWith(`.${SCHOOL_DOMAIN}`);
};

const roleFromMember = (member: { track?: string; role?: string }): AuthUser['role'] => {
  if (member.track === 'admin') return 'admin';
  if (member.track === 'ob') return 'ob';
  if (/ops|운영|회장|부회장|lead/i.test(member.role || '')) return 'ops';
  return 'member';
};

const readRpcMember = (value: unknown) => {
  if (Array.isArray(value)) return value[0] || null;
  return value && typeof value === 'object' ? value : null;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState<string | null>(null);

  const loadMemberForSession = async (session: Session | null) => {
    const email = normalizeEmail(session?.user?.email || '');
    if (!session || !email) {
      setUser(null);
      setAuthError(null);
      return;
    }

    if (!isSchoolEmail(email)) {
      await supabase.auth.signOut();
      setUser(null);
      setAuthError('가천대학교 이메일로만 로그인할 수 있습니다.');
      return;
    }

    try {
      const { data: rpcData, error: rpcError } = await supabase.rpc('get_current_member');
      if (!rpcError) {
        const member = readRpcMember(rpcData) as {
          id: string;
          name: string;
          role?: string;
          track?: string;
          email?: string;
          contact_email?: string;
          is_active?: boolean;
        } | null;

        if (member?.id && member.is_active !== false) {
          setUser({
            id: session.user.id,
            email,
            name: member.name,
            role: roleFromMember(member),
            member_id: member.id,
          });
          setAuthError(null);
          return;
        }
      }
    } catch {
      // Older deployments may not have the RPC yet. Fall back to direct selects.
    }

    const memberSelect = 'id,name,role,track,email,contact_email,is_active';
    const fallbackSelect = 'id,name,role,track,contact_email,is_active';
    let member: any = null;

    try {
      const { data, error } = await supabase
        .from('members')
        .select(memberSelect)
        .eq('email', email)
        .eq('is_active', true)
        .maybeSingle();
      if (!error && data) member = data;
    } catch {}

    if (!member) {
      try {
        const { data, error } = await supabase
          .from('members')
          .select(memberSelect)
          .eq('contact_email', email)
          .eq('is_active', true)
          .maybeSingle();
        if (!error && data) member = data;
      } catch {}
    }

    if (!member) {
      try {
        const { data, error } = await supabase
          .from('members')
          .select(fallbackSelect)
          .eq('contact_email', email)
          .eq('is_active', true)
          .maybeSingle();
        if (!error && data) member = data;
      } catch {}
    }

    if (!member) {
      await supabase.auth.signOut();
      setUser(null);
      setAuthError('등록된 A.ing 부원 이메일이 아닙니다. 운영진에게 등록을 요청해주세요.');
      return;
    }

    setUser({
      id: session.user.id,
      email,
      name: member.name,
      role: roleFromMember(member),
      member_id: member.id,
    });
    setAuthError(null);
  };

  const refreshUser = async () => {
    if (!isSupabaseConfigured) {
      setUser(null);
      setAuthError(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    const { data } = await supabase.auth.getSession();
    await loadMemberForSession(data.session);
    setLoading(false);
  };

  useEffect(() => {
    let mounted = true;

    if (!isSupabaseConfigured) {
      setUser(null);
      setAuthError(null);
      setLoading(false);
      return () => {
        mounted = false;
      };
    }

    supabase.auth.getSession().then(async ({ data }) => {
      if (!mounted) return;
      await loadMemberForSession(data.session);
      setLoading(false);
    });

    const { data: listener } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (!mounted) return;
      setLoading(true);
      await loadMemberForSession(session);
      setLoading(false);
    });

    return () => {
      mounted = false;
      listener.subscription.unsubscribe();
    };
  }, []);

  const sendLoginLink = async (rawEmail: string, redirectTo?: string) => {
    const email = normalizeEmail(rawEmail);
    if (!email) return { ok: false, error: '이메일을 입력해주세요.' };
    if (!isSupabaseConfigured) {
      return { ok: false, error: 'Supabase 환경변수가 설정되지 않아 이메일 인증을 보낼 수 없습니다.' };
    }
    if (!isSchoolEmail(email)) {
      return { ok: false, error: '가천대학교 이메일만 사용할 수 있습니다.' };
    }

    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: redirectTo || window.location.origin,
        shouldCreateUser: true,
      },
    });

    if (error) return { ok: false, error: error.message };
    return { ok: true };
  };

  const logout = async () => {
    if (isSupabaseConfigured) {
      await supabase.auth.signOut();
    }
    setUser(null);
    setAuthError(null);
    sessionStorage.removeItem('aing_admin');
  };

  const isAdmin = useMemo(() => user?.role === 'admin' || user?.role === 'ops', [user]);

  return (
    <AuthContext.Provider value={{ user, loading, authError, isAdmin, sendLoginLink, refreshUser, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
