// src/utils/api.js
const API_BASE = import.meta?.env?.VITE_API_BASE_URL || "http://localhost:4000";

export function getAuthHeaders() {
    const token = localStorage.getItem("token");
    return token ? { Authorization: `Bearer ${token}` } : {};
}

/**
 * apiFetch("/api/notifications?role=admin")
 * apiFetch("/api/notifications/read-all", { method: "PATCH" })
 */
export async function apiFetch(path, { method = "GET", body } = {}) {
    const res = await fetch(`${API_BASE}${path}`, {
        method,
        headers: {
            "Content-Type": "application/json",
            ...getAuthHeaders(),
        },
        body: body ? JSON.stringify(body) : undefined,
    });

    const text = await res.text();
    let data = null;

    try {
        data = text ? JSON.parse(text) : null;
    } catch {
        data = text || null;
    }

    if (!res.ok) {
        const msg =
            (data && data.message) ||
            (typeof data === "string" && data) ||
            `Request failed: ${res.status}`;
        throw new Error(msg);
    }

    return data;
}
