import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { useForm } from "react-hook-form";

import { Modal } from "../../components/Modal";
import { ApiError, getProblemMessage } from "../../lib/api";
import { fromIsoToLocalInput, fromLocalInputToIso } from "../../lib/datetime";
import { createSymptomEvent } from "../symptoms/symptoms";
import { symptomFormSchema, type SymptomFormValues } from "../symptoms/symptoms.schemas";

interface AddSymptomModalProps {
    onClose: () => void;
    open: boolean;
}

const SEVERITY_LABELS = ["Leve", "Bajo", "Moderado", "Alto", "Severo"] as const;

export function AddSymptomModal({ onClose, open }: AddSymptomModalProps) {
    const queryClient = useQueryClient();
    const [formError, setFormError] = useState<string | null>(null);

    const form = useForm<SymptomFormValues>({
        resolver: zodResolver(symptomFormSchema),
        defaultValues: {
            type: "symptom",
            symptom_code: "",
            severity: 1,
            occurred_at: fromIsoToLocalInput(new Date().toISOString()),
            notes: ""
        }
    });

    const selectedSeverity = form.watch("severity");

    const mutation = useMutation({
        mutationFn: async (values: SymptomFormValues) =>
            createSymptomEvent({
                symptom_code: values.symptom_code.trim(),
                severity: values.severity,
                occurred_at: fromLocalInputToIso(values.occurred_at),
                notes: values.notes?.trim() || undefined
            }),
        onSuccess: async () => {
            setFormError(null);
            await queryClient.invalidateQueries({ queryKey: ["symptoms"] });
            form.reset();
            onClose();
        },
        onError: (error) => {
            if (error instanceof ApiError && error.problem.errors) {
                for (const issue of error.problem.errors) {
                    if (issue.field) {
                        form.setError(issue.field as keyof SymptomFormValues, {
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
            title="Registrar un síntoma"
        >
            <form
                className="space-y-4"
                onSubmit={form.handleSubmit((v) => mutation.mutate(v))}
            >
                <Field
                    error={form.formState.errors.symptom_code?.message}
                    label="¿Qué sientes?"
                >
                    <input
                        autoFocus
                        className="w-full rounded-xl border border-(--color-border) bg-(--color-surface-alt) px-3.5 py-2.5 text-sm text-(--color-text) placeholder:text-(--color-text-tertiary) focus:border-(--color-brand-500) focus:outline-none"
                        placeholder="Gases, dolor de espalda, náuseas..."
                        type="text"
                        {...form.register("symptom_code")}
                    />
                </Field>

                <div className="space-y-1.5">
                    <span className="text-sm font-medium text-(--color-text-secondary)">Intensidad</span>
                    <div className="flex gap-2">
                        {SEVERITY_LABELS.map((label, index) => {
                            const value = index + 1;
                            const isSelected = Number(selectedSeverity) === value;
                            return (
                                <button
                                    className={`flex-1 rounded-xl border py-2 text-xs font-medium transition-colors ${isSelected
                                        ? "border-(--color-brand-500) bg-(--color-brand-600) text-white"
                                        : "border-(--color-border) bg-(--color-surface-alt) text-(--color-text-secondary) hover:border-(--color-brand-500)"
                                        }`}
                                    key={value}
                                    onClick={() => form.setValue("severity", value, { shouldValidate: true })}
                                    type="button"
                                >
                                    {label}
                                </button>
                            );
                        })}
                    </div>
                    {form.formState.errors.severity?.message ? (
                        <span className="text-xs text-(--color-error)">
                            {form.formState.errors.severity.message}
                        </span>
                    ) : null}
                </div>

                <Field
                    error={form.formState.errors.occurred_at?.message}
                    label="¿Cuándo?"
                >
                    <input
                        className="w-full rounded-xl border border-(--color-border) bg-(--color-surface-alt) px-3.5 py-2.5 text-sm text-(--color-text) focus:border-(--color-brand-500) focus:outline-none"
                        type="datetime-local"
                        {...form.register("occurred_at")}
                    />
                </Field>

                <Field
                    error={form.formState.errors.notes?.message}
                    label="Notas"
                >
                    <textarea
                        className="w-full rounded-xl border border-(--color-border) bg-(--color-surface-alt) px-3.5 py-2.5 text-sm text-(--color-text) placeholder:text-(--color-text-tertiary) focus:border-(--color-brand-500) focus:outline-none"
                        placeholder="Después de comer, al levantarme..."
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
