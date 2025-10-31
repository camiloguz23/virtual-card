import { createBrowserClient } from "@supabase/ssr";

export function SupabaseClient() {
  // Create a supabase client on the browser with project's credentials
  return createBrowserClient(
    "https://ixcvgcftjktnwphykvtb.supabase.co",
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml4Y3ZnY2Z0amt0bndwaHlrdnRiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE3NDM1NjQsImV4cCI6MjA3NzMxOTU2NH0.VFp47sVMrEAEYI17FzSh2O8TJgVtxLJHKkN4E0-vOJ8"
  );
}
