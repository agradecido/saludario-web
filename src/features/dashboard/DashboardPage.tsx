import { useState } from "react";

import { AddEntryModal } from "./AddEntryModal";
import { AddSymptomModal } from "./AddSymptomModal";
import { FabMenu } from "./FabMenu";

export function DashboardPage() {
    const [entryModalOpen, setEntryModalOpen] = useState(false);
    const [symptomModalOpen, setSymptomModalOpen] = useState(false);

    return (
        <>
            <div className="flex min-h-[60dvh] flex-col items-center justify-center gap-6 px-4">
                <div className="text-center">
                    <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">¿Qué has tomado?</h1>
                    <p className="mt-1.5 text-sm text-(--color-text-secondary)">
                        Registra lo que comes y bebes para entender cómo te afecta.
                    </p>
                </div>
            </div>

            <FabMenu
                onAddEntry={() => setEntryModalOpen(true)}
                onAddSymptom={() => setSymptomModalOpen(true)}
            />

            <AddEntryModal
                onClose={() => setEntryModalOpen(false)}
                open={entryModalOpen}
            />
            <AddSymptomModal
                onClose={() => setSymptomModalOpen(false)}
                open={symptomModalOpen}
            />
        </>
    );
}
