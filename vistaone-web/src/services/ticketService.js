import { authFetch } from "./apiClient";

const TICKET_ENDPOINT = "/tickets";

export const ticketService = {
  getAll: async (params = {}) => {
    const query = new URLSearchParams();
    if (params.work_order_id) query.append("work_order_id", params.work_order_id);
    if (params.vendor_id) query.append("vendor_id", params.vendor_id);
    if (params.status) query.append("status", params.status);
    const qs = query.toString();
    const url = qs ? `${TICKET_ENDPOINT}?${qs}` : TICKET_ENDPOINT;
    const response = await authFetch(url, { method: "GET" });
    if (!response.ok) throw new Error("Failed to fetch tickets");
    return await response.json();
  },

  getById: async (ticketId) => {
    const response = await authFetch(`${TICKET_ENDPOINT}/${ticketId}`, {
      method: "GET",
    });
    if (!response.ok) throw new Error("Failed to fetch ticket");
    return await response.json();
  },

  approve: async (ticketId) => {
    const response = await authFetch(
      `${TICKET_ENDPOINT}/${ticketId}/approve`,
      { method: "PUT" },
    );
    if (!response.ok) throw new Error("Failed to approve ticket");
    return await response.json();
  },

  reject: async (ticketId) => {
    const response = await authFetch(
      `${TICKET_ENDPOINT}/${ticketId}/reject`,
      { method: "PUT" },
    );
    if (!response.ok) throw new Error("Failed to reject ticket");
    return await response.json();
  },

  setPending: async (ticketId) => {
    const response = await authFetch(
      `${TICKET_ENDPOINT}/${ticketId}/set-pending`,
      { method: "PUT" },
    );
    if (!response.ok) throw new Error("Failed to set ticket to pending approval");
    return await response.json();
  },
};
