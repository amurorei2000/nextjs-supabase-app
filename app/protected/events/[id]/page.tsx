import { Suspense } from "react";
import { connection } from "next/server";
import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getEventById, getEventParticipants } from "@/lib/supabase/events";
import { closeEvent, updateParticipantStatus } from "./actions";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { CopyButton } from "@/components/copy-button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface Props {
  params: Promise<{ id: string }>;
}

async function EventManageContent({ params }: { params: Promise<{ id: string }> }) {
  await connection();
  const { id } = await params;

  const supabase = await createClient();
  const { data, error } = await supabase.auth.getClaims();
  if (error || !data?.claims) redirect("/auth/login");

  const event = await getEventById(id);
  if (!event) notFound();

  const participants = await getEventParticipants(event.id);

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "";
  const publicUrl = `${appUrl}/events/${event.public_token}`;

  const eventDate = new Date(event.event_date).toLocaleString("ko-KR", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <div className="flex w-full flex-col gap-6">
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h1 className="text-3xl font-bold">{event.title}</h1>
            <Badge variant={event.status === "open" ? "default" : "secondary"}>
              {event.status === "open" ? "모집중" : "마감"}
            </Badge>
          </div>
          {event.description && <p className="text-muted-foreground">{event.description}</p>}
        </div>

        {event.status === "open" && (
          <form action={closeEvent.bind(null, id)}>
            <Button type="submit" variant="destructive" size="sm">
              이벤트 마감
            </Button>
          </form>
        )}
      </div>

      <div className="bg-card space-y-2 rounded-lg border p-4 text-sm">
        <div className="flex justify-between">
          <span className="text-muted-foreground">일시</span>
          <span>{eventDate}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">장소</span>
          <span>{event.location}</span>
        </div>
        {event.max_participants && (
          <div className="flex justify-between">
            <span className="text-muted-foreground">최대 인원</span>
            <span>{event.max_participants}명</span>
          </div>
        )}
      </div>

      <div className="space-y-2">
        <p className="text-sm font-medium">공개 참여 링크</p>
        <div className="bg-muted flex items-center gap-2 rounded-lg border px-3 py-2">
          <span className="text-muted-foreground flex-1 truncate text-sm">{publicUrl}</span>
          <CopyButton text={publicUrl} />
        </div>
      </div>

      <Separator />

      <div className="space-y-4">
        <h2 className="text-lg font-semibold">
          참여자 목록{" "}
          <span className="text-muted-foreground text-base font-normal">
            ({participants.length}명)
          </span>
        </h2>

        {participants.length === 0 ? (
          <p className="text-muted-foreground text-sm">아직 신청자가 없습니다.</p>
        ) : (
          <div className="overflow-hidden rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>이름</TableHead>
                  <TableHead>전화번호</TableHead>
                  <TableHead>메모</TableHead>
                  <TableHead>신청 시간</TableHead>
                  <TableHead>상태</TableHead>
                  <TableHead className="text-right">관리</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {participants.map((p) => (
                  <TableRow key={p.id}>
                    <TableCell className="font-medium">{p.name}</TableCell>
                    <TableCell>{p.phone}</TableCell>
                    <TableCell className="text-muted-foreground">{p.memo ?? "-"}</TableCell>
                    <TableCell className="text-muted-foreground text-sm">
                      {p.created_at
                        ? new Date(p.created_at).toLocaleString("ko-KR", {
                            month: "short",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })
                        : "-"}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          p.status === "confirmed"
                            ? "default"
                            : p.status === "cancelled"
                              ? "destructive"
                              : "secondary"
                        }
                      >
                        {p.status === "confirmed"
                          ? "확정"
                          : p.status === "cancelled"
                            ? "취소"
                            : "대기"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      {p.status === "pending" && (
                        <div className="flex justify-end gap-1">
                          <form action={updateParticipantStatus.bind(null, p.id, "confirmed")}>
                            <Button type="submit" size="sm" variant="default">
                              확정
                            </Button>
                          </form>
                          <form action={updateParticipantStatus.bind(null, p.id, "cancelled")}>
                            <Button type="submit" size="sm" variant="outline">
                              취소
                            </Button>
                          </form>
                        </div>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>
    </div>
  );
}

export default function EventManagePage({ params }: Props) {
  return (
    <Suspense fallback={<div className="text-muted-foreground text-sm">불러오는 중...</div>}>
      <EventManageContent params={params} />
    </Suspense>
  );
}
