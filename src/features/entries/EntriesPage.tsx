import { zodResolver } from "@hookform/resolvers/zod";
import {
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient
} from "@tanstack/react-query";
import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { Link, useNavigate, useParams, useSearchParams } from "react-router-dom";

import { categoriesQueryOptions, fallbackCategories } from "../categories/categories";
import { fromIsoToLocalInput, fromLocalInputToIso, formatTimelineDate } from "../../lib/datetime";
import { ApiError, getProblemMessage } from "../../lib/api";
import {
  createEntry,
  deleteEntry,
  getEntry,
  listEntries,
  updateEntry,
  type Entry
} from "./entries";
import { entryFormSchema, type EntryFormValues } from "./entries.schemas";

const PAGE_LIMIT = 20;

function toFormDefaults(entry?: Entry): EntryFormValues {
  return {
    type: "food",
    meal_category_code: entry?.meal_category_code ?? "",
    food_name: entry?.food_name ?? "",
    quantity_value: entry?.quantity_value ? String(entry.quantity_value) : "",
    quantity_unit: entry?.quantity_unit ?? "",
    notes: entry?.notes ?? "",
    consumed_at: entry ? fromIsoToLocalInput(entry.consumed_at) : fromIsoToLocalInput(new Date().toISOString())
  };
}

function formatQuantity(entry: Entry): string {
  if (entry.quantity_value === null) {
    return "Sin cantidad";
  }

  return entry.quantity_unit ? `${entry.quantity_value} ${entry.quantity_unit}` : String(entry.quantity_value);
}

function buildEditUrl(entryId: string, search: string): string {
  return search ? `/entries/${entryId}/edit?${search}` : `/entries/${entryId}/edit`;
}

function buildIngredientsUrl(entryId: string, search: string): string {
  return search ? `/entries/${entryId}/ingredients?${search}` : `/entries/${entryId}/ingredients`;
}

