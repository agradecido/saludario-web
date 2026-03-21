import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";

import { Modal } from "../../components/Modal";
import { ApiError, getProblemMessage } from "../../lib/api";
import { fromIsoToLocalInput, fromLocalInputToIso } from "../../lib/datetime";
import { categoriesQueryOptions, fallbackCategories, type Category } from "../categories/categories";
import { createEntry, listEntries } from "../entries/entries";
import { entryFormSchema, type EntryFormValues } from "../entries/entries.schemas";

interface AddEntryModalProps {
    initialCategory?: Category["code"];
    onClose: () => void;
    open: boolean;
}

const QUICK_CONSUMED_AT_PRESETS = [
    {
        label: "Ahora",
        getValue: () => new Date()
    },
    {
        label: "Hace 30 min",
        getValue: () => new Date(Date.now() - 30 * 60_000)
    },
    {
        label: "Ayer",
        getValue: () => new Date(Date.now() - 24 * 60 * 60_000)
    }
] as const;

function splitLocalDateTime(localValue: string) {
    const [date = "", time = ""] = localValue.split("T");

    return {
        date,
        time: time.slice(0, 5)
    };
}

function mergeLocalDateTime(date: string, time: string): string {
    if (!date || !time) {
        return "";
    }

    return `${date}T${time}`;
}

export function AddEntryModal({ initialCategory, onClose, open }: AddEntryModalProps) {
    const queryClient = useQueryClient();
    const [formError, setFormError] = useState<string | null>(null);

    const categoriesQuery = useQuery(categoriesQueryOptions());
    const categories = categoriesQuery.data?.data ?? fallbackCategories;
    const entriesQuery = useQuery({
        queryKey: ["entries", "suggestions"],
        queryFn: () => listEntries({ limit: 100 }),
        staleTime: 60_000
    });
    const knownFoodNames = Array.from(
        new Set(
            (entriesQuery.data?.data ?? [])
                .map((entry) => entry.food_name.trim())
                .filter(Boolean)
        )
    );

    const form = useForm<EntryFormValues>({
        resolver: zodResolver(entryFormSchema),
        defaultValues: {
            type: "food",
            meal_category_code: initialCategory ?? "snack",
            food_name: "",
            quantity_value: "",
            quantity_unit: "",
            notes: "",
            consumed_at: fromIsoToLocalInput(new Date().toISOString())
        }
    });
    const foodName = form.watch("food_name");
    const consumedAt = form.watch("consumed_at");
    const { date: consumedDate, time: consumedTime } = splitLocalDateTime(consumedAt);

    useEffect(() => {
        if (open) {
            form.setValue("meal_category_code", initialCategory ?? "snack");
        }
    }, [open, initialCategory, form]);

    useEffect(() => {
        const normalizedFoodName = foodName.trim().toLocaleLowerCase();

        if (!normalizedFoodName) {
            return;
        }

        const matchingEntry = (entriesQuery.data?.data ?? []).find(
            (entry) => entry.food_name.trim().toLocaleLowerCase() === normalizedFoodName
        );

        if (!matchingEntry) {
            return;
        }

        form.setValue(
            "quantity_value",
            matchingEntry.quantity_value === null ? "" : String(matchingEntry.quantity_value),
            { shouldDirty: true }
        );
        form.setValue("quantity_unit", matchingEntry.quantity_unit ?? "", { shouldDirty: true });
    }, [entriesQuery.data?.data, foodName, form]);

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
                        list="food-name-suggestions"
                        className="w-full rounded-xl border border-(--color-border) bg-(--color-surface-alt) px-3.5 py-2.5 text-sm text-(--color-text) placeholder:text-(--color-text-tertiary) focus:border-(--color-brand-500) focus:outline-none"
                        placeholder="Café con leche, ensalada..."
                        type="text"
                        {...form.register("food_name")}
                    />
                    <datalist id="food-name-suggestions">
                        {knownFoodNames.map((foodName) => (
                            <option
                                key={foodName}
                                value={foodName}
                            />
                        ))}
                    </datalist>
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
                    <div className="space-y-3">
                        <div className="flex flex-wrap gap-2">
                            {QUICK_CONSUMED_AT_PRESETS.map((preset) => (
                                <button
                                    className="cursor-pointer rounded-full border border-(--color-border) bg-(--color-surface) px-3 py-1.5 text-xs font-medium text-(--color-text-secondary) transition-colors hover:border-(--color-brand-500) hover:text-(--color-brand-600)"
                                    key={preset.label}
                                    onClick={() => form.setValue("consumed_at", fromIsoToLocalInput(preset.getValue().toISOString()), { shouldDirty: true, shouldValidate: true })}
                                    type="button"
                                >
                                    {preset.label}
                                </button>
                            ))}
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <input
                                className="w-full rounded-xl border border-(--color-border) bg-(--color-surface-alt) px-3.5 py-2.5 text-sm text-(--color-text) focus:border-(--color-brand-500) focus:outline-none"
                                type="date"
                                value={consumedDate}
                                onChange={(event) =>
                                    form.setValue(
                                        "consumed_at",
                                        mergeLocalDateTime(event.target.value, consumedTime),
                                        { shouldDirty: true, shouldValidate: true }
                                    )}
                            />
                            <input
                                className="w-full rounded-xl border border-(--color-border) bg-(--color-surface-alt) px-3.5 py-2.5 text-sm text-(--color-text) focus:border-(--color-brand-500) focus:outline-none"
                                step="300"
                                type="time"
                                value={consumedTime}
                                onChange={(event) =>
                                    form.setValue(
                                        "consumed_at",
                                        mergeLocalDateTime(consumedDate, event.target.value),
                                        { shouldDirty: true, shouldValidate: true }
                                    )}
                            />
                        </div>

                        <input
                            type="hidden"
                            {...form.register("consumed_at")}
                        />
                    </div>
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
