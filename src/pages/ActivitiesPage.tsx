import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, BookOpen, Code2, Users2, ArrowRight, Github } from 'lucide-react';
import AnimatedSection from '../components/AnimatedSection';

const activities = [
  {
    semester: '2026 Spring',
    items: [
      {
        type: 'study',
        title: 'ResNet Study',
        desc: 'ResNet-50 논문 분석 및 PyTorch 구현',
        tags: ['CV', 'ResNet', 'PyTorch'],
        github: 'https://github.com/aing-gachon/26-Spring-ResNet-Study',
        status: 'ongoing',
      },
      {
        type: 'study',
        title: 'Transformer Study',
        desc: 'Attention is All You Need 구현',
        tags: ['NLP', 'Transformer', 'Attention'],
        github: 'https://github.com/aing-gachon/26-Spring-Transformer-Study',
        status: 'ongoing',
      },
      {
        type: 'project',
        title: 'Senior Session',
        desc: 'CV/NLP/RL 팀별 SOTA 모델 커스터마이징',
        tags: ['Senior', 'Project', 'Research'],
        github: 'https://github.com/aing-gachon/26-Spring-Senior-Session',
        status: 'ongoing',
      },
    ],
  },
];

const TYPE_COLORS: Record<string, string> = {
  study: 'text-aing-blue border-aing-blue/30 bg-aing-blue/10',
  project: 'text-purple-400 border-purple-400/30 bg-purple-400/10',
  event: 'text-green-400 border-green-400/30 bg-green-400/10',
};

const STATUS_COLORS: Record<string, string> = {
  ongoing: 'text-green-400',
  completed: 'text-aing-muted',
  upcoming: 'text-yellow-400',
};

const ActivitiesPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-aing-black pt-20">
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
              { icon: Code2, label: 'Projects', desc: 'SOTA 모델 커스터마이징', color: 'text-purple-400' },
              { icon: Users2, label: 'Seminars', desc: '지식 공유 & 발표', color: 'text-green-400' },
              { icon: Calendar, label: 'Sessions', desc: '정기 모임 및 코드 리뷰', color: 'text-orange-400' },
            ].map((item, i) => (
              <AnimatedSection key={item.label} delay={i * 100}>
                <div className="card text-center group">
                  <item.icon size={24} className={`${item.color} mx-auto mb-3`} />
                  <h3 className="text-sm font-semibold text-aing-white mb-1">{item.label}</h3>
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
                  <h2 className="text-2xl font-semibold text-aing-white">{semester.semester}</h2>
                  <div className="flex-1 gradient-line" />
                </div>
              </AnimatedSection>

              <div className="grid md:grid-cols-3 gap-6">
                {semester.items.map((item, i) => (
                  <AnimatedSection key={item.title} delay={i * 150}>
                    <div className="card group h-full flex flex-col">
                      {/* Header */}
                      <div className="flex items-start justify-between mb-4">
                        <span className={`text-xs px-2 py-0.5 rounded-full border font-mono ${TYPE_COLORS[item.type]}`}>
                          {item.type}
                        </span>
                        <span className={`text-xs font-mono flex items-center gap-1 ${STATUS_COLORS[item.status]}`}>
                          <span className="w-1.5 h-1.5 rounded-full bg-current" />
                          {item.status}
                        </span>
                      </div>

                      <h3 className="text-base font-semibold text-aing-white mb-2">{item.title}</h3>
                      <p className="text-aing-muted text-sm mb-4 leading-relaxed flex-1">{item.desc}</p>

                      {/* Tags */}
                      <div className="flex flex-wrap gap-2 mb-4">
                        {item.tags.map(tag => (
                          <span key={tag} className="tag">{tag}</span>
                        ))}
                      </div>

                      {/* GitHub link */}
                      {item.github && (
                        <a
                          href={item.github}
                          target="_blank"
                          rel="noreferrer"
                          className="flex items-center gap-2 text-xs text-aing-muted hover:text-aing-white transition-colors mt-auto"
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
        </div>
      </section>
    </div>
  );
};

export default ActivitiesPage;
