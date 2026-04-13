from datetime import datetime
from uuid import UUID
from sqlalchemy.orm import Session
from app.models import Base
from app.models.vendor import Vendor
from app.models.vendor_compliance import VendorCompliance
from app.models.vendor_status_audit import VendorStatusAudit



class VendorService:
    @staticmethod
    def _get_session() -> Session:
        return SessionLocal()

    @staticmethod
    def list_vendors(filters: dict, page: int, page_size: int, sort: str, direction: str):
        session = VendorService._get_session()
        try:
            query = session.query(Vendor)

            status = filters.get("status")
            service_type = filters.get("service_type")
            compliance_status = filters.get("compliance_status")

            if status:
                query = query.filter(Vendor.status == status)
            if service_type:
                query = query.filter(Vendor.service_type == service_type)
            if compliance_status:
                query = query.join(Vendor.compliance).filter(
                    VendorCompliance.compliance_status == compliance_status
                )

            if sort == "name":
                order_col = Vendor.name
            elif sort == "created_at":
                order_col = Vendor.created_at
            elif sort == "status":
                order_col = Vendor.status
            else:
                order_col = Vendor.created_at

            if direction == "desc":
                order_col = order_col.desc()

            query = query.order_by(order_col)

            total = query.count()
            items = query.offset((page - 1) * page_size).limit(page_size).all()

            return items, total
        finally:
            session.close()

    @staticmethod
    def get_vendor_detail(vendor_id: UUID) -> Vendor:
        session = VendorService._get_session()
        try:
            vendor = session.query(Vendor).filter(Vendor.id == vendor_id).first()
            if not vendor:
                raise LookupError("Vendor not found.")
            return vendor
        finally:
            session.close()

    @staticmethod
    def _log_status_change(session: Session, vendor: Vendor, old_status: str | None, new_status: str, reason: str | None, changed_by: str | None):
        audit = VendorStatusAudit(
            vendor_id=vendor.id,
            old_status=old_status,
            new_status=new_status,
            reason=reason,
            changed_by=changed_by,
        )
        session.add(audit)

    @staticmethod
    def create_vendor(data: dict, changed_by: str | None = None) -> Vendor:
        session = VendorService._get_session()
        try:
            existing = session.query(Vendor).filter(
                (Vendor.email == data.get("email")) |
                (Vendor.name == data.get("name"))
            ).first()
            if existing:
                raise ValueError("Vendor with this name or email already exists.")

            vendor = Vendor(
                name=data["name"],
                email=data["email"],
                phone=data.get("phone"),
                service_type=data.get("service_type"),
                status="pending",
            )
            session.add(vendor)
            session.flush()

            compliance = VendorCompliance(
                vendor_id=vendor.id,
                compliance_status="pending",
            )
            session.add(compliance)

            VendorService._log_status_change(
                session,
                vendor,
                old_status=None,
                new_status="pending",
                reason="Vendor created",
                changed_by=changed_by,
            )

            session.commit()
            session.refresh(vendor)
            return vendor
        except Exception:
            session.rollback()
            raise
        finally:
            session.close()

    @staticmethod
    def update_status(vendor_id: UUID, new_status: str, reason: str | None, changed_by: str | None = None) -> Vendor:
        session = VendorService._get_session()
        try:
            vendor = session.query(Vendor).filter(Vendor.id == vendor_id).first()
            if not vendor:
                raise LookupError("Vendor not found.")

            old_status = vendor.status

            if old_status == "pending" and new_status in ("approved", "rejected"):
                pass
            else:
                raise ValueError("Invalid status transition.")

            vendor.status = new_status
            if new_status == "approved":
                vendor.approved_at = datetime.utcnow()
                vendor.rejection_reason = None
            elif new_status == "rejected":
                if not reason:
                    raise ValueError("Rejection reason is required.")
                vendor.rejected_at = datetime.utcnow()
                vendor.rejection_reason = reason

            VendorService._log_status_change(
                session,
                vendor,
                old_status=old_status,
                new_status=new_status,
                reason=reason,
                changed_by=changed_by,
            )

            session.commit()
            session.refresh(vendor)
            return vendor
        except Exception:
            session.rollback()
            raise
        finally:
            session.close()
