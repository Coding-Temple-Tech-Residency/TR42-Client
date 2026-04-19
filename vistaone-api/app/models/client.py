from sqlalchemy.orm import mapped_column, Mapped
from sqlalchemy import DateTime, func
import uuid
from app.extensions import db
from datetime import datetime


class Client(db.Model):
    __tablename__ = "client"

    id: Mapped[str] = mapped_column(
        db.String(36), primary_key=True, default=lambda: str(uuid.uuid4())
    )
    client_name: Mapped[str] = mapped_column(db.String(255), nullable=False)
    client_code: Mapped[str] = mapped_column(
        db.String(255), nullable=False, unique=True
    )
    primary_contact_name: Mapped[str] = mapped_column(db.String(80), nullable=False)
    company_email: Mapped[str] = mapped_column(db.String(100), nullable=False)
    company_contact_number: Mapped[str] = mapped_column(db.String(30), nullable=False)
    company_web_address: Mapped[str] = mapped_column(db.String(100))

    address_id: Mapped[str] = mapped_column(db.String(36), db.ForeignKey("address.id"))
    address = db.relationship("Address")

    created_by: Mapped[str] = mapped_column(
        db.String(36), db.ForeignKey("user.id"), nullable=False
    )
    created_user = db.relationship("User", back_populates="created_clients")

    updated_by: Mapped[str] = mapped_column(
        db.String(36), db.ForeignKey("user.id"), nullable=False
    )
    updated_user = db.relationship("User", back_populates="updated_clients")

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )

    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
        nullable=False,
    )

    wells = db.relationship("Well", back_populates="client")
    workorders = db.relationship("WorkOrder", back_populates="client")
