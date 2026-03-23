import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Brain, Code, ChevronDown, Sparkles } from 'lucide-react';
import AnimatedSection from '../components/AnimatedSection';
import { useSiteSettings } from '../context/SiteSettingsContext';

const tracks = [
  {
    id: 'junior',
    label: 'Junior Track',
    tag: 'Foundation',
    desc: '기초 논문의 수식을 코드로 매핑하며 딥러닝 파이프라인을 직접 체화합니다. 이론과 구현의 간극을 좁히는 과정.',
    icon: Brain,
    accent: '#3B82F6',
    accentLight: 'rgba(59,130,246,0.08)',
    accentBorder: 'rgba(59,130,246,0.2)',
    tagBg: 'rgba(59,130,246,0.1)',
    tagColor: '#3B82F6',
    gradient: 'linear-gradient(135deg, rgba(59,130,246,0.06) 0%, rgba(255,255,255,0) 100%)',
  },
  {
    id: 'senior',
    label: 'Senior Track',
    tag: 'Applied',
    desc: '특정 도메인의 SOTA 모델을 기반으로 커스텀 모델을 설계하고 실전 역량을 강화합니다. 포트폴리오 구축 중심.',
    icon: Code,
    accent: '#8B5CF6',
    accentLight: 'rgba(139,92,246,0.08)',
    accentBorder: 'rgba(139,92,246,0.2)',
    tagBg: 'rgba(139,92,246,0.1)',
    tagColor: '#8B5CF6',
    gradient: 'linear-gradient(135deg, rgba(139,92,246,0.06) 0%, rgba(255,255,255,0) 100%)',
  },
];

