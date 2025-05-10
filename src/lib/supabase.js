// lib/supabase.js
import { createClient } from "@supabase/supabase-js";

export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
      // eliminamos storageKey para dejar el default de cookies
    },
  }
);

export async function getCurrentUser() {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
}

export async function signOut() {
  await supabase.auth.signOut();
  window.location.href = "/";
}

export const handleOperationWithAuth = async (operation) => {
  try {
    return await operation();
  } catch (error) {
    if (
      error.code === "PGRST301" ||
      error.message.includes("authentication") ||
      error.message.includes("permission")
    ) {
      console.error("Error de autenticación:", error);
      window.location.href = "/";
    }
    throw error;
  }
};
