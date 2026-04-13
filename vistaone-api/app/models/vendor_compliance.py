from sqlalchemy import String, Boolean, Date, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship
import uuid

from app.models import Base


class VendorCompliance(Base):
    __tablename__ = "vendor_compliance"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4
    )

    vendor_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("vendors.id"),
        nullable=False,
        unique=True
    )

    compliance_status: Mapped[str] = mapped_column(String(50), nullable=False, default="pending")
    insurance_expiration: Mapped[Date | None] = mapped_column(Date, nullable=True)
    w9_received: Mapped[bool] = mapped_column(Boolean, default=False)
    msa_signed: Mapped[bool] = mapped_column(Boolean, default=False)

    vendor=relationship("Vendor", back_populates="compliance")
