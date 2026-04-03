# models/vendor.py

from app import db
from datetime import datetime
import uuid
from sqlalchemy.dialects.postgresql import UUID, ARRAY

class Vendor(db.Model):
    __tablename__ = "vendors"

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



#vendor compliance model#
# models/vendor_compliance.py

from app import db
from sqlalchemy.dialects.postgresql import UUID
import uuid
from datetime import datetime

class VendorCompliance(db.Model):
    __tablename__ = "vendor_compliance"

    id = db.Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    vendor_id = db.Column(UUID(as_uuid=True), db.ForeignKey("vendor.id"), unique=True)

    insurance_expiration = db.Column(db.Date)
    license_expiration = db.Column(db.Date)
    msa_status = db.Column(db.String)  # e.g., "valid", "expired", "missing"
    is_compliant = db.Column(db.Boolean, default=False)

    last_reviewed_at = db.Column(db.DateTime, default=datetime.utcnow)

    vendor = db.relationship("Vendor", back_populates="compliance")

    def to_dict(self):
        return {
            "insurance_expiration": self.insurance_expiration,
            "license_expiration": self.license_expiration,
            "msa_status": self.msa_status,
            "is_compliant": self.is_compliant,
            "last_reviewed_at": self.last_reviewed_at
        }







# models/vendor_status_audit#

class VendorStatusAudit(db.Model):
    __tablename__ = "vendor_status_audit"

    id = db.Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    vendor_id = db.Column(UUID(as_uuid=True), db.ForeignKey("vendor.id"))

    old_status = db.Column(db.String, nullable=False)
    new_status = db.Column(db.String, nullable=False)
    reason = db.Column(db.String)
    changed_by = db.Column(db.String)  # replace with auth user later
    changed_at = db.Column(db.DateTime, default=datetime.utcnow)

    vendor = db.relationship("Vendor", back_populates="audits")

    def to_dict(self):
        return {
            "old_status": self.old_status,
            "new_status": self.new_status,
            "reason": self.reason,
            "changed_by": self.changed_by,
            "changed_at": self.changed_at
        }
