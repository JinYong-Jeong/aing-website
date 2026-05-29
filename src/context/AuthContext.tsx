import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
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
  verifyLoginCode: (email: string, token: string) => Promise<{ ok: boolean; error?: string }>;
  signInWithGoogle: (redirectTo?: string) => Promise<{ ok: boolean; error?: string }>;
  refreshUser: () => Promise<AuthUser | null>;
  logout: () => Promise<void>;
}

const SCHOOL_DOMAIN = 'gachon.ac.kr';
const DEFAULT_AUTH_REDIRECT_ORIGIN = 'https://aing-website.vercel.app';
const LOCAL_HOSTS = new Set(['localhost', '127.0.0.1', '0.0.0.0']);
const AUTH_REQUEST_TIMEOUT_MS = 15_000;
const MEMBER_PREFLIGHT_TIMEOUT_MS = 5_000;

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  authError: null,
  isAdmin: false,
  sendLoginLink: async () => ({ ok: false, error: '인증 초기화 중입니다.' }),
  verifyLoginCode: async () => ({ ok: false, error: '인증 초기화 중입니다.' }),
  signInWithGoogle: async () => ({ ok: false, error: '인증 초기화 중입니다.' }),
  refreshUser: async () => null,
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

const trimTrailingSlash = (value: string) => value.replace(/\/+$/, '');

const configuredAuthOrigin = () => {
  const configured =
    import.meta.env.VITE_AUTH_REDIRECT_ORIGIN ||
    import.meta.env.REACT_APP_AUTH_REDIRECT_ORIGIN ||
    '';

  if (!configured) return null;

  try {
    const url = new URL(configured);
    return trimTrailingSlash(url.origin);
  } catch {
    return null;
  }
};

const authRedirectOrigin = () => {
  const configured = configuredAuthOrigin();
  if (configured) return configured;

  if (typeof window === 'undefined') return DEFAULT_AUTH_REDIRECT_ORIGIN;

  const current = new URL(window.location.origin);
  if (LOCAL_HOSTS.has(current.hostname)) return DEFAULT_AUTH_REDIRECT_ORIGIN;
  if (current.protocol !== 'https:') return DEFAULT_AUTH_REDIRECT_ORIGIN;
  return trimTrailingSlash(current.origin);
};

const sanitizeRedirectPath = (redirectTo?: string) => {
  if (!redirectTo) return '/';

  try {
    const currentOrigin = typeof window === 'undefined' ? DEFAULT_AUTH_REDIRECT_ORIGIN : window.location.origin;
    const parsed = new URL(redirectTo, currentOrigin);
    const targetOrigin = authRedirectOrigin();

    if (parsed.origin === currentOrigin || parsed.origin === targetOrigin || LOCAL_HOSTS.has(parsed.hostname)) {
      return `${parsed.pathname}${parsed.search}`;
    }
  } catch {
    if (redirectTo.startsWith('/')) return redirectTo;
  }

  return '/';
};

const resolveEmailRedirectTo = (redirectTo?: string) => {
  const path = sanitizeRedirectPath(redirectTo);
  return `${authRedirectOrigin()}${path.startsWith('/') ? path : `/${path}`}`;
};

const authFailureLoginUrl = (code: string, email?: string) => {
  const params = new URLSearchParams({ error: code });
  if (email) params.set('email', email);
  return `/login?${params.toString()}`;
};

const isRateLimitError = (message: string) =>
  /rate limit|rate_limit|too many|email rate/i.test(message);

const getErrorMessage = (error: unknown) => {
  if (error instanceof Error) return error.message;
  if (typeof error === 'string') return error;
  return '요청 처리 중 오류가 발생했습니다.';
};

const withTimeout = async <T,>(promise: PromiseLike<T>, timeoutMs: number, message: string): Promise<T> => {
  let timer: ReturnType<typeof setTimeout> | undefined;
  try {
    return await Promise.race([
      Promise.resolve(promise),
      new Promise<T>((_, reject) => {
        timer = setTimeout(() => reject(new Error(message)), timeoutMs);
      }),
    ]);
  } finally {
    if (timer) clearTimeout(timer);
  }
};

