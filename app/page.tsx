import { EnvVarWarning } from "@/components/env-var-warning";
import { AuthButton } from "@/components/auth-button";
import { ThemeSwitcher } from "@/components/theme-switcher";
import { hasEnvVars } from "@/lib/utils";
import { EventList, EventListSkeleton } from "@/components/event-list";
import Link from "next/link";
import { Suspense } from "react";
import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center bg-background">
      <div className="flex w-full max-w-[480px] flex-1 flex-col">
        <nav className="flex h-14 w-full items-center justify-between border-b border-b-foreground/10 px-4 text-sm">
          <span className="text-base font-bold">모임</span>
          <div className="flex items-center gap-2">
            <ThemeSwitcher />
            {!hasEnvVars ? (
              <EnvVarWarning />
            ) : (
              <Suspense>
                <AuthButton />
              </Suspense>
            )}
          </div>
        </nav>

        <div className="flex flex-1 flex-col gap-6 p-4">
          <div className="flex flex-col gap-3 pt-2">
            <h1 className="text-2xl font-bold">모임 이벤트</h1>
            <p className="text-sm text-muted-foreground">
              링크 하나로 참여 신청·카풀·정산까지 한 번에.
            </p>
            {hasEnvVars && (
              <Button asChild className="mt-1 w-full">
                <Link href="/protected/events/new">+ 이벤트 만들기</Link>
              </Button>
            )}
          </div>

          <div className="flex flex-col gap-3">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
              모집중인 이벤트
            </h2>
            {hasEnvVars ? (
              <Suspense fallback={<EventListSkeleton />}>
                <EventList />
              </Suspense>
            ) : (
              <div className="rounded-lg border border-dashed p-8 text-center text-sm text-muted-foreground">
                환경 변수를 설정해주세요.
              </div>
            )}
          </div>
        </div>

        <footer className="flex w-full items-center justify-center border-t py-6 text-xs text-muted-foreground">
          모임 이벤트 관리
        </footer>
      </div>
    </main>
  );
}
