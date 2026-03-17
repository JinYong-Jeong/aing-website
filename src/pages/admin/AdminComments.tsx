import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, CheckCircle, XCircle, MessageSquare } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAdmin } from '../../context/AdminContext';

const AdminComments: React.FC = () => {
  const { isAdmin } = useAdmin();
  const navigate = useNavigate();
  const [comments, setComments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'pending' | 'all'>('pending');

  useEffect(() => {
    if (!isAdmin) { navigate('/admin/login'); return; }
    fetchComments();
  }, [isAdmin, navigate]);

  const fetchComments = async () => {
    setLoading(true);
    const { data } = await supabase
      .from('comments')
      .select('*')
      .order('created_at', { ascending: false });
    setComments(data || []);
    setLoading(false);
  };

  const approve = async (id: string) => {
    await supabase.from('comments').update({ is_approved: true }).eq('id', id);
    setComments(prev => prev.map(c => c.id === id ? { ...c, is_approved: true } : c));
  };

  const remove = async (id: string) => {
    await supabase.from('comments').delete().eq('id', id);
    setComments(prev => prev.filter(c => c.id !== id));
  };

  const filtered = filter === 'pending' ? comments.filter(c => !c.is_approved) : comments;

  if (!isAdmin) return null;

  return (
    <div className="min-h-screen bg-aing-black pt-20">
      <div className="max-w-4xl mx-auto px-6 py-12">
        <Link to="/admin" className="flex items-center gap-2 text-aing-muted hover:text-aing-white text-sm mb-8 transition-colors">
          <ArrowLeft size={14} />
          Dashboard
        </Link>

        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-semibold text-aing-white">댓글 관리</h1>
          <div className="flex gap-2">
            {(['pending', 'all'] as const).map(f => (
              <button key={f} onClick={() => setFilter(f)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                  filter === f ? 'bg-aing-white text-aing-black' : 'border border-aing-border text-aing-muted hover:text-aing-white'
                }`}>
                {f === 'pending' ? '승인 대기' : '전체'}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="space-y-3">{[...Array(5)].map((_, i) => <div key={i} className="card animate-pulse h-20" />)}</div>
        ) : filtered.length === 0 ? (
          <div className="card text-center py-16">
            <MessageSquare size={32} className="text-aing-muted mx-auto mb-4 opacity-30" />
            <p className="text-aing-muted text-sm">댓글이 없습니다.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map(c => (
              <div key={c.id} className={`card ${!c.is_approved ? 'border-aing-blue/20' : ''}`}>
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-medium text-aing-white">{c.author_name}</span>
                      {!c.is_approved && <span className="text-xs text-aing-blue font-mono">대기중</span>}
                      <span className="text-xs text-aing-muted ml-auto">
                        {new Date(c.created_at).toLocaleDateString('ko-KR')}
                      </span>
                    </div>
                    <p className="text-sm text-aing-muted leading-relaxed">{c.content}</p>
                  </div>
                  <div className="flex gap-2 shrink-0">
                    {!c.is_approved && (
                      <button onClick={() => approve(c.id)}
                        className="p-1.5 rounded-lg border border-green-400/30 text-green-400 hover:bg-green-400/10 transition-colors">
                        <CheckCircle size={14} />
                      </button>
                    )}
                    <button onClick={() => remove(c.id)}
                      className="p-1.5 rounded-lg border border-aing-border text-aing-muted hover:text-red-400 hover:border-red-400/30 transition-colors">
                      <XCircle size={14} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminComments;
