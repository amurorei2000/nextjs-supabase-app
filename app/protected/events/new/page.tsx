import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createEvent } from "@/app/protected/events/[id]/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface Props {
  searchParams: Promise<{ error?: string }>;
}

export default async function NewEventPage({ searchParams }: Props) {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getClaims();
  if (error || !data?.claims) redirect("/auth/login");

  const { error: formError } = await searchParams;

  return (
    <div className="flex w-full flex-col gap-6">
      <div>
        <h1 className="text-3xl font-bold">이벤트 만들기</h1>
        <p className="mt-1 text-muted-foreground">새 모임 이벤트를 생성합니다.</p>
      </div>
      {formError && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {formError}
        </div>
      )}

      <form action={createEvent} className="flex flex-col gap-4">
        <div className="space-y-1.5">
          <Label htmlFor="title">제목 *</Label>
          <Input id="title" name="title" placeholder="6월 수영 모임" required />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="event_date">날짜 / 시간 *</Label>
          <Input id="event_date" name="event_date" type="datetime-local" required />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="location">장소 *</Label>
          <Input id="location" name="location" placeholder="서울 강남 수영장" required />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="description">설명</Label>
          <Textarea
            id="description"
            name="description"
            placeholder="이벤트에 대해 설명해주세요"
            rows={4}
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="max_participants">최대 인원</Label>
          <Input
            id="max_participants"
            name="max_participants"
            type="number"
            min={1}
            placeholder="제한 없음"
          />
        </div>

        <Button type="submit" className="mt-2">
          이벤트 생성
        </Button>
      </form>
    </div>
  );
}
