"use server";

import { redirect } from "next/navigation";

import { SupabaseServer, SupabaseServiceRole } from "@/lib/supabase/server-client";
import { createCard } from "./cards";

export type ProfileRecord = {
  id: string;
  name: string | null;
  avatar_url: string | null;
  created_at: string | null;
  updated_at: string | null;
  email: string | null;
  position: string | null;
  phone: string | null;
  code_phone: string | null;
  company: string | null;
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

const buildUserPageUrl = (
  targetId: string | null | undefined,
  extra?: Record<string, string>
) => {
  const searchParams = new URLSearchParams();
  const trimmedId = targetId?.trim();

  if (trimmedId) {
    searchParams.set("id", trimmedId);
  }

  Object.entries(extra ?? {}).forEach(([key, value]) => {
    if (value) {
      searchParams.set(key, value);
    }
  });

  const query = searchParams.toString();
  return query ? `/user?${query}` : "/user";
};

export const saveCardFromProfile = async (formData: FormData) => {
  const submittedId = formData.get("profile_id");
  const requestedId = formData.get("requested_id");

  const targetId =
    typeof submittedId === "string" ? submittedId.trim() : "";
  const fallbackId =
    typeof requestedId === "string" ? requestedId.trim() : "";

  const redirectId = targetId || fallbackId;

  if (!targetId) {
    redirect(
      buildUserPageUrl(redirectId, {
        error: "No se proporcionó un usuario válido.",
      })
    );
  }

  const profileRecord = await getUserInfo(targetId);

  if (!profileRecord) {
    redirect(
      buildUserPageUrl(redirectId, {
        error: "No se encontró información de perfil para este usuario.",
      })
    );
  }

  const fullName = profileRecord.name?.trim();

  if (!fullName) {
    redirect(
      buildUserPageUrl(profileRecord.id, {
        error: "El perfil no tiene un nombre configurado.",
      })
    );
  }

  try {
    await createCard({
      fullName,
      email: profileRecord.email,
      phone: profileRecord.phone,
      company: profileRecord.company,
      position: profileRecord.position,
      codePhone: profileRecord.code_phone,
      userId: profileRecord.id,
    });

    redirect(
      buildUserPageUrl(profileRecord.id, {
        saved: "1",
      })
    );
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "No fue posible guardar la tarjeta.";

    redirect(
      buildUserPageUrl(profileRecord.id, {
        error: message,
      })
    );
  }
};

export const getUserInfo = async (userId: string): Promise<ProfileRecord | null> => {
  const supabase = SupabaseServiceRole();

  const { data, error } = await supabase
    .from("profiles")
    .select()
    .eq("id", userId)
    .maybeSingle<ProfileRecord>();

  if (error) {
    throw new Error(`No se pudo obtener el perfil: ${error.message}`);
  }

  return data;
};