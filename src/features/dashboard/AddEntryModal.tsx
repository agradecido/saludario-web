import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { useForm } from "react-hook-form";

import { Modal } from "../../components/Modal";
import { ApiError, getProblemMessage } from "../../lib/api";
import { fromIsoToLocalInput, fromLocalInputToIso } from "../../lib/datetime";
import { categoriesQueryOptions, fallbackCategories } from "../categories/categories";
import { createEntry } from "../entries/entries";
import { entryFormSchema, type EntryFormValues } from "../entries/entries.schemas";

interface AddEntryModalProps {
    onClose: () => void;
    open: boolean;
}

export function AddEntryModal({ onClose, open }: AddEntryModalProps) {
    const queryClient = useQueryClient();
    const [formError, setFormError] = useState<string | null>(null);

    const categoriesQuery = useQuery(categoriesQueryOptions());
    const categories = categoriesQuery.data?.data ?? fallbackCategories;

    const form = useForm<EntryFormValues>({
        resolver: zodResolver(entryFormSchema),
        defaultValues: {
            meal_category_code: "",
            food_name: "",
            quantity_value: "",
            quantity_unit: "",
            notes: "",
            consumed_at: fromIsoToLocalInput(new Date().toISOString())
        }
    });

    const mutation = useMutation({
        mutationFn: async (values: EntryFormValues) =>
            createEntry({
                meal_category_code: values.meal_category_code,
                food_name: values.food_name.trim(),
                quantity_value: values.quantity_value ? Number(values.quantity_value) : undefined,
                quantity_unit: values.quantity_unit?.trim() || undefined,
                notes: values.notes?.trim() || undefined,
                consumed_at: fromLocalInputToIso(values.consumed_at)
            }),
        onSuccess: async () => {
            setFormError(null);
            await queryClient.invalidateQueries({ queryKey: ["entries"] });
            form.reset();
            onClose();
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

            setFormError(getProblemMessage(error, "No se pudo guardar. Inténtalo de nuevo."));
        }
    });

    return (
        <Modal
            onClose={onClose}
            open={open}
            title="Añadir comida o bebida"
        >
            <form
                className="space-y-4"
                onSubmit={form.handleSubmit((v) => mutation.mutate(v))}
            >
                <Field
                    error={form.formState.errors.food_name?.message}
                    label="¿Qué has tomado?"
                >
                    <input
                        autoFocus
                        className="w-full rounded-xl border border-(--color-border) bg-(--color-surface-alt) px-3.5 py-2.5 text-sm text-(--color-text) placeholder:text-(--color-text-tertiary) focus:border-(--color-brand-500) focus:outline-none"
                        placeholder="Café con leche, ensalada..."
                        type="text"
                        {...form.register("food_name")}
                    />
                </Field>

                <Field
                    error={form.formState.errors.meal_category_code?.message}
                    label="Categoría"
                >
                    <select
                        className="w-full rounded-xl border border-(--color-border) bg-(--color-surface-alt) px-3.5 py-2.5 text-sm text-(--color-text) focus:border-(--color-brand-500) focus:outline-none"
                        {...form.register("meal_category_code")}
                    >
                        <option value="">Seleccionar</option>
                        {categories.map((c) => (
                            <option
                                key={c.code}
                                value={c.code}
                            >
                                {c.label}
                            </option>
                        ))}
                    </select>
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
                            placeholder="ml, g..."
                            type="text"
                            {...form.register("quantity_unit")}
                        />
                    </Field>
                </div>

                <Field
                    error={form.formState.errors.consumed_at?.message}
                    label="¿Cuándo?"
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
                        rows={2}
                        {...form.register("notes")}
                    />
                </Field>

                {formError ? (
                    <p className="rounded-xl bg-(--color-error-bg) px-3.5 py-2.5 text-sm text-(--color-error)">
                        {formError}
                    </p>
                ) : null}

                <button
                    className="w-full rounded-xl bg-(--color-brand-600) py-2.5 text-sm font-semibold text-white transition-colors hover:bg-(--color-brand-700) disabled:opacity-50"
                    disabled={mutation.isPending}
                    type="submit"
                >
                    {mutation.isPending ? "Guardando..." : "Guardar"}
                </button>
            </form>
        </Modal>
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
