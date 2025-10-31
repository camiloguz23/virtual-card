const getEnv = (name: string): string => {
  const value = process.env[name];

  if (!value) {
    throw new Error(`Missing ${name} environment variable`);
  }

  return value;
};

export const SUPABASE_URL = getEnv("NEXT_PUBLIC_SUPABASE_URL");
export const SUPABASE_ANON_KEY = getEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY");
