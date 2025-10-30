"use client";

import { createClient } from "@supabase/supabase-js";
import type { SupabaseClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_PROJECT_URL;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_API_KEY;

let client: SupabaseClient | null = null;

function ensureSupabaseEnv() {
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    throw new Error(
      "Supabase environment variables are missing. Please set NEXT_PUBLIC_SUPABASE_PROJECT_URL and NEXT_PUBLIC_SUPABASE_API_KEY.",
    );
  }
}

export function getSupabaseClient(): SupabaseClient {
  if (client) {
    return client;
  }

  ensureSupabaseEnv();

  client = createClient(SUPABASE_URL!, SUPABASE_ANON_KEY!, {
    auth: {
      persistSession: true,
    },
  });

  return client;
}

export const supabaseClient = getSupabaseClient();
