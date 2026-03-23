import { useInfiniteQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";

import { getProblemMessage } from "../../lib/api";
import { listEntries } from "../entries/entries";
import type { FoodEvent, SymptomEvent } from "../events/events";
import { listSymptomEvents } from "../symptoms/symptoms";
import { EditEntryModal } from "./EditEntryModal";

const PAGE_LIMIT = 50;

interface DateGroup {
    dateKey: string;
    foods: FoodEvent[];
    symptoms: SymptomEvent[];
}

function toLocalDateKey(isoValue: string): string {
    return new Intl.DateTimeFormat("en-CA", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric"
    }).format(new Date(isoValue));
}

function formatDateHeading(dateKey: string): string {
    return new Intl.DateTimeFormat(undefined, {
        day: "numeric",
        month: "long",
        weekday: "long",
        year: "numeric"
    }).format(new Date(`${dateKey}T12:00:00`));
}

function formatTime(isoValue: string): string {
    return new Intl.DateTimeFormat(undefined, { timeStyle: "short" }).format(
        new Date(isoValue)
    );
}

function buildDateGroups(foods: FoodEvent[], symptoms: SymptomEvent[]): DateGroup[] {
    const map = new Map<string, DateGroup>();

    for (const food of foods) {
        const key = toLocalDateKey(food.consumed_at);
        if (!map.has(key)) map.set(key, { dateKey: key, foods: [], symptoms: [] });
        map.get(key)!.foods.push(food);
    }

    for (const symptom of symptoms) {
        const key = toLocalDateKey(symptom.occurred_at);
        if (!map.has(key)) map.set(key, { dateKey: key, foods: [], symptoms: [] });
        map.get(key)!.symptoms.push(symptom);
    }

    return Array.from(map.values()).sort((a, b) => b.dateKey.localeCompare(a.dateKey));
}

function severityLabel(severity: number): string {
    const labels: Record<number, string> = {
        1: "Muy leve",
        2: "Leve",
        3: "Moderado",
        4: "Severo",
        5: "Muy severo"
    };
    return labels[severity] ?? String(severity);
}

function FoodCard({ food, onClick }: { food: FoodEvent; onClick: () => void }) {
    return (
        <button
            className="w-full rounded-xl border border-(--color-border) bg-(--color-surface) p-3 text-left transition-colors hover:border-(--color-brand-500) hover:bg-(--color-surface-hover)"
            onClick={onClick}
            type="button"
        >
            <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                    <span className="block text-xs font-semibold tracking-wide text-(--color-brand-600) uppercase">
                        {food.meal_category_code}
                    </span>
                    <h3 className="truncate font-semibold leading-snug">{food.food_name}</h3>
                </div>
                <span className="shrink-0 text-xs text-(--color-text-tertiary)">
                    {formatTime(food.consumed_at)}
                </span>
            </div>
            {food.notes ? (
                <p className="mt-1.5 line-clamp-2 text-xs text-(--color-text-secondary)">
                    {food.notes}
                </p>
            ) : null}
        </button>
    );
}

function SymptomCard({ symptom }: { symptom: SymptomEvent }) {
    return (
        <article className="rounded-xl border border-(--color-border) bg-(--color-surface) p-3">
            <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                    <h3 className="truncate font-semibold leading-snug">{symptom.symptom_code}</h3>
                    <span className="text-xs text-(--color-text-secondary)">
                        {severityLabel(symptom.severity)}
                    </span>
                </div>
                <span className="shrink-0 text-xs text-(--color-text-tertiary)">
                    {formatTime(symptom.occurred_at)}
                </span>
            </div>
            {symptom.notes ? (
                <p className="mt-1.5 line-clamp-2 text-xs text-(--color-text-secondary)">
                    {symptom.notes}
                </p>
            ) : null}
        </article>
    );
}

