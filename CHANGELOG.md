# A.ing Website - Changelog

## [1.0.0] - 2026-03-23

### 홈페이지 리디자인
- interests 태그 (Computer Vision, NLP 등) 제거 — 특정 분야 명시 없이 AI 전반 환영으로 방향 변경
- Stats 섹션 (40+ Active Members 등) 제거
- Tech Stack 섹션 제거
- 트랙 카드 디자인 개선 — 컬러 accent, 아이콘, 배지, 호버 애니메이션 적용
- CTA 배너 리디자인 — 다크 그라디언트 + 블루 glow + 그리드 오버레이

### About 페이지 수정
- 주니어 트랙 주차 계획을 실제 운영 방식에 맞게 수정 (4주: 스터디→구현→실험→정리)
- 주니어 트랙을 ResNet / Transformer 두 세션으로 분리
- 시니어 트랙 주차 계획 8주로 확장 (readme 기반)
- Research Interests 섹션 제거
- 지원 자격 조정 — "기본적인 딥러닝 지식" 필수→우대로 이동, "주니어 수료 경험" 항목 제거

### 보안 강화 (bcrypt 전면 적용)
- `check_member_password` RPC 추가 — 일반 부원 로그인 bcrypt 검증
- `set_member_password` RPC 추가 — 비밀번호 bcrypt 해싱 저장
- `AuthContext` 수정 — members 평문 비교 제거, RPC로 교체
- `AdminMembers` 수정 — 비밀번호 저장 시 `set_member_password` RPC 경유
- `MemberProfilePage` 수정 — 프로필 비밀번호 변경/검증 모두 RPC 경유
- 기존 평문 저장된 비밀번호 일괄 bcrypt 재해싱 완료
- Admin Settings 보안 경고 → 초록 "보안 상태: bcrypt 해싱 완료"로 교체

### 마크다운 렌더러 교체
- 기존 regex 파서 제거 → `react-markdown` + `remark-gfm` + `rehype-raw` 도입
- 지원 요소: 헤딩, 표(GFM), 코드블록(다크), 인라인코드, 링크, 이미지(배지 포함), `<br>`, 인용문(blockquote), 구분선, 굵게/기울임
- `MarkdownRenderer` 공통 컴포넌트 생성 — PostDetailPage, NewPostPage 미리보기에 적용

### 수료 기능 추가
- `activity_awards.rank`에 `honor_completion`(우수 수료), `completion`(수료) 값 추가
- DB `activity_awards_rank_check` constraint 갱신
- Study/Project 활동에서 수료 멤버 태그 가능
- Study/Project 수료 태그 시 멀티셀렉트로 여러 명 일괄 처리
- Competition은 기존 단일 수상 태그 유지
- 멤버 프로필에 수상 내역 / 수료 내역 섹션 분리 표시

### Activities 페이지
- `completed` 상태 활동 목록에서 숨김 (History 페이지에서만 확인)
- Admin 로그인 시 completed 활동도 표시 (관리 목적)

### schema_final.sql 갱신 (v1.0.0)
- `activity_awards` 테이블 실제 구조로 수정 (activity_id, member_id, rank, note)
- rank check constraint에 `honor_completion`, `completion` 추가
- `check_member_password`, `set_member_password` RPC 추가
- `project_members` 테이블 추가
- `members` 테이블에 `skills`, `contact_info`, `contact_email` 컬럼 추가
- 불필요한 레거시 컬럼 정리

**Commits**: d5b6cc5 → e248335

---

## [0.9.0] - 2026-03-22

### OB 트랙 오류 수정 + 부원 순서 드래그앤드롭 편집

#### 버그 수정
- **OB 트랙 DB 제약 오류**: `members_track_check` 제약 조건에 `'ob'` 값이 누락되어 OB 트랙 멤버 추가 시 `check constraint violation` 오류 발생 → 제약 조건 재생성으로 수정
  - DROP CONSTRAINT → ADD CONSTRAINT (junior/senior/admin/ob 모두 허용)

#### 신규 기능
- **부원 순서 드래그앤드롭 편집** (Admin → 부원 관리)
  - '순서 편집' 버튼으로 드래그 모드 토글
  - 각 행 왼쪽 핸들(⠿) 드래그로 순서 변경
  - '순서 저장' 버튼 클릭 시 `site_settings.member_order`에 JSON 배열로 저장
  - 드래그 모드에서는 검색/필터 숨김, 전체 순서 일괄 편집
  - 새 부원 추가 시 순서 목록 끝에 자동 추가
- **Members 페이지 저장 순서 반영**: 어드민에서 저장한 순서대로 `/members` 페이지 표시
  - `site_settings.member_order` 읽어서 정렬, 새 멤버는 끝에 추가

