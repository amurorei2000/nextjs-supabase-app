import type { Database } from "@/lib/types/database";

export type Participant = Database["public"]["Tables"]["participants"]["Row"];
export type ParticipantInsert = Omit<
  Database["public"]["Tables"]["participants"]["Insert"],
  "id" | "created_at" | "status"
>;
