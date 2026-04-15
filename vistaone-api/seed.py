"""
seed.py - populates the database with enough data to demo the app locally.
Run once: python seed.py
Safe to re-run - skips records that already exist.
"""
from app import create_app
from app.models import db
from app.models.user import User
from app.models.services import Service
from app.models.vendor import Vendor, VendorStatus, ComplianceStatus
from app.models.vendor_services import VendorService
from app.models.msa import Msa

app = create_app('DevelopmentConfig')

with app.app_context():

    # ------------------------------------------------------------------ user
    # Create a demo operator account if it doesn't already exist
    existing_user = db.session.query(User).filter_by(email='admin@vistaone.com').first()
    if not existing_user:
        user = User(
            first_name='Admin',
            last_name='User',
            email='admin@vistaone.com',
            role_id=1,
            company_id=1,
        )
        user.set_password('password123')
        db.session.add(user)
        db.session.commit()
        print(f'Created user: admin@vistaone.com / password123')
    else:
        user = existing_user
        print(f'User already exists: admin@vistaone.com')

    user_id = str(user.id)

    # ------------------------------------------------------------------ services
    # Same 13 service types that were in the old mock data file
    service_names = [
        'Wellbore Integrity', 'Casing Inspection', 'Well Cleaning', 'Well Refill',
        'Water Transportation', 'Water Refill', 'Oil Transportation', 'Flowback Operations',
        'Cementing Services', 'Pipeline Survey', 'Plug & Abandon', 'Pump Replacement',
        'Stimulation Services',
    ]

    service_map = {}
    for name in service_names:
        existing = db.session.query(Service).filter_by(service=name).first()
        if not existing:
            svc = Service(service=name, created_by=user_id)
            db.session.add(svc)
            db.session.commit()
            service_map[name] = svc.service_id
            print(f'  Created service: {name}')
        else:
            service_map[name] = existing.service_id

    # ------------------------------------------------------------------ vendors
    # Mirrors the 6 vendors from vendorData.js
    vendors_data = [
        {
            'company_name': 'Permian Wellbore Services',
            'company_code': 'PWS-001',
            'primary_contact_name': 'Carlos Mendez',
            'company_email': 'cmendez@permianwell.com',
            'company_phone': '(432) 555-0142',
            'status': VendorStatus.ACTIVE,
            'onboarding': False,
            'compliance_status': ComplianceStatus.COMPLETE,
            'description': 'Full-service wellbore integrity and cleaning provider',
            'services': ['Wellbore Integrity', 'Well Cleaning'],
            'msa': {'version': '1.0', 'status': 'active', 'effective_date': '2025-08-01', 'expiration_date': '2026-08-01'},
        },
        {
            'company_name': 'Basin Pump & Flow',
            'company_code': 'BPF-002',
            'primary_contact_name': 'Dana Reyes',
            'company_email': 'dreyes@basinpump.com',
            'company_phone': '(432) 555-0198',
            'status': VendorStatus.ACTIVE,
            'onboarding': False,
            'compliance_status': ComplianceStatus.COMPLETE,
            'description': 'Water transport, refill, and pump replacement services',
            'services': ['Water Transportation', 'Water Refill', 'Pump Replacement'],
            'msa': {'version': '1.0', 'status': 'active', 'effective_date': '2025-06-01', 'expiration_date': '2026-06-01'},
        },
        {
            'company_name': 'West Texas Cementing',
            'company_code': 'WTC-003',
            'primary_contact_name': 'James Whitfield',
            'company_email': 'jwhitfield@wtcement.com',
            'company_phone': '(432) 555-0267',
            'status': VendorStatus.INACTIVE,
            'onboarding': False,
            'compliance_status': ComplianceStatus.EXPIRED,
            'description': 'Cementing services for well construction and remediation',
            'services': ['Cementing Services'],
            'msa': {'version': '1.0', 'status': 'expired', 'effective_date': '2025-03-01', 'expiration_date': '2026-03-01'},
        },
        {
            'company_name': 'Midland Pipeline Solutions',
            'company_code': 'MPS-004',
            'primary_contact_name': 'Priya Sharma',
            'company_email': 'psharma@midlandpipe.com',
            'company_phone': '(432) 555-0314',
            'status': VendorStatus.ACTIVE,
            'onboarding': False,
            'compliance_status': ComplianceStatus.COMPLETE,
            'description': 'Pipeline survey, transportation, and plug & abandon services',
            'services': ['Oil Transportation', 'Pipeline Survey', 'Plug & Abandon'],
            'msa': {'version': '1.0', 'status': 'active', 'effective_date': '2025-04-01', 'expiration_date': '2027-04-01'},
        },
        {
            'company_name': 'Sandstorm Stimulation',
            'company_code': 'SST-005',
            'primary_contact_name': 'Marcus Bell',
            'company_email': 'mbell@sandstormstim.com',
            'company_phone': '(432) 555-0089',
            'status': VendorStatus.INACTIVE,
            'onboarding': False,
            'compliance_status': ComplianceStatus.INCOMPLETE,
            'description': 'Stimulation and well refill operations',
            'services': ['Stimulation Services', 'Well Refill'],
            'msa': {'version': '1.0', 'status': 'incomplete', 'effective_date': '2025-12-01', 'expiration_date': '2026-12-01'},
        },
        {
            'company_name': 'Eagle Ford Logistics',
            'company_code': 'EFL-006',
            'primary_contact_name': 'Teresa Nguyen',
            'company_email': 'tnguyen@eaglefordlog.com',
            'company_phone': '(432) 555-0451',
            'status': VendorStatus.INACTIVE,
            'onboarding': False,
            'compliance_status': ComplianceStatus.EXPIRED,
            'description': 'Water and oil transportation with flowback capabilities',
            'services': ['Water Transportation', 'Oil Transportation', 'Flowback Operations'],
            'msa': {'version': '1.0', 'status': 'expired', 'effective_date': '2024-06-01', 'expiration_date': '2025-06-01'},
        },
    ]

    for vdata in vendors_data:
        existing = db.session.query(Vendor).filter_by(company_name=vdata['company_name']).first()
        if existing:
            print(f'  Vendor already exists: {vdata["company_name"]}')
            continue

        vendor = Vendor(
            company_name=vdata['company_name'],
            company_code=vdata['company_code'],
            primary_contact_name=vdata['primary_contact_name'],
            company_email=vdata['company_email'],
            company_phone=vdata['company_phone'],
            status=vdata['status'],
            onboarding=vdata['onboarding'],
            compliance_status=vdata['compliance_status'],
            description=vdata['description'],
            created_by=user_id,
        )
        db.session.add(vendor)
        db.session.commit()

        # Link services
        for svc_name in vdata['services']:
            sid = service_map.get(svc_name)
            if sid:
                link = VendorService(vendor_id=vendor.vendor_id, service_id=sid, created_by=user_id)
                db.session.add(link)

        # Add MSA record (no file - just metadata)
        msa_data = vdata['msa']
        msa = Msa(
            vendor_id=vendor.vendor_id,
            version=msa_data['version'],
            status=msa_data['status'],
            effective_date=msa_data['effective_date'],
            expiration_date=msa_data['expiration_date'],
            uploaded_by=user_id,
            created_by=user_id,
        )
        db.session.add(msa)
        db.session.commit()
        print(f'  Created vendor: {vdata["company_name"]}')

    print('\nSeed complete. Login with: admin@vistaone.com / password123')
