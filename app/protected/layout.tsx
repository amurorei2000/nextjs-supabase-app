import { EnvVarWarning } from "@/components/env-var-warning";
import { AuthButton } from "@/components/auth-button";
import { ThemeSwitcher } from "@/components/theme-switcher";
import { hasEnvVars } from "@/lib/utils";
import Link from "next/link";
import { Suspense } from "react";

export default function ProtectedLayout({ children }: { children: React.ReactNode }) {
  return (
    <main className="flex min-h-screen flex-col items-center bg-background">
      <div className="flex w-full max-w-[480px] flex-1 flex-col">
        <nav className="flex h-14 w-full items-center justify-between border-b border-b-foreground/10 px-4 text-sm">
          <div className="flex items-center gap-4 font-semibold">
            <Link href={"/"}>모임</Link>
            <Link href="/protected/events" className="text-sm font-normal hover:underline">
              내 이벤트
            </Link>
            <Link href="/protected/profile" className="text-sm font-normal hover:underline">
              프로필
            </Link>
          </div>
          {!hasEnvVars ? (
            <EnvVarWarning />
          ) : (
            <Suspense>
              <AuthButton />
            </Suspense>
          )}
        </nav>
        <div className="flex flex-1 flex-col gap-6 p-4">{children}</div>

        <footer className="flex w-full items-center justify-center gap-6 border-t py-8 text-center text-xs">
          <ThemeSwitcher />
        </footer>
      </div>
    </main>
  );
}
