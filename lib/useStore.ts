"use client";
import { useState, useEffect, useCallback } from "react";
import api from "@/lib/api";
import type { Store } from "@/types";

/**
 * Decodes the JWT payload without verification (client-side only).
 * Returns the `sub` claim (user UUID) or null.
 */
function getJwtSub(): string | null {
    if (typeof window === "undefined") return null;
    try {
        const token = localStorage.getItem("access_token");
        if (!token) return null;
        const payload = token.split(".")[1];
        const decoded = JSON.parse(atob(payload));
        // Keycloak typically uses `sub` as the user UUID
        return (decoded.sub as string) ?? null;
    } catch {
        return null;
    }
}
export function useSellerStore() {
    const [store, setStore] = useState<Store | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const resolve = useCallback(async () => {
        setLoading(true);
        setError(null);

        const sub = getJwtSub();
        const cached = localStorage.getItem("store_id");

        try {
            // ── 1. Try cached store ID first ────────────────────────────────────
            if (cached) {
                const res = await api.get<Store>(`/api/v1/stores/${cached}`);
                const s = res.data;
                // Verify it actually belongs to this user
                if (!sub || s.storeOwnerId === sub) {
                    setStore(s);
                    setLoading(false);
                    return;
                }
                // Mismatch — clear bad cache and fall through
                localStorage.removeItem("store_id");
            }

            // ── 2. Try /api/v1/stores/owner/{ownerId} ───────────────────────────
            if (sub) {
                try {
                    const res = await api.get<Store[]>(`/api/v1/stores/owner/${sub}`);
                    const list = Array.isArray(res.data) ? res.data : [];
                    if (list.length > 0) {
                        const s = list[0];
                        setStore(s);
                        localStorage.setItem("store_id", s.id);
                        setLoading(false);
                        return;
                    }
                } catch {
                    // Endpoint may not exist on this backend version — fall through
                }
            }

            // ── 3. Fallback: GET /api/v1/stores (own stores via SELLER role) ────
            //    The backend filters by the authenticated seller's stores
            //    when the SELLER role is present on the Spring Security context.
            try {
                const res = await api.get<{ content?: Store[]; totalElements?: number } | Store[]>(
                    `/api/v1/stores`,
                    { params: { size: 5 } }
                );
                const raw = res.data;
                const list = Array.isArray(raw)
                    ? raw
                    : ((raw as { content?: Store[] }).content ?? []);

                // Filter by sub if we can
                const owned = sub
                    ? list.filter((s) => !s.storeOwnerId || s.storeOwnerId === sub)
                    : list;

                if (owned.length > 0) {
                    const s = owned[0];
                    setStore(s);
                    localStorage.setItem("store_id", s.id);
                } else {
                    setError("No store found. Please create one first.");
                }
            } catch (e: unknown) {
                const msg = (e as { response?: { data?: { message?: string } } })
                    ?.response?.data?.message;
                setError(msg ?? "Failed to load your store.");
            }
        } catch (e: unknown) {
            const msg = (e as { response?: { data?: { message?: string } } })
                ?.response?.data?.message;
            setError(msg ?? "Failed to load your store.");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        void resolve();
    }, [resolve]);

    /** Call this after creating/updating the store to refresh. */
    const refresh = useCallback(() => {
        localStorage.removeItem("store_id");
        resolve();
    }, [resolve]);

    const storeId = store?.id ?? "";
    return { store, storeId, loading, error, setStore, refresh };
}
