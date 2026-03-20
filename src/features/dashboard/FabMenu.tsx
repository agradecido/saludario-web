import { useState } from "react";

interface FabMenuProps {
    onAddEntry: () => void;
    onAddSymptom: () => void;
}

export function FabMenu({ onAddEntry, onAddSymptom }: FabMenuProps) {
    const [isOpen, setIsOpen] = useState(false);

    function handleToggle() {
        setIsOpen(!isOpen);
    }

    function handleAddEntry() {
        onAddEntry();
        setIsOpen(false);
    }

    function handleAddSymptom() {
        onAddSymptom();
        setIsOpen(false);
    }

    return (
        <div
            aria-expanded={isOpen}
            className="fixed left-1/2 top-[60%] z-50 -translate-x-1/2 -translate-y-1/2"
            role="menu"
        >
            {/* Overlay backdrop */}
            {isOpen && (
                <div
                    className="fixed inset-0 -z-10 bg-black/20 backdrop-blur-sm transition-opacity duration-300"
                    onClick={handleToggle}
                />
            )}

            {/* Satellite buttons container */}
            <div className="relative">
                {/* Add Entry button (top-left position) */}
                <button
                    aria-label="Añadir nueva entrada de comida o bebida"
                    className={`absolute bottom-0 left-0 flex h-14 w-14 items-center justify-center rounded-full border-2 border-(--color-border) bg-(--color-surface) text-(--color-brand-600) shadow-lg transition-all duration-300 hover:scale-110 hover:border-(--color-brand-500) hover:shadow-xl ${isOpen
                        ? "scale-100 -translate-x-20 -translate-y-20 opacity-100 delay-150"
                        : "scale-0 translate-x-0 translate-y-0 opacity-0"
                        }`}
                    onClick={handleAddEntry}
                    style={{
                        transitionTimingFunction: "cubic-bezier(0.34, 1.56, 0.64, 1)",
                    }}
                    type="button"
                ><svg
                    className="h-6 w-6"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={2}
                    viewBox="0 0 24 24"
                >
                        <circle cx="12" cy="12" r="10" />
                        <path
                            d="M8 14s1.5 2 4 2 4-2 4-2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        />
                        <path d="M9 9h.01M15 9h.01" strokeLinecap="round" />
                    </svg>
                </button>

                {/* Add Entry label */}
                <span
                    className={`absolute bottom-0 left-0 -translate-x-20 translate-y-4 whitespace-nowrap rounded-full bg-(--color-surface) px-3 py-1 text-xs font-medium text-(--color-text-secondary) shadow-md transition-all duration-300 ${isOpen
                        ? "scale-100 -translate-x-20 -translate-y-16 opacity-100 delay-150"
                        : "scale-0 translate-x-0 translate-y-0 opacity-0"
                        }`}
                    style={{
                        transitionTimingFunction: "cubic-bezier(0.34, 1.56, 0.64, 1)",
                    }}
                >
                    Comida
                </span>

                {/* Add Symptom button (top-right position) */}
                <button
                    aria-label="Registrar un nuevo síntoma"
                    className={`absolute bottom-0 left-0 flex h-14 w-14 items-center justify-center rounded-full border-2 border-(--color-border) bg-(--color-surface) text-(--color-brand-600) shadow-lg transition-all duration-300 hover:scale-110 hover:border-(--color-brand-500) hover:shadow-xl ${isOpen
                        ? "scale-100 translate-x-20 -translate-y-20 opacity-100 delay-150"
                        : "scale-0 translate-x-0 translate-y-0 opacity-0"
                        }`}
                    onClick={handleAddSymptom}
                    style={{
                        transitionTimingFunction: "cubic-bezier(0.34, 1.56, 0.64, 1)",
                    }}
                    type="button"
                >
                    <svg
                        className="h-6 w-6"
                        fill="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path d="M9 2h6v7h7v6h-7v7H9v-7H2V9h7V2z" />
                    </svg>
                </button>

                {/* Add Symptom label */}
                <span
                    className={`absolute bottom-0 left-0 translate-x-20 translate-y-4 whitespace-nowrap rounded-full bg-(--color-surface) px-3 py-1 text-xs font-medium text-(--color-text-secondary) shadow-md transition-all duration-300 ${isOpen
                        ? "scale-100 translate-x-20 -translate-y-16 opacity-100 delay-150"
                        : "scale-0 translate-x-0 translate-y-0 opacity-0"
                        }`}
                    style={{
                        transitionTimingFunction: "cubic-bezier(0.34, 1.56, 0.64, 1)",
                    }}
                >
                    Síntoma
                </span>

                {/* Main FAB button */}
                <button
                    aria-label={isOpen ? "Cerrar menú de acciones" : "Abrir menú de acciones"}
                    className={`relative flex h-16 w-16 items-center justify-center rounded-full bg-(--color-brand-600) text-white shadow-2xl transition-all duration-300 hover:bg-(--color-brand-700) hover:scale-110 hover:shadow-[0_20px_60px_-15px_rgba(0,0,0,0.4)] active:scale-95 ${isOpen ? "rotate-45" : "rotate-0"
                        }`}
                    onClick={handleToggle}
                    type="button"
                >
                    <svg
                        className="h-8 w-8"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth={2.5}
                        viewBox="0 0 24 24"
                    >
                        <path
                            d="M12 4.5v15m7.5-7.5h-15"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        />
                    </svg>
                </button>
            </div>
        </div>
    );
}
