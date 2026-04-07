
from sqlalchemy import (Column, String, DateTime, Date, Boolean,ForeignKey, ARRAY)
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import declarative_base, relationship
from datetime import datetime
import uuid

Base = declarative_base()


class VendorCompliance(Base):
    __tablename__ = "vendor_compliance"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    vendor_id = Column(UUID(as_uuid=True), ForeignKey("vendors.id"), unique=True)

    insurance_expiration = Column(Date)
    license_expiration = Column(Date)
    msa_status = Column(String)  # valid | expired | missing
    is_compliant = Column(Boolean, default=False)

    last_reviewed_at = Column(DateTime, default=datetime.utcnow)

    vendor = relationship("Vendor", back_populates="compliance")