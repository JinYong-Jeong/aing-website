import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { MessageSquare, Eye, Pin, ChevronRight, Search, PlusCircle } from 'lucide-react';
import { supabase, Post } from '../lib/supabase';
import AnimatedSection from '../components/AnimatedSection';
import { useAdmin } from '../context/AdminContext';

const CATEGORY_LABELS: Record<string, string> = {
  notice: 'Notice',
  activity: 'Activity',
  study: 'Study',
  project: 'Project',
};

const CATEGORY_COLORS: Record<string, string> = {
  notice: 'text-red-400 border-red-400/30 bg-red-400/10',
  activity: 'text-green-400 border-green-400/30 bg-green-400/10',
  study: 'text-aing-blue border-aing-blue/30 bg-aing-blue/10',
  project: 'text-purple-400 border-purple-400/30 bg-purple-400/10',
};

const demoPosts: Post[] = [
  {
    id: '1',
    title: '[공지] 2026 Spring 신규 부원 모집 안내',
    content: '안녕하세요, A.ing입니다. 2026 Spring 학기 신규 부원을 모집합니다.',
    author_id: '1',
    category: 'notice',
    tags: ['모집', '2026'],
    is_pinned: true,
    views: 120,
    created_at: '2026-03-01T00:00:00Z',
    updated_at: '2026-03-01T00:00:00Z',
  },
  {
    id: '2',
    title: 'ResNet 구현 스터디 1주차 후기',
    content: 'ResNet-50을 직접 구현하며 Skip Connection의 의미를 다시 느꼈습니다...',
    author_id: '2',
    category: 'study',
    tags: ['ResNet', 'CV', 'PyTorch'],
    is_pinned: false,
    views: 45,
    created_at: '2026-03-10T00:00:00Z',
    updated_at: '2026-03-10T00:00:00Z',
  },
  {
    id: '3',
    title: 'Transformer Study 킥오프 세션 정리',
    content: 'Attention is All You Need 논문 리뷰 및 구현 계획을 공유합니다.',
    author_id: '1',
    category: 'study',
    tags: ['Transformer', 'NLP', 'Attention'],
    is_pinned: false,
    views: 67,
    created_at: '2026-03-08T00:00:00Z',
    updated_at: '2026-03-08T00:00:00Z',
  },
  {
    id: '4',
    title: '26-Spring Senior Session 프로젝트 소개',
    content: '이번 학기 시니어 트랙은 CV/NLP/RL 세 팀으로 나눠 진행됩니다.',
    author_id: '1',
    category: 'activity',
    tags: ['Senior', 'Project', '2026'],
    is_pinned: false,
    views: 88,
    created_at: '2026-03-05T00:00:00Z',
    updated_at: '2026-03-05T00:00:00Z',
  },
];

const BoardPage: React.FC = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'notice' | 'activity' | 'study' | 'project'>('all');
  const [search, setSearch] = useState('');
  const { isAdmin } = useAdmin();

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const { data, error } = await supabase
          .from('posts')
          .select('*, author:members(name)')
          .order('is_pinned', { ascending: false })
          .order('created_at', { ascending: false });
        if (error || !data || data.length === 0) {
          setPosts(demoPosts);
        } else {
          setPosts(data);
        }
      } catch {
        setPosts(demoPosts);
      } finally {
        setLoading(false);
      }
    };
    fetchPosts();
  }, []);

  const filtered = posts
    .filter(p => filter === 'all' || p.category === filter)
    .filter(p => !search || p.title.toLowerCase().includes(search.toLowerCase()));

  const formatDate = (d: string) => {
    const date = new Date(d);
    return date.toLocaleDateString('ko-KR', { year: 'numeric', month: '2-digit', day: '2-digit' });
  };

  return (
    <div className="min-h-screen bg-aing-black pt-20">
      {/* Header */}
      <section className="py-20 px-6 border-b border-aing-border">
        <div className="max-w-4xl mx-auto flex items-start justify-between flex-wrap gap-4">
          <AnimatedSection>
            <div className="inline-flex items-center gap-2 tag-blue mb-6">
              <MessageSquare size={12} />
              <span>Board</span>
            </div>
            <h1 className="section-title text-5xl mb-4">
              <span className="text-gradient">Community</span>
            </h1>
            <p className="section-subtitle">공지사항, 활동 후기, 스터디 자료를 공유합니다.</p>
          </AnimatedSection>
          {isAdmin && (
            <Link to="/admin/posts/new" className="btn-primary flex items-center gap-2 text-sm mt-auto">
              <PlusCircle size={16} />
              새 글 작성
            </Link>
          )}
        </div>
      </section>

      {/* Controls */}
      <section className="py-6 px-6 border-b border-aing-border sticky top-16 z-30 glass">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-start sm:items-center gap-4">
          {/* Category filter */}
          <div className="flex items-center gap-2 overflow-x-auto shrink-0">
            {(['all', 'notice', 'activity', 'study', 'project'] as const).map(f => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                  filter === f
                    ? 'bg-aing-white text-aing-black'
                    : 'border border-aing-border text-aing-muted hover:border-aing-blue/50 hover:text-aing-blue'
                }`}
              >
                {f === 'all' ? 'All' : CATEGORY_LABELS[f]}
              </button>
            ))}
          </div>

          {/* Search */}
          <div className="flex items-center gap-2 border border-aing-border rounded-xl px-3 py-2 bg-aing-card w-full sm:w-64 ml-auto">
            <Search size={14} className="text-aing-muted shrink-0" />
            <input
              type="text"
              placeholder="Search..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="bg-transparent text-sm text-aing-white placeholder-aing-muted focus:outline-none w-full"
            />
          </div>
        </div>
      </section>

      {/* Posts */}
      <section className="py-12 px-6">
        <div className="max-w-6xl mx-auto">
          {loading ? (
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="card animate-pulse h-20" />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-24 text-aing-muted">
              <MessageSquare size={40} className="mx-auto mb-4 opacity-30" />
              <p>게시글이 없습니다.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {filtered.map((post, i) => (
                <AnimatedSection key={post.id} delay={i * 50}>
                  <Link
                    to={`/board/${post.id}`}
                    className="card flex items-center gap-4 hover:border-aing-blue/30 group cursor-pointer"
                  >
                    {/* Pin */}
                    {post.is_pinned && (
                      <Pin size={14} className="text-aing-blue shrink-0" />
                    )}

                    {/* Category */}
                    <span className={`text-xs px-2 py-0.5 rounded-full border font-mono shrink-0 ${CATEGORY_COLORS[post.category]}`}>
                      {CATEGORY_LABELS[post.category]}
                    </span>

                    {/* Title */}
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-medium text-aing-white truncate group-hover:text-aing-blue transition-colors">
                        {post.title}
                      </h3>
                      {post.tags && post.tags.length > 0 && (
                        <div className="flex gap-1 mt-1 overflow-hidden">
                          {post.tags.slice(0, 3).map(tag => (
                            <span key={tag} className="text-xs text-aing-muted font-mono">#{tag}</span>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Meta */}
                    <div className="flex items-center gap-4 text-xs text-aing-muted shrink-0">
                      <span className="hidden md:flex items-center gap-1">
                        <Eye size={12} />
                        {post.views}
                      </span>
                      <span>{formatDate(post.created_at)}</span>
                      <ChevronRight size={14} className="text-aing-muted group-hover:text-aing-blue transition-colors" />
                    </div>
                  </Link>
                </AnimatedSection>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default BoardPage;
