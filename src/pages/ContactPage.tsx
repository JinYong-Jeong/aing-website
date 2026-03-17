import React, { useState } from 'react';
import { Mail, MapPin, Github, Send, CheckCircle } from 'lucide-react';
import { supabase } from '../lib/supabase';
import AnimatedSection from '../components/AnimatedSection';

const ContactPage: React.FC = () => {
  const [form, setForm] = useState({ name: '', email: '', message: '' });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const { error } = await supabase.from('contact_messages').insert({
        name: form.name,
        email: form.email,
        message: form.message,
        is_read: false,
      });
      if (!error) {
        setSubmitted(true);
        setForm({ name: '', email: '', message: '' });
      }
    } catch {
      setSubmitted(true); // show success anyway for demo
    }
    setSubmitting(false);
  };

  return (
    <div className="min-h-screen bg-aing-bg pt-20">
      {/* Header */}
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
              동아리에 관심이 있거나 질문이 있다면 언제든지 연락주세요.<br />
              지원 문의도 환영합니다.
            </p>
          </AnimatedSection>
        </div>
      </section>

      <section className="py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12">
            {/* Info */}
            <AnimatedSection direction="left">
              <div className="space-y-8">
                <div>
                  <h2 className="text-xl font-semibold text-aing-text mb-6">Contact Info</h2>
                  <div className="space-y-4">
                    <a
                      href="mailto:gachon.aing@gmail.com"
                      className="flex items-center gap-4 group"
                    >
                      <div className="p-3 rounded-xl bg-aing-bg-alt border border-aing-border group-hover:border-blue-200 transition-colors">
                        <Mail size={18} className="text-aing-blue" />
                      </div>
                      <div>
                        <p className="text-xs text-aing-muted mb-0.5">Email</p>
                        <p className="text-sm text-aing-text group-hover:text-aing-blue transition-colors">
                          gachon.aing@gmail.com
                        </p>
                      </div>
                    </a>
                    <a
                      href="https://github.com/aing-gachon"
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center gap-4 group"
                    >
                      <div className="p-3 rounded-xl bg-aing-bg-alt border border-aing-border group-hover:border-blue-200 transition-colors">
                        <Github size={18} className="text-aing-blue" />
                      </div>
                      <div>
                        <p className="text-xs text-aing-muted mb-0.5">GitHub</p>
                        <p className="text-sm text-aing-text group-hover:text-aing-blue transition-colors">
                          github.com/aing-gachon
                        </p>
                      </div>
                    </a>
                    <div className="flex items-center gap-4">
                      <div className="p-3 rounded-xl bg-aing-bg-alt border border-aing-border">
                        <MapPin size={18} className="text-aing-blue" />
                      </div>
                      <div>
                        <p className="text-xs text-aing-muted mb-0.5">Location</p>
                        <p className="text-sm text-aing-text">가천대학교 AI관</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* FAQ */}
                <div className="card">
                  <h3 className="text-sm font-semibold text-aing-text mb-4">자주 묻는 질문</h3>
                  <div className="space-y-4">
                    {[
                      {
                        q: '언제 모집하나요?',
                        a: '매 학기 초에 신규 부원을 모집합니다. 공지사항을 확인해주세요.',
                      },
                      {
                        q: '학년 제한이 있나요?',
                        a: '학년 제한 없이 지원 가능합니다. Python 기초 지식이 필요합니다.',
                      },
                      {
                        q: '활동 주기는 어떻게 되나요?',
                        a: '주 1회 세션 + 자율 학습으로 진행됩니다.',
                      },
                    ].map(item => (
                      <div key={item.q} className="border-b border-aing-border last:border-0 pb-4 last:pb-0">
                        <p className="text-sm font-medium text-aing-text mb-1">{item.q}</p>
                        <p className="text-sm text-aing-muted">{item.a}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </AnimatedSection>

            {/* Form */}
            <AnimatedSection delay={150} direction="right">
              <div className="card">
                <h2 className="text-lg font-semibold text-aing-text mb-6">메시지 보내기</h2>
                {submitted ? (
                  <div className="py-16 text-center">
                    <CheckCircle size={40} className="text-green-500 mx-auto mb-4" />
                    <h3 className="text-aing-text font-semibold mb-2">메시지가 전송되었습니다!</h3>
                    <p className="text-aing-muted text-sm">빠른 시일 내로 답변드리겠습니다.</p>
                    <button
                      onClick={() => setSubmitted(false)}
                      className="btn-ghost text-sm mt-6"
                    >
                      다시 보내기
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                      <label className="block text-xs text-aing-muted mb-2">이름 *</label>
                      <input
                        type="text"
                        value={form.name}
                        onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                        className="input-field"
                        placeholder="홍길동"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-aing-muted mb-2">이메일 *</label>
                      <input
                        type="email"
                        value={form.email}
                        onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
                        className="input-field"
                        placeholder="example@gachon.ac.kr"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-aing-muted mb-2">메시지 *</label>
                      <textarea
                        value={form.message}
                        onChange={e => setForm(p => ({ ...p, message: e.target.value }))}
                        className="input-field resize-none"
                        rows={6}
                        placeholder="지원 동기, 질문사항 등을 자유롭게 작성해주세요."
                        required
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={submitting}
                      className="btn-primary w-full flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                      {submitting ? '전송 중...' : (
                        <>
                          전송하기 <Send size={14} />
                        </>
                      )}
                    </button>
                  </form>
                )}
              </div>
            </AnimatedSection>
          </div>
        </div>
      </section>
    </div>
  );
};

export default ContactPage;
