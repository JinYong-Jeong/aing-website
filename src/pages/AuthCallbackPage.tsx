import React, { useEffect, useMemo, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { AlertCircle, Loader2, ShieldCheck } from 'lucide-react';
import AnimatedSection from '../components/AnimatedSection';
import { useAuth } from '../context/AuthContext';
import { isSupabaseConfigured, supabase } from '../lib/supabase';

const SESSION_RETRY_DELAYS_MS = [0, 120, 240, 480, 800];

const safeRedirectPath = (value: string | null) => {
  if (!value || !value.startsWith('/') || value.startsWith('//')) return '/';
  return value;
};

const decodeAuthDescription = (value: string) => {
  try {
    return decodeURIComponent(value.replace(/\+/g, ' '));
  } catch {
    return value.replace(/\+/g, ' ');
  }
};

const callbackErrorMessage = (code: string | null, description: string | null) => {
  if (code === 'otp_expired') {
    return '인증 링크가 만료됐거나 이미 사용된 링크입니다. 새 인증 링크를 다시 요청해주세요.';
  }
  if (code === 'access_denied') {
    return description ? decodeAuthDescription(description) : '인증 링크를 사용할 수 없습니다. 새 링크를 요청해주세요.';
  }
  if (description) return decodeAuthDescription(description);
  return '인증 세션을 확인하지 못했습니다. 새 인증 링크를 다시 요청해주세요.';
};

const readCallbackError = (search: string) => {
  const searchParams = new URLSearchParams(search);
  const hashParams = new URLSearchParams(window.location.hash.replace(/^#/, ''));
  const code = hashParams.get('error_code') || hashParams.get('error') || searchParams.get('error_code') || searchParams.get('error');
  const description = hashParams.get('error_description') || searchParams.get('error_description');
  return { code, description };
};

const AuthCallbackPage: React.FC = () => {
  const [error, setError] = useState('');
  const { user, authError, refreshUser } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const next = useMemo(() => {
    const params = new URLSearchParams(location.search);
    return safeRedirectPath(params.get('next'));
  }, [location.search]);

  useEffect(() => {
    if (user) navigate(next, { replace: true });
  }, [navigate, next, user]);

  useEffect(() => {
    let cancelled = false;

    const waitForAuthSession = async () => {
      for (const delay of SESSION_RETRY_DELAYS_MS) {
        if (delay > 0) {
          await new Promise(resolve => window.setTimeout(resolve, delay));
        }
        const { data } = await supabase.auth.getSession();
        if (data.session) return true;
      }
      return false;
    };

    const verifySession = async () => {
      const { code, description } = readCallbackError(location.search);
      if (code || description) {
        if (!cancelled) setError(callbackErrorMessage(code, description));
        window.history.replaceState(null, document.title, `${window.location.pathname}${location.search}`);
        return;
      }

      if (!isSupabaseConfigured) {
        if (!cancelled) setError('Supabase 환경변수가 설정되지 않아 인증을 확인할 수 없습니다.');
        return;
      }

      const hasSession = await waitForAuthSession();
      if (cancelled) return;
      if (hasSession) {
        const nextUser = await refreshUser();
        if (cancelled || nextUser) {
          if (nextUser) navigate(next, { replace: true });
          return;
        }
      } else {
        const nextUser = await refreshUser();
        if (cancelled || nextUser) {
          if (nextUser) navigate(next, { replace: true });
          return;
        }
      }

      const retryUser = await refreshUser();
      if (cancelled) return;
      if (retryUser) {
        navigate(next, { replace: true });
        return;
      }

      if (!cancelled) {
        setError(authError || '인증 세션을 확인하지 못했습니다. 새 인증 링크를 다시 요청해주세요.');
      }
    };

    verifySession();

    return () => {
      cancelled = true;
    };
  }, [authError, location.search, navigate, next, refreshUser]);

  return (
    <div className="min-h-screen bg-aing-bg flex items-center justify-center px-6">
      <AnimatedSection>
        <div className="card w-full max-w-sm text-center">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-aing-blue-light border border-blue-200 mb-4">
            {error ? (
              <AlertCircle size={20} className="text-red-500" />
            ) : (
              <ShieldCheck size={20} className="text-aing-blue" />
            )}
          </div>
          <h1 className="text-xl font-semibold text-aing-text mb-2">
            {error ? '인증을 완료하지 못했습니다' : '인증을 확인하는 중입니다'}
          </h1>
          <p className="text-sm text-aing-muted leading-relaxed">
            {error || '메일 인증 결과와 등록된 부원 정보를 확인하고 있습니다.'}
          </p>
          {!error && (
            <Loader2 size={18} className="animate-spin text-aing-blue mx-auto mt-5" />
          )}
          {error && (
            <Link to="/login" className="btn-primary inline-flex mt-6 text-sm">
              새 인증 링크 받기
            </Link>
          )}
        </div>
      </AnimatedSection>
    </div>
  );
};

export default AuthCallbackPage;
