import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Users, MessageSquare, Calendar, Trash2 } from 'lucide-react';
import { supabase, TeamPost, Member } from '../lib/supabase';
import AnimatedSection from '../components/AnimatedSection';

const TeamPostDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [post, setPost] = useState<(TeamPost & { author?: Member }) | null>(null);
  const [loading, setLoading] = useState(true);
  const [showDelete, setShowDelete] = useState(false);
  const [deletePassword, setDeletePassword] = useState('');
  const [deleteError, setDeleteError] = useState('');
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const fetch = async () => {
      const { data } = await supabase
        .from('team_posts')
        .select('*, author:members(name, avatar_url, track, role)')
        .eq('id', id)
        .single();
      setPost(data || null);
      setLoading(false);
    };
    fetch();
  }, [id]);

  const handleDelete = async () => {
    if (!post) return;
    setDeleting(true);
    setDeleteError('');
    try {
      // 작성자 비번 확인
      const authorName = post.author_name || post.author?.name;
      if (authorName) {
        const { data: member } = await supabase
          .from('members')
          .select('password_hash')
          .ilike('name', authorName)
          .single();
        if (member?.password_hash && member.password_hash !== deletePassword) {
          setDeleteError('비밀번호가 틀렸습니다.');
          setDeleting(false);
          return;
        }
      }
      await supabase.from('team_posts').delete().eq('id', id);
      navigate('/team');
    } catch {
      setDeleteError('삭제 중 오류가 발생했습니다.');
    }
    setDeleting(false);
  };

  const formatDate = (d: string) => new Date(d).toLocaleDateString('ko-KR', {
    year: 'numeric', month: 'long', day: 'numeric',
  });

  if (loading) return (
    <div className="min-h-screen bg-aing-bg pt-32 flex items-center justify-center">
      <div className="text-aing-muted text-sm">Loading...</div>
    </div>
  );

  if (!post) return (
    <div className="min-h-screen bg-aing-bg pt-32 flex items-center justify-center">
      <div className="text-center">
        <p className="text-aing-muted mb-4">게시글을 찾을 수 없습니다.</p>
        <Link to="/team" className="btn-ghost text-sm">팀원 모집으로 돌아가기</Link>
      </div>
    </div>
  );

  const authorName = post.author_name || post.author?.name || '익명';
  const isFull = post.current_members >= post.max_members;

  return (
    <div className="min-h-screen bg-aing-bg pt-20">
      <div className="max-w-2xl mx-auto px-6 py-12">
        <AnimatedSection>
          <Link to="/team" className="flex items-center gap-2 text-aing-muted hover:text-aing-text text-sm mb-8 transition-colors">
            <ArrowLeft size={14} />
            팀원 모집
          </Link>
        </AnimatedSection>

        <AnimatedSection delay={100}>
          <div className="card mb-6">
            {/* 상태 + 날짜 */}
            <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
              <span className={`text-xs px-3 py-1 rounded-full border font-medium ${
                post.status === 'open'
                  ? 'text-green-600 border-green-200 bg-green-50'
                  : 'text-aing-muted border-aing-border bg-gray-50'
              }`}>
                {post.status === 'open' ? '모집중' : '마감'}
              </span>
              <span className="text-xs text-aing-muted flex items-center gap-1">
                <Calendar size={12} />
                {formatDate(post.created_at)}
              </span>
            </div>

            {/* 제목 */}
            <h1 className="text-2xl font-semibold text-aing-text mb-3">{post.title}</h1>

            {/* 작성자 */}
            <div className="flex items-center gap-2 mb-6 pb-6 border-b border-aing-border">
              <div className="w-7 h-7 rounded-full bg-gradient-to-br from-aing-blue/30 to-purple-400/30 border border-aing-border flex items-center justify-center">
                <span className="text-xs font-semibold text-aing-text">{authorName[0]}</span>
              </div>
              <span className="text-sm text-aing-muted">{authorName}</span>
            </div>

            {/* 설명 */}
            <div className="mb-6">
              <h3 className="text-sm font-semibold text-aing-text mb-2">프로젝트 설명</h3>
              <p className="text-sm text-aing-muted leading-relaxed whitespace-pre-wrap">{post.description}</p>
            </div>

            {/* 모집 인원 */}
            <div className="mb-6">
              <h3 className="text-sm font-semibold text-aing-text mb-2 flex items-center gap-1">
                <Users size={14} /> 모집 인원
              </h3>
              <div className="flex items-center gap-3">
                <div className="flex gap-1">
                  {Array.from({ length: post.max_members }).map((_, i) => (
                    <div
                      key={i}
                      className={`w-6 h-6 rounded-full border-2 ${
                        i < post.current_members
                          ? 'bg-aing-blue border-aing-blue'
                          : 'bg-white border-aing-border'
                      }`}
                    />
                  ))}
                </div>
                <span className="text-sm text-aing-muted">
                  {post.current_members} / {post.max_members}명
                  {isFull && <span className="text-red-500 ml-2">(마감)</span>}
                </span>
              </div>
            </div>

            {/* 필요 스킬 */}
            {post.required_skills && post.required_skills.length > 0 && (
              <div className="mb-6">
                <h3 className="text-sm font-semibold text-aing-text mb-2">필요 스킬</h3>
                <div className="flex flex-wrap gap-2">
                  {post.required_skills.map(skill => (
                    <span key={skill} className="tag">{skill}</span>
                  ))}
                </div>
              </div>
            )}

            {/* 연락처 */}
            {post.contact && (
              <div className="mb-6">
                <h3 className="text-sm font-semibold text-aing-text mb-2 flex items-center gap-1">
                  <MessageSquare size={14} /> 연락수단
                </h3>
                <p className="text-sm text-aing-blue">{post.contact}</p>
              </div>
            )}

            {/* 삭제 버튼 */}
            <div className="pt-4 border-t border-aing-border">
              {!showDelete ? (
                <button
                  onClick={() => setShowDelete(true)}
                  className="flex items-center gap-1 text-xs text-aing-muted hover:text-red-500 transition-colors"
                >
                  <Trash2 size={12} /> 게시글 삭제
                </button>
              ) : (
                <div className="space-y-3">
                  <p className="text-xs text-aing-muted">작성자 비밀번호를 입력하세요.</p>
                  <div className="flex gap-2">
                    <input
                      type="password"
                      value={deletePassword}
                      onChange={e => setDeletePassword(e.target.value)}
                      className="input-field text-sm flex-1"
                      placeholder="비밀번호"
                    />
                    <button
                      onClick={handleDelete}
                      disabled={deleting}
                      className="px-3 py-2 bg-red-500 text-white text-xs rounded-lg hover:bg-red-600 disabled:opacity-50 transition-colors"
                    >
                      {deleting ? '삭제 중...' : '삭제'}
                    </button>
                    <button
                      onClick={() => { setShowDelete(false); setDeleteError(''); }}
                      className="px-3 py-2 border border-aing-border text-aing-muted text-xs rounded-lg hover:text-aing-text transition-colors"
                    >
                      취소
                    </button>
                  </div>
                  {deleteError && <p className="text-red-500 text-xs">{deleteError}</p>}
                </div>
              )}
            </div>
          </div>
        </AnimatedSection>

        <AnimatedSection delay={200}>
          <Link to="/team" className="btn-ghost text-sm inline-flex items-center gap-2">
            <ArrowLeft size={14} /> 목록으로
          </Link>
        </AnimatedSection>
      </div>
    </div>
  );
};

export default TeamPostDetailPage;
