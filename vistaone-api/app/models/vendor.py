import uuid
import enum
from app.models import db, Base
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy import String, Boolean, DateTime, Enum, ForeignKey, func


# ERD uses ACTIVE/INACTIVE for vendor status
# Values stored lowercase so the API response matches what the frontend expects
# (frontend badge checks use vendor.status === 'active')
class VendorStatus(str, enum.Enum):
    ACTIVE = "active"
    INACTIVE = "inactive"

    # Python 3.11+ changed str(enum_member) to return "ClassName.MEMBER" instead of the value
    # Override __str__ so Marshmallow fields.String() serializes to "active" / "inactive"
    def __str__(self):
        return self.value


# ERD compliance_status enum: EXPIRED, INCOMPLETE, COMPLETE
# Stored lowercase for the same reason as VendorStatus above
class ComplianceStatus(str, enum.Enum):
    EXPIRED = "expired"
    INCOMPLETE = "incomplete"
    COMPLETE = "complete"

    # Same Python 3.11+ fix - ensures "complete" not "ComplianceStatus.COMPLETE" in API responses
    def __str__(self):
        return self.value


# Vendor table - aligns with the ERD vendor table
# NOTE: Shaney's branch used __tablename__ = "vendors" (plural) and stored services as an ARRAY
# This version uses the ERD table name "vendor" (singular) and normalizes services through vendor_services
class Vendor(Base):
    __tablename__ = 'vendor'

    vendor_id: Mapped[str] = mapped_column(
        String,
        primary_key=True,
        default=lambda: str(uuid.uuid4())
    )
    # company_name is unique per ERD (no two vendors share the same name)
    company_name: Mapped[str] = mapped_column(String(80), nullable=False, unique=True)
    company_code: Mapped[str] = mapped_column(String, nullable=True)
    start_date: Mapped[DateTime] = mapped_column(DateTime(timezone=True), nullable=True)
    end_date: Mapped[DateTime] = mapped_column(DateTime(timezone=True), nullable=True)
    primary_contact_name: Mapped[str] = mapped_column(String, nullable=False)
    # ERD uses company_email / company_phone (not contact_email / contact_phone)
    # The frontend mock data used contact_email - the service layer returns both names for backwards compat
    company_email: Mapped[str] = mapped_column(String, nullable=False)
    company_phone: Mapped[str] = mapped_column(String, nullable=False)
    status: Mapped[VendorStatus] = mapped_column(
        Enum(VendorStatus, values_callable=lambda x: [e.value for e in x]),
        nullable=False,
        default=VendorStatus.INACTIVE
    )
    vendor_code: Mapped[str] = mapped_column(String, nullable=True)
    # onboarding tracks whether the vendor is still in the onboarding process
    onboarding: Mapped[bool] = mapped_column(Boolean, nullable=False, default=True)
    compliance_status: Mapped[ComplianceStatus] = mapped_column(
        Enum(ComplianceStatus, values_callable=lambda x: [e.value for e in x]),
        nullable=True,
        default=ComplianceStatus.INCOMPLETE
    )
    # service_type is on the ERD vendor table - noted as "may be enum later or its own table"
    # Stored as nullable text for now; vendor_services junction table handles the detailed service links
    service_type: Mapped[str] = mapped_column(String, nullable=True)
    description: Mapped[str] = mapped_column(String, nullable=True)
    created_at: Mapped[DateTime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )
    updated_at: Mapped[DateTime] = mapped_column(
        DateTime(timezone=True), nullable=True, onupdate=func.now()
    )
    # created_by / updated_by store the user_id string from the JWT token
    created_by: Mapped[str] = mapped_column(String, nullable=True)
    updated_by: Mapped[str] = mapped_column(String, nullable=True)
    # Optional FK to address table - nullable because address isn't required on create
    address_id: Mapped[str] = mapped_column(
        String, ForeignKey('address.address_id'), nullable=True
    )

    # Relationship to the vendor_services junction table
    # Mapped[list['VendorService']] is required in SQLAlchemy 2.0 to ensure uselist=True
    # Using Mapped[list] without a type parameter does not guarantee list behavior
    vendor_services: Mapped[list['VendorService']] = relationship(
        'VendorService',
        back_populates='vendor',
        cascade='all, delete-orphan',
        lazy='select'
    )

    # Relationship to MSA records for this vendor (one vendor has many MSAs)
    # Type parameter is required here - without it SQLAlchemy 2.0 may return a scalar instead of a list
    msas: Mapped[list['Msa']] = relationship(
        'Msa',
        back_populates='vendor',
        cascade='all, delete-orphan',
        lazy='select'
    )
