import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getEventsByOrganizer } from "@/lib/supabase/events";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export default async function EventsPage() {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getClaims();
  if (error || !data?.claims) redirect("/auth/login");

  const events = await getEventsByOrganizer();

  return (
    <div className="flex w-full flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">내 이벤트</h1>
          <p className="mt-1 text-muted-foreground">주최한 이벤트를 관리합니다.</p>
        </div>
        <Button asChild>
          <Link href="/protected/events/new">이벤트 만들기</Link>
        </Button>
      </div>

      {events.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-16 text-center">
          <p className="text-muted-foreground">아직 만든 이벤트가 없습니다.</p>
          <Button asChild className="mt-4">
            <Link href="/protected/events/new">첫 이벤트 만들기</Link>
          </Button>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {events.map((event) => {
            const eventDate = new Date(event.event_date).toLocaleString("ko-KR", {
              year: "numeric",
              month: "long",
              day: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            });
            return (
              <Link
                key={event.id}
                href={`/protected/events/${event.id}`}
                className="flex flex-col gap-2 rounded-lg border bg-card p-4 transition-colors hover:bg-accent"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="truncate font-semibold">{event.title}</span>
                  <Badge variant={event.status === "open" ? "default" : "secondary"}>
                    {event.status === "open" ? "모집중" : "마감"}
                  </Badge>
                </div>
                <div className="flex gap-4 text-sm text-muted-foreground">
                  <span>{eventDate}</span>
                  <span>{event.location}</span>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
