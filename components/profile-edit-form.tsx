"use client";

import { cn } from "@/lib/utils";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { updateProfileAction } from "@/app/protected/profile/actions";
import type { Profile } from "@/lib/types/profile";

interface ProfileEditFormProps extends React.ComponentPropsWithoutRef<"div"> {
  profile: Profile | null;
  userEmail: string;
}

export function ProfileEditForm({ profile, userEmail, className, ...props }: ProfileEditFormProps) {
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const formData = new FormData(e.currentTarget);
      const result = await updateProfileAction(formData);
      if (!result.success) throw new Error(result.error ?? "업데이트 실패");
      setSuccess(true);
      router.refresh();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "오류가 발생했습니다.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">프로필 편집</CardTitle>
          <CardDescription>공개 프로필 정보를 수정합니다.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit}>
            <div className="flex flex-col gap-6">
              <div className="grid gap-2">
                <Label htmlFor="email">이메일</Label>
                <Input id="email" type="email" value={userEmail} disabled className="opacity-60" />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="username">사용자명</Label>
                <Input
                  id="username"
                  name="username"
                  type="text"
                  placeholder="your_username (최소 3자)"
                  defaultValue={profile?.username ?? ""}
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="full_name">이름</Label>
                <Input
                  id="full_name"
                  name="full_name"
                  type="text"
                  placeholder="홍길동"
                  defaultValue={profile?.full_name ?? ""}
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="avatar_url">아바타 URL</Label>
                <Input
                  id="avatar_url"
                  name="avatar_url"
                  type="url"
                  placeholder="https://example.com/avatar.png"
                  defaultValue={profile?.avatar_url ?? ""}
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="website">웹사이트</Label>
                <Input
                  id="website"
                  name="website"
                  type="url"
                  placeholder="https://yoursite.com"
                  defaultValue={profile?.website ?? ""}
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="bio">소개</Label>
                <textarea
                  id="bio"
                  name="bio"
                  rows={3}
                  placeholder="자신을 간단히 소개해주세요."
                  defaultValue={profile?.bio ?? ""}
                  className="flex w-full resize-none rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                />
              </div>

              {error && <p className="text-sm text-red-500">{error}</p>}
              {success && (
                <p className="text-sm text-green-600">프로필이 성공적으로 저장되었습니다.</p>
              )}

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? "저장 중..." : "변경사항 저장"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
