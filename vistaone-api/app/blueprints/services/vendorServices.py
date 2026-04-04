# app/services/vendor_service.py

from app.blueprints.repository.vendor_repository import VendorRepository
from app.blueprints.schemas.vendorSchema import vendor_schema, vendors_schema
from datetime import datetime


# Allowed state transitions for vendor status
ALLOWED_TRANSITIONS = {
    "pending": ["approved", "rejected"],
    "approved": ["inactive"],
    "rejected": ["inactive"],
    "inactive": []
}


class VendorService:

    @staticmethod
    def list_vendors(filters: dict):
        """
        Handles vendor listing with filtering, sorting, pagination.
        Delegates DB operations to VendorRepository.
        """
        paginated = VendorRepository.list_vendors(filters)

        return {
            "items": vendors_schema.dump(paginated.items),
            "total": paginated.total,
            "page": paginated.page,
            "pages": paginated.pages
        }

    @staticmethod
    def get_vendor(vendor_id):
        """
        Returns a single vendor with compliance + contact metadata.
        """
        vendor = VendorRepository.get(vendor_id)

        data = vendor_schema.dump(vendor)

        # Add compliance + contact metadata
        data["compliance"] = (
            vendor.compliance.to_dict() if vendor.compliance else None
        )
        data["primary_contact"] = (
            vendor.primary_contact.to_dict() if vendor.primary_contact else None
        )

        return data

    @staticmethod
    def update_vendor_status(vendor_id, payload):
        """
        Handles vendor status updates with state machine enforcement
        and audit logging.
        """
        vendor = VendorRepository.get(vendor_id)

        new_status = payload.get("status")
        reason = payload.get("reason")
        changed_by = payload.get("changed_by", "admin")  # Replace with auth user later

        if not new_status:
            return {"error": "status is required"}, 400

        # --- State Machine Enforcement ---
        allowed = ALLOWED_TRANSITIONS.get(vendor.status, [])
        if new_status not in allowed:
            return {
                "error": f"Invalid transition: {vendor.status} → {new_status}"
            }, 400

        # --- Update Status ---
        VendorRepository.update_status(vendor, new_status)

        # --- Audit Log ---
        VendorRepository.log_status_change(
            vendor=vendor,
            new_status=new_status,
            reason=reason,
            changed_by=changed_by
        )

        return vendor_schema.dump(vendor), 200
