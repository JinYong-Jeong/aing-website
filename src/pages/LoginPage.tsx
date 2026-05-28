import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Mail, ShieldCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import AnimatedSection from '../components/AnimatedSection';

const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const { user, authError, sendLoginLink } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = useMemo(() => (location.state as { from?: string })?.from || '/', [location.state]);

  useEffect(() => {
    if (user) navigate(from, { replace: true });
  }, [from, navigate, user]);

  useEffect(() => {
    if (authError) setError(authError);
  }, [authError]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSent(false);
    const redirectTo = `${window.location.origin}${from}`;
    const result = await sendLoginLink(email, redirectTo);
    if (result.ok) {
      setSent(true);
    } else {
      setError(result.error || '로그인 링크를 보낼 수 없습니다.');
    }
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
                  onChange={e => setEmail(e.target.value)}
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
                인증 링크를 보냈습니다. 메일함에서 링크를 열면 로그인됩니다.
              </p>
            )}
            <button type="submit" className="btn-primary w-full" disabled={loading}>
              {loading ? '전송 중...' : '인증 링크 받기'}
            </button>
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
