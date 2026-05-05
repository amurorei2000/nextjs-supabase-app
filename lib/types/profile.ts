export interface Profile {
  id: string;
  username: string | null;
  full_name: string | null;
  avatar_url: string | null;
  bio: string | null;
  website: string | null;
  updated_at: string;
  created_at: string;
}

export type ProfileUpdate = Pick<
  Profile,
  "username" | "full_name" | "avatar_url" | "bio" | "website"
>;
