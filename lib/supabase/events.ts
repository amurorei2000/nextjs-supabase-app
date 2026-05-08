import { createClient } from "@/lib/supabase/server";
import type { Event } from "@/lib/types/event";
import type { Participant } from "@/lib/types/participant";

export async function getEventByToken(token: string): Promise<Event | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("events")
    .select("*")
    .eq("public_token", token)
    .limit(1)
    .single();

  if (error) {
    console.error("[getEventByToken]", error.message);
    return null;
  }
  return data as Event;
}

export async function getEventById(id: string): Promise<Event | null> {
  const supabase = await createClient();
  const { data, error } = await supabase.from("events").select("*").eq("id", id).single();

  if (error) {
    console.error("[getEventById]", error.message);
    return null;
  }
  return data as Event;
}

export async function getEventsByOrganizer(): Promise<Event[]> {
  const supabase = await createClient();
  const { data: claims } = await supabase.auth.getClaims();
  if (!claims?.claims) return [];

  const { data, error } = await supabase
    .from("events")
    .select("*")
    .eq("organizer_id", claims.claims.sub)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("[getEventsByOrganizer]", error.message);
    return [];
  }
  return (data ?? []) as Event[];
}

export async function getRecentPublicEvents(limit = 10): Promise<Event[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("events")
    .select("*")
    .eq("status", "open")
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) {
    console.error("[getRecentPublicEvents]", error.message);
    return [];
  }
  return (data ?? []) as Event[];
}

export async function getEventParticipants(eventId: string): Promise<Participant[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("participants")
    .select("*")
    .eq("event_id", eventId)
    .order("created_at", { ascending: true });

  if (error) {
    console.error("[getEventParticipants]", error.message);
    return [];
  }
  return (data ?? []) as Participant[];
}
