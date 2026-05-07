# Development Guidelines

## Project Overview

- 소규모 모임 이벤트 관리 MVP 웹앱 (수영/헬스/친구 모임 등)
- 주최자: 이벤트 생성 → 링크 공유 / 참여자: 앱 설치·회원가입 없이 즉시 참여 신청·카풀·정산
- 스택: Next.js App Router, Supabase (Auth + PostgreSQL + RLS), shadcn/ui new-york, Tailwind CSS, Resend, Vercel

---

## Project Architecture

### 디렉터리 구조

```
app/
  page.tsx                          # 공개 랜딩 페이지
  auth/                             # 인증 플로우 (인증 불필요)
    login/, sign-up/, forgot-password/, update-password/
    callback/route.ts               # OAuth 코드 교환 (Google)
  protected/                        # 인증 필수 영역
    layout.tsx                      # 공통 네비게이션/푸터
    page.tsx
    profile/
      page.tsx                      # Server Component
      actions.ts                    # Server Actions ("use server")
    events/                         # [미구현] 주최자 이벤트 관리
      page.tsx
      new/page.tsx
      [id]/page.tsx
      [id]/actions.ts
  events/                           # [미구현] 공개 이벤트 페이지 (인증 불필요)
    [token]/page.tsx
    [token]/actions.ts
    [token]/carpool/page.tsx
    [token]/settlement/page.tsx

components/                         # 재사용 컴포넌트
  ui/                               # shadcn/ui 자동 생성 (직접 수정 최소화)
  *.tsx                             # 도메인 컴포넌트

lib/
  supabase/
    server.ts                       # 서버 전용 클라이언트
    client.ts                       # 클라이언트 전용 클라이언트
    proxy.ts                        # 세션 갱신 로직 (proxy.ts에서 호출)
    profile.ts                      # profiles 테이블 CRUD
    events.ts                       # [미구현] events 도메인 CRUD
  types/
    profile.ts                      # Profile, ProfileUpdate 인터페이스
    database.ts                     # [자동 생성] Supabase TypeScript 타입
    event.ts                        # [미구현] 이벤트 도메인 타입
    participant.ts                  # [미구현] 참여자 도메인 타입
  email/
    resend.ts                       # [미구현] Resend API 유틸
  utils.ts                          # cn(), hasEnvVars

proxy.ts                            # 루트 미들웨어 진입점 (middleware.ts 아님)
supabase/migrations/                # SQL 마이그레이션 파일
```

---

## Supabase 클라이언트 규칙

### 클라이언트 선택

| 실행 컨텍스트                                  | 사용 파일                                   |
| ---------------------------------------------- | ------------------------------------------- |
| Server Component, Server Action, Route Handler | `lib/supabase/server.ts` → `createClient()` |
| Client Component (`"use client"`)              | `lib/supabase/client.ts` → `createClient()` |

### 필수 준수 사항

- **전역 변수에 저장 금지** — Fluid Compute 호환을 위해 매 함수 호출마다 새로 생성
- **올바른 예시**:
  ```ts
  export async function getProfile() {
    const supabase = await createClient(); // 함수 내부에서 매번 생성
    ...
  }
  ```
- **금지 예시**:
  ```ts
  const supabase = await createClient(); // 모듈 최상단에 전역 저장 금지
  export async function getProfile() { ... }
  ```

---

## 세션 관리 규칙 (proxy.ts)

- **`middleware.ts` 파일 생성 금지** — 이 프로젝트는 `proxy.ts`를 사용
- `proxy.ts` (루트)가 `lib/supabase/proxy.ts`의 `updateSession()`을 호출
- `config.matcher`는 `proxy.ts`에서 관리 (정적 파일, 이미지 제외)
- `lib/supabase/proxy.ts`에서 인증 체크 시 반드시 `getClaims()` 사용:
  ```ts
  const { data } = await supabase.auth.getClaims(); // JWT 검증, DB 조회 없음
  ```
