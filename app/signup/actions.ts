"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";

export async function signup(formData: FormData) {
  const supabase = await createClient();
  const credentials = {
    email: (formData.get("email") as string).trim().toLowerCase(),
    password: formData.get("password") as string,
  };

  const { data: authData, error } = await supabase.auth.signUp(credentials);

  if (error) {
    redirect("/signup?error=" + encodeURIComponent(error.message));
  }

  if (authData.user && !authData.session) {
    redirect("/login?message=" + encodeURIComponent("Check your email to confirm your account before logging in."));
  }

  revalidatePath("/", "layout");
  redirect("/dashboard");
}
