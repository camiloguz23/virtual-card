import { SupabaseServer } from "@/lib/supabase/server-client";
import { getCardsByIds, type CardRecord } from "./actions/cards";
import { getUserInfo } from "./actions/profile";
import { CardsList } from "./components/cards-list";
import { LoginModalButton } from "./components/login-modal-button";
import { ViewCard } from "./components/view-card";

type RawSearchParam = string;

export default async function Home({
  searchParams,
}: {
  searchParams?: Promise<Record<string, RawSearchParam>>;
}) {
  const params = searchParams ? await searchParams : {};
  const supabase = await SupabaseServer();
  const { data: userData } = await supabase.auth.getUser();

  const { cards, error: cardsError } = params.id
    ? await getCardsByIds(params?.id ?? "")
    : { cards: null, error: undefined };

  const profile = params.userId ? await getUserInfo(params.userId) : null;

  return (
    <main className="min-h-screen w-full bg-[#f4f5f9] px-4 py-10 sm:px-6">
      <section className="mx-auto flex w-full max-w-2xl flex-col gap-6">
        <header className="flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
          <div className="text-left">
            <h1 className="text-xl font-semibold text-zinc-900">Mis Cards</h1>
            <p className="mt-1 text-sm text-zinc-500">
              Información compartida desde la URL.
            </p>
          </div>
          {userData.user?.id ? null : <LoginModalButton />}
        </header>
        {userData.user?.id ? (
          <ViewCard infoCard={cards} userId={userData.user?.id}/>
        ) : (
          <CardsList
            cards={params.userId ? profile : cards}
            layout="grid"
            showExampleBadge={!cards}
          />
        )}
      </section>
    </main>
  );
}
