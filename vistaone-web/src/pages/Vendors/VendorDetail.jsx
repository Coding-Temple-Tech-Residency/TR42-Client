import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Mail, Phone, Shield, FileText, Award, AlertCircle, ClipboardList } from 'lucide-react'
import { vendorService } from '../../services/vendorService'
import '../../styles/VendorDetail.css'

const VendorDetail = () => {
    const { vendorId } = useParams()
    const navigate = useNavigate()

    // vendor data now fetched from the API instead of the mock data file
    const [vendor, setVendor] = useState(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')

    useEffect(() => {
        const loadVendor = async () => {
            try {
                const data = await vendorService.getById(vendorId)
                setVendor(data)
            } catch (err) {
                setError(err.message || 'Failed to load vendor')
            } finally {
                setLoading(false)
            }
        }

        loadVendor()
    }, [vendorId])

    if (loading) {
        return (
            <div className="vendor-detail-empty text-center py-5">
                <p>Loading vendor...</p>
            </div>
        )
    }

    if (error || !vendor) {
        return (
            <div className="vendor-detail-empty text-center py-5">
                <AlertCircle size={32} className="mb-3" />
                <p className="fw-semibold">{error || 'Vendor not found'}</p>
                <button className="vendor-back-link" onClick={() => navigate('/vendors')}>
                    Back to directory
                </button>
            </div>
        )
    }

    return (
        <div className="vendor-detail">
            <button
                className="vendor-back-link d-inline-flex align-items-center gap-2 mb-4"
                onClick={() => navigate('/vendors')}
            >
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
                        onClick={() => navigate(`/work-orders/create?vendor=${vendor.vendor_id}`)}
                    >
                        <ClipboardList size={16} />
                        Assign Work Order
                    </button>
                </div>
            </div>

            <div className="vendor-detail-grid">

                <div className="vendor-card">
                    <h3 className="vendor-card-title d-flex align-items-center gap-2">
                        <Mail size={16} />
                        Primary Contact
                    </h3>
                    <div className="vendor-card-body">
                        <p className="vendor-card-label">Name</p>
                        <p className="vendor-card-value">{vendor.primary_contact_name}</p>
                        <p className="vendor-card-label">Email</p>
                        {/* API returns company_email - also aliased as contact_email for backwards compat */}
                        <p className="vendor-card-value">{vendor.company_email || vendor.contact_email}</p>
                        <p className="vendor-card-label">Phone</p>
                        <p className="vendor-card-value">{vendor.company_phone || vendor.contact_phone}</p>
                    </div>
                </div>

                <div className="vendor-card">
                    <h3 className="vendor-card-title d-flex align-items-center gap-2">
                        <FileText size={16} />
                        Services
                    </h3>
                    <div className="vendor-card-body">
                        <div className="d-flex flex-wrap gap-2">
                            {(vendor.services || []).length > 0 ? (
                                vendor.services.map((s) => (
                                    <span key={s.service_id} className="vendor-service-chip">{s.service}</span>
                                ))
                            ) : (
                                <p className="vendor-card-label mb-0">No services listed</p>
                            )}
                        </div>
                    </div>
                </div>

                <div className="vendor-card">
                    <h3 className="vendor-card-title d-flex align-items-center gap-2">
                        <Shield size={16} />
                        MSA Status
                    </h3>
                    <div className="vendor-card-body">
                        {(vendor.msas || []).length > 0 ? (
                            vendor.msas.map((msa) => (
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
                                        {msa.effective_date} to {msa.expiration_date}
                                    </p>
                                </div>
                            ))
                        ) : (
                            <p className="vendor-card-label mb-0">No MSA on file</p>
                        )}
                    </div>
                </div>

                <div className="vendor-card">
                    <h3 className="vendor-card-title d-flex align-items-center gap-2">
                        <Shield size={16} />
                        Insurance
                    </h3>
                    <div className="vendor-card-body">
                        {(vendor.insurance_policies || []).length > 0 ? (
                            vendor.insurance_policies.map((ins) => (
                                <div key={ins.insurance_id}>
                                    <p className="vendor-card-value mb-1">{ins.provider_name}</p>
                                    <p className="vendor-card-label mb-1">Policy: {ins.policy_number}</p>
                                    <p className={`vendor-card-label mb-0 ${new Date(ins.expiration_date) < new Date() ? 'vendor-text-danger' : ''}`}>
                                        Coverage ends: {ins.expiration_date}
                                        {new Date(ins.expiration_date) < new Date() && ' (Expired)'}
                                    </p>
                                </div>
                            ))
                        ) : (
                            <p className="vendor-card-label mb-0">No insurance records yet</p>
                        )}
                    </div>
                </div>

                <div className="vendor-card">
                    <h3 className="vendor-card-title d-flex align-items-center gap-2">
                        <Award size={16} />
                        Licenses
                    </h3>
                    <div className="vendor-card-body">
                        {(vendor.licenses || []).length > 0 ? (
                            vendor.licenses.map((lic) => (
                                <div key={lic.license_id}>
                                    <p className="vendor-card-value mb-1">{lic.license_type}</p>
                                    <p className="vendor-card-label mb-1">Number: {lic.license_number}</p>
                                    <p className={`vendor-card-label mb-0 ${new Date(lic.license_expiration_date) < new Date() ? 'vendor-text-danger' : ''}`}>
                                        Valid through: {lic.license_expiration_date}
                                        {new Date(lic.license_expiration_date) < new Date() && ' (Expired)'}
                                    </p>
                                </div>
                            ))
                        ) : (
                            <p className="vendor-card-label mb-0">No license records yet</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}

export default VendorDetail
