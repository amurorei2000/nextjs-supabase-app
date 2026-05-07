/cl# 모임 이벤트 관리 웹 MVP — 로드맵

> **최종 업데이트**: 2026-05-06
> **버전**: v1.0
> **상태**: 활성

---

## 개요

소규모 정기 모임(수영, 헬스, 친구 모임 등)을 주최할 때 발생하는 공지·참여자 관리·카풀·정산 업무를 단 하나의 링크로 처리할 수 있는 경량 웹앱이다. 주최자는 이벤트 링크를 공유하고, 참여자는 앱 설치나 회원가입 없이 즉시 참여 신청·카풀 신청·정산 확인까지 완료한다.

기존 코드베이스(Next.js App Router + Supabase Auth + shadcn/ui)가 이미 구축되어 있으므로 인증·프로필·UI 기반을 그대로 재사용한다. 신규 개발 범위는 이벤트 도메인(5개 테이블, 10개 라우트, Resend 이메일 알림)에 집중된다.

1인 개발자 기준으로 총 **6~7주** 내 MVP 출시를 목표로 한다. Phase 0에서 DB와 타입 기반을 닦고, Phase 1에서 주최자·참여자 핵심 플로우를 완성하며, Phase 2에서 카풀·정산·이메일 알림과 마무리 polish를 처리한다.

---

## 목표 & 성공 지표

| 목표                    | 지표                                | 기준                       |
| ----------------------- | ----------------------------------- | -------------------------- |
| 참여자 진입 마찰 최소화 | 링크 클릭 → 참여 신청 완료 단계 수  | 3단계 이하                 |
| 주최자 운영 효율화      | 이벤트 생성 → 링크 공유 소요 시간   | 2분 이내                   |
| 정산 투명성             | 1/N 금액 자동 표시                  | 확정 참여자 변경 즉시 반영 |
| 초기 로딩 속도          | 공개 이벤트 페이지 LCP              | 2.5초 이하 (모바일 4G)     |
| 보안                    | RLS 위반 없이 타인 데이터 접근 차단 | 0건                        |

---

## 기술 아키텍처 개요

### 기술 스택 (기존 + 신규)

| 구분        | 기술                                        | 비고                 |
| ----------- | ------------------------------------------- | -------------------- |
| 프레임워크  | Next.js App Router (Server Components 기본) | 기존                 |
| 인증        | Supabase Auth (이메일 + Google OAuth)       | 기존 완성            |
| DB          | Supabase PostgreSQL + RLS                   | 신규 테이블 5개 추가 |
| UI          | shadcn/ui new-york + Tailwind CSS           | 기존                 |
| 이메일 알림 | Resend API (Route Handler 경유)             | 신규                 |
| 배포        | Vercel                                      | 기존                 |

### 핵심 설계 결정

**Server Actions 우선 패턴**: 기존 `app/protected/profile/actions.ts` 패턴을 그대로 따른다. 모든 뮤테이션은 Server Action으로 구현하고, `revalidatePath`로 캐시를 무효화한다.

**공개 라우트 인증 분리**: `/events/[token]/*`는 인증 없이 접근 가능하다. Supabase 클라이언트는 `lib/supabase/server.ts`를 그대로 사용하되, `getClaims()` 실패 시에도 읽기는 허용하는 RLS 정책을 설계한다.

**Resend 이메일 알림**: 참여 신청 Server Action 내부에서 `fetch`로 Resend API를 직접 호출한다. Route Handler를 별도로 두지 않아 구현을 단순화한다.

**public_token 생성**: `crypto.randomUUID()` 또는 `nanoid`로 이벤트 생성 시 서버에서 자동 생성한다. 추측 불가능한 URL이 보안의 유일한 게이트가 된다.

**ADR 필요 항목**:

- ADR-01: 카풀 탑승 신청 시 참여자 식별 방식 (이름+전화번호 조합 vs. participant_id 직접 입력)
- ADR-02: Resend 호출 실패 시 참여 신청 롤백 여부 (현재 결정: 알림 실패는 참여 신청에 영향 없음)

---

## 개발 단계

### Phase 0: DB 마이그레이션 & 타입 기반 구축

**기간**: 1주 (2026-05-06 ~ 2026-05-12)
**목표**: 5개 테이블 생성, RLS 정책 설정, TypeScript 타입 자동 생성 완료

