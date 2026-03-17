import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, BookOpen, Code2, Users2, ArrowRight, Github } from 'lucide-react';
import AnimatedSection from '../components/AnimatedSection';
import { supabase } from '../lib/supabase';

type Activity = {
  id: string;
  semester: string;
  title: string;
  type: string;
  description: string;
  tags: string[];
  github: string;
  status: string;
};

type GroupedActivities = {
  semester: string;
  items: Activity[];
};

const hardcodedFallback: GroupedActivities[] = [
  {
    semester: '2026 Spring',
    items: [
      {
        id: '1',
        type: 'study',
        title: 'ResNet Study',
        description: 'ResNet-50 논문 분석 및 PyTorch 구현',
        tags: ['CV', 'ResNet', 'PyTorch'],
        github: 'https://github.com/aing-gachon/26-Spring-ResNet-Study',
        status: 'ongoing',
        semester: '2026 Spring',
      },
      {
        id: '2',
        type: 'study',
        title: 'Transformer Study',
        description: 'Attention is All You Need 구현',
        tags: ['NLP', 'Transformer', 'Attention'],
        github: 'https://github.com/aing-gachon/26-Spring-Transformer-Study',
        status: 'ongoing',
        semester: '2026 Spring',
      },
      {
        id: '3',
        type: 'project',
        title: 'Senior Session',
        description: 'CV/NLP/RL 팀별 SOTA 모델 커스터마이징',
        tags: ['Senior', 'Project', 'Research'],
        github: 'https://github.com/aing-gachon/26-Spring-Senior-Session',
        status: 'ongoing',
        semester: '2026 Spring',
      },
    ],
  },
];

const TYPE_COLORS: Record<string, string> = {
  study: 'text-aing-blue border-blue-200 bg-aing-blue-light',
  project: 'text-purple-500 border-purple-200 bg-purple-50',
  event: 'text-green-500 border-green-200 bg-green-50',
};

const STATUS_COLORS: Record<string, string> = {
  ongoing: 'text-green-500',
  completed: 'text-aing-muted',
  upcoming: 'text-yellow-500',
};

function groupBySemester(data: Activity[]): GroupedActivities[] {
  const map: Record<string, Activity[]> = {};
  data.forEach(a => {
    if (!map[a.semester]) map[a.semester] = [];
    map[a.semester].push(a);
  });
  return Object.entries(map).map(([semester, items]) => ({ semester, items }));
}

const ActivitiesPage: React.FC = () => {
  const [activities, setActivities] = useState<GroupedActivities[]>(hardcodedFallback);

  useEffect(() => {
    const loadActivities = async () => {
      const { data } = await supabase
        .from('activities')
        .select('*')
        .order('created_at', { ascending: false });
      if (data && data.length > 0) {
        setActivities(groupBySemester(data as Activity[]));
      } else {
        setActivities(hardcodedFallback);
      }
    };
    loadActivities();
  }, []);

  return (
    <div className="min-h-screen bg-aing-bg pt-20">
      {/* Header */}
      <section className="py-20 px-6 border-b border-aing-border">
        <div className="max-w-4xl mx-auto">
          <AnimatedSection>
            <div className="inline-flex items-center gap-2 tag-blue mb-6">
              <BookOpen size={12} />
              <span>Activities</span>
            </div>
            <h1 className="section-title text-5xl mb-4">
              <span className="text-gradient">What We Do</span>
            </h1>
            <p className="section-subtitle max-w-xl">
              매 학기 진행되는 스터디, 프로젝트, 세미나 활동을 기록합니다.
            </p>
          </AnimatedSection>
        </div>
      </section>

      {/* Overview Cards */}
      <section className="py-16 px-6 border-b border-aing-border">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { icon: BookOpen, label: 'Weekly Study', desc: '논문 리딩 & 코드 구현', color: 'text-aing-blue' },
              { icon: Code2, label: 'Projects', desc: 'SOTA 모델 커스터마이징', color: 'text-purple-500' },
              { icon: Users2, label: 'Seminars', desc: '지식 공유 & 발표', color: 'text-green-500' },
              { icon: Calendar, label: 'Sessions', desc: '정기 모임 및 코드 리뷰', color: 'text-orange-500' },
            ].map((item, i) => (
              <AnimatedSection key={item.label} delay={i * 100}>
                <div className="card text-center group">
                  <item.icon size={24} className={`${item.color} mx-auto mb-3`} />
                  <h3 className="text-sm font-semibold text-aing-text mb-1">{item.label}</h3>
                  <p className="text-xs text-aing-muted">{item.desc}</p>
                </div>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* Activities Timeline */}
      <section className="py-24 px-6">
        <div className="max-w-6xl mx-auto">
          {activities.map(semester => (
            <div key={semester.semester} className="mb-20">
              <AnimatedSection>
                <div className="flex items-center gap-4 mb-10">
                  <h2 className="text-2xl font-semibold text-aing-text">{semester.semester}</h2>
                  <div className="flex-1 gradient-line" />
                </div>
              </AnimatedSection>

              <div className="grid md:grid-cols-3 gap-6">
                {semester.items.map((item, i) => (
                  <AnimatedSection key={item.id || item.title} delay={i * 150}>
                    <div className="card group h-full flex flex-col">
                      {/* Header */}
                      <div className="flex items-start justify-between mb-4">
                        <span className={`text-xs px-2 py-0.5 rounded-full border font-mono ${TYPE_COLORS[item.type] || ''}`}>
                          {item.type}
                        </span>
                        <span className={`text-xs font-mono flex items-center gap-1 ${STATUS_COLORS[item.status] || 'text-aing-muted'}`}>
                          <span className="w-1.5 h-1.5 rounded-full bg-current" />
                          {item.status}
                        </span>
                      </div>

                      <h3 className="text-base font-semibold text-aing-text mb-2">{item.title}</h3>
                      <p className="text-aing-muted text-sm mb-4 leading-relaxed flex-1">{item.description}</p>

                      {/* Tags */}
                      <div className="flex flex-wrap gap-2 mb-4">
                        {(item.tags || []).map(tag => (
                          <span key={tag} className="tag">{tag}</span>
                        ))}
                      </div>

                      {/* GitHub link */}
                      {item.github && (
                        <a
                          href={item.github}
                          target="_blank"
                          rel="noreferrer"
                          className="flex items-center gap-2 text-xs text-aing-muted hover:text-aing-text transition-colors mt-auto"
                        >
                          <Github size={12} />
                          View on GitHub
                          <ArrowRight size={10} />
                        </a>
                      )}
                    </div>
                  </AnimatedSection>
                ))}
              </div>
            </div>
          ))}

          {/* Empty future */}
          <AnimatedSection>
            <div className="card border-dashed text-center py-16">
              <Calendar size={32} className="text-aing-muted mx-auto mb-4 opacity-40" />
              <p className="text-aing-muted text-sm">다음 활동이 추가될 예정입니다.</p>
            </div>
          </AnimatedSection>

          {/* Link to full project history */}
          <AnimatedSection>
            <div className="mt-12 text-center">
              <p className="text-aing-muted text-sm mb-4">더 많은 프로젝트와 스터디 기록을 확인하세요.</p>
              <Link
                to="/projects"
                className="btn-primary inline-flex items-center gap-2 text-sm"
              >
                <Code2 size={14} />
                프로젝트 전체 히스토리 보기
                <ArrowRight size={14} />
              </Link>
            </div>
          </AnimatedSection>
        </div>
      </section>
    </div>
  );
};

export default ActivitiesPage;
