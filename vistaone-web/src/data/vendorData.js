// temp vendor data matching the backend Vendor model
// fields mirror vistaone-api/app/models.py Vendor, Service, MSA, InsurancePolicy, License
// swap these imports for API calls once endpoints are wired up

export const vendors = [
    {
        vendor_id: 'v-001',
        vendor_name: 'Permian Wellbore Services',
        vendor_code: 'PWS-001',
        primary_contact_name: 'Carlos Mendez',
        contact_email: 'cmendez@permianwell.com',
        contact_phone: '(432) 555-0142',
        status: 'active',
        created_at: '2025-08-12',
        services: [
            { service_id: 's-001', name: 'Wellbore Integrity', code: 'WBI' },
            { service_id: 's-003', name: 'Well Cleaning', code: 'WCL' },
        ],
        msas: [
            { msa_id: 'm-001', msa_number: 'MSA-2025-014', status: 'complete', effective_date: '2025-08-01', expiry_date: '2026-08-01' },
        ],
        insurance_policies: [
            { insurance_id: 'i-001', insurer_name: 'Permian Mutual', policy_number: 'PM-88421', coverage_end: '2026-12-15' },
        ],
        licenses: [
            { license_id: 'l-001', license_type: 'State Operating', license_number: 'TX-OPS-4821', valid_to: '2027-03-01' },
        ],
    },
    {
        vendor_id: 'v-002',
        vendor_name: 'Basin Pump & Flow',
        vendor_code: 'BPF-002',
        primary_contact_name: 'Dana Reyes',
        contact_email: 'dreyes@basinpump.com',
        contact_phone: '(432) 555-0198',
        status: 'active',
        created_at: '2025-06-20',
        services: [
            { service_id: 's-005', name: 'Water Transportation', code: 'WTR' },
            { service_id: 's-006', name: 'Water Refill', code: 'WRF' },
            { service_id: 's-012', name: 'Pump Replacement', code: 'PMP' },
        ],
        msas: [
            { msa_id: 'm-002', msa_number: 'MSA-2025-009', status: 'complete', effective_date: '2025-06-01', expiry_date: '2026-06-01' },
        ],
        insurance_policies: [
            { insurance_id: 'i-002', insurer_name: 'West TX Insurance', policy_number: 'WTI-33102', coverage_end: '2026-09-30' },
        ],
        licenses: [
            { license_id: 'l-002', license_type: 'State Operating', license_number: 'TX-OPS-3310', valid_to: '2026-11-15' },
        ],
    },
    {
        vendor_id: 'v-003',
        vendor_name: 'West Texas Cementing',
        vendor_code: 'WTC-003',
        primary_contact_name: 'James Whitfield',
        contact_email: 'jwhitfield@wtcement.com',
        contact_phone: '(432) 555-0267',
        status: 'inactive',
        created_at: '2026-03-28',
        services: [
            { service_id: 's-009', name: 'Cementing Services', code: 'CEM' },
        ],
        msas: [
            { msa_id: 'm-003', msa_number: 'MSA-2026-001', status: 'expired', effective_date: '2025-03-01', expiry_date: '2026-03-01' },
        ],
        insurance_policies: [
            { insurance_id: 'i-003', insurer_name: 'Basin Coverage Co', policy_number: 'BCC-10044', coverage_end: '2026-04-01' },
        ],
        licenses: [
            { license_id: 'l-003', license_type: 'State Operating', license_number: 'TX-OPS-6712', valid_to: '2026-06-30' },
        ],
    },
    {
        vendor_id: 'v-004',
        vendor_name: 'Midland Pipeline Solutions',
        vendor_code: 'MPS-004',
        primary_contact_name: 'Priya Sharma',
        contact_email: 'psharma@midlandpipe.com',
        contact_phone: '(432) 555-0314',
        status: 'active',
        created_at: '2025-04-15',
        services: [
            { service_id: 's-007', name: 'Oil Transportation', code: 'OTR' },
            { service_id: 's-010', name: 'Pipeline Survey', code: 'PLS' },
            { service_id: 's-011', name: 'Plug & Abandon', code: 'PNA' },
        ],
        msas: [
            { msa_id: 'm-004', msa_number: 'MSA-2025-003', status: 'complete', effective_date: '2025-04-01', expiry_date: '2027-04-01' },
        ],
        insurance_policies: [
            { insurance_id: 'i-004', insurer_name: 'Permian Mutual', policy_number: 'PM-90215', coverage_end: '2027-01-20' },
        ],
        licenses: [
            { license_id: 'l-004', license_type: 'State Operating', license_number: 'TX-OPS-2290', valid_to: '2027-05-10' },
        ],
    },
    {
        vendor_id: 'v-005',
        vendor_name: 'Sandstorm Stimulation',
        vendor_code: 'SST-005',
        primary_contact_name: 'Marcus Bell',
        contact_email: 'mbell@sandstormstim.com',
        contact_phone: '(432) 555-0089',
        status: 'inactive',
        created_at: '2026-01-10',
        services: [
            { service_id: 's-013', name: 'Stimulation Services', code: 'STM' },
            { service_id: 's-004', name: 'Well Refill', code: 'WFL' },
        ],
        msas: [
            { msa_id: 'm-005', msa_number: 'MSA-2025-021', status: 'incomplete', effective_date: '2025-12-01', expiry_date: '2026-12-01' },
        ],
        insurance_policies: [
            { insurance_id: 'i-005', insurer_name: 'Basin Coverage Co', policy_number: 'BCC-11200', coverage_end: '2025-11-01' },
        ],
        licenses: [
            { license_id: 'l-005', license_type: 'State Operating', license_number: 'TX-OPS-8871', valid_to: '2025-12-31' },
        ],
    },
    {
        vendor_id: 'v-006',
        vendor_name: 'Eagle Ford Logistics',
        vendor_code: 'EFL-006',
        primary_contact_name: 'Teresa Nguyen',
        contact_email: 'tnguyen@eaglefordlog.com',
        contact_phone: '(432) 555-0451',
        status: 'inactive',
        created_at: '2024-11-03',
        services: [
            { service_id: 's-005', name: 'Water Transportation', code: 'WTR' },
            { service_id: 's-007', name: 'Oil Transportation', code: 'OTR' },
            { service_id: 's-008', name: 'Flowback Operations', code: 'FBK' },
        ],
        msas: [
            { msa_id: 'm-006', msa_number: 'MSA-2024-018', status: 'expired', effective_date: '2024-06-01', expiry_date: '2025-06-01' },
        ],
        insurance_policies: [
            { insurance_id: 'i-006', insurer_name: 'Lone Star Underwriters', policy_number: 'LSU-44021', coverage_end: '2025-06-15' },
        ],
        licenses: [
            { license_id: 'l-006', license_type: 'State Operating', license_number: 'TX-OPS-1105', valid_to: '2025-09-01' },
        ],
    },
]

// all service options for filters and the add vendor form
// matches the Service model in the backend
export const serviceOptions = [
    { service_id: 's-001', name: 'Wellbore Integrity', code: 'WBI' },
    { service_id: 's-002', name: 'Casing Inspection', code: 'CSI' },
    { service_id: 's-003', name: 'Well Cleaning', code: 'WCL' },
    { service_id: 's-004', name: 'Well Refill', code: 'WFL' },
    { service_id: 's-005', name: 'Water Transportation', code: 'WTR' },
    { service_id: 's-006', name: 'Water Refill', code: 'WRF' },
    { service_id: 's-007', name: 'Oil Transportation', code: 'OTR' },
    { service_id: 's-008', name: 'Flowback Operations', code: 'FBK' },
    { service_id: 's-009', name: 'Cementing Services', code: 'CEM' },
    { service_id: 's-010', name: 'Pipeline Survey', code: 'PLS' },
    { service_id: 's-011', name: 'Plug & Abandon', code: 'PNA' },
    { service_id: 's-012', name: 'Pump Replacement', code: 'PMP' },
    { service_id: 's-013', name: 'Stimulation Services', code: 'STM' },
]
