import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, Filter, Star, ChevronRight, ClipboardList, Shield } from 'lucide-react'
import { vendors, serviceOptions } from '../../data/vendorData'
import '../../styles/VendorDirectory.css'

const VendorDirectory = () => {
    const navigate = useNavigate()
    const [searchTerm, setSearchTerm] = useState('')
    const [statusFilter, setStatusFilter] = useState('all')
    const [serviceFilter, setServiceFilter] = useState('all')
    const [complianceFilter, setComplianceFilter] = useState('all')
    const [sortBy, setSortBy] = useState('rating')

    // filter vendors based on search and selected filters
    const filteredVendors = vendors
        .filter((vendor) => {
            const matchesSearch =
                vendor.company_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                vendor.company_code.toLowerCase().includes(searchTerm.toLowerCase()) ||
                vendor.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                vendor.services.some((s) => s.service.toLowerCase().includes(searchTerm.toLowerCase()))

            const matchesStatus = statusFilter === 'all' || vendor.status === statusFilter

            const matchesService =
                serviceFilter === 'all' ||
                vendor.services.some((s) => s.service_id === serviceFilter)

            const matchesCompliance =
                complianceFilter === 'all' || vendor.compliance_status === complianceFilter

            return matchesSearch && matchesStatus && matchesService && matchesCompliance
        })
        .sort((a, b) => {
            if (sortBy === 'rating') return b.average_rating - a.average_rating
            if (sortBy === 'completed') return b.completed_work_orders - a.completed_work_orders
            if (sortBy === 'name') return a.company_name.localeCompare(b.company_name)
            return 0
        })

    // count active vendors per service for the category chips
    const serviceCounts = serviceOptions.map((svc) => ({
        ...svc,
        count: vendors.filter((v) =>
            v.status === 'active' && v.services.some((s) => s.service_id === svc.service_id)
        ).length,
    }))

    return (
        <div className="vendor-directory">
            <div className="vendor-directory-header d-flex justify-content-between align-items-start mb-4">
                <div>
                    <h1 className="vendor-directory-title fw-bold mb-1">Vendor Marketplace</h1>
                    <p className="vendor-directory-subtitle mb-0">
                        Browse and compare vendors by service, rating, and compliance
                    </p>
                </div>
            </div>

            {/* service category chips */}
            <div className="marketplace-categories d-flex flex-wrap gap-2 mb-4">
                <button
                    className={`marketplace-category-chip ${serviceFilter === 'all' ? 'active' : ''}`}
                    onClick={() => setServiceFilter('all')}
                >
                    All Services
                </button>
                {serviceCounts.filter((s) => s.count > 0).map((svc) => (
                    <button
                        key={svc.service_id}
                        className={`marketplace-category-chip ${serviceFilter === svc.service_id ? 'active' : ''}`}
                        onClick={() => setServiceFilter(svc.service_id)}
                    >
                        {svc.service} ({svc.count})
                    </button>
                ))}
            </div>

            {/* filter and sort bar */}
            <div className="vendor-filters d-flex flex-wrap gap-3 mb-4">
                <div className="vendor-search d-flex align-items-center gap-2">
                    <Search size={14} className="vendor-search-icon" />
                    <input
                        type="text"
                        className="vendor-search-input"
                        placeholder="Search vendors, services..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>

                <div className="vendor-filter-group d-flex align-items-center gap-2">
                    <Filter size={14} className="vendor-filter-icon" />

                    <select
                        className="vendor-select"
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                    >
                        <option value="all">All statuses</option>
                        <option value="active">Active</option>
                        <option value="inactive">Inactive</option>
                    </select>

                    <select
                        className="vendor-select"
                        value={complianceFilter}
                        onChange={(e) => setComplianceFilter(e.target.value)}
                    >
                        <option value="all">All compliance</option>
                        <option value="complete">Complete</option>
                        <option value="incomplete">Incomplete</option>
                        <option value="expired">Expired</option>
                    </select>

                    <select
                        className="vendor-select"
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value)}
                    >
                        <option value="rating">Sort by rating</option>
                        <option value="completed">Sort by completed jobs</option>
                        <option value="name">Sort by name</option>
                    </select>
                </div>
            </div>

            <p className="marketplace-results-count mb-3">
                {filteredVendors.length} vendor{filteredVendors.length !== 1 ? 's' : ''} found
            </p>

            {/* vendor cards grid */}
            <div className="marketplace-grid">
                {filteredVendors.map((vendor) => (
                    <div
                        key={vendor.vendor_id}
                        className="marketplace-card"
                        onClick={() => navigate(`/vendors/${vendor.vendor_id}`)}
                    >
                        <div className="marketplace-card-header d-flex justify-content-between align-items-start">
                            <div>
                                <h3 className="marketplace-card-name fw-bold mb-1">{vendor.company_name}</h3>
                                <p className="marketplace-card-code mb-0">{vendor.company_code}</p>
                            </div>
                            <div className="d-flex flex-column align-items-end gap-1">
                                <span className={`vendor-badge ${vendor.status === 'active' ? 'vendor-badge-active' : 'vendor-badge-inactive'}`}>
                                    {vendor.status}
                                </span>
                                <span className={`vendor-badge ${
                                    vendor.compliance_status === 'complete' ? 'vendor-badge-active'
                                    : vendor.compliance_status === 'expired' ? 'vendor-badge-inactive'
                                    : 'vendor-badge-pending'
                                }`}>
                                    {vendor.compliance_status}
                                </span>
                            </div>
                        </div>

                        <p className="marketplace-card-desc mb-3">{vendor.description}</p>

                        <div className="marketplace-card-services d-flex flex-wrap gap-1 mb-3">
                            {vendor.services.map((s) => (
                                <span key={s.service_id} className="vendor-service-tag">{s.service}</span>
                            ))}
                        </div>

                        <div className="marketplace-card-stats d-flex gap-4">
                            <div className="d-flex align-items-center gap-1">
                                <Star size={14} className="marketplace-star-icon" />
                                <span className="marketplace-stat-value fw-semibold">{vendor.average_rating}</span>
                                <span className="marketplace-stat-label">rating</span>
                            </div>
                            <div className="d-flex align-items-center gap-1">
                                <ClipboardList size={14} className="marketplace-stat-icon" />
                                <span className="marketplace-stat-value fw-semibold">{vendor.completed_work_orders}</span>
                                <span className="marketplace-stat-label">completed</span>
                            </div>
                            <div className="d-flex align-items-center gap-1">
                                <Shield size={14} className="marketplace-stat-icon" />
                                <span className="marketplace-stat-label">{vendor.insurance_policies.length} policy</span>
                            </div>
                        </div>

                        <div className="marketplace-card-footer d-flex justify-content-between align-items-center mt-3">
                            <span className="marketplace-card-contact">{vendor.primary_contact_name}</span>
                            <ChevronRight size={16} className="marketplace-card-arrow" />
                        </div>
                    </div>
                ))}
            </div>

            {filteredVendors.length === 0 && (
                <div className="vendor-empty text-center py-5">
                    <p className="mb-1 fw-semibold">No vendors match your filters</p>
                    <p className="vendor-cell-sub mb-0">Try adjusting your search or filter criteria</p>
                </div>
            )}
        </div>
    )
}

export default VendorDirectory
