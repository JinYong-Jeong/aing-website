# WORK_LOG-260319.md — 2026-03-19 작업 계획

## 상태
- Vercel 최신 배포: READY ✅
- 작업 시작: 2026-03-19 13:42 KST

---

## 작업 목록

### 1. AboutOpsPage — 더미 데이터 정리 + 멤버 연동
- [ ] demoData에서 order:99, generation:1 같은 기본값 표시 제거 (UI에서 숨기거나 라벨 정리)
- [ ] EMPTY_FORM의 order 기본값 0으로, generation 기본값 명시적으로
- [ ] MemberCard 클릭 시 modal이 뜨는데, modal 안에서 members 테이블 ilike(name) 연동 → 이미 코드는 있으나 modal JSX가 AboutOpsPage return 안에 없어서 미노출 → 수정

### 2. AdminMembers — UI 개선 + 검색
- [ ] 테이블형 레이아웃으로 전환 (이름/역할/트랙/기수/상태/활성여부 컬럼)
- [ ] 상단 검색창 추가 (이름/역할 검색)
- [ ] 모든 admin 관리 페이지(AdminPosts, AdminProjects, AdminTeamPosts, AdminComments, AdminMessages)에 검색 기능 추가

### 3. 페이지네이션
- [ ] BoardPage: 5개/10개 선택 + 페이지 이동
- [ ] TeamPage: 페이지네이션
- [ ] MembersPage: 페이지네이션

### 4. ActivityDetailPage — admin 수정 기능 재확인 및 재구현
- [ ] isAdmin일 때 수정 버튼 노출 확인
- [ ] 수정 모달 작동 확인
- [ ] 문제 있으면 재구현

### 5. 댓글 로그인 필수 + admin 작성자 표시
- [ ] PostDetailPage: 로그인 안 된 상태에서 댓글 입력창 숨기고 "로그인 후 댓글을 작성할 수 있습니다" 안내
- [ ] Comment DB/UI에 author_id 연결 (로그인 유저의 id 저장)
- [ ] admin 보기에서 댓글 작성자 name 표시

### 6. ActivitiesPage — admin 글쓰기/수정
- [ ] 이미 admin PlusCircle 버튼 있음 → 정상 작동 확인
- [ ] ActivityCard hover 시 admin edit 버튼 확인

### 7. 관심분야(interests) — Agent 추가 + admin 편집
- [ ] constants.ts INTERESTS 배열에 'Agent' 추가
- [ ] AdminSettings 또는 별도 섹션에서 interests 목록 추가/삭제/편집 기능
- [ ] site_settings에 interests_list 키로 저장, MembersPage/MemberProfilePage에서 동적 로드

---

## 완료 기준
- CI=false npm run build 성공
- git push origin main
- Vercel READY 확인
