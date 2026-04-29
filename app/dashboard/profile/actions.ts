"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";

export async function updateProfile(formData: FormData) {
  const supabase = await createClient();
  const cookieStore = await cookies();
  const allCookies = cookieStore.getAll().map(c => c.name).join(", ");
  
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    console.error("SESSION ERROR: No user found. Cookies present: ", allCookies);
    return { 
      success: false, 
      error: `Authentication failed. (Found cookies: ${allCookies || 'NONE'}). Please clear cookies for localhost and log in again.` 
    };
  }

  const name = formData.get("name") as string;
  const bio = formData.get("bio") as string;
  const skillsRaw = formData.get("skills") as string;
  const skills = skillsRaw ? JSON.parse(skillsRaw) : [];

  const { error } = await supabase
    .from("users")
    .update({
      name,
      bio,
      skills,
    })
    .eq("id", user.id);

  if (error) {
    console.error("DATABASE ERROR:", error.message);
    if (error.code === "PGRST116") return { success: false, error: "User profile not found in database." };
    return { success: false, error: "Database error: " + error.message };
  }

  revalidatePath("/dashboard/profile");
  revalidatePath("/freelancer/[id]", "page");
  return { success: true };
}

export async function addPortfolioItem(formData: FormData) {
  const supabase = await createClient();
  const { data: { session } } = await supabase.auth.getSession();
  const user = session?.user;

  if (!user) return { success: false, error: "Unauthorized. Please re-login." };

  const title = formData.get("title") as string;
  const description = formData.get("description") as string;
  const image_url = formData.get("image_url") as string;
  const external_link = formData.get("external_link") as string;
  
  const { error } = await supabase
    .from("portfolios")
    .insert({
      user_id: user.id,
      title,
      description,
      image_url,
      external_link
    });

  if (error) return { success: false, error: error.message };

  revalidatePath("/dashboard/profile");
  revalidatePath("/freelancer/[id]", "page");
  return { success: true };
}

export async function deletePortfolioItem(id: string) {
  const supabase = await createClient();
  const { data: { session } } = await supabase.auth.getSession();
  const user = session?.user;

  if (!user) return { success: false, error: "Unauthorized. Please re-login." };

  const { error } = await supabase
    .from("portfolios")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) return { success: false, error: error.message };

  revalidatePath("/dashboard/profile");
  revalidatePath("/freelancer/[id]", "page");
  return { success: true };
}
