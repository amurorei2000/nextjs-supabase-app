import { createClient } from "@/lib/supabase/server";
import type { Profile, ProfileUpdate } from "@/lib/types/profile";

export async function getProfile(): Promise<Profile | null> {
  const supabase = await createClient();
  const { data: claims } = await supabase.auth.getClaims();
  if (!claims?.claims) return null;

  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", claims.claims.sub)
    .single();

  if (error) {
    console.error("[getProfile]", error.message);
    return null;
  }
  return data as Profile;
}

export async function updateProfile(updates: ProfileUpdate): Promise<{
  success: boolean;
  error?: string;
}> {
  const supabase = await createClient();
  const { data: claims } = await supabase.auth.getClaims();
  if (!claims?.claims) return { success: false, error: "Unauthorized" };

  const { error } = await supabase.from("profiles").upsert({ id: claims.claims.sub, ...updates });

  if (error) {
    if (error.code === "23505") {
      return { success: false, error: "이미 사용 중인 사용자명입니다." };
    }
    return { success: false, error: error.message };
  }
  return { success: true };
}
