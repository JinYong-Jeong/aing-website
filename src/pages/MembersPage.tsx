import React, { useEffect, useState } from 'react';
import { Github, Users } from 'lucide-react';
import { supabase, Member } from '../lib/supabase';
import AnimatedSection from '../components/AnimatedSection';

const TRACK_LABELS: Record<string, string> = {
  junior: 'Junior',
  senior: 'Senior',
  admin: 'Admin',
};

const TRACK_COLORS: Record<string, string> = {
  junior: 'text-aing-blue border-blue-200 bg-aing-blue-light',
  senior: 'text-purple-500 border-purple-200 bg-purple-50',
  admin: 'text-green-500 border-green-200 bg-green-50',
};

const demoMembers: Member[] = [
  { id: '1', name: '송이두', role: 'President', track: 'admin', semester: '2026 Spring', github: 'https://github.com', is_active: true, created_at: '' },
  { id: '2', name: '정진용', role: 'Researcher', track: 'senior', semester: '2026 Spring', github: 'https://github.com/JinYong-Jeong', bio: 'On-Device AI Agent, Federated Learning', is_active: true, created_at: '' },
  { id: '3', name: 'Member 3', role: 'Junior', track: 'junior', semester: '2026 Spring', is_active: true, created_at: '' },
  { id: '4', name: 'Member 4', role: 'Senior', track: 'senior', semester: '2026 Spring', is_active: true, created_at: '' },
  { id: '5', name: 'Member 5', role: 'Junior', track: 'junior', semester: '2026 Spring', is_active: true, created_at: '' },
  { id: '6', name: 'Member 6', role: 'Junior', track: 'junior', semester: '2026 Spring', is_active: true, created_at: '' },
];

const MembersPage: React.FC = () => {
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'junior' | 'senior' | 'admin'>('all');

  useEffect(() => {
    const fetchMembers = async () => {
      try {
        const { data, error } = await supabase
          .from('members')
          .select('*')
          .eq('is_active', true)
          .order('created_at', { ascending: true });
        if (error || !data || data.length === 0) {
          setMembers(demoMembers);
        } else {
          setMembers(data);
        }
      } catch {
        setMembers(demoMembers);
      } finally {
        setLoading(false);
      }
    };
    fetchMembers();
  }, []);

  const filtered = filter === 'all' ? members : members.filter(m => m.track === filter);

  const getInitials = (name: string) =>
    name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);

  return (
    <div className="min-h-screen bg-aing-bg pt-20">
      {/* Header */}
      <section className="py-20 px-6 border-b border-aing-border">
        <div className="max-w-4xl mx-auto">
          <AnimatedSection>
            <div className="inline-flex items-center gap-2 tag-blue mb-6">
              <Users size={12} />
              <span>Members</span>
            </div>
            <h1 className="section-title text-5xl mb-4">
              <span className="text-gradient">Our People</span>
            </h1>
            <p className="section-subtitle">AI를 함께 탐구하는 A.ing의 멤버들</p>
          </AnimatedSection>
        </div>
      </section>

      {/* Filter */}
      <section className="py-8 px-6 border-b border-aing-border sticky top-16 z-30 glass">
        <div className="max-w-6xl mx-auto flex items-center gap-3 overflow-x-auto">
          {(['all', 'admin', 'senior', 'junior'] as const).map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                filter === f
                  ? 'bg-aing-dark text-white'
                  : 'border border-aing-border text-aing-muted hover:border-aing-blue hover:text-aing-blue'
              }`}
            >
              {f === 'all' ? 'All' : TRACK_LABELS[f]}
            </button>
          ))}
          <span className="text-aing-muted text-sm ml-auto shrink-0">
            {filtered.length} members
          </span>
        </div>
      </section>

      {/* Grid */}
      <section className="py-16 px-6">
        <div className="max-w-6xl mx-auto">
          {loading ? (
            <div className="grid md:grid-cols-3 lg:grid-cols-4 gap-4">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="card animate-pulse">
                  <div className="w-16 h-16 rounded-2xl bg-aing-border mb-4" />
                  <div className="h-4 bg-aing-border rounded w-2/3 mb-2" />
                  <div className="h-3 bg-aing-border rounded w-1/2" />
                </div>
              ))}
            </div>
          ) : (
            <div className="grid md:grid-cols-3 lg:grid-cols-4 gap-4">
              {filtered.map((member, i) => (
                <AnimatedSection key={member.id} delay={i * 50}>
                  <div className="card group hover:border-blue-200">
                    {/* Avatar */}
                    <div className="mb-4">
                      {member.avatar_url ? (
                        <img
                          src={member.avatar_url}
                          alt={member.name}
                          className="w-16 h-16 rounded-2xl object-cover"
                        />
                      ) : (
                        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-100 to-purple-100 border border-aing-border flex items-center justify-center">
                          <span className="text-aing-text font-semibold text-lg">
                            {getInitials(member.name)}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Info */}
                    <div className="mb-3">
                      <h3 className="font-semibold text-aing-text text-sm">{member.name}</h3>
                      <p className="text-aing-muted text-xs mt-0.5">{member.role}</p>
                    </div>

                    {/* Tags */}
                    <div className="flex flex-wrap gap-2 mb-4">
                      <span className={`text-xs px-2 py-0.5 rounded-full border font-mono ${TRACK_COLORS[member.track]}`}>
                        {TRACK_LABELS[member.track]}
                      </span>
                      <span className="text-xs px-2 py-0.5 rounded-full border border-aing-border text-aing-muted font-mono">
                        {member.semester}
                      </span>
                    </div>

                    {/* Bio */}
                    {member.bio && (
                      <p className="text-aing-muted text-xs leading-relaxed mb-3 line-clamp-2">
                        {member.bio}
                      </p>
                    )}

                    {/* Links */}
                    {member.github && (
                      <a
                        href={member.github}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center gap-1 text-xs text-aing-muted hover:text-aing-text transition-colors"
                      >
                        <Github size={12} />
                        GitHub
                      </a>
                    )}
                  </div>
                </AnimatedSection>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default MembersPage;
