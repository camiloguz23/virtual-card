export type CardInsert = {
  id?: string;
  full_name: string;
  email?: string | null;
  phone?: string | null;
  company?: string | null;
  position?: string | null;
  user_id: string;
  image_url?: string | null;
  code_phone?: string | null;
  is_archive?: boolean | null;
  created_at?: string | null;
  updated_at?: string | null;
};
