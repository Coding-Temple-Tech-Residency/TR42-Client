from sqlalchemy import (Column, String, DateTime, Date, ARRAY,ForeignKey)
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import declarative_base, relationship
from datetime import datetime
import uuid

Base = declarative_base()



class VendorStatusAudit(Base):
    __tablename__ = "vendor_status_audit"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    vendor_id = Column(UUID(as_uuid=True), ForeignKey("vendors.id"))

    old_status = Column(String, nullable=False)
    new_status = Column(String, nullable=False)
    reason = Column(String)
    changed_by = Column(String)
    changed_at = Column(DateTime, default=datetime.utcnow)

    vendor = relationship("Vendor", back_populates="audits")