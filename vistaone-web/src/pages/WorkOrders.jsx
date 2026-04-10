import { useEffect, useMemo, useState } from 'react';
import AppShell from '../components/AppShell';
import { useWorkOrder } from '../hooks/useWorkOrder';
import '../styles/workorder.css';

const vendorOptions = [
    'ABC Trucking Co.',
    'Midland Field Services',
    'Texas Sand & Gravel',
    'Odessa Water Transport',
    'Permian Basin Logistics',
];

const jobTypeOptions = [
    'Water Hauling',
    'Roustabout Crew',
    'Sand Delivery',
    'Equipment Repair',
    'Site Inspection',
];

const statusOptions = ['all', 'pending', 'in_progress', 'completed'];

const recurringOptions = [
    { value: 'weekly', label: 'Weekly' },
    { value: 'biweekly', label: 'Bi-Weekly' },
    { value: 'monthly', label: 'Monthly' },
];

const emptyForm = {
    jobType: jobTypeOptions[0],
    volume: '',
    description: '',
    vendor: vendorOptions[0],
    locationMethod: 'api',
    apiNumber: '',
    gpsCoordinates: '',
    physicalAddress: '',
    date: '',
    endDate: '',
    priority: 'medium',
    recurring: false,
    recurringInterval: '',
};

