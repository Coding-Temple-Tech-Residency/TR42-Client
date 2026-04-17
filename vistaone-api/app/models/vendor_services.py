from sqlalchemy.orm import mapped_column, relationship
from sqlalchemy.sql import func
import uuid
from app.extensions import db


# Junction table linking vendors to services (many-to-many)
# Full model class instead of a simple association table because
# the ERD includes created_by / last_modified_by audit fields
class VendorService(db.Model):
    __tablename__ = "vendor_services"

    id = mapped_column(
        db.String(36), primary_key=True, default=lambda: str(uuid.uuid4())
    )
    vendor_id = mapped_column(
        db.String(36), db.ForeignKey("vendors.vendor_id"), nullable=False
    )
    service_id = mapped_column(
        db.String(36), db.ForeignKey("services.service_id"), nullable=False
    )
    created_by = mapped_column(db.String(100), nullable=False)
    created_date = mapped_column(db.DateTime, server_default=func.now())
    last_modified_by = mapped_column(db.String(100))
    last_modified_date = mapped_column(db.DateTime)

    vendor = relationship("Vendor", backref="vendor_services")
    service = relationship("Service", lazy="select")
