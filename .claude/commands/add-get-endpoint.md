---
description: PostgreSQL 테이블을 조회하는 Next.js GET API 엔드포인트를 생성합니다
argument-hint: <endpoint-name> <table-name> <column-name> <condition-value>
allowed-tools: Read, Write, Bash(pnpm:*)
---

다음 인자를 파싱하세요:

```
$ARGUMENTS
```

인자 순서:

1. **endpoint-name**: API 엔드포인트 경로 이름 (예: `users`, `products`)
2. **table-name**: 조회할 PostgreSQL 테이블 이름
3. **column-name**: WHERE 조건에 사용할 컬럼 이름
4. **condition-value**: 해당 컬럼과 비교할 값 (쿼리 파라미터 기본값으로 사용)

## 작업 지시

### 1. 패키지 확인 및 설치

`package.json`을 읽어 PostgreSQL 클라이언트(`pg`, `@vercel/postgres`, `@neondatabase/serverless`, `postgres` 등)가 설치되어 있는지 확인하세요.
설치된 패키지가 없다면 `pnpm add pg` 및 `pnpm add -D @types/pg` 를 실행하세요.

### 2. API 라우트 생성

`app/api/<endpoint-name>/route.ts` 파일을 생성하세요.

**설치된 패키지에 따라 적절한 클라이언트를 사용하세요:**

- `pg` 패키지가 있는 경우:

```typescript
import { Pool } from "pg";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});
```

- `@vercel/postgres` 패키지가 있는 경우:

```typescript
import { sql } from "@vercel/postgres";
```

- `@neondatabase/serverless` 패키지가 있는 경우:

```typescript
import { neon } from "@neondatabase/serverless";

const sql = neon(process.env.DATABASE_URL!);
```

**라우트 핸들러 구조:**

```typescript
import { NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const <column-name> = searchParams.get("<column-name>") ?? "<condition-value>"

  try {
    // DB 쿼리: SELECT * FROM <table-name> WHERE <column-name> = $1
    // 파라미터 바인딩으로 SQL 인젝션 방지

    return NextResponse.json({ data: rows })
  } catch (error) {
    console.error("DB 조회 오류:", error)
    return NextResponse.json(
      { error: "데이터 조회 중 오류가 발생했습니다" },
      { status: 500 }
    )
  }
}
```

### 3. 환경변수 확인

`.env.local` 파일이 존재하면 읽어서 `DATABASE_URL`이 있는지 확인하세요.
없다면 `.env.local`에 다음 주석과 함께 플레이스홀더를 추가하세요:

```
# PostgreSQL 연결 문자열
DATABASE_URL=postgresql://user:password@localhost:5432/dbname
```

### 4. 완료 보고

생성된 파일 경로와 사용 예시를 알려주세요:

- 엔드포인트: `GET /api/<endpoint-name>?<column-name>=<condition-value>`
- 응답 형식: `{ data: [...] }`
