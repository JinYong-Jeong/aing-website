import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Calendar, BookOpen, Code2, Users, Trophy, Github, ExternalLink } from 'lucide-react';
import AnimatedSection from '../components/AnimatedSection';
import { supabase, Activity } from '../lib/supabase';

const TYPE_CONFIG: Record<string, { icon: React.ElementType; color: string; bg: string; label: string }> = {
  study:       { icon: BookOpen, color: 'text-aing-blue',  bg: 'border-blue-200 bg-aing-blue-light',  label: 'Study' },
  project:     { icon: Code2,   color: 'text-purple-500', bg: 'border-purple-200 bg-purple-50',       label: 'Project' },
  competition: { icon: Trophy,  color: 'text-amber-500',  bg: 'border-amber-200 bg-amber-50',         label: 'Competition' },
  seminar:     { icon: Users,   color: 'text-green-500',  bg: 'border-green-200 bg-green-50',         label: 'Seminar' },
};

const STATUS_COLORS: Record<string, string> = {
  ongoing: 'text-green-500', completed: 'text-aing-muted', upcoming: 'text-yellow-500',
};
const STATUS_LABELS: Record<string, string> = {
  ongoing: '진행 중', completed: '완료', upcoming: '예정',
};

function formatDate(d?: string) {
  if (!d) return '';
  return new Date(d).toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric' });
}

const ActivityDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [activity, setActivity] = useState<Activity | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      if (!id) { setLoading(false); return; }
      try {
        const { data, error } = await supabase
          .from('activities')
          .select('*')
          .eq('id', id)
          .single();
        if (data && !error) {
          setActivity(data as Activity);
          setLoading(false);
          return;
        }
      } catch { /* fall through */ }
      setLoading(false);
    };
    load();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-aing-bg pt-20 flex items-center justify-center">
        <div className="space-y-4 w-full max-w-2xl px-6">
          {[...Array(4)].map((_, i) => <div key={i} className="card animate-pulse h-16" />)}
        </div>
      </div>
    );
  }

  if (!activity) {
    return (
      <div className="min-h-screen bg-aing-bg pt-20 flex items-center justify-center">
        <div className="text-center">
          <div className="text-5xl font-bold text-gradient mb-4">404</div>
          <p className="text-aing-muted mb-6">활동을 찾을 수 없습니다.</p>
          <Link to="/activities" className="btn-primary text-sm">활동 목록으로</Link>
        </div>
      </div>
    );
  }

  const cfg = TYPE_CONFIG[activity.type] || TYPE_CONFIG.study;
  const Icon = cfg.icon;
  const startFmt = formatDate(activity.start_date);
  const endFmt = formatDate(activity.end_date);

  return (
    <div className="min-h-screen bg-aing-bg pt-20">
      {/* Back */}
      <div className="px-6 pt-8 max-w-3xl mx-auto">
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-2 text-sm text-aing-muted hover:text-aing-text transition-colors mb-8"
        >
          <ArrowLeft size={14} />
          활동 목록으로
        </button>
      </div>

      {/* Header */}
      <section className="px-6 pb-10 border-b border-aing-border">
        <div className="max-w-3xl mx-auto">
          <AnimatedSection>
            {/* Type + Status */}
            <div className="flex items-center gap-3 mb-5 flex-wrap">
              <span className={`inline-flex items-center gap-1.5 text-xs px-3 py-1 rounded-full border font-mono ${cfg.color} ${cfg.bg}`}>
                <Icon size={11} />
                {cfg.label}
              </span>
              <span className={`text-xs font-mono flex items-center gap-1 ${STATUS_COLORS[activity.status] || 'text-aing-muted'}`}>
                <span className="w-1.5 h-1.5 rounded-full bg-current" />
                {STATUS_LABELS[activity.status] || activity.status}
              </span>
              <span className="text-xs text-aing-muted font-mono">{activity.semester}</span>
            </div>

            <h1 className="text-3xl font-bold text-aing-text mb-4">{activity.title}</h1>

            {activity.description && (
              <p className="text-aing-muted leading-relaxed text-base">{activity.description}</p>
            )}
          </AnimatedSection>
        </div>
      </section>

      {/* Body */}
      <section className="py-12 px-6">
        <div className="max-w-3xl mx-auto space-y-6">

          {/* Image */}
          {activity.image_url && (
            <AnimatedSection>
              <div className="card p-0 overflow-hidden">
                <img
                  src={activity.image_url}
                  alt={activity.title}
                  className="w-full max-h-80 object-cover"
                />
              </div>
            </AnimatedSection>
          )}

          {/* Meta info card */}
          <AnimatedSection>
            <div className="card space-y-4">
              {/* Date range */}
              {(startFmt || endFmt) && (
                <div className="flex items-start gap-3">
                  <Calendar size={15} className="text-aing-muted mt-0.5 shrink-0" />
                  <div>
                    <p className="text-xs text-aing-muted mb-1 font-mono">기간</p>
                    <p className="text-sm text-aing-text">
                      {startFmt && endFmt ? `${startFmt} ~ ${endFmt}` : startFmt || endFmt}
                    </p>
                  </div>
                </div>
              )}

              {/* Participants */}
              {activity.participants && (
                <div className="flex items-start gap-3">
                  <Users size={15} className="text-aing-muted mt-0.5 shrink-0" />
                  <div>
                    <p className="text-xs text-aing-muted mb-1 font-mono">팀 구성</p>
                    <p className="text-sm text-aing-text">{activity.participants}인팀</p>
                  </div>
                </div>
              )}

              {/* Result */}
              {activity.result && (
                <div className="flex items-start gap-3">
                  <Trophy size={15} className="text-amber-500 mt-0.5 shrink-0" />
                  <div>
                    <p className="text-xs text-aing-muted mb-1 font-mono">결과</p>
                    <div className="inline-flex items-center gap-1.5 text-sm px-3 py-1 rounded-lg bg-amber-50 border border-amber-200 text-amber-700 font-medium">
                      <Trophy size={12} />
                      {activity.result}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </AnimatedSection>

          {/* Tags */}
          {activity.tags && activity.tags.length > 0 && (
            <AnimatedSection>
              <div className="card">
                <p className="text-xs text-aing-muted font-mono mb-3">태그</p>
                <div className="flex flex-wrap gap-2">
                  {activity.tags.map(tag => (
                    <span key={tag} className="tag">#{tag}</span>
                  ))}
                </div>
              </div>
            </AnimatedSection>
          )}

          {/* Links */}
          {(activity.github || activity.detail_url) && (
            <AnimatedSection>
              <div className="card flex flex-wrap gap-3">
                {activity.detail_url && (
                  <a
                    href={activity.detail_url}
                    target="_blank"
                    rel="noreferrer"
                    className={`inline-flex items-center gap-2 text-sm font-medium px-4 py-2 rounded-lg border transition-colors ${
                      activity.type === 'competition'
                        ? 'bg-amber-500 text-white border-amber-500 hover:bg-amber-600'
                        : 'btn-primary'
                    }`}
                  >
                    {activity.type === 'competition' ? '대회 보기' : '자세히 보기'}
                    <ExternalLink size={13} />
                  </a>
                )}
                {activity.github && (
                  <a
                    href={activity.github}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 text-sm btn-ghost"
                  >
                    <Github size={14} />
                    GitHub 보기
                  </a>
                )}
              </div>
            </AnimatedSection>
          )}
        </div>
      </section>
    </div>
  );
};

export default ActivityDetailPage;