export function EntriesPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { entryId } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const [formError, setFormError] = useState<string | null>(null);
  const categoryFilter = searchParams.get("meal_category_code") ?? "";
  const fromFilter = searchParams.get("from") ?? "";
  const toFilter = searchParams.get("to") ?? "";

  const filters = useMemo(
    () => ({
      meal_category_code: categoryFilter || undefined,
      from: fromFilter ? fromLocalInputToIso(fromFilter) : undefined,
      to: toFilter ? fromLocalInputToIso(toFilter) : undefined,
      limit: PAGE_LIMIT
    }),
    [categoryFilter, fromFilter, toFilter]
  );

  const categoriesQuery = useQuery(categoriesQueryOptions());
  const categories = categoriesQuery.data?.data ?? fallbackCategories;

  const entriesQuery = useInfiniteQuery({
    queryKey: ["entries", filters],
    queryFn: ({ pageParam }) => listEntries({ ...filters, cursor: pageParam || undefined }),
    initialPageParam: null as string | null,
    getNextPageParam: (lastPage) => (lastPage.page.has_more ? lastPage.page.next_cursor : undefined)
  });

  const detailQuery = useQuery({
    queryKey: ["entries", "detail", entryId],
    queryFn: () => getEntry(entryId!),
    enabled: Boolean(entryId)
  });

  const form = useForm<EntryFormValues>({
    resolver: zodResolver(entryFormSchema),
    defaultValues: toFormDefaults()
  });

  useEffect(() => {
    form.reset(toFormDefaults(detailQuery.data));
    setFormError(null);
  }, [detailQuery.data, form]);

  const mutation = useMutation({
    mutationFn: async (values: EntryFormValues) => {
      const payload = {
        meal_category_code: values.meal_category_code,
        food_name: values.food_name.trim(),
        quantity_value: values.quantity_value ? Number(values.quantity_value) : undefined,
        quantity_unit: values.quantity_unit?.trim() || undefined,
        notes: values.notes?.trim() || undefined,
        consumed_at: fromLocalInputToIso(values.consumed_at)
      };

      if (entryId) {
        return updateEntry(entryId, payload);
      }

      return createEntry(payload);
    },
    onSuccess: async () => {
      setFormError(null);
      await queryClient.invalidateQueries({ queryKey: ["entries"] });

      if (entryId) {
        await queryClient.invalidateQueries({ queryKey: ["entries", "detail", entryId] });
        await navigate("/entries");
        return;
      }

      form.reset(toFormDefaults());
    },
    onError: (error) => {
      if (error instanceof ApiError && error.problem.errors) {
        for (const issue of error.problem.errors) {
          if (issue.field) {
            form.setError(issue.field as keyof EntryFormValues, {
              message: issue.message
            });
          }
        }
      }

      setFormError(
        getProblemMessage(
          error,
          entryId ? "No se pudo actualizar." : "No se pudo crear."
        )
      );
    }
  });

  const deleteMutation = useMutation({
    mutationFn: deleteEntry,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["entries"] });
      if (entryId) {
        await navigate("/entries");
      }
    }
  });

  const entries = entriesQuery.data?.pages.flatMap((page) => page.data) ?? [];
  const pageError = entriesQuery.error
    ? getProblemMessage(entriesQuery.error, "No se pudieron cargar las entradas.")
    : null;
  const detailError = detailQuery.error
    ? getProblemMessage(detailQuery.error, "No se pudo cargar la entrada.")
    : null;
  const deletingId = deleteMutation.variables;

  return (
    <div className="mx-auto max-w-5xl px-4 py-6 sm:px-6">
      <div className="grid gap-6 lg:grid-cols-[1.3fr_1fr]">
        {/* Entry list */}
        <section className="space-y-4">
          <div>
            <h2 className="text-xl font-bold">Historial</h2>
            <p className="mt-0.5 text-sm text-(--color-text-secondary)">
              Tu registro de comidas y bebidas.
            </p>
          </div>

          <FiltersBar
            categoryFilter={categoryFilter}
            fromFilter={fromFilter}
            toFilter={toFilter}
            categories={categories}
            onChange={(next) => setSearchParams(next)}
          />

          {pageError ? (
            <p className="rounded-xl bg-(--color-error-bg) px-3.5 py-2.5 text-sm text-(--color-error)">
              {pageError}
            </p>
          ) : null}

          <div className="space-y-3">
            {entries.map((entry) => (
              <article
                className="rounded-xl border border-(--color-border) bg-(--color-surface) p-4"
                key={entry.id}
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <span className="text-xs font-semibold tracking-wide text-(--color-brand-600) uppercase">
                      {entry.meal_category_code}
                    </span>
                    <h3 className="font-semibold">{entry.food_name}</h3>
                  </div>
                  <span className="shrink-0 text-xs text-(--color-text-tertiary)">
                    {formatTimelineDate(entry.consumed_at)}
                  </span>
                </div>

                <p className="mt-2 text-sm text-(--color-text-secondary)">
                  {formatQuantity(entry)}
                </p>

                <p className="mt-1 text-sm text-(--color-text-secondary)">
                  {entry.ingredients.length > 0
                    ? `${entry.ingredients.length} ingredientes registrados`
                    : "Ingredientes pendientes"}
                </p>

                <p className="mt-1 text-sm text-(--color-text-secondary)">
                  {entry.notes || "Sin notas."}
                </p>

                <div className="mt-3 flex gap-2">
                  <Link
                    className="rounded-lg border border-(--color-border) px-3 py-1.5 text-xs font-medium text-(--color-text-secondary) transition-colors hover:border-(--color-brand-500) hover:text-(--color-brand-600)"
                    to={buildEditUrl(entry.id, searchParams.toString())}
                  >
                    Editar
                  </Link>
                  <Link
                    className="rounded-lg border border-(--color-border) px-3 py-1.5 text-xs font-medium text-(--color-text-secondary) transition-colors hover:border-(--color-brand-500) hover:text-(--color-brand-600)"
                    to={buildIngredientsUrl(entry.id, searchParams.toString())}
                  >
                    Ingredientes
                  </Link>
                  <button
                    className="rounded-lg border border-(--color-border) px-3 py-1.5 text-xs font-medium text-(--color-text-secondary) transition-colors hover:border-(--color-error) hover:text-(--color-error) disabled:opacity-50"
                    disabled={deleteMutation.isPending}
                    onClick={() => {
                      if (window.confirm("¿Eliminar esta entrada?")) {
                        deleteMutation.mutate(entry.id);
                      }
                    }}
                    type="button"
                  >
                    {deleteMutation.isPending && deletingId === entry.id ? "Eliminando..." : "Eliminar"}
                  </button>
                </div>
              </article>
            ))}
          </div>

          {!entriesQuery.isLoading && entries.length === 0 ? (
            <p className="py-8 text-center text-sm text-(--color-text-tertiary)">
              No hay entradas con estos filtros.
            </p>
          ) : null}

          {entriesQuery.hasNextPage ? (
            <button
              className="w-full rounded-xl border border-(--color-border) py-2.5 text-sm font-medium text-(--color-text-secondary) transition-colors hover:border-(--color-brand-500) hover:text-(--color-brand-600) disabled:opacity-50"
              disabled={entriesQuery.isFetchingNextPage}
              onClick={() => entriesQuery.fetchNextPage()}
              type="button"
            >
              {entriesQuery.isFetchingNextPage ? "Cargando..." : "Cargar más"}
            </button>
          ) : null}
        </section>

        {/* Entry form */}
        <section className="space-y-4">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-xl font-bold">
                {entryId ? "Editar entrada" : "Nueva entrada"}
              </h2>
            </div>
            {entryId ? (
              <Link
                className="rounded-lg border border-(--color-border) px-3 py-1.5 text-xs font-medium text-(--color-text-secondary) transition-colors hover:text-(--color-text)"
                to={`/entries${searchParams.toString() ? `?${searchParams.toString()}` : ""}`}
              >
                Cancelar
              </Link>
            ) : null}
          </div>

          {detailError ? (
            <p className="rounded-xl bg-(--color-error-bg) px-3.5 py-2.5 text-sm text-(--color-error)">
              {detailError}
            </p>
          ) : null}

          <form
            className="space-y-4"
            onSubmit={form.handleSubmit((values) => mutation.mutate(values))}
          >
            <Field
              error={form.formState.errors.meal_category_code?.message}
              label="Categoría"
            >
              <select
                className="w-full rounded-xl border border-(--color-border) bg-(--color-surface-alt) px-3.5 py-2.5 text-sm text-(--color-text) focus:border-(--color-brand-500) focus:outline-none"
                {...form.register("meal_category_code")}
              >
                <option value="">Seleccionar</option>
                {categories.map((category) => (
                  <option
                    key={category.code}
                    value={category.code}
                  >
                    {category.label}
                  </option>
                ))}
              </select>
            </Field>

            <Field
              error={form.formState.errors.food_name?.message}
              label="Nombre"
            >
              <input
                className="w-full rounded-xl border border-(--color-border) bg-(--color-surface-alt) px-3.5 py-2.5 text-sm text-(--color-text) placeholder:text-(--color-text-tertiary) focus:border-(--color-brand-500) focus:outline-none"
                placeholder="Pollo a la plancha"
                type="text"
                {...form.register("food_name")}
              />
            </Field>

            <div className="grid grid-cols-2 gap-3">
              <Field
                error={form.formState.errors.quantity_value?.message}
                label="Cantidad"
              >
                <input
                  className="w-full rounded-xl border border-(--color-border) bg-(--color-surface-alt) px-3.5 py-2.5 text-sm text-(--color-text) placeholder:text-(--color-text-tertiary) focus:border-(--color-brand-500) focus:outline-none"
                  min="0"
                  placeholder="200"
                  step="0.1"
                  type="number"
                  {...form.register("quantity_value")}
                />
              </Field>

              <Field
                error={form.formState.errors.quantity_unit?.message}
                label="Unidad"
              >
                <input
                  className="w-full rounded-xl border border-(--color-border) bg-(--color-surface-alt) px-3.5 py-2.5 text-sm text-(--color-text) placeholder:text-(--color-text-tertiary) focus:border-(--color-brand-500) focus:outline-none"
                  placeholder="g"
                  type="text"
                  {...form.register("quantity_unit")}
                />
              </Field>
            </div>

            <Field
              error={form.formState.errors.consumed_at?.message}
              label="Consumido"
            >
              <input
                className="w-full rounded-xl border border-(--color-border) bg-(--color-surface-alt) px-3.5 py-2.5 text-sm text-(--color-text) focus:border-(--color-brand-500) focus:outline-none"
                type="datetime-local"
                {...form.register("consumed_at")}
              />
            </Field>

            <Field
              error={form.formState.errors.notes?.message}
              label="Notas"
            >
              <textarea
                className="w-full rounded-xl border border-(--color-border) bg-(--color-surface-alt) px-3.5 py-2.5 text-sm text-(--color-text) placeholder:text-(--color-text-tertiary) focus:border-(--color-brand-500) focus:outline-none"
                placeholder="Casero, restaurante, contexto..."
                rows={3}
                {...form.register("notes")}
              />
            </Field>

            {formError ? (
              <p className="rounded-xl bg-(--color-error-bg) px-3.5 py-2.5 text-sm text-(--color-error)">
                {formError}
              </p>
            ) : null}

            {deleteMutation.error ? (
              <p className="rounded-xl bg-(--color-error-bg) px-3.5 py-2.5 text-sm text-(--color-error)">
                {getProblemMessage(deleteMutation.error, "No se pudo eliminar la entrada.")}
              </p>
            ) : null}

            <button
              className="w-full rounded-xl bg-(--color-brand-600) py-2.5 text-sm font-semibold text-white transition-colors hover:bg-(--color-brand-700) disabled:opacity-50"
              disabled={mutation.isPending || (Boolean(entryId) && detailQuery.isLoading)}
              type="submit"
            >
              {mutation.isPending ? "Guardando..." : entryId ? "Guardar cambios" : "Crear entrada"}
            </button>
          </form>
        </section>
      </div>
    </div>
  );
}

