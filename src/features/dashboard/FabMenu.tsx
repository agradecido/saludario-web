import { useQuery } from "@tanstack/react-query";
import { Activity, ArrowLeft, Coffee, Cookie, Plus, UtensilsCrossed } from "lucide-react";
import { type ReactElement, useState } from "react";

import { categoriesQueryOptions, fallbackCategories } from "../categories/categories";

type MenuState = "closed" | "main" | "food";

type FoodCategory = "breakfast" | "lunch" | "dinner" | "snack";

// Spanish labels and icons for food categories
const FOOD_CATEGORY_META: Record<
    FoodCategory,
    {
        icon: ReactElement;
        label: string;
        position: { x: number; y: number };
    }
> = {
    breakfast: {
        label: "Desayuno",
        position: { x: -80, y: -88 },
        icon: <Coffee className="h-5 w-5" />
    },
    lunch: {
        label: "Comida",
        position: { x: -32, y: -120 },
        icon: <UtensilsCrossed className="h-5 w-5" />
    },
    dinner: {
        label: "Cena",
        position: { x: 32, y: -120 },
        icon: <UtensilsCrossed className="h-5 w-5" />
    },
    snack: {
        label: "Snack",
        position: { x: 80, y: -88 },
        icon: <Cookie className="h-5 w-5" />
    }
} as const;

interface FabMenuProps {
    onAddEntry: (category?: FoodCategory) => void;
    onAddSymptom: () => void;
}

