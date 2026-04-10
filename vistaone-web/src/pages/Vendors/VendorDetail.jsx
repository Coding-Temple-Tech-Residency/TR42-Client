import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Mail, Phone, Shield, FileText, Award, AlertCircle, ClipboardList } from 'lucide-react'
import { vendors } from '../../data/vendorData'
import '../../styles/VendorDetail.css'

const VendorDetail = () => {
    const { vendorId } = useParams()
    const navigate = useNavigate()

    // find the vendor from our temp data (swap for API call later)
    const vendor = vendors.find((v) => v.vendor_id === vendorId)

    if (!vendor) {
        return (
            <div className="vendor-detail-empty text-center py-5">
                <AlertCircle size={32} className="mb-3" />
                <p className="fw-semibold">Vendor not found</p>
                <button className="vendor-back-link" onClick={() => navigate('/vendors')}>
                    Back to directory
                </button>
            </div>
        )
    }

    return (
        <div className="vendor-detail">
            <button className="vendor-back-link d-inline-flex align-items-center gap-2 mb-4" onClick={() => navigate('/vendors')}>
                <ArrowLeft size={16} />
                Back to directory
            </button>

            <div className="vendor-detail-header d-flex justify-content-between align-items-start mb-4">
                <div>
                    <h1 className="vendor-detail-title fw-bold mb-1">{vendor.company_name}</h1>
                    <p className="vendor-detail-sub mb-0">{vendor.company_code}</p>
                </div>
                <div className="d-flex align-items-center gap-3">
                    <span className={`vendor-badge ${vendor.status === 'active' ? 'vendor-badge-active' : 'vendor-badge-inactive'}`}>
                        {vendor.status}
                    </span>
                    <button
                        className="vendor-assign-btn d-inline-flex align-items-center gap-2"
                        onClick={(e) => {
                            e.stopPropagation()
                            navigate(`/work-orders/create?vendor=${vendor.vendor_id}`)
                        }}
                    >
                        <ClipboardList size={16} />
                        Assign Work Order
                    </button>
                </div>
            </div>

            {/* info cards */}
            <div className="vendor-detail-grid">

                {/* contact */}
                <div className="vendor-card">
                    <h3 className="vendor-card-title d-flex align-items-center gap-2">
                        <Mail size={16} />
                        Primary Contact
                    </h3>
                    <div className="vendor-card-body">
                        <p className="vendor-card-label">Name</p>
                        <p className="vendor-card-value">{vendor.primary_contact_name}</p>

                        <p className="vendor-card-label">Email</p>
                        <p className="vendor-card-value">{vendor.contact_email}</p>

                        <p className="vendor-card-label">Phone</p>
                        <p className="vendor-card-value">{vendor.contact_phone}</p>
                    </div>
                </div>

                {/* services */}
                <div className="vendor-card">
                    <h3 className="vendor-card-title d-flex align-items-center gap-2">
                        <FileText size={16} />
                        Services
                    </h3>
                    <div className="vendor-card-body">
                        <div className="d-flex flex-wrap gap-2">
                            {vendor.services.map((s) => (
                                <span key={s.service_id} className="vendor-service-chip">
                                    {s.service}
                                </span>
                            ))}
                        </div>
                    </div>
                </div>

                {/* msa */}
                <div className="vendor-card">
                    <h3 className="vendor-card-title d-flex align-items-center gap-2">
                        <Shield size={16} />
                        MSA Status
                    </h3>
                    <div className="vendor-card-body">
                        {vendor.msas.map((msa) => (
                            <div key={msa.msa_id} className="mb-2">
                                <div className="d-flex justify-content-between align-items-center mb-2">
                                    <p className="vendor-card-value mb-0">v{msa.version}</p>
                                    <span className={`vendor-badge ${
                                        msa.status === 'active' ? 'vendor-badge-active'
                                        : msa.status === 'expired' ? 'vendor-badge-inactive'
                                        : 'vendor-badge-pending'
                                    }`}>
                                        {msa.status}
                                    </span>
                                </div>
                                <p className="vendor-card-label mb-0">
                                    {msa.effective_date} — {msa.expiration_date}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* insurance */}
                <div className="vendor-card">
                    <h3 className="vendor-card-title d-flex align-items-center gap-2">
                        <Shield size={16} />
                        Insurance
                    </h3>
                    <div className="vendor-card-body">
                        {vendor.insurance_policies.map((ins) => (
                            <div key={ins.insurance_id}>
                                <p className="vendor-card-value mb-1">{ins.provider_name}</p>
                                <p className="vendor-card-label mb-1">Policy: {ins.policy_number}</p>
                                <p className={`vendor-card-label mb-0 ${new Date(ins.expiration_date) < new Date() ? 'vendor-text-danger' : ''}`}>
                                    Coverage ends: {ins.expiration_date}
                                    {new Date(ins.expiration_date) < new Date() && ' (Expired)'}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* licenses */}
                <div className="vendor-card">
                    <h3 className="vendor-card-title d-flex align-items-center gap-2">
                        <Award size={16} />
                        Licenses
                    </h3>
                    <div className="vendor-card-body">
                        {vendor.licenses.map((lic) => (
                            <div key={lic.license_id}>
                                <p className="vendor-card-value mb-1">{lic.license_type}</p>
                                <p className="vendor-card-label mb-1">Number: {lic.license_number}</p>
                                <p className={`vendor-card-label mb-0 ${new Date(lic.license_expiration_date) < new Date() ? 'vendor-text-danger' : ''}`}>
                                    Valid through: {lic.license_expiration_date}
                                    {new Date(lic.license_expiration_date) < new Date() && ' (Expired)'}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    )
}

export default VendorDetail
