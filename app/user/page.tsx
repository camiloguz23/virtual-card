import { SupabaseServer } from "@/lib/supabase/server-client";
import { getUserInfo, saveCardFromProfile } from "../actions/profile";

type RawSearchParam = string | string[] | undefined;

const getStringParam = (value: RawSearchParam) => {
  if (!value) return "";
  return Array.isArray(value) ? value[0] ?? "" : value;
};

export default async function UserPage({
  searchParams,
}: {
  searchParams?: Promise<Record<string, RawSearchParam>>;
}) {
  const params = searchParams ? await searchParams : {};
  const id = getStringParam(params.id);
  const saved = getStringParam(params.saved);
  const errorMessage = getStringParam(params.error);

  const supabase = await SupabaseServer();
  const { data: userData } = await supabase.auth.getUser();
  const isAuthenticated = Boolean(userData?.user);
  const profile = await getUserInfo(id);

  const canSaveCard = Boolean(isAuthenticated && profile?.name?.trim());
  const helperMessage = !isAuthenticated
    ? "Debes iniciar sesión para guardar la tarjeta."
    : !profile
    ? "No hay datos de perfil disponibles para guardar."
    : "La tarjeta se guardará con la información mostrada.";

  return (
    <main className="flex min-h-screen w-full items-start justify-center bg-[#f4f5f9] px-6 py-16 sm:px-8">
      <section className="w-full max-w-2xl rounded-2xl border border-white bg-white p-6 shadow-lg">
        <div className="flex flex-col gap-1">
          <h1 className="text-lg font-semibold text-zinc-900">Administrar tarjeta</h1>
          <p className="text-sm text-zinc-500">
            Visualiza la información actual y crea o actualiza los datos de tu tarjeta digital.
          </p>
        </div>

        {saved === "1" && (
          <p className="mt-4 rounded-lg border border-green-200 bg-green-50 px-4 py-2 text-sm text-green-700">
            Tarjeta guardada correctamente.
          </p>
        )}

        {errorMessage && (
          <p className="mt-4 rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-600">
            {errorMessage}
          </p>
        )}

        <div className="mt-8 grid gap-8 lg:grid-cols-2">
          <div className="space-y-6">
            <div className="rounded-2xl border border-zinc-200 bg-[#f9fafb] px-5 py-4 shadow-sm">
              <div>
                <span className="text-sm font-medium text-zinc-500">Nombre</span>
                <p className="text-base font-semibold text-zinc-900">
                  {profile?.name || (
                    <span className="text-zinc-400">No proporcionado</span>
                  )}
                </p>
              </div>
              <div className="mt-3 grid gap-3 text-sm text-zinc-700">
                <p>
                  <span className="font-medium text-zinc-500">Correo:&nbsp;</span>
                  {profile?.email || (
                    <span className="text-zinc-400">No proporcionado</span>
                  )}
                </p>
                <p>
                  <span className="font-medium text-zinc-500">Teléfono:&nbsp;</span>
                  {profile?.phone || (
                    <span className="text-zinc-400">No proporcionado</span>
                  )}
                </p>
                <p>
                  <span className="font-medium text-zinc-500">Código telefónico:&nbsp;</span>
                  {profile?.code_phone || (
                    <span className="text-zinc-400">No proporcionado</span>
                  )}
                </p>
                <p>
                  <span className="font-medium text-zinc-500">Empresa:&nbsp;</span>
                  {profile?.company || (
                    <span className="text-zinc-400">No proporcionado</span>
                  )}
                </p>
                <p>
                  <span className="font-medium text-zinc-500">Cargo:&nbsp;</span>
                  {profile?.position || (
                    <span className="text-zinc-400">No proporcionado</span>
                  )}
                </p>
              </div>
            </div>
            {!profile && (
              <p className="text-sm text-zinc-500">
                No se encontró información de perfil para el usuario proporcionado.
              </p>
            )}
          </div>

          <div className="rounded-2xl border border-zinc-200 bg-white px-5 py-4 shadow-sm">
            <div className="space-y-2">
              <h2 className="text-base font-semibold text-zinc-900">Tarjeta digital</h2>
              <p className="text-sm text-zinc-500">
                Confirma los datos que se guardarán en tu tarjeta.
              </p>
            </div>

            <div className="mt-4 space-y-3 text-sm text-zinc-700">
              <p>
                <span className="font-medium text-zinc-500">Nombre completo:&nbsp;</span>
                {profile?.name || (
                  <span className="text-zinc-400">No proporcionado</span>
                )}
              </p>
              <p>
                <span className="font-medium text-zinc-500">Correo:&nbsp;</span>
                {profile?.email || (
                  <span className="text-zinc-400">No proporcionado</span>
                )}
              </p>
              <p>
                <span className="font-medium text-zinc-500">Teléfono:&nbsp;</span>
                {profile?.phone || (
                  <span className="text-zinc-400">No proporcionado</span>
                )}
              </p>
              <p>
                <span className="font-medium text-zinc-500">Empresa:&nbsp;</span>
                {profile?.company || (
                  <span className="text-zinc-400">No proporcionado</span>
                )}
              </p>
              <p>
                <span className="font-medium text-zinc-500">Cargo:&nbsp;</span>
                {profile?.position || (
                  <span className="text-zinc-400">No proporcionado</span>
                )}
              </p>
            </div>

            <form action={saveCardFromProfile} className="mt-6 space-y-3">
              {profile && (
                <input type="hidden" name="profile_id" value={profile.id} />
              )}
              {id && <input type="hidden" name="requested_id" value={id} />}
              <button
                type="submit"
                className={`w-full rounded-lg bg-zinc-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-zinc-400 focus:ring-offset-2 focus:ring-offset-white ${
                  !canSaveCard ? "cursor-not-allowed opacity-60" : ""
                }`}
                disabled={!canSaveCard}
              >
                Guardar tarjeta
              </button>
              <p className="text-xs text-zinc-500">{helperMessage}</p>
            </form>
          </div>
        </div>
      </section>
    </main>
  );
}