export function FabMenu({ onAddEntry, onAddSymptom }: FabMenuProps) {
    const [menuState, setMenuState] = useState<MenuState>("closed");

    // Fetch categories from API
    const categoriesQuery = useQuery(categoriesQueryOptions());
    const categories = categoriesQuery.data?.data ?? fallbackCategories;

    function handleToggle() {
        setMenuState(menuState === "closed" ? "main" : "closed");
    }

    function handleFoodClick() {
        setMenuState("food");
    }

    function handleSymptomClick() {
        onAddSymptom();
        setMenuState("closed");
    }

    function handleBack() {
        setMenuState("main");
    }

    function handleFoodCategorySelect(category: FoodCategory) {
        onAddEntry(category);
        setMenuState("closed");
    }

    const isOpen = menuState !== "closed";

    return (
        <div
            aria-expanded={isOpen}
            className="fixed bottom-8 left-1/2 z-50 -translate-x-1/2"
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
            <div className="relative flex h-16 w-16 items-center justify-center">
                {/* LEVEL 1: Main menu options */}
                {menuState === "main" && (
                    <>
                        {/* Food button (left) */}
                        <div
                            className="absolute left-1/2 top-1/2 flex flex-col items-center gap-2"
                            style={{ transform: "translate(calc(-50% - 80px), calc(-50% - 96px))" }}
                        >
                            <button
                                aria-label="Añadir comida o bebida"
                                className="flex h-14 w-14 scale-100 items-center justify-center rounded-full border-2 border-(--color-border) bg-(--color-surface) text-(--color-brand-600) opacity-100 shadow-lg transition-all delay-150 duration-300 hover:scale-110 hover:border-(--color-brand-500) hover:shadow-xl"
                                onClick={handleFoodClick}
                                style={{
                                    transitionTimingFunction: "cubic-bezier(0.34, 1.56, 0.64, 1)",
                                }}
                                type="button"
                            >
                                <UtensilsCrossed className="h-6 w-6" />
                            </button>
                            <span
                                className="scale-100 whitespace-nowrap rounded-full bg-(--color-surface) px-3 py-1 text-xs font-medium text-(--color-text-secondary) opacity-100 shadow-md transition-all delay-150 duration-300"
                                style={{
                                    transitionTimingFunction: "cubic-bezier(0.34, 1.56, 0.64, 1)",
                                }}
                            >
                                Comida
                            </span>
                        </div>

                        {/* Symptom button (right) */}
                        <div
                            className="absolute left-1/2 top-1/2 flex flex-col items-center gap-2"
                            style={{ transform: "translate(calc(-50% + 80px), calc(-50% - 96px))" }}
                        >
                            <button
                                aria-label="Registrar síntoma"
                                className="flex h-14 w-14 scale-100 items-center justify-center rounded-full border-2 border-(--color-border) bg-(--color-surface) text-(--color-brand-600) opacity-100 shadow-lg transition-all delay-150 duration-300 hover:scale-110 hover:border-(--color-brand-500) hover:shadow-xl"
                                onClick={handleSymptomClick}
                                style={{
                                    transitionTimingFunction: "cubic-bezier(0.34, 1.56, 0.64, 1)",
                                }}
                                type="button"
                            >
                                <Activity className="h-6 w-6" />
                            </button>
                            <span
                                className="scale-100 whitespace-nowrap rounded-full bg-(--color-surface) px-3 py-1 text-xs font-medium text-(--color-text-secondary) opacity-100 shadow-md transition-all delay-150 duration-300"
                                style={{
                                    transitionTimingFunction: "cubic-bezier(0.34, 1.56, 0.64, 1)",
                                }}
                            >
                                Síntoma
                            </span>
                        </div>
                    </>
                )}

                {/* LEVEL 2: Food categories submenu */}
                {menuState === "food" && (
                    <>
                        {categories
                            .sort((a, b) => a.sort_order - b.sort_order)
                            .map((category) => {
                                const meta = FOOD_CATEGORY_META[category.code];
                                if (!meta) return null;

                                const delay = 100 + category.sort_order * 50;

                                return (
                                    <div
                                        key={category.code}
                                        className="absolute left-1/2 top-1/2 flex flex-col items-center gap-1.5"
                                        style={{
                                            transform: `translate(calc(-50% + ${meta.position.x}px), calc(-50% + ${meta.position.y}px))`
                                        }}
                                    >
                                        <button
                                            aria-label={meta.label}
                                            className="flex h-12 w-12 scale-100 items-center justify-center rounded-full border-2 border-(--color-border) bg-(--color-surface) text-(--color-brand-600) opacity-100 shadow-lg transition-all duration-300 hover:scale-110 hover:border-(--color-brand-500) hover:shadow-xl"
                                            onClick={() => handleFoodCategorySelect(category.code)}
                                            style={{
                                                transitionDelay: `${delay}ms`,
                                                transitionTimingFunction: "cubic-bezier(0.34, 1.56, 0.64, 1)"
                                            }}
                                            type="button"
                                        >
                                            {meta.icon}
                                        </button>
                                        <span
                                            className="scale-100 whitespace-nowrap rounded-full bg-(--color-surface) px-2 py-0.5 text-[10px] font-medium text-(--color-text-secondary) opacity-100 shadow-md transition-all duration-300"
                                            style={{
                                                transitionDelay: `${delay}ms`
                                            }}
                                        >
                                            {meta.label}
                                        </span>
                                    </div>
                                );
                            })}

                        {/* Back button */}
                        <button
                            aria-label="Volver"
                            className="absolute left-1/2 top-1/2 flex h-10 w-10 scale-100 items-center justify-center rounded-full border-2 border-(--color-border) bg-(--color-surface) text-(--color-text-secondary) opacity-100 shadow-md transition-all delay-75 duration-300 hover:scale-110 hover:text-(--color-text-primary)"
                            onClick={handleBack}
                            style={{
                                transform: "translate(-50%, calc(-50% - 68px))",
                                transitionTimingFunction: "cubic-bezier(0.34, 1.56, 0.64, 1)"
                            }}
                            type="button"
                        >
                            <ArrowLeft className="h-4 w-4" />
                        </button>
                    </>
                )}



                {/* Main FAB button */}
                <button
                    aria-label={isOpen ? "Cerrar menú de acciones" : "Abrir menú de acciones"}
                    className={`relative flex h-16 w-16 items-center justify-center rounded-full bg-(--color-brand-600) text-white shadow-2xl transition-all duration-300 hover:bg-(--color-brand-700) hover:scale-110 hover:shadow-[0_20px_60px_-15px_rgba(0,0,0,0.4)] active:scale-95 ${isOpen ? "rotate-45" : "rotate-0"
                        }`}
                    onClick={handleToggle}
                    type="button"
                >
                    <Plus className="h-8 w-8" strokeWidth={2.5} />
                </button>
            </div>
        </div>
    );
}
