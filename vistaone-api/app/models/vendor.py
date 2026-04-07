from sqlalchemy import (Column, String, DateTime, ForeignKey, ARRAY)
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import declarative_base, relationship
from datetime import datetime
from app.models import 
import uuid

Base = declarative_base()

class Vendor(Base):
    __tablename__ = "vendors"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    company_name = Column(String, nullable=False)
    service_types = Column(ARRAY(String), nullable=False)
    status = Column(String, nullable=False, default="pending")

    primary_contact_id = Column(UUID(as_uuid=True),ForeignKey("vendor_contact.id"),nullable=True)

    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    
    compliance = relationship("VendorCompliance", uselist=False, back_populates="vendor")
    audits = relationship("VendorStatusAudit", back_populates="vendor")