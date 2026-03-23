import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, PlusCircle, Trash2, UserCheck, UserX, Pencil, Search, X, Check, GripVertical } from 'lucide-react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { supabase, Member } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';

const TRACK_COLORS: Record<string, string> = {
  junior: 'text-aing-blue border-blue-200 bg-aing-blue-light',
  senior: 'text-purple-500 border-purple-200 bg-purple-50',
  admin: 'text-green-500 border-green-200 bg-green-50',
  ob: 'text-gray-500 border-gray-200 bg-gray-50',
};

const TRACK_LABELS: Record<string, string> = {
  junior: 'Junior',
  senior: 'Senior',
  admin: 'Admin',
  ob: 'OB',
};

type FormState = {
  name: string; role: string; track: Member['track']; semester: string;
  github: string; bio: string; avatar_url: string; password_hash: string;
  status: 'busy'|'mid'|'free'; is_active: boolean;
};
const defaultForm: FormState = {
  name:'', role:'', track:'junior', semester:'2026 Spring',
  github:'', bio:'', avatar_url:'', password_hash:'', status:'free', is_active:true,
};

// ─── Sortable Row ────────────────────────────────────────────────────────────
interface SortableRowProps {
  member: Member;
  isDragMode: boolean;
  onEdit: (m: Member) => void;
  onToggleActive: (id: string, current: boolean) => void;
  onDelete: (id: string) => void;
}

const SortableRow: React.FC<SortableRowProps> = ({ member, isDragMode, onEdit, onToggleActive, onDelete }) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: member.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    background: isDragging ? '#f0f7ff' : undefined,
  };

  return (
    <tr
      ref={setNodeRef}
      style={style}
      className={`border-b border-aing-border last:border-0 hover:bg-aing-bg transition-colors ${!member.is_active ? 'opacity-40' : ''}`}
    >
      {/* Drag handle */}
      <td className="px-2 py-3 w-8">
        {isDragMode && (
          <button
            {...attributes}
            {...listeners}
            className="p-1 rounded text-aing-muted hover:text-aing-text cursor-grab active:cursor-grabbing touch-none"
            title="드래그로 순서 변경"
          >
            <GripVertical size={14} />
          </button>
        )}
      </td>
      <td className="px-4 py-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-100 to-purple-100 border border-aing-border flex items-center justify-center shrink-0 text-xs font-semibold text-aing-text">
            {member.avatar_url
              ? <img src={member.avatar_url} alt={member.name} className="w-8 h-8 rounded-lg object-cover"/>
              : member.name.slice(0,2)}
          </div>
          <span className="font-medium text-aing-text">{member.name}</span>
          {!member.is_active && <span className="text-xs text-aing-muted">(비활성)</span>}
        </div>
      </td>
      <td className="px-4 py-3 text-aing-muted hidden sm:table-cell">{member.role||'-'}</td>
      <td className="px-4 py-3">
        <span className={`text-xs px-2 py-0.5 rounded-full border font-mono ${TRACK_COLORS[member.track]||''}`}>
          {TRACK_LABELS[member.track] || member.track}
        </span>
      </td>
      <td className="px-4 py-3 text-aing-muted text-xs hidden md:table-cell">{member.semester||'-'}</td>
      <td className="px-4 py-3 text-aing-muted text-xs hidden md:table-cell">{member.status||'-'}</td>
      <td className="px-4 py-3">
        <div className="flex items-center gap-1 justify-end">
          <button onClick={() => onEdit(member)} className="p-1.5 rounded-lg border border-aing-border text-aing-muted hover:text-aing-blue hover:border-blue-200 transition-colors" title="수정"><Pencil size={13}/></button>
          <button
            onClick={() => onToggleActive(member.id, member.is_active)}
            className={`p-1.5 rounded-lg border transition-colors ${member.is_active ? 'border-green-200 text-green-500 hover:bg-green-50' : 'border-aing-border text-aing-muted'}`}
            title={member.is_active ? '비활성화' : '활성화'}
          >
            {member.is_active ? <UserCheck size={13}/> : <UserX size={13}/>}
          </button>
          <button onClick={() => onDelete(member.id)} className="p-1.5 rounded-lg border border-aing-border text-aing-muted hover:text-red-500 hover:border-red-200 transition-colors"><Trash2 size={13}/></button>
        </div>
      </td>
    </tr>
  );
};

