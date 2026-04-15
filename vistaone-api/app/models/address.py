import uuid
from app.models import db, Base
from sqlalchemy.orm import Mapped, mapped_column
from sqlalchemy import String, DateTime, func


# Address table from the ERD - shared by vendors, clients, and users
# Kept as a separate table so one address record can be referenced by multiple entities
class Address(Base):
    __tablename__ = 'address'

    address_id: Mapped[str] = mapped_column(
        String,
        primary_key=True,
        # Generate a UUID string as the PK on insert (matches ERD text PK convention)
        default=lambda: str(uuid.uuid4())
    )
    street: Mapped[str] = mapped_column(String, nullable=True)
    city: Mapped[str] = mapped_column(String, nullable=True)
    state: Mapped[str] = mapped_column(String(20), nullable=True)
    zip: Mapped[str] = mapped_column(String(10), nullable=True)
    # Two-char country code e.g. "US"
    country: Mapped[str] = mapped_column(String(2), nullable=True)
    created_at: Mapped[DateTime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )
    updated_at: Mapped[DateTime] = mapped_column(
        DateTime(timezone=True), nullable=True, onupdate=func.now()
    )
    # created_by / updated_by store the user_id of whoever made the change
    created_by: Mapped[str] = mapped_column(String, nullable=False)
    updated_by: Mapped[str] = mapped_column(String, nullable=True)
