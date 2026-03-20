import { X } from "lucide-react";
import { useEffect, useRef, type ReactNode } from "react";

interface ModalProps {
    children: ReactNode;
    onClose: () => void;
    open: boolean;
    title: string;
}

export function Modal({ children, onClose, open, title }: ModalProps) {
    const overlayRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!open) return;

        function handleKeyDown(event: KeyboardEvent) {
            if (event.key === "Escape") {
                onClose();
            }
        }

        document.addEventListener("keydown", handleKeyDown);
        document.body.style.overflow = "hidden";

        return () => {
            document.removeEventListener("keydown", handleKeyDown);
            document.body.style.overflow = "";
        };
    }, [open, onClose]);

    if (!open) return null;

    return (
        <div
            ref={overlayRef}
            className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 backdrop-blur-sm sm:items-center"
            onClick={(e) => {
                if (e.target === overlayRef.current) onClose();
            }}
        >
            <div className="w-full max-w-lg rounded-t-2xl bg-(--color-surface) p-6 shadow-xl sm:rounded-2xl sm:m-4">
                <div className="mb-5 flex items-center justify-between">
                    <h2 className="text-lg font-semibold">{title}</h2>
                    <button
                        aria-label="Cerrar"
                        className="flex h-8 w-8 items-center justify-center rounded-full text-(--color-text-tertiary) transition-colors hover:bg-(--color-surface-hover) hover:text-(--color-text)"
                        onClick={onClose}
                        type="button"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>
                {children}
            </div>
        </div>
    );
}
