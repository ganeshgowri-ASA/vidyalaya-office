import { createClient, SupabaseClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";

let _supabase: SupabaseClient | null = null;

export function getSupabaseClient(): SupabaseClient {
  if (!_supabase) {
    if (!supabaseUrl) {
      // Return a dummy client that won't crash during build/SSG
      // Real usage requires env vars to be set
      _supabase = createClient(
        "https://placeholder.supabase.co",
        "placeholder-key"
      );
    } else {
      _supabase = createClient(supabaseUrl, supabaseAnonKey);
    }
  }
  return _supabase;
}

// Lazy getter - won't crash at import time
export const supabase = new Proxy({} as SupabaseClient, {
  get(_target, prop) {
    return (getSupabaseClient() as unknown as Record<string | symbol, unknown>)[prop];
  },
});
