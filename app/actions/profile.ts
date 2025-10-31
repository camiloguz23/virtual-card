"use server";

import { SupabaseServer } from "@/lib/supabase/server-client";

export type ProfileRecord = {
  id: string;
  name: string | null;
  avatar_url: string | null;
  created_at: string | null;
  updated_at: string | null;
  email: string | null;
};

export const getCurrentProfile = async (): Promise<ProfileRecord | null> => {
  const supabase = await SupabaseServer();

  const {
    data: { user },
    error: sessionError,
  } = await supabase.auth.getUser();

  if (sessionError) {
    throw new Error(`No fue posible obtener la sesión: ${sessionError.message}`);
  }

  if (!user) {
    return null;
  }

  const { data, error } = await supabase
    .from("profiles")
    .select()
    .eq("id", user.id)
    .maybeSingle<ProfileRecord>();

  if (error) {
    throw new Error(`No se pudo obtener el perfil: ${error.message}`);
  }

  return data;
};
