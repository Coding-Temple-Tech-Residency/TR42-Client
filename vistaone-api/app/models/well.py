from sqlalchemy.orm import mapped_column, relationship, Mapped
from app.extensions import db
from app.blueprints.enum.enums import WellStatusEnum, WellTypeEnum
import uuid
from app.models.audit_mixin import AuditMixin


class Well(db.Model, AuditMixin):
    __tablename__ = "well"

    id: Mapped[str] = mapped_column(
        db.String(36), primary_key=True, default=lambda: str(uuid.uuid4())
    )
    client_id = mapped_column(db.String(36), db.ForeignKey("client.id"), nullable=False)

    api_number = mapped_column(db.String(50), unique=True, nullable=False)
    well_name = mapped_column(db.String(255), nullable=True)
    latitude = mapped_column(db.String(50), nullable=True)
    longitude = mapped_column(db.String(50), nullable=True)
    well_type = mapped_column(db.Enum(WellTypeEnum), nullable=True)
    access_instructions = mapped_column(db.Text, nullable=True)
    safety_notes = mapped_column(db.Text, nullable=True)
    status = mapped_column(db.Enum(WellStatusEnum), default=WellStatusEnum.ACTIVE)

    # relationships
    client = relationship("Client", back_populates="wells")
