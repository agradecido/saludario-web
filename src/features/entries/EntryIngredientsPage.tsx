import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useMemo, useState } from "react";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";

import { ApiError, getProblemMessage } from "../../lib/api";
import { formatTimelineDate } from "../../lib/datetime";
import { getEntry, updateEntry } from "./entries";

function formatQuantity(quantityValue: number | null, quantityUnit: string | null): string {
  if (quantityValue === null) {
    return "Sin cantidad registrada";
  }

  return quantityUnit ? `${quantityValue} ${quantityUnit}` : String(quantityValue);
}

function parseIngredients(rawValue: string): string[] {
  return Array.from(
    new Set(
      rawValue
        .split(/\r?\n|,/)
        .map((value) => value.trim())
        .filter(Boolean)
    )
  );
}

export function EntryIngredientsPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { entryId } = useParams();
  const [draftIngredient, setDraftIngredient] = useState("");
  const [ingredients, setIngredients] = useState<string[]>([]);
  const [formError, setFormError] = useState<string | null>(null);

  const detailQuery = useQuery({
    queryKey: ["entries", "detail", entryId],
    queryFn: () => getEntry(entryId!),
    enabled: Boolean(entryId)
  });

  useEffect(() => {
    setIngredients(detailQuery.data?.ingredients ?? []);
    setFormError(null);
    setDraftIngredient("");
  }, [detailQuery.data]);

  const ingredientCountLabel = useMemo(() => {
    if (ingredients.length === 0) {
      return "Aún no has añadido ingredientes";
    }

    if (ingredients.length === 1) {
      return "1 ingrediente guardado";
    }

    return `${ingredients.length} ingredientes guardados`;
  }, [ingredients.length]);

  const mutation = useMutation({
    mutationFn: async () => updateEntry(entryId!, { ingredients }),
    onSuccess: async () => {
      setFormError(null);
      await queryClient.invalidateQueries({ queryKey: ["entries"] });
      await queryClient.invalidateQueries({ queryKey: ["entries", "detail", entryId] });
      await navigate(`/entries${location.search}`);
    },
    onError: (error) => {
      if (error instanceof ApiError && error.problem.errors) {
        const ingredientsError = error.problem.errors.find((issue) => issue.field === "ingredients");
        if (ingredientsError) {
          setFormError(ingredientsError.message);
          return;
        }
      }

      setFormError(getProblemMessage(error, "No se pudieron guardar los ingredientes."));
    }
  });

  const entry = detailQuery.data;
  const pageError = detailQuery.error
    ? getProblemMessage(detailQuery.error, "No se pudo cargar la entrada.")
    : null;

  function appendIngredients(rawValue: string) {
    const nextIngredients = parseIngredients(rawValue);

    if (nextIngredients.length === 0) {
      return;
    }

    setIngredients((current) => Array.from(new Set([...current, ...nextIngredients])));
    setDraftIngredient("");
  }

  function removeIngredient(ingredientToRemove: string) {
    setIngredients((current) => current.filter((ingredient) => ingredient !== ingredientToRemove));
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-6 sm:px-6">
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-(--color-brand-600)">Ingredientes</p>
          <h1 className="text-2xl font-bold tracking-tight">Completa este plato con calma</h1>
          <p className="mt-1.5 text-sm text-(--color-text-secondary)">
            Añade cada ingrediente por separado. Puedes pegar varios separados por coma o por línea.
          </p>
        </div>
        <Link
          className="rounded-xl border border-(--color-border) px-4 py-2 text-sm font-medium text-(--color-text-secondary) transition-colors hover:border-(--color-brand-500) hover:text-(--color-brand-600)"
          to={`/entries${location.search}`}
        >
          Volver al historial
        </Link>
      </div>

      {pageError ? (
        <p className="rounded-xl bg-(--color-error-bg) px-3.5 py-2.5 text-sm text-(--color-error)">
          {pageError}
        </p>
      ) : null}

      {entry ? (
        <div className="space-y-6">
          <section className="rounded-2xl border border-(--color-border) bg-(--color-surface) p-5 shadow-sm">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <span className="text-xs font-semibold tracking-wide text-(--color-brand-600) uppercase">
                  {entry.meal_category_code}
                </span>
                <h2 className="mt-1 text-xl font-semibold">{entry.food_name}</h2>
              </div>
              <span className="text-sm text-(--color-text-tertiary)">
                {formatTimelineDate(entry.consumed_at)}
              </span>
            </div>

            <div className="mt-4 grid gap-3 text-sm text-(--color-text-secondary) sm:grid-cols-2">
              <p>{formatQuantity(entry.quantity_value, entry.quantity_unit)}</p>
              <p>{entry.notes || "Sin notas de contexto"}</p>
            </div>
          </section>

          <section className="rounded-2xl border border-(--color-border) bg-(--color-surface) p-5 shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="text-lg font-semibold">Lista de ingredientes</h2>
                <p className="mt-1 text-sm text-(--color-text-secondary)">{ingredientCountLabel}</p>
              </div>
              <button
                className="cursor-pointer rounded-xl bg-(--color-brand-600) px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-(--color-brand-700) disabled:opacity-50"
                disabled={mutation.isPending || detailQuery.isLoading}
                onClick={() => mutation.mutate()}
                type="button"
              >
                {mutation.isPending ? "Guardando..." : "Guardar ingredientes"}
              </button>
            </div>

            <div className="mt-5 flex gap-3">
              <textarea
                className="min-h-24 flex-1 rounded-xl border border-(--color-border) bg-(--color-surface-alt) px-3.5 py-3 text-sm text-(--color-text) placeholder:text-(--color-text-tertiary) focus:border-(--color-brand-500) focus:outline-none"
                placeholder="Tomate\nAceite de oliva\nSal"
                value={draftIngredient}
                onChange={(event) => setDraftIngredient(event.target.value)}
              />
              <button
                className="cursor-pointer self-start rounded-xl border border-(--color-border) px-4 py-2 text-sm font-medium text-(--color-text-secondary) transition-colors hover:border-(--color-brand-500) hover:text-(--color-brand-600)"
                onClick={() => appendIngredients(draftIngredient)}
                type="button"
              >
                Añadir
              </button>
            </div>

            <div className="mt-5 flex flex-wrap gap-2">
              {ingredients.length > 0 ? (
                ingredients.map((ingredient) => (
                  <button
                    className="cursor-pointer rounded-full border border-(--color-border) bg-(--color-surface-alt) px-3 py-1.5 text-sm text-(--color-text) transition-colors hover:border-(--color-error) hover:text-(--color-error)"
                    key={ingredient}
                    onClick={() => removeIngredient(ingredient)}
                    type="button"
                  >
                    {ingredient} ×
                  </button>
                ))
              ) : (
                <p className="text-sm text-(--color-text-tertiary)">
                  Todavía no hay ingredientes. Empieza añadiendo el primero.
                </p>
              )}
            </div>

            {formError ? (
              <p className="mt-4 rounded-xl bg-(--color-error-bg) px-3.5 py-2.5 text-sm text-(--color-error)">
                {formError}
              </p>
            ) : null}
          </section>
        </div>
      ) : null}
    </div>
  );
}