interface FiltersBarProps {
  categories: typeof fallbackCategories;
  categoryFilter: string;
  fromFilter: string;
  onChange: (searchParams: URLSearchParams) => void;
  toFilter: string;
}

function FiltersBar({
  categories,
  categoryFilter,
  fromFilter,
  onChange,
  toFilter
}: FiltersBarProps) {
  const [draftCategory, setDraftCategory] = useState(categoryFilter);
  const [draftFrom, setDraftFrom] = useState(fromFilter);
  const [draftTo, setDraftTo] = useState(toFilter);

  useEffect(() => {
    setDraftCategory(categoryFilter);
    setDraftFrom(fromFilter);
    setDraftTo(toFilter);
  }, [categoryFilter, fromFilter, toFilter]);

  return (
    <form
      className="grid gap-3 sm:grid-cols-4 sm:items-end"
      onSubmit={(event) => {
        event.preventDefault();
        const next = new URLSearchParams();

        if (draftCategory) {
          next.set("meal_category_code", draftCategory);
        }

        if (draftFrom) {
          next.set("from", draftFrom);
        }

        if (draftTo) {
          next.set("to", draftTo);
        }

        onChange(next);
      }}
    >
      <Field label="Categoría">
        <select
          className="w-full rounded-xl border border-(--color-border) bg-(--color-surface-alt) px-3.5 py-2.5 text-sm text-(--color-text) focus:border-(--color-brand-500) focus:outline-none"
          onChange={(event) => setDraftCategory(event.target.value)}
          value={draftCategory}
        >
          <option value="">Todas</option>
          {categories.map((category) => (
            <option
              key={category.code}
              value={category.code}
            >
              {category.label}
            </option>
          ))}
        </select>
      </Field>

      <Field label="Desde">
        <input
          className="w-full rounded-xl border border-(--color-border) bg-(--color-surface-alt) px-3.5 py-2.5 text-sm text-(--color-text) focus:border-(--color-brand-500) focus:outline-none"
          onChange={(event) => setDraftFrom(event.target.value)}
          type="datetime-local"
          value={draftFrom}
        />
      </Field>

      <Field label="Hasta">
        <input
          className="w-full rounded-xl border border-(--color-border) bg-(--color-surface-alt) px-3.5 py-2.5 text-sm text-(--color-text) focus:border-(--color-brand-500) focus:outline-none"
          onChange={(event) => setDraftTo(event.target.value)}
          type="datetime-local"
          value={draftTo}
        />
      </Field>

      <div className="flex gap-2">
        <button
          className="flex-1 rounded-xl border border-(--color-border) py-2.5 text-sm font-medium text-(--color-text-secondary) transition-colors hover:border-(--color-brand-500) hover:text-(--color-brand-600)"
          type="submit"
        >
          Filtrar
        </button>
        <button
          className="rounded-xl border border-(--color-border) px-3 py-2.5 text-sm text-(--color-text-tertiary) transition-colors hover:text-(--color-text)"
          onClick={() => {
            setDraftCategory("");
            setDraftFrom("");
            setDraftTo("");
            onChange(new URLSearchParams());
          }}
          type="button"
        >
          Limpiar
        </button>
      </div>
    </form>
  );
}

function Field({
  children,
  error,
  label
}: {
  children: React.ReactNode;
  error?: string;
  label: string;
}) {
  return (
    <label className="block space-y-1.5">
      <span className="text-sm font-medium text-(--color-text-secondary)">{label}</span>
      {children}
      {error ? <span className="text-xs text-(--color-error)">{error}</span> : null}
    </label>
  );
}
