from models import Vendor
from repository import VendorRepository
from app.models.vendor_audit_log import VendorAuditLog
from app.extensions import db
from datetime import datetime
import uuid

class VendorService:

    @staticmethod
    def list_vendors(filters):
        return VendorRepository.list_vendors(
            search=filters.get("search"),
            status=filters.get("status"),
            service_id=filters.get("service_id"),
            msa_status=filters.get("msa_status"),
        )

    @staticmethod
    def get_vendor_detail(vendor_id):
        vendor = VendorRepository.get_vendor_detail(vendor_id)
        if not vendor:
            raise ValueError("Vendor not found")
        return vendor

    @staticmethod
    def create_vendor(data):
        vendor = Vendor(
            vendor_name=data["vendor_name"],
            vendor_code=data.get("vendor_code"),
            primary_contact_name=data["primary_contact_name"],
            contact_email=data["contact_email"],
            contact_phone=data.get("contact_phone"),
            services=data["services"],
            status="inactive",
        )



class InvalidStatusTransition(Exception):
    pass


class VendorService:

    VALID_TRANSITIONS = {
        "inactive": ["active", "rejected"],
        "active": ["suspended"],
        "suspended": ["active"],
    }

    @staticmethod
    def list_vendors(filters):
        page = int(filters.get("page", 1))
        per_page = int(filters.get("per_page", 25))
        sort = filters.get("sort", "vendor_name:asc")

        sort_field, _, sort_dir = sort.partition(":")
        pagination = VendorRepository.list_vendors(
            search=filters.get("search"),
            status=filters.get("status"),
            service_id=filters.get("service_id"),
            msa_status=filters.get("msa_status"),
            page=page,
            per_page=per_page,
            sort_field=sort_field,
            sort_dir=sort_dir or "asc",
        )
        return pagination

    @staticmethod
    def get_vendor_detail(vendor_id):
        vendor = VendorRepository.get_vendor_detail(vendor_id)
        if not vendor:
            raise ValueError("Vendor not found")
        return vendor

    @staticmethod
    def create_vendor(data):
        vendor = Vendor(
            vendor_name=data["vendor_name"],
            vendor_code=data.get("vendor_code"),
            primary_contact_name=data["primary_contact_name"],
            contact_email=data["contact_email"],
            contact_phone=data.get("contact_phone"),
            services=data["services"],
            status="inactive",
        )

        vendor = VendorRepository.create(vendor)
        VendorService._log_action(
            vendor_id=vendor.vendor_id,
            action="vendor_created",
            payload=data,
        )
        return vendor

    @staticmethod
    def update_status(vendor_id, new_status):
        vendor = VendorRepository.get_vendor_detail(vendor_id)
        if not vendor:
            raise ValueError("Vendor not found")

        allowed = VendorService.VALID_TRANSITIONS.get(vendor.status, [])
        if new_status not in allowed:
            raise InvalidStatusTransition(
                f"Cannot change status from {vendor.status} to {new_status}"
            )

        vendor.status = new_status
        db.session.commit()

        VendorService._log_action(
            vendor_id=vendor.vendor_id,
            action="status_updated",
            payload={"from": vendor.status, "to": new_status},
        )
        return vendor

    @staticmethod
    def _log_action(vendor_id, action, payload):
        entry = VendorAuditLog(
            id=uuid.uuid4(),
            vendor_id=vendor_id,
            action=action,
            payload=payload,
            created_at=datetime.utcnow(),
        )
        db.session.add(entry)
        db.session.commit()
