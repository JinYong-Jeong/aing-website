import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Check, ExternalLink, Pencil, PlusCircle, Trash2, X } from 'lucide-react';
import { supabase, HistoryEvent } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';

const HISTORY_EVENT_SELECT = [
  'id',
  'title',
  'description',
  'event_date',
  'category',
  'link_url',
  'image_url',
  'display_order',
  'created_at',
].join(',');

const CATEGORY_LABELS: Record<HistoryEvent['category'], string> = {
  award: '수상',
  hackathon: '해커톤',
  project: '프로젝트',
  event: '공식 행사',
  milestone: '마일스톤',
};

const CATEGORY_STYLES: Record<HistoryEvent['category'], string> = {
  award: 'border-amber-200 bg-amber-50 text-amber-700',
  hackathon: 'border-blue-200 bg-aing-blue-light text-aing-blue',
  project: 'border-purple-200 bg-purple-50 text-purple-600',
  event: 'border-green-200 bg-green-50 text-green-700',
  milestone: 'border-gray-200 bg-gray-50 text-gray-600',
};

const EMPTY_FORM = {
  title: '',
  description: '',
  event_date: '',
  category: 'milestone' as HistoryEvent['category'],
  link_url: '',
  image_url: '',
  display_order: '0',
};

const AdminHistory: React.FC = () => {
  const { isAdmin } = useAuth();
  const navigate = useNavigate();
  const [events, setEvents] = useState<HistoryEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!isAdmin) {
      navigate('/admin/login');
      return;
    }
    fetchEvents();
  }, [isAdmin, navigate]);

  const fetchEvents = async () => {
    setLoading(true);
    const { data } = await supabase
      .from('history_events')
      .select(HISTORY_EVENT_SELECT)
      .order('event_date', { ascending: false })
      .order('display_order', { ascending: true });
    setEvents((data as unknown as HistoryEvent[]) ?? []);
    setLoading(false);
  };

  const openAdd = () => {
    setEditId(null);
    setForm(EMPTY_FORM);
    setShowForm(true);
  };

  const openEdit = (event: HistoryEvent) => {
    setEditId(event.id);
    setForm({
      title: event.title,
      description: event.description ?? '',
      event_date: event.event_date ?? '',
      category: event.category,
      link_url: event.link_url ?? '',
      image_url: event.image_url ?? '',
      display_order: String(event.display_order ?? 0),
    });
    setShowForm(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const payload = {
      title: form.title.trim().slice(0, 120),
      description: form.description.trim().slice(0, 500) || null,
      event_date: form.event_date,
      category: form.category,
      link_url: form.link_url.trim().slice(0, 300) || null,
      image_url: form.image_url.trim().slice(0, 300) || null,
      display_order: Number(form.display_order) || 0,
    };

    if (editId) {
      await supabase.from('history_events').update(payload).eq('id', editId);
    } else {
      await supabase.from('history_events').insert(payload);
    }

    setSaving(false);
    setShowForm(false);
    setEditId(null);
    fetchEvents();
  };

  const deleteEvent = async (id: string) => {
    if (!window.confirm('히스토리 항목을 삭제하시겠습니까?')) return;
    await supabase.from('history_events').delete().eq('id', id);
    setEvents(prev => prev.filter(event => event.id !== id));
  };

  if (!isAdmin) return null;

  return (
    <div className="min-h-screen bg-aing-bg pt-20">
      <div className="max-w-5xl mx-auto px-6 py-12">
        <div className="flex items-center gap-4 mb-8">
          <Link to="/admin" className="flex items-center gap-2 text-aing-muted hover:text-aing-text text-sm transition-colors">
            <ArrowLeft size={14} />
            Dashboard
          </Link>
          <span className="text-aing-border">|</span>
          <Link to="/history" className="flex items-center gap-1.5 text-xs text-aing-blue hover:text-aing-text transition-colors">
            <ExternalLink size={12} />
            History 보기
          </Link>
        </div>

        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-semibold text-aing-text">History 관리</h1>
            <p className="text-sm text-aing-muted mt-1">수상, 해커톤, 주요 프로젝트, 공식 행사만 선별해 타임라인에 노출합니다.</p>
          </div>
          <button onClick={openAdd} className="btn-primary flex items-center gap-2 text-sm">
            <PlusCircle size={14} />
            항목 추가
          </button>
        </div>

        {showForm && (
          <form onSubmit={handleSubmit} className="card mb-8 grid sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2 flex items-center justify-between">
              <h3 className="text-sm font-semibold text-aing-text">{editId ? '히스토리 수정' : '새 히스토리 항목'}</h3>
              <button type="button" onClick={() => setShowForm(false)} className="text-aing-muted hover:text-aing-text">
                <X size={16} />
              </button>
            </div>
            <input value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} maxLength={120} className="input-field" placeholder="제목 *" required />
            <input value={form.event_date} onChange={e => setForm(p => ({ ...p, event_date: e.target.value }))} className="input-field" type="date" required />
            <select value={form.category} onChange={e => setForm(p => ({ ...p, category: e.target.value as HistoryEvent['category'] }))} className="input-field">
              <option value="award">수상</option>
              <option value="hackathon">해커톤</option>
              <option value="project">프로젝트</option>
              <option value="event">공식 행사</option>
              <option value="milestone">마일스톤</option>
            </select>
            <input value={form.display_order} onChange={e => setForm(p => ({ ...p, display_order: e.target.value }))} className="input-field" type="number" placeholder="동일 날짜 정렬 순서" />
            <input value={form.link_url} onChange={e => setForm(p => ({ ...p, link_url: e.target.value }))} maxLength={300} className="input-field" placeholder="관련 링크 URL" />
            <input value={form.image_url} onChange={e => setForm(p => ({ ...p, image_url: e.target.value }))} maxLength={300} className="input-field" placeholder="대표 이미지 URL" />
            <textarea value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} maxLength={500} className="input-field sm:col-span-2 resize-none" rows={4} placeholder="간단 설명" />
            <div className="sm:col-span-2 flex gap-3">
              <button type="submit" disabled={saving} className="btn-primary text-sm flex items-center gap-2">
                <Check size={14} />
                {saving ? '저장 중...' : editId ? '수정' : '추가'}
              </button>
              <button type="button" onClick={() => setShowForm(false)} className="btn-ghost text-sm">취소</button>
            </div>
          </form>
        )}

        {loading ? (
          <div className="space-y-3">
            {[...Array(4)].map((_, i) => <div key={i} className="card animate-pulse h-16" />)}
          </div>
        ) : events.length === 0 ? (
          <div className="card text-center py-16">
            <p className="text-aing-muted text-sm">등록된 히스토리 항목이 없습니다.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {events.map(event => (
              <div key={event.id} className="card flex items-start gap-4">
                {event.image_url && (
                  <img src={event.image_url} alt="" className="w-20 h-20 rounded-lg object-cover border border-aing-border shrink-0" />
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <span className={`text-xs px-2 py-0.5 rounded-full border ${CATEGORY_STYLES[event.category]}`}>
                      {CATEGORY_LABELS[event.category]}
                    </span>
                    <span className="text-xs text-aing-muted font-mono">{event.event_date}</span>
                    {event.display_order !== undefined && <span className="text-xs text-aing-muted font-mono">order {event.display_order}</span>}
                  </div>
                  <h2 className="text-sm font-semibold text-aing-text">{event.title}</h2>
                  {event.description && <p className="text-xs text-aing-muted mt-1 line-clamp-2">{event.description}</p>}
                  {event.link_url && (
                    <a href={event.link_url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 text-xs text-aing-blue mt-2">
                      링크 보기
                      <ExternalLink size={11} />
                    </a>
                  )}
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button onClick={() => openEdit(event)} className="p-1.5 rounded-lg border border-aing-border text-aing-muted hover:text-aing-blue hover:border-blue-200 transition-colors" title="수정">
                    <Pencil size={14} />
                  </button>
                  <button onClick={() => deleteEvent(event.id)} className="p-1.5 rounded-lg border border-aing-border text-aing-muted hover:text-red-500 hover:border-red-200 transition-colors" title="삭제">
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminHistory;
