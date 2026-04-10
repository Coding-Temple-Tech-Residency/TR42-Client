// temp work order data matching ERD work_orders table
// fields mirror the DBML schema columns
// swap for API calls once endpoints are wired up

// ERD: core.order_status enum values
export const orderStatusOptions = [
    'unassigned',
    'assigned',
    'in progress',
    'completed',
    'halted',
    'rejected',
    'cancelled',
    'closed',
]

// ERD: core.priority_status enum values
export const priorityOptions = ['LOW', 'MEDIUM', 'HIGH']

// ERD: core.location_type enum values
export const locationTypeOptions = ['WELL', 'GPS', 'ADDRESS']

// ERD: core.frequency_type enum values
export const frequencyTypeOptions = ['ONE_TIME', 'DAILY', 'WEEKLY', 'MONTHLY']

// mock clients for the client_id dropdown — from ERD client table
export const clientOptions = [
    { client_id: 'c-001', client_name: 'Permian Basin Energy' },
    { client_id: 'c-002', client_name: 'Midland Operations LLC' },
    { client_id: 'c-003', client_name: 'West TX Drilling Co' },
]

// mock wells for the well_id dropdown — from ERD well table
export const wellOptions = [
    { well_id: 'w-001', well_name: 'Midland Basin #14', api_number: '42-329-33521' },
    { well_id: 'w-002', well_name: 'Delaware Basin #7', api_number: '42-301-44102' },
    { well_id: 'w-003', well_name: 'Howard County #22', api_number: '42-227-55890' },
    { well_id: 'w-004', well_name: 'Reeves County #3', api_number: '42-389-66201' },
]
