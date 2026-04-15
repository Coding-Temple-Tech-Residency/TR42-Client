import uuid
from app.models import db, Base
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy import String, DateTime, ForeignKey, func


# Junction table linking vendors to services (many-to-many)
# Using a full model class (not a simple Table) because the ERD specifies created_by / updated_by audit fields
class VendorService(Base):
    __tablename__ = 'vendor_services'

    id: Mapped[str] = mapped_column(
        String,
        primary_key=True,
        default=lambda: str(uuid.uuid4())
    )
    # FK to vendor - cascade delete handled by the Vendor.vendor_services relationship
    vendor_id: Mapped[str] = mapped_column(
        String, ForeignKey('vendor.vendor_id'), nullable=False
    )
    service_id: Mapped[str] = mapped_column(
        String, ForeignKey('services.service_id'), nullable=False
    )
    created_at: Mapped[DateTime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )
    updated_at: Mapped[DateTime] = mapped_column(
        DateTime(timezone=True), nullable=True, onupdate=func.now()
    )
    # ERD marks created_by / updated_by as [not null] on every table
    created_by: Mapped[str] = mapped_column(String, nullable=False)
    updated_by: Mapped[str] = mapped_column(String, nullable=True)

    # Back-references so we can navigate from either side of the join
    vendor: Mapped['Vendor'] = relationship('Vendor', back_populates='vendor_services')
    service: Mapped['Service'] = relationship('Service', lazy='select')
