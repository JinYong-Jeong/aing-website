import React, { useEffect, useState } from 'react';
import { Calendar, BookOpen, Code2, Users, Trophy, Filter } from 'lucide-react';
import AnimatedSection from '../components/AnimatedSection';
import { supabase, Activity } from '../lib/supabase';

type FilterType = 'all' | 'study' | 'project' | 'competition' | 'seminar';

const TYPE_CONFIG: Record<string, { icon: React.ElementType; color: string; bg: string; label: string }> = {
  study:       { icon: BookOpen, color: 'text-aing-blue',  bg: 'border-blue-200 bg-aing-blue-light', label: 'Study' },
  project:     { icon: Code2,   color: 'text-purple-500', bg: 'border-purple-200 bg-purple-50',      label: 'Project' },
  competition: { icon: Trophy,  color: 'text-amber-500',  bg: 'border-amber-200 bg-amber-50',        label: 'Competition' },
  seminar:     { icon: Users,   color: 'text-green-500',  bg: 'border-green-200 bg-green-50',        label: 'Seminar' },
};

const STATUS_COLORS: Record<string, string> = {
  ongoing: 'text-green-500', completed: 'text-aing-muted', upcoming: 'text-yellow-500',
};
const STATUS_LABELS: Record<string, string> = {
  ongoing: '진행 중', completed: '완료', upcoming: '예정',
};

const hardcodedFallback: Activity[] = [
  { id: '1', type: 'study', title: 'ResNet Study', description: 'ResNet-50 논문 분석 및 PyTorch 구현', tags: ['CV', 'ResNet', 'PyTorch'], github: 'https://github.com/aing-gachon/26-Spring-ResNet-Study', status: 'ongoing', semester: '2026 Spring' },
  { id: '2', type: 'study', title: 'Transformer Study', description: 'Attention is All You Need 구현', tags: ['NLP', 'Transformer'], github: 'https://github.com/aing-gachon/26-Spring-Transformer-Study', status: 'ongoing', semester: '2026 Spring' },
  { id: '3', type: 'project', title: 'Senior Session', description: 'CV/NLP/RL 팀별 SOTA 모델 커스터마이징', tags: ['Senior', 'Project'], github: 'https://github.com/aing-gachon/26-Spring-Senior-Session', status: 'ongoing', semester: '2026 Spring' },
  { id: 'test-study-1', type: 'study', title: '[TEST] Test Study', description: 'test', tags: ['test'], status: 'ongoing', semester: '2026 Spring' },
  { id: 'test-project-1', type: 'project', title: '[TEST] Test Project', description: 'test', tags: ['test'], status: 'ongoing', semester: '2026 Spring' },
  { id: 'test-competition-1', type: 'competition', title: '[TEST] Test Competition', description: 'test', tags: ['test'], status: 'ongoing', semester: '2026 Spring', result: 'test', participants: 2, start_date: '2026-03-01', end_date: '2026-03-31' },
  { id: 'test-seminar-1', type: 'seminar', title: '[TEST] Test Seminar', description: 'test', tags: ['test'], status: 'ongoing', semester: '2026 Spring' },
];

function formatDate(d?: string) {
  if (!d) return '';
  return new Date(d).toLocaleDateString('ko-KR', { year: 'numeric', month: 'short', day: 'numeric' });
}
function formatDateRange(start?: string, end?: string) {
  if (!start && !end) return null;
  if (start && end) return `${formatDate(start)} ~ ${formatDate(end)}`;
  if (start) return `${formatDate(start)} ~`;
  return `~ ${formatDate(end!)}`;
}

const FILTER_OPTIONS: { value: FilterType; label: string; icon: React.ElementType }[] = [
  { value: 'all',         label: 'All',         icon: Filter },
  { value: 'study',       label: 'Study',       icon: BookOpen },
  { value: 'project',     label: 'Project',     icon: Code2 },
  { value: 'competition', label: 'Competition', icon: Trophy },
  { value: 'seminar',     label: 'Seminar',     icon: Users },
];

const DOT_COLORS: Record<string, string> = {
  study: 'bg-aing-blue', project: 'bg-purple-500', competition: 'bg-amber-500', seminar: 'bg-green-500',
};

