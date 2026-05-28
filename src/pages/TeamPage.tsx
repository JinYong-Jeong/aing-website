import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, Plus, Search, Users, X } from 'lucide-react';
import { supabase, Member, TeamApplication, TeamPost } from '../lib/supabase';
import AnimatedSection from '../components/AnimatedSection';
import { useAuth } from '../context/AuthContext';

const LIMITS = {
  title: 80,
  description: 1000,
  skill: 24,
  skillCount: 8,
  contact: 120,
  openPostsPerMember: 3,
  maxMembersMin: 2,
  maxMembersMax: 8,
  submitCooldownMs: 60_000,
  recentWindowMs: 10 * 60_000,
  recentMax: 2,
};

const TEAM_POST_SELECT = [
  'id', 'author_id', 'author_name', 'title', 'description', 'required_skills',
  'max_members', 'current_members', 'status', 'contact', 'created_at',
  'author:members(id,name,avatar_url,linkedin,github)',
  'applications:team_applications(id,team_post_id,applicant_id,applicant_name,status,created_at)',
].join(',');

const emptyForm = {
  title: '',
  description: '',
  required_skills: '',
  max_members: 4,
  contact: '',
};

type TeamPostValidation =
  | { error: string }
  | { title: string; description: string; contact: string; skills: string[]; maxMembers: number };

const trimText = (value: string, max: number) => value.trim().slice(0, max);

const normalizeSkills = (value: string) => {
  const seen = new Set<string>();
  return value
    .split(',')
    .map(skill => skill.trim())
    .filter(Boolean)
    .map(skill => skill.slice(0, LIMITS.skill))
    .filter(skill => {
      const key = skill.toLowerCase();
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    })
    .slice(0, LIMITS.skillCount);
};

const isSafeContact = (value: string) => {
  const contact = value.trim();
  if (!contact) return true;
  if (contact.length > LIMITS.contact) return false;
  if (/^https:\/\/[^\s<>"']{4,}$/i.test(contact)) return true;
  if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contact)) return true;
  return /^[a-zA-Z0-9._@-]{3,60}$/.test(contact);
};

const formatDate = (iso: string) => {
  const d = new Date(iso);
  return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')}`;
};

