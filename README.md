# A.ing Website

가천대학교 AI 연합 동아리 **A.ing** 공식 웹사이트

## 기술 스택

- **Frontend**: React 18, TypeScript, Tailwind CSS
- **Backend**: Supabase (PostgreSQL + Auth)
- **Deployment**: Vercel
- **Icons**: lucide-react

## 로컬 실행

```bash
# 1. 의존성 설치
npm install

# 2. 환경변수 설정
cp .env.example .env.local
# REACT_APP_SUPABASE_URL=your_supabase_url
# REACT_APP_SUPABASE_ANON_KEY=your_supabase_anon_key

# 3. 개발 서버 실행
npm start
```

## 빌드 & 배포

```bash
# 빌드
npm run build

# Vercel 배포
vercel --prod
```

## 페이지 구조

| 경로 | 페이지 | 설명 |
|------|--------|------|
| `/` | HomePage | 메인 페이지 |
| `/about` | AboutPage | 소개 |
| `/activities` | ActivitiesPage | 활동 내역 |
| `/projects` | ProjectsPage | 프로젝트 목록 |
| `/projects/:id` | ProjectDetailPage | 프로젝트 상세 |
| `/members` | MembersPage | 멤버 목록 |
| `/members/:id` | MemberDetailPage | 멤버 프로필 |
| `/members/:id/edit` | MemberProfilePage | 프로필 편집 |
| `/team` | TeamPage | 팀 구성 |
| `/board` | BoardPage | 커뮤니티 게시판 |
| `/board/:id` | PostDetailPage | 게시글 상세 |
| `/board/new` | NewPostPage | 새 글 작성 |
| `/contact` | ContactPage | 문의 |
| `/login` | LoginPage | 일반 부원 로그인 |
| `/admin/login` | AdminLoginPage | 어드민 로그인 |
| `/admin` | AdminDashboard | 어드민 대시보드 |
| `/admin/posts` | AdminPosts | 게시글 관리 |
| `/admin/members` | AdminMembers | 멤버 관리 |
| `/admin/projects` | AdminProjects | 프로젝트 관리 |
| `/admin/activities` | AdminActivities | 활동 관리 |
| `/admin/comments` | AdminComments | 댓글 관리 |
| `/admin/messages` | AdminMessages | 메시지 관리 |
| `/admin/settings` | AdminSettings | 설정 |

## DB 스키마

### members 테이블
```sql
id, name, role, track, semester, github, linkedin, avatar_url, bio,
is_active, created_at, password_hash, interests[], workload, status,
skills[], looking_for_team, project_idea, contact_info, contact_email
```

### posts 테이블
```sql
id, title, content, author_id, author_name, category,
tags[], is_pinned, views, created_at, updated_at
```

### comments 테이블
```sql
id, post_id, author_name, author_email, content, is_approved,
parent_id, created_at
```

### Supabase 마이그레이션 스크립트
- `supabase_schema_v6.sql` — linkedin 컬럼 추가

## 인증 구조

- `src/context/AuthContext.tsx` — 통합 인증 (users 테이블 → members 테이블 → admin fallback)
- `src/context/AdminContext.tsx` — 레거시 (유지)
- 세션: `sessionStorage.aing_user`

## 공통 상수

`src/lib/constants.ts` — TRACK_LABELS, TRACK_COLORS, STATUS_LABELS, STATUS_COLORS, CATEGORY_LABELS, CATEGORY_COLORS
