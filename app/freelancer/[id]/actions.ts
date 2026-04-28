"use server";

import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";

export async function initiateDealRoom(formData: FormData) {
  const freelancerId = formData.get("freelancerId") as string;
  if (!freelancerId) {
    return;
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // 1. If not logged in, redirect to login page.
  // Ideally, you'd pass a "returnTo" parameter to return the user here after auth.
  if (!user) {
    redirect(`/login?error=Sign%20in%20to%20message%20this%20freelancer&returnTo=/freelancer/${freelancerId}`);
  }

  // 2. Check if a Deal Room (conversation) already exists for this pair
  const { data: existingConv, error: checkError } = await supabase
    .from("conversations")
    .select("id")
    .eq("freelancer_id", freelancerId)
    .eq("client_id", user.id)
    .maybeSingle();

  let conversationId = existingConv?.id;

  // 3. If no existing conversation, create a new one
  if (!conversationId) {
    const { data: newConv, error: insertError } = await supabase
      .from("conversations")
      .insert({
        freelancer_id: freelancerId,
        client_id: user.id,
      })
      .select("id")
      .single();

    if (newConv) {
      conversationId = newConv.id;
    }
  }

  // 4. Redirect the client to the newly created (or existing) Deal Room
  if (conversationId) {
    redirect(`/dashboard/messages?room=${conversationId}`);
  } else {
    redirect(`/freelancer/${freelancerId}?error=Unable%20to%20create%20deal%20room`);
  }
}