#### 마일스톤

- [ ] 🟢 ⚡ `supabase/migrations/` 에 마이그레이션 파일 작성 — events, participants, carpool_drivers, carpool_passengers, expenses 테이블 [PRD §6]
- [ ] 🟡 ⚡ RLS 정책 작성 — 주최자만 이벤트 수정, 누구나 participants/carpool 신청 가능 [PRD §6]
- [ ] 🟢 `mcp__supabase__apply_migration` 또는 Supabase CLI로 원격 DB에 마이그레이션 적용
- [ ] 🧪 테스트: Playwright MCP로 Supabase 콘솔 접속 후 5개 테이블 생성 확인 및 RLS 정책 목록 검증
- [ ] 🟢 `mcp__supabase__generate_typescript_types` 로 `lib/types/database.ts` 생성
- [ ] 🟡 `lib/types/event.ts`, `lib/types/participant.ts` 도메인 타입 인터페이스 정의
- [ ] 🟢 `lib/supabase/events.ts` — `getEventByToken()`, `getEventById()` 기본 쿼리 함수 작성
- [ ] 🧪 테스트: Playwright MCP로 Supabase 쿼리 결과 확인 (이벤트 CRUD 기본 동작)
- [ ] 🟢 환경 변수 `RESEND_API_KEY` `.env.local` 추가 및 `.env.example` 업데이트

#### 산출물

- `supabase/migrations/YYYYMMDD_create_event_tables.sql`
- `lib/types/database.ts` (자동 생성)
- `lib/types/event.ts`, `lib/types/participant.ts`
- `lib/supabase/events.ts` (기본 쿼리 함수)

#### 완료 기준

- Supabase 대시보드에서 5개 테이블 확인 가능
- RLS 활성화 상태에서 비인증 사용자가 events 테이블 INSERT 불가, participants INSERT 가능 확인
- `npm run typecheck` 에러 없음

---

### Phase 1: MVP 핵심 플로우 — 이벤트 생성 + 참여 신청

**기간**: 3주 (2026-05-13 ~ 2026-06-02)
**목표**: 주최자가 이벤트를 만들고 링크를 공유하면 참여자가 즉시 신청할 수 있는 핵심 루프 완성

#### 마일스톤

**1-A. 주최자 이벤트 생성 (1주차)**

- [ ] 🟡 ⚡ `app/protected/events/page.tsx` — 내 이벤트 대시보드 (Server Component, 이벤트 목록 조회) [PRD §5]
- [ ] 🟢 `app/protected/events/new/page.tsx` — 이벤트 생성 폼 (제목, 날짜/시간, 장소, 설명, 최대 인원) [PRD §3-1]
- [ ] 🟡 ⚡ `app/protected/events/[id]/actions.ts` — `createEvent()` Server Action 구현 (public_token 자동 생성 포함) [PRD §3-1]
- [ ] 🧪 테스트: Playwright MCP로 이벤트 생성 폼 제출 → DB 레코드 생성 확인 → public_token 자동 생성 확인
- [ ] 🟡 `app/protected/events/[id]/page.tsx` — 이벤트 관리 페이지 기본 뼈대 (공유 링크 복사 버튼 포함)
- [ ] 🟢 `updateEvent()`, `closeEvent()` Server Action 구현 [PRD §3-1]
- [ ] 🧪 테스트: Playwright MCP로 이벤트 수정·마감 상태 변경 → DB 반영 확인

**1-B. 공개 이벤트 페이지 + 참여 신청 (2주차)**

- [ ] 🟡 ⚡ `app/events/[token]/page.tsx` — 공개 이벤트 페이지 (이벤트 정보, 참여자 수, 참여 신청 폼) [PRD §3-2]
- [ ] 🟡 ⚡ `app/events/[token]/actions.ts` — `joinEvent()` Server Action 구현 (이름, 전화번호, 메모 저장) [PRD §3-2]
- [ ] 🧪 테스트: Playwright MCP로 비인증 상태에서 `/events/{token}` 접속 → 이벤트 정보 확인 → 참여 신청 폼 제출 → DB participants 레코드 생성 확인
- [ ] 🟡 참여 신청 후 참여자 목록 즉시 갱신 (`revalidatePath`) 확인
- [ ] 🧪 테스트: Playwright MCP로 중복 전화번호 신청 처리 및 최대 인원 초과 시 폼 비활성화 동작 검증
- [ ] 🟢 이벤트 `status === 'closed'` 시 신청 불가 처리

