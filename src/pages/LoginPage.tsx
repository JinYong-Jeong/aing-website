import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { KeyRound, Mail, ShieldCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import AnimatedSection from '../components/AnimatedSection';

const LOGIN_LINK_COOLDOWN_MS = 60_000;
const LAST_LOGIN_LINK_SENT_AT = 'aing_last_login_link_sent_at';
const GOOGLE_OAUTH_ENABLED =
  import.meta.env.VITE_ENABLE_GOOGLE_OAUTH === 'true' ||
  import.meta.env.REACT_APP_ENABLE_GOOGLE_OAUTH === 'true';

const safeRedirectPath = (value?: string | null) => {
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

const authErrorMessage = (code: string | null, description: string | null) => {
  if (code === 'otp_expired') {
    return '인증 링크가 만료됐거나 이미 사용된 링크입니다. 이메일을 다시 입력해서 새 인증 링크를 받아주세요.';
  }
  if (code === 'not_registered') {
    return '등록된 A.ing 부원 이메일이 아닙니다. 운영진에게 등록을 요청해주세요.';
  }
  if (code === 'school_email_required') {
    return '가천대학교 이메일로만 로그인할 수 있습니다.';
  }
  if (code === 'session_missing') {
    return '인증 세션을 확인하지 못했습니다. 새 인증 링크를 다시 요청해주세요.';
  }
  if (description) return decodeAuthDescription(description);
  return '이메일 인증에 실패했습니다. 새 인증 링크를 요청해주세요.';
};

const secondsUntilNextSend = () => {
  const lastSentAt = Number(localStorage.getItem(LAST_LOGIN_LINK_SENT_AT) || 0);
  const remaining = LOGIN_LINK_COOLDOWN_MS - (Date.now() - lastSentAt);
  return Math.max(0, Math.ceil(remaining / 1000));
};

const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [authCode, setAuthCode] = useState('');
  const [cooldownLeft, setCooldownLeft] = useState(0);
  const { user, authError, sendLoginLink, verifyLoginCode, signInWithGoogle } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = useMemo(() => safeRedirectPath((location.state as { from?: string })?.from), [location.state]);

  useEffect(() => {
    if (user) navigate(from, { replace: true });
  }, [from, navigate, user]);

  useEffect(() => {
    if (authError) setError(authError);
  }, [authError]);

  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const hashParams = new URLSearchParams(window.location.hash.replace(/^#/, ''));
    const errorCode = searchParams.get('error_code') || searchParams.get('error') || hashParams.get('error_code') || hashParams.get('error');
    const errorDescription = searchParams.get('error_description') || hashParams.get('error_description');
    const returnedEmail = searchParams.get('email') || hashParams.get('email');

    if (returnedEmail) setEmail(returnedEmail);
    if (!errorCode && !errorDescription) return;

    setError(authErrorMessage(errorCode, errorDescription));

    window.history.replaceState(null, document.title, window.location.pathname);
  }, [location.search]);

  useEffect(() => {
    const tick = () => setCooldownLeft(secondsUntilNextSend());
    tick();
    const timer = window.setInterval(tick, 1000);
    return () => window.clearInterval(timer);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const secondsLeft = secondsUntilNextSend();
    if (secondsLeft > 0) {
      setCooldownLeft(secondsLeft);
      setSent(false);
      setError(`메일 발송 제한을 피하려고 ${secondsLeft}초 뒤 다시 요청할 수 있습니다.`);
      return;
    }

    setLoading(true);
    setError('');
    setSent(false);
    const redirectTo = `/auth/callback?next=${encodeURIComponent(from)}`;
    const result = await sendLoginLink(email, redirectTo);
    if (result.ok) {
      localStorage.setItem(LAST_LOGIN_LINK_SENT_AT, String(Date.now()));
      setCooldownLeft(secondsUntilNextSend());
      setSent(true);
    } else {
      if (/메일 발송 제한/.test(result.error || '')) {
        localStorage.setItem(LAST_LOGIN_LINK_SENT_AT, String(Date.now()));
        setCooldownLeft(secondsUntilNextSend());
      }
      setError(result.error || '로그인 링크를 보낼 수 없습니다.');
    }
    setLoading(false);
  };

  const handleCodeVerify = async () => {
    setVerifying(true);
    setError('');
    const result = await verifyLoginCode(email, authCode);
    if (result.ok) {
      navigate(from, { replace: true });
    } else {
      setError(result.error || '인증 코드를 확인할 수 없습니다.');
    }
    setVerifying(false);
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    setError('');
    const redirectTo = `/auth/callback?next=${encodeURIComponent(from)}`;
    const result = await signInWithGoogle(redirectTo);
    if (!result.ok) setError(result.error || 'Google 로그인을 시작할 수 없습니다.');
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-aing-bg flex items-center justify-center px-6">
      <AnimatedSection>
        <div className="w-full max-w-sm">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-aing-blue-light border border-blue-200 mb-4">
              <ShieldCheck size={20} className="text-aing-blue" />
            </div>
            <h1 className="text-xl font-semibold text-aing-text">이메일 인증 로그인</h1>
            <p className="text-aing-muted text-sm mt-1">
              등록된 가천대학교 이메일로 인증 링크를 받아 로그인합니다.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="card space-y-4">
            <div>
              <label className="block text-xs text-aing-muted mb-2">학교 이메일</label>
              <div className="relative">
                <Mail size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-aing-muted" />
                <input
                  type="email"
                  value={email}
                  onChange={e => {
                    setEmail(e.target.value);
                    setSent(false);
                    setAuthCode('');
                  }}
                  className="input-field pl-9"
                  placeholder="name@gachon.ac.kr"
                  autoComplete="email"
                  required
                />
              </div>
            </div>
            {error && <p className="text-red-500 text-xs leading-relaxed">{error}</p>}
            {sent && (
              <p className="text-green-600 text-xs leading-relaxed">
                인증 메일을 보냈습니다. 메일 링크를 열거나 6자리 코드가 보이면 아래에 입력하세요.
              </p>
            )}
            {sent && (
              <div>
                <label className="block text-xs text-aing-muted mb-2">인증 코드</label>
                <div className="relative">
                  <KeyRound size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-aing-muted" />
                  <input
                    type="text"
                    value={authCode}
                    onChange={e => setAuthCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    className="input-field pl-9 tracking-[0.3em]"
                    placeholder="000000"
                    autoComplete="one-time-code"
                    inputMode="numeric"
                    maxLength={6}
                  />
                </div>
                <button
                  type="button"
                  onClick={handleCodeVerify}
                  className="btn-ghost w-full mt-2 text-sm"
                  disabled={verifying || authCode.length !== 6}
                >
                  {verifying ? '확인 중...' : '코드로 바로 로그인'}
                </button>
              </div>
            )}
            <button type="submit" className="btn-primary w-full" disabled={loading || cooldownLeft > 0}>
              {loading ? '전송 중...' : cooldownLeft > 0 ? `${cooldownLeft}초 후 재요청` : '인증 링크 받기'}
            </button>
            {GOOGLE_OAUTH_ENABLED && (
              <button
                type="button"
                onClick={handleGoogleLogin}
                className="btn-ghost w-full"
                disabled={loading}
              >
                Google로 빠르게 로그인
              </button>
            )}
            <p className="text-xs text-aing-muted text-center pt-1">
              등록된 A.ing 부원 이메일만 Members와 Team에 접근할 수 있습니다.
            </p>
          </form>
        </div>
      </AnimatedSection>
    </div>
  );
};

export default LoginPage;
