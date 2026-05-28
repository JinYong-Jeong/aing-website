import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import AnimatedSection from '../../components/AnimatedSection';

const AdminLoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { user, isAdmin, authError, sendLoginLink } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user && isAdmin) navigate('/admin', { replace: true });
  }, [isAdmin, navigate, user]);

  useEffect(() => {
    if (authError) setError(authError);
  }, [authError]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSent(false);
    const result = await sendLoginLink(email, `${window.location.origin}/admin`);
    if (result.ok) {
      setSent(true);
    } else {
      setError(result.error || '인증 링크를 보낼 수 없습니다.');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-aing-bg flex items-center justify-center px-6">
      <AnimatedSection>
        <div className="w-full max-w-sm">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-aing-blue-light border border-blue-200 mb-4">
              <Lock size={20} className="text-aing-blue" />
            </div>
            <h1 className="text-xl font-semibold text-aing-text">Admin Login</h1>
            <p className="text-aing-muted text-sm mt-1">운영 권한이 있는 부원 이메일로 인증합니다.</p>
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
                  placeholder="admin@gachon.ac.kr"
                  autoComplete="email"
                  required
                />
              </div>
            </div>
            {error && <p className="text-red-500 text-xs leading-relaxed">{error}</p>}
            {sent && <p className="text-green-600 text-xs">인증 링크를 보냈습니다. 메일함을 확인해주세요.</p>}
            <button type="submit" className="btn-primary w-full" disabled={loading}>
              {loading ? '전송 중...' : '인증 링크 받기'}
            </button>
          </form>
        </div>
      </AnimatedSection>
    </div>
  );
};

export default AdminLoginPage;
