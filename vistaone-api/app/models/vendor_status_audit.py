from sqlalchemy import String, DateTime, ForeignKey, func
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship
from datetime import datetime
import uuid
from app.models.vendor import Vendor
from app.models import Base


class VendorStatusAudit(Base):
    __tablename__ = "vendor_status_audit"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4
    )

    vendor_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("vendors.id"),
        nullable=False
    )

    old_status: Mapped[str | None] = mapped_column(String(50), nullable=True)
    new_status: Mapped[str] = mapped_column(String(50), nullable=False)
    reason: Mapped[str | None] = mapped_column(String(255), nullable=True)
    changed_by: Mapped[str | None] = mapped_column(String(255), nullable=True)

    changed_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        server_default=func.now()
    )

    vendor: Mapped["Vendor"] = relationship("Vendor", back_populates="status_audits")
