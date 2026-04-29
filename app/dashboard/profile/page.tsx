import { createClient } from "@/utils/supabase/server";
import ProfileForm from "./ProfileForm";
import { notFound, redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function ProfileEditPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  // Fetch true profile data and portfolios
  const [
    { data: profile },
    { data: portfolios }
  ] = user ? await Promise.all([
    supabase.from("users").select("*").eq("id", user.id).single(),
    supabase.from("portfolios").select("*").eq("user_id", user.id).order('created_at', { ascending: false })
  ]) : [{ data: null }, { data: [] }];

  const initialProfile = {
    name: profile?.name || "",
    bio: profile?.bio || "",
    skills: profile?.skills || [],
    portfolios: portfolios || []
  };

  return <ProfileForm initialProfile={initialProfile} />;
}
