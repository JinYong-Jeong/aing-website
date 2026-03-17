import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Send } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import AnimatedSection from '../components/AnimatedSection';

type Category = 'activity' | 'study' | 'project' | 'notice';

const CATEGORIES: { value: Category; label: string }[] = [
  { value: 'activity', label: 'Activity' },
  { value: 'study', label: 'Study' },
  { value: 'project', label: 'Project' },
];

const ADMIN_CATEGORIES: { value: Category; label: string }[] = [
  ...CATEGORIES,
  { value: 'notice', label: 'Notice (공지)' },
];

const NewPostPage: React.FC = () => {
  const navigate = useNavigate();
  const { isAdmin } = useAuth();

  const [form, setForm] = useState({
    title: '',
    content: '',
    category: 'activity' as Category,
    tags: '',
  });
  const [authorName, setAuthorName] = useState('');
  const [password, setPassword] = useState('');
  const [authError, setAuthError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title || !form.content) return;
    setSubmitting(true);
    setAuthError('');

    try {
      // 어드민은 바로 작성
      if (!isAdmin) {
        if (!authorName.trim() || !password.trim()) {
          setAuthError('이름과 비밀번호를 입력해주세요.');
          setSubmitting(false);
          return;
        }

        // users 테이블에서 확인
        const { data: userData } = await supabase
          .from('users')
          .select('id, name, role')
          .eq('name', authorName.trim())
          .eq('password_hash', password.trim())
          .single();

        // users 테이블에 없으면 members 테이블에서 확인
        if (!userData) {
          const { data: memberData } = await supabase
            .from('members')
            .select('id, name, password_hash')
            .ilike('name', authorName.trim())
            .single();

          if (!memberData) {
            setAuthError('등록되지 않은 사용자입니다.');
            setSubmitting(false);
            return;
          }
          if (memberData.password_hash && memberData.password_hash !== password.trim()) {
            setAuthError('비밀번호가 틀렸습니다.');
            setSubmitting(false);
            return;
          }
        }
      }

      const { error } = await supabase.from('posts').insert({
        title: form.title,
        content: form.content,
        category: form.category,
        tags: form.tags.split(',').map((t: string) => t.trim()).filter(Boolean),
        is_pinned: false,
        author_id: null,
        author_name: isAdmin ? 'admin' : authorName.trim(),
        views: 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });

      if (error) throw error;
      navigate('/board');
    } catch (err: any) {
      setAuthError('게시글 작성 실패: ' + (err.message || '다시 시도해주세요.'));
    }
    setSubmitting(false);
  };

  const availableCategories = isAdmin ? ADMIN_CATEGORIES : CATEGORIES;

  return (
    <div className="min-h-screen bg-aing-bg pt-20">
      <div className="max-w-2xl mx-auto px-6 py-12">
        <Link
          to="/board"
          className="flex items-center gap-2 text-aing-muted hover:text-aing-text text-sm mb-8 transition-colors"
        >
          <ArrowLeft size={14} />
          Community
        </Link>

        <AnimatedSection>
          <h1 className="text-2xl font-semibold text-aing-text mb-8">새 글 작성</h1>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="card space-y-5">
              {/* 제목 */}
              <div>
                <label className="block text-xs text-aing-muted mb-2">제목 *</label>
                <input
                  type="text"
                  value={form.title}
                  onChange={e => setForm(p => ({ ...p, title: e.target.value }))}
                  className="input-field"
                  placeholder="제목을 입력하세요"
                  required
                />
              </div>

              {/* 카테고리 */}
              <div>
                <label className="block text-xs text-aing-muted mb-2">카테고리</label>
                <div className="flex flex-wrap gap-2">
                  {availableCategories.map(cat => (
                    <button
                      key={cat.value}
                      type="button"
                      onClick={() => setForm(p => ({ ...p, category: cat.value }))}
                      className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                        form.category === cat.value
                          ? 'bg-aing-dark text-white'
                          : 'border border-aing-border text-aing-muted hover:text-aing-text'
                      }`}
                    >
                      {cat.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* 태그 */}
              <div>
                <label className="block text-xs text-aing-muted mb-2">태그 (쉼표로 구분)</label>
                <input
                  type="text"
                  value={form.tags}
                  onChange={e => setForm(p => ({ ...p, tags: e.target.value }))}
                  className="input-field"
                  placeholder="PyTorch, CV, NLP"
                />
              </div>

              {/* 내용 */}
              <div>
                <label className="block text-xs text-aing-muted mb-2">내용 *</label>
                <textarea
                  value={form.content}
                  onChange={e => setForm(p => ({ ...p, content: e.target.value }))}
                  className="input-field resize-none"
                  rows={12}
                  placeholder="내용을 입력하세요..."
                  required
                />
              </div>
            </div>

            {/* 작성자 인증 (비어드민) */}
            {!isAdmin && (
              <div className="card space-y-4">
                <h3 className="text-sm font-semibold text-aing-text">작성자 확인</h3>
                <div className="grid sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs text-aing-muted mb-2">이름 *</label>
                    <input
                      type="text"
                      value={authorName}
                      onChange={e => setAuthorName(e.target.value)}
                      className="input-field"
                      placeholder="등록된 이름"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-aing-muted mb-2">비밀번호 *</label>
                    <input
                      type="password"
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      className="input-field"
                      placeholder="••••••"
                      required
                    />
                  </div>
                </div>
                {authError && (
                  <p className="text-red-500 text-xs">{authError}</p>
                )}
                <p className="text-xs text-aing-muted">
                  A.ing 멤버로 등록된 이름과 비밀번호를 입력하세요.
                </p>
              </div>
            )}

            {isAdmin && authError && (
              <p className="text-red-500 text-xs">{authError}</p>
            )}

            <div className="flex gap-3">
              <button
                type="submit"
                disabled={submitting}
                className="btn-primary flex items-center gap-2 disabled:opacity-50"
              >
                {submitting ? '게시 중...' : (
                  <>게시하기 <Send size={14} /></>
                )}
              </button>
              <Link to="/board" className="btn-ghost">
                취소
              </Link>
            </div>
          </form>
        </AnimatedSection>
      </div>
    </div>
  );
};

export default NewPostPage;
