"use client";

import { useMemo, useState, useTransition } from "react";

import {
  type ProfileRecord,
  saveCardFromProfile,
  type SaveCardFromProfileState,
} from "@/app/actions/profile";

const initialState: SaveCardFromProfileState = {
  success: false,
};

type SaveCardFormProps = {
  profile: ProfileRecord | null;
  requestedId: string | null;
  isAuthenticated: boolean;
};

export function SaveCardForm({
  profile,
  requestedId,
  isAuthenticated,
}: SaveCardFormProps) {
  const [state, setState] = useState<SaveCardFromProfileState>(initialState);
  const [isPending, startTransition] = useTransition();

  const canSaveCard = useMemo(() => {
    if (!isAuthenticated) return false;
    const fullName = profile?.name?.trim();
    return Boolean(fullName);
  }, [isAuthenticated, profile?.name]);

  const helperMessage = useMemo(() => {
    if (!isAuthenticated) {
      return "Debes iniciar sesión para guardar la tarjeta.";
    }

    if (!profile) {
      return "No hay datos de perfil disponibles para guardar.";
    }

    if (!profile.name?.trim()) {
      return "El perfil necesita un nombre para guardar la tarjeta.";
    }

    return "La tarjeta se guardará con la información mostrada.";
  }, [isAuthenticated, profile]);

  const handleSubmit = (formData: FormData) => {
    startTransition(async () => {
      setState(initialState);
      const result = await saveCardFromProfile(undefined, formData);
      setState(result);
    });
  };

  const buttonDisabled = !canSaveCard || isPending;

  return (
    <div className="rounded-2xl border border-zinc-200 bg-white px-5 py-4 shadow-sm">
      <div className="space-y-2">
        <h2 className="text-base font-semibold text-zinc-900">Tarjeta digital</h2>
        <p className="text-sm text-zinc-500">
          Confirma los datos que se guardarán en tu tarjeta.
        </p>
      </div>

      <div className="mt-4 space-y-3 text-sm text-zinc-700">
        <p>
          <span className="font-medium text-zinc-500">Nombre completo:&nbsp;</span>
          {profile?.name || <span className="text-zinc-400">No proporcionado</span>}
        </p>
        <p>
          <span className="font-medium text-zinc-500">Correo:&nbsp;</span>
          {profile?.email || <span className="text-zinc-400">No proporcionado</span>}
        </p>
        <p>
          <span className="font-medium text-zinc-500">Teléfono:&nbsp;</span>
          {profile?.phone || <span className="text-zinc-400">No proporcionado</span>}
        </p>
        <p>
          <span className="font-medium text-zinc-500">Empresa:&nbsp;</span>
          {profile?.company || <span className="text-zinc-400">No proporcionado</span>}
        </p>
        <p>
          <span className="font-medium text-zinc-500">Cargo:&nbsp;</span>
          {profile?.position || <span className="text-zinc-400">No proporcionado</span>}
        </p>
      </div>

      <form action={handleSubmit} className="mt-6 space-y-3">
        {profile && <input type="hidden" name="profile_id" value={profile.id} />}
        {requestedId && <input type="hidden" name="requested_id" value={requestedId} />}

        {state.success && (
          <p className="rounded-lg border border-green-200 bg-green-50 px-3 py-2 text-xs text-green-700">
            Tarjeta guardada correctamente.
          </p>
        )}

        {state.error && !state.success && (
          <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-600">
            {state.error}
          </p>
        )}

        <button
          type="submit"
          className={`w-full rounded-lg bg-zinc-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-zinc-400 focus:ring-offset-2 focus:ring-offset-white ${
            buttonDisabled ? "cursor-not-allowed opacity-60" : ""
          }`}
          disabled={buttonDisabled}
        >
          {isPending ? "Guardando..." : "Guardar tarjeta"}
        </button>
        <p className="text-xs text-zinc-500">{helperMessage}</p>
      </form>
    </div>
  );
}
