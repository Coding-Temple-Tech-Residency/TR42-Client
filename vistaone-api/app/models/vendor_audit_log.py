from datetime import datetime
import uuid
from sqlalchemy.dialects.postgresql import UUID, JSON
from app.extensions import db


class VendorAuditLog(db.Model):
    __tablename__ = "vendor_audit_logs"

    id = db.Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    vendor_id = db.Column(UUID(as_uuid=True), nullable=False)

    action = db.Column(db.String(100), nullable=False)  # e.g. vendor_created, status_updated
    payload = db.Column(JSON, nullable=True)

    created_at = db.Column(db.DateTime, default=datetime.utcnow)