const HomePage: React.FC = () => {
  const s = useSiteSettings();
  const heroTitle = s.home_hero_title || 'Theory to Code.';
  const heroSubtitle = s.home_hero_subtitle || '';
  const recruitUrl = s.recruit_url || '/contact';
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouse = (e: MouseEvent) => {
      setMousePos({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener('mousemove', handleMouse);
    return () => window.removeEventListener('mousemove', handleMouse);
  }, []);

  return (
    <div className="min-h-screen bg-aing-bg">
      {/* ─── Hero ─── */}
      <section className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden px-6">
        <div
          className="absolute inset-0 bg-grid-pattern bg-grid opacity-100"
          style={{
            maskImage: 'radial-gradient(ellipse 80% 80% at 50% 50%, black 40%, transparent 100%)',
            WebkitMaskImage: 'radial-gradient(ellipse 80% 80% at 50% 50%, black 40%, transparent 100%)',
          }}
        />
        <div
          className="pointer-events-none absolute inset-0 transition-opacity duration-300"
          style={{
            background: `radial-gradient(600px circle at ${mousePos.x}px ${mousePos.y}px, rgba(59,130,246,0.05), transparent 40%)`,
          }}
        />
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full opacity-5"
          style={{ background: 'radial-gradient(circle, #3B82F6 0%, transparent 70%)' }}
        />

        <div className="relative z-10 max-w-4xl mx-auto text-center">
          <div className="flex justify-center mb-8">
            <img src="/logo.png" alt="A.ing" className="h-24 md:h-32 w-auto drop-shadow-lg" />
          </div>

          <h1 className="text-4xl md:text-6xl lg:text-7xl font-semibold tracking-tight mb-6 leading-tight">
            <span className="text-gradient">{heroTitle}</span>
            <br />
            <span className="text-aing-muted">Code to Insight.</span>
          </h1>
          {heroSubtitle && <p className="text-aing-muted text-lg mt-2">{heroSubtitle}</p>}

          <p className="text-aing-muted text-lg md:text-xl max-w-2xl mx-auto mb-12 leading-relaxed">
            인공지능의 이론적 토대를 견고히 다지고,<br className="hidden md:block" />
            직접 구현하며 지식을 체화하는 학부생 주도 AI 학술 동아리.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to={recruitUrl} className="btn-primary flex items-center gap-2 text-sm">
              Join A.ing <ArrowRight size={16} />
            </Link>
            <Link to="/about" className="btn-ghost text-sm">
              Learn More
            </Link>
          </div>
        </div>

        <a
          href="#tracks"
          className="absolute bottom-8 left-1/2 -translate-x-1/2 text-aing-muted hover:text-aing-text transition-colors animate-bounce"
        >
          <ChevronDown size={20} />
        </a>
      </section>

      {/* ─── Tracks ─── */}
      <section id="tracks" className="py-28 px-6 border-t border-aing-border">
        <div className="max-w-5xl mx-auto">
          <AnimatedSection>
            <div className="text-center mb-20">
              <p className="text-xs font-mono tracking-widest text-aing-muted uppercase mb-3">Study Program</p>
              <h2 className="section-title mb-4">두 가지 트랙</h2>
              <p className="section-subtitle max-w-lg mx-auto">
                수준과 목표에 따라 트랙을 선택합니다.<br />
                두 트랙 모두 논문 읽기와 코드 구현을 중심으로 합니다.
              </p>
            </div>
          </AnimatedSection>

          <div className="grid md:grid-cols-2 gap-5">
            {tracks.map((track, i) => (
              <AnimatedSection key={track.id} delay={i * 150}>
                <div
                  className="relative rounded-2xl p-8 overflow-hidden group cursor-pointer transition-all duration-300"
                  style={{
                    border: `1px solid ${track.accentBorder}`,
                    background: track.gradient,
                    boxShadow: '0 0 0 0 transparent',
                  }}
                  onMouseEnter={e => {
                    (e.currentTarget as HTMLElement).style.boxShadow = `0 8px 32px ${track.accentLight}`;
                    (e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)';
                  }}
                  onMouseLeave={e => {
                    (e.currentTarget as HTMLElement).style.boxShadow = '0 0 0 0 transparent';
                    (e.currentTarget as HTMLElement).style.transform = 'translateY(0)';
                  }}
                >
                  <div className="flex items-center justify-between mb-6">
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center"
                      style={{ background: track.accentLight, border: `1px solid ${track.accentBorder}` }}
                    >
                      <track.icon size={18} style={{ color: track.accent }} />
                    </div>
                    <span
                      className="text-xs font-mono font-medium px-3 py-1 rounded-full"
                      style={{
                        background: track.tagBg,
                        color: track.tagColor,
                        border: `1px solid ${track.accentBorder}`,
                      }}
                    >
                      {track.tag}
                    </span>
                  </div>

                  <h3 className="text-xl font-semibold text-aing-text mb-1">{track.label}</h3>
                  <div className="w-8 h-0.5 rounded-full mb-4" style={{ background: track.accent }} />
                  <p className="text-aing-muted text-sm leading-relaxed mb-8">{track.desc}</p>

                  <Link
                    to="/activities"
                    className="inline-flex items-center gap-1.5 text-xs font-medium transition-colors duration-200"
                    style={{ color: track.accent }}
                  >
                    자세히 보기 <ArrowRight size={12} />
                  </Link>

                  <div
                    className="absolute -right-4 -bottom-4 w-24 h-24 opacity-5 pointer-events-none"
                    style={{ color: track.accent }}
                  >
                    <track.icon size={96} />
                  </div>
                </div>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* ─── CTA Banner ─── */}
      <section className="py-28 px-6">
        <div className="max-w-4xl mx-auto">
          <AnimatedSection>
            <div
              className="relative rounded-3xl overflow-hidden px-8 py-20 text-center"
              style={{
                background: 'linear-gradient(135deg, #0f0f0f 0%, #1a1a2e 50%, #0f172a 100%)',
                border: '1px solid rgba(255,255,255,0.07)',
              }}
            >
              <div
                className="absolute inset-0 bg-grid-pattern bg-grid opacity-20"
                style={{
                  maskImage: 'radial-gradient(ellipse 80% 80% at 50% 50%, black 30%, transparent 100%)',
                  WebkitMaskImage: 'radial-gradient(ellipse 80% 80% at 50% 50%, black 30%, transparent 100%)',
                }}
              />
              <div
                className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-48 opacity-20 pointer-events-none"
                style={{ background: 'radial-gradient(ellipse, #3B82F6 0%, transparent 70%)' }}
              />

              <div className="relative z-10">
                <div
                  className="inline-flex items-center gap-2 text-xs font-mono px-3 py-1.5 rounded-full mb-6"
                  style={{
                    background: 'rgba(59,130,246,0.15)',
                    border: '1px solid rgba(59,130,246,0.3)',
                    color: '#60A5FA',
                  }}
                >
                  <Sparkles size={12} />
                  Recruiting
                </div>

                <h2 className="text-2xl md:text-4xl font-semibold text-white mb-4 leading-tight">
                  함께 성장할 멤버를<br />찾습니다
                </h2>

                <p className="text-gray-400 mb-10 max-w-sm mx-auto text-sm leading-relaxed">
                  AI에 진심인 사람이라면 누구든 환영합니다.<br />
                  이론과 구현, 두 가지를 함께 추구하세요.
                </p>

                <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                  <Link
                    to="/contact"
                    className="inline-flex items-center gap-2 px-6 py-3 rounded-full font-medium text-sm transition-all duration-200 hover:scale-105 active:scale-95"
                    style={{ background: '#3B82F6', color: '#fff' }}
                  >
                    지원하기 <ArrowRight size={14} />
                  </Link>
                  <Link
                    to="/members"
                    className="inline-flex items-center gap-2 px-6 py-3 rounded-full font-medium text-sm transition-all duration-200"
                    style={{
                      border: '1px solid rgba(255,255,255,0.15)',
                      color: 'rgba(255,255,255,0.7)',
                    }}
                    onMouseEnter={e => ((e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.4)')}
                    onMouseLeave={e => ((e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.15)')}
                  >
                    현재 멤버 보기
                  </Link>
                </div>
              </div>
            </div>
          </AnimatedSection>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
