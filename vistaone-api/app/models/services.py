import uuid
from app.models import db, Base
from sqlalchemy.orm import Mapped, mapped_column
from sqlalchemy import String, DateTime, func


# Services table from the ERD - a catalog of service types that vendors can offer
# Vendors link to this through the vendor_services junction table
class Service(Base):
    __tablename__ = 'services'

    service_id: Mapped[str] = mapped_column(
        String,
        primary_key=True,
        default=lambda: str(uuid.uuid4())
    )
    # Human-readable service name e.g. "Wellbore Integrity"
    service: Mapped[str] = mapped_column(String, nullable=False, unique=True)
    created_at: Mapped[DateTime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )
    updated_at: Mapped[DateTime] = mapped_column(
        DateTime(timezone=True), nullable=True, onupdate=func.now()
    )
    # ERD marks created_by / updated_by as [not null] on every table
    created_by: Mapped[str] = mapped_column(String, nullable=False)
    updated_by: Mapped[str] = mapped_column(String, nullable=False)