**1-C. 주최자 참여자 관리 (3주차)**

- [ ] 🟡 ⚡ `app/protected/events/[id]/page.tsx` — 참여자 목록 테이블 (이름, 연락처, 메모, 신청 시간, 상태 뱃지) [PRD §3-2]
- [ ] 🟡 ⚡ `updateParticipantStatus()` Server Action 구현 (pending → confirmed / cancelled) [PRD §3-2]
- [ ] 🧪 테스트: Playwright MCP로 주최자 로그인 후 참여자 상태 변경 → DB 반영 → 화면 즉시 갱신 확인
- [ ] 🟢 비주최자가 `/protected/events/[id]` 접근 시 리다이렉트 처리
- [ ] 🧪 테스트: Playwright MCP로 타인 이벤트 URL 직접 접근 시 403/리다이렉트 동작 검증

#### 산출물

- `app/protected/events/` 하위 3개 페이지 + actions.ts
- `app/events/[token]/` 공개 이벤트 페이지 + actions.ts
- `lib/supabase/events.ts` — 이벤트·참여자 CRUD 함수 전체

#### 완료 기준

- 주최자가 이벤트 생성 후 공유 링크를 얻을 수 있음
- 비인증 사용자가 링크로 접속하여 참여 신청 완료 가능
- 주최자가 참여자 상태를 confirmed/cancelled로 변경 가능
- 타인의 이벤트 관리 페이지에 접근 불가 (RLS 검증)
- `npm run typecheck` 및 `npm run lint` 에러 없음

---

### Phase 2: 카풀 + 정산 + 이메일 알림 + UX 마무리

**기간**: 3주 (2026-06-03 ~ 2026-06-23)
**목표**: 카풀 조율·정산 기능 완성, 이메일 알림 연동, 전체 UX polish

#### 마일스톤

**2-A. 카풀 기능 (1주차)**

- [ ] 🟡 ⚡ `app/events/[token]/carpool/page.tsx` — 카풀 현황 페이지 (드라이버 카드 목록) [PRD §3-3]
- [ ] 🟡 ⚡ `registerDriver()` Server Action 구현 (출발지, 가능 인원, 메모) [PRD §3-3]
- [ ] 🧪 테스트: Playwright MCP로 카풀 페이지 접속 → 드라이버 등록 폼 제출 → DB carpool_drivers 레코드 생성 확인
- [ ] 🟡 `requestRide()` Server Action 구현 (탑승 신청 — participant_id 기반) [PRD §3-3]
- [ ] 🟡 `cancelRide()` Server Action 구현 (탑승 취소)
- [ ] 🧪 테스트: Playwright MCP로 탑승 신청 → 드라이버 카드 잔여 좌석 감소 확인 → 만석 시 신청 버튼 비활성화 → 탑승 취소 후 좌석 복원 확인
- [ ] 🟢 드라이버 카드 UI — 출발지, 잔여 좌석, 탑승자 이름 목록 표시

**2-B. 정산 기능 (1주차)**

- [ ] 🟡 ⚡ `app/events/[token]/settlement/page.tsx` — 정산 현황 페이지 (1/N 자동 계산) [PRD §3-4]
- [ ] 🟡 ⚡ `addExpense()` Server Action 구현 (항목명, 금액, 낸 사람) [PRD §3-4]
- [ ] 🟢 `deleteExpense()` Server Action 구현
- [ ] 🧪 테스트: Playwright MCP로 주최자 로그인 후 비용 항목 추가 → 총액 자동 합산 → 1인당 금액 계산 정확도 검증 (확정 참여자 수 기준)
- [ ] 🟢 비주최자(공개 참여자)는 정산 페이지 읽기 전용, 비용 추가 불가 처리
- [ ] 🧪 테스트: Playwright MCP로 비인증 상태에서 정산 페이지 접근 → 읽기 전용 확인, 비용 추가 폼 미노출 확인

**2-C. 이메일 알림 (2주차)**

