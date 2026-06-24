import { createClient } from "@supabase/supabase-js";

const url = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const anon = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

if (!url || !anon) {
  // eslint-disable-next-line no-console
  console.warn(
    "[Mindful] Missing VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY. Auth & data calls will fail until you set them in .env.",
  );
}

export const supabase = createClient(url ?? "https://placeholder.supabase.co", anon ?? "placeholder", {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});

export const supabaseConfigured = Boolean(url && anon);
