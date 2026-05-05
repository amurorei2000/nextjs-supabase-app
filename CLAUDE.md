# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 명령어

```bash
npm run dev      # 개발 서버 실행 (localhost:3000)
npm run build    # 프로덕션 빌드
npm run lint     # ESLint 검사
```

테스트 없음 — 기능 검증은 브라우저로 직접 확인.

## 환경 변수

`.env.local` 에 아래 두 변수가 필요하다:

```
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=...
```

`lib/utils.ts`의 `hasEnvVars`가 두 변수 존재 여부를 확인하며, 미설정 시 네비게이션에 경고 배너가 표시된다.

## 아키텍처

### 라우트 구조

```
app/
  page.tsx               # 공개 랜딩 페이지
  auth/                  # 인증 플로우 (login, sign-up, forgot-password 등)
  protected/             # 인증 필수 영역
    layout.tsx           # 공통 네비게이션/푸터
    page.tsx             # 메인 protected 페이지
    profile/
      page.tsx           # 프로필 조회 (Server Component)
      actions.ts         # Server Actions
```

### Supabase 클라이언트 패턴

클라이언트 종류가 두 가지로 분리되어 있다:

- `lib/supabase/server.ts` — Server Components, Route Handlers, Server Actions에서 사용
- `lib/supabase/client.ts` — Client Components (`"use client"`)에서 사용

**Fluid Compute 호환을 위해 두 클라이언트 모두 전역 변수에 저장하지 않는다.** 매 함수 호출마다 새로 생성해야 한다.

### 세션 관리 (proxy.ts)

이 프로젝트는 Next.js `middleware.ts` 대신 `proxy.ts`를 사용한다. `proxy.ts`가 모든 요청을 가로채어 `lib/supabase/proxy.ts`의 `updateSession()`을 호출해 쿠키 기반 세션을 갱신한다.

`proxy.ts` 내 `config.matcher`가 정적 파일·이미지를 제외한 모든 경로에 적용된다.

인증 체크는 `supabase.auth.getClaims()`로 수행한다 — DB를 조회하지 않고 JWT를 검증하므로 빠르다.

### 데이터 레이어

`lib/supabase/profile.ts`가 `profiles` 테이블에 대한 읽기/쓰기를 담당한다:

- `getProfile()` — 현재 로그인 사용자의 프로필 조회
- `updateProfile(updates)` — upsert로 프로필 저장, username 중복 시 에러 코드 `23505` 처리

타입은 `lib/types/profile.ts`의 `Profile`, `ProfileUpdate` 인터페이스를 사용한다.

### UI 컴포넌트

shadcn/ui "new-york" 스타일을 사용한다. 새 컴포넌트 추가:

```bash
npx shadcn@latest add <component-name>
```

아이콘은 lucide-react, 스타일 유틸리티는 `lib/utils.ts`의 `cn()` 함수를 사용한다.

## Supabase DB 변경

스키마 변경은 `supabase/migrations/` 에 마이그레이션 파일을 추가한다. 로컬에서 Supabase CLI를 쓰거나, MCP `mcp__supabase__apply_migration` 도구를 사용할 수 있다.
