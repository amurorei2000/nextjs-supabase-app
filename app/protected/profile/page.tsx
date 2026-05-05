import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getProfile } from "@/lib/supabase/profile";
import { ProfileEditForm } from "@/components/profile-edit-form";

export default async function ProfilePage() {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getClaims();

  if (error || !data?.claims) {
    redirect("/auth/login");
  }

  const profile = await getProfile();

  return (
    <div className="flex w-full max-w-2xl flex-col gap-8">
      <div>
        <h1 className="text-3xl font-bold">프로필</h1>
        <p className="mt-1 text-muted-foreground">공개 프로필 정보를 관리합니다.</p>
      </div>
      <ProfileEditForm profile={profile} userEmail={data.claims.email as string} />
    </div>
  );
}
