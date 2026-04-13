from app import db
from sqlalchemy.dialects.postgresql import UUID, JSON
from datetime import datetime
import uuid


class Vendor(db.Model):
    __tablename__ = "vendors"

    vendor_id = db.Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)

    vendor_name = db.Column(db.String(255), nullable=False)
    vendor_code = db.Column(db.String(50))

    primary_contact_name = db.Column(db.String(255), nullable=False)
    contact_email = db.Column(db.String(255), nullable=False)
    contact_phone = db.Column(db.String(50))

    status = db.Column(db.String(50), nullable=False, default="inactive")

    # JSON array of services: [{service_id, code, name}]
    services = db.Column(JSON, nullable=False, default=list)

    msas = db.relationship("VendorMSA", backref="vendor", lazy="dynamic")
    insurance_policies = db.relationship("VendorInsurance", backref="vendor", lazy="dynamic")
    licenses = db.relationship("VendorLicense", backref="vendor", lazy="dynamic")

    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)