- [ ] 🟡 ⚡ Resend API 키 환경 변수 설정 및 `lib/email/resend.ts` 유틸 함수 작성 [PRD §3-5]
- [ ] 🟡 ⚡ `joinEvent()` Server Action 내부에 Resend API 호출 추가 (주최자 이메일로 신청자 정보 발송) [PRD §3-5]
- [ ] 🧪 테스트: Playwright MCP로 참여 신청 제출 → Resend 대시보드 또는 수신 이메일에서 알림 내용(이벤트명, 신청자 이름, 전화번호) 확인
- [ ] 🟢 Resend API 호출 실패 시 에러 로그만 기록, 참여 신청 결과에는 영향 없도록 처리 (ADR-02)
- [ ] 🧪 테스트: Playwright MCP로 잘못된 API 키 환경에서 참여 신청 시 폼 정상 완료, 콘솔 에러 로그 확인

**2-D. 네비게이션 & UX 마무리 (2~3주차)**

- [ ] 🟢 공개 이벤트 페이지 하단에 카풀·정산 페이지 탭 네비게이션 추가 [PRD §8]
- [ ] 🟢 주최자 이벤트 관리 페이지에 공유 링크 복사 버튼 (navigator.clipboard) 구현
- [ ] 🟢 랜딩 페이지(`app/page.tsx`) CTA — "이벤트 만들기" 버튼 (로그인 유도) [PRD §5]
- [ ] 🟢 모바일 반응형 레이아웃 점검 — 공개 이벤트 페이지, 카풀 페이지, 정산 페이지 전체 [PRD §8]
- [ ] 🧪 테스트: Playwright MCP로 모바일 뷰포트(375px)에서 전체 참여자 플로우 E2E 검증
- [ ] 🟢 이벤트 마감(`closed`) 상태 시 공개 페이지에 "마감된 이벤트" 배너 표시
- [ ] 🟢 `npm run build` 통과 확인 (프로덕션 빌드 오류 없음)
- [ ] 🧪 테스트: Playwright MCP로 전체 주최자 플로우 E2E 검증 (생성 → 참여자 확정 → 비용 입력 → 정산 확인)

#### 산출물

- `app/events/[token]/carpool/page.tsx`
- `app/events/[token]/settlement/page.tsx`
- `lib/email/resend.ts`
- 업데이트된 `app/events/[token]/actions.ts` (카풀·이메일 알림 포함)
- 업데이트된 `app/protected/events/[id]/actions.ts` (정산 CRUD 포함)

#### 완료 기준

- 드라이버 등록 후 탑승 신청·취소 플로우 정상 동작, 잔여 좌석 즉시 반영
- 비용 항목 추가 후 1인당 금액이 확정 참여자 수 기준으로 정확히 계산됨
- 참여 신청 시 주최자 이메일로 알림 발송 (Resend 대시보드 확인)
- 모바일 375px 뷰포트에서 전체 플로우 정상 동작
- `npm run build` 에러 없음

---

## 의존성 맵

```
Phase 0 (DB + 타입)
  └── Phase 1-A (이벤트 생성)
        └── Phase 1-B (공개 참여 신청)
              ├── Phase 1-C (참여자 관리)
              ├── Phase 2-A (카풀)          ← participants 테이블 의존
              ├── Phase 2-B (정산)          ← participants.status='confirmed' 의존
              └── Phase 2-C (이메일 알림)   ← joinEvent() 구현 의존
```

| 기능               | 선행 조건                                |
| ------------------ | ---------------------------------------- |
| 이벤트 생성        | DB 마이그레이션, Supabase Auth 세션      |
| 참여 신청          | events 테이블, public_token 존재         |
| 카풀               | participants 테이블 (participant_id FK)  |
| 정산 1/N 계산      | participants.status = 'confirmed' 집계   |
| 이메일 알림        | joinEvent() Server Action, Resend API 키 |
| 주최자 관리 페이지 | Supabase Auth + RLS (organizer_id 비교)  |

---

## 리스크 & 대응 방안

