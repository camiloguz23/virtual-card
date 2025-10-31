"use client";

import {
  type ButtonHTMLAttributes,
  type FormEvent,
  type MouseEvent,
  useState,
} from "react";
import { useRouter } from "next/navigation";

import { loginWithPassword } from "@/app/actions/auth";
import { createCard, type CreateCardInput } from "@/app/actions/cards";



type SaveContactButtonProps = Omit<
  ButtonHTMLAttributes<HTMLButtonElement>,
  "onClick"
> & {
  loading?: boolean;
  cardInput?: CreateCardInput | null;
};

const cx = (...classes: Array<string | false | null | undefined>): string =>
  classes.filter(Boolean).join(" ");

const SaveContactButton = ({
  className,
  disabled,
  loading = false,
  children = "Guardar contacto",
  cardInput,
  ...rest
}: SaveContactButtonProps) => {
  const requiresLogin = Boolean(disabled);
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoginPending, setIsLoginPending] = useState(false);
  const [isSavePending, setIsSavePending] = useState(false);

  const busy = loading || isLoginPending || isSavePending;

  const isDisabled = requiresLogin || isSavePending || loading;

  const handleButtonClick = async (event: MouseEvent<HTMLButtonElement>) => {
    setSaveError(null);
    setSuccessMessage(null);

    if (requiresLogin) {
      event.preventDefault();
      setIsModalOpen(true);
      return;
    }

    if (!cardInput) {
      setSaveError("No hay datos del contacto para guardar.");
      return;
    }

    setIsSavePending(true);
    try {
      await createCard(cardInput);
      setSuccessMessage("Contacto guardado correctamente.");
      router.refresh();
    } catch (error) {
      setSaveError(
        error instanceof Error
          ? error.message
          : "No fue posible guardar el contacto."
      );
    } finally {
      setIsSavePending(false);
    }
  };

  const handleCloseModal = () => {
    if (isLoginPending) return;
    setIsModalOpen(false);
    setLoginError(null);
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoginError(null);

    setIsLoginPending(true);

    loginWithPassword({ email, password })
      .then((result) => {
        if (!result.success) {
          setLoginError(result.error ?? "No fue posible iniciar sesión.");
          return;
        }

        setIsModalOpen(false);
        setEmail("");
        setPassword("");
        setLoginError(null);
        router.refresh();
      })
      .catch((error) => {
        setLoginError(
          error instanceof Error
            ? error.message
            : "No fue posible iniciar sesión."
        );
      })
      .finally(() => {
        setIsLoginPending(false);
      });
  };

  return (
    <>
      <button
        type="button"
        className={cx(
          "flex w-full items-center justify-center gap-2 rounded-xl bg-[#1f1f22] px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-[#2a2a30] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#1f1f22]",
          isDisabled &&
            "cursor-not-allowed opacity-60 hover:bg-[#1f1f22] focus:ring-0 focus:ring-offset-0",
          className
        )}
        aria-disabled={isDisabled}
        disabled={busy}
        onClick={handleButtonClick}
        {...rest}
      >
        {(loading || isSavePending) && (
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
        {children}
      </button>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
          <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-zinc-900">
                Inicia sesión
              </h2>
              <button
                type="button"
                onClick={handleCloseModal}
                className="text-sm text-zinc-500 hover:text-zinc-700"
              >
                Cerrar
              </button>
            </div>

            <p className="mt-1 text-sm text-zinc-500">
              Ingresa tu correo y contraseña para guardar el contacto.
            </p>

            <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
              <div className="space-y-1">
                <label
                  className="text-sm font-medium text-zinc-600"
                  htmlFor="login-email"
                >
                  Correo electrónico
                </label>
                <input
                  id="login-email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm focus:border-[#1f1f22] focus:outline-none focus:ring-2 focus:ring-[#1f1f22]"
                  placeholder="tu@correo.com"
                />
              </div>

              <div className="space-y-1">
                <label
                  className="text-sm font-medium text-zinc-600"
                  htmlFor="login-password"
                >
                  Contraseña
                </label>
                <input
                  id="login-password"
                  type="password"
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm focus:border-[#1f1f22] focus:outline-none focus:ring-2 focus:ring-[#1f1f22]"
                  placeholder="••••••"
                />
              </div>

              {loginError && (
                <p className="text-sm text-red-500">{loginError}</p>
              )}

              <button
                type="submit"
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#1f1f22] px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-[#2a2a30] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#1f1f22]"
                disabled={isLoginPending}
              >
                {isLoginPending && (
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

      {(saveError || successMessage) && (
        <p
          className={cx(
            "mt-3 text-sm",
            saveError ? "text-red-500" : "text-emerald-600"
          )}
        >
          {saveError ?? successMessage}
        </p>
      )}
    </>
  );
};

export { SaveContactButton };
