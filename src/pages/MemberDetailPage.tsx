import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Github, Mail, MessageCircle, Users, ChevronLeft, Pencil } from 'lucide-react';
import { supabase, Member } from '../lib/supabase';

const TRACK_LABELS: Record<string, string> = {
  junior: 'Junior',
  senior: 'Senior',
  admin: 'Admin',
};

const TRACK_COLORS: Record<string, string> = {
  junior: 'text-aing-blue border-blue-200 bg-aing-blue-light',
  senior: 'text-purple-500 border-purple-200 bg-purple-50',
  admin: 'text-green-500 border-green-200 bg-green-50',
};

const STATUS_LABELS: Record<string, string> = {
  active: '활동중',
  busy: '바쁨',
  open: '팀원 구함',
};

const STATUS_COLORS: Record<string, string> = {
  active: 'bg-green-100 text-green-700 border-green-200',
  busy: 'bg-red-100 text-red-700 border-red-200',
  open: 'bg-blue-100 text-blue-700 border-blue-200',
};

const WORKLOAD_COLORS = [
  'bg-green-400',
  'bg-green-400',
  'bg-yellow-400',
  'bg-yellow-400',
  'bg-orange-400',
  'bg-red-400',
];

const WORKLOAD_LABELS = ['여유', '여유', '보통', '보통', '바쁨', '매우 바쁨'];

const MemberDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [member, setMember] = useState<Member | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    const fetchMember = async () => {
      if (!id) return;
      try {
        const { data, error } = await supabase
          .from('members')
          .select('*')
          .eq('id', id)
          .single();
        if (error || !data) {
          setNotFound(true);
        } else {
          setMember(data);
        }
      } catch {
        setNotFound(true);
      } finally {
        setLoading(false);
      }
    };
    fetchMember();
  }, [id]);

  const getInitials = (name: string) =>
    name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2);

  if (loading) {
    return (
      <div className="min-h-screen bg-aing-bg pt-20 flex items-center justify-center">
        <div className="text-aing-muted text-sm">불러오는 중...</div>
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

  const workload = member.workload ?? 0;
  const status = member.status ?? 'active';

  return (
    <div className="min-h-screen bg-aing-bg pt-20">
      <div className="max-w-2xl mx-auto px-6 py-12">
        {/* Back */}
        <Link
          to="/members"
          className="inline-flex items-center gap-1 text-aing-muted hover:text-aing-text text-sm mb-8 transition-colors"
        >
          <ChevronLeft size={14} />
          멤버 목록
        </Link>

        {/* Card */}
        <div className="bg-aing-card border border-aing-border rounded-2xl p-8">
          {/* Header */}
          <div className="flex items-start gap-5 mb-8">
            {member.avatar_url ? (
              <img
                src={member.avatar_url}
                alt={member.name}
                className="w-20 h-20 rounded-2xl object-cover border border-aing-border"
              />
            ) : (
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-100 to-purple-100 border border-aing-border flex items-center justify-center shrink-0">
                <span className="text-aing-text font-semibold text-2xl">
                  {getInitials(member.name)}
                </span>
              </div>
            )}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap mb-1">
                <h1 className="text-xl font-bold text-aing-text">{member.name}</h1>
                {member.looking_for_team && (
                  <span className="text-xs px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 border border-blue-200 font-medium flex items-center gap-1">
                    <Users size={10} />
                    팀원 구하는 중
                  </span>
                )}
              </div>
              <p className="text-aing-muted text-sm mb-3">{member.role}</p>
              <div className="flex flex-wrap gap-2">
                <span className={`text-xs px-2 py-0.5 rounded-full border font-mono ${TRACK_COLORS[member.track]}`}>
                  {TRACK_LABELS[member.track]}
                </span>
                <span className="text-xs px-2 py-0.5 rounded-full border border-aing-border text-aing-muted font-mono">
                  {member.semester}
                </span>
                <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${STATUS_COLORS[status]}`}>
                  {STATUS_LABELS[status]}
                </span>
              </div>
            </div>
            <Link
              to={`/members/${member.id}/edit`}
              className="text-aing-muted hover:text-aing-text transition-colors p-1"
              title="프로필 수정"
            >
              <Pencil size={14} />
            </Link>
          </div>

          {/* Bio */}
          {member.bio && (
            <div className="mb-6">
              <h2 className="text-xs font-semibold text-aing-muted uppercase tracking-wider mb-2">소개</h2>
              <p className="text-aing-text text-sm leading-relaxed">{member.bio}</p>
            </div>
          )}

          {/* Interests */}
          {member.interests && member.interests.length > 0 && (
            <div className="mb-6">
              <h2 className="text-xs font-semibold text-aing-muted uppercase tracking-wider mb-2">관심 분야</h2>
              <div className="flex flex-wrap gap-2">
                {member.interests.map((tag, i) => (
                  <span key={i} className="text-xs px-2 py-0.5 rounded-full bg-blue-50 text-aing-blue border border-blue-200">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Skills */}
          {member.skills && member.skills.length > 0 && (
            <div className="mb-6">
              <h2 className="text-xs font-semibold text-aing-muted uppercase tracking-wider mb-2">기술 스택</h2>
              <div className="flex flex-wrap gap-2">
                {member.skills.map((tag, i) => (
                  <span key={i} className="text-xs px-2 py-0.5 rounded-full bg-purple-50 text-purple-600 border border-purple-200">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Workload */}
          <div className="mb-6">
            <h2 className="text-xs font-semibold text-aing-muted uppercase tracking-wider mb-2">
              업무 포화도 — {WORKLOAD_LABELS[workload]}
            </h2>
            <div className="flex gap-1">
              {[...Array(5)].map((_, i) => (
                <div
                  key={i}
                  className={`h-2 flex-1 rounded-full transition-all ${
                    i < workload ? WORKLOAD_COLORS[workload] : 'bg-aing-border'
                  }`}
                />
              ))}
            </div>
          </div>

          {/* Project Idea */}
          {member.looking_for_team && member.project_idea && (
            <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-xl">
              <h2 className="text-xs font-semibold text-blue-600 uppercase tracking-wider mb-2">프로젝트 아이디어</h2>
              <p className="text-aing-text text-sm leading-relaxed">{member.project_idea}</p>
            </div>
          )}

          {/* Links */}
          <div className="flex flex-wrap gap-4 pt-4 border-t border-aing-border">
            {member.github && (
              <a
                href={member.github}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1.5 text-sm text-aing-muted hover:text-aing-text transition-colors"
              >
                <Github size={14} />
                GitHub
              </a>
            )}
            {member.contact_kakao && (
              <a
                href={member.contact_kakao}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1.5 text-sm text-aing-muted hover:text-yellow-600 transition-colors"
              >
                <MessageCircle size={14} />
                KakaoTalk
              </a>
            )}
            {member.contact_email && (
              <a
                href={`mailto:${member.contact_email}`}
                className="flex items-center gap-1.5 text-sm text-aing-muted hover:text-aing-text transition-colors"
              >
                <Mail size={14} />
                {member.contact_email}
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MemberDetailPage;
