import { notFound } from "next/navigation";
import { getEventByToken, getEventParticipants } from "@/lib/supabase/events";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { JoinForm } from "./JoinForm";

interface Props {
  params: Promise<{ token: string }>;
}

export default async function PublicEventPage({ params }: Props) {
  const { token } = await params;
  const event = await getEventByToken(token);
  if (!event) notFound();

  const participants = await getEventParticipants(event.id);
  const activeCount = participants.filter((p) => p.status !== "cancelled").length;
  const isClosed = event.status === "closed";
  const isFull = !!(event.max_participants && activeCount >= event.max_participants);
  const formDisabled = isClosed || isFull;

  const eventDate = new Date(event.event_date).toLocaleString("ko-KR", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <div className="mx-auto w-full max-w-[480px] px-4 py-6">
      <div className="space-y-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold">{event.title}</h1>
            {isClosed ? (
              <Badge variant="destructive">마감</Badge>
            ) : isFull ? (
              <Badge variant="secondary">정원 마감</Badge>
            ) : (
              <Badge variant="default">모집중</Badge>
            )}
          </div>
          {event.description && (
            <p className="text-sm text-muted-foreground">{event.description}</p>
          )}
        </div>

        <div className="space-y-2 rounded-lg border bg-card p-4 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">일시</span>
            <span>{eventDate}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">장소</span>
            <span>{event.location}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">참여 인원</span>
            <span>
              {activeCount}
              {event.max_participants ? ` / ${event.max_participants}명` : "명"}
            </span>
          </div>
        </div>

        {isClosed && (
          <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-4 text-sm text-yellow-800">
            이 이벤트는 마감되었습니다.
          </div>
        )}

        {!isClosed && (
          <>
            <Separator />
            <div className="space-y-4">
              <h2 className="font-semibold">참여 신청</h2>
              <JoinForm token={token} disabled={formDisabled} />
            </div>
          </>
        )}
      </div>
    </div>
  );
}
