import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { ticketService } from "../services/ticketService";

const formatDateTime = (s) => {
  if (!s) return "—";
  const d = new Date(s);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const formatStatusLabel = (status) =>
  status ? status.replace(/_/g, " ") : "—";

const formatCurrency = (n) => {
  if (n == null || Number.isNaN(Number(n))) return "—";
  return `$${Number(n).toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
};

const formatRate = (n) => {
  if (n == null || !Number.isFinite(n)) return "—";
  return `$${n.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
};

function parseDuration(seconds) {
  if (seconds == null || !Number.isFinite(seconds) || seconds <= 0) return "—";
  const total = Math.round(seconds);
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  if (h > 0) return `${h}h ${m}m`;
  if (m > 0) return `${m}m ${s}s`;
  return `${s}s`;
}

function estimatedDurationToSeconds(value) {
  if (value == null) return null;
  if (typeof value === "number") return value;
  if (typeof value === "string") {
    const num = Number(value);
    if (Number.isFinite(num)) return num;
  }
  return null;
}

export default function TicketDetailModal({ ticketId, onClose }) {
  const [ticket, setTicket] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      setError("");
      try {
        const data = await ticketService.getById(ticketId);
        if (!cancelled) setTicket(data);
      } catch (err) {
        if (!cancelled) setError(err.message || "Failed to load ticket");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [ticketId]);

  const handleOverlayClick = () => onClose();
  const stop = (e) => e.stopPropagation();

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  const actualSeconds = ticket?.actual_duration_seconds ?? null;
  const estimatedSeconds = estimatedDurationToSeconds(
    ticket?.estimated_duration,
  );
  const totalAmount =
    ticket?.invoice?.total_amount != null
      ? Number(ticket.invoice.total_amount)
      : null;

  const costPerHour =
    totalAmount != null && actualSeconds && actualSeconds > 0
      ? totalAmount / (actualSeconds / 3600)
      : null;
  const costPerMinute =
    totalAmount != null && actualSeconds && actualSeconds > 0
      ? totalAmount / (actualSeconds / 60)
      : null;
  const costPerQuantity =
    totalAmount != null &&
    ticket?.estimated_quantity != null &&
    Number(ticket.estimated_quantity) > 0
      ? totalAmount / Number(ticket.estimated_quantity)
      : null;

  const hasCostSection =
    totalAmount != null ||
    (ticket?.invoice?.line_items && ticket.invoice.line_items.length > 0);

  return createPortal(
    <div className="workorders-modal-overlay ticket-modal-overlay" onClick={handleOverlayClick}>
      <div
        className="workorders-modal workorder-detail-modal ticket-detail-modal"
        onClick={stop}
        role="dialog"
        aria-modal="true"
      >
        <div className="workorders-modal-header workorder-modal-header">
          <h2 className="workorder-modal-title">
            {ticket
              ? `Ticket ${ticket.id?.slice(0, 8) || ""}`
              : "Ticket Details"}
          </h2>
          <button
            className="workorders-close-btn workorder-close-btn"
            onClick={onClose}
            aria-label="Close"
          >
            ×
          </button>
        </div>

        <div className="workorder-detail-body">
          {loading ? (
            <div className="workorders-tickets-state">Loading…</div>
          ) : error ? (
            <div className="workorders-tickets-state workorders-tickets-error">
              {error}
            </div>
          ) : !ticket ? (
            <div className="workorders-tickets-state">Ticket not found.</div>
          ) : (
            <>
              <section className="workorder-detail-section">
                <h3>Information</h3>
                <dl className="workorder-detail-grid">
                  <dt>Description</dt>
                  <dd>{ticket.description || "—"}</dd>
                  <dt>Vendor</dt>
                  <dd>
                    {ticket.vendor?.company_name ||
                      ticket.vendor?.name ||
                      "—"}
                  </dd>
                  <dt>Service Type</dt>
                  <dd>{ticket.service?.service || "—"}</dd>
                  <dt>Contractor</dt>
                  <dd>{ticket.assigned_contractor || "—"}</dd>
                  <dt>Priority</dt>
                  <dd>
                    <span
                      className={`tickets-priority priority-${ticket.priority}`}
                    >
                      {ticket.priority || "—"}
                    </span>
                  </dd>
                  <dt>Status</dt>
                  <dd>
                    <span
                      className={`tickets-status status-${ticket.status}`}
                    >
                      {formatStatusLabel(ticket.status)}
                    </span>
                  </dd>
                  <dt>Anomaly</dt>
                  <dd>
                    {ticket.anomaly_flag ? (
                      <span className="tickets-anomaly">
                        ⚠ {ticket.anomaly_reason || "Flagged"}
                      </span>
                    ) : (
                      "—"
                    )}
                  </dd>
                  {ticket.work_order && (
                    <>
                      <dt>Work Order</dt>
                      <dd>
                        #
                        {ticket.work_order.work_order_id ??
                          ticket.work_order.id?.slice(0, 8)}
                        {ticket.work_order.description
                          ? ` — ${ticket.work_order.description}`
                          : ""}
                      </dd>
                    </>
                  )}
                </dl>
              </section>

              <section className="workorder-detail-section">
                <h3>Timing</h3>
                <dl className="workorder-detail-grid">
                  <dt>Due Date</dt>
                  <dd>{formatDateTime(ticket.due_date)}</dd>
                  <dt>Assigned At</dt>
                  <dd>{formatDateTime(ticket.assigned_at)}</dd>
                  <dt>Started</dt>
                  <dd>{formatDateTime(ticket.start_time)}</dd>
                  <dt>Ended</dt>
                  <dd>{formatDateTime(ticket.end_time)}</dd>
                  <dt>Actual Duration</dt>
                  <dd>{parseDuration(actualSeconds)}</dd>
                  <dt>Estimated Duration</dt>
                  <dd>{parseDuration(estimatedSeconds)}</dd>
                </dl>
              </section>

              {hasCostSection && (
                <section className="workorder-detail-section">
                  <h3>Cost & Quantity</h3>
                  <dl className="workorder-detail-grid">
                    <dt>Total Cost</dt>
                    <dd>{formatCurrency(totalAmount)}</dd>
                    <dt>Per Hour</dt>
                    <dd>{formatRate(costPerHour)}</dd>
                    <dt>Per Minute</dt>
                    <dd>{formatRate(costPerMinute)}</dd>
                    <dt>Estimated Quantity</dt>
                    <dd>
                      {ticket.estimated_quantity != null
                        ? `${ticket.estimated_quantity}${
                            ticket.unit ? ` ${ticket.unit}` : ""
                          }`
                        : "—"}
                    </dd>
                    <dt>Per Quantity</dt>
                    <dd>
                      {costPerQuantity != null
                        ? `${formatRate(costPerQuantity)}${
                            ticket.unit ? ` / ${ticket.unit}` : ""
                          }`
                        : "—"}
                    </dd>
                    <dt>Estimated Cost (WO)</dt>
                    <dd>
                      {ticket.work_order?.estimated_cost != null
                        ? formatCurrency(ticket.work_order.estimated_cost)
                        : "—"}
                    </dd>
                  </dl>

                  {ticket.invoice?.line_items &&
                    ticket.invoice.line_items.length > 0 && (
                      <table className="workorders-tickets-table">
                        <thead>
                          <tr>
                            <th>Description</th>
                            <th>Quantity</th>
                            <th>Rate</th>
                            <th>Amount</th>
                          </tr>
                        </thead>
                        <tbody>
                          {ticket.invoice.line_items.map((li) => (
                            <tr key={li.id}>
                              <td>{li.description || "—"}</td>
                              <td>{li.quantity}</td>
                              <td>{formatCurrency(li.rate)}</td>
                              <td>{formatCurrency(li.amount)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    )}
                </section>
              )}

              {(ticket.notes ||
                ticket.special_requirements ||
                ticket.route ||
                ticket.contractor_start_location ||
                ticket.contractor_end_location) && (
                <section className="workorder-detail-section">
                  <h3>Notes & Location</h3>
                  <dl className="workorder-detail-grid">
                    {ticket.notes && (
                      <>
                        <dt>Notes</dt>
                        <dd>{ticket.notes}</dd>
                      </>
                    )}
                    {ticket.special_requirements && (
                      <>
                        <dt>Special Requirements</dt>
                        <dd>{ticket.special_requirements}</dd>
                      </>
                    )}
                    {ticket.contractor_start_location && (
                      <>
                        <dt>Start Location</dt>
                        <dd>{ticket.contractor_start_location}</dd>
                      </>
                    )}
                    {ticket.contractor_end_location && (
                      <>
                        <dt>End Location</dt>
                        <dd>{ticket.contractor_end_location}</dd>
                      </>
                    )}
                    {ticket.route && (
                      <>
                        <dt>Route</dt>
                        <dd>{ticket.route}</dd>
                      </>
                    )}
                  </dl>
                </section>
              )}
            </>
          )}
        </div>
      </div>
    </div>,
    document.body,
  );
}