const validateLoginEmail = async (rawEmail: string) => {
  const email = normalizeEmail(rawEmail);
  if (!email) return { email, error: '이메일을 입력해주세요.' };
  if (!isSupabaseConfigured) {
    return { email, error: 'Supabase 환경변수가 설정되지 않아 이메일 인증을 사용할 수 없습니다.' };
  }
  if (!isSchoolEmail(email)) {
    return { email, error: '가천대학교 이메일만 사용할 수 있습니다.' };
  }

  try {
    const { data, error } = await withTimeout(
      supabase.rpc('is_registered_member_email', { input_email: email }),
      MEMBER_PREFLIGHT_TIMEOUT_MS,
      '등록 이메일 확인이 지연되고 있습니다.'
    );
    if (!error && data === false) {
      return { email, error: '등록된 A.ing 부원 이메일이 아닙니다. 운영진에게 먼저 등록을 요청해주세요.' };
    }
  } catch {
    // Older schemas may not have the preflight RPC yet. Auth callback still enforces membership.
  }

  return { email };
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState<string | null>(null);

  const loadMemberForSession = useCallback(async (session: Session | null): Promise<AuthUser | null> => {
    const email = normalizeEmail(session?.user?.email || '');
    if (!session || !email) {
      setUser(null);
      setAuthError(null);
      return null;
    }

    if (!isSchoolEmail(email)) {
      await supabase.auth.signOut();
      setUser(null);
      setAuthError('가천대학교 이메일로만 로그인할 수 있습니다.');
      if (typeof window !== 'undefined' && window.location.pathname !== '/login') {
        window.location.replace(authFailureLoginUrl('school_email_required', email));
      }
      return null;
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
          const nextUser: AuthUser = {
            id: session.user.id,
            email,
            name: member.name,
            role: roleFromMember(member),
            member_id: member.id,
          };
          setUser(nextUser);
          setAuthError(null);
          return nextUser;
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
      if (typeof window !== 'undefined' && window.location.pathname !== '/login') {
        window.location.replace(authFailureLoginUrl('not_registered', email));
      }
      return null;
    }

    const nextUser: AuthUser = {
      id: session.user.id,
      email,
      name: member.name,
      role: roleFromMember(member),
      member_id: member.id,
    };
    setUser(nextUser);
    setAuthError(null);
    return nextUser;
  }, []);

  const refreshUser = useCallback(async () => {
    if (!isSupabaseConfigured) {
      setUser(null);
      setAuthError(null);
      setLoading(false);
      return null;
    }

    setLoading(true);
    try {
      const { data } = await withTimeout(
        supabase.auth.getSession(),
        AUTH_REQUEST_TIMEOUT_MS,
        '로그인 세션 확인이 지연되고 있습니다. 잠시 후 다시 시도해주세요.'
      );
      return await loadMemberForSession(data.session);
    } catch (error) {
      setAuthError(getErrorMessage(error));
      return null;
    } finally {
      setLoading(false);
    }
  }, [loadMemberForSession]);

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

    withTimeout(
      supabase.auth.getSession(),
      AUTH_REQUEST_TIMEOUT_MS,
      '로그인 세션 확인이 지연되고 있습니다.'
    ).then(async ({ data }) => {
      if (!mounted) return;
      await loadMemberForSession(data.session);
      setLoading(false);
    }).catch(error => {
      if (!mounted) return;
      setAuthError(getErrorMessage(error));
      setLoading(false);
    });

    const { data: listener } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (!mounted) return;
      setLoading(true);
      try {
        await loadMemberForSession(session);
      } catch (error) {
        setAuthError(getErrorMessage(error));
      } finally {
        setLoading(false);
      }
    });

    return () => {
      mounted = false;
      listener.subscription.unsubscribe();
    };
  }, [loadMemberForSession]);

  const sendLoginLink = async (rawEmail: string, redirectTo?: string) => {
    const { email, error: validationError } = await validateLoginEmail(rawEmail);
    if (validationError) return { ok: false, error: validationError };

    try {
      const { error } = await withTimeout(
        supabase.auth.signInWithOtp({
          email,
          options: {
            emailRedirectTo: resolveEmailRedirectTo(redirectTo),
            shouldCreateUser: true,
          },
        }),
        AUTH_REQUEST_TIMEOUT_MS,
        '인증 메일 전송 응답이 지연되고 있습니다. 네트워크를 확인하고 다시 시도해주세요.'
      );

      if (error) {
        if (isRateLimitError(error.message)) {
          return { ok: false, error: '메일 발송 제한에 걸렸습니다. 잠시 뒤 새 인증 링크를 다시 요청해주세요.' };
        }
        return { ok: false, error: error.message };
      }
    } catch (error) {
      const message = getErrorMessage(error);
      if (isRateLimitError(message)) {
        return { ok: false, error: '메일 발송 제한에 걸렸습니다. 잠시 뒤 새 인증 링크를 다시 요청해주세요.' };
      }
      return { ok: false, error: message };
    }

    return { ok: true };
  };

  const verifyLoginCode = async (rawEmail: string, rawToken: string) => {
    const { email, error: validationError } = await validateLoginEmail(rawEmail);
    if (validationError) return { ok: false, error: validationError };

    const token = rawToken.replace(/\s+/g, '');
    if (!/^\d{6}$/.test(token)) {
      return { ok: false, error: '6자리 인증 코드를 입력해주세요.' };
    }

    setLoading(true);
    try {
      const { data, error } = await withTimeout(
        supabase.auth.verifyOtp({
          email,
          token,
          type: 'email',
        }),
        AUTH_REQUEST_TIMEOUT_MS,
        '인증 코드 확인 응답이 지연되고 있습니다. 네트워크를 확인하고 다시 시도해주세요.'
      );

      if (error) {
        if (isRateLimitError(error.message)) {
          return { ok: false, error: '인증 시도 제한에 걸렸습니다. 잠시 뒤 다시 시도해주세요.' };
        }
        return { ok: false, error: error.message };
      }

      const nextUser = await loadMemberForSession(data.session);
      if (!nextUser) {
        return { ok: false, error: '인증은 완료됐지만 등록된 부원 정보를 확인하지 못했습니다.' };
      }
      return { ok: true };
    } catch (error) {
      const message = getErrorMessage(error);
      if (isRateLimitError(message)) {
        return { ok: false, error: '인증 시도 제한에 걸렸습니다. 잠시 뒤 다시 시도해주세요.' };
      }
      return { ok: false, error: message };
    } finally {
      setLoading(false);
    }
  };

  const signInWithGoogle = async (redirectTo?: string) => {
    if (!isSupabaseConfigured) {
      return { ok: false, error: 'Supabase 환경변수가 설정되지 않아 Google 로그인을 사용할 수 없습니다.' };
    }

    try {
      const { error } = await withTimeout(
        supabase.auth.signInWithOAuth({
          provider: 'google',
          options: {
            redirectTo: resolveEmailRedirectTo(redirectTo),
            queryParams: {
              hd: SCHOOL_DOMAIN,
              prompt: 'select_account',
            },
          },
        }),
        AUTH_REQUEST_TIMEOUT_MS,
        'Google 로그인 시작 응답이 지연되고 있습니다. 네트워크를 확인하고 다시 시도해주세요.'
      );

      if (error) return { ok: false, error: error.message };
      return { ok: true };
    } catch (error) {
      return { ok: false, error: getErrorMessage(error) };
    }
  };

  const logout = async () => {
    if (isSupabaseConfigured) {
      try {
        await withTimeout(
          supabase.auth.signOut(),
          AUTH_REQUEST_TIMEOUT_MS,
          '로그아웃 응답이 지연되고 있습니다.'
        );
      } catch {
        // Clear local app state even when the remote sign-out call stalls.
      }
    }
    setUser(null);
    setAuthError(null);
    sessionStorage.removeItem('aing_admin');
  };

  const isAdmin = useMemo(() => user?.role === 'admin' || user?.role === 'ops', [user]);

  return (
    <AuthContext.Provider value={{ user, loading, authError, isAdmin, sendLoginLink, verifyLoginCode, signInWithGoogle, refreshUser, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