export function HistoryPage() {
    const [selectedFood, setSelectedFood] = useState<FoodEvent | null>(null);

    const foodQuery = useInfiniteQuery({
        queryKey: ["history", "foods"],
        queryFn: ({ pageParam }) =>
            listEntries({ limit: PAGE_LIMIT, cursor: pageParam ?? undefined }),
        initialPageParam: null as string | null,
        getNextPageParam: (lastPage) =>
            lastPage.page.has_more ? lastPage.page.next_cursor : undefined
    });

    const symptomQuery = useInfiniteQuery({
        queryKey: ["history", "symptoms"],
        queryFn: ({ pageParam }) =>
            listSymptomEvents({ limit: PAGE_LIMIT, cursor: pageParam ?? undefined }),
        initialPageParam: null as string | null,
        getNextPageParam: (lastPage) =>
            lastPage.page.has_more ? lastPage.page.next_cursor : undefined
    });

    const foods = foodQuery.data?.pages.flatMap((p) => p.data) ?? [];
    const symptoms = symptomQuery.data?.pages.flatMap((p) => p.data) ?? [];
    const dateGroups = useMemo(() => buildDateGroups(foods, symptoms), [foods, symptoms]);

    const isLoading = foodQuery.isLoading || symptomQuery.isLoading;
    const hasMore = foodQuery.hasNextPage || symptomQuery.hasNextPage;
    const isFetchingMore = foodQuery.isFetchingNextPage || symptomQuery.isFetchingNextPage;

    const foodError = foodQuery.error
        ? getProblemMessage(foodQuery.error, "No se pudieron cargar los alimentos.")
        : null;
    const symptomError = symptomQuery.error
        ? getProblemMessage(symptomQuery.error, "No se pudieron cargar los síntomas.")
        : null;

    function handleLoadMore() {
        if (foodQuery.hasNextPage) void foodQuery.fetchNextPage();
        if (symptomQuery.hasNextPage) void symptomQuery.fetchNextPage();
    }

    return (
        <div className="mx-auto max-w-5xl px-4 py-6 sm:px-6">
            <div className="mb-6">
                <h1 className="text-2xl font-bold">Historial</h1>
                <p className="mt-0.5 text-sm text-(--color-text-secondary)">
                    Registro cronológico de alimentos y síntomas.
                </p>
            </div>

            {foodError ? (
                <p className="mb-4 rounded-xl bg-(--color-error-bg) px-3.5 py-2.5 text-sm text-(--color-error)">
                    {foodError}
                </p>
            ) : null}
            {symptomError ? (
                <p className="mb-4 rounded-xl bg-(--color-error-bg) px-3.5 py-2.5 text-sm text-(--color-error)">
                    {symptomError}
                </p>
            ) : null}

            {isLoading ? (
                <p className="py-12 text-center text-sm text-(--color-text-tertiary)">
                    Cargando historial...
                </p>
            ) : (
                <>
                    <div className="mb-3 grid grid-cols-2 gap-4 border-b border-(--color-border) pb-2">
                        <span className="text-sm font-semibold text-(--color-text-secondary)">
                            Alimentos
                        </span>
                        <span className="text-sm font-semibold text-(--color-text-secondary)">
                            Síntomas
                        </span>
                    </div>

                    {dateGroups.length === 0 ? (
                        <p className="py-12 text-center text-sm text-(--color-text-tertiary)">
                            No hay registros todavía.
                        </p>
                    ) : (
                        <div className="space-y-2">
                            {dateGroups.map((group) => (
                                <div key={group.dateKey}>
                                    <div className="relative my-5">
                                        <div aria-hidden className="absolute inset-0 flex items-center">
                                            <div className="w-full border-t border-(--color-border)" />
                                        </div>
                                        <div className="relative flex justify-center">
                                            <span className="bg-(--color-surface-alt) px-3 text-xs font-semibold uppercase tracking-wide text-(--color-text-tertiary)">
                                                {formatDateHeading(group.dateKey)}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 items-start gap-4">
                                        <div className="space-y-3">
                                            {group.foods.map((food) => (
                                                <FoodCard
                                                    food={food}
                                                    key={food.id}
                                                    onClick={() => setSelectedFood(food)}
                                                />
                                            ))}
                                        </div>
                                        <div className="space-y-3">
                                            {group.symptoms.map((symptom) => (
                                                <SymptomCard key={symptom.id} symptom={symptom} />
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {hasMore ? (
                        <button
                            className="mt-6 w-full rounded-xl border border-(--color-border) py-2.5 text-sm font-medium text-(--color-text-secondary) transition-colors hover:border-(--color-brand-500) hover:text-(--color-brand-600) disabled:opacity-50"
                            disabled={isFetchingMore}
                            onClick={handleLoadMore}
                            type="button"
                        >
                            {isFetchingMore ? "Cargando..." : "Cargar más"}
                        </button>
                    ) : null}
                </>
            )}

            <EditEntryModal
                entry={selectedFood}
                onClose={() => setSelectedFood(null)}
            />
        </div>
    );
}
