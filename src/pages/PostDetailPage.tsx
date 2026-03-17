import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Eye, MessageSquare, Trash2, Pin } from 'lucide-react';
import { supabase, Post, Comment } from '../lib/supabase';
import AnimatedSection from '../components/AnimatedSection';
import { useAdmin } from '../context/AdminContext';

const CATEGORY_LABELS: Record<string, string> = {
  notice: 'Notice', activity: 'Activity', study: 'Study', project: 'Project',
};
const CATEGORY_COLORS: Record<string, string> = {
  notice: 'text-red-500 border-red-200 bg-red-50',
  activity: 'text-green-500 border-green-200 bg-green-50',
  study: 'text-aing-blue border-blue-200 bg-aing-blue-light',
  project: 'text-purple-500 border-purple-200 bg-purple-50',
};

const demoPost: Post = {
  id: '1',
  title: '[공지] 2026 Spring 신규 부원 모집 안내',
  content: `안녕하세요, **A.ing**입니다.

2026 Spring 학기 신규 부원을 모집합니다.

## 모집 대상
- 가천대학교 재학생 (학년 무관)
- Python 기초 지식 보유자
- AI/ML에 관심 있는 분

## 지원 방법
아래 Contact 페이지를 통해 지원해주세요.

A.ing에서 함께 성장해요! 🚀`,
  author_id: null,
  category: 'notice',
  tags: ['모집', '2026', 'Spring'],
  is_pinned: true,
  views: 120,
  created_at: '2026-03-01T00:00:00Z',
  updated_at: '2026-03-01T00:00:00Z',
};

