"use server";

import {
  SupabaseServer,
  SupabaseServiceRole,
} from "@/lib/supabase/server-client";
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
    throw new Error(
      `No fue posible obtener la sesión: ${sessionError.message}`
    );
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

export type SaveCardFromProfileState = {
  success: boolean;
  error?: string;
};

export const saveCardFromProfile = async (
  _prevState: SaveCardFromProfileState | undefined,
  formData: FormData
): Promise<SaveCardFromProfileState> => {
  try {
    const submittedId = formData.get("profile_id");
    const requestedId = formData.get("requested_id");

    const targetId = typeof submittedId === "string" ? submittedId.trim() : "";
    const fallbackId =
      typeof requestedId === "string" ? requestedId.trim() : "";

    const effectiveId = targetId || fallbackId;

    if (!effectiveId) {
      return {
        success: false,
        error: "No se proporcionó un usuario válido.",
      };
    }

    const profileRecord = await getUserInfo(effectiveId);

    if (!profileRecord) {
      return {
        success: false,
        error: "No se encontró información de perfil para este usuario.",
      };
    }

    const fullName = profileRecord.name?.trim();

    if (!fullName) {
      return {
        success: false,
        error: "El perfil no tiene un nombre configurado.",
      };
    }

    const supabase = await SupabaseServer();
    const {
      data: { user },
      error: sessionError,
    } = await supabase.auth.getUser();

    if (sessionError) {
      return {
        success: false,
        error: `No fue posible obtener la sesión: ${sessionError.message}`,
      };
    }

    if (!user) {
      return {
        success: false,
        error: "Debes iniciar sesión para guardar la tarjeta.",
      };
    }

    await createCard({
      fullName,
      email: profileRecord.email,
      phone: profileRecord.phone,
      company: profileRecord.company,
      position: profileRecord.position,
      codePhone: profileRecord.code_phone,
      userId: user.id,
      imageUrl: profileRecord.avatar_url,
    });

    return {
      success: true,
    };
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "No fue posible guardar la tarjeta.";

    return {
      success: false,
      error: message,
    };
  }
};

export const getUserInfo = async (
  userId: string
): Promise<ProfileRecord | null> => {
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