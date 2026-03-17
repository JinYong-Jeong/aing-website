# WORK_LOG - aing-website

## 상태: ✅ Team 기능 업그레이드 완료 (2026-03-17 ~19:45 KST)

### 완료
- [x] team_applications 테이블 (supabase_schema_v7.sql)
- [x] supabase.ts 타입 추가 (TeamApplication, TeamPost에 applications 필드)
- [x] TeamPage 전면 개선 (참여 희망, 필터, 카드 UI, 내 글 배지, 아바타 시각화)
- [x] TeamPostDetailPage (참여자 관리, 수락/거절, 수정 모달, 삭제, 작성자 인증)
- [x] MemberDetailPage 팀원 모집 글 목록 (author_id + author_name fallback)
- [x] AdminTeamPosts 관리 페이지 (/admin/team)
- [x] AdminDashboard Team 통계 카드 + Quick Actions 링크 추가
- [x] App.tsx /admin/team 라우트 추가
- [x] Navbar admin 드롭다운에 Team 링크 추가
- [x] 빌드 성공 (CI=true)
- [x] git push → main
- [x] Vercel 배포 완료 → https://aing-website.vercel.app

### Supabase 실행 필요
```
supabase_schema_v7.sql
```
팀원 신청 기능 사용 전 Supabase 대시보드에서 실행해야 합니다.

### 배포 URL
- Production: https://aing-website.vercel.app
- Inspect: https://vercel.com/jinyong-jeongs-projects/aing-website/CcRqHMuuHvH7Y3KWtXaaA71J3Ha1

### 변경 파일
- `supabase_schema_v7.sql` (신규)
- `src/lib/supabase.ts` (TeamApplication 타입, TeamPost.applications 필드)
- `src/pages/TeamPage.tsx` (전면 재작성)
- `src/pages/TeamPostDetailPage.tsx` (전면 재작성)
- `src/pages/MemberDetailPage.tsx` (팀원 모집 섹션 추가)
- `src/pages/admin/AdminTeamPosts.tsx` (신규)
- `src/pages/admin/AdminDashboard.tsx` (Team 통계 + Quick Action)
- `src/App.tsx` (/admin/team 라우트)
- `src/components/Navbar.tsx` (admin 드롭다운 Team 링크)
