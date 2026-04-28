from sqlalchemy.orm import mapped_column, relationship
from sqlalchemy.sql import func
import uuid
from app.extensions import db
from app.models.audit_mixin import AuditMixin


class ClientVendor(db.Model, AuditMixin):
    __tablename__ = "client_vendor"

    id = mapped_column(
        db.String(36), primary_key=True, default=lambda: str(uuid.uuid4())
    )
    client_id = mapped_column(db.String(36), db.ForeignKey("client.id"), nullable=False)
    vendor_id = mapped_column(db.String(36), db.ForeignKey("vendor.id"), nullable=False)
    created_by = mapped_column(db.String(100), nullable=False)
    created_date = mapped_column(db.DateTime, server_default=func.now())
    last_modified_by = mapped_column(db.String(100))
    last_modified_date = mapped_column(db.DateTime)

    ## Relationships
    client = relationship("Client")
    vendor = relationship("Vendor")

    __table_args__ = (
        db.UniqueConstraint("client_id", "vendor_id", name="uq_client_vendor"),
    )
