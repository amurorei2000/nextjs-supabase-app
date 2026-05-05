"use server";

import { revalidatePath } from "next/cache";
import { updateProfile } from "@/lib/supabase/profile";
import type { ProfileUpdate } from "@/lib/types/profile";

export async function updateProfileAction(formData: FormData) {
  const updates: ProfileUpdate = {
    username: (formData.get("username") as string) || null,
    full_name: (formData.get("full_name") as string) || null,
    avatar_url: (formData.get("avatar_url") as string) || null,
    bio: (formData.get("bio") as string) || null,
    website: (formData.get("website") as string) || null,
  };

  const result = await updateProfile(updates);

  if (result.success) {
    revalidatePath("/protected/profile");
  }

  return result;
}
