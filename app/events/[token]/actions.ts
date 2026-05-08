"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getEventByToken } from "@/lib/supabase/events";

export async function joinEvent(
  _prevState: { success: boolean; error?: string } | null,
  formData: FormData,
): Promise<{ success: boolean; error?: string }> {
  const token = formData.get("token") as string;
  const event = await getEventByToken(token);
  if (!event) return { success: false, error: "존재하지 않는 이벤트입니다." };
  if (event.status === "closed") return { success: false, error: "마감된 이벤트입니다." };

  const supabase = await createClient();

  if (event.max_participants) {
    const { count } = await supabase
      .from("participants")
      .select("*", { count: "exact", head: true })
      .eq("event_id", event.id)
      .neq("status", "cancelled");

    if (count !== null && count >= event.max_participants) {
      return { success: false, error: "최대 인원이 초과되었습니다." };
    }
  }

  const { error } = await supabase.from("participants").insert({
    event_id: event.id,
    name: formData.get("name") as string,
    phone: formData.get("phone") as string,
    memo: (formData.get("memo") as string) || null,
    status: "pending",
  });

  if (error) {
    if (error.code === "23505") return { success: false, error: "이미 신청된 전화번호입니다." };
    return { success: false, error: error.message };
  }

  revalidatePath("/events/" + token);
  return { success: true };
}
