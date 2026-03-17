# A.ing — Official Website

가천대학교 학부생 주도 인공지능 학술 동아리 **A.ing**의 비공식 웹사이트입니다.

## 🚀 Tech Stack

- **Frontend**: React 18 + TypeScript
- **Styling**: Tailwind CSS
- **Animation**: Framer Motion + CSS Intersections
- **Database**: Supabase (PostgreSQL)
- **Routing**: React Router v6
- **Icons**: Lucide React
- **Deploy**: Vercel

## 📦 Features

- 🏠 **홈** — 동아리 소개, 트랙 안내, CTA
- 📖 **About** — 철학, 스터디 트랙 상세, 지원 자격
- 🗓 **Activities** — 학기별 스터디/프로젝트 아카이브
- 👥 **Members** — 부원 목록 (트랙별 필터)
- 📋 **Board** — 공지/활동/스터디 게시판 (카테고리 필터, 댓글)
- 📬 **Contact** — 문의/지원 폼
- 🔐 **Admin Panel** — 게시글 작성/수정/삭제, 부원 관리, 댓글 승인, 문의 확인

## 🛠 로컬 실행

```bash
# 1. 의존성 설치
npm install

# 2. 환경변수 설정
cp .env.example .env
# .env 파일에 Supabase URL과 anon key 입력

# 3. 개발 서버 실행
npm start
```

## 🗄 Supabase 설정

`supabase_schema.sql` 파일을 Supabase SQL Editor에서 실행하세요.

## 🌐 배포 (Vercel)

1. [vercel.com](https://vercel.com)에서 이 repo import
2. Environment Variables 설정:
   - `REACT_APP_SUPABASE_URL`
   - `REACT_APP_SUPABASE_ANON_KEY`
3. Deploy!

## 📁 구조

```
src/
├── components/     # 공통 컴포넌트 (Navbar, Footer, AnimatedSection)
├── context/        # AdminContext
├── lib/            # Supabase 클라이언트 & 타입
└── pages/
    ├── admin/      # 어드민 페이지들
    ├── HomePage.tsx
    ├── AboutPage.tsx
    ├── ActivitiesPage.tsx
    ├── MembersPage.tsx
    ├── BoardPage.tsx
    ├── PostDetailPage.tsx
    └── ContactPage.tsx
```

---

© 2026 A.ing. Licensed under CC BY-NC-SA 4.0.
