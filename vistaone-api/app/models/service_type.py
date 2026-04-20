from sqlalchemy.orm import mapped_column, Mapped
import uuid
from app.extensions import db
from app.models.vendor_service import vendor_service
from app.models.audit_mixin import AuditMixin


class ServiceType(db.Model, AuditMixin):
    __tablename__ = "service_type"

    id: Mapped[str] = mapped_column(
        db.String(36), primary_key=True, default=lambda: str(uuid.uuid4())
    )
    service = mapped_column(db.String(255), nullable=False)

    vendors: Mapped[list["Vendor"]] = db.relationship(
        secondary=vendor_service, back_populates="service_types"
    )
