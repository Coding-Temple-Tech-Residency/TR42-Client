from app import db
from sqlalchemy.dialects.postgresql import UUID, JSON
from datetime import datetime
import uuid


class VendorLicense(db.Model):
    __tablename__ = "vendor_licenses"

    license_id = db.Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    vendor_id = db.Column(UUID(as_uuid=True), db.ForeignKey("vendors.vendor_id"), nullable=False)

    license_type = db.Column(db.String(255))
    license_number = db.Column(db.String(100))
    valid_from = db.Column(db.Date)
    valid_to = db.Column(db.Date)