#### 기술
- `@dnd-kit/core`, `@dnd-kit/sortable`, `@dnd-kit/utilities` 패키지 추가
- DDL 없이 `site_settings` 테이블 활용 (Supabase anon key로 upsert 가능)

**Commit**: e8dce17

---

## [0.8.0] - 2026-03-19

### 주요 완료 기능

- AdminSettings → 사이트 전역 반영 (Footer, Contact, Members 관심분야)
- 관심분야 태그 추가/삭제 UI
- Supabase bcrypt 비밀번호 해싱 (`check_user_password` RPC) — admin/ops 계정
- Activity slug 라우팅 (`/activities/숫자`)
- Activity `instagram_url`, `detail_content` 필드 추가
- 모집중 Navbar 배지 → 구글폼 연결
- 페이지네이션 footer 바로 위 위치
- ScrollToTop (메뉴 클릭 시 최상단 이동)
- Members 필터 sticky 제거
- Notion ContactPage 표시
- 관리자 페이지 전체 검색 기능
- Admin Members 테이블형 UI

---

## [0.7.0] - 2026-03-18

### Activity 페이지 개편 + 운영진 페이지 + 커뮤니티 강화

#### Activity
- `Activity` 타입 4종: `study | project | competition | seminar`
- 신규 필드: `detail_url`, `start_date`, `end_date`, `participants`, `result`, `image_url`
- 필터 바 (전체 / Study / Project / Competition / Seminar)
- 타입별 카드 디자인 — 아이콘, 컬러 구분
- Competition 카드: 날짜, 팀 규모, 결과 배지, "대회 보기" 버튼
- Admin 인라인 수정/삭제

#### History 페이지 신규 (`/history`)
- 세로 타임라인 레이아웃, 학기별 그룹
- 타입 필터 지원

#### About 운영진 페이지
- `/about/ops` — 조직도 레이아웃 (회장 → 부회장 → 팀장 → 팀원)
- `/about/ex-ops` — 전 운영진 목록
- About 페이지 서브 네비게이션 추가

#### 커뮤니티 (Board)
- 게시글 좋아요 (localStorage 기반)
- 댓글 수 표시
- 작성자 아바타 (이름 이니셜 그라디언트)
- Study 게시글 MD 내보내기 (단일/일괄)

#### 기타
- 마크다운 미리보기 토글 (NewPostPage)
- Navbar History 링크 추가, About 드롭다운 전환
- `isAdmin` 조건에 `ops` 역할 추가

---

## [0.6.0] - 2026-03-17

### 추가
- 일반 부원 로그인 기능 (`/login`)
- 로그인 시 Navbar에 프로필 아바타 표시 (클릭 → 본인 프로필)
- 커뮤니티 글 작성자 이름 공개
- 프로필 LinkedIn 필드 추가
- `src/lib/constants.ts` — 공통 상수 파일 (TRACK, STATUS, CATEGORY)

### 수정
- Admin 로그인 AuthContext 연동 수정 (`useAdmin` → `useAuth`)
- 프로필 저장 완전 수정 (fallback 메시지 제거)
- 통합 인증: users 테이블 + members 테이블 동시 지원
- PostDetailPage `useAdmin` → `useAuth` 마이그레이션
- NewPostPage: 로그인 상태면 작성자 자동 입력

---

## [0.5.0] - 이전 작업

### 추가
- Supabase 연동 (members, posts, comments 테이블)
- Admin 대시보드 및 관리 페이지
- 프로필 비밀번호 보호 편집
- 커뮤니티 게시판 (BoardPage, PostDetailPage, NewPostPage)
- 프로젝트 페이지 (ProjectsPage, ProjectDetailPage)
- Team 페이지


### OB 트랙 오류 수정 + 부원 순서 드래그앤드롭 편집

#### 버그 수정
- **OB 트랙 DB 제약 오류**: `members_track_check` 제약 조건에 `'ob'` 값이 누락되어 OB 트랙 멤버 추가 시 `check constraint violation` 오류 발생 → 제약 조건 재생성으로 수정
  - DROP CONSTRAINT → ADD CONSTRAINT (junior/senior/admin/ob 모두 허용)

#### 신규 기능
- **부원 순서 드래그앤드롭 편집** (Admin → 부원 관리)
  - '순서 편집' 버튼으로 드래그 모드 토글
  - 각 행 왼쪽 핸들(⠿) 드래그로 순서 변경
  - '순서 저장' 버튼 클릭 시 `site_settings.member_order`에 JSON 배열로 저장
  - 드래그 모드에서는 검색/필터 숨김, 전체 순서 일괄 편집
  - 새 부원 추가 시 순서 목록 끝에 자동 추가
- **Members 페이지 저장 순서 반영**: 어드민에서 저장한 순서대로 `/members` 페이지 표시
  - `site_settings.member_order` 읽어서 정렬, 새 멤버는 끝에 추가

