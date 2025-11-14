"use client";

import type { CardRecord } from "@/app/actions/cards";
import { LocalStorage } from "@/lib/helpers/localstorage";
import { useCallback, useEffect, useState } from "react";

type CardsListProps = {
  cards: CardRecord | null;
  layout?: "grid" | "stack";
  showExampleBadge?: boolean;
  exampleBadgeLabel?: string;
  className?: string;
};

const MAX_CARDS = 4;

const listBaseClasses: Record<Required<CardsListProps>["layout"], string> = {
  grid: "grid gap-4 sm:gap-5",
  stack: "space-y-3",
};

export function CardsList({
  cards,
  layout = "grid",
  showExampleBadge = false,
  exampleBadgeLabel = "Ejemplo",
  className = "",
}: CardsListProps) {
  const [cardsList, setCardsList] = useState<CardRecord[]>([]);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const listClasses = `${listBaseClasses[layout]} ${className}`.trim();

  const getInfoCards = () => {
    const storedCards = LocalStorage.getItemArray("cards");

    if (!cards) {
      setCardsList(storedCards.slice(0, MAX_CARDS));
      return;
    }

    const alreadyStored = storedCards.some((item) => item.id === cards.id);
    if (alreadyStored) {
      setCardsList(storedCards.slice(0, MAX_CARDS));
      return;
    }

    if (storedCards.length >= MAX_CARDS) {
      setHasReachedLimit(true);
      setCardsList(storedCards.slice(0, MAX_CARDS));
      return;
    }

    const nextCards = [cards, ...storedCards];

    LocalStorage.setItemArray("cards", nextCards);

    setCardsList(nextCards);
  };

  const [hasReachedLimit, setHasReachedLimit] = useState(false);

  useEffect(() => {
    setHasReachedLimit(false);
    getInfoCards();
  }, [cards]);

  const sanitizeValue = useCallback((value: string | null | undefined) => {
    if (!value) return "";
    return value.replace(/\n|\r/g, " ").trim();
  }, []);

  const composeFullName = useCallback(
    (fullName: string | null | undefined) => {
      const safeName = sanitizeValue(fullName);
      if (!safeName) return { fn: "", parts: ["", "", "", "", ""] };

      const segments = safeName.split(" ");
      const firstName = segments[0] ?? "";
      const lastName = segments.slice(1).join(" ");
      return {
        fn: safeName,
        parts: [lastName, firstName, "", "", ""],
      };
    },
    [sanitizeValue]
  );

  const generateVCard = useCallback(
    (card: CardRecord) => {
      const nameInfo = composeFullName(card.full_name);
      const email = sanitizeValue(card.email);
      const phone = sanitizeValue(card.phone);
      const company = sanitizeValue(card.company);
      const position = sanitizeValue(card.position);

      const lines = [
        "BEGIN:VCARD",
        "VERSION:3.0",
        `FN:${nameInfo.fn}`,
        `N:${nameInfo.parts.join(";")}`,
        email ? `EMAIL;TYPE=INTERNET:${email}` : null,
        phone ? `TEL;TYPE=CELL:${phone}` : null,
        company ? `ORG:${company}` : null,
        position ? `TITLE:${position}` : null,
        "END:VCARD",
      ].filter(Boolean) as string[];

      return lines.join("\n");
    },
    [composeFullName, sanitizeValue]
  );

  const downloadVCard = useCallback(
    (card: CardRecord) => {
      const isBrowser = typeof window !== "undefined";
      if (!isBrowser) return;

      const vcardContent = generateVCard(card);
      const blob = new Blob([vcardContent], {
        type: "text/vcard;charset=utf-8",
      });
      const url = window.URL.createObjectURL(blob);
      const anchor = document.createElement("a");

      const safeName = sanitizeValue(card.full_name) || "contacto";
      const fileName = `${safeName
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")}.vcf`;

      anchor.href = url;
      anchor.download = fileName;
      document.body.appendChild(anchor);
      anchor.click();
      document.body.removeChild(anchor);
      window.URL.revokeObjectURL(url);
    },
    [generateVCard, sanitizeValue]
  );

  return (
    <>
      <ul className={listClasses}>
        {cardsList.map((card) => {
          const avatarUrl = card.image_url?.trim() || undefined;
          const displayedAvatarSrc = avatarUrl ?? "/default-avatar.svg";

          return (
            <li
              key={card.id}
              className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm transition hover:border-zinc-300 hover:shadow-md"
            >
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:gap-5">
                <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-full border border-zinc-200 bg-zinc-100">
                  <img
                    src={displayedAvatarSrc}
                    alt={card.full_name ?? "Contacto sin nombre"}
                    className="h-full w-full object-cover"
                    loading="lazy"
                  />
                </div>
                <div className="flex-1 space-y-2 text-sm text-zinc-600">
                  <div>
                    <span className="text-xs font-medium uppercase tracking-wide text-zinc-400">
                      Nombre
                    </span>
                    <p className="text-base font-semibold text-zinc-900">
                      {card.full_name || (
                        <span className="text-zinc-400">No proporcionado</span>
                      )}
                    </p>
                  </div>
                  <div className="grid gap-2 sm:grid-cols-2 sm:gap-3">
                    <p>
                      <span className="font-medium text-zinc-500">
                        Correo:&nbsp;
                      </span>
                      {card.email || (
                        <span className="text-zinc-400">No proporcionado</span>
                      )}
                    </p>
                    <p>
                      <span className="font-medium text-zinc-500">
                        Teléfono:&nbsp;
                      </span>
                      {card.phone || (
                        <span className="text-zinc-400">No proporcionado</span>
                      )}
                    </p>
                    <p>
                      <span className="font-medium text-zinc-500">
                        Empresa:&nbsp;
                      </span>
                      {card.company || (
                        <span className="text-zinc-400">No proporcionado</span>
                      )}
                    </p>
                    <p>
                      <span className="font-medium text-zinc-500">
                        Cargo:&nbsp;
                      </span>
                      {card.position || (
                        <span className="text-zinc-400">No proporcionado</span>
                      )}
                    </p>
                  </div>
                  <div className="pt-3">
                    <button
                      type="button"
                      onClick={() => downloadVCard(card)}
                      className="inline-flex items-center rounded-lg bg-zinc-900 px-4 py-2 text-xs font-semibold text-white transition hover:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-zinc-400 focus:ring-offset-2 focus:ring-offset-white"
                    >
                      Guardar vCard
                    </button>
                  </div>
                </div>
              </div>
            </li>
          );
        })}
      </ul>
      {hasReachedLimit && (
        <div className="fixed inset-x-0 bottom-0 z-50 flex items-center justify-center px-4 pb-4 sm:pb-6">
          <div className="max-w-xl w-full rounded-2xl bg-zinc-900/95 px-4 py-3 shadow-lg ring-1 ring-zinc-800 sm:flex sm:items-center sm:justify-between sm:gap-4 sm:px-6 sm:py-4">
            <p className="text-xs font-medium text-white sm:text-sm">
              Has alcanzado el límite de{" "}
              <span className="font-bold">{MAX_CARDS} cards guardadas</span> en
              este dispositivo.
              <br className="hidden sm:block" />
              Instala la app para tener{" "}
              <span className="font-bold">acceso ilimitado</span> al guardado de
              tus cards.
            </p>
            <button
              type="button"
              onClick={() => setIsAuthModalOpen(true)}
              className="mt-3 inline-flex items-center rounded-lg bg-white px-4 py-2 text-xs font-semibold text-zinc-900 shadow-sm transition hover:bg-zinc-100 focus:outline-none focus:ring-2 focus:ring-zinc-300 focus:ring-offset-2 focus:ring-offset-zinc-900 sm:mt-0"
            >
              Regístrate
            </button>
          </div>
        </div>
      )}
      {isAuthModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-base font-semibold text-zinc-900 sm:text-lg">
                  Crea tu cuenta y guarda más cards
                </h2>
                <p className="mt-2 text-xs text-zinc-600 sm:text-sm">
                  Regístrate o inicia sesión para desbloquear el guardado
                  ilimitado de tus cards y acceder a todas tus tarjetas desde
                  cualquier lugar.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsAuthModalOpen(false)}
                className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-zinc-100 text-xs font-semibold text-zinc-500 transition hover:bg-zinc-200 hover:text-zinc-700"
                aria-label="Cerrar"
              >
                ✕
              </button>
            </div>
            <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-end">
              <a
                href="/login"
                className="inline-flex items-center justify-center rounded-lg border border-zinc-300 px-4 py-2 text-xs font-semibold text-zinc-700 transition hover:bg-zinc-50 focus:outline-none focus:ring-2 focus:ring-zinc-300 focus:ring-offset-2 focus:ring-offset-white"
              >
                Iniciar sesión
              </a>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
