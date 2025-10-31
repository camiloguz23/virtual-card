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

  const email = getStringParam(params.email);
  const nombre = getStringParam(params.nombre);
  const telefono = getStringParam(params.telefono);
  const empresa = getStringParam(params.empresa);
  const id = getStringParam(params.id);

  return (
    <main className="flex min-h-screen w-full items-start justify-center bg-[#f4f5f9] px-6 py-16 sm:px-8">
      <section className="w-full max-w-sm rounded-2xl border border-white bg-white p-6 shadow-lg">
        <h1 className="text-lg font-semibold text-zinc-900">Mi Card</h1>
        <p className="text-sm text-zinc-500">Información recibida desde la URL.</p>

        <div className="mt-6 space-y-6">
          <div className="flex flex-col rounded-2xl border border-zinc-200 bg-[#f9fafb] px-5 py-4 shadow-sm">
            <div>
              <span className="text-sm font-medium text-zinc-500">Nombre</span>
              <p className="text-base font-semibold text-zinc-900">
                {nombre || <span className="text-zinc-400">No proporcionado</span>}
              </p>
            </div>
            <div className="mt-3 grid gap-3 text-sm text-zinc-700">
              <p>
                <span className="font-medium text-zinc-500">Correo:&nbsp;</span>
                {email || <span className="text-zinc-400">No proporcionado</span>}
              </p>
              <p>
                <span className="font-medium text-zinc-500">Teléfono:&nbsp;</span>
                {telefono || <span className="text-zinc-400">No proporcionado</span>}
              </p>
              <p>
                <span className="font-medium text-zinc-500">Empresa:&nbsp;</span>
                {empresa || <span className="text-zinc-400">No proporcionado</span>}
              </p>
              <p>
                <span className="font-medium text-zinc-500">ID:&nbsp;</span>
                {id || <span className="text-zinc-400">No proporcionado</span>}
              </p>
            </div>
          </div>

          <button
            type="button"
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#1f1f22] px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-[#2a2a30] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#1f1f22]"
          >
            Guardar contacto
          </button>
        </div>
      </section>
    </main>
  );
}
