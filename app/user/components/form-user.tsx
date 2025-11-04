"use client";

import { useEffect, useMemo, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";

import { createCard } from "@/app/actions/cards";

type FormUserProps = {
  isAuthenticated: boolean;
  initialValues: {
    fullName: string;
    email: string;
    phone: string;
    company: string;
  };
  hasExistingCard: boolean;
  targetUserId: string | null;
  requestedId: string | null;
};

const disableClass = "opacity-60 cursor-not-allowed";

export function FormUser({
  isAuthenticated,
  initialValues,
  hasExistingCard,
  targetUserId,
  requestedId,
}: FormUserProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [fullName, setFullName] = useState(initialValues.fullName);
  const [email, setEmail] = useState(initialValues.email);
  const [phone, setPhone] = useState(initialValues.phone);
  const [company, setCompany] = useState(initialValues.company);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const isDisabled = !isAuthenticated || isSubmitting;

  useEffect(() => {
    setFullName(initialValues.fullName);
    setEmail(initialValues.email);
    setPhone(initialValues.phone);
    setCompany(initialValues.company);
  }, [initialValues]);

  const disabledMessage = useMemo(() => {
    if (!isAuthenticated) {
      return "Debes iniciar sesión para completar y guardar la tarjeta.";
    }
    if (isSubmitting) {
      return "Guardando tarjeta...";
    }
    return null;
  }, [isAuthenticated, isSubmitting]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setSuccess(null);

    if (!isAuthenticated) {
      setError("Inicia sesión para guardar la tarjeta.");
      return;
    }

    const payload = {
      fullName,
      email: email || null,
      phone: phone || null,
      company: company || null,
      userId: targetUserId ?? undefined,
    };

    setIsSubmitting(true);

    try {
      await createCard(payload);
      setSuccess("Tarjeta guardada correctamente.");
      router.refresh();
    } catch (submissionError) {
      const message =
        submissionError instanceof Error
          ? submissionError.message
          : "No fue posible guardar la tarjeta.";
      setError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const canSubmit = isAuthenticated && !isSubmitting && fullName.trim().length > 0;

  return (
    <form
      className="flex flex-col gap-5 rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm"
      onSubmit={handleSubmit}
    >
      <header className="space-y-1">
        <h2 className="text-base font-semibold text-zinc-900">
          {hasExistingCard ? "Actualizar tarjeta" : "Crear tarjeta"}
        </h2>
        <p className="text-sm text-zinc-500">
          Completa los campos para {hasExistingCard ? "actualizar" : "crear"} tu tarjeta
          digital.
        </p>
        {requestedId && targetUserId && requestedId !== targetUserId && (
          <p className="text-xs text-amber-600">
            Estás visualizando la tarjeta con ID <span className="font-medium">{requestedId}</span>.
          </p>
        )}
      </header>

      <div className="space-y-4">
        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-zinc-700" htmlFor="fullName">
            Nombre completo
          </label>
          <input
            id="fullName"
            type="text"
            className={`rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 focus:border-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-200 ${
              isDisabled ? disableClass : ""
            }`}
            value={fullName}
            onChange={(event) => setFullName(event.target.value)}
            placeholder="Ej. Ana Ruiz"
            disabled={isDisabled}
            required
          />
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-zinc-700" htmlFor="company">
            Empresa
          </label>
          <input
            id="company"
            type="text"
            className={`rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 focus:border-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-200 ${
              isDisabled ? disableClass : ""
            }`}
            value={company}
            onChange={(event) => setCompany(event.target.value)}
            placeholder="Ej. Devontic"
            disabled={isDisabled}
          />
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-zinc-700" htmlFor="phone">
            Teléfono
          </label>
          <input
            id="phone"
            type="tel"
            className={`rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 focus:border-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-200 ${
              isDisabled ? disableClass : ""
            }`}
            value={phone}
            onChange={(event) => setPhone(event.target.value)}
            placeholder="Ej. +57 301 555 4444"
            disabled={isDisabled}
          />
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-zinc-700" htmlFor="email">
            Correo electrónico
          </label>
          <input
            id="email"
            type="email"
            className={`rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 focus:border-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-200 ${
              isDisabled ? disableClass : ""
            }`}
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="Ej. ana@empresa.com"
            disabled={isDisabled}
          />
        </div>
      </div>

      {disabledMessage && (
        <p className="text-sm text-zinc-500">{disabledMessage}</p>
      )}

      {error && <p className="text-sm text-red-500">{error}</p>}
      {success && <p className="text-sm text-green-600">{success}</p>}

      <button
        type="submit"
        className={`rounded-lg bg-zinc-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-zinc-400 focus:ring-offset-2 focus:ring-offset-white ${
          !canSubmit ? disableClass : ""
        }`}
        disabled={!canSubmit}
      >
        {isSubmitting ? "Guardando..." : hasExistingCard ? "Actualizar" : "Guardar"}
      </button>
    </form>
  );
}
