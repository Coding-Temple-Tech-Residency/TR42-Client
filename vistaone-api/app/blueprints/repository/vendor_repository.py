from sqlalchemy import select
from app.models import db
from app.models.vendor import Vendor
from app.models.vendor_services import VendorService
from app.models.services import Service


class VendorRepository:

    @staticmethod
    def get_all(status=None, compliance=None, service_id=None):
        """Return all vendors, with optional filters passed from the route."""
        query = select(Vendor)

        if status:
            query = query.where(Vendor.status == status)

        if compliance:
            query = query.where(Vendor.compliance_status == compliance)

        if service_id:
            # Filter to vendors that have this service in their vendor_services rows
            query = query.join(VendorService, Vendor.vendor_id == VendorService.vendor_id)\
                         .where(VendorService.service_id == service_id)

        vendors = db.session.execute(query).scalars().all()
        return vendors

    @staticmethod
    def get_by_id(vendor_id):
        """Return a single vendor by vendor_id, or None if not found."""
        query = select(Vendor).where(Vendor.vendor_id == vendor_id)
        return db.session.execute(query).scalars().first()

    @staticmethod
    def create(vendor):
        """Persist a new Vendor instance and return it."""
        db.session.add(vendor)
        db.session.commit()
        db.session.refresh(vendor)
        return vendor

    @staticmethod
    def update(vendor):
        """Commit changes to an existing Vendor instance."""
        db.session.commit()
        db.session.refresh(vendor)
        return vendor

    @staticmethod
    def get_vendor_services(vendor_id):
        """Return the service rows attached to a vendor as (service_id, service_name) dicts."""
        query = (
            select(Service.service_id, Service.service)
            .join(VendorService, Service.service_id == VendorService.service_id)
            .where(VendorService.vendor_id == vendor_id)
        )
        rows = db.session.execute(query).all()
        # Return list of dicts matching the shape the frontend expects
        return [{'service_id': r.service_id, 'service': r.service} for r in rows]

    @staticmethod
    def add_service_to_vendor(vendor_service_record):
        """Add a VendorService link record to the DB."""
        db.session.add(vendor_service_record)
        db.session.commit()

    @staticmethod
    def remove_service_from_vendor(vendor_id, service_id):
        """Remove the link between a vendor and a service. Returns True if a row was deleted."""
        query = select(VendorService).where(
            VendorService.vendor_id == vendor_id,
            VendorService.service_id == service_id
        )
        row = db.session.execute(query).scalars().first()
        if not row:
            return False
        db.session.delete(row)
        db.session.commit()
        return True
