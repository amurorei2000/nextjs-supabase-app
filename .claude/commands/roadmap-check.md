---
description: 코드베이스 실제 상태를 분석하여 ROADMAP.md의 완료된 항목에 체크표시를 업데이트합니다
allowed-tools: Read, Edit, Bash(find:*), Bash(grep:*), Bash(ls:*), Bash(pnpm:*)
---

`.claude/docs/ROADMAP.md`의 체크리스트를 실제 코드베이스 상태 기준으로 업데이트하세요.

## 작업 순서

### 1. 현재 ROADMAP.md 읽기

`.claude/docs/ROADMAP.md`를 읽어 `- [ ]` 항목 목록을 파악하세요.

### 2. 코드베이스 상태 분석

아래 기준으로 각 항목의 완료 여부를 판단하세요.

**파일 존재 확인 (bash find/ls):**

- `app/page.tsx` — Phase 3-A: 목록 페이지
- `app/posts/[id]/page.tsx` — Phase 3-C: 상세 페이지
- `app/upload/page.tsx` + `app/upload/actions.ts` — Phase 3-B: 등록 페이지
- `components/features/Header.tsx` — Phase 2: 헤더 컴포넌트
- `components/features/PostCard.tsx` — Phase 3-A: 포스트 카드
- `components/features/UploadForm.tsx` — Phase 3-B: 등록 폼
- `services/notion.ts` — Phase 2: Notion API 래퍼
- `types/notion.ts` — Phase 2: 타입 정의
- `constants/index.ts` — Phase 1: 상수 파일
- `.env.example` — Phase 1: 환경변수 템플릿
- `components/ui/button.tsx`, `components/ui/sonner.tsx`, `components/ui/tooltip.tsx` — Phase 1: shadcn/ui

**코드 내용 확인 (bash grep):**

- `services/notion.ts`에 `fetch(` 포함 → fetch 직접 호출 방식 적용 여부
- `services/notion.ts`에 `getPosts`, `getPost`, `createPost` 함수 존재
- `types/notion.ts`에 `mapPageToStudyPost` 또는 타입 가드 함수 존재
- `app/upload/actions.ts`에 `'use server'` 포함 → Server Action 적용
- `app/upload/actions.ts`에 `createPost` 호출 포함
- `app/upload/actions.ts`에 `redirect(` 포함 → 제출 후 리디렉션
- `components/features/UploadForm.tsx`에 필수 필드(`studyTitle`, `writer`, `studyNote`) 포함
- `components/features/UploadForm.tsx`에 `required` 속성 포함 → 클라이언트 유효성 검사
- `components/features/Header.tsx`에 `useTheme` 포함 → 다크 모드 토글
- `app/posts/[id]/page.tsx`에 `notFound()` 호출 포함
- `app/layout.tsx`에 `<Header />` 포함
- `app/layout.tsx`에 `<Toaster />` 포함
- `app/layout.tsx`에 `ThemeProvider` 포함
- `app/page.tsx`에 `getPosts` 호출 포함
- `tsconfig.json`에 `"strict": true` 또는 `"noUnusedLocals": true` 포함

**빌드 검증 (pnpm):**

- `pnpm type-check` 에러 0건 → TypeScript strict 모드 통과

### 3. 완료 판단 기준

다음 모든 조건이 충족될 때만 해당 항목을 완료로 표시하세요:

- 관련 파일이 실제로 존재하고
- 파일 내에 필요한 코드/함수/속성이 구현되어 있을 때

"🟡" 또는 "🔴" 이모지가 붙은 항목도 위 조건을 만족하면 완료(`[x]`)로 표시하세요.

### 4. ROADMAP.md 업데이트

분석 결과를 바탕으로 `.claude/docs/ROADMAP.md`에서:

- 완료된 항목: `- [ ]` → `- [x]`
- 미완료 항목: 변경하지 않음
- 이미 `- [x]`인 항목: 변경하지 않음

Edit 도구로 각 항목을 정확히 수정하세요. 체크박스 텍스트 외 다른 내용은 절대 변경하지 마세요.

### 5. 완료 보고

다음 형식으로 결과를 보고하세요:

```
## ROADMAP 체크 결과

### 새로 완료 처리된 항목 (N건)
- Phase X — [항목 설명]
- ...

### 미완료 항목 (N건)
- Phase X — [항목 설명] (사유: 파일 없음 / 코드 미구현)
- ...
```
