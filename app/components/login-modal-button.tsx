"use client";

import { useRouter } from "next/navigation";
import { type FormEvent, useState } from "react";

import { loginWithPassword } from "@/app/actions/auth";
import { LocalStorage } from "@/lib/helpers/localstorage";
import { createCardArray, isCardRepeat } from "../actions/cards";
import type { CardInsert } from "@/lib/type/inert-card";

const cx = (...classes: Array<string | undefined | null | false>) =>
  classes.filter(Boolean).join(" ");

type LoginModalButtonProps = {
  label?: string;
  variant?: "primary" | "outline";
  className?: string;
};

const buttonVariants: Record<
  NonNullable<LoginModalButtonProps["variant"]>,
  string
> = {
  primary:
    "inline-flex items-center rounded-lg bg-zinc-900 px-4 py-2 text-xs font-semibold text-white transition hover:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-zinc-400 focus:ring-offset-2 focus:ring-offset-[#f4f5f9]",
  outline:
    "inline-flex items-center justify-center rounded-lg border border-zinc-300 px-4 py-2 text-xs font-semibold text-zinc-700 transition hover:bg-zinc-50 focus:outline-none focus:ring-2 focus:ring-zinc-300 focus:ring-offset-2 focus:ring-offset-white",
};

export function LoginModalButton({
  label = "Iniciar sesión",
  variant = "primary",
  className,
}: LoginModalButtonProps) {
  const router = useRouter();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setErrorMessage(null);
    setIsSubmitting(true);

    const result = await loginWithPassword({ email, password });

    if (!result.success) {
      setErrorMessage(result.error ?? "No fue posible iniciar sesión.");
      setIsSubmitting(false);
      return;
    }

    const localStotageList = LocalStorage.getItemArray("cards");
    if (localStotageList.length > 0) {
      const userId = result.success as string;
      const payload: CardInsert[] = [];

      for (const item of localStotageList) {
        if (!item.full_name) {
          continue;
        }

        const alreadySaved = await isCardRepeat({
          id: item.id,
          user_id: userId,
        });

        if (alreadySaved) {
          continue;
        }

        const { id: _ignoredId, created_at, updated_at, ...rest } = item;
        payload.push({ ...rest, user_id: userId });
      }

      console.log("validando repetir", payload);

      if (payload.length > 0) {
        console.log("creando tarjetas", payload);
        const response = await createCardArray(payload);

        if (response.length > 0) {
          console.log("tarjetas creadas", response);
          LocalStorage.removeItem("cards");
        }
      }
    }

    setIsModalOpen(false);
    setEmail("");
    setPassword("");
    setIsSubmitting(false);
    router.refresh();
  };

  return (
    <>
      <button
        type="button"
        className={cx(buttonVariants[variant], className)}
        onClick={() => setIsModalOpen(true)}
      >
        {label}
      </button>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-zinc-900">
                  Inicia sesión
                </h2>
                <p className="mt-1 text-sm text-zinc-500">
                  Ingresa tu correo y contraseña para continuar.
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  if (isSubmitting) return;
                  setIsModalOpen(false);
                  setErrorMessage(null);
                }}
                className="text-sm text-zinc-500 transition hover:text-zinc-700"
                aria-label="Cerrar"
              >
                ✕
              </button>
            </div>

            <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
              <div className="space-y-1">
                <label
                  className="text-sm font-medium text-zinc-600"
                  htmlFor="modal-login-email"
                >
                  Correo electrónico
                </label>
                <input
                  id="modal-login-email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-[#1f1f22] focus:outline-none focus:ring-2 focus:ring-[#1f1f22]"
                  placeholder="tu@correo.com"
                />
              </div>

              <div className="space-y-1">
                <label
                  className="text-sm font-medium text-zinc-600"
                  htmlFor="modal-login-password"
                >
                  Contraseña
                </label>
                <input
                  id="modal-login-password"
                  type="password"
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-[#1f1f22] focus:outline-none focus:ring-2 focus:ring-[#1f1f22]"
                  placeholder="••••••"
                />
              </div>

              {errorMessage && (
                <p className="text-sm text-red-500">{errorMessage}</p>
              )}

              <button
                type="submit"
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#1f1f22] px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-[#2a2a30] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#1f1f22]"
                disabled={isSubmitting}
              >
                {isSubmitting && (
                  <svg
                    className="h-4 w-4 animate-spin"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      d="M4 12a8 8 0 018-8"
                      stroke="currentColor"
                      strokeWidth="4"
                      strokeLinecap="round"
                    />
                  </svg>
                )}
                Iniciar sesión
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
