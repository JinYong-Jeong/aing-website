import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ChevronLeft, Save } from 'lucide-react';
import { MEMBER_PRIVATE_SELECT, supabase, Member } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';

const WORKLOAD_LABELS = ['여유', '여유', '보통', '바쁨', '바쁨', '매우 바쁨'];
const WORKLOAD_COLORS = ['text-green-600', 'text-green-600', 'text-yellow-600', 'text-orange-500', 'text-orange-600', 'text-red-600'];

const STATUS_OPTIONS = [
  { value: 'busy', label: '바쁨', color: 'bg-red-100 text-red-700 border-red-300' },
  { value: 'mid', label: '프로젝트 관심', color: 'bg-yellow-100 text-yellow-700 border-yellow-300' },
  { value: 'free', label: '프로젝트 희망', color: 'bg-green-100 text-green-700 border-green-300' },
];

type FormData = {
  bio: string;
  avatar_url: string;
  interests: string;
  skills: string;
  workload: number;
  status: 'busy' | 'mid' | 'free';
  looking_for_team: boolean;
  project_idea: string;
  contact_info: string;
  contact_email: string;
  github: string;
  linkedin: string;
};

const MemberProfilePage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, isAdmin } = useAuth();
  const [member, setMember] = useState<Member | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState<FormData>({
    bio: '',
    avatar_url: '',
    interests: '',
    skills: '',
    workload: 0,
    status: 'free',
    looking_for_team: false,
    project_idea: '',
    contact_info: '',
    contact_email: '',
    github: '',
    linkedin: '',
  });

  const canEdit = Boolean(user && id && (isAdmin || user.member_id === id));

  useEffect(() => {
    const fetchMember = async () => {
      if (!id) return;
      if (!canEdit) {
        setLoading(false);
        return;
      }
      try {
        const { data, error } = await supabase
          .from('members')
          .select(MEMBER_PRIVATE_SELECT)
          .eq('id', id)
          .single();
        if (error || !data) {
          setNotFound(true);
        } else {
          const fetchedMember = data as unknown as Member;
          setMember(fetchedMember);
          setForm({
            bio: fetchedMember.bio ?? '',
            avatar_url: fetchedMember.avatar_url ?? '',
            interests: (fetchedMember.interests ?? []).join(', '),
            skills: (fetchedMember.skills ?? []).join(', '),
            workload: fetchedMember.workload ?? 0,
            status: (fetchedMember.status as 'busy' | 'mid' | 'free') ?? 'free',
            looking_for_team: fetchedMember.looking_for_team ?? false,
            project_idea: fetchedMember.project_idea ?? '',
            contact_info: fetchedMember.contact_info ?? '',
            contact_email: fetchedMember.contact_email ?? '',
            github: fetchedMember.github ?? '',
            linkedin: fetchedMember.linkedin ?? '',
          });
        }
      } catch {
        setNotFound(true);
      } finally {
        setLoading(false);
      }
    };
    fetchMember();
  }, [canEdit, id]);

  const handleSave = async () => {
    if (!member || !id || !canEdit) return;
    setSaving(true);
    try {
      const payload: Record<string, unknown> = {
        bio: form.bio.slice(0, 300),
        avatar_url: form.avatar_url,
        github: form.github,
        linkedin: form.linkedin,
        interests: form.interests.split(',').map((s) => s.trim()).filter(Boolean).slice(0, 8),
        skills: form.skills.split(',').map((s) => s.trim()).filter(Boolean).slice(0, 12),
        workload: Number(form.workload),
        status: form.status,
        looking_for_team: form.looking_for_team,
        project_idea: form.project_idea.slice(0, 500),
        contact_info: form.contact_info.slice(0, 160),
        contact_email: form.contact_email.trim().toLowerCase(),
      };

      const { error } = await supabase
        .from('members')
        .update(payload)
        .eq('id', id);

      if (error) throw error;
      navigate(`/members/${id}`);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      alert('저장 실패: ' + msg);
    }
    setSaving(false);
  };

  const getInitials = (name: string) =>
    name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2);

  if (loading) {
    return (
      <div className="min-h-screen bg-aing-bg pt-20 flex items-center justify-center">
        <div className="text-aing-muted text-sm">불러오는 중...</div>
      </div>
    );
  }

  if (!canEdit) {
    return (
      <div className="min-h-screen bg-aing-bg pt-20 flex items-center justify-center px-6">
        <div className="card text-center max-w-sm">
          <h1 className="text-lg font-semibold text-aing-text mb-2">수정 권한이 없습니다.</h1>
          <p className="text-sm text-aing-muted mb-5">프로필은 본인 또는 관리자만 수정할 수 있습니다.</p>
          <Link to={id ? `/members/${id}` : '/members'} className="btn-primary text-sm">프로필로 돌아가기</Link>
        </div>
      </div>
    );
  }

  if (notFound || !member) {
    return (
      <div className="min-h-screen bg-aing-bg pt-20 flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl font-bold text-gradient mb-4">404</div>
          <p className="text-aing-muted mb-6">멤버를 찾을 수 없습니다.</p>
          <Link to="/members" className="btn-primary text-sm">멤버 목록으로</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-aing-bg pt-20">
      <div className="max-w-xl mx-auto px-6 py-12">
        <Link
          to={`/members/${member.id}`}
          className="inline-flex items-center gap-1 text-aing-muted hover:text-aing-text text-sm mb-8 transition-colors"
        >
          <ChevronLeft size={14} />
          프로필 보기
        </Link>

        <div className="flex items-center gap-4 mb-8">
          {member.avatar_url ? (
            <img
              src={member.avatar_url}
              alt={member.name}
              className="w-16 h-16 rounded-2xl object-cover border border-aing-border"
            />
          ) : (
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-100 to-purple-100 border border-aing-border flex items-center justify-center shrink-0">
              <span className="text-aing-text font-semibold text-xl">{getInitials(member.name)}</span>
            </div>
          )}
          <div>
            <h1 className="text-lg font-bold text-aing-text">{member.name}</h1>
            <p className="text-aing-muted text-sm">{member.role}</p>
          </div>
        </div>

        <div className="space-y-5">
          <div className="bg-aing-card border border-aing-border rounded-2xl p-5">
            <h3 className="text-xs font-semibold text-aing-muted uppercase tracking-wider mb-3">기본 정보</h3>
            <div className="space-y-3">
              <input value={form.avatar_url} onChange={(e) => setForm({ ...form, avatar_url: e.target.value })} placeholder="프로필 이미지 URL" className="input-field" />
              <input value={form.bio} onChange={(e) => setForm({ ...form, bio: e.target.value })} maxLength={300} placeholder="한 줄 소개" className="input-field" />
              <input value={form.github} onChange={(e) => setForm({ ...form, github: e.target.value })} placeholder="GitHub URL" className="input-field" />
              <input value={form.linkedin} onChange={(e) => setForm({ ...form, linkedin: e.target.value })} placeholder="LinkedIn URL" className="input-field" />
            </div>
          </div>

          <div className="bg-aing-card border border-aing-border rounded-2xl p-5">
            <h3 className="text-xs font-semibold text-aing-muted uppercase tracking-wider mb-3">관심사 & 기술</h3>
            <div className="space-y-3">
              <input value={form.interests} onChange={(e) => setForm({ ...form, interests: e.target.value })} placeholder="관심 분야 (쉼표로 구분, 최대 8개)" className="input-field" />
              <input value={form.skills} onChange={(e) => setForm({ ...form, skills: e.target.value })} placeholder="보유 기술 (쉼표로 구분, 최대 12개)" className="input-field" />
            </div>
          </div>

          <div className="bg-aing-card border border-aing-border rounded-2xl p-5">
            <h3 className="text-xs font-semibold text-aing-muted uppercase tracking-wider mb-3">업무 포화도</h3>
            <div className="flex items-center gap-3 mb-2">
              <input type="range" min={0} max={5} value={form.workload} onChange={(e) => setForm({ ...form, workload: Number(e.target.value) })} className="flex-1 accent-aing-blue" />
              <span className={`text-sm font-semibold w-20 text-right ${WORKLOAD_COLORS[form.workload]}`}>
                {form.workload} - {WORKLOAD_LABELS[form.workload]}
              </span>
            </div>
          </div>

          <div className="bg-aing-card border border-aing-border rounded-2xl p-5">
            <h3 className="text-xs font-semibold text-aing-muted uppercase tracking-wider mb-3">상태</h3>
            <div className="flex gap-2">
              {STATUS_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => setForm({ ...form, status: opt.value as 'busy' | 'mid' | 'free' })}
                  className={`flex-1 py-2 rounded-xl text-xs font-medium border transition-all ${
                    form.status === opt.value
                      ? opt.color + ' border-opacity-100'
                      : 'border-aing-border text-aing-muted hover:border-aing-blue hover:text-aing-blue'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          <div className="bg-aing-card border border-aing-border rounded-2xl p-5">
            <h3 className="text-xs font-semibold text-aing-muted uppercase tracking-wider mb-3">팀원 모집</h3>
            <label className="flex items-center gap-3 cursor-pointer mb-3">
              <input
                type="checkbox"
                checked={form.looking_for_team}
                onChange={(e) => setForm({ ...form, looking_for_team: e.target.checked })}
                className="accent-aing-blue"
              />
              <span className="text-sm text-aing-text">팀원 구하는 중</span>
            </label>
            {form.looking_for_team && (
              <textarea
                value={form.project_idea}
                onChange={(e) => setForm({ ...form, project_idea: e.target.value })}
                maxLength={500}
                placeholder="프로젝트 아이디어 (최대 500자)"
                rows={3}
                className="input-field resize-none"
              />
            )}
          </div>

          <div className="bg-aing-card border border-aing-border rounded-2xl p-5">
            <h3 className="text-xs font-semibold text-aing-muted uppercase tracking-wider mb-3">비공개 연락처</h3>
            <div className="space-y-3">
              <input value={form.contact_info} onChange={(e) => setForm({ ...form, contact_info: e.target.value })} maxLength={160} placeholder="연락수단 링크 또는 ID" className="input-field" />
              <input type="email" value={form.contact_email} onChange={(e) => setForm({ ...form, contact_email: e.target.value })} placeholder="연락용 이메일" className="input-field" />
            </div>
          </div>

          <button
            onClick={handleSave}
            disabled={saving}
            className="w-full bg-aing-blue text-white rounded-xl py-3 text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2"
          >
            <Save size={14} />
            {saving ? '저장 중...' : '저장하기'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default MemberProfilePage;
