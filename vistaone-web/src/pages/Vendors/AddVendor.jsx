import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Plus, X } from 'lucide-react'
import { vendorService } from '../../services/vendorService'
import { servicesService } from '../../services/servicesService'
import '../../styles/AddVendor.css'

const AddVendor = () => {
    const navigate = useNavigate()

    // Service options loaded from the API instead of the mock data file
    const [serviceOptions, setServiceOptions] = useState([])

    // Form field state - names match the backend vendor model / ERD column names
    const [vendorName, setVendorName] = useState('')
    const [vendorCode, setVendorCode] = useState('')
    const [contactName, setContactName] = useState('')
    // ERD uses company_email / company_phone - frontend form sends these to the API
    const [companyEmail, setCompanyEmail] = useState('')
    const [companyPhone, setCompanyPhone] = useState('')
    const [selectedServices, setSelectedServices] = useState([])
    const [formError, setFormError] = useState('')
    const [submitting, setSubmitting] = useState(false)
    const [submitted, setSubmitted] = useState(false)

    useEffect(() => {
        servicesService.getAll()
            .then(setServiceOptions)
            .catch(() => setFormError('Could not load service list.'))
    }, [])

    const toggleService = (service) => {
        const exists = selectedServices.find((s) => s.service_id === service.service_id)
        if (exists) {
            setSelectedServices(selectedServices.filter((s) => s.service_id !== service.service_id))
        } else {
            setSelectedServices([...selectedServices, service])
        }
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setFormError('')

        if (!vendorName.trim() || !contactName.trim() || !companyEmail.trim()) {
            setFormError('Please fill in vendor name, contact name, and email.')
            return
        }

        if (selectedServices.length === 0) {
            setFormError('Please select at least one service.')
            return
        }

        setSubmitting(true)
        try {
            await vendorService.create({
                company_name: vendorName.trim(),
                company_code: vendorCode.trim() || undefined,
                primary_contact_name: contactName.trim(),
                company_email: companyEmail.trim(),
                company_phone: companyPhone.trim() || undefined,
                // Send only the IDs - the backend links them through vendor_services
                service_ids: selectedServices.map((s) => s.service_id),
                status: 'inactive',
                onboarding: true,
            })
            setSubmitted(true)
        } catch (err) {
            setFormError(err.message || 'Failed to submit vendor. Please try again.')
        } finally {
            setSubmitting(false)
        }
    }

    if (submitted) {
        return (
            <div className="add-vendor">
                <div className="add-vendor-success text-center py-5">
                    <div className="add-vendor-success-icon mb-3">
                        <Plus size={24} />
                    </div>
                    <h2 className="fw-bold mb-2">Vendor submitted</h2>
                    <p className="add-vendor-sub mb-4">
                        {vendorName} has been added and is pending review.
                        The vendor will remain inactive until approved.
                    </p>
                    <div className="d-flex justify-content-center gap-3">
                        <button className="add-vendor-btn-secondary" onClick={() => navigate('/vendors')}>
                            Back to directory
                        </button>
                        <button className="add-vendor-btn-primary" onClick={() => {
                            setVendorName('')
                            setVendorCode('')
                            setContactName('')
                            setCompanyEmail('')
                            setCompanyPhone('')
                            setSelectedServices([])
                            setSubmitted(false)
                        }}>
                            Add another
                        </button>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="add-vendor">
            <button className="vendor-back-link d-inline-flex align-items-center gap-2 mb-4" onClick={() => navigate('/vendors')}>
                <ArrowLeft size={16} />
                Back to directory
            </button>

            <div className="mb-4">
                <h1 className="add-vendor-title fw-bold mb-1">Add New Vendor</h1>
                <p className="add-vendor-sub mb-0">
                    New vendors are added as inactive and require review before activation.
                </p>
            </div>

            <form onSubmit={handleSubmit}>
                <div className="add-vendor-card">
                    <h3 className="add-vendor-section-title">Company Information</h3>
                    <div className="row g-3 mb-3">
                        <div className="col-md-6">
                            <label className="form-label add-vendor-label">Vendor Name *</label>
                            <input
                                type="text"
                                className="form-control add-vendor-input"
                                placeholder="Company name"
                                value={vendorName}
                                onChange={(e) => setVendorName(e.target.value)}
                            />
                        </div>
                        <div className="col-md-6">
                            <label className="form-label add-vendor-label">Vendor Code</label>
                            <input
                                type="text"
                                className="form-control add-vendor-input"
                                placeholder="e.g. PWS-001"
                                value={vendorCode}
                                onChange={(e) => setVendorCode(e.target.value)}
                            />
                        </div>
                    </div>
                </div>

                <div className="add-vendor-card">
                    <h3 className="add-vendor-section-title">Primary Contact</h3>
                    <div className="row g-3 mb-3">
                        <div className="col-md-4">
                            <label className="form-label add-vendor-label">Contact Name *</label>
                            <input
                                type="text"
                                className="form-control add-vendor-input"
                                placeholder="Full name"
                                value={contactName}
                                onChange={(e) => setContactName(e.target.value)}
                            />
                        </div>
                        <div className="col-md-4">
                            <label className="form-label add-vendor-label">Email *</label>
                            <input
                                type="email"
                                className="form-control add-vendor-input"
                                placeholder="email@company.com"
                                value={companyEmail}
                                onChange={(e) => setCompanyEmail(e.target.value)}
                            />
                        </div>
                        <div className="col-md-4">
                            <label className="form-label add-vendor-label">Phone</label>
                            <input
                                type="tel"
                                className="form-control add-vendor-input"
                                placeholder="(432) 555-0000"
                                value={companyPhone}
                                onChange={(e) => setCompanyPhone(e.target.value)}
                            />
                        </div>
                    </div>
                </div>

                <div className="add-vendor-card">
                    <h3 className="add-vendor-section-title">Services *</h3>
                    <p className="add-vendor-sub mb-3">Select the services this vendor provides.</p>
                    <div className="d-flex flex-wrap gap-2">
                        {serviceOptions.map((service) => {
                            const isSelected = selectedServices.some((s) => s.service_id === service.service_id)
                            return (
                                <button
                                    key={service.service_id}
                                    type="button"
                                    className={`add-vendor-service-btn d-inline-flex align-items-center gap-1 ${isSelected ? 'selected' : ''}`}
                                    onClick={() => toggleService(service)}
                                >
                                    {isSelected ? <X size={12} /> : <Plus size={12} />}
                                    {service.service}
                                </button>
                            )
                        })}
                    </div>
                </div>

                {formError && (
                    <div className="alert alert-danger add-vendor-alert mb-3" role="alert">
                        {formError}
                    </div>
                )}

                <div className="d-flex gap-3">
                    <button type="button" className="add-vendor-btn-secondary" onClick={() => navigate('/vendors')}>
                        Cancel
                    </button>
                    <button type="submit" className="add-vendor-btn-primary" disabled={submitting}>
                        {submitting ? 'Submitting...' : 'Submit vendor'}
                    </button>
                </div>
            </form>
        </div>
    )
}

export default AddVendor
