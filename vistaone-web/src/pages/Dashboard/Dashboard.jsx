import { useNavigate } from 'react-router-dom'
import { TrendingUp, FileText, Users, ClipboardList } from 'lucide-react'
import { statCards, recentWorkorders, recentInvoices } from '../../data/dashboardData'
import '../../styles/Dashboard.css'

const Dashboard = () => {
    const navigate = useNavigate()

    return (
        <div className="dashboard">
            <div className="dashboard-header mb-4">
                <h1 className="dashboard-title fw-bold mb-1">Dashboard</h1>
                <p className="dashboard-subtitle mb-0">Overview of operations, work orders, and invoices</p>
            </div>

            {/* stat cards row */}
            <div className="dashboard-stats d-flex flex-wrap gap-3 mb-4">
                {statCards.map((card) => (
                    <div key={card.label} className="dashboard-stat-card">
                        <p className="dashboard-stat-label mb-1">{card.label}</p>
                        <p className="dashboard-stat-value fw-bold mb-1">{card.value}</p>
                        <p className={`dashboard-stat-change mb-0 ${card.status === 'up' ? 'stat-up' : ''}`}>
                            {card.status === 'up' && '↑ '}{card.change}
                        </p>
                    </div>
                ))}
            </div>

            {/* work orders and invoices side by side */}
            <div className="dashboard-panels d-flex gap-3">

                {/* recent work orders */}
                <div className="dashboard-panel">
                    <div className="dashboard-panel-header d-flex justify-content-between align-items-center mb-3">
                        <h3 className="dashboard-panel-title d-flex align-items-center gap-2 mb-0">
                            <ClipboardList size={16} />
                            Recent Work Orders
                        </h3>
                    </div>

                    <div className="dashboard-panel-body">
                        {recentWorkorders.map((wo) => (
                            <div key={wo.work_order_id} className="dashboard-row d-flex align-items-center justify-content-between">
                                <div>
                                    <p className="dashboard-row-primary fw-semibold mb-0">{wo.work_order_id}</p>
                                    <p className="dashboard-row-secondary mb-0">
                                        {wo.assigned_vendor_name || 'Unassigned'} · {wo.client_name}
                                    </p>
                                </div>
                                <div className="d-flex align-items-center gap-2">
                                    <span className={`dashboard-badge ${
                                        wo.priority === 'HIGH' ? 'badge-high'
                                        : wo.priority === 'LOW' ? 'badge-low'
                                        : 'badge-medium'
                                    }`}>
                                        {wo.priority}
                                    </span>
                                    <span className={`dashboard-badge ${
                                        wo.current_status === 'completed' ? 'badge-completed'
                                        : wo.current_status === 'in progress' ? 'badge-active'
                                        : wo.current_status === 'assigned' ? 'badge-assigned'
                                        : 'badge-unassigned'
                                    }`}>
                                        {wo.current_status}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* recent invoices */}
                <div className="dashboard-panel">
                    <div className="dashboard-panel-header d-flex justify-content-between align-items-center mb-3">
                        <h3 className="dashboard-panel-title d-flex align-items-center gap-2 mb-0">
                            <FileText size={16} />
                            Recent Invoices
                        </h3>
                    </div>

                    <div className="dashboard-panel-body">
                        {recentInvoices.map((inv) => (
                            <div key={inv.invoice_id} className="dashboard-row d-flex align-items-center justify-content-between">
                                <div>
                                    <p className="dashboard-row-primary fw-semibold mb-0">{inv.invoice_id}</p>
                                    <p className="dashboard-row-secondary mb-0">
                                        {inv.vendor_name} · {inv.invoice_date}
                                    </p>
                                </div>
                                <div className="d-flex align-items-center gap-3">
                                    <span className="dashboard-row-amount fw-semibold">
                                        ${inv.total_amount.toLocaleString()}
                                    </span>
                                    <span className={`dashboard-badge ${
                                        inv.invoice_status === 'approved' ? 'badge-completed'
                                        : inv.invoice_status === 'rejected' ? 'badge-high'
                                        : 'badge-pending'
                                    }`}>
                                        {inv.invoice_status}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* quick links */}
            <div className="dashboard-quick-links d-flex gap-3 mt-4">
                <button className="dashboard-link-btn d-flex align-items-center gap-2" onClick={() => navigate('/vendors')}>
                    <Users size={16} />
                    Vendor Directory
                </button>
                <button className="dashboard-link-btn d-flex align-items-center gap-2" onClick={() => navigate('/vendors/add')}>
                    <Users size={16} />
                    Add Vendor
                </button>
            </div>
        </div>
    )
}

export default Dashboard
