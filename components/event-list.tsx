import Link from "next/link";
import { getRecentPublicEvents } from "@/lib/supabase/events";
import { Badge } from "@/components/ui/badge";

export async function EventList() {
  const events = await getRecentPublicEvents();

  if (events.length === 0) {
    return (
      <div className="rounded-lg border border-dashed p-8 text-center text-sm text-muted-foreground">
        현재 모집중인 이벤트가 없습니다.
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      {events.map((event) => {
        const eventDate = new Date(event.event_date).toLocaleString("ko-KR", {
          month: "short",
          day: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        });
        return (
          <Link
            key={event.id}
            href={`/events/${event.public_token}`}
            className="flex flex-col gap-1.5 rounded-xl border bg-card p-4 transition-colors hover:bg-accent"
          >
            <div className="flex items-center justify-between gap-2">
              <span className="truncate font-medium">{event.title}</span>
              <Badge variant="default" className="shrink-0 text-xs">
                모집중
              </Badge>
            </div>
            <div className="flex gap-3 text-xs text-muted-foreground">
              <span>{eventDate}</span>
              <span>·</span>
              <span className="truncate">{event.location}</span>
              {event.max_participants && (
                <>
                  <span>·</span>
                  <span>최대 {event.max_participants}명</span>
                </>
              )}
            </div>
          </Link>
        );
      })}
    </div>
  );
}

export function EventListSkeleton() {
  return (
    <div className="flex flex-col gap-2">
      {[1, 2, 3].map((i) => (
        <div key={i} className="animate-pulse rounded-xl border bg-card p-4">
          <div className="mb-2 h-4 w-2/3 rounded bg-muted" />
          <div className="h-3 w-1/2 rounded bg-muted" />
        </div>
      ))}
    </div>
  );
}