const HistoryPage: React.FC = () => {
  const [activities, setActivities] = useState<Activity[]>(hardcodedFallback);
  const [filter, setFilter] = useState<FilterType>('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const { data } = await supabase
          .from('activities')
          .select('*')
          .order('created_at', { ascending: false });
        if (data && data.length > 0) setActivities(data as Activity[]);
      } catch { /* use fallback */ }
      setLoading(false);
    };
    load();
  }, []);

  const filtered = filter === 'all' ? activities : activities.filter(a => a.type === filter);

  // Group by semester, newest first
  const grouped: Record<string, Activity[]> = {};
  filtered.forEach(a => {
    if (!grouped[a.semester]) grouped[a.semester] = [];
    grouped[a.semester].push(a);
  });
  const semesters = Object.keys(grouped).sort((a, b) => b.localeCompare(a));

  return (
    <div className="min-h-screen bg-aing-bg pt-20">
      {/* Header */}
      <section className="py-20 px-6 border-b border-aing-border">
        <div className="max-w-4xl mx-auto">
          <AnimatedSection>
            <div className="inline-flex items-center gap-2 tag-blue mb-6">
              <Calendar size={12} />
              <span>History</span>
            </div>
            <h1 className="section-title text-5xl mb-4">
              <span className="text-gradient">활동 히스토리</span>
            </h1>
            <p className="section-subtitle max-w-xl">
              A.ing의 모든 학기 활동을 타임라인으로 확인하세요.
            </p>
          </AnimatedSection>
        </div>
      </section>

      {/* Filter Bar */}
      <section className="py-4 px-6 border-b border-aing-border sticky top-16 z-30 glass">
        <div className="max-w-4xl mx-auto flex items-center gap-2 overflow-x-auto">
          {FILTER_OPTIONS.map(opt => {
            const Icon = opt.icon;
            return (
              <button
                key={opt.value}
                onClick={() => setFilter(opt.value)}
                className={`shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                  filter === opt.value
                    ? 'bg-aing-dark text-white'
                    : 'border border-aing-border text-aing-muted hover:border-aing-blue hover:text-aing-blue'
                }`}
              >
                <Icon size={12} />
                {opt.label}
              </button>
            );
          })}
        </div>
      </section>

      {/* Timeline */}
      <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto">
          {loading ? (
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => <div key={i} className="card animate-pulse h-20" />)}
            </div>
          ) : semesters.length === 0 ? (
            <div className="card border-dashed text-center py-20">
              <Calendar size={32} className="text-aing-muted mx-auto mb-4 opacity-40" />
              <p className="text-aing-muted text-sm">활동 기록이 없습니다.</p>
            </div>
          ) : (
            semesters.map((semester, si) => (
              <AnimatedSection key={semester} delay={si * 100}>
                <div className="mb-16">
                  {/* Semester header */}
                  <div className="flex items-center gap-3 mb-8">
                    <div className="w-3 h-3 rounded-full bg-aing-blue shrink-0" />
                    <h2 className="text-xl font-semibold text-aing-text">{semester}</h2>
                    <div className="flex-1 gradient-line" />
                    <span className="text-xs text-aing-muted font-mono">{grouped[semester].length}개</span>
                  </div>

                  {/* Timeline entries */}
                  <div className="ml-6 border-l-2 border-aing-border space-y-0">
                    {grouped[semester].map((item, i) => {
                      const cfg = TYPE_CONFIG[item.type] || TYPE_CONFIG.study;
                      const Icon = cfg.icon;
                      const dateRange = formatDateRange(item.start_date, item.end_date);

                      return (
                        <AnimatedSection key={item.id} delay={i * 80}>
                          <div className="relative pl-8 pb-6">
                            {/* Timeline dot */}
                            <div className={`absolute -left-[9px] top-1 w-4 h-4 rounded-full border-2 border-white ${DOT_COLORS[item.type] || 'bg-aing-muted'} shadow-sm`} />

                            <div className="card hover:border-aing-border transition-colors">
                              <div className="flex items-start justify-between gap-3 flex-wrap">
                                <div className="flex items-center gap-2 flex-wrap">
                                  <span className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full border font-mono ${cfg.color} ${cfg.bg}`}>
                                    <Icon size={10} />
                                    {cfg.label}
                                  </span>
                                  <span className={`text-xs font-mono flex items-center gap-1 ${STATUS_COLORS[item.status] || ''}`}>
                                    <span className="w-1.5 h-1.5 rounded-full bg-current" />
                                    {STATUS_LABELS[item.status] || item.status}
                                  </span>
                                </div>
                                {dateRange && (
                                  <span className="text-xs text-aing-muted font-mono flex items-center gap-1">
                                    <Calendar size={10} />
                                    {dateRange}
                                  </span>
                                )}
                              </div>

                              <h3 className="text-sm font-semibold text-aing-text mt-3 mb-1">{item.title}</h3>

                              {item.description && (
                                <p className="text-xs text-aing-muted mb-2 leading-relaxed">{item.description}</p>
                              )}

                              {/* Result badge */}
                              {item.result && (
                                <div className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-lg bg-amber-50 border border-amber-200 text-amber-600 font-medium mb-2">
                                  <Trophy size={10} />
                                  {item.result}
                                </div>
                              )}

                              {/* Tags */}
                              {item.tags && item.tags.length > 0 && (
                                <div className="flex flex-wrap gap-1 mt-2">
                                  {item.tags.map(tag => (
                                    <span key={tag} className="tag text-xs">#{tag}</span>
                                  ))}
                                </div>
                              )}
                            </div>
                          </div>
                        </AnimatedSection>
                      );
                    })}
                  </div>
                </div>
              </AnimatedSection>
            ))
          )}
        </div>
      </section>
    </div>
  );
};

export default HistoryPage;
