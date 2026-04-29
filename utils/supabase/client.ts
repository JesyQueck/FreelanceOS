import { createBrowserClient } from "@supabase/ssr";

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL?.replace(/["]+/g, '').trim();
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY?.replace(/["]+/g, '').trim();

export function createClient() {
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    throw new Error("Missing Supabase Environment Variables");
  }

  return createBrowserClient(
    SUPABASE_URL,
    SUPABASE_ANON_KEY
  );
}