export default function WorkOrders() {
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [showModal, setShowModal] = useState(false);
    const [formData, setFormData] = useState(emptyForm);
    const {
        workOrders,
        loading,
        fetchWorkOrders,
        createWorkOrder,
        // updateWorkOrder,
        // removeWorkOrder
    } = useWorkOrder();

    useEffect(() => {
        fetchWorkOrders();
    }, []);

    const filteredOrders = useMemo(() => {
        const normalizedSearch = searchTerm.trim().toLowerCase();
        return workOrders.filter(order => {
            const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
            const matchesSearch =
                order.title.toLowerCase().includes(normalizedSearch) ||
                order.location.toLowerCase().includes(normalizedSearch);
            return matchesStatus && matchesSearch;
        });
    }, [workOrders, searchTerm, statusFilter]);

    const handleOpenModal = () => setShowModal(true);
    const handleCloseModal = () => {
        setShowModal(false);
        setFormData(emptyForm);
    };

    const handleFormChange = e => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value,
        }));
    };

    const handleCreateWorkOrder = e => {
        e.preventDefault();
        const nextOrderNumber = 450 + workOrders.length;
        let locationDisplay = '';
        if (formData.locationMethod === 'api') locationDisplay = formData.apiNumber.trim();
        else if (formData.locationMethod === 'gps') locationDisplay = formData.gpsCoordinates.trim();
        else locationDisplay = formData.physicalAddress.trim();

        const newWorkOrder = {
            id: Date.now(),
            orderId: `SO-${nextOrderNumber}`,
            jobType: formData.jobType,
            title: `${formData.jobType}${formData.volume ? ' - ' + formData.volume : ''}`,
            description: formData.description.trim(),
            vendor: formData.vendor,
            location: locationDisplay,
            priority: formData.priority,
            status: 'pending',
            createdDate: new Date().toISOString().split('T')[0],
        };

        if (!locationDisplay || !formData.jobType) return;
         createWorkOrder(newWorkOrder);
        handleCloseModal();
    };

    const formatDate = dateString =>
        new Date(dateString).toLocaleDateString('en-GB', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
        });

    const formatStatusLabel = status => status.replace('_', ' ');

    return (
        <AppShell title="Work Orders" subtitle="Manage field work orders">
            <section className="workorders-controls">
                <input
                    type="search"
                    className="workorders-search"
                    placeholder="Search"
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                />
                <select
                    className="workorders-filter"
                    value={statusFilter}
                    onChange={e => setStatusFilter(e.target.value)}
                >
                    {statusOptions.map(status => (
                        <option key={status} value={status}>
                            {status}
                        </option>
                    ))}
                </select>
                <button className="workorders-create-btn" onClick={handleOpenModal}>
                    Create Work Order
                </button>
            </section>

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
                                <th>Location</th>
                                <th>Date</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredOrders.map(order => (
                                <tr key={order.id}>
                                    <td>{order.orderId}</td>
                                    <td>{order.vendor}</td>
                                    <td>{order.jobType}</td>
                                    <td>{order.location}</td>
                                    <td>{formatDate(order.createdDate)}</td>
                                    <td>
                                        <span className={`status-badge status-${order.status}`}>
                                            {formatStatusLabel(order.status)}
                                        </span>
                                    </td>
                                    <td className="workorders-actions-cell">
                                        <button className="workorders-action-btn">View</button>
                                        <button className="workorders-action-btn workorders-action-btn-secondary">Edit</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </section>

            {showModal && (
                <div className="workorders-modal-overlay" onClick={handleCloseModal}>
                    <div className="workorders-modal" onClick={e => e.stopPropagation()}>
                        <div className="workorders-modal-header">
                            <h2>Create Work Order</h2>
                            <button className="workorders-close-btn" onClick={handleCloseModal}>
                                ×
                            </button>
                        </div>
                        <form className="workorders-form" onSubmit={handleCreateWorkOrder}>
                            <div className="workorders-form-row">
                                <label>
                                    Job Type
                                    <select name="jobType" value={formData.jobType} onChange={handleFormChange}>
                                        {jobTypeOptions.map(type => (
                                            <option key={type} value={type}>
                                                {type}
                                            </option>
                                        ))}
                                    </select>
                                </label>
                                <label>
                                    Volume / Units
                                    <input
                                        type="text"
                                        name="volume"
                                        placeholder="e.g., 120 BBL"
                                        value={formData.volume}
                                        onChange={handleFormChange}
                                    />
                                </label>
                            </div>
                            <label>
                                Description
                                <textarea name="description" rows="3" value={formData.description} onChange={handleFormChange} />
                            </label>
                            <label>
                                Vendor
                                <select name="vendor" value={formData.vendor} onChange={handleFormChange}>
                                    {vendorOptions.map(v => (
                                        <option key={v} value={v}>
                                            {v}
                                        </option>
                                    ))}
                                </select>
                            </label>
                            {/* Location method */}
                            <fieldset className="workorders-form-fieldset">
                                <legend>Location Method</legend>
                                <div className="workorders-radio-group">
                                    <label>
                                        <input
                                            type="radio"
                                            name="locationMethod"
                                            value="api"
                                            checked={formData.locationMethod === 'api'}
                                            onChange={handleFormChange}
                                        />
                                        API Well Number
                                    </label>
                                    <label>
                                        <input
                                            type="radio"
                                            name="locationMethod"
                                            value="gps"
                                            checked={formData.locationMethod === 'gps'}
                                            onChange={handleFormChange}
                                        />
                                        GPS Coordinates
                                    </label>
                                    <label>
                                        <input
                                            type="radio"
                                            name="locationMethod"
                                            value="address"
                                            checked={formData.locationMethod === 'address'}
                                            onChange={handleFormChange}
                                        />
                                        Physical Address
                                    </label>
                                </div>
                            </fieldset>
                            {/* Conditional location inputs */}
                            {formData.locationMethod === 'api' && (
                                <input
                                    type="text"
                                    name="apiNumber"
                                    placeholder="API-42-002-03456"
                                    value={formData.apiNumber}
                                    onChange={handleFormChange}
                                    required
                                />
                            )}
                            {formData.locationMethod === 'gps' && (
                                <input
                                    type="text"
                                    name="gpsCoordinates"
                                    placeholder="31.7451, -102.5028"
                                    value={formData.gpsCoordinates}
                                    onChange={handleFormChange}
                                    required
                                />
                            )}
                            {formData.locationMethod === 'address' && (
                                <input
                                    type="text"
                                    name="physicalAddress"
                                    placeholder="Tank Battery A, South Lease"
                                    value={formData.physicalAddress}
                                    onChange={handleFormChange}
                                    required
                                />
                            )}
                            {/* Date, priority, recurring */}
                            <div className="workorders-form-row">
                                <label>
                                    Start Date
                                    <input type="date" name="date" value={formData.date} onChange={handleFormChange} required />
                                </label>
                                <label>
                                    Priority
                                    <select name="priority" value={formData.priority} onChange={handleFormChange}>
                                        <option value="low">Low</option>
                                        <option value="medium">Medium</option>
                                        <option value="high">High</option>
                                    </select>
                                </label>
                            </div>
                            <label>
                                <input
                                    type="checkbox"
                                    name="recurring"
                                    checked={formData.recurring}
                                    onChange={handleFormChange}
                                />
                                Recurring Work Order
                            </label>
                            {formData.recurring && (
                                <div className="workorders-form-row">
                                    <label>
                                        End Date
                                        <input type="date" name="endDate" value={formData.endDate} onChange={handleFormChange} required />
                                    </label>
                                    <label>
                                        Recurring Interval
                                        <select
                                            name="recurringInterval"
                                            value={formData.recurringInterval}
                                            onChange={handleFormChange}
                                            required
                                        >
                                            <option value="">Select interval</option>
                                            {recurringOptions.map(opt => (
                                                <option key={opt.value} value={opt.value}>
                                                    {opt.label}
                                                </option>
                                            ))}
                                        </select>
                                    </label>
                                </div>
                            )}
                            <button type="submit" className="workorders-submit-btn">
                                Create Work Order
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </AppShell>
    );
}