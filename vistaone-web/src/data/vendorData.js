// temp vendor data matching the ERD vendor table
// fields mirror the DBML schema: vendor, services, msa, insurance, licenses
// swap these imports for API calls once endpoints are wired up

export const vendors = [
    {
        vendor_id: 'v-001',
        company_name: 'Permian Wellbore Services',
        company_code: 'PWS-001',
        primary_contact_name: 'Carlos Mendez',
        contact_email: 'cmendez@permianwell.com',
        contact_phone: '(432) 555-0142',
        status: 'active',
        onboarding: false,
        compliance_status: 'complete',
        description: 'Full-service wellbore integrity and cleaning provider',
        start_date: '2025-08-12',
        created_at: '2025-08-12',
        services: [
            { service_id: 's-001', service: 'Wellbore Integrity' },
            { service_id: 's-003', service: 'Well Cleaning' },
        ],
        msas: [
            { msa_id: 'm-001', version: '1.0', status: 'active', effective_date: '2025-08-01', expiration_date: '2026-08-01' },
        ],
        insurance_policies: [
            { insurance_id: 'i-001', insurance_type: 'General Liability', provider_name: 'Permian Mutual', policy_number: 88421, provider_phone: '(432) 555-9000', coverage_amount: 1000000, insurance_verified: true, expiration_date: '2026-12-15' },
        ],
        licenses: [
            { license_id: 'l-001', license_type: 'State Operating', license_number: 'TX-OPS-4821', license_state: 'TX', license_expiration_date: '2027-03-01' },
        ],
    },
    {
        vendor_id: 'v-002',
        company_name: 'Basin Pump & Flow',
        company_code: 'BPF-002',
        primary_contact_name: 'Dana Reyes',
        contact_email: 'dreyes@basinpump.com',
        contact_phone: '(432) 555-0198',
        status: 'active',
        onboarding: false,
        compliance_status: 'complete',
        description: 'Water transport, refill, and pump replacement services',
        start_date: '2025-06-20',
        created_at: '2025-06-20',
        services: [
            { service_id: 's-005', service: 'Water Transportation' },
            { service_id: 's-006', service: 'Water Refill' },
            { service_id: 's-012', service: 'Pump Replacement' },
        ],
        msas: [
            { msa_id: 'm-002', version: '1.0', status: 'active', effective_date: '2025-06-01', expiration_date: '2026-06-01' },
        ],
        insurance_policies: [
            { insurance_id: 'i-002', insurance_type: 'General Liability', provider_name: 'West TX Insurance', policy_number: 33102, provider_phone: '(432) 555-8100', coverage_amount: 750000, insurance_verified: true, expiration_date: '2026-09-30' },
        ],
        licenses: [
            { license_id: 'l-002', license_type: 'State Operating', license_number: 'TX-OPS-3310', license_state: 'TX', license_expiration_date: '2026-11-15' },
        ],
    },
    {
        vendor_id: 'v-003',
        company_name: 'West Texas Cementing',
        company_code: 'WTC-003',
        primary_contact_name: 'James Whitfield',
        contact_email: 'jwhitfield@wtcement.com',
        contact_phone: '(432) 555-0267',
        status: 'inactive',
        onboarding: false,
        compliance_status: 'expired',
        description: 'Cementing services for well construction and remediation',
        start_date: '2026-03-28',
        created_at: '2026-03-28',
        services: [
            { service_id: 's-009', service: 'Cementing Services' },
        ],
        msas: [
            { msa_id: 'm-003', version: '1.0', status: 'expired', effective_date: '2025-03-01', expiration_date: '2026-03-01' },
        ],
        insurance_policies: [
            { insurance_id: 'i-003', insurance_type: 'General Liability', provider_name: 'Basin Coverage Co', policy_number: 10044, provider_phone: '(432) 555-7200', coverage_amount: 500000, insurance_verified: true, expiration_date: '2026-04-01' },
        ],
        licenses: [
            { license_id: 'l-003', license_type: 'State Operating', license_number: 'TX-OPS-6712', license_state: 'TX', license_expiration_date: '2026-06-30' },
        ],
    },
    {
        vendor_id: 'v-004',
        company_name: 'Midland Pipeline Solutions',
        company_code: 'MPS-004',
        primary_contact_name: 'Priya Sharma',
        contact_email: 'psharma@midlandpipe.com',
        contact_phone: '(432) 555-0314',
        status: 'active',
        onboarding: false,
        compliance_status: 'complete',
        description: 'Pipeline survey, transportation, and plug & abandon services',
        start_date: '2025-04-15',
        created_at: '2025-04-15',
        services: [
            { service_id: 's-007', service: 'Oil Transportation' },
            { service_id: 's-010', service: 'Pipeline Survey' },
            { service_id: 's-011', service: 'Plug & Abandon' },
        ],
        msas: [
            { msa_id: 'm-004', version: '1.0', status: 'active', effective_date: '2025-04-01', expiration_date: '2027-04-01' },
        ],
        insurance_policies: [
            { insurance_id: 'i-004', insurance_type: 'General Liability', provider_name: 'Permian Mutual', policy_number: 90215, provider_phone: '(432) 555-9000', coverage_amount: 2000000, insurance_verified: true, expiration_date: '2027-01-20' },
        ],
        licenses: [
            { license_id: 'l-004', license_type: 'State Operating', license_number: 'TX-OPS-2290', license_state: 'TX', license_expiration_date: '2027-05-10' },
        ],
    },
    {
        vendor_id: 'v-005',
        company_name: 'Sandstorm Stimulation',
        company_code: 'SST-005',
        primary_contact_name: 'Marcus Bell',
        contact_email: 'mbell@sandstormstim.com',
        contact_phone: '(432) 555-0089',
        status: 'inactive',
        onboarding: false,
        compliance_status: 'incomplete',
        description: 'Stimulation and well refill operations',
        start_date: '2026-01-10',
        created_at: '2026-01-10',
        services: [
            { service_id: 's-013', service: 'Stimulation Services' },
            { service_id: 's-004', service: 'Well Refill' },
        ],
        msas: [
            { msa_id: 'm-005', version: '1.0', status: 'incomplete', effective_date: '2025-12-01', expiration_date: '2026-12-01' },
        ],
        insurance_policies: [
            { insurance_id: 'i-005', insurance_type: 'General Liability', provider_name: 'Basin Coverage Co', policy_number: 11200, provider_phone: '(432) 555-7200', coverage_amount: 500000, insurance_verified: false, expiration_date: '2025-11-01' },
        ],
        licenses: [
            { license_id: 'l-005', license_type: 'State Operating', license_number: 'TX-OPS-8871', license_state: 'TX', license_expiration_date: '2025-12-31' },
        ],
    },
    {
        vendor_id: 'v-006',
        company_name: 'Eagle Ford Logistics',
        company_code: 'EFL-006',
        primary_contact_name: 'Teresa Nguyen',
        contact_email: 'tnguyen@eaglefordlog.com',
        contact_phone: '(432) 555-0451',
        status: 'inactive',
        onboarding: false,
        compliance_status: 'expired',
        description: 'Water and oil transportation with flowback capabilities',
        start_date: '2024-11-03',
        created_at: '2024-11-03',
        services: [
            { service_id: 's-005', service: 'Water Transportation' },
            { service_id: 's-007', service: 'Oil Transportation' },
            { service_id: 's-008', service: 'Flowback Operations' },
        ],
        msas: [
            { msa_id: 'm-006', version: '1.0', status: 'expired', effective_date: '2024-06-01', expiration_date: '2025-06-01' },
        ],
        insurance_policies: [
            { insurance_id: 'i-006', insurance_type: 'General Liability', provider_name: 'Lone Star Underwriters', policy_number: 44021, provider_phone: '(432) 555-6300', coverage_amount: 1000000, insurance_verified: true, expiration_date: '2025-06-15' },
        ],
        licenses: [
            { license_id: 'l-006', license_type: 'State Operating', license_number: 'TX-OPS-1105', license_state: 'TX', license_expiration_date: '2025-09-01' },
        ],
    },
]

// all service options for filters and the add vendor form
// matches the ERD services table: service_id (text PK), service (text)
export const serviceOptions = [
    { service_id: 's-001', service: 'Wellbore Integrity' },
    { service_id: 's-002', service: 'Casing Inspection' },
    { service_id: 's-003', service: 'Well Cleaning' },
    { service_id: 's-004', service: 'Well Refill' },
    { service_id: 's-005', service: 'Water Transportation' },
    { service_id: 's-006', service: 'Water Refill' },
    { service_id: 's-007', service: 'Oil Transportation' },
    { service_id: 's-008', service: 'Flowback Operations' },
    { service_id: 's-009', service: 'Cementing Services' },
    { service_id: 's-010', service: 'Pipeline Survey' },
    { service_id: 's-011', service: 'Plug & Abandon' },
    { service_id: 's-012', service: 'Pump Replacement' },
    { service_id: 's-013', service: 'Stimulation Services' },
]
