import { createServerClient, type CookieOptions } from "@supabase/ssr";

/**
 * Sanitize environment variables to remove accidental quotes or spaces
 */
const SUPABASE_URL = process.env.VITE_SUPABASE_URL?.replace(/["']+/g, '').trim();
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY?.replace(/["']+/g, '').trim();

export async function createClient(cookieOptions?: { getAll: () => { name: string; value: string }[], set: (name: string, value: string, options?: any) => void }) {
  const cookieStore = cookieOptions || {
    getAll: () => [],
    set: () => {},
  };

  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    throw new Error("Missing Supabase Environment Variables");
  }

  return createServerClient(
    SUPABASE_URL,
    SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet: { name: string; value: string; options: CookieOptions }[]) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // Safe to ignore in Server Components
          }
        },
      },
    }
  );
}