// ─── Main Component ──────────────────────────────────────────────────────────
const AdminMembers: React.FC = () => {
  const { isAdmin } = useAuth();
  const navigate = useNavigate();
  const [members, setMembers] = useState<Member[]>([]);
  const [orderedIds, setOrderedIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [trackFilter, setTrackFilter] = useState<'all'|'junior'|'senior'|'admin'|'ob'>('all');
  const [showAdd, setShowAdd] = useState(false);
  const [editingId, setEditingId] = useState<string|null>(null);
  const [form, setForm] = useState<FormState>(defaultForm);
  const [saving, setSaving] = useState(false);
  const [isDragMode, setIsDragMode] = useState(false);
  const [orderSaving, setOrderSaving] = useState(false);
  const [orderSaved, setOrderSaved] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  useEffect(() => {
    if (!isAdmin) { navigate('/admin/login'); return; }
    fetchMembers();
  }, [isAdmin, navigate]);

  const fetchMembers = async () => {
    setLoading(true);
    const { data } = await supabase.from('members').select('*').order('created_at', { ascending: true });
    const allMembers = data || [];
    setMembers(allMembers);

    // 저장된 순서 불러오기
    const { data: settings } = await supabase
      .from('site_settings')
      .select('value')
      .eq('key', 'member_order')
      .single();

    if (settings?.value) {
      try {
        const savedOrder: string[] = JSON.parse(settings.value);
        // 저장된 순서 기준으로 정렬, 새 멤버는 뒤에 추가
        const existingIds = new Set(allMembers.map(m => m.id));
        const validOrder = savedOrder.filter(id => existingIds.has(id));
        const newMembers = allMembers.filter(m => !validOrder.includes(m.id)).map(m => m.id);
        setOrderedIds([...validOrder, ...newMembers]);
      } catch {
        setOrderedIds(allMembers.map(m => m.id));
      }
    } else {
      setOrderedIds(allMembers.map(m => m.id));
    }
    setLoading(false);
  };

  // orderedIds 기준으로 멤버 정렬
  const orderedMembers = orderedIds
    .map(id => members.find(m => m.id === id))
    .filter(Boolean) as Member[];

  const filtered = orderedMembers.filter(m => {
    if (trackFilter !== 'all' && m.track !== trackFilter) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      if (!m.name.toLowerCase().includes(q) && !(m.role||'').toLowerCase().includes(q) && !(m.semester||'').toLowerCase().includes(q)) return false;
    }
    return true;
  });

  const handleDragEnd = useCallback((event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    setOrderedIds(prev => {
      const oldIndex = prev.indexOf(active.id as string);
      const newIndex = prev.indexOf(over.id as string);
      return arrayMove(prev, oldIndex, newIndex);
    });
    setOrderSaved(false);
  }, []);

  const saveOrder = async () => {
    setOrderSaving(true);
    // site_settings upsert
    const { error } = await supabase
      .from('site_settings')
      .upsert({ key: 'member_order', value: JSON.stringify(orderedIds) }, { onConflict: 'key' });

    if (!error) {
      setOrderSaved(true);
      setTimeout(() => setOrderSaved(false), 2500);
    }
    setOrderSaving(false);
  };

  const toggleActive = async (id: string, current: boolean) => {
    await supabase.from('members').update({ is_active: !current }).eq('id', id);
    setMembers(prev => prev.map(m => m.id === id ? { ...m, is_active: !current } : m));
  };

  const deleteMember = async (id: string) => {
    if (!window.confirm('삭제하시겠습니까?')) return;
    await supabase.from('members').delete().eq('id', id);
    setMembers(prev => prev.filter(m => m.id !== id));
    setOrderedIds(prev => prev.filter(i => i !== id));
  };

  const openAddForm = () => { setEditingId(null); setForm(defaultForm); setShowAdd(true); };
  const openEditForm = (member: Member) => {
    setEditingId(member.id);
    setForm({
      name: member.name||'', role: member.role||'', track: member.track||'junior',
      semester: member.semester||'2026 Spring', github: member.github||'',
      bio: member.bio||'', avatar_url: member.avatar_url||'', password_hash: '',
      status: (member.status as 'busy'|'mid'|'free')||'free', is_active: member.is_active??true,
    });
    setShowAdd(true);
  };
  const cancelForm = () => { setShowAdd(false); setEditingId(null); setForm(defaultForm); };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setSaving(true);
    const payload: Record<string,unknown> = {
      name: form.name, role: form.role, track: form.track, semester: form.semester,
      github: form.github, bio: form.bio, avatar_url: form.avatar_url,
      status: form.status, is_active: form.is_active,
    };
    if (editingId) {
      await supabase.from('members').update(payload).eq('id', editingId);
      // 비밀번호 입력 시 bcrypt RPC로 별도 처리
      if (form.password_hash.trim()) {
        await supabase.rpc('set_member_password', {
          p_id: editingId,
          p_new_password: form.password_hash.trim(),
        });
      }
    } else {
      const { data: inserted } = await supabase
        .from('members')
        .insert({ ...payload, is_active: true, created_at: new Date().toISOString() })
        .select()
        .single();
      if (inserted) {
        setOrderedIds(prev => [...prev, inserted.id]);
        // 신규 멤버 비밀번호도 bcrypt RPC로 처리
        if (form.password_hash.trim()) {
          await supabase.rpc('set_member_password', {
            p_id: inserted.id,
            p_new_password: form.password_hash.trim(),
          });
        }
      }
    }
    cancelForm(); fetchMembers(); setSaving(false);
  };

  if (!isAdmin) return null;

  // 드래그 모드에서는 필터 무시하고 전체 표시
  const displayMembers = isDragMode ? orderedMembers : filtered;

  return (
    <div className="min-h-screen bg-aing-bg pt-20">
      <div className="max-w-6xl mx-auto px-6 py-12">
        <Link to="/admin" className="flex items-center gap-2 text-aing-muted hover:text-aing-text text-sm mb-8 transition-colors">
          <ArrowLeft size={14} />Dashboard
        </Link>

        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-semibold text-aing-text">
            부원 관리
            <span className="text-sm font-normal text-aing-muted ml-2">({members.length}명)</span>
          </h1>
          <div className="flex items-center gap-2">
            {/* 드래그 모드 토글 */}
            <button
              onClick={() => {
                setIsDragMode(prev => !prev);
                setOrderSaved(false);
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-medium transition-all ${
                isDragMode
                  ? 'bg-aing-blue text-white border-aing-blue'
                  : 'border-aing-border text-aing-muted hover:border-aing-blue hover:text-aing-blue'
              }`}
            >
              <GripVertical size={13} />
              {isDragMode ? '순서 편집 중' : '순서 편집'}
            </button>
            {isDragMode && (
              <button
                onClick={saveOrder}
                disabled={orderSaving}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  orderSaved
                    ? 'bg-green-500 text-white'
                    : 'btn-primary'
                }`}
              >
                <Check size={13} />
                {orderSaving ? '저장 중...' : orderSaved ? '저장됨 ✓' : '순서 저장'}
              </button>
            )}
            {!showAdd && (
              <button onClick={openAddForm} className="btn-primary flex items-center gap-2 text-sm">
                <PlusCircle size={14} />부원 추가
              </button>
            )}
          </div>
        </div>

        {/* 드래그 모드 안내 */}
        {isDragMode && (
          <div className="mb-4 p-3 rounded-xl bg-blue-50 border border-blue-200 text-xs text-blue-700 flex items-center gap-2">
            <GripVertical size={14} />
            <span>왼쪽 핸들을 드래그해서 순서를 바꾸세요. 변경 후 <strong>순서 저장</strong> 버튼을 눌러야 반영됩니다.</span>
          </div>
        )}

        {/* Add/Edit Form Modal */}
        {showAdd && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
            <div className="bg-white rounded-2xl border border-aing-border shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <form onSubmit={handleSubmit} className="p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-semibold text-aing-text">{editingId ? '부원 수정' : '새 부원 추가'}</h3>
                  <button type="button" onClick={cancelForm}><X size={18}/></button>
                </div>
                <div className="grid sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-aing-muted mb-1 block">이름 *</label>
                    <input value={form.name} onChange={e=>setForm(p=>({...p,name:e.target.value}))} className="input-field" placeholder="이름" required />
                  </div>
                  <div>
                    <label className="text-xs text-aing-muted mb-1 block">역할</label>
                    <input value={form.role} onChange={e=>setForm(p=>({...p,role:e.target.value}))} className="input-field" placeholder="예: Researcher" />
                  </div>
                  <div>
                    <label className="text-xs text-aing-muted mb-1 block">트랙</label>
                    <select value={form.track} onChange={e=>setForm(p=>({...p,track:e.target.value as Member['track']}))} className="input-field">
                      <option value="junior">Junior</option>
                      <option value="senior">Senior</option>
                      <option value="admin">Admin</option>
                      <option value="ob">OB</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-xs text-aing-muted mb-1 block">기수</label>
                    <input value={form.semester} onChange={e=>setForm(p=>({...p,semester:e.target.value}))} className="input-field" placeholder="2026 Spring" />
                  </div>
                  <div>
                    <label className="text-xs text-aing-muted mb-1 block">GitHub URL</label>
                    <input value={form.github} onChange={e=>setForm(p=>({...p,github:e.target.value}))} className="input-field" placeholder="https://github.com/..." />
                  </div>
                  <div>
                    <label className="text-xs text-aing-muted mb-1 block">한 줄 소개</label>
                    <input value={form.bio} onChange={e=>setForm(p=>({...p,bio:e.target.value}))} className="input-field" placeholder="소개" />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="text-xs text-aing-muted mb-1 block">아바타 URL</label>
                    <input value={form.avatar_url} onChange={e=>setForm(p=>({...p,avatar_url:e.target.value}))} className="input-field" placeholder="https://..." />
                  </div>
                  <div>
                    <label className="text-xs text-aing-muted mb-1 block">비밀번호{editingId ? ' (변경시만)' : ''}</label>
                    <input type="password" value={form.password_hash} onChange={e=>setForm(p=>({...p,password_hash:e.target.value}))} className="input-field" placeholder="비밀번호" />
                  </div>
                  <div>
                    <label className="text-xs text-aing-muted mb-1 block">상태</label>
                    <select value={form.status} onChange={e=>setForm(p=>({...p,status:e.target.value as 'busy'|'mid'|'free'}))} className="input-field">
                      <option value="free">여유</option>
                      <option value="mid">보통</option>
                      <option value="busy">바쁨</option>
                    </select>
                  </div>
                  {editingId && (
                    <div className="sm:col-span-2 flex items-center gap-2">
                      <input type="checkbox" id="is_active" checked={form.is_active} onChange={e=>setForm(p=>({...p,is_active:e.target.checked}))} />
                      <label htmlFor="is_active" className="text-sm">활성 멤버</label>
                    </div>
                  )}
                </div>
                <div className="flex gap-3 pt-2">
                  <button type="submit" disabled={saving} className="btn-primary text-sm flex items-center gap-2">
                    <Check size={13}/>
                    {saving ? '저장 중...' : (editingId ? '저장' : '추가')}
                  </button>
                  <button type="button" onClick={cancelForm} className="btn-ghost text-sm">취소</button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Filter & Search (드래그 모드에서 숨김) */}
        {!isDragMode && (
          <div className="flex items-center gap-2 mb-4 flex-wrap">
            {(['all','junior','senior','admin','ob'] as const).map(t => (
              <button
                key={t}
                onClick={() => setTrackFilter(t)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
                  trackFilter === t ? 'bg-aing-dark text-white' : 'border-aing-border text-aing-muted hover:border-aing-blue hover:text-aing-blue'
                }`}
              >
                {t === 'all' ? '전체' : TRACK_LABELS[t]}
              </button>
            ))}
            <div className="relative ml-auto">
              <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-aing-muted"/>
              <input
                type="text" value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="이름, 역할, 기수 검색..."
                className="input-field pl-8 py-1.5 text-xs w-48"
              />
            </div>
          </div>
        )}

        {/* Table */}
        {loading ? (
          <div className="space-y-3">{[...Array(5)].map((_,i) => <div key={i} className="card animate-pulse h-14"/>)}</div>
        ) : (
          <div className="card p-0 overflow-hidden">
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-aing-border bg-aing-bg">
                    <th className="w-8 px-2 py-3"></th>
                    <th className="text-left px-4 py-3 text-xs text-aing-muted font-mono">이름</th>
                    <th className="text-left px-4 py-3 text-xs text-aing-muted font-mono hidden sm:table-cell">역할</th>
                    <th className="text-left px-4 py-3 text-xs text-aing-muted font-mono">트랙</th>
                    <th className="text-left px-4 py-3 text-xs text-aing-muted font-mono hidden md:table-cell">기수</th>
                    <th className="text-left px-4 py-3 text-xs text-aing-muted font-mono hidden md:table-cell">상태</th>
                    <th className="text-right px-4 py-3 text-xs text-aing-muted font-mono">액션</th>
                  </tr>
                </thead>
                <tbody>
                  <SortableContext
                    items={displayMembers.map(m => m.id)}
                    strategy={verticalListSortingStrategy}
                  >
                    {displayMembers.map(member => (
                      <SortableRow
                        key={member.id}
                        member={member}
                        isDragMode={isDragMode}
                        onEdit={openEditForm}
                        onToggleActive={toggleActive}
                        onDelete={deleteMember}
                      />
                    ))}
                  </SortableContext>
                  {displayMembers.length === 0 && (
                    <tr>
                      <td colSpan={7} className="text-center py-8 text-aing-muted text-sm">
                        {search || trackFilter !== 'all' ? '검색 결과가 없습니다.' : '등록된 부원이 없습니다.'}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </DndContext>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminMembers;
