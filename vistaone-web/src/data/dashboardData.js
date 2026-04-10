// temp dashboard data matching ERD schema
// fields mirror work_orders, invoice, vendor tables from DBML
// swap for API calls once endpoints are wired up

export const statCards = [
    { label: 'Active Work Orders', value: 12, change: '+3 this week', status: 'up' },
    { label: 'Pending Invoices', value: 8, change: '$214k outstanding', status: 'neutral' },
    { label: 'Active Vendors', value: 4, change: '2 under review', status: 'neutral' },
    { label: 'Completed (30d)', value: 27, change: '+5 vs prior period', status: 'up' },
]

// ERD: work_orders table — work_order_id (text PK), current_status (core.order_status), priority (core.priority_status)
// display fields like client_name and company_name come from FK joins in a real API response
export const recentWorkorders = [
    { work_order_id: 'WO-2026-041', current_status: 'in progress', priority: 'HIGH', client_name: 'Permian Basin Energy', assigned_vendor_name: 'Permian Wellbore Services', estimated_start_date: '2026-04-02' },
    { work_order_id: 'WO-2026-039', current_status: 'assigned', priority: 'MEDIUM', client_name: 'Midland Operations LLC', assigned_vendor_name: 'Basin Pump & Flow', estimated_start_date: '2026-04-05' },
    { work_order_id: 'WO-2026-037', current_status: 'in progress', priority: 'HIGH', client_name: 'Permian Basin Energy', assigned_vendor_name: 'Midland Pipeline Solutions', estimated_start_date: '2026-04-01' },
    { work_order_id: 'WO-2026-035', current_status: 'completed', priority: 'LOW', client_name: 'West TX Drilling Co', assigned_vendor_name: 'Permian Wellbore Services', estimated_start_date: '2026-03-28' },
    { work_order_id: 'WO-2026-033', current_status: 'unassigned', priority: 'MEDIUM', client_name: 'Midland Operations LLC', assigned_vendor_name: null, estimated_start_date: '2026-04-08' },
]

// ERD: invoice table — invoice_id (text PK), invoice_status (core.invoice_statuses), total_amount (decimal)
// display fields like company_name come from FK joins in a real API response
export const recentInvoices = [
    { invoice_id: 'INV-2026-088', vendor_name: 'Permian Wellbore Services', total_amount: 48250, invoice_status: 'submitted', invoice_date: '2026-04-01' },
    { invoice_id: 'INV-2026-085', vendor_name: 'Basin Pump & Flow', total_amount: 31800, invoice_status: 'submitted', invoice_date: '2026-03-30' },
    { invoice_id: 'INV-2026-081', vendor_name: 'Midland Pipeline Solutions', total_amount: 72400, invoice_status: 'approved', invoice_date: '2026-03-27' },
    { invoice_id: 'INV-2026-078', vendor_name: 'Permian Wellbore Services', total_amount: 19500, invoice_status: 'rejected', invoice_date: '2026-03-25' },
]
