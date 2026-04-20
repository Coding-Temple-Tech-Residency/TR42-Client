from sqlalchemy.orm import mapped_column, relationship
import uuid
from app.extensions import db
from app.models import AuditMixin


class VendorServiceLink(db.Model, AuditMixin):
    __tablename__ = "vendor_service"

    id = mapped_column(
        db.String(36), primary_key=True, default=lambda: str(uuid.uuid4())
    )
    vendor_id = mapped_column(db.String(36), db.ForeignKey("vendor.id"), nullable=False)
    service_type_id = mapped_column(
        db.String(36), db.ForeignKey("service_types.service_type_id"), nullable=False
    )

    ## Relationships
    vendor = relationship("Vendor")
    service_type = relationship("ServiceType")
