from sqlalchemy.orm import mapped_column, relationship
from sqlalchemy.sql import func
import uuid
from app.extensions import db
from app.models.audit_mixin import AuditMixin


class Msa(db.Model, AuditMixin):
    __tablename__ = "msa"

    id = mapped_column(
        db.String(36), primary_key=True, default=lambda: str(uuid.uuid4())
    )
    vendor_id = mapped_column(db.String(36), db.ForeignKey("vendor.id"), nullable=False)
    version = mapped_column(db.String(10), nullable=True)
    effective_date = mapped_column(db.Date, nullable=True)
    expiration_date = mapped_column(db.Date, nullable=True)
    status = mapped_column(db.String(15), nullable=False, default="active")
    uploaded_by = mapped_column(db.String(100), nullable=True)
    file_name = mapped_column(db.String(255), nullable=True)

    ## Relationships
    vendor = relationship("Vendor")
