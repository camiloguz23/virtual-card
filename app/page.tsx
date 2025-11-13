import { getCardsByIds, type CardRecord } from "./actions/cards";
import { CardsList } from "./components/cards-list";

type RawSearchParam = string;

const normalizeValues = (value: RawSearchParam): string[] => {
  if (!value) return [];

  const values = Array.isArray(value) ? value : [value];

  return values
    .flatMap((entry) => entry.split(","))
    .map((entry) => entry.trim())
    .filter((entry): entry is string => entry.length > 0);
};

export default async function Home({
  searchParams,
}: {
  searchParams?: Promise<Record<string, RawSearchParam>>;
}) {
  const params = searchParams ? await searchParams : {};

  const { cards, error: cardsError } = await getCardsByIds(params?.id ?? "");

  return (
    <main className="min-h-screen w-full bg-[#f4f5f9] px-4 py-10 sm:px-6">
      <section className="mx-auto flex w-full max-w-2xl flex-col gap-6">
        <header className="text-center sm:text-left">
          <h1 className="text-xl font-semibold text-zinc-900">Mis Cards</h1>
          <p className="mt-1 text-sm text-zinc-500">
            Información compartida desde la URL.
          </p>
        </header>
        <CardsList cards={cards} layout="grid" showExampleBadge={!cards} />
      </section>
    </main>
  );
}