const PostDetailPage: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAdmin } = useAdmin();
  const [post, setPost] = useState<Post | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [commentForm, setCommentForm] = useState({ name: '', email: '', content: '' });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    const fetchPost = async () => {
      try {
        const { data, error } = await supabase
          .from('posts')
          .select('*, author:members(name)')
          .eq('id', id)
          .single();
        if (error || !data) { setPost(demoPost); }
        else {
          setPost(data);
          // increment view
          await supabase.from('posts').update({ views: (data.views || 0) + 1 }).eq('id', id);
        }
        // fetch comments
        const { data: cmts } = await supabase
          .from('comments')
          .select('*')
          .eq('post_id', id)
          .eq('is_approved', true)
          .order('created_at', { ascending: true });
        setComments(cmts || []);
      } catch {
        setPost(demoPost);
      } finally {
        setLoading(false);
      }
    };
    fetchPost();
  }, [id]);

  const handleComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentForm.name || !commentForm.content) return;
    setSubmitting(true);
    try {
      const { error } = await supabase.from('comments').insert({
        post_id: id,
        author_name: commentForm.name,
        author_email: commentForm.email,
        content: commentForm.content,
        is_approved: false,
      });
      if (!error) {
        setSubmitted(true);
        setCommentForm({ name: '', email: '', content: '' });
      }
    } catch {}
    setSubmitting(false);
  };

  const handleDelete = async () => {
    if (!window.confirm('삭제하시겠습니까?')) return;
    try {
      await supabase.from('posts').delete().eq('id', id);
      navigate('/board');
    } catch {}
  };

  const formatDate = (d: string) => new Date(d).toLocaleDateString('ko-KR', {
    year: 'numeric', month: 'long', day: 'numeric',
  });

  const renderContent = (content: string) => {
    return content
      .replace(/\*\*(.*?)\*\*/g, '<strong class="text-aing-text">$1</strong>')
      .replace(/## (.*)/g, '<h2 class="text-lg font-semibold text-aing-text mt-6 mb-3">$1</h2>')
      .replace(/# (.*)/g, '<h1 class="text-xl font-semibold text-aing-text mt-6 mb-3">$1</h1>')
      .replace(/- (.*)/g, '<li class="ml-4 list-disc">$1</li>')
      .replace(/\n/g, '<br/>');
  };

  if (loading) return (
    <div className="min-h-screen bg-aing-bg pt-32 flex items-center justify-center">
      <div className="text-aing-muted">Loading...</div>
    </div>
  );

  if (!post) return (
    <div className="min-h-screen bg-aing-bg pt-32 flex items-center justify-center">
      <div className="text-aing-muted">Post not found.</div>
    </div>
  );

  return (
    <div className="min-h-screen bg-aing-bg pt-20">
      <div className="max-w-3xl mx-auto px-6 py-12">
        {/* Back */}
        <AnimatedSection>
          <Link to="/board" className="flex items-center gap-2 text-aing-muted hover:text-aing-text text-sm transition-colors mb-8">
            <ArrowLeft size={14} />
            Board
          </Link>
        </AnimatedSection>

        {/* Post */}
        <AnimatedSection delay={100}>
          <article className="card mb-8">
            {/* Meta */}
            <div className="flex items-center gap-3 mb-6 flex-wrap">
              <span className={`text-xs px-2 py-0.5 rounded-full border font-mono ${CATEGORY_COLORS[post.category]}`}>
                {CATEGORY_LABELS[post.category]}
              </span>
              {post.is_pinned && (
                <span className="flex items-center gap-1 text-xs text-aing-blue">
                  <Pin size={10} /> Pinned
                </span>
              )}
              <span className="text-xs text-aing-muted ml-auto">{formatDate(post.created_at)}</span>
            </div>

            {/* Title */}
            <h1 className="text-2xl font-semibold text-aing-text mb-4 leading-tight">
              {post.title}
            </h1>

            {/* Tags */}
            {post.tags && post.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-6">
                {post.tags.map(tag => (
                  <span key={tag} className="tag">#{tag}</span>
                ))}
              </div>
            )}

            <div className="gradient-line mb-6" />

            {/* Content */}
            <div
              className="text-aing-muted text-sm leading-relaxed"
              dangerouslySetInnerHTML={{ __html: renderContent(post.content) }}
            />

            {/* Footer */}
            <div className="flex items-center justify-between mt-8 pt-6 border-t border-aing-border">
              <div className="flex items-center gap-4 text-xs text-aing-muted">
                <span className="flex items-center gap-1"><Eye size={12} /> {post.views}</span>
                <span className="flex items-center gap-1"><MessageSquare size={12} /> {comments.length}</span>
              </div>
              {isAdmin && (
                <div className="flex gap-3">
                  <Link to={`/admin/posts/edit/${post.id}`} className="text-xs text-aing-muted hover:text-aing-text transition-colors">
                    수정
                  </Link>
                  <button onClick={handleDelete} className="text-xs text-red-500 hover:text-red-400 flex items-center gap-1 transition-colors">
                    <Trash2 size={12} /> 삭제
                  </button>
                </div>
              )}
            </div>
          </article>
        </AnimatedSection>

        {/* Comments */}
        <AnimatedSection delay={200}>
          <div className="mb-8">
            <h3 className="text-sm font-semibold text-aing-text mb-4 flex items-center gap-2">
              <MessageSquare size={14} className="text-aing-blue" />
              댓글 {comments.length}개
            </h3>
            {comments.length === 0 ? (
              <p className="text-aing-muted text-sm py-8 text-center">첫 번째 댓글을 남겨보세요.</p>
            ) : (
              <div className="space-y-3">
                {comments.map(c => (
                  <div key={c.id} className="card">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-aing-text">{c.author_name}</span>
                      <span className="text-xs text-aing-muted">
                        {new Date(c.created_at).toLocaleDateString('ko-KR')}
                      </span>
                    </div>
                    <p className="text-sm text-aing-muted leading-relaxed">{c.content}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </AnimatedSection>

        {/* Comment Form */}
        <AnimatedSection delay={300}>
          <div className="card">
            <h3 className="text-sm font-semibold text-aing-text mb-4">댓글 작성</h3>
            {submitted ? (
              <p className="text-aing-muted text-sm py-4 text-center">
                댓글이 등록되었습니다. 관리자 승인 후 표시됩니다.
              </p>
            ) : (
              <form onSubmit={handleComment} className="space-y-3">
                <div className="grid sm:grid-cols-2 gap-3">
                  <input
                    type="text"
                    placeholder="이름 *"
                    value={commentForm.name}
                    onChange={e => setCommentForm(p => ({ ...p, name: e.target.value }))}
                    className="input-field text-sm"
                    required
                  />
                  <input
                    type="email"
                    placeholder="이메일 (선택)"
                    value={commentForm.email}
                    onChange={e => setCommentForm(p => ({ ...p, email: e.target.value }))}
                    className="input-field text-sm"
                  />
                </div>
                <textarea
                  placeholder="댓글 내용 *"
                  value={commentForm.content}
                  onChange={e => setCommentForm(p => ({ ...p, content: e.target.value }))}
                  className="input-field text-sm resize-none"
                  rows={4}
                  required
                />
                <button
                  type="submit"
                  disabled={submitting}
                  className="btn-primary text-sm disabled:opacity-50"
                >
                  {submitting ? '등록 중...' : '댓글 등록'}
                </button>
              </form>
            )}
          </div>
        </AnimatedSection>
      </div>
    </div>
  );
};

export default PostDetailPage;
