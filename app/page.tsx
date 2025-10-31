import { SaveContactButton } from "@/components/save-contact-button";
import { SupabaseServer } from "@/lib/supabase/server-client";
import { getCardById } from "./actions/cards";

type RawSearchParam = string | string[] | undefined;

const getStringParam = (value: RawSearchParam) => {
  if (!value) return "";
  return Array.isArray(value) ? value[0] ?? "" : value;
};

export default async function Home({
  searchParams,
}: {
  searchParams?: Promise<Record<string, RawSearchParam>>;
}) {
  const params = searchParams ? await searchParams : {};

  const supabase = await SupabaseServer();
  const { data: userData } = await supabase.auth.getUser();
  const isAuthenticated = Boolean(userData?.user);

  const id = getStringParam(params.id);
  const { card, error: cardError } = await getCardById(id);
  const hasCard = Boolean(card);
  const canSaveCard = isAuthenticated && hasCard;

  return (
    <main className="flex min-h-screen w-full items-start justify-center bg-[#f4f5f9] px-6 py-16 sm:px-8">
      <section className="w-full max-w-sm rounded-2xl border border-white bg-white p-6 shadow-lg">
        <h1 className="text-lg font-semibold text-zinc-900">Mi Card</h1>
        <p className="text-sm text-zinc-500">
          Información recibida desde la URL.
        </p>

        <div className="mt-6 space-y-6">
          <div className="flex flex-col rounded-2xl border border-zinc-200 bg-[#f9fafb] px-5 py-4 shadow-sm">
            <div>
              <span className="text-sm font-medium text-zinc-500">Nombre</span>
              <p className="text-base font-semibold text-zinc-900">
                {card?.full_name || (
                  <span className="text-zinc-400">No proporcionado</span>
                )}
              </p>
            </div>
            <div className="mt-3 grid gap-3 text-sm text-zinc-700">
              <p>
                <span className="font-medium text-zinc-500">Correo:&nbsp;</span>
                {card?.email || (
                  <span className="text-zinc-400">No proporcionado</span>
                )}
              </p>
              <p>
                <span className="font-medium text-zinc-500">
                  Teléfono:&nbsp;
                </span>
                {card?.phone || (
                  <span className="text-zinc-400">No proporcionado</span>
                )}
              </p>
              <p>
                <span className="font-medium text-zinc-500">
                  Empresa:&nbsp;
                </span>
                {card?.company || (
                  <span className="text-zinc-400">No proporcionado</span>
                )}
              </p>
            </div>
          </div>

          {!!cardError && (
            <p className="text-sm text-red-500">{cardError}</p>
          )}

          <SaveContactButton
            disabled={!canSaveCard}
            cardInput={
              card
                ? {
                    fullName: card.full_name ?? "",
                    email: card.email,
                    phone: card.phone,
                    company: card.company,
                    position: card.position,
                    userId: userData?.user?.id,
                    imageUrl: card.image_url,
                    codePhone: card.code_phone,
                    isArchive: card.is_archive,
                  }
                : undefined
            }
          />

          {!hasCard && !cardError && (
            <p className="text-sm text-zinc-500">
              No se encontró información para la tarjeta solicitada.
            </p>
          )}
        </div>
      </section>
    </main>
  );
}
