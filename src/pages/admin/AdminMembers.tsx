import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, PlusCircle, Trash2, UserCheck, UserX, Pencil } from 'lucide-react';
import { supabase, Member } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';

const TRACK_COLORS: Record<string, string> = {
  junior: 'text-aing-blue border-blue-200 bg-aing-blue-light',
  senior: 'text-purple-500 border-purple-200 bg-purple-50',
  admin: 'text-green-500 border-green-200 bg-green-50',
  ob: 'text-gray-500 border-gray-200 bg-gray-50',
};

type FormState = {
  name: string;
  role: string;
  track: Member['track'];
  semester: string;
  github: string;
  bio: string;
  avatar_url: string;
  password_hash: string;
  status: 'busy' | 'mid' | 'free';
  is_active: boolean;
};

const defaultForm: FormState = {
  name: '',
  role: '',
  track: 'junior',
  semester: '2026 Spring',
  github: '',
  bio: '',
  avatar_url: '',
  password_hash: '',
  status: 'free',
  is_active: true,
};

const AdminMembers: React.FC = () => {
  const { isAdmin } = useAuth();
  const navigate = useNavigate();
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>(defaultForm);
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

  const openAddForm = () => {
    setEditingId(null);
    setForm(defaultForm);
    setShowAdd(true);
  };

  const openEditForm = (member: Member) => {
    setEditingId(member.id);
    setForm({
      name: member.name || '',
      role: member.role || '',
      track: member.track || 'junior',
      semester: member.semester || '2026 Spring',
      github: member.github || '',
      bio: member.bio || '',
      avatar_url: member.avatar_url || '',
      password_hash: '',
      status: (member.status as 'busy' | 'mid' | 'free') || 'free',
      is_active: member.is_active ?? true,
    });
    setShowAdd(true);
  };

  const cancelForm = () => {
    setShowAdd(false);
    setEditingId(null);
    setForm(defaultForm);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    const payload: Record<string, unknown> = {
      name: form.name,
      role: form.role,
      track: form.track,
      semester: form.semester,
      github: form.github,
      bio: form.bio,
      avatar_url: form.avatar_url,
      status: form.status,
      is_active: form.is_active,
    };
    if (form.password_hash.trim()) {
      payload.password_hash = form.password_hash.trim();
    }

    if (editingId) {
      const { error } = await supabase.from('members').update(payload).eq('id', editingId);
      if (!error) {
        cancelForm();
        fetchMembers();
      }
    } else {
      const { error } = await supabase.from('members').insert({
        ...payload,
        is_active: true,
        created_at: new Date().toISOString(),
      });
      if (!error) {
        cancelForm();
        fetchMembers();
      }
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
          {!showAdd && (
            <button
              onClick={openAddForm}
              className="btn-primary flex items-center gap-2 text-sm"
            >
              <PlusCircle size={14} />
              부원 추가
            </button>
          )}
        </div>

        {/* Add / Edit Form */}
        {showAdd && (
          <form onSubmit={handleSubmit} className="card mb-8 space-y-4">
            <h3 className="text-sm font-semibold text-aing-text mb-2">
              {editingId ? '부원 수정' : '새 부원 추가'}
            </h3>
            {/* Row 1: 이름 + 역할 */}
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-aing-muted mb-1 block">이름 *</label>
                <input
                  value={form.name}
                  onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                  className="input-field"
                  placeholder="이름"
                  required
                />
              </div>
              <div>
                <label className="text-xs text-aing-muted mb-1 block">역할</label>
                <input
                  value={form.role}
                  onChange={e => setForm(p => ({ ...p, role: e.target.value }))}
                  className="input-field"
                  placeholder="예: Researcher"
                />
              </div>
            </div>
            {/* Row 2: 트랙 + 기수 */}
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-aing-muted mb-1 block">트랙</label>
                <select
                  value={form.track}
                  onChange={e => setForm(p => ({ ...p, track: e.target.value as Member['track'] }))}
                  className="input-field"
                >
                  <option value="junior">Junior</option>
                  <option value="senior">Senior</option>
                  <option value="admin">Admin</option>
                  <option value="ob">OB</option>
                </select>
              </div>
              <div>
                <label className="text-xs text-aing-muted mb-1 block">기수</label>
                <input
                  value={form.semester}
                  onChange={e => setForm(p => ({ ...p, semester: e.target.value }))}
                  className="input-field"
                  placeholder="예: 2026 Spring"
                />
              </div>
            </div>
            {/* Row 3: GitHub + 한 줄 소개 */}
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-aing-muted mb-1 block">GitHub URL</label>
                <input
                  value={form.github}
                  onChange={e => setForm(p => ({ ...p, github: e.target.value }))}
                  className="input-field"
                  placeholder="https://github.com/username"
                />
              </div>
              <div>
                <label className="text-xs text-aing-muted mb-1 block">한 줄 소개</label>
                <input
                  value={form.bio}
                  onChange={e => setForm(p => ({ ...p, bio: e.target.value }))}
                  className="input-field"
                  placeholder="한 줄 소개"
                />
              </div>
            </div>
            {/* Row 4: 아바타 URL */}
            <div>
              <label className="text-xs text-aing-muted mb-1 block">아바타 이미지 URL</label>
              <input
                value={form.avatar_url}
                onChange={e => setForm(p => ({ ...p, avatar_url: e.target.value }))}
                className="input-field"
                placeholder="https://..."
              />
            </div>
            {/* Row 5: 비밀번호 + 상태 */}
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-aing-muted mb-1 block">비밀번호 {editingId ? '(변경 시만 입력)' : '(선택)'}</label>
                <input
                  type="password"
                  value={form.password_hash}
                  onChange={e => setForm(p => ({ ...p, password_hash: e.target.value }))}
                  className="input-field"
                  placeholder="초기 비밀번호 설정"
                />
              </div>
              <div>
                <label className="text-xs text-aing-muted mb-1 block">상태</label>
                <select
                  value={form.status}
                  onChange={e => setForm(p => ({ ...p, status: e.target.value as 'busy' | 'mid' | 'free' }))}
                  className="input-field"
                >
                  <option value="free">여유 (free)</option>
                  <option value="mid">보통 (mid)</option>
                  <option value="busy">바쁨 (busy)</option>
                </select>
              </div>
            </div>
            {editingId && (
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="is_active"
                  checked={form.is_active}
                  onChange={e => setForm(p => ({ ...p, is_active: e.target.checked }))}
                  className="rounded"
                />
                <label htmlFor="is_active" className="text-sm text-aing-text">활성 멤버</label>
              </div>
            )}
            {/* Buttons */}
            <div className="flex gap-3 pt-2">
              <button type="submit" disabled={saving} className="btn-primary text-sm">
                {saving ? (editingId ? '저장 중...' : '추가 중...') : (editingId ? '저장' : '추가')}
              </button>
              <button type="button" onClick={cancelForm} className="btn-ghost text-sm">취소</button>
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
                  {member.avatar_url ? (
                    <img src={member.avatar_url} alt={member.name} className="w-10 h-10 rounded-xl object-cover" />
                  ) : (
                    <span className="text-sm font-semibold text-aing-text">
                      {member.name.slice(0, 2)}
                    </span>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-aing-text text-sm">{member.name}</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full border font-mono ${TRACK_COLORS[member.track] || 'text-gray-500 border-gray-200 bg-gray-50'}`}>
                      {member.track}
                    </span>
                  </div>
                  <span className="text-xs text-aing-muted">{member.role} · {member.semester}</span>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => openEditForm(member)}
                    className="p-1.5 rounded-lg border border-aing-border text-aing-muted hover:text-aing-blue hover:border-blue-200 transition-colors"
                    title="수정"
                  >
                    <Pencil size={14} />
                  </button>
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
