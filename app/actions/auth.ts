"use server";

import { createClient } from "@/lib/supabase/server-client";

export type LoginWithPasswordInput = {
  email: string;
  password: string;
};

export type LoginWithPasswordResult = {
  success: boolean;
  error?: string;
};

const normalize = (value: string | undefined | null) => value?.trim() ?? "";

export const loginWithPassword = async (
  input: LoginWithPasswordInput,
): Promise<LoginWithPasswordResult> => {
  const email = normalize(input.email);
  const password = normalize(input.password);

  if (!email || !password) {
    return {
      success: false,
      error: "El correo y la contraseña son obligatorios.",
    };
  }

  const supabase = await createClient();

  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    return {
      success: false,
      error: error.message,
    };
  }

  return { success: true };
};
