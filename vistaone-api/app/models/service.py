from sqlalchemy.orm import mapped_column, Mapped, relationship
import uuid
from app.extensions import db
from app.models.audit_mixin import AuditMixin


class Service(db.Model, AuditMixin):
    __tablename__ = "service"

    id: Mapped[str] = mapped_column(
        db.String(36), primary_key=True, default=lambda: str(uuid.uuid4())
    )
    service = mapped_column(db.String(255), nullable=False)

    ## Relationships
    vendor_services = relationship("VendorService", back_populates="service")
