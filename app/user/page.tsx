import { FormUser } from "./components/form-user";
import { getCardById } from "../actions/cards";
import { SupabaseServer } from "@/lib/supabase/server-client";
import { getUserInfo } from "../actions/profile";

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

  const supabase = await SupabaseServer();
  const { data: userData } = await supabase.auth.getUser();
  const isAuthenticated = Boolean(userData?.user);
  const profile= await getUserInfo(id);
  const hasCard = Boolean(profile);

  const formInitialValues = {
    fullName: profile?.name ?? "",
    email: profile?.email ?? "",
    phone: "",
    company: "",
  };

  return (
    <main className="flex min-h-screen w-full items-start justify-center bg-[#f4f5f9] px-6 py-16 sm:px-8">
      <section className="w-full max-w-2xl rounded-2xl border border-white bg-white p-6 shadow-lg">
        <div className="flex flex-col gap-1">
          <h1 className="text-lg font-semibold text-zinc-900">Administrar tarjeta</h1>
          <p className="text-sm text-zinc-500">
            Visualiza la información actual y crea o actualiza los datos de tu tarjeta digital.
          </p>
        </div>

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
                {/* <p>
                  <span className="font-medium text-zinc-500">Teléfono:&nbsp;</span>
                  {profile?.phone || (
                    <span className="text-zinc-400">No proporcionado</span>
                  )}
                </p>
                <p>
                  <span className="font-medium text-zinc-500">Empresa:&nbsp;</span>
                  {profile?.avatar_url || (
                    <span className="text-zinc-400">No proporcionado</span>
                  )}
                </p> */}
              </div>
            </div>

            {!hasCard && (
              <p className="text-sm text-zinc-500">
                No se encontró información para la tarjeta solicitada. Completa el formulario y guarda tu tarjeta para visualizarla aquí.
              </p>
            )}
          </div>

          <FormUser
            isAuthenticated={isAuthenticated}
            initialValues={formInitialValues}
            hasExistingCard={hasCard}
            targetUserId={userData?.user?.id ?? null}
            requestedId={id || null}
          />
        </div>
      </section>
    </main>
  );
}
