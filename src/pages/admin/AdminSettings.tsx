import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Save, RefreshCw } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';

type Setting = {
  id: string;
  key: string;
  value: string;
  updated_at: string;
};

const SETTING_LABELS: Record<string, string> = {
  tagline: '태그라인 (한 줄 슬로건)',
  description: '동아리 소개 (About 페이지)',
  email: '이메일 주소',
  github: 'GitHub 조직 URL',
  location: '위치 (학교/건물)',
};

const SETTING_KEYS = ['tagline', 'description', 'email', 'github', 'location'];

const AdminSettings: React.FC = () => {
  const { isAdmin } = useAuth();
  const navigate = useNavigate();
  const [settings, setSettings] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);
  const [saved, setSaved] = useState<string | null>(null);

  useEffect(() => {
    if (!isAdmin) { navigate('/admin/login'); return; }
    fetchSettings();
  }, [isAdmin, navigate]);

  const fetchSettings = async () => {
    setLoading(true);
    const { data } = await supabase.from('site_settings').select('*');
    const map: Record<string, string> = {};
    (data as Setting[] || []).forEach(s => { map[s.key] = s.value || ''; });
    setSettings(map);
    setLoading(false);
  };

  const saveSetting = async (key: string) => {
    setSaving(key);
    const value = settings[key] || '';
    await supabase
      .from('site_settings')
      .upsert({ key, value, updated_at: new Date().toISOString() }, { onConflict: 'key' });
    setSaving(null);
    setSaved(key);
    setTimeout(() => setSaved(null), 2000);
  };

  if (!isAdmin) return null;

  return (
    <div className="min-h-screen bg-aing-bg pt-20">
      <div className="max-w-4xl mx-auto px-6 py-12">
        <Link to="/admin" className="flex items-center gap-2 text-aing-muted hover:text-aing-text text-sm mb-8 transition-colors">
          <ArrowLeft size={14} />
          Dashboard
        </Link>

        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-semibold text-aing-text">사이트 설정</h1>
            <p className="text-aing-muted text-sm mt-1">About 페이지 및 사이트 정보를 관리합니다.</p>
          </div>
          <button onClick={fetchSettings} className="btn-ghost flex items-center gap-2 text-sm">
            <RefreshCw size={14} />
            새로고침
          </button>
        </div>

        {loading ? (
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => <div key={i} className="card animate-pulse h-20" />)}
          </div>
        ) : (
          <div className="space-y-4">
            {SETTING_KEYS.map(key => (
              <div key={key} className="card">
                <label className="block text-xs font-mono text-aing-muted mb-2">
                  {SETTING_LABELS[key] || key}
                  <span className="ml-2 text-aing-border">({key})</span>
                </label>
                {key === 'description' ? (
                  <textarea
                    value={settings[key] || ''}
                    onChange={e => setSettings(p => ({ ...p, [key]: e.target.value }))}
                    className="input-field w-full resize-none"
                    rows={3}
                    placeholder={SETTING_LABELS[key]}
                  />
                ) : (
                  <input
                    value={settings[key] || ''}
                    onChange={e => setSettings(p => ({ ...p, [key]: e.target.value }))}
                    className="input-field w-full"
                    placeholder={SETTING_LABELS[key]}
                  />
                )}
                <div className="flex justify-end mt-3">
                  <button
                    onClick={() => saveSetting(key)}
                    disabled={saving === key}
                    className={`btn-primary text-xs flex items-center gap-1.5 transition-all ${
                      saved === key ? 'bg-green-600 border-green-500' : ''
                    }`}
                  >
                    <Save size={12} />
                    {saving === key ? '저장 중...' : saved === key ? '저장됨 ✓' : '저장'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="mt-8 card border-dashed">
          <p className="text-xs text-aing-muted">
            💡 변경사항은 즉시 Supabase에 반영되며, About 페이지가 동적으로 이 데이터를 읽어오도록 설정하면 실시간 반영됩니다.
            현재는 설정값 저장만 지원합니다.
          </p>
        </div>
      </div>
    </div>
  );
};

export default AdminSettings;
