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
    return "Quantity not specified";
  }

  return entry.quantity_unit ? `${entry.quantity_value} ${entry.quantity_unit}` : String(entry.quantity_value);
}

function buildEditUrl(entryId: string, search: string): string {
  return search ? `/entries/${entryId}/edit?${search}` : `/entries/${entryId}/edit`;
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
          entryId ? "Entry update failed. Please try again." : "Entry creation failed. Please try again."
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
    ? getProblemMessage(entriesQuery.error, "Could not load entries.")
    : null;
  const detailError = detailQuery.error
    ? getProblemMessage(detailQuery.error, "Could not load the selected entry.")
    : null;
  const deletingId = deleteMutation.variables;

  return (
    <div className="dashboard-grid">
      <section className="surface stack-surface">
        <div className="section-heading">
          <div>
            <p className="section-label">Journal</p>
            <h2>Meal timeline</h2>
          </div>
          <p className="surface-copy">Cursor-based history, category filters, and direct CRUD over the API.</p>
        </div>

        <FiltersBar
          categoryFilter={categoryFilter}
          fromFilter={fromFilter}
          toFilter={toFilter}
          categories={categories}
          onChange={(next) => setSearchParams(next)}
        />

        {pageError ? <p className="callout-error">{pageError}</p> : null}

        <div className="entry-list">
          {entries.map((entry) => (
            <article
              className="entry-card"
              key={entry.id}
            >
              <div className="entry-card-top">
                <div>
                  <p className="entry-category">{entry.meal_category_code}</p>
                  <h3>{entry.food_name}</h3>
                </div>
                <span className="entry-time">{formatTimelineDate(entry.consumed_at)}</span>
              </div>

              <p className="entry-meta">
                {formatQuantity(entry)}
              </p>

              <p className="entry-notes">{entry.notes || "No notes added."}</p>

              <div className="entry-actions">
                <Link
                  className="button-secondary"
                  to={buildEditUrl(entry.id, searchParams.toString())}
                >
                  Edit
                </Link>
                <button
                  className="button-ghost"
                  disabled={deleteMutation.isPending}
                  onClick={() => {
                    if (window.confirm("Delete this entry?")) {
                      deleteMutation.mutate(entry.id);
                    }
                  }}
                  type="button"
                >
                  {deleteMutation.isPending && deletingId === entry.id ? "Deleting..." : "Delete"}
                </button>
              </div>
            </article>
          ))}
        </div>

        {!entriesQuery.isLoading && entries.length === 0 ? (
          <p className="empty-state">No entries match the current filters.</p>
        ) : null}

        {entriesQuery.hasNextPage ? (
          <button
            className="button-secondary button-load-more"
            disabled={entriesQuery.isFetchingNextPage}
            onClick={() => entriesQuery.fetchNextPage()}
            type="button"
          >
            {entriesQuery.isFetchingNextPage ? "Loading..." : "Load more"}
          </button>
        ) : null}
      </section>

      <section className="surface stack-surface">
        <div className="section-heading">
          <div>
            <p className="section-label">{entryId ? "Edit" : "Create"}</p>
            <h2>{entryId ? "Update entry" : "Add a new entry"}</h2>
          </div>
          {entryId ? (
            <Link
              className="button-ghost"
              to={`/entries${searchParams.toString() ? `?${searchParams.toString()}` : ""}`}
            >
              Cancel
            </Link>
          ) : null}
        </div>

        {detailError ? <p className="callout-error">{detailError}</p> : null}

        <form
          className="stack-form"
          onSubmit={form.handleSubmit((values) => mutation.mutate(values))}
        >
          <label className="field">
            <span>Meal category</span>
            <select {...form.register("meal_category_code")}>
              <option value="">Select category</option>
              {categories.map((category) => (
                <option
                  key={category.code}
                  value={category.code}
                >
                  {category.label}
                </option>
              ))}
            </select>
            <FieldError message={form.formState.errors.meal_category_code?.message} />
          </label>

          <label className="field">
            <span>Food name</span>
            <input
              placeholder="Grilled chicken"
              type="text"
              {...form.register("food_name")}
            />
            <FieldError message={form.formState.errors.food_name?.message} />
          </label>

          <div className="field-grid">
            <label className="field">
              <span>Quantity</span>
              <input
                min="0"
                placeholder="200"
                step="0.1"
                type="number"
                {...form.register("quantity_value")}
              />
              <FieldError message={form.formState.errors.quantity_value?.message} />
            </label>

            <label className="field">
              <span>Unit</span>
              <input
                placeholder="g"
                type="text"
                {...form.register("quantity_unit")}
              />
              <FieldError message={form.formState.errors.quantity_unit?.message} />
            </label>
          </div>

          <label className="field">
            <span>Consumed at</span>
            <input
              type="datetime-local"
              {...form.register("consumed_at")}
            />
            <FieldError message={form.formState.errors.consumed_at?.message} />
          </label>

          <label className="field">
            <span>Notes</span>
            <textarea
              placeholder="Homemade, restaurant, symptoms, context..."
              rows={5}
              {...form.register("notes")}
            />
            <FieldError message={form.formState.errors.notes?.message} />
          </label>

          {formError ? <p className="callout-error">{formError}</p> : null}
          {deleteMutation.error ? (
            <p className="callout-error">
              {getProblemMessage(deleteMutation.error, "Entry deletion failed. Please try again.")}
            </p>
          ) : null}

          <button
            className="button-primary"
            disabled={mutation.isPending || (Boolean(entryId) && detailQuery.isLoading)}
            type="submit"
          >
            {mutation.isPending ? "Saving..." : entryId ? "Save changes" : "Create entry"}
          </button>
        </form>
      </section>
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
      className="filters-bar"
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
      <label className="field">
        <span>Category</span>
        <select
          onChange={(event) => setDraftCategory(event.target.value)}
          value={draftCategory}
        >
          <option value="">All</option>
          {categories.map((category) => (
            <option
              key={category.code}
              value={category.code}
            >
              {category.label}
            </option>
          ))}
        </select>
      </label>

      <label className="field">
        <span>From</span>
        <input
          onChange={(event) => setDraftFrom(event.target.value)}
          type="datetime-local"
          value={draftFrom}
        />
      </label>

      <label className="field">
        <span>To</span>
        <input
          onChange={(event) => setDraftTo(event.target.value)}
          type="datetime-local"
          value={draftTo}
        />
      </label>

      <div className="filters-actions">
        <button
          className="button-secondary"
          type="submit"
        >
          Apply filters
        </button>
        <button
          className="button-ghost"
          onClick={() => {
            setDraftCategory("");
            setDraftFrom("");
            setDraftTo("");
            onChange(new URLSearchParams());
          }}
          type="button"
        >
          Clear
        </button>
      </div>
    </form>
  );
}

function FieldError({ message }: { message?: string }) {
  return message ? <span className="field-error">{message}</span> : null;
}
