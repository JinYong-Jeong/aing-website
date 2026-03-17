import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Users, Plus, X, Trash2, MessageCircle, Mail, Calendar } from 'lucide-react';
import { supabase, Member, TeamPost } from '../lib/supabase';
import AnimatedSection from '../components/AnimatedSection';

const TeamPage: React.FC = () => {
  const [posts, setPosts] = useState<(TeamPost & { author?: Member })[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [filterStatus, setFilterStatus] = useState<'all' | 'open' | 'closed'>('all');

  const [form, setForm] = useState({
    title: '',
    description: '',
    required_skills: '',
    max_members: 4,
    contact: '',
    author_name: '',
    author_password: '',
  });
  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deletePassword, setDeletePassword] = useState('');
  const [deleteError, setDeleteError] = useState('');
  const [deleting, setDeleting] = useState(false);

  const fetchPosts = async () => {
    try {
      const { data, error } = await supabase
        .from('team_posts')
        .select('*, author:members(*)')
        .order('created_at', { ascending: false });
      if (error) throw error;
      setPosts(data ?? []);
    } catch {
      setPosts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  const filtered = filterStatus === 'all' ? posts : posts.filter((p) => p.status === filterStatus);

  const handleSubmit = async () => {
    setFormError('');
    if (!form.title.trim() || !form.description.trim()) {
      setFormError('제목과 설명을 입력해주세요.');
      return;
    }
    if (!form.author_name.trim() || !form.author_password.trim()) {
      setFormError('이름과 비밀번호를 입력해주세요.');
      return;
    }
    setSubmitting(true);
    try {
      // ilike search — case-insensitive name match
      const { data: memberData, error: memberError } = await supabase
        .from('members')
        .select('id, name, password_hash')
        .ilike('name', form.author_name.trim())
        .single();

      if (memberError || !memberData) {
        setFormError('해당 이름의 멤버를 찾을 수 없습니다.');
        setSubmitting(false);
        return;
      }

      // password_hash가 없으면 비번 없이 작성 허용
      if (memberData.password_hash && memberData.password_hash !== form.author_password) {
        setFormError('비밀번호가 틀렸습니다.');
        setSubmitting(false);
        return;
      }

      const skillsArr = form.required_skills
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);

      const insertPayload: Record<string, unknown> = {
        title: form.title,
        description: form.description,
        required_skills: skillsArr,
        max_members: form.max_members,
        current_members: 1,
        status: 'open',
        contact: form.contact,
        author_id: memberData.id ?? null,
      };

      // Try insert with author_name column (may not exist)
      const { error: insertError } = await supabase.from('team_posts').insert({
        ...insertPayload,
        author_name: form.author_name.trim(),
      });

      if (insertError) {
        // Fallback without author_name column
        const { error: insertError2 } = await supabase.from('team_posts').insert(insertPayload);
        if (insertError2) throw insertError2;
      }

      setForm({
        title: '',
        description: '',
        required_skills: '',
        max_members: 4,
        contact: '',
        author_name: '',
        author_password: '',
      });
      setShowForm(false);
      await fetchPosts();
    } catch (e: unknown) {
      setFormError(e instanceof Error ? e.message : '오류가 발생했습니다.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    setDeleteError('');
    if (!deletePassword.trim()) {
      setDeleteError('비밀번호를 입력해주세요.');
      return;
    }
    setDeleting(true);
    try {
      const post = posts.find((p) => p.id === deleteId);
      if (!post || !post.author_id) {
        setDeleteError('게시물 정보를 찾을 수 없습니다.');
        setDeleting(false);
        return;
      }
      const { data: memberData, error: memberError } = await supabase
        .from('members')
        .select('password_hash')
        .eq('id', post.author_id)
        .single();
      if (memberError || !memberData) {
        setDeleteError('작성자 정보를 찾을 수 없습니다.');
        setDeleting(false);
        return;
      }
      if (deletePassword !== memberData.password_hash) {
        setDeleteError('비밀번호가 일치하지 않습니다.');
        setDeleting(false);
        return;
      }
      const { error: deleteErr } = await supabase
        .from('team_posts')
        .delete()
        .eq('id', deleteId);
      if (deleteErr) throw deleteErr;
      setDeleteId(null);
      setDeletePassword('');
      await fetchPosts();
    } catch (e: unknown) {
      setDeleteError(e instanceof Error ? e.message : '삭제 중 오류가 발생했습니다.');
    } finally {
      setDeleting(false);
    }
  };

  const formatDate = (iso: string) => {
    const d = new Date(iso);
    return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen bg-aing-bg pt-20">
      {/* Header */}
      <section className="py-20 px-6 border-b border-aing-border">
        <div className="max-w-4xl mx-auto">
          <AnimatedSection>
            <div className="inline-flex items-center gap-2 tag-blue mb-6">
              <Users size={12} />
              <span>Team Recruitment</span>
            </div>
            <h1 className="section-title text-5xl mb-4">
              <span className="text-gradient">팀원 모집</span>
            </h1>
            <p className="section-subtitle">함께 프로젝트를 진행할 팀원을 구해보세요</p>
          </AnimatedSection>
        </div>
      </section>

      {/* Filter + New Post Button */}
      <section className="py-6 px-6 border-b border-aing-border sticky top-16 z-30 glass">
        <div className="max-w-4xl mx-auto flex items-center gap-3">
          {(['all', 'open', 'closed'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilterStatus(f)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                filterStatus === f
                  ? 'bg-aing-dark text-white'
                  : 'border border-aing-border text-aing-muted hover:border-aing-blue hover:text-aing-blue'
              }`}
            >
              {f === 'all' ? '전체' : f === 'open' ? '모집중' : '마감'}
            </button>
          ))}
          <button
            onClick={() => setShowForm(true)}
            className="ml-auto flex items-center gap-1.5 bg-aing-blue text-white px-4 py-2 rounded-full text-sm font-medium hover:opacity-90 transition-opacity"
          >
            <Plus size={14} />
            모집 글 작성
          </button>
        </div>
      </section>

      {/* Posts */}
      <section className="py-12 px-6">
        <div className="max-w-4xl mx-auto space-y-4">
          {loading ? (
            [...Array(3)].map((_, i) => (
              <div key={i} className="card animate-pulse h-32" />
            ))
          ) : filtered.length === 0 ? (
            <div className="text-center py-16 text-aing-muted text-sm">
              모집 글이 없습니다.
            </div>
          ) : (
            filtered.map((post, i) => (
              <AnimatedSection key={post.id} delay={i * 50}>
                <Link to={`/team/${post.id}`} className="bg-aing-card border border-aing-border rounded-2xl p-6 hover:border-blue-200 transition-colors block">
                  <div className="flex items-start justify-between gap-4 mb-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <h3 className="font-semibold text-aing-text">{post.title}</h3>
                        <span
                          className={`text-xs px-2 py-0.5 rounded-full border font-medium ${
                            post.status === 'open'
                              ? 'bg-green-100 text-green-700 border-green-200'
                              : 'bg-gray-100 text-gray-500 border-gray-200'
                          }`}
                        >
                          {post.status === 'open' ? '모집중' : '마감'}
                        </span>
                      </div>
                      <p className="text-aing-muted text-sm leading-relaxed line-clamp-2">{post.description}</p>
                    </div>
                    <button
                      onClick={() => { setDeleteId(post.id); setDeletePassword(''); setDeleteError(''); }}
                      className="text-aing-muted hover:text-red-500 transition-colors shrink-0"
                      title="삭제"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>

                  {/* Skills */}
                  {post.required_skills && post.required_skills.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mb-3">
                      {post.required_skills.map((s, idx) => (
                        <span key={idx} className="text-xs px-2 py-0.5 rounded-full bg-purple-50 text-purple-600 border border-purple-200">
                          {s}
                        </span>
                      ))}
                    </div>
                  )}

                  <div className="flex items-center gap-4 text-xs text-aing-muted flex-wrap">
                    <span className="flex items-center gap-1">
                      <Users size={11} />
                      {post.current_members} / {post.max_members}명
                    </span>
                    {(post.author_name || post.author) && (
                      <span>작성자: {post.author_name || post.author?.name}</span>
                    )}
                    {post.contact && (
                      <span className="flex items-center gap-1">
                        {post.contact.includes('kakao') ? (
                          <MessageCircle size={11} />
                        ) : (
                          <Mail size={11} />
                        )}
                        {post.contact.startsWith('http') ? (
                          <a href={post.contact} target="_blank" rel="noreferrer" className="hover:text-aing-text transition-colors">
                            연락처
                          </a>
                        ) : (
                          <span>{post.contact}</span>
                        )}
                      </span>
                    )}
                    <span className="flex items-center gap-1 ml-auto">
                      <Calendar size={11} />
                      {formatDate(post.created_at)}
                    </span>
                  </div>
                </Link>
              </AnimatedSection>
            ))
          )}
        </div>
      </section>

      {/* New Post Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-aing-card border border-aing-border rounded-2xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-bold text-aing-text">팀원 모집 글 작성</h2>
              <button onClick={() => setShowForm(false)} className="text-aing-muted hover:text-aing-text">
                <X size={18} />
              </button>
            </div>
            <div className="space-y-3">
              <div>
                <label className="text-xs text-aing-muted mb-1 block">제목 *</label>
                <input
                  type="text"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  placeholder="프로젝트 제목"
                  className="w-full border border-aing-border rounded-xl px-3 py-2 text-sm text-aing-text bg-aing-bg outline-none focus:border-aing-blue"
                />
              </div>
              <div>
                <label className="text-xs text-aing-muted mb-1 block">설명 *</label>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="프로젝트 설명, 원하는 팀원 등을 적어주세요"
                  rows={3}
                  className="w-full border border-aing-border rounded-xl px-3 py-2 text-sm text-aing-text bg-aing-bg outline-none focus:border-aing-blue resize-none"
                />
              </div>
              <div>
                <label className="text-xs text-aing-muted mb-1 block">필요 스킬 (쉼표 구분)</label>
                <input
                  type="text"
                  value={form.required_skills}
                  onChange={(e) => setForm({ ...form, required_skills: e.target.value })}
                  placeholder="Python, PyTorch, React"
                  className="w-full border border-aing-border rounded-xl px-3 py-2 text-sm text-aing-text bg-aing-bg outline-none focus:border-aing-blue"
                />
              </div>
              <div>
                <label className="text-xs text-aing-muted mb-1 block">모집 인원</label>
                <input
                  type="number"
                  value={form.max_members}
                  onChange={(e) => setForm({ ...form, max_members: Number(e.target.value) })}
                  min={2}
                  max={10}
                  className="w-full border border-aing-border rounded-xl px-3 py-2 text-sm text-aing-text bg-aing-bg outline-none focus:border-aing-blue"
                />
              </div>
              <div>
                <label className="text-xs text-aing-muted mb-1 block">연락수단</label>
                <input
                  type="text"
                  value={form.contact}
                  onChange={(e) => setForm({ ...form, contact: e.target.value })}
                  placeholder="연락수단 링크 또는 이메일"
                  className="w-full border border-aing-border rounded-xl px-3 py-2 text-sm text-aing-text bg-aing-bg outline-none focus:border-aing-blue"
                />
              </div>
              <div className="border-t border-aing-border pt-3">
                <p className="text-xs text-aing-muted mb-3">본인 확인</p>
                <div className="space-y-2">
                  <input
                    type="text"
                    value={form.author_name}
                    onChange={(e) => setForm({ ...form, author_name: e.target.value })}
                    placeholder="이름 (멤버 등록 이름과 동일)"
                    className="w-full border border-aing-border rounded-xl px-3 py-2 text-sm text-aing-text bg-aing-bg outline-none focus:border-aing-blue"
                  />
                  <input
                    type="password"
                    value={form.author_password}
                    onChange={(e) => setForm({ ...form, author_password: e.target.value })}
                    placeholder="비밀번호"
                    className="w-full border border-aing-border rounded-xl px-3 py-2 text-sm text-aing-text bg-aing-bg outline-none focus:border-aing-blue"
                  />
                </div>
              </div>
              {formError && <p className="text-red-500 text-xs">{formError}</p>}
              <button
                onClick={handleSubmit}
                disabled={submitting}
                className="w-full bg-aing-blue text-white rounded-xl py-2.5 text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
              >
                {submitting ? '작성 중...' : '작성하기'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirm Modal */}
      {deleteId && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-aing-card border border-aing-border rounded-2xl p-6 w-full max-w-sm">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold text-aing-text">게시물 삭제</h2>
              <button onClick={() => setDeleteId(null)} className="text-aing-muted hover:text-aing-text">
                <X size={18} />
              </button>
            </div>
            <p className="text-aing-muted text-sm mb-4">본인 확인을 위해 비밀번호를 입력해주세요.</p>
            <input
              type="password"
              value={deletePassword}
              onChange={(e) => setDeletePassword(e.target.value)}
              placeholder="비밀번호"
              className="w-full border border-aing-border rounded-xl px-3 py-2 text-sm text-aing-text bg-aing-bg outline-none focus:border-red-400 mb-3"
            />
            {deleteError && <p className="text-red-500 text-xs mb-3">{deleteError}</p>}
            <button
              onClick={handleDelete}
              disabled={deleting}
              className="w-full bg-red-500 text-white rounded-xl py-2.5 text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              {deleting ? '삭제 중...' : '삭제하기'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default TeamPage;
