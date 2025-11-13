import { SupabaseServer } from "@/lib/supabase/server-client";
import { CardsList } from "@/app/components/cards-list";
import { getCardsByUserId, type CardRecord } from "../actions/cards";
import { getUserInfo } from "../actions/profile";
import { SaveCardForm } from "./components/save-card-form";


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
  const userId = userData?.user?.id ?? null;
  const isAuthenticated = Boolean(userId);
  const profile = await getUserInfo(id);
  const avatarUrl = profile?.avatar_url?.trim() || undefined;
  const displayedAvatarSrc = avatarUrl ?? "/default-avatar.svg";
  const { cards: existingCards, error: cardsError } = userId
    ? await getCardsByUserId(userId)
    : { cards: [], error: undefined };
  const hasCards = existingCards.length > 0;
  const mockCards: CardRecord[] = [
    {
      id: "mock-1",
      full_name: "Sofía Hernández",
      email: "sofia.hernandez@devontic.com",
      phone: "+57 301 555 4444",
      company: "Devontic",
      position: "Product Manager",
      user_id: "mock-user",
      image_url: null,
      code_phone: "+57",
      is_archive: false,
      created_at: null,
      updated_at: null,
    },
    {
      id: "mock-2",
      full_name: "Carlos Mendoza",
      email: "carlos.mendoza@ejemplo.com",
      phone: "+57 315 123 4567",
      company: "Ejemplo S.A.",
      position: "Director Comercial",
      user_id: "mock-user",
      image_url: null,
      code_phone: "+57",
      is_archive: false,
      created_at: null,
      updated_at: null,
    },
  ];

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
              <div className="flex items-center gap-4">
                <div className="flex h-16 w-16 items-center justify-center overflow-hidden rounded-full border border-zinc-200 bg-zinc-100">
                  <img
                    src={displayedAvatarSrc}
                    alt={profile?.name ?? "Usuario sin nombre"}
                    className="h-full w-full object-cover"
                    loading="lazy"
                  />
                </div>
                <div>
                  <span className="text-sm font-medium text-zinc-500">Nombre</span>
                  <p className="text-base font-semibold text-zinc-900">
                    {profile?.name || (
                      <span className="text-zinc-400">No proporcionado</span>
                    )}
                  </p>
                </div>
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

            <div className="rounded-2xl border border-zinc-200 bg-[#f9fafb] px-5 py-4 shadow-sm">
              <div className="space-y-1">
                <h2 className="text-sm font-semibold text-zinc-900">Tus tarjetas guardadas</h2>
                <p className="text-xs text-zinc-500">
                  Consulta las tarjetas que has ido registrando.
                </p>
              </div>

              <div className="mt-4 space-y-6">
                {cardsError ? (
                  <p className="text-sm text-red-500">{cardsError}</p>
                ) : (
                  <>
                    {!isAuthenticated ? (
                      <p className="text-sm text-zinc-500">
                        Debes iniciar sesión para ver tus tarjetas guardadas. Abajo tienes un ejemplo de cómo se mostrarán.
                      </p>
                    ) : hasCards ? (
                      <div className="space-y-3">
                        <p className="text-sm font-medium text-zinc-600">
                          Tus tarjetas registradas
                        </p>
                        <CardsList cards={existingCards} layout="stack" />
                      </div>
                    ) : (
                      <p className="text-sm text-zinc-500">
                        Aún no has guardado tarjetas. Usa el formulario para crear una y mira el ejemplo más abajo.
                      </p>
                    )}

                    <div className="space-y-3">
                      <p className="text-sm font-medium text-zinc-600">Vista de ejemplo</p>
                      <CardsList
                        cards={mockCards}
                        layout="stack"
                        showExampleBadge
                      />
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>

          <SaveCardForm
            profile={profile}
            requestedId={id || null}
            isAuthenticated={isAuthenticated}
          />
        </div>
      </section>
    </main>
  );
}