const TeamPage: React.FC = () => {
  const { user } = useAuth();
  const [posts, setPosts] = useState<(TeamPost & { author?: Member; applications?: TeamApplication[] })[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [pageSize, setPageSize] = useState(10);
  const [page, setPage] = useState(1);
  const [filterStatus, setFilterStatus] = useState<'all' | 'open' | 'closed'>('all');
  const [search, setSearch] = useState('');
  const [form, setForm] = useState(emptyForm);
  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchPosts = async () => {
    try {
      const { data, error } = await supabase
        .from('team_posts')
        .select(TEAM_POST_SELECT)
        .order('created_at', { ascending: false });
      if (error) throw error;
      setPosts((data ?? []) as any);
    } catch {
      setPosts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  const filtered = useMemo(() => {
    return (filterStatus === 'all' ? posts : posts.filter((p) => p.status === filterStatus))
      .filter(p => {
        if (!search.trim()) return true;
        const q = search.toLowerCase();
        return (
          p.title.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q) ||
          (p.required_skills || []).some((s: string) => s.toLowerCase().includes(q))
        );
      });
  }, [filterStatus, posts, search]);

  const totalPages = Math.ceil(filtered.length / pageSize);
  const paginated = filtered.slice((page - 1) * pageSize, page * pageSize);
  const myOpenPosts = posts.filter(p => p.author_id === user?.member_id && p.status === 'open').length;

  const validateForm = (): TeamPostValidation => {
    const title = trimText(form.title, LIMITS.title);
    const description = trimText(form.description, LIMITS.description);
    const contact = trimText(form.contact, LIMITS.contact);
    const skills = normalizeSkills(form.required_skills);
    const maxMembers = Number(form.max_members);

    if (!user?.member_id) return { error: '로그인한 부원만 모집글을 작성할 수 있습니다.' };
    if (myOpenPosts >= LIMITS.openPostsPerMember) return { error: `열린 모집글은 계정당 ${LIMITS.openPostsPerMember}개까지만 작성할 수 있습니다.` };
    if (title.length < 4) return { error: '제목은 4자 이상 입력해주세요.' };
    if (description.length < 20) return { error: '설명은 20자 이상 입력해주세요.' };
    if (description.length > LIMITS.description) return { error: `설명은 ${LIMITS.description}자 이하로 입력해주세요.` };
    if (!Number.isInteger(maxMembers) || maxMembers < LIMITS.maxMembersMin || maxMembers > LIMITS.maxMembersMax) {
      return { error: `모집 인원은 ${LIMITS.maxMembersMin}-${LIMITS.maxMembersMax}명 사이로 입력해주세요.` };
    }
    if (!isSafeContact(contact)) {
      return { error: '연락수단은 https URL, 이메일, 또는 영문/숫자 기반 ID만 입력할 수 있습니다.' };
    }

    return { title, description, contact, skills, maxMembers };
  };

  const handleSubmit = async () => {
    setFormError('');
    const validated = validateForm();
    if ('error' in validated) {
      setFormError(validated.error);
      return;
    }

    const lastSubmit = Number(localStorage.getItem('aing_team_post_last_submit') || 0);
    if (Date.now() - lastSubmit < LIMITS.submitCooldownMs) {
      setFormError('모집글은 1분에 한 번만 작성할 수 있습니다.');
      return;
    }

    setSubmitting(true);
    try {
      const since = new Date(Date.now() - LIMITS.recentWindowMs).toISOString();
      const { count } = await supabase
        .from('team_posts')
        .select('id', { count: 'exact', head: true })
        .eq('author_id', user!.member_id)
        .gte('created_at', since);
      if ((count || 0) >= LIMITS.recentMax) {
        setFormError('짧은 시간에 너무 많은 모집글을 작성했습니다. 잠시 후 다시 시도해주세요.');
        setSubmitting(false);
        return;
      }

      const { error } = await supabase.from('team_posts').insert({
        title: validated.title,
        description: validated.description,
        required_skills: validated.skills,
        max_members: validated.maxMembers,
        current_members: 1,
        status: 'open',
        contact: validated.contact || null,
        author_id: user!.member_id,
        author_name: user!.name,
      });
      if (error) throw error;

      localStorage.setItem('aing_team_post_last_submit', String(Date.now()));
      setForm(emptyForm);
      setShowForm(false);
      await fetchPosts();
    } catch (e: unknown) {
      setFormError(e instanceof Error ? e.message : '모집글 작성 중 오류가 발생했습니다.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleApply = async (post: TeamPost & { applications?: TeamApplication[] }) => {
    if (!user?.member_id) return;
    if (post.author_id === user.member_id) {
      alert('본인이 작성한 모집글에는 지원할 수 없습니다.');
      return;
    }
    if (post.status !== 'open') {
      alert('마감된 모집글입니다.');
      return;
    }
    if ((post.applications || []).some(app => app.applicant_id === user.member_id)) {
      alert('이미 지원한 모집글입니다.');
      return;
    }
    const acceptedCount = (post.applications || []).filter(app => app.status === 'accepted').length;
    if (1 + acceptedCount >= post.max_members) {
      alert('모집 인원이 이미 찼습니다.');
      return;
    }
    if (!window.confirm('이 모집글에 참여 의사를 보낼까요?')) return;

    const lastApply = Number(localStorage.getItem('aing_team_apply_last_submit') || 0);
    if (Date.now() - lastApply < LIMITS.submitCooldownMs) {
      alert('지원은 1분에 한 번만 보낼 수 있습니다.');
      return;
    }

    const { error } = await supabase.from('team_applications').insert({
      team_post_id: post.id,
      applicant_id: user.member_id,
      applicant_name: user.name,
      status: 'pending',
    });

    if (error?.code === '23505') {
      alert('이미 지원했습니다.');
    } else if (error) {
      alert('지원 중 오류가 발생했습니다.');
    } else {
      localStorage.setItem('aing_team_apply_last_submit', String(Date.now()));
      alert('지원이 완료되었습니다. 작성자의 응답을 기다려주세요.');
      fetchPosts();
    }
  };

  const isMyPost = (post: TeamPost) => user?.member_id === post.author_id;

  return (
    <div className="min-h-screen bg-aing-bg pt-20">
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
            <p className="section-subtitle">등록 부원끼리 안전하게 프로젝트 팀원을 구합니다.</p>
          </AnimatedSection>
        </div>
      </section>

      <section className="py-6 px-6 border-b border-aing-border sticky top-16 z-30 glass">
        <div className="max-w-4xl mx-auto flex items-center gap-3 flex-wrap">
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
          <div className="relative">
            <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-aing-muted" />
            <input type="text" value={search} onChange={e => setSearch(e.target.value.slice(0, 60))} placeholder="검색..." className="input-field pl-8 py-1.5 text-xs w-40" />
          </div>
          <button
            onClick={() => setShowForm(true)}
            disabled={myOpenPosts >= LIMITS.openPostsPerMember}
            className="ml-auto flex items-center gap-1.5 bg-aing-blue text-white px-4 py-2 rounded-full text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed"
            title={myOpenPosts >= LIMITS.openPostsPerMember ? '열린 모집글은 계정당 3개까지입니다.' : '모집글 작성'}
          >
            <Plus size={14} />
            모집 글 작성
          </button>
        </div>
      </section>

      <section className="py-12 px-6">
        <div className="max-w-4xl mx-auto space-y-4">
          {loading ? (
            [...Array(3)].map((_, i) => <div key={i} className="card animate-pulse h-32" />)
          ) : filtered.length === 0 ? (
            <div className="text-center py-16 text-aing-muted text-sm">모집 글이 없습니다.</div>
          ) : (
            paginated.map((post, i) => {
              const acceptedApps = (post.applications || []).filter(a => a.status === 'accepted');
              const filled = 1 + acceptedApps.length;
              const authorName = post.author_name || post.author?.name || '익명';
              const myPost = isMyPost(post);
              const isFull = filled >= post.max_members;

              return (
                <AnimatedSection key={post.id} delay={i * 50}>
                  <div className="bg-aing-card border border-aing-border rounded-2xl p-6 hover:border-blue-200 transition-colors">
                    <div className="flex items-center gap-2 mb-2 flex-wrap">
                      <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${
                        post.status === 'open' && !isFull
                          ? 'bg-green-100 text-green-700 border-green-200'
                          : 'bg-gray-100 text-gray-500 border-gray-200'
                      }`}>
                        {post.status === 'open' && !isFull ? '모집중' : '마감'}
                      </span>
                      {myPost && <span className="text-xs px-2 py-0.5 rounded-full bg-yellow-100 text-yellow-700 border border-yellow-200 font-medium">내 글</span>}
                    </div>

                    <Link to={`/team/${post.id}`}>
                      <h3 className="font-semibold text-aing-text hover:text-aing-blue transition-colors mb-1 cursor-pointer">
                        {post.title}
                      </h3>
                    </Link>
                    <p className="text-aing-muted text-sm leading-relaxed line-clamp-2 mb-3">{post.description}</p>

                    {post.required_skills && post.required_skills.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mb-3">
                        {post.required_skills.slice(0, LIMITS.skillCount).map((s, idx) => (
                          <span key={idx} className="text-xs px-2 py-0.5 rounded-full bg-purple-50 text-purple-600 border border-purple-200">{s}</span>
                        ))}
                      </div>
                    )}

                    <div className="flex items-center gap-3 mb-4">
                      <span className="text-xs text-aing-muted">{Math.min(filled, post.max_members)}/{post.max_members}명</span>
                      <span className="text-xs text-aing-muted ml-auto">작성자 {authorName}</span>
                    </div>

                    <div className="flex items-center gap-3 flex-wrap">
                      {!myPost ? (
                        <button
                          onClick={() => handleApply(post)}
                          disabled={post.status === 'closed' || isFull}
                          className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full bg-aing-blue text-white hover:opacity-90 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed font-medium"
                        >
                          <Users size={11} />
                          참여 의사 보내기
                        </button>
                      ) : (
                        <span className="text-xs text-aing-muted">내가 작성한 글입니다.</span>
                      )}
                      <Link to={`/team/${post.id}`} className="flex items-center gap-1 text-xs text-aing-blue hover:opacity-80 transition-opacity font-medium">
                        자세히 보기
                      </Link>
                      <span className="flex items-center gap-1 text-xs text-aing-muted ml-auto">
                        <Calendar size={11} />
                        {formatDate(post.created_at)}
                      </span>
                    </div>
                  </div>
                </AnimatedSection>
              );
            })
          )}

          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 py-8">
              <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="btn-ghost text-xs px-3 py-1.5 disabled:opacity-40">이전</button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(n => (
                <button key={n} onClick={() => setPage(n)} className={`text-xs px-3 py-1.5 rounded-lg border transition-all ${page === n ? 'bg-aing-dark text-white' : 'border-aing-border text-aing-muted hover:border-aing-blue'}`}>{n}</button>
              ))}
              <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="btn-ghost text-xs px-3 py-1.5 disabled:opacity-40">다음</button>
            </div>
          )}
          <div className="flex justify-end mt-2">
            <select value={pageSize} onChange={e => { setPageSize(Number(e.target.value)); setPage(1); }} className="input-field py-1 text-xs w-20">
              <option value={5}>5개</option>
              <option value={10}>10개</option>
              <option value={20}>20개</option>
            </select>
          </div>
        </div>
      </section>

      {showForm && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-aing-card border border-aing-border rounded-2xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-bold text-aing-text">팀원 모집 글 작성</h2>
              <button onClick={() => setShowForm(false)} className="text-aing-muted hover:text-aing-text"><X size={18} /></button>
            </div>
            <div className="space-y-3">
              <div>
                <label className="text-xs text-aing-muted mb-1 block">제목 * ({form.title.length}/{LIMITS.title})</label>
                <input value={form.title} maxLength={LIMITS.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="프로젝트 제목" className="input-field" />
              </div>
              <div>
                <label className="text-xs text-aing-muted mb-1 block">설명 * ({form.description.length}/{LIMITS.description})</label>
                <textarea value={form.description} maxLength={LIMITS.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="프로젝트 목표, 필요한 역할, 진행 방식" rows={5} className="input-field resize-none" />
              </div>
              <div>
                <label className="text-xs text-aing-muted mb-1 block">필요 스킬 (쉼표 구분, 최대 {LIMITS.skillCount}개)</label>
                <input value={form.required_skills} onChange={(e) => setForm({ ...form, required_skills: e.target.value.slice(0, 220) })} placeholder="Python, PyTorch, React" className="input-field" />
              </div>
              <div>
                <label className="text-xs text-aing-muted mb-1 block">모집 인원</label>
                <input type="number" value={form.max_members} onChange={(e) => setForm({ ...form, max_members: Number(e.target.value) })} min={LIMITS.maxMembersMin} max={LIMITS.maxMembersMax} className="input-field" />
              </div>
              <div>
                <label className="text-xs text-aing-muted mb-1 block">연락수단 ({form.contact.length}/{LIMITS.contact})</label>
                <input value={form.contact} maxLength={LIMITS.contact} onChange={(e) => setForm({ ...form, contact: e.target.value })} placeholder="https URL, 이메일, 또는 간단한 ID" className="input-field" />
              </div>
              <div className="rounded-xl border border-aing-border bg-aing-bg px-3 py-2">
                <p className="text-xs text-aing-muted">작성자: {user?.name} · 열린 모집글 {myOpenPosts}/{LIMITS.openPostsPerMember}</p>
              </div>
              {formError && <p className="text-red-500 text-xs leading-relaxed">{formError}</p>}
              <button onClick={handleSubmit} disabled={submitting} className="w-full bg-aing-blue text-white rounded-xl py-2.5 text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-50">
                {submitting ? '작성 중...' : '작성하기'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TeamPage;
