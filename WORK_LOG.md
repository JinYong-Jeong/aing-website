# A.ing Website — 작업 로그 (2026-03-17)

## 상태: ✅ 완료

### 완료 항목
- [x] 1. Admin 로그인 수정 + 보안 (useAdmin → useAuth, autocomplete 추가, async login)
- [x] 2. 프로필 저장 완전 수정 (fallback alert 제거, 전체 payload 저장)
- [x] 3. 일반 부원 로그인 + 프로필 아바타 네비 (LoginPage 생성, Navbar 아바타 표시, App.tsx /login 라우트)
- [x] 4. 커뮤니티 글 작성자 표시 (BoardPage 날짜 옆 작성자, PostDetailPage 작성자 + 프로필 링크, NewPostPage 로그인 자동 입력)
- [x] 5. 프로필 LinkedIn 추가 (supabase.ts 타입, MemberProfilePage 필드, MemberDetailPage 링크, supabase_schema_v6.sql)
- [x] 6. CHANGELOG.md 업데이트
- [x] 7. 디렉토리 구조 정리 + 유지보수 (src/lib/constants.ts 생성, README.md 업데이트)

## 배포 URL
https://aing-website.vercel.app

## Git Commit
feat: member login + avatar nav + author display + linkedin + auth fix + constants refactor
커밋: 93ea8fc

## 마지막 업데이트
2026-03-17 18:35 KST — 빌드 성공 + Vercel 배포 완료

## Supabase 실행 필요
supabase_schema_v6.sql (linkedin 컬럼)
```sql
alter table public.members add column if not exists linkedin text;
```
