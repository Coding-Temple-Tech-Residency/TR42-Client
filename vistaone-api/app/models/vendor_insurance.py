from app import db
from sqlalchemy.dialects.postgresql import UUID, JSON
from datetime import datetime
import uuid






class VendorInsurance(db.Model):
    __tablename__ = "vendor_insurance"

    insurance_id = db.Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    vendor_id = db.Column(UUID(as_uuid=True), db.ForeignKey("vendors.vendor_id"), nullable=False)

    insurer_name = db.Column(db.String(255))
    policy_number = db.Column(db.String(100))
    coverage_start = db.Column(db.Date)
    coverage_end = db.Column(db.Date)