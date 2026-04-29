import { createBrowserClient } from "@supabase/ssr";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL?.replace(/["]+/g, '').trim();
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.replace(/["]+/g, '').trim();

export function createClient() {
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    throw new Error("Missing Supabase Environment Variables");
  }

  return createBrowserClient(
    SUPABASE_URL,
    SUPABASE_ANON_KEY
  );
}
