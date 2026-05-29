import React, { useMemo, useState } from 'react';
import { Check, Github, Instagram, Mail, MapPin, Send } from 'lucide-react';
import AnimatedSection from '../components/AnimatedSection';
import { useSiteSettings } from '../context/SiteSettingsContext';

const ContactPage: React.FC = () => {
  const [emailCopied, setEmailCopied] = useState(false);
  const s = useSiteSettings();
  const instagramUrl = s.instagram || 'https://www.instagram.com/aing_gc/';
  const githubUrl = s.github || 'https://github.com/aing-gachon';
  const emailAddr = s.email || 'gachon.aing@gmail.com';
  const locationStr = s.location || '가천대학교 AI관';
  const notionUrl = s.notion || '';
  const gmailComposeUrl = useMemo(() => {
    const params = new URLSearchParams({
      view: 'cm',
      fs: '1',
      to: emailAddr,
      su: 'A.ing 문의',
    });
    return `https://mail.google.com/mail/?${params.toString()}`;
  }, [emailAddr]);

  const handleEmailClick = () => {
    navigator.clipboard?.writeText(emailAddr).then(() => {
      setEmailCopied(true);
      window.setTimeout(() => setEmailCopied(false), 3000);
    }).catch(() => {
      setEmailCopied(false);
    });
  };

  return (
    <div className="min-h-screen bg-aing-bg pt-20">
      <section className="py-20 px-6 border-b border-aing-border">
        <div className="max-w-4xl mx-auto">
          <AnimatedSection>
            <div className="inline-flex items-center gap-2 tag-blue mb-6">
              <Mail size={12} />
              <span>Contact</span>
            </div>
            <h1 className="section-title text-5xl mb-4">
              <span className="text-gradient">Get in Touch</span>
            </h1>
            <p className="section-subtitle max-w-xl">
              동아리에 관심이 있거나 질문이 있다면 공식 이메일로 연락해주세요.
            </p>
          </AnimatedSection>
        </div>
      </section>

      <section className="py-24 px-6">
        <div className="max-w-5xl mx-auto grid md:grid-cols-[1fr_1.2fr] gap-12 items-start">
          <AnimatedSection direction="left">
            <div>
              <h2 className="text-xl font-semibold text-aing-text mb-6">Contact Info</h2>
              <div className="space-y-4">
                <a
                  href={gmailComposeUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={handleEmailClick}
                  className="flex items-center gap-4 group"
                >
                  <div className="p-3 rounded-xl bg-aing-bg-alt border border-aing-border group-hover:border-blue-200 transition-colors">
                    <Mail size={18} className="text-aing-blue" />
                  </div>
                  <div>
                    <p className="text-xs text-aing-muted mb-0.5">Email</p>
                    <p className="text-sm text-aing-text group-hover:text-aing-blue transition-colors">{emailAddr}</p>
                  </div>
                </a>
                <a href={instagramUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-4 group">
                  <div className="p-3 rounded-xl bg-aing-bg-alt border border-aing-border group-hover:border-blue-200 transition-colors">
                    <Instagram size={18} className="text-aing-blue" />
                  </div>
                  <div>
                    <p className="text-xs text-aing-muted mb-0.5">Instagram</p>
                    <p className="text-sm text-aing-text group-hover:text-aing-blue transition-colors">@aing_gc</p>
                  </div>
                </a>
                <a href={githubUrl} target="_blank" rel="noreferrer" className="flex items-center gap-4 group">
                  <div className="p-3 rounded-xl bg-aing-bg-alt border border-aing-border group-hover:border-blue-200 transition-colors">
                    <Github size={18} className="text-aing-blue" />
                  </div>
                  <div>
                    <p className="text-xs text-aing-muted mb-0.5">GitHub</p>
                    <p className="text-sm text-aing-text group-hover:text-aing-blue transition-colors">{githubUrl.replace('https://', '')}</p>
                  </div>
                </a>
                {notionUrl && (
                  <a href={notionUrl.startsWith('http') ? notionUrl : 'https://' + notionUrl} target="_blank" rel="noreferrer" className="flex items-center gap-4 group">
                    <div className="p-3 rounded-xl bg-aing-bg-alt border border-aing-border group-hover:border-blue-200 transition-colors">
                      <span className="text-aing-blue text-sm font-semibold">N</span>
                    </div>
                    <div>
                      <p className="text-xs text-aing-muted mb-0.5">Notion</p>
                      <p className="text-sm text-aing-text group-hover:text-aing-blue transition-colors">{notionUrl.replace(/^https?:\/\//, '')}</p>
                    </div>
                  </a>
                )}
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-xl bg-aing-bg-alt border border-aing-border">
                    <MapPin size={18} className="text-aing-blue" />
                  </div>
                  <div>
                    <p className="text-xs text-aing-muted mb-0.5">Location</p>
                    <p className="text-sm text-aing-text">{locationStr}</p>
                  </div>
                </div>
              </div>
            </div>
          </AnimatedSection>

          <AnimatedSection delay={150} direction="right">
            <div className="card">
              <h2 className="text-lg font-semibold text-aing-text mb-3">공식 이메일로 문의하기</h2>
              <p className="text-sm text-aing-muted leading-relaxed mb-6">
                지원, 협업, 활동 문의는 공식 이메일로 보내주세요. 운영진이 확인 후 답변드리겠습니다.
              </p>
              <a
                href={gmailComposeUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={handleEmailClick}
                className="btn-primary inline-flex items-center gap-2 text-sm"
              >
                {emailCopied ? '주소 복사됨' : '메일 보내기'}
                {emailCopied ? <Check size={14} /> : <Send size={14} />}
              </a>
              <p className="text-xs text-aing-muted mt-3">
                {emailCopied ? '이메일 주소를 복사했고 Gmail 작성창을 열었습니다.' : emailAddr}
              </p>
            </div>

            <div className="card mt-6">
              <h3 className="text-sm font-semibold text-aing-text mb-4">자주 묻는 질문</h3>
              <div className="space-y-4">
                {[
                  { q: '언제 모집하나요?', a: '매 학기 초에 신규 부원을 모집합니다. 모집 기간에는 상단 모집 배지가 표시됩니다.' },
                  { q: '학년 제한이 있나요?', a: '학년 제한 없이 지원 가능합니다. Python 기초 지식이 있으면 활동을 따라오기 좋습니다.' },
                  { q: '활동 주기는 어떻게 되나요?', a: '주 1회 세션과 자율 학습, 프로젝트 활동을 함께 진행합니다.' },
                ].map(item => (
                  <div key={item.q} className="border-b border-aing-border last:border-0 pb-4 last:pb-0">
                    <p className="text-sm font-medium text-aing-text mb-1">{item.q}</p>
                    <p className="text-sm text-aing-muted">{item.a}</p>
                  </div>
                ))}
              </div>
            </div>
          </AnimatedSection>
        </div>
      </section>
    </div>
  );
};

export default ContactPage;
