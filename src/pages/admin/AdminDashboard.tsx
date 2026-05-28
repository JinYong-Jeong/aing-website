import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { BookOpen, Code2, LogOut, Mail, Settings, TrendingUp, Trophy, Users } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';
import AnimatedSection from '../../components/AnimatedSection';

const AdminDashboard: React.FC = () => {
  const { isAdmin, logout } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState({ members: 0, messages: 0, activities: 0, history: 0, teamPosts: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAdmin) { navigate('/admin/login'); return; }

    const fetchData = async () => {
      try {
        const [members, messages, activities, history, teamPosts] = await Promise.all([
          supabase.from('members').select('id', { count: 'exact', head: true }),
          supabase.from('messages').select('id', { count: 'exact', head: true }),
          supabase.from('activities').select('id', { count: 'exact', head: true }),
          supabase.from('history_events').select('id', { count: 'exact', head: true }),
          supabase.from('team_posts').select('id', { count: 'exact', head: true }),
        ]);

        setStats({
          members: members.count || 0,
          messages: messages.count || 0,
          activities: activities.count || 0,
          history: history.count || 0,
          teamPosts: teamPosts.count || 0,
        });
      } catch {
        // Counts are convenience UI only.
      }
      setLoading(false);
    };

    fetchData();
  }, [isAdmin, navigate]);

  if (!isAdmin) return null;

  const statCards = [
    { label: 'Members', value: stats.members, icon: Users, color: 'text-aing-blue', to: '/admin/members' },
    { label: 'Activities', value: stats.activities, icon: BookOpen, color: 'text-teal-500', to: '/admin/activities' },
    { label: 'History', value: stats.history, icon: Trophy, color: 'text-amber-500', to: '/admin/history' },
    { label: 'Team Posts', value: stats.teamPosts, icon: Users, color: 'text-pink-500', to: '/admin/team' },
    { label: 'Messages', value: stats.messages, icon: Mail, color: 'text-orange-500', to: '/admin/messages' },
  ];

  return (
    <div className="min-h-screen bg-aing-bg pt-20">
      <div className="max-w-6xl mx-auto px-6 py-12">
        <AnimatedSection>
          <div className="flex items-center justify-between mb-12">
            <div>
              <h1 className="text-2xl font-semibold text-aing-text">Admin Dashboard</h1>
              <p className="text-aing-muted text-sm mt-1">A.ing 관리자 패널</p>
            </div>
            <button
              onClick={async () => { await logout(); navigate('/'); }}
              className="btn-ghost flex items-center gap-2 text-sm"
            >
              <LogOut size={14} />
              로그아웃
            </button>
          </div>
        </AnimatedSection>

        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-10">
          {statCards.map((s, i) => (
            <AnimatedSection key={s.label} delay={i * 80}>
              <Link to={s.to} className="card group hover:border-blue-200 block">
                <div className="flex items-start justify-between">
                  <s.icon size={18} className={`${s.color} mb-3`} />
                  <TrendingUp size={12} className="text-aing-muted" />
                </div>
                <div className="text-2xl font-semibold text-aing-text mb-1">
                  {loading ? '-' : s.value}
                </div>
                <div className="text-xs text-aing-muted">{s.label}</div>
              </Link>
            </AnimatedSection>
          ))}
        </div>

        <AnimatedSection delay={200}>
          <div className="card">
            <h3 className="text-sm font-semibold text-aing-text mb-4">Quick Actions</h3>
            <div className="flex flex-wrap gap-3">
              <Link to="/admin/members" className="btn-ghost flex items-center gap-2 text-sm">
                <Users size={14} />
                부원 관리
              </Link>
              <Link to="/admin/projects" className="btn-ghost flex items-center gap-2 text-sm">
                <Code2 size={14} />
                프로젝트 관리
              </Link>
              <Link to="/admin/activities" className="btn-ghost flex items-center gap-2 text-sm">
                <BookOpen size={14} />
                활동 관리
              </Link>
              <Link to="/admin/history" className="btn-ghost flex items-center gap-2 text-sm">
                <Trophy size={14} />
                히스토리 관리
              </Link>
              <Link to="/admin/team" className="btn-ghost flex items-center gap-2 text-sm">
                <Users size={14} />
                팀원 모집 관리
              </Link>
              <Link to="/admin/settings" className="btn-ghost flex items-center gap-2 text-sm">
                <Settings size={14} />
                사이트 설정
              </Link>
              <Link to="/admin/messages" className="btn-ghost flex items-center gap-2 text-sm">
                <Mail size={14} />
                문의 기록
              </Link>
            </div>
          </div>
        </AnimatedSection>
      </div>
    </div>
  );
};

export default AdminDashboard;
