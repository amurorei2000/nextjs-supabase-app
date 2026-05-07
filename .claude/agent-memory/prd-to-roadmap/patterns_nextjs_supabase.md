---
name: Next.js + Supabase 아키텍처 패턴 — 이 프로젝트 표준
description: 이 코드베이스에서 검증된 Server Action, 클라이언트 생성, 인증 패턴
type: reference
---

이 프로젝트에서 사용하는 표준 패턴:

1. **Supabase 클라이언트**: 전역 변수 금지. 매 함수마다 `createClient()` 새로 생성 (Fluid Compute 호환).
2. **인증 체크**: `supabase.auth.getClaims()` 사용 — DB 조회 없이 JWT 검증.
3. **Server Action 패턴**: `"use server"` + `revalidatePath()` 조합. 참조: `app/protected/profile/actions.ts`.
4. **데이터 레이어 분리**: DB 쿼리 함수는 `lib/supabase/*.ts`, 비즈니스 로직은 `actions.ts`.
5. **세션 관리**: `middleware.ts` 아닌 `proxy.ts` + `lib/supabase/proxy.ts` 사용.
6. **타입**: `lib/types/` 하위에 도메인별 인터페이스 정의.

비인증 공개 라우트에서 Supabase 클라이언트 사용 시: `getClaims()` 실패해도 읽기 쿼리는 RLS가 허용하면 동작함 — Server Component에서 그대로 사용 가능.
