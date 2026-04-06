import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, Filter, Plus, ChevronRight } from 'lucide-react'
import { vendors, serviceOptions } from '../../data/vendorData'
import '../../styles/VendorDirectory.css'

const VendorDirectory = () => {
    const navigate = useNavigate()
    const [searchTerm, setSearchTerm] = useState('')
    const [statusFilter, setStatusFilter] = useState('all')
    const [serviceFilter, setServiceFilter] = useState('all')
    const [msaFilter, setMsaFilter] = useState('all')

    // filter the vendor list based on what the user has selected
    const filteredVendors = vendors.filter((vendor) => {
        const matchesSearch =
            vendor.vendor_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            vendor.vendor_code.toLowerCase().includes(searchTerm.toLowerCase()) ||
            vendor.primary_contact_name.toLowerCase().includes(searchTerm.toLowerCase())

        const matchesStatus = statusFilter === 'all' || vendor.status === statusFilter

        const matchesService =
            serviceFilter === 'all' ||
            vendor.services.some((s) => s.service_id === serviceFilter)

        const matchesMsa =
            msaFilter === 'all' ||
            vendor.msas.some((m) => m.status === msaFilter)

        return matchesSearch && matchesStatus && matchesService && matchesMsa
    })

    return (
        <div className="vendor-directory">
            <div className="vendor-directory-header d-flex justify-content-between align-items-start mb-4">
                <div>
                    <h1 className="vendor-directory-title fw-bold mb-1">Vendor Directory</h1>
                    <p className="vendor-directory-subtitle mb-0">
                        {filteredVendors.length} vendor{filteredVendors.length !== 1 ? 's' : ''} found
                    </p>
                </div>
                <button
                    className="vendor-add-btn d-inline-flex align-items-center gap-2"
                    onClick={() => navigate('/vendors/add')}
                >
                    <Plus size={16} />
                    Add vendor
                </button>
            </div>

            {/* filter bar */}
            <div className="vendor-filters d-flex flex-wrap gap-3 mb-4">
                <div className="vendor-search d-flex align-items-center gap-2">
                    <Search size={14} className="vendor-search-icon" />
                    <input
                        type="text"
                        className="vendor-search-input"
                        placeholder="Search vendors..."
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
                        value={serviceFilter}
                        onChange={(e) => setServiceFilter(e.target.value)}
                    >
                        <option value="all">All services</option>
                        {serviceOptions.map((s) => (
                            <option key={s.service_id} value={s.service_id}>{s.name}</option>
                        ))}
                    </select>

                    <select
                        className="vendor-select"
                        value={msaFilter}
                        onChange={(e) => setMsaFilter(e.target.value)}
                    >
                        <option value="all">All MSA</option>
                        <option value="complete">Complete</option>
                        <option value="incomplete">Incomplete</option>
                        <option value="expired">Expired</option>
                    </select>
                </div>
            </div>

            {/* vendor table */}
            <div className="vendor-table-card">
                <table className="vendor-table w-100">
                    <thead>
                        <tr>
                            <th>Vendor</th>
                            <th>Services</th>
                            <th>Status</th>
                            <th>MSA</th>
                            <th>Contact</th>
                            <th></th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredVendors.map((vendor) => (
                            <tr
                                key={vendor.vendor_id}
                                className="vendor-table-row"
                                onClick={() => navigate(`/vendors/${vendor.vendor_id}`)}
                            >
                                <td>
                                    <p className="vendor-cell-name fw-semibold mb-0">{vendor.vendor_name}</p>
                                    <p className="vendor-cell-sub mb-0">{vendor.vendor_code}</p>
                                </td>
                                <td>
                                    <div className="d-flex flex-wrap gap-1">
                                        {vendor.services.map((s) => (
                                            <span key={s.service_id} className="vendor-service-tag">{s.code}</span>
                                        ))}
                                    </div>
                                </td>
                                <td>
                                    <span className={`vendor-badge ${vendor.status === 'active' ? 'vendor-badge-active' : 'vendor-badge-inactive'}`}>
                                        {vendor.status}
                                    </span>
                                </td>
                                <td>
                                    {vendor.msas[0] && (
                                        <span className={`vendor-badge ${
                                            vendor.msas[0].status === 'complete' ? 'vendor-badge-active'
                                            : vendor.msas[0].status === 'expired' ? 'vendor-badge-inactive'
                                            : 'vendor-badge-pending'
                                        }`}>
                                            {vendor.msas[0].status}
                                        </span>
                                    )}
                                </td>
                                <td>
                                    <p className="vendor-cell-name mb-0">{vendor.primary_contact_name}</p>
                                    <p className="vendor-cell-sub mb-0">{vendor.contact_email}</p>
                                </td>
                                <td>
                                    <ChevronRight size={16} className="vendor-row-arrow" />
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                {filteredVendors.length === 0 && (
                    <div className="vendor-empty text-center py-5">
                        <p className="mb-1 fw-semibold">No vendors match your filters</p>
                        <p className="vendor-cell-sub mb-0">Try adjusting your search or filter criteria</p>
                    </div>
                )}
            </div>
        </div>
    )
}

export default VendorDirectory
