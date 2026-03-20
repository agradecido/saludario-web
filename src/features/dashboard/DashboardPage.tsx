import { useState } from "react";

import { AddEntryModal } from "./AddEntryModal";
import { AddSymptomModal } from "./AddSymptomModal";
import { FabMenu } from "./FabMenu";

type FoodCategory = "breakfast" | "lunch" | "dinner" | "snack";
type BodyRegion = "head" | "chest" | "abdomen" | "back" | "extremities";

export function DashboardPage() {
    const [entryModalOpen, setEntryModalOpen] = useState(false);
    const [symptomModalOpen, setSymptomModalOpen] = useState(false);

    function handleOpenEntryModal(category?: FoodCategory) {
        // TODO: Pass category context to AddEntryModal when it supports it
        console.log("Opening entry modal with category:", category);
        setEntryModalOpen(true);
    }

    function handleOpenSymptomModal(region?: BodyRegion) {
        // TODO: Pass region context to AddSymptomModal when it supports it
        console.log("Opening symptom modal with region:", region);
        setSymptomModalOpen(true);
    }

    return (
        <>
            <div className="flex min-h-[60dvh] flex-col items-center justify-center gap-6 px-4">
                <div className="text-center">
                    <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Añade nueva información</h1>
                    <p className="mt-1.5 text-sm text-(--color-text-secondary)">
                        Registra lo que comes y cualquier síntoma que experimentes para llevar un seguimiento detallado de tu salud digestiva.
                    </p>
                </div>
            </div>

            <FabMenu
                onAddEntry={handleOpenEntryModal}
                onAddSymptom={handleOpenSymptomModal}
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
