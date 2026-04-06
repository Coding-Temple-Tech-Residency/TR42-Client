// temp dashboard data matching backend models
// fields mirror Workorder, Invoice, Vendor from vistaone-api/app/models/
// swap for API calls once endpoints are wired up

export const statCards = [
    { label: 'Active Work Orders', value: 12, change: '+3 this week', status: 'up' },
    { label: 'Pending Invoices', value: 8, change: '$214k outstanding', status: 'neutral' },
    { label: 'Active Vendors', value: 4, change: '2 under review', status: 'neutral' },
    { label: 'Completed (30d)', value: 27, change: '+5 vs prior period', status: 'up' },
]

export const recentWorkorders = [
    { workorder_number: 'WO-2026-041', status: 'in_progress', priority: 'High', client: 'Permian Basin Energy', vendor_name: 'Permian Wellbore Services', scheduled_start: '2026-04-02' },
    { workorder_number: 'WO-2026-039', status: 'assigned', priority: 'Medium', client: 'Midland Operations LLC', vendor_name: 'Basin Pump & Flow', scheduled_start: '2026-04-05' },
    { workorder_number: 'WO-2026-037', status: 'in_progress', priority: 'High', client: 'Permian Basin Energy', vendor_name: 'Midland Pipeline Solutions', scheduled_start: '2026-04-01' },
    { workorder_number: 'WO-2026-035', status: 'completed', priority: 'Low', client: 'West TX Drilling Co', vendor_name: 'Permian Wellbore Services', scheduled_start: '2026-03-28' },
    { workorder_number: 'WO-2026-033', status: 'unassigned', priority: 'Medium', client: 'Midland Operations LLC', vendor_name: null, scheduled_start: '2026-04-08' },
]

export const recentInvoices = [
    { invoice_number: 'INV-2026-088', vendor_name: 'Permian Wellbore Services', total_amount: 48250, status: 'pending', submitted_at: '2026-04-01' },
    { invoice_number: 'INV-2026-085', vendor_name: 'Basin Pump & Flow', total_amount: 31800, status: 'pending', submitted_at: '2026-03-30' },
    { invoice_number: 'INV-2026-081', vendor_name: 'Midland Pipeline Solutions', total_amount: 72400, status: 'accepted', submitted_at: '2026-03-27' },
    { invoice_number: 'INV-2026-078', vendor_name: 'Permian Wellbore Services', total_amount: 19500, status: 'rejected', submitted_at: '2026-03-25' },
]
