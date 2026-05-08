"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { EventInsert, EventUpdate } from "@/lib/types/event";

export async function createEvent(formData: FormData): Promise<void> {
  const supabase = await createClient();
  const { data: claims } = await supabase.auth.getClaims();
  if (!claims?.claims) redirect("/auth/login");

  const userId = claims.claims.sub;
  const payload: EventInsert & { organizer_id: string; public_token: string } = {
    organizer_id: userId,
    title: formData.get("title") as string,
    description: (formData.get("description") as string) || null,
    event_date: formData.get("event_date") as string,
    location: formData.get("location") as string,
    max_participants: formData.get("max_participants")
      ? Number(formData.get("max_participants"))
      : null,
    public_token: crypto.randomUUID(),
  };

  let { data, error } = await supabase.from("events").insert(payload).select().single();

  if (error?.code === "23505") {
    payload.public_token = crypto.randomUUID();
    ({ data, error } = await supabase.from("events").insert(payload).select().single());
  }

  if (error || !data) {
    redirect(
      "/protected/events/new?error=" +
        encodeURIComponent(error?.message ?? "이벤트 생성에 실패했습니다."),
    );
  }

  revalidatePath("/protected/events");
  redirect("/protected/events/" + data.id);
}

export async function updateEvent(
  id: string,
  formData: FormData,
): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient();
  const { data: claims } = await supabase.auth.getClaims();
  if (!claims?.claims) return { success: false, error: "Unauthorized" };

  const updates: EventUpdate = {
    title: formData.get("title") as string,
    description: (formData.get("description") as string) || null,
    event_date: formData.get("event_date") as string,
    location: formData.get("location") as string,
    max_participants: formData.get("max_participants")
      ? Number(formData.get("max_participants"))
      : null,
  };

  const { error } = await supabase
    .from("events")
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq("id", id)
    .eq("organizer_id", claims.claims.sub);

  if (error) return { success: false, error: error.message };

  revalidatePath("/protected/events/" + id);
  return { success: true };
}

export async function updateParticipantStatus(
  participantId: string,
  newStatus: "confirmed" | "cancelled",
): Promise<void> {
  const supabase = await createClient();
  const { data: claims } = await supabase.auth.getClaims();
  if (!claims?.claims) redirect("/auth/login");

  const userId = claims.claims.sub;

  const { data: participant, error: fetchError } = await supabase
    .from("participants")
    .select("event_id, events!inner(organizer_id)")
    .eq("id", participantId)
    .eq("events.organizer_id", userId)
    .single();

  if (fetchError || !participant) {
    console.error("[updateParticipantStatus] 권한 없음 또는 참여자 없음");
    return;
  }

  const { error } = await supabase
    .from("participants")
    .update({ status: newStatus })
    .eq("id", participantId);

  if (error) console.error("[updateParticipantStatus]", error.message);

  revalidatePath("/protected/events/" + participant.event_id);
}

export async function closeEvent(id: string): Promise<void> {
  const supabase = await createClient();
  const { data: claims } = await supabase.auth.getClaims();
  if (!claims?.claims) redirect("/auth/login");

  const { error } = await supabase
    .from("events")
    .update({ status: "closed", updated_at: new Date().toISOString() })
    .eq("id", id)
    .eq("organizer_id", claims.claims.sub);

  if (error) console.error("[closeEvent]", error.message);

  revalidatePath("/protected/events/" + id);
}
