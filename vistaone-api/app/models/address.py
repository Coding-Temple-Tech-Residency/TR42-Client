from typing import List
import uuid
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.extensions import db
from sqlalchemy import func, DateTime
from datetime import datetime


class Address(db.Model):
    __tablename__ = "address"

    id: Mapped[str] = mapped_column(
        db.String(36), primary_key=True, default=lambda: str(uuid.uuid4())
    )
    street: Mapped[str] = mapped_column(db.String(255), nullable=False)
    city: Mapped[str] = mapped_column(db.String(100), nullable=False)
    state: Mapped[str] = mapped_column(db.String(50))
    zip: Mapped[str] = mapped_column(db.String(20), nullable=False)
    country: Mapped[str] = mapped_column(db.String(100), nullable=False)

    created_by: Mapped[str] = mapped_column(
        db.String(36), db.ForeignKey("user.id"), nullable=False
    )
    created_user = db.relationship("User", back_populates="created_address")

    updated_by: Mapped[str] = mapped_column(
        db.String(36), db.ForeignKey("user.id"), nullable=False
    )
    updated_user = db.relationship("User", back_populates="updated_address")

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )

    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
        nullable=False,
    )

    client = relationship("Client", back_populates="address", uselist=False)
    users = relationship("User", back_populates="address")
    # vendors = relationship('Vendor', back_populates='address')
    workorders = relationship("WorkOrder", back_populates="address")
