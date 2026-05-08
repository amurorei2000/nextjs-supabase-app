import type { Database } from "@/lib/types/database";

export type Event = Database["public"]["Tables"]["events"]["Row"];
export type EventInsert = Omit<
  Database["public"]["Tables"]["events"]["Insert"],
  "id" | "created_at" | "updated_at" | "organizer_id" | "public_token"
>;
export type EventUpdate = Partial<
  Pick<Event, "title" | "description" | "event_date" | "location" | "max_participants" | "status">
>;
