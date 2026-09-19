import { createClient } from "@supabase/supabase-js";

/**
 * Server-only Supabase admin client utility.
 * STRICT: This file must NEVER be imported in Client Components or browser bundles.
 * Uses SUPABASE_SECRET_KEY for privileged server-side operations.
 */

export function getSupabaseAdmin() {
  if (typeof window !== "undefined") {
    throw new Error(
      "getSupabaseAdmin() must only be called in server-side context (Node.js/Next.js server) to protect the secret key."
    );
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const secretKey = process.env.SUPABASE_SECRET_KEY;

  if (!supabaseUrl) {
    throw new Error(
      "NEXT_PUBLIC_SUPABASE_URL environment variable is required for Supabase admin initialization."
    );
  }

  if (!secretKey) {
    throw new Error(
      "SUPABASE_SECRET_KEY environment variable is required for admin operations and must not be empty."
    );
  }

  return createClient(supabaseUrl, secretKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}

/**
 * Safe server-side validation for required environment variables.
 * Never logs or returns secret key values.
 */
export function validateServerEnv(): { isValid: boolean; missing: string[] } {
  if (typeof window !== "undefined") {
    throw new Error("validateServerEnv() must only be called on the server.");
  }

  const required = [
    "NEXT_PUBLIC_SUPABASE_URL",
    "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY",
    "SUPABASE_SECRET_KEY",
    "ADMIN_EMAIL",
    "NEXT_PUBLIC_SITE_URL",
  ] as const;

  const missing = required.filter((key) => !process.env[key]?.trim());

  return {
    isValid: missing.length === 0,
    missing,
  };
}

/**
 * Asserts all required server environment variables exist, throwing a descriptive error if missing.
 */
export function assertServerEnv(): void {
  const { isValid, missing } = validateServerEnv();
  if (!isValid) {
    throw new Error(`Missing required server environment variables: ${missing.join(", ")}`);
  }
}
