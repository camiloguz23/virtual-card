"use client";

import {
  createCardSimple,
  isCardRepeat,
  type CardRecord,
} from "../actions/cards";
import { useCallback, useState } from "react";

type ViewCardProps = {
  infoCard?: CardRecord | null;
  userId: string;
  className?: string;
};

const cx = (...classes: Array<string | undefined | null | false>) =>
  classes.filter(Boolean).join(" ");

const sanitizeText = (value: string | null | undefined) =>
  value?.replace(/\n|\r/g, " ").trim() ?? "";

const safeValue = (value: string | null | undefined, fallback = "-") => {
  const trimmed = sanitizeText(value);
  return trimmed && trimmed.length > 0 ? trimmed : fallback;
};

const getInitials = (value: string | null | undefined) => {
  const safeName = sanitizeText(value);
  if (!safeName) return "?";
  const [first = "", second = ""] = safeName.split(" ");
  return `${first.charAt(0)}${second.charAt(0)}`.toUpperCase() || "?";
};

const composeNameParts = (fullName: string | null | undefined) => {
  const safeName = sanitizeText(fullName);
  if (!safeName) return ["", "", "", "", ""];

  const segments = safeName.split(" ");
  const firstName = segments[0] ?? "";
  const lastName = segments.slice(1).join(" ");
  return [lastName, firstName, "", "", ""];
};

export function ViewCard({ infoCard, userId, className }: ViewCardProps) {
  const avatarSrc = infoCard?.image_url?.trim() || "/default-avatar.svg";
  const hasCustomAvatar = Boolean(infoCard?.image_url?.trim());
  const [saveFeedback, setSaveFeedback] = useState<{
    message: string;
    variant: "success" | "error";
  } | null>(null);

  const generateVCard = useCallback(() => {
    if (!infoCard) return null;

    const safeName = sanitizeText(infoCard.full_name) || "Contacto";
    const nameParts = composeNameParts(infoCard.full_name).join(";");

    const lines = [
      "BEGIN:VCARD",
      "VERSION:3.0",
      `FN:${safeName}`,
      `N:${nameParts}`,
      infoCard.email
        ? `EMAIL;TYPE=INTERNET:${sanitizeText(infoCard.email)}`
        : null,
      infoCard.phone ? `TEL;TYPE=CELL:${sanitizeText(infoCard.phone)}` : null,
      infoCard.company ? `ORG:${sanitizeText(infoCard.company)}` : null,
      infoCard.position ? `TITLE:${sanitizeText(infoCard.position)}` : null,
      "END:VCARD",
    ].filter(Boolean) as string[];

    return lines.join("\n");
  }, [infoCard]);

  const downloadVCard = useCallback(() => {
    if (!infoCard) return;

    const vcardContent = generateVCard();
    if (!vcardContent) return;

    const isBrowser = typeof window !== "undefined";
    if (!isBrowser) return;

    const blob = new Blob([vcardContent], {
      type: "text/vcard;charset=utf-8",
    });
    const url = window.URL.createObjectURL(blob);
    const anchor = document.createElement("a");

    const safeName = infoCard.full_name?.trim() || "contacto";
    const fileName = `${safeName
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")}.vcf`;

    anchor.href = url;
    anchor.download = fileName;
    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);
    window.URL.revokeObjectURL(url);
  }, [generateVCard, infoCard]);

  const onSaveCard = async () => {
    if (!infoCard?.full_name) return;
    setSaveFeedback(null);
    const isRepeatCard = await isCardRepeat({
      id: infoCard.id,
      user_id: userId,
    });
    if (isRepeatCard) {

      setSaveFeedback({ message: "Guardado exitoso", variant: "success" });
      return;
    }
    try {
      await createCardSimple({
        full_name: infoCard.full_name,
        email: infoCard.email,
        phone: infoCard.phone,
        company: infoCard.company,
        position: infoCard.position,
        user_id: infoCard.user_id,
        image_url: infoCard.image_url,
        code_phone: infoCard.code_phone,
        is_archive: infoCard.is_archive,
      });
      setSaveFeedback({ message: "Guardado exitoso", variant: "success" });
    } catch (error) {
      setSaveFeedback({
        message:
          error instanceof Error
            ? error.message
            : "No se pudo guardar la tarjeta.",
        variant: "error",
      });
    }
  };

  return (
    <div
      className={cx(
        "w-full max-w-2xl rounded-[32px] border border-zinc-200 bg-white p-6 text-zinc-900 shadow-sm sm:p-8",
        className
      )}
    >
      <div className="flex flex-col gap-6">
        <div className="flex items-center gap-4">
          <div className="relative h-20 w-20 overflow-hidden rounded-2xl border border-zinc-200 bg-zinc-50">
            {hasCustomAvatar ? (
              <img
                src={avatarSrc}
                alt={infoCard?.full_name ?? "Avatar"}
                className="h-full w-full object-cover"
                loading="lazy"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-2xl font-semibold uppercase text-zinc-400">
                {getInitials(infoCard?.full_name)}
              </div>
            )}
            <span className="absolute inset-x-0 bottom-0 bg-white/80 py-1 text-center text-[10px] font-medium uppercase tracking-widest text-zinc-500">
              Contacto
            </span>
          </div>
          <div>
            <p className="text-sm font-medium uppercase tracking-[0.2em] text-zinc-400">
              {safeValue(infoCard?.company, "Organización")}
            </p>
            <h1 className="mt-2 text-2xl font-semibold text-zinc-900">
              {safeValue(infoCard?.full_name, "Nombre no disponible")}
            </h1>
            <p className="text-sm text-zinc-500">
              {safeValue(infoCard?.position, "Cargo no especificado")}
            </p>
          </div>
        </div>

        <div className="rounded-3xl border border-zinc-100 bg-zinc-50/60 p-5">
          <div className="grid grid-cols-1 gap-4 text-sm text-zinc-600">
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-zinc-400">
                Correo
              </p>
              <p className="mt-1 break-all text-base text-zinc-900">
                {safeValue(infoCard?.email, "Sin correo")}
              </p>
            </div>
            <div className="grid gap-1">
              <p className="text-xs font-semibold uppercase tracking-widest text-zinc-400">
                Teléfono
              </p>
              <div className="flex flex-wrap items-baseline gap-2">
                <span className="text-sm text-zinc-500">
                  {safeValue(infoCard?.code_phone, "+57")}
                </span>
                <span className="text-base font-semibold text-zinc-900">
                  {safeValue(infoCard?.phone, "Sin teléfono")}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={downloadVCard}
            disabled={!infoCard}
            className="flex-1 rounded-2xl bg-zinc-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-zinc-800 disabled:cursor-not-allowed disabled:bg-zinc-300"
          >
            Guardar VCard
          </button>
          <button
            onClick={onSaveCard}
            type="button"
            className="flex-1 rounded-2xl border border-zinc-200 px-4 py-3 text-sm font-semibold text-zinc-700 transition hover:bg-zinc-50"
          >
            Guardar
          </button>
        </div>
        {saveFeedback && (
          <div
            className={cx(
              "mt-4 rounded-3xl border px-5 py-4 text-base font-semibold",
              saveFeedback.variant === "success"
                ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                : "border-red-200 bg-red-50 text-red-600"
            )}
            role="status"
            aria-live="polite"
          >
            {saveFeedback.message}
          </div>
        )}
      </div>
    </div>
  );
}
