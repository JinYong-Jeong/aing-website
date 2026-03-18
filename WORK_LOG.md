# WORK_LOG - aing-website

## 상태: ✅ 완료 (2026-03-17 ~20:20 KST)

### 완료
- [x] 수락된 참여자 제외 기능 (TeamPostDetailPage + AdminTeamPosts)
- [x] 작성자 참여 지원 불가 (TeamPage + TeamPostDetailPage)
- [x] Admin 멤버 수정 폼 개선 (AdminMembers - 수정 버튼, 전체 필드, OB 트랙)
- [x] 이메일 → 인스타그램(@aing_gc) 변경 (ContactPage + Footer)
- [x] 빌드 성공 (CI=true)
- [x] git push → main
- [x] Vercel 배포 완료 → https://aing-website.vercel.app

### 변경 내용 상세

#### 작업 1: 수락된 참여자 제외
- `TeamPostDetailPage.tsx`: acceptedApplications 각 항목에 canManage일 때 X(제외) 버튼 추가
- `TeamPostDetailPage.tsx`: handleRemoveApplicant() - status→rejected, current_members -1, fetchPost()
- `AdminTeamPosts.tsx`: handleRemoveApplicant() 동일 로직, 수락된 신청자 행에 X 버튼 표시

#### 작업 2: 작성자 참여 지원 불가
- `TeamPage.tsx`: myPost일 때 참여 희망 버튼 숨기고 "내가 작성한 글입니다" 표시
- `TeamPostDetailPage.tsx`: isAuthor일 때 참여 희망하기 버튼 숨기고 텍스트 표시

#### 작업 3: Admin 멤버 수정 폼 개선
- `AdminMembers.tsx`: 전면 재작성
  - 트랙에 OB 옵션 추가
  - 수정 버튼 (Pencil) 추가 → 기존 값 pre-fill
  - 폼 필드: 이름/역할, 트랙/기수, GitHub/한줄소개, 아바타URL, 비밀번호/상태, 활성여부
  - 추가/수정/취소 버튼 처리

#### 작업 4: 이메일 → 인스타그램
- `ContactPage.tsx`: Mail 카드 → Instagram 카드 (@aing_gc 링크)
- `Footer.tsx`: Mail 아이콘/링크 → Instagram 아이콘/@aing_gc 링크

### 배포 URL
- Production: https://aing-website.vercel.app
- Inspect: https://vercel.com/jinyong-jeongs-projects/aing-website/5WnijuduYbdEvhodeFfgqbinReqQ

---

## 이전 작업 (2026-03-17 ~19:45 KST)

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
- [x] Vercel 배포 완료

### Supabase 실행 필요
```
supabase_schema_v7.sql
```
팀원 신청 기능 사용 전 Supabase 대시보드에서 실행해야 합니다.
