"""
seed.py - populates the database with demo data for local development
Run once: python seed.py
Safe to re-run - skips records that already exist
"""
from datetime import datetime, timedelta, timezone
from decimal import Decimal

from flask_app import create_app
from app.extensions import db
from app.models.user import User
from app.models.vendor import Vendor
from app.models.client import Client
from app.models.address import Address
from app.models.service_type import ServiceType
from app.models.workorder import WorkOrder
from app.models.invoice import Invoice
from app.models.line_item import LineItem
from app.blueprints.enum.enums import (
    VendorStatus,
    ComplianceStatus,
    UserType,
    UserStatus,
    PriorityEnum,
    StatusEnum,
    LocationTypeEnum,
    FrequencyEnum,
    InvoiceStatusEnum,
)

app = create_app("DevelopmentConfig")

with app.app_context():

    # Create an address for the demo client
    existing_address = db.session.query(Address).first()
    if not existing_address:
        address = Address(
            street="100 Main St",
            city="Midland",
            state="TX",
            zip="79701",
            country="US",
            created_by="system",
            updated_by="system",
        )
        db.session.add(address)
        db.session.commit()
        print(f"Created address: {address.id}")
    else:
        address = existing_address

    # Create a client company for the demo user
    existing_client = db.session.query(Client).first()
    if not existing_client:
        client = Client(
            client_name="VistaOne Energy",
            client_code="VO-001",
            primary_contact_name="Admin User",
            company_email="admin@vistaone.com",
            company_contact_number="(432) 555-0001",
            address_id=address.id,
            created_by="system",
            updated_by="system",
        )
        db.session.add(client)
        db.session.commit()
        print(f"Created client: VistaOne Energy (id={client.id})")
    else:
        client = existing_client
        print(f"Client already exists: {client.client_name}")

    # Create a demo user if one does not exist
    existing_user = db.session.query(User).filter_by(email="admin@vistaone.com").first()
    if not existing_user:
        user = User(
            username="admin",
            first_name="Admin",
            last_name="User",
            email="admin@vistaone.com",
            user_type=UserType.CLIENT,
            status=UserStatus.ACTIVE,
            contact_number="(432) 555-0001",
            client_id=client.id,
            address_id=address.id,
            created_by="system",
            updated_by="system",
        )
        user.set_password("password123")
        db.session.add(user)
        db.session.commit()
        print("Created user: admin@vistaone.com / password123")
    else:
        print("User already exists: admin@vistaone.com")

    # Seed vendor records
    vendors_data = [
        {
            "company_name": "Permian Wellbore Services",
            "company_code": "PWS-001",
            "primary_contact_name": "Carlos Mendez",
            "company_email": "cmendez@permianwell.com",
            "company_phone": "(432) 555-0142",
            "status": VendorStatus.ACTIVE,
            "compliance_status": ComplianceStatus.COMPLETE,
            "onboarding": False,
            "description": "Full-service wellbore integrity and cleaning provider",
        },
        {
            "company_name": "Basin Pump & Flow",
            "company_code": "BPF-002",
            "primary_contact_name": "Dana Reyes",
            "company_email": "dreyes@basinpump.com",
            "company_phone": "(432) 555-0198",
            "status": VendorStatus.ACTIVE,
            "compliance_status": ComplianceStatus.COMPLETE,
            "onboarding": False,
            "description": "Water transport, refill, and pump replacement services",
        },
        {
            "company_name": "West Texas Cementing",
            "company_code": "WTC-003",
            "primary_contact_name": "James Whitfield",
            "company_email": "jwhitfield@wtcement.com",
            "company_phone": "(432) 555-0267",
            "status": VendorStatus.INACTIVE,
            "compliance_status": ComplianceStatus.EXPIRED,
            "onboarding": False,
            "description": "Cementing services for well construction and remediation",
        },
        {
            "company_name": "Midland Pipeline Solutions",
            "company_code": "MPS-004",
            "primary_contact_name": "Priya Sharma",
            "company_email": "psharma@midlandpipe.com",
            "company_phone": "(432) 555-0314",
            "status": VendorStatus.ACTIVE,
            "compliance_status": ComplianceStatus.COMPLETE,
            "onboarding": False,
            "description": "Pipeline survey, transportation, and plug and abandon services",
        },
        {
            "company_name": "Sandstorm Stimulation",
            "company_code": "SST-005",
            "primary_contact_name": "Marcus Bell",
            "company_email": "mbell@sandstormstim.com",
            "company_phone": "(432) 555-0089",
            "status": VendorStatus.INACTIVE,
            "compliance_status": ComplianceStatus.INCOMPLETE,
            "onboarding": True,
            "description": "Stimulation and well refill operations",
        },
        {
            "company_name": "Eagle Ford Logistics",
            "company_code": "EFL-006",
            "primary_contact_name": "Teresa Nguyen",
            "company_email": "tnguyen@eaglefordlog.com",
            "company_phone": "(432) 555-0451",
            "status": VendorStatus.INACTIVE,
            "compliance_status": ComplianceStatus.EXPIRED,
            "onboarding": False,
            "description": "Water and oil transportation with flowback capabilities",
        },
    ]

    for vdata in vendors_data:
        existing = db.session.query(Vendor).filter_by(
            company_name=vdata["company_name"]
        ).first()
        if existing:
            print(f"  Vendor already exists: {vdata['company_name']}")
            continue

        vendor = Vendor(
            name=vdata["company_name"],
            company_name=vdata["company_name"],
            company_code=vdata["company_code"],
            primary_contact_name=vdata["primary_contact_name"],
            company_email=vdata["company_email"],
            company_phone=vdata["company_phone"],
            status=vdata["status"],
            compliance_status=vdata["compliance_status"],
            onboarding=vdata["onboarding"],
            description=vdata["description"],
            created_by="system",
            updated_by="system",
        )
        db.session.add(vendor)
        db.session.commit()
        print(f"  Created vendor: {vdata['company_name']}")

    # Seed service types
    services = [
        "Well Maintenance",
        "Water Transport",
        "Cementing",
        "Pipeline Survey",
        "Stimulation",
        "Logistics",
    ]
    service_type_map = {}
    for svc_name in services:
        existing_st = db.session.query(ServiceType).filter_by(service=svc_name).first()
        if existing_st:
            service_type_map[svc_name] = existing_st
            continue
        st = ServiceType(service=svc_name, created_by="system", updated_by="system")
        db.session.add(st)
        db.session.commit()
        service_type_map[svc_name] = st
        print(f"  Created service type: {svc_name}")

    # Seed work orders + invoices + line items
    if db.session.query(Invoice).count() > 0:
        print("\nInvoices already exist - skipping invoice seed")
    else:
        print("\nSeeding work orders + invoices...")

        vendor_lookup = {v.company_name: v for v in db.session.query(Vendor).all()}
        vendor_service_map = {
            "Permian Wellbore Services": "Well Maintenance",
            "Basin Pump & Flow": "Water Transport",
            "West Texas Cementing": "Cementing",
            "Midland Pipeline Solutions": "Pipeline Survey",
            "Sandstorm Stimulation": "Stimulation",
            "Eagle Ford Logistics": "Logistics",
        }

        # (vendor_name, status, [(description, qty, rate)], days_ago)
        invoice_blueprints = [
            # SUBMITTED - awaiting client approval (drives the approve/reject demo)
            ("Permian Wellbore Services", "SUBMITTED", [
                ("Wellbore cleaning - rig hours", 12, 425.00),
                ("Specialty fluid additive (bbls)", 30, 85.00),
                ("Site supervisor", 8, 175.00),
            ], 3),
            ("Basin Pump & Flow", "SUBMITTED", [
                ("Water haul - 130 bbl truck", 18, 215.00),
                ("After-hours surcharge", 4, 95.00),
            ], 5),
            ("Midland Pipeline Solutions", "SUBMITTED", [
                ("Pipeline integrity scan (mile)", 22, 540.00),
                ("Mobilization", 1, 1200.00),
                ("Field report", 1, 350.00),
            ], 1),
            ("Sandstorm Stimulation", "SUBMITTED", [
                ("Stimulation pump rental (day)", 3, 2400.00),
                ("Sand proppant (tons)", 45, 110.00),
            ], 7),
            # APPROVED
            ("Permian Wellbore Services", "APPROVED", [
                ("Wellbore cleaning - rig hours", 16, 425.00),
                ("Equipment freight", 1, 850.00),
            ], 14),
            ("West Texas Cementing", "APPROVED", [
                ("Cement bulk (sacks)", 280, 18.50),
                ("Cementing crew (day)", 2, 3400.00),
            ], 21),
            # PAID
            ("Basin Pump & Flow", "PAID", [
                ("Water haul - 130 bbl truck", 22, 215.00),
            ], 35),
            ("Eagle Ford Logistics", "PAID", [
                ("Crude transport (bbls)", 850, 4.25),
                ("Demurrage hours", 6, 95.00),
            ], 42),
            # REJECTED
            ("Sandstorm Stimulation", "REJECTED", [
                ("Stimulation pump rental (day)", 5, 2400.00),
                ("Disputed standby hours", 18, 195.00),
            ], 28),
            # DRAFT
            ("Midland Pipeline Solutions", "DRAFT", [
                ("Pipeline integrity scan (mile)", 8, 540.00),
            ], 0),
            ("Permian Wellbore Services", "DRAFT", [
                ("Site assessment", 1, 1500.00),
            ], 0),
        ]

        now = datetime.now(timezone.utc)

        for vendor_name, status_str, items, days_ago in invoice_blueprints:
            vendor = vendor_lookup.get(vendor_name)
            if not vendor:
                print(f"  Skipping invoice - vendor not found: {vendor_name}")
                continue

            svc_name = vendor_service_map.get(vendor_name, "Well Maintenance")
            service_type = service_type_map[svc_name]

            wo = WorkOrder(
                client_id=client.id,
                vendor_id=vendor.id,
                service_type_id=service_type.id,
                description=f"{svc_name} for VistaOne Energy",
                location_type=LocationTypeEnum.GPS,
                latitude=31.9973,
                longitude=-102.0779,
                priority=PriorityEnum.MEDIUM,
                status=StatusEnum.COMPLETED,
                estimated_quantity=10.0,
                units="hours",
                is_recurring=False,
                recurrence_type=FrequencyEnum.ONE_TIME,
                estimated_start_date=now - timedelta(days=days_ago + 14),
                estimated_end_date=now - timedelta(days=days_ago + 1),
                created_by="system",
                updated_by="system",
            )
            db.session.add(wo)
            db.session.flush()

            invoice_date = now - timedelta(days=days_ago)
            total = sum(Decimal(str(qty)) * Decimal(str(rate)) for _, qty, rate in items)

            status_enum = InvoiceStatusEnum[status_str]
            invoice = Invoice(
                work_order_id=wo.id,
                vendor_id=vendor.id,
                client_id=client.id,
                invoice_date=invoice_date,
                due_date=invoice_date + timedelta(days=30),
                period_start=invoice_date - timedelta(days=14),
                period_end=invoice_date - timedelta(days=1),
                total_amount=total,
                invoice_status=status_enum,
                created_by="system",
            )
            if status_enum == InvoiceStatusEnum.APPROVED:
                invoice.approved_at = invoice_date + timedelta(days=2)
            elif status_enum == InvoiceStatusEnum.REJECTED:
                invoice.rejected_at = invoice_date + timedelta(days=3)
            elif status_enum == InvoiceStatusEnum.PAID:
                invoice.approved_at = invoice_date + timedelta(days=2)
                invoice.paid_at = invoice_date + timedelta(days=15)

            db.session.add(invoice)
            db.session.flush()

            for desc, qty, rate in items:
                line = LineItem(
                    invoice_id=invoice.id,
                    quantity=qty,
                    rate=Decimal(str(rate)),
                    amount=Decimal(str(qty)) * Decimal(str(rate)),
                    description=desc,
                    created_by="system",
                )
                db.session.add(line)

            db.session.commit()
            print(f"  Created invoice: {vendor_name} - ${total} - {status_str}")

    print("\nSeed complete.")
