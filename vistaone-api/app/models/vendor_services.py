from sqlalchemy.orm import mapped_column, relationship
from sqlalchemy.sql import func
import uuid
from app.extensions import db


class VendorServiceLink(db.Model):
    __tablename__ = "vendor_services"

    id = mapped_column(
        db.String(36), primary_key=True, default=lambda: str(uuid.uuid4())
    )
    vendor_id = mapped_column(
        db.String(36), db.ForeignKey("vendors.vendor_id"), nullable=False
    )
    service_type_id = mapped_column(
        db.String(36), db.ForeignKey("service_types.service_type_id"), nullable=False
    )
    created_by = mapped_column(db.String(100), nullable=False)
    created_date = mapped_column(db.DateTime, server_default=func.now())
    last_modified_by = mapped_column(db.String(100))
    last_modified_date = mapped_column(db.DateTime)

    ## Relationships
    vendor = relationship("Vendor", backref="vendor_services")
    service_type = relationship("ServiceType", lazy="select")
