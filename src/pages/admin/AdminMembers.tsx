import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, PlusCircle, Trash2, UserCheck, UserX } from 'lucide-react';
import { supabase, Member } from '../../lib/supabase';
import { useAdmin } from '../../context/AdminContext';

const TRACK_COLORS: Record<string, string> = {
  junior: 'text-aing-blue border-blue-200 bg-aing-blue-light',
  senior: 'text-purple-500 border-purple-200 bg-purple-50',
  admin: 'text-green-500 border-green-200 bg-green-50',
};

const AdminMembers: React.FC = () => {
  const { isAdmin } = useAdmin();
  const navigate = useNavigate();
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ name: '', role: '', track: 'junior' as Member['track'], semester: '2026 Spring', github: '', bio: '' });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!isAdmin) { navigate('/admin/login'); return; }
    fetchMembers();
  }, [isAdmin, navigate]);

  const fetchMembers = async () => {
    setLoading(true);
    const { data } = await supabase.from('members').select('*').order('created_at', { ascending: true });
    setMembers(data || []);
    setLoading(false);
  };

  const toggleActive = async (id: string, current: boolean) => {
    await supabase.from('members').update({ is_active: !current }).eq('id', id);
    setMembers(prev => prev.map(m => m.id === id ? { ...m, is_active: !current } : m));
  };

  const deleteMember = async (id: string) => {
    if (!window.confirm('삭제하시겠습니까?')) return;
    await supabase.from('members').delete().eq('id', id);
    setMembers(prev => prev.filter(m => m.id !== id));
  };

  const addMember = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const { error } = await supabase.from('members').insert({
      ...form,
      is_active: true,
      created_at: new Date().toISOString(),
    });
    if (!error) {
      setShowAdd(false);
      setForm({ name: '', role: '', track: 'junior', semester: '2026 Spring', github: '', bio: '' });
      fetchMembers();
    }
    setSaving(false);
  };

  if (!isAdmin) return null;

  return (
    <div className="min-h-screen bg-aing-bg pt-20">
      <div className="max-w-6xl mx-auto px-6 py-12">
        <Link to="/admin" className="flex items-center gap-2 text-aing-muted hover:text-aing-text text-sm mb-8 transition-colors">
          <ArrowLeft size={14} />
          Dashboard
        </Link>

        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-semibold text-aing-text">부원 관리</h1>
          <button
            onClick={() => setShowAdd(!showAdd)}
            className="btn-primary flex items-center gap-2 text-sm"
          >
            <PlusCircle size={14} />
            부원 추가
          </button>
        </div>

        {/* Add Form */}
        {showAdd && (
          <form onSubmit={addMember} className="card mb-8 grid sm:grid-cols-2 gap-4">
            <input value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
              className="input-field" placeholder="이름 *" required />
            <input value={form.role} onChange={e => setForm(p => ({ ...p, role: e.target.value }))}
              className="input-field" placeholder="역할 (예: Researcher)" required />
            <select value={form.track} onChange={e => setForm(p => ({ ...p, track: e.target.value as Member['track'] }))}
              className="input-field">
              <option value="junior">Junior</option>
              <option value="senior">Senior</option>
              <option value="admin">Admin</option>
            </select>
            <input value={form.semester} onChange={e => setForm(p => ({ ...p, semester: e.target.value }))}
              className="input-field" placeholder="기수 (예: 2026 Spring)" />
            <input value={form.github} onChange={e => setForm(p => ({ ...p, github: e.target.value }))}
              className="input-field" placeholder="GitHub URL" />
            <input value={form.bio} onChange={e => setForm(p => ({ ...p, bio: e.target.value }))}
              className="input-field" placeholder="한 줄 소개" />
            <div className="sm:col-span-2 flex gap-3">
              <button type="submit" disabled={saving} className="btn-primary text-sm">
                {saving ? '추가 중...' : '추가'}
              </button>
              <button type="button" onClick={() => setShowAdd(false)} className="btn-ghost text-sm">취소</button>
            </div>
          </form>
        )}

        {/* Table */}
        {loading ? (
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => <div key={i} className="card animate-pulse h-16" />)}
          </div>
        ) : (
          <div className="space-y-3">
            {members.map(member => (
              <div key={member.id} className={`card flex items-center gap-4 ${!member.is_active ? 'opacity-40' : ''}`}>
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-100 to-purple-100 border border-aing-border flex items-center justify-center shrink-0">
                  <span className="text-sm font-semibold text-aing-text">
                    {member.name.slice(0, 2)}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-aing-text text-sm">{member.name}</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full border font-mono ${TRACK_COLORS[member.track]}`}>
                      {member.track}
                    </span>
                  </div>
                  <span className="text-xs text-aing-muted">{member.role} · {member.semester}</span>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => toggleActive(member.id, member.is_active)}
                    className={`p-1.5 rounded-lg border transition-colors ${
                      member.is_active
                        ? 'border-green-200 text-green-500 hover:bg-green-50'
                        : 'border-aing-border text-aing-muted hover:text-aing-text'
                    }`}
                    title={member.is_active ? '비활성화' : '활성화'}
                  >
                    {member.is_active ? <UserCheck size={14} /> : <UserX size={14} />}
                  </button>
                  <button
                    onClick={() => deleteMember(member.id)}
                    className="p-1.5 rounded-lg border border-aing-border text-aing-muted hover:text-red-500 hover:border-red-200 transition-colors"
                  >
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

export default AdminMembers;
