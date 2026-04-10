import { useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { vendors, serviceOptions } from '../../data/vendorData'
import {
    priorityOptions,
    locationTypeOptions,
    frequencyTypeOptions,
    clientOptions,
    wellOptions,
} from '../../data/workOrderData'
import '../../styles/WorkOrderCreate.css'

const WorkOrderCreate = () => {
    const navigate = useNavigate()
    const [searchParams] = useSearchParams()

    // pre-fill vendor if coming from vendor detail page
    const preselectedVendor = searchParams.get('vendor') || ''

    // form state matching ERD work_orders columns
    const [form, setForm] = useState({
        client_id: '',
        assigned_vendor: preselectedVendor,
        description: '',
        estimated_start_date: '',
        estimated_end_date: '',
        priority: 'MEDIUM',
        service_type: '',
        location: '',
        location_type: 'WELL',
        well_id: '',
        estimated_cost: '',
        estimated_quantity: '',
        units: '',
        is_recurring: false,
        recurrence_type: 'ONE_TIME',
        comments: '',
    })

    const [formError, setFormError] = useState('')
    const [submitted, setSubmitted] = useState(false)

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target
        setForm({ ...form, [name]: type === 'checkbox' ? checked : value })
        if (formError) setFormError('')
    }

    const handleSubmit = (e) => {
        e.preventDefault()
        setFormError('')

        if (!form.client_id || !form.description || !form.priority || !form.service_type) {
            setFormError('Please fill in client, description, priority, and service type.')
            return
        }

        // this will POST to the API once work order endpoints are ready
        // payload matches ERD work_orders table columns
        console.log('Submitting work order:', {
            ...form,
            current_status: form.assigned_vendor ? 'assigned' : 'unassigned',
            estimated_cost: form.estimated_cost ? parseFloat(form.estimated_cost) : null,
            estimated_quantity: form.estimated_quantity ? parseFloat(form.estimated_quantity) : null,
        })
        setSubmitted(true)
    }

    const selectedVendor = vendors.find((v) => v.vendor_id === form.assigned_vendor)

    if (submitted) {
        return (
            <div className="wo-create">
                <div className="wo-create-success text-center py-5">
                    <h2 className="fw-bold mb-2">Work order created</h2>
                    <p className="wo-create-sub mb-4">
                        The work order has been created and is {form.assigned_vendor ? 'assigned to ' + (selectedVendor?.company_name || 'vendor') : 'unassigned'}.
                    </p>
                    <div className="d-flex justify-content-center gap-3">
                        <button className="wo-btn-secondary" onClick={() => navigate('/vendors')}>
                            Back to marketplace
                        </button>
                        <button className="wo-btn-primary" onClick={() => {
                            setForm({
                                client_id: '', assigned_vendor: '', description: '',
                                estimated_start_date: '', estimated_end_date: '', priority: 'MEDIUM',
                                service_type: '', location: '', location_type: 'WELL', well_id: '',
                                estimated_cost: '', estimated_quantity: '', units: '',
                                is_recurring: false, recurrence_type: 'ONE_TIME', comments: '',
                            })
                            setSubmitted(false)
                        }}>
                            Create another
                        </button>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="wo-create">
            <button className="wo-back-link d-inline-flex align-items-center gap-2 mb-4" onClick={() => navigate(-1)}>
                <ArrowLeft size={16} />
                Back
            </button>

            <div className="mb-4">
                <h1 className="wo-create-title fw-bold mb-1">Create Work Order</h1>
                <p className="wo-create-sub mb-0">
                    Fill out the details below to create a new work order.
                </p>
            </div>

            <form onSubmit={handleSubmit}>
                <div className="wo-card">
                    <h3 className="wo-section-title">Assignment</h3>
                    <div className="row g-3 mb-3">
                        <div className="col-md-6">
                            <label className="form-label wo-label">Client *</label>
                            <select name="client_id" className="form-select wo-input" value={form.client_id} onChange={handleChange}>
                                <option value="">Select client</option>
                                {clientOptions.map((c) => (
                                    <option key={c.client_id} value={c.client_id}>{c.client_name}</option>
                                ))}
                            </select>
                        </div>
                        <div className="col-md-6">
                            <label className="form-label wo-label">Assign Vendor</label>
                            <select name="assigned_vendor" className="form-select wo-input" value={form.assigned_vendor} onChange={handleChange}>
                                <option value="">Unassigned</option>
                                {vendors.filter((v) => v.status === 'active').map((v) => (
                                    <option key={v.vendor_id} value={v.vendor_id}>{v.company_name}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                </div>

                <div className="wo-card">
                    <h3 className="wo-section-title">Details</h3>
                    <div className="mb-3">
                        <label className="form-label wo-label">Description *</label>
                        <textarea name="description" className="form-control wo-input" rows="3" placeholder="Describe the work to be performed" value={form.description} onChange={handleChange} maxLength={500} />
                    </div>
                    <div className="row g-3 mb-3">
                        <div className="col-md-4">
                            <label className="form-label wo-label">Service Type *</label>
                            <select name="service_type" className="form-select wo-input" value={form.service_type} onChange={handleChange}>
                                <option value="">Select service</option>
                                {serviceOptions.map((s) => (
                                    <option key={s.service_id} value={s.service_id}>{s.service}</option>
                                ))}
                            </select>
                        </div>
                        <div className="col-md-4">
                            <label className="form-label wo-label">Priority *</label>
                            <select name="priority" className="form-select wo-input" value={form.priority} onChange={handleChange}>
                                {priorityOptions.map((p) => (
                                    <option key={p} value={p}>{p}</option>
                                ))}
                            </select>
                        </div>
                        <div className="col-md-4">
                            <label className="form-label wo-label">Comments</label>
                            <input type="text" name="comments" className="form-control wo-input" placeholder="Optional notes" value={form.comments} onChange={handleChange} maxLength={500} />
                        </div>
                    </div>
                </div>

                <div className="wo-card">
                    <h3 className="wo-section-title">Location</h3>
                    <div className="row g-3 mb-3">
                        <div className="col-md-4">
                            <label className="form-label wo-label">Location Type</label>
                            <select name="location_type" className="form-select wo-input" value={form.location_type} onChange={handleChange}>
                                {locationTypeOptions.map((lt) => (
                                    <option key={lt} value={lt}>{lt}</option>
                                ))}
                            </select>
                        </div>
                        {form.location_type === 'WELL' && (
                            <div className="col-md-4">
                                <label className="form-label wo-label">Well</label>
                                <select name="well_id" className="form-select wo-input" value={form.well_id} onChange={handleChange}>
                                    <option value="">Select well</option>
                                    {wellOptions.map((w) => (
                                        <option key={w.well_id} value={w.well_id}>{w.well_name} ({w.api_number})</option>
                                    ))}
                                </select>
                            </div>
                        )}
                        {form.location_type !== 'WELL' && (
                            <div className="col-md-4">
                                <label className="form-label wo-label">Location</label>
                                <input type="text" name="location" className="form-control wo-input" placeholder={form.location_type === 'GPS' ? 'Lat, Long' : 'Street address'} value={form.location} onChange={handleChange} />
                            </div>
                        )}
                    </div>
                </div>

                <div className="wo-card">
                    <h3 className="wo-section-title">Scheduling</h3>
                    <div className="row g-3 mb-3">
                        <div className="col-md-3">
                            <label className="form-label wo-label">Est. Start Date</label>
                            <input type="date" name="estimated_start_date" className="form-control wo-input" value={form.estimated_start_date} onChange={handleChange} />
                        </div>
                        <div className="col-md-3">
                            <label className="form-label wo-label">Est. End Date</label>
                            <input type="date" name="estimated_end_date" className="form-control wo-input" value={form.estimated_end_date} onChange={handleChange} />
                        </div>
                        <div className="col-md-3">
                            <div className="form-check mt-4">
                                <input type="checkbox" name="is_recurring" className="form-check-input" checked={form.is_recurring} onChange={handleChange} id="isRecurring" />
                                <label className="form-check-label wo-label" htmlFor="isRecurring">Recurring</label>
                            </div>
                        </div>
                        {form.is_recurring && (
                            <div className="col-md-3">
                                <label className="form-label wo-label">Frequency</label>
                                <select name="recurrence_type" className="form-select wo-input" value={form.recurrence_type} onChange={handleChange}>
                                    {frequencyTypeOptions.map((f) => (
                                        <option key={f} value={f}>{f.replace('_', ' ')}</option>
                                    ))}
                                </select>
                            </div>
                        )}
                    </div>
                </div>

                <div className="wo-card">
                    <h3 className="wo-section-title">Estimates</h3>
                    <div className="row g-3 mb-3">
                        <div className="col-md-4">
                            <label className="form-label wo-label">Estimated Cost ($)</label>
                            <input type="number" name="estimated_cost" className="form-control wo-input" placeholder="0.00" step="0.01" value={form.estimated_cost} onChange={handleChange} />
                        </div>
                        <div className="col-md-4">
                            <label className="form-label wo-label">Estimated Quantity</label>
                            <input type="number" name="estimated_quantity" className="form-control wo-input" placeholder="0" step="0.1" value={form.estimated_quantity} onChange={handleChange} />
                        </div>
                        <div className="col-md-4">
                            <label className="form-label wo-label">Units</label>
                            <input type="text" name="units" className="form-control wo-input" placeholder="e.g. barrels, hours" value={form.units} onChange={handleChange} />
                        </div>
                    </div>
                </div>

                {formError && (
                    <div className="alert alert-danger wo-alert mb-3" role="alert">
                        {formError}
                    </div>
                )}

                <div className="d-flex gap-3">
                    <button type="button" className="wo-btn-secondary" onClick={() => navigate(-1)}>Cancel</button>
                    <button type="submit" className="wo-btn-primary">Create work order</button>
                </div>
            </form>
        </div>
    )
}

export default WorkOrderCreate
