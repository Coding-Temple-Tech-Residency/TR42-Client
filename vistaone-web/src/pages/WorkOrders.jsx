import { useEffect, useMemo, useState } from "react";
import AppShell from "../components/AppShell";
import { useWorkOrder } from "../hooks/useWorkOrder";
import CreateWorkOrderModal from "../components/CreateWorkOrderModal";
import WorkOrderDetailModal from "../components/WorkOrderDetailModal";
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
  const [detailOrder, setDetailOrder] = useState(null);
  const {
    workOrders,
    loading,
    fetchWorkOrders,
    // createWorkOrder,
    // updateWorkOrder,
    // removeWorkOrder
  } = useWorkOrder();

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

  const formatStatusLabel = (status) => {
    if (!status) return "";
    if (status === "INVOICE_REJECTED") return "Invoice Rejected";
    if (status === "PENDING_REVIEW") return "Pending Review";
    return status.replace(/_/g, " ");
  };

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
                <th>Order ID</th>
                <th>Vendor</th>
                <th>Job Type</th>
                <th>Location Type</th>
                <th>Location</th>
                <th>Date</th>
                <th>Status</th>
                {/* <th>Actions</th> */}
              </tr>
            </thead>
            <tbody>
              {filteredOrders.map((order) => (
                <tr
                  key={order.work_order_id}
                  className="workorders-row-clickable"
                  onClick={() => setDetailOrder(order)}
                  tabIndex={0}
                  role="button"
                  aria-label={`View details for work order ${order.work_order_id}`}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      setDetailOrder(order);
                    }
                  }}
                >
                  <td>{order.work_order_id}</td>
                  <td>{order.vendor.name}</td>
                  <td>{order.service_type.service}</td>
                  <td>{order.location_type}</td>
                  <td>{`${order.latitude}, ${order.longitude}`}</td>
                  <td>{formatDate(order.created_at)}</td>
                  <td>
                    {(() => {
                      const effective = order.display_status || order.status;
                      return (
                        <span
                          className={`status-badge status-${effective?.toLowerCase()}`}
                        >
                          {formatStatusLabel(effective)}
                        </span>
                      );
                    })()}
                  </td>
                </tr>
              ))}
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

      {detailOrder && (
        <WorkOrderDetailModal
          workOrder={detailOrder}
          onClose={() => setDetailOrder(null)}
        />
      )}
    </AppShell>
  );
}