| 리스크                                                                                                                       | 발생 가능성 | 영향도 | 대응 전략                                                                                                                                      |
| ---------------------------------------------------------------------------------------------------------------------------- | ----------- | ------ | ---------------------------------------------------------------------------------------------------------------------------------------------- |
| 카풀 탑승 신청 시 참여자 식별 불가 — 비인증 참여자를 participant_id로 특정할 방법이 없어 "내 탑승 취소" 기능 구현이 모호해짐 | 높음        | 보통   | ADR-01 결정: 탑승 신청 시 이름+전화번호 입력을 받아 기존 participant 레코드를 조회·매칭. 미매칭 시 신청 거부 처리. Phase 0 완료 전에 결정 확정 |
| Resend 무료 티어 한도 초과 (월 3,000건) — 이벤트가 갑자기 활성화되면 알림 발송 실패                                          | 낮음        | 낮음   | 알림 실패는 참여 신청에 영향 없도록 설계(ADR-02). 실패 로그 기록 후 주최자가 대시보드에서 참여자 직접 확인 가능                                |
| Supabase RLS 설정 오류로 타인 데이터 노출                                                                                    | 보통        | 높음   | Phase 0 완료 기준에 RLS 검증 테스트 포함. Playwright MCP로 비인증 상태 및 타 주최자 계정으로 접근 시나리오 명시적 검증                         |
| 1인 개발자 병목 — 카풀과 정산 기능이 동시에 지연되면 Phase 2 전체가 밀림                                                     | 보통        | 보통   | 카풀과 정산은 DB 의존성이 없으므로 순서를 바꿔도 무방. 일정 지연 시 이메일 알림을 Phase 3으로 이관하고 코어 기능 먼저 출시                     |
| public_token 충돌 — UUID 기반이라도 이론상 충돌 가능                                                                         | 낮음        | 높음   | DB에 `UNIQUE` 제약 설정, 충돌 시 409 에러를 Server Action에서 캐치하여 재생성 로직 추가                                                        |
| 모바일 UX 미비로 참여자 이탈 — 참여자 대부분 스마트폰 접근                                                                   | 보통        | 높음   | Phase 2-D에서 375px 뷰포트 E2E 테스트를 완료 기준으로 명시. 각 Phase 구현 시 모바일 우선으로 컴포넌트 설계                                     |

---

## 릴리스 전략

### 배포 환경

| 환경       | 브랜치     | 용도                               |
| ---------- | ---------- | ---------------------------------- |
| Preview    | feature/\* | PR별 Vercel 프리뷰 배포, 기능 검증 |
| Production | main       | Phase별 완료 후 머지               |

### 피처 플래그

MVP 규모에서는 피처 플래그 도구를 별도로 사용하지 않는다. 미완성 기능은 protected 라우트 또는 조건부 렌더링(`process.env.NEXT_PUBLIC_FEATURE_XXX`)으로 숨기고, 완성 시 제거한다.

### 롤아웃 계획

1. **Phase 1 완료 시** (2026-06-02): 이벤트 생성 + 참여 신청 플로우를 소수 지인 모임에서 실 사용 검증
2. **Phase 2 완료 시** (2026-06-23): 카풀·정산·이메일 포함 전체 기능 공개. Vercel 프로덕션 배포

---

## 지표 & 모니터링

### Phase 1 완료 후 추적 지표

| 지표             | 측정 방법                                    |
| ---------------- | -------------------------------------------- |
| 이벤트 생성 수   | Supabase `events` 테이블 행 수               |
| 참여 신청 완료율 | `participants` 행 수 / 이벤트 페이지 조회 수 |
| 참여 확정 비율   | `status = 'confirmed'` / 전체 participants   |

### Phase 2 완료 후 추적 지표

| 지표               | 측정 방법                                      |
| ------------------ | ---------------------------------------------- |
| 카풀 이용률        | `carpool_passengers` 행 수 / 전체 participants |
| 정산 기능 사용률   | `expenses` 항목이 1건 이상인 이벤트 비율       |
| 이메일 알림 전달률 | Resend 대시보드 delivered/sent 비율            |

### 모니터링 도구

- **Vercel Analytics**: 페이지별 트래픽, Core Web Vitals
- **Supabase Dashboard**: DB 쿼리 성능, 로그
- **Resend Dashboard**: 이메일 전송 상태

---

## 변경 이력

| 버전 | 날짜       | 작성자       | 변경 사항                      |
| ---- | ---------- | ------------ | ------------------------------ |
| v1.0 | 2026-05-06 | Wonseok Park | PRD v1.0 기반 최초 로드맵 작성 |