#### 기술
- `@dnd-kit/core`, `@dnd-kit/sortable`, `@dnd-kit/utilities` 패키지 추가
- DDL 없이 `site_settings` 테이블 활용 (Supabase anon key로 upsert 가능)

**Commit**: e8dce17

---

## 2026-03-19

### 최종 완료 기능

- AdminSettings → 사이트 전역 반영 (Footer, Contact, Members 관심분야)
- 관심분야 태그 추가/삭제 UI
- Supabase bcrypt 비밀번호 해싱 (check_user_password RPC)
- Activity slug 라우팅 (/activities/숫자)
- Activity instagram_url, detail_content 필드
- 모집중 Navbar 배지 → 구글폼 연결
- 페이지네이션 footer 바로 위 위치
- ScrollToTop (메뉴 클릭 시 최상단 이동)
- Members 필터 sticky 제거
- Notion ContactPage 표시
- 관리자 페이지 전체 검색 기능
- Admin Members 테이블형 UI

---

## 2026-03-18

### CHANGELOG-260318

**Date**: 2026-03-18  
**Commit**: feat: 260318 - activity upgrade, ops team pages, community enhancement, role-based admin

---

#### Summary of Changes

##### PART 1 — Activity Page Upgrade

###### 1A. Enhanced Activity Type (`src/lib/supabase.ts`)
- `Activity` type now supports 4 types: `study | project | competition | seminar`
- New optional fields added: `detail_url`, `start_date`, `end_date`, `participants`, `result`, `image_url`
- Added `OpsTeamMember` and `ExOpsMember` types

###### 1B. ActivitiesPage (`src/pages/ActivitiesPage.tsx`) — Full rewrite
- **Filter bar** at top: All / Study / Project / Competition / Seminar
- **4 card types** with distinct icons and color schemes:
  - study → BookOpen, blue
  - project → Code2, purple
  - competition → Trophy, amber/orange
  - seminar → Users, green
- **Competition card extras**: date range, team size (participants), result badge (trophy icon), "대회 보기" amber button (uses `detail_url`)
- **Result badge** (trophy + text) shown on all types when `result` is set
- **Admin inline edit**: pencil + trash icons visible on hover when `isAdmin`; opens full CRUD modal
- **Dummy test entries** added to fallback: `[TEST]` prefixed, clearly labeled
- Semester grouping preserved, sorted newest first
- Link to `/history` at bottom

###### 1C. HistoryPage (`src/pages/HistoryPage.tsx`) — New page
- Route: `/history`
- Vertical timeline layout with colored dots per activity type
- Semester section headers with item count
- Shows: type badge, status, title, description, result badge, tags, date range
- Filter by type (All / Study / Project / Competition / Seminar)
- Supabase fetch with hardcoded fallback

###### 1D. AdminActivities (`src/pages/admin/AdminActivities.tsx`)
- Added `competition` and `seminar` to type dropdown
- New form fields: `start_date`, `end_date`, `participants`, `result`, `detail_url`, `image_url`
- "히스토리 보기" link button in header breadcrumb area

###### 1E. Role-based Admin (`src/context/AuthContext.tsx`)
- `isAdmin` now = `user?.role === 'admin' || user?.role === 'ops'`
- `AuthUser.role` type extended to include `'ops'`

---

##### PART 2 — About Page: Ops Team + Ex-Ops

###### 2A. AboutOpsPage (`src/pages/AboutOpsPage.tsx`) — New page
- Route: `/about/ops`
- Org chart layout: President → VP → Leads → Members (rows with connector lines)
- Each card: name initial avatar, role badge (color by level), responsibilities text
- Level config: president (amber/crown), vp (purple), lead (blue), member (muted)
- Supabase `ops_members` table fetch; fallback to demo data (3 test entries)
- Admin inline add/edit/delete buttons

###### 2B. ExOpsPage (`src/pages/ExOpsPage.tsx`) — New page
- Route: `/about/ex-ops`
- Long row layout per person: avatar circle, name, role badge, generation, term, description
- Supabase `ex_ops_members` table fetch; fallback to 1 demo entry
- Admin inline add/edit/delete buttons

###### 2C. AboutPage sub-navigation (`src/pages/AboutPage.tsx`)
- Breadcrumb-style sub-nav at top: About | Ops Team | Ex-Ops

---

##### PART 3 — Community (Board) Upgrade

###### 3A. BoardPage (`src/pages/BoardPage.tsx`)
- **Like button** (heart) per post row; count stored in `localStorage`; toggle on/off
- **Comment count** displayed per row (fetched from Supabase comments table)
- **Author avatar**: colored gradient circle showing first letter of author name
- **"Study 내보내기" button** in header (visible when logged in):
  - Opens modal with checkboxes for user's Study-category posts
  - Generates `.md` with full content + comments
  - MD format: `### Title`, metadata block, content, `#### 댓글` section
  - Filename: `aing-study-export-YYYY-MM-DD.md`

