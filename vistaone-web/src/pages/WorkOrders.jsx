import React, { useEffect, useMemo, useState } from "react";
import AppShell from "../components/AppShell";
import { useWorkOrder } from "../hooks/useWorkOrder";
import CreateWorkOrderModal from "../components/CreateWorkOrderModal";
import { ticketService } from "../services/ticketService";
import "../styles/workorder.css";

const statusOptions = [
  { value: "ALL", label: "All" },
  { value: "UNASSIGNED", label: "Unassigned" },
  { value: "ASSIGNED", label: "Assigned" },
  { value: "APPROVED", label: "Approved" },
  { value: "CANCELLED", label: "Cancelled" },
  { value: "IN_PROGRESS", label: "In Progress" },
  { value: "COMPLETED", label: "Completed" },
  { value: "CLOSED", label: "Closed" },
];

export default function WorkOrders() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [showModal, setShowModal] = useState(false);
  const [expanded, setExpanded] = useState(() => new Set());
  const [ticketsByWO, setTicketsByWO] = useState({});
  const [ticketsLoading, setTicketsLoading] = useState(() => new Set());
  const [ticketsError, setTicketsError] = useState({});
  const {
    workOrders,
    loading,
    fetchWorkOrders,
    // createWorkOrder,
    // updateWorkOrder,
    // removeWorkOrder
  } = useWorkOrder();

  const toggleExpand = async (workOrder) => {
    const id = workOrder.id;
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
    if (ticketsByWO[id] !== undefined || ticketsLoading.has(id)) return;
    setTicketsLoading((prev) => new Set(prev).add(id));
    try {
      const tickets = await ticketService.getAll({ work_order_id: id });
      setTicketsByWO((prev) => ({ ...prev, [id]: tickets }));
    } catch (err) {
      setTicketsError((prev) => ({ ...prev, [id]: err.message || "Failed to load tickets" }));
    } finally {
      setTicketsLoading((prev) => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
    }
  };

  useEffect(() => {
    fetchWorkOrders();
  }, [fetchWorkOrders]);

  const filteredOrders = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase();
    return workOrders.filter((order) => {
      const matchesStatus =
        statusFilter === "ALL" ||
        (order.status && order.status === statusFilter);
      // Search by description, location, or work_order_id
      const matchesSearch =
        order.description?.toLowerCase().includes(normalizedSearch) ||
        order.location_type?.toLowerCase().includes(normalizedSearch) ||
        order.work_order_id?.toLowerCase().includes(normalizedSearch);
      return matchesStatus && matchesSearch;
    });
  }, [workOrders, searchTerm, statusFilter]);

  const handleOpenModal = () => setShowModal(true);

  const formatDate = (dateString) =>
    new Date(dateString).toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });

  const formatStatusLabel = (status) => status.replace("_", " ");

  return (
    <AppShell
      title="Work Orders"
      subtitle="Manage field work orders"
      loading={loading}
      loadingText="Loading work orders..."
    >
      <section className="workorders-controls">
        <input
          type="search"
          className="workorders-search"
          placeholder="Search"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <select
          className="workorders-filter"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          {statusOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </section>

      <button
        className="fab-create-workorder"
        onClick={handleOpenModal}
        title="Create Work Order"
      >
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <circle cx="12" cy="12" r="12" fill="#007bff" />
          <rect x="11" y="6" width="2" height="12" rx="1" fill="#fff" />
          <rect x="6" y="11" width="12" height="2" rx="1" fill="#fff" />
        </svg>
        <span className="fab-label">Create Work Order</span>
      </button>

      <section className="workorders-table-wrap">
        {loading ? (
          <div className="workorders-state">Loading work orders...</div>
        ) : filteredOrders.length === 0 ? (
          <div className="workorders-state">No work orders found</div>
        ) : (
          <table className="workorders-table">
            <thead>
              <tr>
                <th style={{ width: 32 }}></th>
                <th>Order ID</th>
                <th>Vendor</th>
                <th>Job Type</th>
                <th>Location Type</th>
                <th>Location</th>
                <th>Date</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.map((order) => {
                const isOpen = expanded.has(order.id);
                const tickets = ticketsByWO[order.id];
                const isLoadingTickets = ticketsLoading.has(order.id);
                const loadError = ticketsError[order.id];
                return (
                  <React.Fragment key={order.work_order_id}>
                    <tr>
                      <td>
                        <button
                          type="button"
                          className="workorders-expand-btn"
                          aria-label={isOpen ? "Collapse tickets" : "Expand tickets"}
                          aria-expanded={isOpen}
                          onClick={() => toggleExpand(order)}
                        >
                          {isOpen ? "▾" : "▸"}
                        </button>
                      </td>
                      <td>{order.work_order_id}</td>
                      <td>{order.vendor.name}</td>
                      <td>{order.service_type.service}</td>
                      <td>{order.location_type}</td>
                      <td>{`${order.latitude}, ${order.longitude}`}</td>
                      <td>{formatDate(order.created_at)}</td>
                      <td>
                        <span
                          className={`status-badge status-${order.status?.toLowerCase()}`}
                        >
                          {formatStatusLabel(order.status || "")}
                        </span>
                      </td>
                    </tr>
                    {isOpen && (
                      <tr className="workorders-tickets-row">
                        <td></td>
                        <td colSpan={7}>
                          {isLoadingTickets ? (
                            <div className="workorders-tickets-state">Loading tickets…</div>
                          ) : loadError ? (
                            <div className="workorders-tickets-state workorders-tickets-error">{loadError}</div>
                          ) : !tickets || tickets.length === 0 ? (
                            <div className="workorders-tickets-state">No tickets for this work order.</div>
                          ) : (
                            <table className="workorders-tickets-table">
                              <thead>
                                <tr>
                                  <th>Ticket ID</th>
                                  <th>Description</th>
                                  <th>Priority</th>
                                  <th>Status</th>
                                  <th>Due</th>
                                </tr>
                              </thead>
                              <tbody>
                                {tickets.map((t) => (
                                  <tr key={t.id}>
                                    <td>{t.id.slice(0, 8)}</td>
                                    <td>{t.description}</td>
                                    <td>{t.priority}</td>
                                    <td>{t.status}</td>
                                    <td>{t.due_date ? formatDate(t.due_date) : "—"}</td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          )}
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>
        )}
      </section>

      {showModal && (
        <CreateWorkOrderModal
          setShowModal={setShowModal}
          fetchWorkOrders={fetchWorkOrders}
        />
      )}
    </AppShell>
  );
}