- **`createServerClient()`와 `getClaims()` 사이에 코드 삽입 금지** (세션 버그 원인)

---

## 인증 체크 패턴

### Server Component / Server Action에서 인증 확인

```ts
const supabase = await createClient();
const { data, error } = await supabase.auth.getClaims();
if (error || !data?.claims) redirect("/auth/login");
const userId = data.claims.sub;
const userEmail = data.claims.email as string;
```

- `getUser()` 대신 `getClaims()` 사용 (DB 조회 없이 JWT 검증)
- 인증 실패 시 `/auth/login`으로 리다이렉트

---

## 라우트 접근 제어

| 라우트              | 인증 필요 | 비고                                       |
| ------------------- | --------- | ------------------------------------------ |
| `/`                 | 불필요    | 랜딩 페이지                                |
| `/auth/*`           | 불필요    | 인증 플로우                                |
| `/protected/*`      | **필수**  | 서버에서 getClaims() 확인 후 redirect      |
| `/events/[token]/*` | 불필요    | 공개 이벤트 (비인증 사용자 읽기·신청 허용) |

- `/events/[token]/*`는 proxy.ts에서 리다이렉트하지 않도록 설계 (이미 처리됨)
- `/protected/events/[id]` 접근 시 주최자(organizer_id) 일치 여부 Server Action에서 검증

---

## Server Actions 패턴

### 파일 구조

- 뮤테이션 로직은 `actions.ts` 파일에 작성, 파일 최상단에 `"use server"` 지시어
- 같은 라우트 폴더 내: `page.tsx` (Server Component) + `actions.ts` (Server Actions)

### 필수 패턴

```ts
"use server";
import { revalidatePath } from "next/cache";

export async function updateProfileAction(formData: FormData) {
  // 1. Supabase 클라이언트 생성
  // 2. getClaims()로 인증 확인
  // 3. 비즈니스 로직 실행
  // 4. revalidatePath()로 캐시 무효화
  revalidatePath("/protected/profile");
  return { success: true };
}
```

- 반환값은 항상 `{ success: boolean; error?: string }` 형태
- 에러 코드 `23505` = username 중복 (UNIQUE 제약 위반)

---

## DB 스키마 관리

### 마이그레이션 파일 추가 방법

1. `supabase/migrations/YYYYMMDD_description.sql` 파일 생성
2. `mcp__supabase__apply_migration` 도구로 원격 DB에 적용
3. `mcp__supabase__generate_typescript_types` 도구로 `lib/types/database.ts` 재생성

### 이벤트 도메인 테이블 (Phase 0 목표)

| 테이블               | 주요 컬럼                                                                                                                                |
| -------------------- | ---------------------------------------------------------------------------------------------------------------------------------------- |
| `events`             | id, organizer_id (FK→auth.users), title, date_time, location, description, max_participants, public_token (UNIQUE), status (open/closed) |
| `participants`       | id, event_id, name, phone, memo, status (pending/confirmed/cancelled)                                                                    |
| `carpool_drivers`    | id, event_id, name, phone, departure, available_seats, memo                                                                              |
| `carpool_passengers` | id, driver_id, participant_id (nullable), name, phone                                                                                    |
| `expenses`           | id, event_id, item_name, amount, paid_by                                                                                                 |

### public_token 생성 규칙

- **서버에서만 생성**: `crypto.randomUUID()` 또는 `nanoid()`
- DB에 `UNIQUE` 제약 필수
- 충돌 시 Server Action에서 재생성 로직 추가

### RLS 정책 원칙

- `events`: 주최자(organizer_id = auth.uid())만 INSERT/UPDATE/DELETE
- `participants`: 누구나 INSERT 가능 (비인증 포함), 주최자만 status UPDATE
- `carpool_drivers/passengers`: 누구나 INSERT 가능
- `expenses`: 주최자만 INSERT/DELETE, 누구나 SELECT

