import { useCallback, useEffect, useMemo, useState } from "react";
import { getUserIdFromToken } from "../services/currentUser";
import {
    DEFAULT_LAYOUT,
    isKnownWidgetType,
    WIDGET_SIZES,
} from "../components/widgets/registry";

const STORAGE_PREFIX = "dashboard:layout:";

function newId() {
    if (typeof crypto !== "undefined" && crypto.randomUUID) {
        return crypto.randomUUID();
    }
    return `w_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

function hydrate(raw) {
    if (!Array.isArray(raw)) return null;
    const cleaned = raw
        .filter((w) => w && isKnownWidgetType(w.type))
        .map((w) => ({
            id: w.id || newId(),
            type: w.type,
            size: WIDGET_SIZES.includes(w.size) ? w.size : "medium",
        }));
    return cleaned.length ? cleaned : null;
}

function defaultLayout() {
    return DEFAULT_LAYOUT.map((w) => ({ ...w, id: newId() }));
}

export function useDashboardLayout() {
    const storageKey = useMemo(
        () => `${STORAGE_PREFIX}${getUserIdFromToken() || "default"}`,
        [],
    );

    const [layout, setLayout] = useState(() => {
        try {
            const stored = localStorage.getItem(storageKey);
            if (stored) {
                const parsed = hydrate(JSON.parse(stored));
                if (parsed) return parsed;
            }
        } catch {
            /* ignore */
        }
        return defaultLayout();
    });

    useEffect(() => {
        try {
            localStorage.setItem(storageKey, JSON.stringify(layout));
        } catch {
            /* ignore quota errors */
        }
    }, [storageKey, layout]);

    const addWidget = useCallback((type, size = "medium") => {
        if (!isKnownWidgetType(type)) return;
        setLayout((prev) => [...prev, { id: newId(), type, size }]);
    }, []);

    const removeWidget = useCallback((id) => {
        setLayout((prev) => prev.filter((w) => w.id !== id));
    }, []);

    const replaceWidget = useCallback((id, type) => {
        if (!isKnownWidgetType(type)) return;
        setLayout((prev) =>
            prev.map((w) => (w.id === id ? { ...w, type } : w)),
        );
    }, []);

    const setWidgetSize = useCallback((id, size) => {
        if (!WIDGET_SIZES.includes(size)) return;
        setLayout((prev) =>
            prev.map((w) => (w.id === id ? { ...w, size } : w)),
        );
    }, []);

    const moveWidget = useCallback((id, direction) => {
        setLayout((prev) => {
            const index = prev.findIndex((w) => w.id === id);
            if (index === -1) return prev;
            const target = direction === "up" ? index - 1 : index + 1;
            if (target < 0 || target >= prev.length) return prev;
            const next = [...prev];
            [next[index], next[target]] = [next[target], next[index]];
            return next;
        });
    }, []);

    const resetLayout = useCallback(() => {
        setLayout(defaultLayout());
    }, []);

    return {
        layout,
        addWidget,
        removeWidget,
        replaceWidget,
        setWidgetSize,
        moveWidget,
        resetLayout,
    };
}
