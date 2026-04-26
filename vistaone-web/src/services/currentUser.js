import { authFetch } from "./apiClient";

/**
 * Decode the `sub` claim from the JWT in localStorage.
 * Used to namespace per-user UI state (e.g. dashboard layout) without an
 * extra network round-trip. Returns null if no/invalid token.
 */
export function getUserIdFromToken() {
    const token = localStorage.getItem("authToken");
    if (!token) return null;
    const parts = token.split(".");
    if (parts.length !== 3) return null;
    try {
        const payload = JSON.parse(
            atob(parts[1].replace(/-/g, "+").replace(/_/g, "/")),
        );
        return payload?.sub || null;
    } catch {
        return null;
    }
}

let cachedUser = null;
let inflight = null;

/** Fetch /users/me with simple in-memory caching for the session. */
export async function fetchCurrentUser() {
    if (cachedUser) return cachedUser;
    if (inflight) return inflight;
    inflight = authFetch("/users/me", { method: "GET" })
        .then(async (res) => {
            if (!res.ok) throw new Error("Failed to load current user");
            cachedUser = await res.json();
            return cachedUser;
        })
        .finally(() => {
            inflight = null;
        });
    return inflight;
}

export function clearCurrentUserCache() {
    cachedUser = null;
}
