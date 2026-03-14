import { useState } from "react";

import { AddEntryModal } from "./AddEntryModal";
import { AddSymptomModal } from "./AddSymptomModal";

export function DashboardPage() {
    const [entryModalOpen, setEntryModalOpen] = useState(false);
    const [symptomModalOpen, setSymptomModalOpen] = useState(false);

    return (
        <div className="flex min-h-[60dvh] flex-col items-center justify-center gap-6 px-4">
            <div className="text-center">
                <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">¿Qué has tomado?</h1>
                <p className="mt-1.5 text-sm text-(--color-text-secondary)">
                    Registra lo que comes y bebes para entender cómo te afecta.
                </p>
            </div>

            <button
                className="w-full max-w-xs cursor-pointer rounded-2xl bg-(--color-brand-600) px-6 py-4 text-base font-semibold text-white shadow-lg transition-all hover:bg-(--color-brand-700) hover:shadow-xl active:scale-[0.98]"
                onClick={() => setEntryModalOpen(true)}
                type="button"
            >
                <span className="flex items-center justify-center gap-2">
                    <svg
                        className="h-5 w-5"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth={2}
                        viewBox="0 0 24 24"
                    >
                        <path
                            d="M12 4.5v15m7.5-7.5h-15"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        />
                    </svg>
                    Añadir comida o bebida
                </span>
            </button>

            <button
                className="cursor-pointer rounded-xl border border-(--color-border) bg-(--color-surface) px-5 py-2.5 text-sm font-medium text-(--color-text-secondary) transition-colors hover:border-(--color-brand-500) hover:text-(--color-brand-600)"
                onClick={() => setSymptomModalOpen(true)}
                type="button"
            >
                Registrar un síntoma
            </button>

            <AddEntryModal
                onClose={() => setEntryModalOpen(false)}
                open={entryModalOpen}
            />
            <AddSymptomModal
                onClose={() => setSymptomModalOpen(false)}
                open={symptomModalOpen}
            />
        </div>
    );
}