###### 3B. PostDetailPage (`src/pages/PostDetailPage.tsx`)
- **Like button** (heart) on post footer; localStorage backed
- **"Export MD" button** for Study posts when logged in (single post + comments)
  - Filename: `YYYYMMDD-title-slug.md`
- Comment timestamps now show **HH:MM** (full datetime)
- Author name pre-filled from logged-in user; `readOnly` when logged in

###### 3C. NewPostPage (`src/pages/NewPostPage.tsx`)
- **Markdown preview toggle** button (Edit / Preview)
  - Preview renders: `**bold**`, `#### headings`, `- lists`
  - Textarea shows when editing; rendered div shows when previewing

---

##### PART 4 — Navbar Update (`src/components/Navbar.tsx`)

- **"History"** nav link added → `/history`
- **"About"** converted to dropdown with sub-items:
  - About → `/about`
  - Ops Team → `/about/ops`
  - Ex-Ops → `/about/ex-ops`
- Mobile menu: About shows as expandable sub-section

---

##### PART 5 — Supabase Types (`src/lib/supabase.ts`)

- **`Activity` type**: updated `type` to `'study' | 'project' | 'competition' | 'seminar'`; added optional fields: `detail_url`, `start_date`, `end_date`, `participants`, `result`, `image_url`
- **`OpsTeamMember` type**: new — `id, name, role, responsibilities, level, order, generation, avatar_url`
- **`ExOpsMember` type**: new — `id, name, role, generation, term, description`

---

##### Competition / Hackathon Data Model Notes

The `Activity` type and competition card are designed to be hackathon-ready:
- `start_date / end_date`: full competition schedule range
- `participants`: team size
- `result`: prize/award text (e.g., "대상", "1st place")
- `detail_url`: links to dedicated hackathon dashboard page (future)
- Competition cards display a distinct amber "대회 보기" CTA button
- Future: leaderboard, track info, submission limits, scoring — all linkable via `detail_url`

---

#### Files Changed

| File | Change |
|------|--------|
| `src/lib/supabase.ts` | Updated Activity type + new OpsTeamMember + ExOpsMember types |
| `src/context/AuthContext.tsx` | isAdmin now includes 'ops' role |
| `src/pages/ActivitiesPage.tsx` | Full rewrite with filter, 4 card types, competition support, admin inline edit |
| `src/pages/HistoryPage.tsx` | **NEW** — timeline view of all activities |
| `src/pages/AboutOpsPage.tsx` | **NEW** — org chart operations team page |
| `src/pages/ExOpsPage.tsx` | **NEW** — ex-ops list page |
| `src/pages/AboutPage.tsx` | Added sub-navigation |
| `src/pages/BoardPage.tsx` | Likes, comment counts, avatars, MD export |
| `src/pages/PostDetailPage.tsx` | Like button, MD export, HH:MM timestamps, pre-fill author |
| `src/pages/NewPostPage.tsx` | Markdown preview toggle |
| `src/pages/admin/AdminActivities.tsx` | competition/seminar types + extended fields |
| `src/components/Navbar.tsx` | History link + About dropdown |
| `src/App.tsx` | New routes: /history, /about/ops, /about/ex-ops |

---

## [0.6.0] - 2026-03-17
### Added
- 일반 부원 로그인 기능 (/login)
- 로그인 시 Navbar에 프로필 아바타 표시 (클릭 → 본인 프로필)
- 커뮤니티 글 작성자 이름 공개
- 프로필에 LinkedIn 필드 추가
- src/lib/constants.ts — 공통 상수 파일 (TRACK, STATUS, CATEGORY)

### Fixed
- Admin 로그인 AuthContext 연동 수정 (useAdmin → useAuth)
- 프로필 저장 완전 수정 (fallback 메시지 제거)
- 통합 인증: users 테이블 + members 테이블 동시 지원
- PostDetailPage useAdmin → useAuth 마이그레이션
- NewPostPage: 로그인 상태면 작성자 자동 입력

### Security
- 비밀번호 평문 저장 → 향후 해싱 필요 (현재 MVP 단계)
- sessionStorage 기반 세션 관리
- autocomplete 속성 추가 (username, current-password, new-password)

## [0.5.0] - 이전 작업
### Added
- Supabase 연동 (members, posts, comments 테이블)
- Admin 대시보드 및 관리 페이지
- 프로필 비밀번호 보호 편집
- 커뮤니티 게시판 (BoardPage, PostDetailPage, NewPostPage)
- 프로젝트 페이지 (ProjectsPage, ProjectDetailPage)
- Team 페이지
