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

const sanitizeValue = (value: string | null | undefined) => {
  if (!value) return "";
  return value.replace(/\n|\r/g, " ").trim();
};

const safeValue = (value: string | null | undefined, fallback = "-") => {
  const trimmed = sanitizeValue(value);
  return trimmed && trimmed.length > 0 ? trimmed : fallback;
};

const getInitials = (value: string | null | undefined) => {
  const safeName = sanitizeValue(value);
  if (!safeName) return "?";
  const [first = "", second = ""] = safeName.split(" ");
  return `${first.charAt(0)}${second.charAt(0)}`.toUpperCase() || "?";
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

  const composeFullName = useCallback((fullName: string | null | undefined) => {
    const safeName = sanitizeValue(fullName);
    if (!safeName) return { fn: "", parts: ["", "", "", "", ""] };

    const segments = safeName.split(" ");
    const firstName = segments[0] ?? "";
    const lastName = segments.slice(1).join(" ");
    return {
      fn: safeName,
      parts: [lastName, firstName, "", "", ""],
    };
  }, []);

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
    [composeFullName]
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
    [generateVCard]
  );

  return (
    <>
      <ul className={listClasses}>
        {cardsList.map((card) => {
          const avatarUrl = card.image_url?.trim() || "";
          const hasCustomAvatar = Boolean(avatarUrl);
          const displayedAvatarSrc = avatarUrl || "/default-avatar.svg";

          return (
            <li
              key={card.id}
              className="rounded-[28px] border border-zinc-200 bg-white p-4 text-zinc-900 shadow-sm transition hover:border-zinc-300 hover:shadow-md sm:p-5"
            >
              <div className="flex flex-col gap-5">
                <div className="flex flex-wrap items-start gap-3">
                  <div className="flex flex-1 items-center gap-3">
                    <div className="flex h-16 w-28 items-center justify-center rounded-2xl border border-zinc-200 bg-zinc-50 sm:h-18 sm:w-32">
                      {hasCustomAvatar ? (
                        <img
                          src={displayedAvatarSrc}
                          alt={card.full_name ?? "Contacto sin nombre"}
                          className="max-h-full max-w-full object-contain"
                          loading="lazy"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-2xl font-semibold uppercase text-zinc-400">
                          {getInitials(card.full_name)}
                        </div>
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-zinc-400">
                        {safeValue(card.company, "Organización")}
                      </p>
                      <h3 className="mt-1 text-xl font-semibold text-zinc-900">
                        {safeValue(card.full_name, "Nombre no disponible")}
                      </h3>
                      <p className="text-xs text-zinc-500">
                        {safeValue(card.position, "Cargo no especificado")}
                      </p>
                    </div>
                  </div>
                  {showExampleBadge && (
                    <span className="inline-flex items-center rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-amber-700">
                      {exampleBadgeLabel}
                    </span>
                  )}
                </div>

                <div className="rounded-2xl border border-zinc-100 bg-zinc-50/60 p-4">
                  <div className="grid grid-cols-1 gap-3 text-xs text-zinc-600">
                    <div>
                      <p className="text-[10px] font-semibold uppercase tracking-[0.4em] text-zinc-400">
                        Correo
                      </p>
                      <p className="mt-1 break-all text-sm font-medium text-zinc-900">
                        {safeValue(card.email, "Sin correo")}
                      </p>
                    </div>
                    <div className="grid gap-1">
                      <p className="text-[10px] font-semibold uppercase tracking-[0.4em] text-zinc-400">
                        Teléfono
                      </p>
                      <div className="flex flex-wrap items-baseline gap-1.5">
                        <span className="text-xs text-zinc-500">
                          {safeValue(card.code_phone, "+57")}
                        </span>
                        <span className="text-sm font-semibold text-zinc-900">
                          {safeValue(card.phone, "Sin teléfono")}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2.5">
                  <button
                    type="button"
                    onClick={() => downloadVCard(card)}
                    className="flex-1 rounded-2xl bg-zinc-900 px-3.5 py-2.5 text-xs font-semibold text-white transition hover:bg-zinc-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-zinc-300 focus-visible:ring-offset-2 focus-visible:ring-offset-white"
                  >
                    Guardar VCard
                  </button>
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
              Regístrate en la app para seguir guardando y, si aún no la tienes,
              descárgala para disfrutar de acceso ilimitado a tus cards.
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
                  Regístrate en la app para seguir guardando sin límite y, si
                  aún no la tienes instalada, descárgala para acceder a todas
                  tus tarjetas desde cualquier lugar.
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
             
              <button
                type="button"
                onClick={() => setIsAuthModalOpen(false)}
                className="inline-flex items-center justify-center rounded-lg bg-zinc-900 px-4 py-2 text-xs font-semibold text-white transition hover:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-zinc-500 focus:ring-offset-2 focus:ring-offset-white"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
