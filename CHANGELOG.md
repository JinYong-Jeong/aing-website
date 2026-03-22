# A.ing Website - Changelog

## 2026-03-22

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
