import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Calendar, CheckCircle, MessageSquare, Pencil, Trash2, Users, X, XCircle } from 'lucide-react';
import { supabase, Member, TeamApplication, TeamPost } from '../lib/supabase';
import AnimatedSection from '../components/AnimatedSection';
import { useAuth } from '../context/AuthContext';

const LIMITS = {
  title: 80,
  description: 1000,
  skill: 24,
  skillCount: 8,
  contact: 120,
  message: 300,
  maxMembersMin: 2,
  maxMembersMax: 8,
  submitCooldownMs: 60_000,
};

const POST_SELECT = [
  'id', 'author_id', 'author_name', 'title', 'description', 'required_skills',
  'max_members', 'current_members', 'status', 'contact', 'created_at',
  'author:members(id,name,avatar_url,track,role,linkedin,github)',
].join(',');

type TeamEditValidation =
  | { error: string }
  | {
      title: string;
      description: string;
      contact: string;
      maxMembers: number;
      required_skills: string[];
      status: 'open' | 'closed';
    };

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

const formatDate = (d: string) => new Date(d).toLocaleDateString('ko-KR', {
  year: 'numeric', month: 'long', day: 'numeric',
});

const TeamPostDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, isAdmin } = useAuth();
  const [post, setPost] = useState<(TeamPost & { author?: Member }) | null>(null);
  const [applications, setApplications] = useState<TeamApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [applyMessage, setApplyMessage] = useState('');
  const [applyError, setApplyError] = useState('');
  const [applySubmitting, setApplySubmitting] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editForm, setEditForm] = useState({
    title: '',
    description: '',
    required_skills: '',
    max_members: 4,
    contact: '',
    status: 'open' as 'open' | 'closed',
  });
  const [editError, setEditError] = useState('');
  const [editSubmitting, setEditSubmitting] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const isAuthor = useMemo(() => Boolean(user && post && post.author_id === user.member_id), [post, user]);
  const canManage = Boolean(isAdmin || isAuthor);

  const loadApplications = useCallback(async (currentPost: TeamPost & { author?: Member }) => {
    const select = (isAdmin || currentPost.author_id === user?.member_id)
      ? 'id,team_post_id,applicant_id,applicant_name,message,status,created_at'
      : 'id,team_post_id,applicant_id,applicant_name,status,created_at';

    const { data } = await supabase
      .from('team_applications')
      .select(select)
      .eq('team_post_id', currentPost.id)
      .order('created_at', { ascending: true });
    setApplications((data || []) as unknown as TeamApplication[]);
  }, [isAdmin, user?.member_id]);

  const fetchPost = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    const { data } = await supabase
      .from('team_posts')
      .select(POST_SELECT)
      .eq('id', id)
      .single();
    if (data) {
      const typed = data as unknown as TeamPost & { author?: Member };
      setPost(typed);
      await loadApplications(typed);
    } else {
      setPost(null);
    }
    setLoading(false);
  }, [id, loadApplications]);

  useEffect(() => {
    fetchPost();
  }, [fetchPost]);

  const acceptedApplications = applications.filter(a => a.status === 'accepted');
  const pendingApplications = applications.filter(a => a.status === 'pending');
  const filled = 1 + acceptedApplications.length;
  const isFull = post ? filled >= post.max_members : false;

  const validateEdit = (): TeamEditValidation => {
    const title = editForm.title.trim().slice(0, LIMITS.title);
    const description = editForm.description.trim().slice(0, LIMITS.description);
    const contact = editForm.contact.trim().slice(0, LIMITS.contact);
    const maxMembers = Number(editForm.max_members);

    if (title.length < 4) return { error: '제목은 4자 이상 입력해주세요.' };
    if (description.length < 20) return { error: '설명은 20자 이상 입력해주세요.' };
    if (!Number.isInteger(maxMembers) || maxMembers < Math.max(LIMITS.maxMembersMin, filled) || maxMembers > LIMITS.maxMembersMax) {
      return { error: `모집 인원은 현재 인원 이상, ${LIMITS.maxMembersMax}명 이하로 입력해주세요.` };
    }
    if (!isSafeContact(contact)) return { error: '연락수단은 https URL, 이메일, 또는 영문/숫자 기반 ID만 입력할 수 있습니다.' };

    return {
      title,
      description,
      contact,
      maxMembers,
      required_skills: normalizeSkills(editForm.required_skills),
      status: editForm.status,
    };
  };

  const openEditModal = () => {
    if (!post || !canManage) return;
    setEditError('');
    setEditForm({
      title: post.title,
      description: post.description,
      required_skills: (post.required_skills || []).join(', '),
      max_members: post.max_members,
      contact: post.contact || '',
      status: post.status,
    });
    setShowEditModal(true);
  };

  const handleEditSubmit = async () => {
    if (!post || !canManage) return;
    const validated = validateEdit();
    if ('error' in validated) {
      setEditError(validated.error);
      return;
    }

    setEditSubmitting(true);
    const { error } = await supabase
      .from('team_posts')
      .update({
        title: validated.title,
        description: validated.description,
        required_skills: validated.required_skills,
        max_members: validated.maxMembers,
        contact: validated.contact || null,
        status: validated.status,
        updated_at: new Date().toISOString(),
      })
      .eq('id', post.id);

    if (error) {
      setEditError(error.message);
    } else {
      setShowEditModal(false);
      await fetchPost();
    }
    setEditSubmitting(false);
  };

  const handleApply = async () => {
    if (!post || !user?.member_id) return;
    setApplyError('');
    if (post.author_id === user.member_id) {
      setApplyError('본인이 작성한 모집글에는 지원할 수 없습니다.');
      return;
    }
    if (post.status !== 'open' || isFull) {
      setApplyError('마감된 모집글입니다.');
      return;
    }
    if (applications.some(app => app.applicant_id === user.member_id)) {
      setApplyError('이미 지원한 모집글입니다.');
      return;
    }

    const lastApply = Number(localStorage.getItem('aing_team_apply_last_submit') || 0);
    if (Date.now() - lastApply < LIMITS.submitCooldownMs) {
      setApplyError('지원은 1분에 한 번만 보낼 수 있습니다.');
      return;
    }

    setApplySubmitting(true);
    const { error } = await supabase.from('team_applications').insert({
      team_post_id: post.id,
      applicant_id: user.member_id,
      applicant_name: user.name,
      message: applyMessage.trim().slice(0, LIMITS.message) || null,
      status: 'pending',
    });

    if (error?.code === '23505') {
      setApplyError('이미 지원했습니다.');
    } else if (error) {
      setApplyError(error.message);
    } else {
      localStorage.setItem('aing_team_apply_last_submit', String(Date.now()));
      setShowApplyModal(false);
      setApplyMessage('');
      await fetchPost();
    }
    setApplySubmitting(false);
  };

  const handleAccept = async (appId: string) => {
    if (!post || !canManage || filled >= post.max_members) return;
    await supabase.from('team_applications').update({ status: 'accepted' }).eq('id', appId);
    await supabase.from('team_posts').update({ current_members: Math.min(post.max_members, filled + 1) }).eq('id', post.id);
    fetchPost();
  };

  const handleReject = async (appId: string) => {
    if (!canManage) return;
    await supabase.from('team_applications').update({ status: 'rejected' }).eq('id', appId);
    fetchPost();
  };

  const handleRemoveApplicant = async (applicationId: string) => {
    if (!post || !canManage || !window.confirm('이 참여자를 제외할까요?')) return;
    await supabase.from('team_applications').update({ status: 'rejected' }).eq('id', applicationId);
    await supabase.from('team_posts').update({ current_members: Math.max(1, filled - 1) }).eq('id', post.id);
    fetchPost();
  };

  const handleDelete = async () => {
    if (!post || !canManage || !window.confirm('이 모집글을 삭제할까요?')) return;
    setDeleting(true);
    await supabase.from('team_posts').delete().eq('id', post.id);
    setDeleting(false);
    navigate('/team');
  };

  if (loading) return (
    <div className="min-h-screen bg-aing-bg pt-32 flex items-center justify-center">
      <div className="text-aing-muted text-sm">Loading...</div>
    </div>
  );

  if (!post) return (
    <div className="min-h-screen bg-aing-bg pt-32 flex items-center justify-center">
      <div className="text-center">
        <p className="text-aing-muted mb-4">모집글을 찾을 수 없습니다.</p>
        <Link to="/team" className="btn-ghost text-sm">팀원 모집으로 돌아가기</Link>
      </div>
    </div>
  );

  const authorName = post.author_name || post.author?.name || '익명';

  return (
    <div className="min-h-screen bg-aing-bg pt-20">
      <div className="max-w-2xl mx-auto px-6 py-12">
        <AnimatedSection>
          <Link to="/team" className="flex items-center gap-2 text-aing-muted hover:text-aing-text text-sm mb-8 transition-colors">
            <ArrowLeft size={14} />
            팀원 모집
          </Link>
        </AnimatedSection>

        <AnimatedSection delay={100}>
          <div className="card mb-6">
            <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
              <span className={`text-xs px-3 py-1 rounded-full border font-medium ${
                post.status === 'open' && !isFull
                  ? 'text-green-600 border-green-200 bg-green-50'
                  : 'text-aing-muted border-aing-border bg-gray-50'
              }`}>
                {post.status === 'open' && !isFull ? '모집중' : '마감'}
              </span>
              <span className="text-xs text-aing-muted flex items-center gap-1">
                <Calendar size={12} />
                {formatDate(post.created_at)}
              </span>
            </div>

            <h1 className="text-2xl font-semibold text-aing-text mb-3">{post.title}</h1>

            <div className="flex items-center gap-2 mb-6 pb-6 border-b border-aing-border">
              {post.author?.avatar_url ? (
                <img src={post.author.avatar_url} alt={authorName} className="w-7 h-7 rounded-full object-cover border border-aing-border" />
              ) : (
                <div className="w-7 h-7 rounded-full bg-gradient-to-br from-aing-blue/30 to-purple-400/30 border border-aing-border flex items-center justify-center">
                  <span className="text-xs font-semibold text-aing-text">{authorName[0]}</span>
                </div>
              )}
              {post.author?.id ? (
                <Link to={`/members/${post.author.id}`} className="text-sm text-aing-muted hover:text-aing-blue transition-colors">
                  {authorName}
                </Link>
              ) : (
                <span className="text-sm text-aing-muted">{authorName}</span>
              )}
            </div>

            <div className="mb-6">
              <h3 className="text-sm font-semibold text-aing-text mb-2">프로젝트 설명</h3>
              <p className="text-sm text-aing-muted leading-relaxed whitespace-pre-wrap">{post.description}</p>
            </div>

            <div className="mb-6">
              <h3 className="text-sm font-semibold text-aing-text mb-2 flex items-center gap-1">
                <Users size={14} /> 모집 인원
              </h3>
              <span className="text-sm text-aing-muted">
                {filled} / {post.max_members}명
                {isFull && <span className="text-red-500 ml-2">(마감)</span>}
              </span>
            </div>

            {post.required_skills && post.required_skills.length > 0 && (
              <div className="mb-6">
                <h3 className="text-sm font-semibold text-aing-text mb-2">필요 스킬</h3>
                <div className="flex flex-wrap gap-2">
                  {post.required_skills.slice(0, LIMITS.skillCount).map(skill => <span key={skill} className="tag">{skill}</span>)}
                </div>
              </div>
            )}

            {post.contact && (
              <div className="mb-6">
                <h3 className="text-sm font-semibold text-aing-text mb-2 flex items-center gap-1">
                  <MessageSquare size={14} /> 연락수단
                </h3>
                {post.contact.startsWith('https://') ? (
                  <a href={post.contact} target="_blank" rel="noreferrer" className="text-sm text-aing-blue hover:opacity-80">{post.contact}</a>
                ) : (
                  <p className="text-sm text-aing-blue">{post.contact}</p>
                )}
              </div>
            )}

            {acceptedApplications.length > 0 && (
              <div className="mb-6">
                <h3 className="text-sm font-semibold text-aing-text mb-3">참여 확정</h3>
                <div className="flex flex-wrap gap-2">
                  {acceptedApplications.map(app => (
                    <div key={app.id} className="flex items-center gap-2 bg-green-50 border border-green-200 rounded-xl px-3 py-1.5">
                      <span className="text-sm text-aing-text font-medium">{app.applicant_name}</span>
                      {canManage && (
                        <button onClick={() => handleRemoveApplicant(app.id)} className="ml-1 text-red-400 hover:text-red-600 transition-colors" title="제외">
                          <X size={14} />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {canManage && pendingApplications.length > 0 && (
              <div className="mb-6">
                <h3 className="text-sm font-semibold text-aing-text mb-3">대기중 신청</h3>
                <div className="space-y-2">
                  {pendingApplications.map(app => (
                    <div key={app.id} className="flex items-start gap-3 p-3 bg-orange-50 border border-orange-200 rounded-xl">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-aing-text">{app.applicant_name}</p>
                        {app.message && <p className="text-xs text-aing-muted mt-0.5 whitespace-pre-wrap">{app.message}</p>}
                      </div>
                      <div className="flex gap-2 shrink-0">
                        <button onClick={() => handleAccept(app.id)} disabled={isFull} className="text-green-600 hover:text-green-500 transition-colors disabled:opacity-30" title="수락">
                          <CheckCircle size={18} />
                        </button>
                        <button onClick={() => handleReject(app.id)} className="text-red-500 hover:text-red-400 transition-colors" title="거절">
                          <XCircle size={18} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="pt-4 border-t border-aing-border flex items-center gap-3 flex-wrap">
              {!isAuthor ? (
                <button
                  onClick={() => { setApplyError(''); setApplyMessage(''); setShowApplyModal(true); }}
                  disabled={post.status === 'closed' || isFull || applications.some(app => app.applicant_id === user?.member_id)}
                  className="flex items-center gap-1.5 bg-aing-blue text-white px-4 py-2 rounded-xl text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <Users size={14} />
                  참여 의사 보내기
                </button>
              ) : (
                <span className="text-xs text-aing-muted">내가 작성한 글입니다.</span>
              )}

              {canManage && (
                <>
                  <button onClick={openEditModal} className="flex items-center gap-1.5 border border-aing-border text-aing-muted px-4 py-2 rounded-xl text-sm hover:text-aing-text hover:border-aing-blue transition-colors">
                    <Pencil size={14} />
                    수정
                  </button>
                  <button onClick={handleDelete} disabled={deleting} className="flex items-center gap-1 text-xs text-aing-muted hover:text-red-500 transition-colors ml-auto disabled:opacity-50">
                    <Trash2 size={12} />
                    {deleting ? '삭제 중...' : '삭제'}
                  </button>
                </>
              )}
            </div>
          </div>
        </AnimatedSection>

        <AnimatedSection delay={200}>
          <Link to="/team" className="btn-ghost text-sm inline-flex items-center gap-2">
            <ArrowLeft size={14} /> 목록으로
          </Link>
        </AnimatedSection>
      </div>

      {showApplyModal && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-aing-card border border-aing-border rounded-2xl p-6 w-full max-w-sm">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold text-aing-text">참여 의사 보내기</h2>
              <button onClick={() => setShowApplyModal(false)} className="text-aing-muted hover:text-aing-text"><X size={18} /></button>
            </div>
            <p className="text-aing-muted text-xs mb-4">작성자에게 보낼 짧은 메시지를 선택적으로 남길 수 있습니다.</p>
            <textarea
              value={applyMessage}
              onChange={(e) => setApplyMessage(e.target.value.slice(0, LIMITS.message))}
              placeholder={`메시지 (선택, 최대 ${LIMITS.message}자)`}
              rows={3}
              className="input-field resize-none mb-2"
            />
            <div className="text-right text-xs text-aing-muted mb-3">{applyMessage.length}/{LIMITS.message}</div>
            {applyError && <p className="text-red-500 text-xs mb-3">{applyError}</p>}
            <button onClick={handleApply} disabled={applySubmitting} className="w-full bg-aing-blue text-white rounded-xl py-2.5 text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-50">
              {applySubmitting ? '전송 중...' : '보내기'}
            </button>
          </div>
        </div>
      )}

      {showEditModal && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-aing-card border border-aing-border rounded-2xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-bold text-aing-text">모집글 수정</h2>
              <button onClick={() => setShowEditModal(false)} className="text-aing-muted hover:text-aing-text"><X size={18} /></button>
            </div>
            <div className="space-y-3">
              <input value={editForm.title} maxLength={LIMITS.title} onChange={(e) => setEditForm({ ...editForm, title: e.target.value })} className="input-field" placeholder="제목" />
              <textarea value={editForm.description} maxLength={LIMITS.description} onChange={(e) => setEditForm({ ...editForm, description: e.target.value })} rows={5} className="input-field resize-none" placeholder="설명" />
              <input value={editForm.required_skills} onChange={(e) => setEditForm({ ...editForm, required_skills: e.target.value.slice(0, 220) })} className="input-field" placeholder="필요 스킬 (쉼표 구분)" />
              <input type="number" value={editForm.max_members} onChange={(e) => setEditForm({ ...editForm, max_members: Number(e.target.value) })} min={Math.max(LIMITS.maxMembersMin, filled)} max={LIMITS.maxMembersMax} className="input-field" />
              <input value={editForm.contact} maxLength={LIMITS.contact} onChange={(e) => setEditForm({ ...editForm, contact: e.target.value })} className="input-field" placeholder="연락수단" />
              <select value={editForm.status} onChange={(e) => setEditForm({ ...editForm, status: e.target.value as 'open' | 'closed' })} className="input-field">
                <option value="open">모집중</option>
                <option value="closed">마감</option>
              </select>
              {editError && <p className="text-red-500 text-xs">{editError}</p>}
              <button onClick={handleEditSubmit} disabled={editSubmitting} className="w-full bg-aing-blue text-white rounded-xl py-2.5 text-sm font-medium hover:opacity-90 disabled:opacity-50">
                {editSubmitting ? '저장 중...' : '저장하기'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TeamPostDetailPage;
