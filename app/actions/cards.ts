"use server";

import { SupabaseServer } from "@/lib/supabase/server-client";

export type CardRecord = {
  id: string;
  full_name: string;
  email: string | null;
  phone: string | null;
  company: string | null;
  position: string | null;
  user_id: string;
  image_url: string | null;
  code_phone: string | null;
  is_archive: boolean | null;
  created_at: string | null;
  updated_at: string | null;
};

export type CreateCardInput = {
  fullName: string;
  email?: string | null;
  phone?: string | null;
  company?: string | null;
  position?: string | null;
  userId?: string;
  imageUrl?: string | null;
  codePhone?: string | null;
  isArchive?: boolean | null;
};

const normalizeString = (value: string | null | undefined) => {
  if (!value) return null;
  const normalized = value.trim();
  return normalized.length > 0 ? normalized : null;
};

const resolveUserId = async (providedUserId: string | undefined) => {
  if (providedUserId) {
    return providedUserId;
  }

  const supabase = await SupabaseServer();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error) {
    throw new Error(
      `No fue posible obtener el usuario autenticado: ${error.message}`
    );
  }

  if (!user) {
    throw new Error("No hay una sesión vigente.");
  }

  return user.id;
};

export const createCard = async (
  input: CreateCardInput
): Promise<CardRecord> => {
  const fullName = normalizeString(input.fullName);

  if (!fullName) {
    throw new Error("El nombre completo es obligatorio.");
  }

  const userId = await resolveUserId(input.userId);

  const supabase = await SupabaseServer();

  const payload = {
    full_name: fullName,
    email: normalizeString(input.email ?? null),
    phone: normalizeString(input.phone ?? null),
    company: normalizeString(input.company ?? null),
    position: normalizeString(input.position ?? null),
    user_id: userId,
    image_url: normalizeString(input.imageUrl ?? null),
    code_phone: normalizeString(input.codePhone ?? null),
    is_archive: input.isArchive ?? false,
  };

  const { data, error } = await supabase
    .from("cards")
    .insert(payload)
    .select()
    .single<CardRecord>();

  if (error) {
    throw new Error(`No se pudo crear la tarjeta: ${error.message}`);
  }

  return data;
};

export type GetCardByIdResult = {
  card: CardRecord | null;
  error?: string;
};

export const getCardById = async (
  id: string | null | undefined
): Promise<GetCardByIdResult> => {
  const trimmedId = id?.trim();

  if (!trimmedId) {
    return {
      card: null,
      error: "No se proporcionó un ID de tarjeta.",
    };
  }

  try {
    const supabase = await SupabaseServer();

    const { data, error } = await supabase
      .from("cards")
      .select()
      .eq("id", trimmedId)
      .maybeSingle<CardRecord>();

    if (error) {
      return {
        card: null,
        error: `No fue posible obtener la tarjeta: ${error.message}`,
      };
    }

    if (!data) {
      return {
        card: null,
        error: "No se encontró una tarjeta con el ID proporcionado.",
      };
    }

    return { card: data };
  } catch (error) {
    return {
      card: null,
      error:
        error instanceof Error
          ? error.message
          : "Ocurrió un error al buscar la tarjeta.",
    };
  }
};

export type CreateCardFormState = {
  success: boolean;
  error?: string;
  data?: CardRecord;
};

const toNullableString = (value: FormDataEntryValue | null) => {
  if (typeof value !== "string") return null;
  return value.trim() || null;
};

const toBoolean = (value: FormDataEntryValue | null) => {
  if (typeof value !== "string") return false;
  return ["true", "on", "1", "yes"].includes(value.toLowerCase());
};

export const createCardFromForm = async (
  _prevState: CreateCardFormState | undefined,
  formData: FormData
): Promise<CreateCardFormState> => {
  try {
    const result = await createCard({
      fullName: formData.get("full_name")?.toString() ?? "",
      email: toNullableString(formData.get("email")),
      phone: toNullableString(formData.get("phone")),
      company: toNullableString(formData.get("company")),
      position: toNullableString(formData.get("position")),
      userId: toNullableString(formData.get("user_id")) ?? undefined,
      imageUrl: toNullableString(formData.get("image_url")),
      codePhone: toNullableString(formData.get("code_phone")),
      isArchive: toBoolean(formData.get("is_archive")),
    });

    return {
      success: true,
      data: result,
    };
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Error desconocido al crear la tarjeta.";

    return {
      success: false,
      error: message,
    };
  }
};
