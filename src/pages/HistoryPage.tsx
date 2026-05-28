import React, { useEffect, useState } from 'react';
import { Calendar, ExternalLink, Medal, Trophy } from 'lucide-react';
import AnimatedSection from '../components/AnimatedSection';
import { supabase, HistoryEvent } from '../lib/supabase';

const fallbackEvents: HistoryEvent[] = [
  {
    id: 'fallback-1',
    title: 'A.ing 활동 기록 준비 중',
    description: '해커톤, 수상, 주요 프로젝트처럼 보여줄 가치가 큰 연혁만 선별해 타임라인으로 정리할 예정입니다.',
    event_date: '2026-03-01',
    category: 'milestone',
    created_at: '2026-03-01T00:00:00Z',
  },
];

const CATEGORY_LABELS: Record<string, string> = {
  award: 'Award',
  hackathon: 'Hackathon',
  project: 'Project',
  event: 'Event',
  milestone: 'Milestone',
};

const CATEGORY_COLORS: Record<string, string> = {
  award: 'bg-amber-50 text-amber-700 border-amber-200',
  hackathon: 'bg-purple-50 text-purple-600 border-purple-200',
  project: 'bg-aing-blue-light text-aing-blue border-blue-200',
  event: 'bg-green-50 text-green-600 border-green-200',
  milestone: 'bg-gray-100 text-gray-600 border-gray-200',
};

const formatDate = (date: string) => new Date(date).toLocaleDateString('ko-KR', {
  year: 'numeric',
  month: 'long',
  day: 'numeric',
});

const HistoryPage: React.FC = () => {
  const [events, setEvents] = useState<HistoryEvent[]>(fallbackEvents);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const { data } = await supabase
          .from('history_events')
          .select('id,title,description,event_date,category,link_url,image_url,display_order,created_at')
          .order('event_date', { ascending: false })
          .order('display_order', { ascending: true });
        if (data && data.length > 0) setEvents(data as HistoryEvent[]);
      } catch {
        // Keep fallback until the table is populated.
      }
      setLoading(false);
    };
    load();
  }, []);

  return (
    <div className="min-h-screen bg-aing-bg pt-20">
      <section className="py-20 px-6 border-b border-aing-border">
        <div className="max-w-4xl mx-auto">
          <AnimatedSection>
            <div className="inline-flex items-center gap-2 tag-blue mb-6">
              <Trophy size={12} />
              <span>History</span>
            </div>
            <h1 className="section-title text-5xl mb-4">
              <span className="text-gradient">Highlights</span>
            </h1>
            <p className="section-subtitle max-w-xl">
              A.ing의 수상, 해커톤, 주요 프로젝트와 공식 행사를 선별해 기록합니다.
            </p>
          </AnimatedSection>
        </div>
      </section>

      <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto">
          {loading ? (
            <div className="space-y-4">
              {[...Array(4)].map((_, i) => <div key={i} className="card animate-pulse h-28" />)}
            </div>
          ) : events.length === 0 ? (
            <div className="card border-dashed text-center py-20">
              <Calendar size={32} className="text-aing-muted mx-auto mb-4 opacity-40" />
              <p className="text-aing-muted text-sm">아직 공개할 연혁이 없습니다.</p>
            </div>
          ) : (
            <div className="relative">
              <div className="absolute left-3 top-0 bottom-0 w-px bg-aing-border hidden sm:block" />
              <div className="space-y-6">
                {events.map((event, i) => (
                  <AnimatedSection key={event.id} delay={i * 80}>
                    <article className="relative sm:pl-12">
                      <div className="absolute left-0 top-6 hidden sm:flex w-6 h-6 rounded-full bg-white border border-aing-border items-center justify-center">
                        <Medal size={12} className="text-aing-blue" />
                      </div>
                      <div className="bg-aing-card border border-aing-border rounded-2xl p-5 hover:border-blue-200 transition-colors">
                        {event.image_url && (
                          <img src={event.image_url} alt={event.title} className="w-full aspect-[16/9] object-cover rounded-xl border border-aing-border mb-4" />
                        )}
                        <div className="flex items-center gap-2 mb-3 flex-wrap">
                          <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${CATEGORY_COLORS[event.category] || CATEGORY_COLORS.milestone}`}>
                            {CATEGORY_LABELS[event.category] || event.category}
                          </span>
                          <span className="text-xs text-aing-muted">{formatDate(event.event_date)}</span>
                        </div>
                        <h2 className="text-lg font-semibold text-aing-text mb-2">{event.title}</h2>
                        {event.description && (
                          <p className="text-sm text-aing-muted leading-relaxed whitespace-pre-wrap">{event.description}</p>
                        )}
                        {event.link_url && (
                          <a
                            href={event.link_url.startsWith('http') ? event.link_url : 'https://' + event.link_url}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1.5 text-xs text-aing-blue font-medium mt-4 hover:opacity-80"
                          >
                            자세히 보기
                            <ExternalLink size={12} />
                          </a>
                        )}
                      </div>
                    </article>
                  </AnimatedSection>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default HistoryPage;
