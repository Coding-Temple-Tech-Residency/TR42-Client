# models/vendor.py

from app import db
from datetime import datetime
import uuid
from sqlalchemy.dialects.postgresql import UUID, ARRAY

class Vendor(db.Model):
    __tablename__ = "vendor"

    id = db.Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    company_name = db.Column(db.String, nullable=False)
    service_types = db.Column(ARRAY(db.String), nullable=False)
    status = db.Column(db.String, nullable=False, default="pending")
    primary_contact_id = db.Column(UUID(as_uuid=True), db.ForeignKey("vendor_contact.id"))
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    primary_contact = db.relationship("VendorContact", back_populates="vendor")
    compliance = db.relationship("VendorCompliance", uselist=False, back_populates="vendor")
    documents = db.relationship("VendorDocument", back_populates="vendor")
    audits = db.relationship("VendorStatusAudit", back_populates="vendor")
