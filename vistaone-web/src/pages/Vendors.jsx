import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import AppShell from "../components/AppShell";
import { vendorService } from "../services/vendorService";
import "../styles/vendors.css";

const statusOptions = [
  { value: "ALL", label: "All Statuses" },
  { value: "active", label: "Active" },
  { value: "inactive", label: "Inactive" },
];

const complianceOptions = [
  { value: "ALL", label: "All Compliance" },
  { value: "complete", label: "Complete" },
  { value: "incomplete", label: "Incomplete" },
  { value: "expired", label: "Expired" },
];

const sortOptions = [
  { value: "name-asc", label: "Name A-Z" },
  { value: "name-desc", label: "Name Z-A" },
  { value: "status", label: "Status" },
  { value: "compliance", label: "Compliance" },
];

export default function Vendors() {
  const navigate = useNavigate();
  const [vendors, setVendors] = useState([]);
  const [favoriteIds, setFavoriteIds] = useState(new Set());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [complianceFilter, setComplianceFilter] = useState("ALL");
  const [sortBy, setSortBy] = useState("name-asc");
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [creating, setCreating] = useState(false);
  const [formData, setFormData] = useState({
    company_name: "",
    company_code: "",
    primary_contact_name: "",
    company_email: "",
    company_phone: "",
    description: "",
  });

  // Client ID from the logged-in user's company
  // For now using the first client in the system
  const [clientId, setClientId] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const allVendors = await vendorService.getAll();
      setVendors(allVendors);

      // Try to load favorites if a client exists
      try {
        const res = await fetch("/api/clients", {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("authToken")}`,
          },
        });
        if (res.ok) {
          const clients = await res.json();
          if (clients.length > 0) {
            const cid = clients[0].client_id;
            setClientId(cid);
            const favs = await vendorService.getFavorites(cid);
            setFavoriteIds(new Set(favs.map((v) => v.vendor_id)));
          }
        }
      } catch {
        // No client endpoint yet or no clients - favorites disabled
      }

      setError("");
    } catch (err) {
      setError("Failed to load vendors");
    } finally {
      setLoading(false);
    }
  };

  const handleToggleFavorite = async (vendorId) => {
    if (!clientId) return;
    try {
      if (favoriteIds.has(vendorId)) {
        await vendorService.removeFavorite(clientId, vendorId);
        setFavoriteIds((prev) => {
          const next = new Set(prev);
          next.delete(vendorId);
          return next;
        });
      } else {
        await vendorService.addFavorite(clientId, vendorId);
        setFavoriteIds((prev) => new Set(prev).add(vendorId));
      }
    } catch (err) {
      setError("Failed to update favorites");
    }
  };

  // Filter and sort vendors
  const processedVendors = useMemo(() => {
    const search = searchTerm.trim().toLowerCase();
    const filtered = vendors.filter((v) => {
      const matchesStatus =
        statusFilter === "ALL" || v.status === statusFilter;
      const matchesCompliance =
        complianceFilter === "ALL" || v.compliance_status === complianceFilter;
      const matchesSearch =
        (v.company_name || "").toLowerCase().includes(search) ||
        (v.company_code || "").toLowerCase().includes(search) ||
        (v.primary_contact_name || "").toLowerCase().includes(search) ||
        (v.description || "").toLowerCase().includes(search);
      return matchesStatus && matchesCompliance && matchesSearch;
    });

    // Sort
    return filtered.sort((a, b) => {
      if (sortBy === "name-asc")
        return (a.company_name || "").localeCompare(b.company_name || "");
      if (sortBy === "name-desc")
        return (b.company_name || "").localeCompare(a.company_name || "");
      if (sortBy === "status")
        return (a.status || "").localeCompare(b.status || "");
      if (sortBy === "compliance")
        return (a.compliance_status || "").localeCompare(b.compliance_status || "");
      return 0;
    });
  }, [vendors, searchTerm, statusFilter, complianceFilter, sortBy]);

  // Split into favorites and marketplace
  const favoriteVendors = processedVendors.filter((v) =>
    favoriteIds.has(v.vendor_id)
  );
  const marketplaceVendors = processedVendors.filter(
    (v) => !favoriteIds.has(v.vendor_id)
  );

  const handleFormChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleCreateVendor = async (e) => {
    e.preventDefault();
    if (!formData.company_name.trim() || !formData.company_email.trim()) return;
    try {
      setCreating(true);
      await vendorService.create(formData);
      setFormData({
        company_name: "",
        company_code: "",
        primary_contact_name: "",
        company_email: "",
        company_phone: "",
        description: "",
      });
      setShowCreateForm(false);
      fetchData();
    } catch (err) {
      setError("Failed to create vendor");
    } finally {
      setCreating(false);
    }
  };

  const renderVendorTable = (vendorList, isFavorites) => (
    <table className="vendors-table">
      <thead>
        <tr>
          {clientId && <th></th>}
          <th>Company</th>
          <th>Code</th>
          <th>Contact</th>
          <th>Email</th>
          <th>Status</th>
          <th>Compliance</th>
        </tr>
      </thead>
      <tbody>
        {vendorList.map((vendor) => (
          <tr key={vendor.vendor_id} className="vendors-row-clickable">
            {clientId && (
              <td>
                <button
                  className={`vendors-fav-btn ${
                    favoriteIds.has(vendor.vendor_id) ? "is-fav" : ""
                  }`}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleToggleFavorite(vendor.vendor_id);
                  }}
                  title={
                    favoriteIds.has(vendor.vendor_id)
                      ? "Remove from favorites"
                      : "Add to favorites"
                  }
                >
                  {favoriteIds.has(vendor.vendor_id) ? "★" : "☆"}
                </button>
              </td>
            )}
            <td
              className="vendors-name-cell"
              onClick={() => navigate(`/vendors/${vendor.vendor_id}`)}
            >
              {vendor.company_name || vendor.name}
            </td>
            <td onClick={() => navigate(`/vendors/${vendor.vendor_id}`)}>
              {vendor.company_code || "-"}
            </td>
            <td onClick={() => navigate(`/vendors/${vendor.vendor_id}`)}>
              {vendor.primary_contact_name || "-"}
            </td>
            <td onClick={() => navigate(`/vendors/${vendor.vendor_id}`)}>
              {vendor.company_email || "-"}
            </td>
            <td onClick={() => navigate(`/vendors/${vendor.vendor_id}`)}>
              <span className={`status-badge status-${vendor.status}`}>
                {vendor.status}
              </span>
            </td>
            <td onClick={() => navigate(`/vendors/${vendor.vendor_id}`)}>
              <span
                className={`status-badge compliance-${vendor.compliance_status}`}
              >
                {vendor.compliance_status}
              </span>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );

  return (
    <AppShell
      title="Vendor Marketplace"
      subtitle="Browse, search, and manage vendors"
      loading={loading}
      loadingText="Loading vendors..."
    >
      {error && <div className="vendors-error">{error}</div>}

      <section className="vendors-controls">
        <input
          type="search"
          className="vendors-search"
          placeholder="Search vendors..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <select
          className="vendors-filter"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          {statusOptions.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        <select
          className="vendors-filter"
          value={complianceFilter}
          onChange={(e) => setComplianceFilter(e.target.value)}
        >
          {complianceOptions.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        <select
          className="vendors-filter"
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
        >
          {sortOptions.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </section>

      <button
        className="fab-create-vendor"
        onClick={() => setShowCreateForm(!showCreateForm)}
        title="Add Vendor"
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="12" r="12" fill="#007bff" />
          <rect x="11" y="6" width="2" height="12" rx="1" fill="#fff" />
          <rect x="6" y="11" width="12" height="2" rx="1" fill="#fff" />
        </svg>
        <span className="fab-label">Add Vendor</span>
      </button>

      {showCreateForm && (
        <section className="vendors-create-form">
          <h3>Add New Vendor</h3>
          <form onSubmit={handleCreateVendor}>
            <div className="vendors-form-grid">
              <div className="vendors-form-field">
                <label>Company Name *</label>
                <input
                  type="text"
                  name="company_name"
                  value={formData.company_name}
                  onChange={handleFormChange}
                  required
                />
              </div>
              <div className="vendors-form-field">
                <label>Company Code</label>
                <input
                  type="text"
                  name="company_code"
                  value={formData.company_code}
                  onChange={handleFormChange}
                />
              </div>
              <div className="vendors-form-field">
                <label>Contact Name</label>
                <input
                  type="text"
                  name="primary_contact_name"
                  value={formData.primary_contact_name}
                  onChange={handleFormChange}
                />
              </div>
              <div className="vendors-form-field">
                <label>Email *</label>
                <input
                  type="email"
                  name="company_email"
                  value={formData.company_email}
                  onChange={handleFormChange}
                  required
                />
              </div>
              <div className="vendors-form-field">
                <label>Phone</label>
                <input
                  type="text"
                  name="company_phone"
                  value={formData.company_phone}
                  onChange={handleFormChange}
                />
              </div>
              <div className="vendors-form-field vendors-form-field-full">
                <label>Description</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleFormChange}
                  rows={3}
                />
              </div>
            </div>
            <div className="vendors-form-actions">
              <button
                type="button"
                className="vendors-btn-cancel"
                onClick={() => setShowCreateForm(false)}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="vendors-btn-submit"
                disabled={creating}
              >
                {creating ? "Creating..." : "Create Vendor"}
              </button>
            </div>
          </form>
        </section>
      )}

      {/* My Vendors - favorites section */}
      {favoriteVendors.length > 0 && (
        <section className="vendors-section">
          <h2 className="vendors-section-title">My Vendors</h2>
          <p className="vendors-section-count">
            {favoriteVendors.length} favorite
            {favoriteVendors.length !== 1 ? "s" : ""}
          </p>
          <div className="vendors-table-wrap">
            {renderVendorTable(favoriteVendors, true)}
          </div>
        </section>
      )}

      {/* Vendor Marketplace - all vendors */}
      <section className="vendors-section">
        <h2 className="vendors-section-title">Vendor Marketplace</h2>
        <p className="vendors-section-count">
          {marketplaceVendors.length} vendor
          {marketplaceVendors.length !== 1 ? "s" : ""} available
        </p>
        <div className="vendors-table-wrap">
          {!loading && marketplaceVendors.length === 0 ? (
            <div className="vendors-state">No vendors found</div>
          ) : (
            renderVendorTable(marketplaceVendors, false)
          )}
        </div>
      </section>
    </AppShell>
  );
}
