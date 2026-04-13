from app import db
from sqlalchemy.dialects.postgresql import UUID, JSON
from datetime import datetime
import uuid


class VendorMSA(db.Model):
    __tablename__ = "vendor_msas"

    msa_id = db.Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    vendor_id = db.Column(UUID(as_uuid=True), db.ForeignKey("vendors.vendor_id"), nullable=False)

    msa_number = db.Column(db.String(100))
    status = db.Column(db.String(50))  # complete, incomplete, expired
    effective_date = db.Column(db.Date)
    expiry_date = db.Column(db.Date)
