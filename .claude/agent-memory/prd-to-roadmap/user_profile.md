---
name: 사용자 프로필 — 1인 개발자, Next.js + Supabase 풀스택
description: 사용자의 기술 역할, 개발 환경, 현재 프로젝트 맥락
type: user
---

1인 개발자로 Next.js App Router + Supabase 스택을 사용한다. 인증(Supabase Auth, Google OAuth), 프로필 관리, shadcn/ui(new-york 스타일), Tailwind CSS가 이미 완성된 코드베이스 위에서 새 기능을 개발한다.

현재 프로젝트: 모임 이벤트 관리 웹앱 MVP (소규모 정기 모임 공지·참여·카풀·정산 통합 링크 서비스)

**Why:** 기존 스타터 코드베이스가 있으므로 타임라인 추정 시 인증·UI 기반을 제외하고 도메인 기능만 계산해야 한다.

**How to apply:** 로드맵이나 구현 계획 수립 시 기존 `lib/supabase/server.ts`, `client.ts`, Server Action 패턴을 재사용 가능한 자산으로 명시하고, 신규 구현 범위만 별도로 추정한다.
