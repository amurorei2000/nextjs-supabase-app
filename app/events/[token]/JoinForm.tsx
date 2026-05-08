"use client";

import { useActionState } from "react";
import { joinEvent } from "./actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface JoinFormProps {
  token: string;
  disabled: boolean;
}

export function JoinForm({ token, disabled }: JoinFormProps) {
  const [state, action, pending] = useActionState(joinEvent, null);

  if (state?.success) {
    return (
      <div className="rounded-lg border border-green-200 bg-green-50 p-4 text-sm text-green-800">
        참여 신청이 완료되었습니다. 주최자 확인 후 안내드립니다.
      </div>
    );
  }

  return (
    <form action={action} className="space-y-4">
      <input type="hidden" name="token" value={token} />
      {state?.error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {state.error}
        </div>
      )}
      <div className="space-y-1.5">
        <Label htmlFor="name">이름 *</Label>
        <Input id="name" name="name" placeholder="홍길동" required disabled={disabled || pending} />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="phone">전화번호 *</Label>
        <Input
          id="phone"
          name="phone"
          type="tel"
          placeholder="010-0000-0000"
          required
          disabled={disabled || pending}
        />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="memo">메모</Label>
        <Textarea
          id="memo"
          name="memo"
          placeholder="전달 사항이 있으면 입력해주세요"
          rows={3}
          disabled={disabled || pending}
        />
      </div>
      <Button type="submit" className="w-full" disabled={disabled || pending}>
        {pending ? "신청 중..." : "참여 신청"}
      </Button>
    </form>
  );
}
