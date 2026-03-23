import { createClient, SupabaseClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";

let _supabase: SupabaseClient | null = null;

function getOrCreateClient(): SupabaseClient {
  if (!_supabase) {
    if (!supabaseUrl) {
      // Return a dummy client that won't throw during build
      _supabase = createClient("https://placeholder.supabase.co", "placeholder");
    } else {
      _supabase = createClient(supabaseUrl, supabaseAnonKey);
    }
  }
  return _supabase;
}

export const supabase = new Proxy({} as SupabaseClient, {
  get(_target, prop) {
    return (getOrCreateClient() as unknown as Record<string | symbol, unknown>)[prop];
  },
});

export function getSupabaseClient() {
  return supabase;
}
