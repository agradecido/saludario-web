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

  function handleClose() {
    setIsOpen(false);
  }

  return (
    <div
      aria-expanded={isOpen}
      className="fixed bottom-8 right-8 z-50"
      role="menu"
    >
      {/* Overlay backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 -z-10 bg-black/20 backdrop-blur-sm transition-opacity duration-300"
          onClick={handleClose}
        />
      )}

      {/* Satellite buttons container */}
      <div className="relative">
        {/* Add Entry button (top-left position) */}
        <button
          aria-label="Añadir nueva entrada de comida o bebida"
          className={`absolute bottom-0 right-0 flex h-14 w-14 items-center justify-center rounded-full border-2 border-(--color-border) bg-(--color-surface) text-(--color-brand-600) shadow-lg transition-all duration-300 hover:scale-110 hover:border-(--color-brand-500) hover:shadow-xl ${
            isOpen
              ? "scale-100 -translate-x-20 -translate-y-20 opacity-100 delay-150"
              : "scale-0 translate-x-0 translate-y-0 opacity-0"
          }`}
          onClick={handleAddEntry}
          style={{
            transitionTimingFunction: "cubic-bezier(0.34, 1.56, 0.64, 1)",
          }}
          type="button"
        >
          <svg
            className="h-6 w-6"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            viewBox="0 0 24 24"
          >
            <path
              d="M12 8v13m0-13V6a2 2 0 012-2h.01M12 8H9.5a2 2 0 00-2 2v.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M16 14a4 4 0 11-8 0 4 4 0 018 0z"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>

        {/* Add Symptom button (top position) */}
        <button
          aria-label="Registrar un nuevo síntoma"
          className={`absolute bottom-0 right-0 flex h-14 w-14 items-center justify-center rounded-full border-2 border-(--color-border) bg-(--color-surface) text-(--color-brand-600) shadow-lg transition-all duration-300 hover:scale-110 hover:border-(--color-brand-500) hover:shadow-xl ${
            isOpen
              ? "scale-100 -translate-y-24 opacity-100 delay-100"
              : "scale-0 translate-y-0 opacity-0"
          }`}
          onClick={handleAddSymptom}
          style={{
            transitionTimingFunction: "cubic-bezier(0.34, 1.56, 0.64, 1)",
          }}
          type="button"
        >
          <svg
            className="h-6 w-6"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            viewBox="0 0 24 24"
          >
            <path
              d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>

        {/* Close button (top-right position) */}
        <button
          aria-label="Cerrar menú de acciones"
          className={`absolute bottom-0 right-0 flex h-14 w-14 items-center justify-center rounded-full border-2 border-(--color-border) bg-(--color-surface) text-(--color-text-secondary) shadow-lg transition-all duration-300 hover:scale-110 hover:border-(--color-border) hover:text-(--color-text-primary) hover:shadow-xl ${
            isOpen
              ? "scale-100 translate-x-20 -translate-y-20 opacity-100 delay-75"
              : "scale-0 translate-x-0 translate-y-0 opacity-0"
          }`}
          onClick={handleClose}
          style={{
            transitionTimingFunction: "cubic-bezier(0.34, 1.56, 0.64, 1)",
          }}
          type="button"
        >
          <svg
            className="h-6 w-6"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            viewBox="0 0 24 24"
          >
            <path
              d="M6 18L18 6M6 6l12 12"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>

        {/* Main FAB button */}
        <button
          aria-label={isOpen ? "Cerrar menú de acciones" : "Abrir menú de acciones"}
          className={`relative flex h-16 w-16 items-center justify-center rounded-full bg-(--color-brand-600) text-white shadow-2xl transition-all duration-300 hover:bg-(--color-brand-700) hover:scale-110 hover:shadow-[0_20px_60px_-15px_rgba(0,0,0,0.4)] active:scale-95 ${
            isOpen ? "rotate-45" : "rotate-0"
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
