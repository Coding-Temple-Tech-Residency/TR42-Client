# app/repositories/vendor_repository.py

from app import db
from app.models.vendor import Vendor
from app.models.vendor_compliance import VendorCompliance
from app.models.vendor_status_audit import VendorStatusAudit
from sqlalchemy import asc, desc


class VendorRepository:

    @staticmethod
    def get(vendor_id):
        return Vendor.query.get_or_404(vendor_id)

    @staticmethod
    def list_vendors(filters):
        query = Vendor.query

        # --- Filters ---
        status = filters.get("status")
        service_type = filters.get("service_type")
        compliance = filters.get("compliance")

        if status:
            query = query.filter(Vendor.status == status)

        if service_type:
            query = query.filter(service_type == db.any(Vendor.service_types))

        if compliance:
            query = query.join(VendorCompliance)
            if compliance == "compliant":
                query = query.filter(VendorCompliance.is_compliant.is_(True))
            elif compliance == "non_compliant":
                query = query.filter(VendorCompliance.is_compliant.is_(False))

        # --- Sorting ---
        sort_by = filters.get("sort_by", "created_at")
        sort_dir = filters.get("sort_dir", "desc")

        if sort_dir == "desc":
            query = query.order_by(desc(getattr(Vendor, sort_by)))
        else:
            query = query.order_by(asc(getattr(Vendor, sort_by)))

        # --- Pagination ---
        page = int(filters.get("page", 1))
        per_page = int(filters.get("per_page", 20))

        return query.paginate(page=page, per_page=per_page, error_out=False)

    @staticmethod
    def update_status(vendor, new_status):
        vendor.status = new_status
        vendor.updated_at = db.func.now()
        db.session.commit()
        return vendor

    @staticmethod
    def log_status_change(vendor, new_status, reason, changed_by):
        audit = VendorStatusAudit(
            vendor_id=vendor.id,
            old_status=vendor.status,
            new_status=new_status,
            reason=reason,
            changed_by=changed_by
        )
        db.session.add(audit)
        db.session.commit()
        return audit