---

## 타입 관리

### 파일별 역할

| 파일                       | 역할                              | 수정 방법                              |
| -------------------------- | --------------------------------- | -------------------------------------- |
| `lib/types/database.ts`    | Supabase 자동 생성 타입           | **직접 수정 금지** — MCP 도구로 재생성 |
| `lib/types/profile.ts`     | Profile, ProfileUpdate 인터페이스 | 직접 수정                              |
| `lib/types/event.ts`       | 이벤트 도메인 타입                | 직접 수정                              |
| `lib/types/participant.ts` | 참여자 도메인 타입                | 직접 수정                              |

- 도메인 타입은 `database.ts`의 Row 타입을 기반으로 `Pick<>`, `Omit<>`으로 파생

---

## shadcn/ui 컴포넌트 규칙

- 새 컴포넌트 추가: `npx shadcn@latest add <component-name>`
- 스타일: `new-york`, baseColor: `neutral`, CSS variables: true
- `components/ui/` 파일은 직접 수정 최소화 (재생성 시 덮어써짐)
- 아이콘: `lucide-react`만 사용
- 클래스 병합: `lib/utils.ts`의 `cn()` 함수 사용

---

## 이메일 알림 규칙 (Resend)

- 유틸 함수 위치: `lib/email/resend.ts`
- **Resend 호출 실패 시 참여 신청 결과에 영향 없음** (ADR-02)
  ```ts
  try {
    await sendNotification(...);
  } catch (e) {
    console.error("[Resend]", e); // 로그만 기록, 리턴값 변경 금지
  }
  ```
- `joinEvent()` Server Action 내부에서 직접 `fetch` 또는 Resend SDK 호출 (별도 Route Handler 불필요)

---

## 환경 변수

| 변수명                                 | 용도                                                 |
| -------------------------------------- | ---------------------------------------------------- |
| `NEXT_PUBLIC_SUPABASE_URL`             | Supabase 프로젝트 URL                                |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Supabase anon key                                    |
| `RESEND_API_KEY`                       | Resend 이메일 API 키 (서버 전용, NEXT_PUBLIC 불필요) |

- `lib/utils.ts`의 `hasEnvVars`가 앞 두 변수 존재 여부 확인 (이미 구현됨)
- 환경 변수 미설정 시 네비게이션에 경고 배너 자동 표시

---

## 코드 스타일 & 커밋 규칙

### 포맷

- Prettier + ESLint 자동 적용 (`npm run format`, `npm run lint:fix`)
- Husky pre-commit hook이 lint-staged 실행 (TypeScript, TSX, JSON, CSS, MD 전체 포맷)
- `npm run typecheck` — 빌드 전 타입 에러 검증

### 커밋 메시지

- **Conventional Commits 필수** (commitlint 적용)
- 형식: `feat:`, `fix:`, `chore:`, `refactor:`, `docs:`, `test:` 등
- 예: `feat: 이벤트 생성 Server Action 구현`

---

## 금지 사항

- `middleware.ts` 파일 생성 금지 — 반드시 `proxy.ts` 사용
- Supabase 클라이언트를 모듈 레벨 전역 변수에 저장 금지
- `lib/types/database.ts` 직접 편집 금지 — MCP 도구로만 재생성
- `createServerClient()`와 `getClaims()` 사이에 비즈니스 로직 삽입 금지
- `getUser()` 사용 금지 — `getClaims()` 사용 (DB 조회 발생하므로)
- Server Action 없이 클라이언트에서 직접 Supabase DB 쓰기 금지 (읽기는 허용)
- `components/ui/` 파일 직접 수정 금지 (shadcn 재생성 시 손실)
- 이메일 알림 실패를 이유로 `joinEvent()` Server Action의 성공 응답 변경 금지
- `public_token`을 클라이언트에서 생성 금지 — 서버에서만 생성
