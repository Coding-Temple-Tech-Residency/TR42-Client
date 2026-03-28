from flask_sqlalchemy import SQLAlchemy
from sqlalchemy import DateTime, func
from werkzeug.security import check_password_hash, generate_password_hash
from __future__ import annotations
import uuid
from datetime import datetime, date
from typing import List, Optional
import sqlalchemy as sa
from sqlalchemy import func
from sqlalchemy.dialects.postgresql import UUID as PG_UUID
from sqlalchemy.orm import (Mapped,mapped_column,relationship,
DeclarativeBase,)

class Base(DeclarativeBase):
    pass

# Enums (Postgres-backed)
UserType = sa.Enum('operator', 'vendor', 'contractor', name='user_type')
VendorStatus = sa.Enum('active', 'inactive', name='vendor_status')
MSAStatus = sa.Enum('complete', 'incomplete', 'expired', name='msa_status')
WorkorderStatus = sa.Enum('unassigned', 'assigned', 'in_progress', 'completed', 'halted', 'rejected', name='workorder_status')
InvoiceStatus = sa.Enum('pending', 'accepted', 'rejected', name='invoice_status')

# Association tables (if needed as explicit tables, otherwise use mapped relationships)
user_roles_table = sa.Table(
    'user_roles',
    Base.metadata,
    mapped_column('user_id', PG_UUID(as_uuid=True), sa.ForeignKey('users.user_id', ondelete='CASCADE'), primary_key=True),
    mapped_column('role_id', PG_UUID(as_uuid=True), sa.ForeignKey('roles.role_id', ondelete='CASCADE'), primary_key=True),
)

vendor_services_table = sa.Table(
    'vendor_services',
    Base.metadata,
    mapped_column('vendor_id', PG_UUID(as_uuid=True), sa.ForeignKey('vendors.vendor_id', ondelete='CASCADE'), primary_key=True),
    mapped_column('service_id', PG_UUID(as_uuid=True), sa.ForeignKey('services.service_id', ondelete='CASCADE'), primary_key=True),
    mapped_column('rate', sa.Numeric),
    mapped_column('currency', sa.String(8)),
)

class Base(DeclarativeBase):
    pass

db = SQLAlchemy(model_class=Base)



# ---------- Models ----------
class User(Base):
    __tablename__ = 'users'

    user_id: Mapped[uuid.UUID] = mapped_column(PG_UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    username: Mapped[str] = mapped_column(sa.String(255), nullable=False, unique=True)
    email: Mapped[str] = mapped_column(sa.String(255), nullable=False, unique=True, index=True)
    password_hash: Mapped[str] = mapped_column(sa.String(255), nullable=False)
    user_type: Mapped[str] = mapped_column(UserType, nullable=False)
    client_id: Mapped[Optional[str]] = mapped_column(sa.String, sa.ForeignKey('clients.client_id', ondelete='SET NULL'), nullable=True, index=True)
    vendor_id: Mapped[Optional[uuid.UUID]] = mapped_column(PG_UUID(as_uuid=True), sa.ForeignKey('vendors.vendor_id', ondelete='SET NULL'), nullable=True, index=True)
    contractor_id: Mapped[Optional[str]] = mapped_column(sa.String, sa.ForeignKey('contractors.contractor_id', ondelete='SET NULL'), nullable=True, index=True)
    created_at: Mapped[datetime] = mapped_column(sa.DateTime(timezone=True), nullable=False, server_default=func.now())
    updated_at: Mapped[Optional[datetime]] = mapped_column(sa.DateTime(timezone=True), onupdate=func.now())
    
    # relationships
    roles: Mapped[List["Role"]] = relationship('Role', secondary=user_roles_table, back_populates='users')
    activity_logs: Mapped[List["ActivityLog"]] = relationship('ActivityLog', back_populates='actor', cascade='all, delete-orphan')
    profile: Mapped["UserProfile"] = relationship("UserProfile",back_populates="user",uselist=False,cascade="all, delete-orphan")

    def set_password(self, raw_password: str) -> None:
        self.password_hash = generate_password_hash(raw_password)

    def check_password(self, raw_password: str) -> bool:
        return check_password_hash(self.password_hash, raw_password)


class LoginAttempt(Base):
    __tablename__ = "login_attempts"
    attempt_id: Mapped[uuid.UUID] = mapped_column(PG_UUID(as_uuid=True),primary_key=True,default=uuid.uuid4)
    user_id: Mapped[[uuid.UUID]] = mapped_column(PG_UUID(as_uuid=True),sa.ForeignKey("users.user_id", ondelete="SET NULL") # pyright: ignore[reportInvalidTypeForm]))
    email_used: Mapped[str] = mapped_column(sa.String(255), nullable=False)
    success: Mapped[bool] = mapped_column(sa.Boolean, nullable=False)
    ip_address: Mapped[Optional[str]] = mapped_column(sa.String(50))
    user_agent: Mapped[Optional[str]] = mapped_column(sa.String(500))
    attempted_at: Mapped[datetime] = mapped_column(sa.DateTime(timezone=True),server_default=func.now())
    user: Mapped[Optional["User"]] = relationship(back_populates="login_attempts")


class Role(Base):
    __tablename__ = 'roles'

    role_id: Mapped[uuid.UUID] = mapped_column(PG_UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name: Mapped[str] = mapped_column(sa.String(255), nullable=False, unique=True)
    description: Mapped[Optional[str]] = mapped_column(sa.Text, nullable=True)

    users: Mapped[List[User]] = relationship('User', secondary=user_roles_table, back_populates='roles')


class Client(Base):
    __tablename__ = 'clients'

    client_id: Mapped[str] = mapped_column(sa.String, primary_key=True)
    client_name: Mapped[str] = mapped_column(sa.String(255), nullable=False)
    client_code: Mapped[str] = mapped_column(sa.String(100), nullable=False, unique=True)
    primary_contact_name: Mapped[str] = mapped_column(sa.String(255), nullable=False)
    contact_email: Mapped[str] = mapped_column(sa.String(255), nullable=False)
    contact_phone: Mapped[str] = mapped_column(sa.String(50), nullable=False)
    address_id: Mapped[Optional[str]] = mapped_column(sa.String, sa.ForeignKey('addresses.address_id', ondelete='SET NULL'), nullable=True, index=True)
    created_at: Mapped[datetime] = mapped_column(sa.DateTime(timezone=True), nullable=False, server_default=func.now())
    updated_at: Mapped[Optional[datetime]] = mapped_column(sa.DateTime(timezone=True), onupdate=func.now())
    created_by: Mapped[Optional[uuid.UUID]] = mapped_column(PG_UUID(as_uuid=True), sa.ForeignKey('users.user_id', ondelete='SET NULL'), nullable=True)
    updated_by: Mapped[Optional[uuid.UUID]] = mapped_column(PG_UUID(as_uuid=True), sa.ForeignKey('users.user_id', ondelete='SET NULL'), nullable=True)

    address: Mapped[Optional["Address"]] = relationship('Address', back_populates='clients')
    users: Mapped[List[User]] = relationship('User', back_populates='client')
    msas: Mapped[List["MSA"]] = relationship('MSA', back_populates='client', cascade='all, delete-orphan')
    workorders: Mapped[List["Workorder"]] = relationship('Workorder', back_populates='client', cascade='all, delete-orphan')
    invoices: Mapped[List["Invoice"]] = relationship('Invoice', back_populates='client', cascade='all, delete-orphan')


class Vendor(Base):
    __tablename__ = 'vendors'

    vendor_id: Mapped[uuid.UUID] = mapped_column(PG_UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    vendor_name: Mapped[str] = mapped_column(sa.String(255), nullable=False)
    vendor_code: Mapped[Optional[str]] = mapped_column(sa.String(100), nullable=True)
    primary_contact_name: Mapped[Optional[str]] = mapped_column(sa.String(255), nullable=True)
    contact_email: Mapped[Optional[str]] = mapped_column(sa.String(255), nullable=True)
    contact_phone: Mapped[Optional[str]] = mapped_column(sa.String(50), nullable=True)
    address_id: Mapped[Optional[str]] = mapped_column(sa.String, sa.ForeignKey('addresses.address_id', ondelete='SET NULL'), nullable=True, index=True)
    status: Mapped[str] = mapped_column(VendorStatus, nullable=False, server_default='active')
    created_at: Mapped[datetime] = mapped_column(sa.DateTime(timezone=True), nullable=False, server_default=func.now())
    updated_at: Mapped[Optional[datetime]] = mapped_column(sa.DateTime(timezone=True), onupdate=func.now())

    address: Mapped[Optional["Address"]] = relationship('Address', back_populates='vendors')
    users: Mapped[List[User]] = relationship('User', back_populates='vendor')
    contractors: Mapped[List["Contractor"]] = relationship('Contractor', back_populates='vendor', cascade='all, delete-orphan')
    services: Mapped[List["Service"]] = relationship('Service', secondary=vendor_services_table, back_populates='vendors')
    msas: Mapped[List["MSA"]] = relationship('MSA', back_populates='vendor', cascade='all, delete-orphan')
    workorder_assignments: Mapped[List["WorkorderVendorAssignment"]] = relationship('WorkorderVendorAssignment', back_populates='vendor', cascade='all, delete-orphan')
    invoices: Mapped[List["Invoice"]] = relationship('Invoice', back_populates='vendor', cascade='all, delete-orphan')
    insurance_policies: Mapped[List["InsurancePolicy"]] = relationship('InsurancePolicy', back_populates='vendor', cascade='all, delete-orphan')
    licenses: Mapped[List["License"]] = relationship('License', back_populates='vendor', cascade='all, delete-orphan')


class Contractor(Base):
    __tablename__ = 'contractors'

    contractor_id: Mapped[str] = mapped_column(sa.String, primary_key=True)
    employee_number: Mapped[str] = mapped_column(sa.String, nullable=False)
    vendor_id: Mapped[uuid.UUID] = mapped_column(PG_UUID(as_uuid=True), sa.ForeignKey('vendors.vendor_id', ondelete='CASCADE'), nullable=False, index=True)
    vendor_manager_id: Mapped[Optional[uuid.UUID]] = mapped_column(PG_UUID(as_uuid=True), sa.ForeignKey('users.user_id', ondelete='SET NULL'), nullable=True)
    first_name: Mapped[Optional[str]] = mapped_column(sa.String(80))
    last_name: Mapped[Optional[str]] = mapped_column(sa.String(80))
    middle_name: Mapped[Optional[str]] = mapped_column(sa.String(80))
    contact_number: Mapped[Optional[str]] = mapped_column(sa.String(20))
    alternate_number: Mapped[Optional[str]] = mapped_column(sa.String(20))
    date_of_birth: Mapped[Optional[datetime]] = mapped_column(sa.DateTime)
    ssn_last_four: Mapped[Optional[str]] = mapped_column(sa.String(4))
    email: Mapped[Optional[str]] = mapped_column(sa.String(100), unique=True)
    role: Mapped[str] = mapped_column(sa.String, nullable=False)
    created_at: Mapped[datetime] = mapped_column(sa.DateTime(timezone=True), nullable=False, server_default=func.now())
    updated_at: Mapped[Optional[datetime]] = mapped_column(sa.DateTime(timezone=True), onupdate=func.now())

    vendor: Mapped[Vendor] = relationship('Vendor', back_populates='contractors')
    user: Mapped[Optional[User]] = relationship('User', back_populates='contractor', uselist=False)
    invoices: Mapped[List["Invoice"]] = relationship('Invoice', back_populates='contractor', cascade='all, delete-orphan')
    insurance_policies: Mapped[List["InsurancePolicy"]] = relationship('InsurancePolicy', back_populates='contractor', cascade='all, delete-orphan')
    licenses: Mapped[List["License"]] = relationship('License', back_populates='contractor', cascade='all, delete-orphan')


class Address(Base):
    __tablename__ = 'addresses'

    address_id: Mapped[str] = mapped_column(sa.String, primary_key=True)
    line1: Mapped[Optional[str]] = mapped_column(sa.String)
    line2: Mapped[Optional[str]] = mapped_column(sa.String)
    city: Mapped[Optional[str]] = mapped_column(sa.String)
    state: Mapped[Optional[str]] = mapped_column(sa.String)
    postal_code: Mapped[Optional[str]] = mapped_column(sa.String)
    country: Mapped[Optional[str]] = mapped_column(sa.String)
    created_at: Mapped[datetime] = mapped_column(sa.DateTime(timezone=True), nullable=False, server_default=func.now())
    updated_at: Mapped[Optional[datetime]] = mapped_column(sa.DateTime(timezone=True), onupdate=func.now())

    clients: Mapped[List[Client]] = relationship('Client', back_populates='address')
    vendors: Mapped[List[Vendor]] = relationship('Vendor', back_populates='address')
    workorders: Mapped[List["Workorder"]] = relationship('Workorder', back_populates='site_address')


class Service(Base):
    __tablename__ = 'services'

    service_id: Mapped[uuid.UUID] = mapped_column(PG_UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    code: Mapped[str] = mapped_column(sa.String(100), nullable=False, unique=True)
    name: Mapped[str] = mapped_column(sa.String(255), nullable=False)
    description: Mapped[Optional[str]] = mapped_column(sa.Text)
    created_at: Mapped[datetime] = mapped_column(sa.DateTime(timezone=True), nullable=False, server_default=func.now())

    vendors: Mapped[List[Vendor]] = relationship('Vendor', secondary=vendor_services_table, back_populates='services')
    workorder_lines: Mapped[List["WorkorderLine"]] = relationship('WorkorderLine', back_populates='service')


class MSA(Base):
    __tablename__ = 'msa'

    msa_id: Mapped[uuid.UUID] = mapped_column(PG_UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    msa_number: Mapped[str] = mapped_column(sa.String(100), nullable=False, unique=True)
    client_id: Mapped[Optional[str]] = mapped_column(sa.String, sa.ForeignKey('clients.client_id', ondelete='CASCADE'), nullable=True, index=True)
    vendor_id: Mapped[Optional[uuid.UUID]] = mapped_column(PG_UUID(as_uuid=True), sa.ForeignKey('vendors.vendor_id', ondelete='CASCADE'), nullable=True, index=True)
    effective_date: Mapped[Optional[date]] = mapped_column(sa.Date)
    expiry_date: Mapped[Optional[date]] = mapped_column(sa.Date)
    status: Mapped[str] = mapped_column(MSAStatus, nullable=False, server_default='incomplete')
    created_at: Mapped[datetime] = mapped_column(sa.DateTime(timezone=True), nullable=False, server_default=func.now())

    client: Mapped[Optional[Client]] = relationship('Client', back_populates='msas')
    vendor: Mapped[Optional[Vendor]] = relationship('Vendor', back_populates='msas')
    requirements: Mapped[List["MSARequirement"]] = relationship('MSARequirement', back_populates='msa', cascade='all, delete-orphan')


class MSARequirement(Base):
    __tablename__ = 'msa_requirements'

    requirement_id: Mapped[uuid.UUID] = mapped_column(PG_UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    msa_id: Mapped[uuid.UUID] = mapped_column(PG_UUID(as_uuid=True), sa.ForeignKey('msa.msa_id', ondelete='CASCADE'), nullable=False, index=True)
    requirement: Mapped[Optional[str]] = mapped_column(sa.Text)
    is_met: Mapped[bool] = mapped_column(sa.Boolean, nullable=False, server_default=sa.text('false'))
    notes: Mapped[Optional[str]] = mapped_column(sa.Text)

    msa: Mapped[MSA] = relationship('MSA', back_populates='requirements')


class Document(Base):
    __tablename__ = 'documents'

    document_id: Mapped[uuid.UUID] = mapped_column(PG_UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    documentable_type: Mapped[str] = mapped_column(sa.String(50), nullable=False)  # e.g., 'msa','insurance','license','invoice','workorder'
    documentable_id: Mapped[uuid.UUID] = mapped_column(PG_UUID(as_uuid=True), nullable=False)
    doc_type: Mapped[Optional[str]] = mapped_column(sa.String(100))
    filename: Mapped[Optional[str]] = mapped_column(sa.String(255))
    url: Mapped[Optional[str]] = mapped_column(sa.String(2048))
    uploaded_by: Mapped[Optional[uuid.UUID]] = mapped_column(PG_UUID(as_uuid=True), sa.ForeignKey('users.user_id', ondelete='SET NULL'), nullable=True)
    uploaded_at: Mapped[datetime] = mapped_column(sa.DateTime(timezone=True), nullable=False, server_default=func.now())

    uploader: Mapped[Optional[User]] = relationship('User')
    # polymorphic index defined in migrations/DDL


class InsurancePolicy(Base):
    __tablename__ = 'insurance_policies'

    insurance_id: Mapped[uuid.UUID] = mapped_column(PG_UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    vendor_id: Mapped[Optional[uuid.UUID]] = mapped_column(PG_UUID(as_uuid=True), sa.ForeignKey('vendors.vendor_id', ondelete='CASCADE'), nullable=True, index=True)
    contractor_id: Mapped[Optional[str]] = mapped_column(sa.String, sa.ForeignKey('contractors.contractor_id', ondelete='CASCADE'), nullable=True, index=True)
    insurer_name: Mapped[Optional[str]] = mapped_column(sa.String)
    policy_number: Mapped[Optional[str]] = mapped_column(sa.String)
    coverage_start: Mapped[Optional[date]] = mapped_column(sa.Date)
    coverage_end: Mapped[Optional[date]] = mapped_column(sa.Date, index=True)
    limit_amount: Mapped[Optional[float]] = mapped_column(sa.Numeric)
    document_id: Mapped[Optional[uuid.UUID]] = mapped_column(PG_UUID(as_uuid=True), sa.ForeignKey('documents.document_id', ondelete='SET NULL'), nullable=True)

    vendor: Mapped[Optional[Vendor]] = relationship('Vendor', back_populates='insurance_policies')
    contractor: Mapped[Optional[Contractor]] = relationship('Contractor', back_populates='insurance_policies')
    document: Mapped[Optional[Document]] = relationship('Document')


class License(Base):
    __tablename__ = 'licenses'

    license_id: Mapped[uuid.UUID] = mapped_column(PG_UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    vendor_id: Mapped[Optional[uuid.UUID]] = mapped_column(PG_UUID(as_uuid=True), sa.ForeignKey('vendors.vendor_id', ondelete='CASCADE'), nullable=True, index=True)
    contractor_id: Mapped[Optional[str]] = mapped_column(sa.String, sa.ForeignKey('contractors.contractor_id', ondelete='CASCADE'), nullable=True, index=True)
    license_type: Mapped[Optional[str]] = mapped_column(sa.String)
    license_number: Mapped[Optional[str]] = mapped_column(sa.String)
    issued_by: Mapped[Optional[str]] = mapped_column(sa.String)
    valid_from: Mapped[Optional[date]] = mapped_column(sa.Date)
    valid_to: Mapped[Optional[date]] = mapped_column(sa.Date, index=True)
    document_id: Mapped[Optional[uuid.UUID]] = mapped_column(PG_UUID(as_uuid=True), sa.ForeignKey('documents.document_id', ondelete='SET NULL'), nullable=True)

    vendor: Mapped[Optional[Vendor]] = relationship('Vendor', back_populates='licenses')
    contractor: Mapped[Optional[Contractor]] = relationship('Contractor', back_populates='licenses')
    document: Mapped[Optional[Document]] = relationship('Document')


class Workorder(Base):
    __tablename__ = 'workorders'

    workorder_id: Mapped[uuid.UUID] = mapped_column(PG_UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    workorder_number: Mapped[str] = mapped_column(sa.String(100), nullable=False, unique=True)
    client_id: Mapped[Optional[str]] = mapped_column(sa.String, sa.ForeignKey('clients.client_id', ondelete='CASCADE'), nullable=True, index=True)
    created_by: Mapped[Optional[uuid.UUID]] = mapped_column(PG_UUID(as_uuid=True), sa.ForeignKey('users.user_id', ondelete='SET NULL'), nullable=True)
    site_address_id: Mapped[Optional[str]] = mapped_column(sa.String, sa.ForeignKey('addresses.address_id', ondelete='SET NULL'), nullable=True)
    status: Mapped[str] = mapped_column(WorkorderStatus, nullable=False, server_default='unassigned')
    priority: Mapped[Optional[str]] = mapped_column(sa.String)
    created_at: Mapped[datetime] = mapped_column(sa.DateTime(timezone=True), nullable=False, server_default=func.now())
    scheduled_start: Mapped[Optional[datetime]] = mapped_column(sa.DateTime(timezone=True))
    scheduled_end: Mapped[Optional[datetime]] = mapped_column(sa.DateTime(timezone=True))

    client: Mapped[Optional[Client]] = relationship('Client', back_populates='workorders')
    creator: Mapped[Optional[User]] = relationship('User')
    site_address: Mapped[Optional[Address]] = relationship('Address', back_populates='workorders')
    lines: Mapped[List["WorkorderLine"]] = relationship('WorkorderLine', back_populates='workorder', cascade='all, delete-orphan')
    assignments: Mapped[List["WorkorderVendorAssignment"]] = relationship('WorkorderVendorAssignment', back_populates='workorder', cascade='all, delete-orphan')
    tickets: Mapped[List["Ticket"]] = relationship('Ticket', back_populates='workorder', cascade='all, delete-orphan')
    invoices: Mapped[List["Invoice"]] = relationship('Invoice', back_populates='workorder')


class WorkorderLine(Base):
    __tablename__ = 'workorder_lines'

    line_id: Mapped[uuid.UUID] = mapped_column(PG_UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    workorder_id: Mapped[uuid.UUID] = mapped_column(PG_UUID(as_uuid=True), sa.ForeignKey('workorders.workorder_id', ondelete='CASCADE'), nullable=False, index=True)
    service_id: Mapped[Optional[uuid.UUID]] = mapped_column(PG_UUID(as_uuid=True), sa.ForeignKey('services.service_id', ondelete='SET NULL'), nullable=True)
    description: Mapped[Optional[str]] = mapped_column(sa.Text)
    quantity: Mapped[Optional[float]] = mapped_column(sa.Numeric)
    unit: Mapped[Optional[str]] = mapped_column(sa.String)
    estimated_cost: Mapped[Optional[float]] = mapped_column(sa.Numeric)

    workorder: Mapped[Workorder] = relationship('Workorder', back_populates='lines')
    service: Mapped[Optional[Service]] = relationship('Service', back_populates='workorder_lines')
    invoice_lines: Mapped[List["InvoiceLine"]] = relationship('InvoiceLine', back_populates='workorder_line')


class WorkorderVendorAssignment(Base):
    __tablename__ = 'workorder_vendor_assignments'

    assignment_id: Mapped[uuid.UUID] = mapped_column(PG_UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    workorder_id: Mapped[uuid.UUID] = mapped_column(PG_UUID(as_uuid=True), sa.ForeignKey('workorders.workorder_id', ondelete='CASCADE'), nullable=False, index=True)
    vendor_id: Mapped[uuid.UUID] = mapped_column(PG_UUID(as_uuid=True), sa.ForeignKey('vendors.vendor_id', ondelete='CASCADE'), nullable=False, index=True)
    assigned_by: Mapped[Optional[uuid.UUID]] = mapped_column(PG_UUID(as_uuid=True), sa.ForeignKey('users.user_id', ondelete='SET NULL'), nullable=True)
    assigned_at: Mapped[datetime] = mapped_column(sa.DateTime(timezone=True), nullable=False, server_default=func.now())
    status: Mapped[Optional[str]] = mapped_column(sa.String)

    workorder: Mapped[Workorder] = relationship('Workorder', back_populates='assignments')
    vendor: Mapped[Vendor] = relationship('Vendor', back_populates='workorder_assignments')
    assigner: Mapped[Optional[User]] = relationship('User')


class Ticket(Base):
    __tablename__ = 'tickets'

    ticket_id: Mapped[uuid.UUID] = mapped_column(PG_UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    workorder_id: Mapped[Optional[uuid.UUID]] = mapped_column(PG_UUID(as_uuid=True), sa.ForeignKey('workorders.workorder_id', ondelete='CASCADE'), nullable=True, index=True)
    workorder_line_id: Mapped[Optional[uuid.UUID]] = mapped_column(PG_UUID(as_uuid=True), sa.ForeignKey('workorder_lines.line_id', ondelete='SET NULL'), nullable=True)
    reported_by: Mapped[Optional[uuid.UUID]] = mapped_column(PG_UUID(as_uuid=True), sa.ForeignKey('users.user_id', ondelete='SET NULL'), nullable=True)
    assigned_to: Mapped[Optional[uuid.UUID]] = mapped_column(PG_UUID(as_uuid=True), sa.ForeignKey('users.user_id', ondelete='SET NULL'), nullable=True)
    vendor_id: Mapped[Optional[uuid.UUID]] = mapped_column(PG_UUID(as_uuid=True), sa.ForeignKey('vendors.vendor_id', ondelete='SET NULL'), nullable=True)
    contractor_id: Mapped[Optional[str]] = mapped_column(sa.String, sa.ForeignKey('contractors.contractor_id', ondelete='SET NULL'), nullable=True)
    category: Mapped[Optional[str]] = mapped_column(sa.String)
    severity: Mapped[Optional[str]] = mapped_column(sa.String)
    description: Mapped[Optional[str]] = mapped_column(sa.Text)
    status: Mapped[Optional[str]] = mapped_column(sa.String)
    created_at: Mapped[datetime] = mapped_column(sa.DateTime(timezone=True), nullable=False, server_default=func.now())

    workorder: Mapped[Optional[Workorder]] = relationship('Workorder', back_populates='tickets')
    reporter: Mapped[Optional[User]] = relationship('User', foreign_keys=[reported_by])
    assignee: Mapped[Optional[User]] = relationship('User', foreign_keys=[assigned_to])
    vendor: Mapped[Optional[Vendor]] = relationship('Vendor')
    contractor: Mapped[Optional[Contractor]] = relationship('Contractor')


class Invoice(Base):
    __tablename__ = 'invoices'

    invoice_id: Mapped[uuid.UUID] = mapped_column(PG_UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    invoice_number: Mapped[str] = mapped_column(sa.String(100), nullable=False, unique=True)
    vendor_id: Mapped[Optional[uuid.UUID]] = mapped_column(PG_UUID(as_uuid=True), sa.ForeignKey('vendors.vendor_id', ondelete='SET NULL'), nullable=True, index=True)
    contractor_id: Mapped[Optional[str]] = mapped_column(sa.String, sa.ForeignKey('contractors.contractor_id', ondelete='SET NULL'), nullable=True, index=True)
    client_id: Mapped[Optional[str]] = mapped_column(sa.String, sa.ForeignKey('clients.client_id', ondelete='CASCADE'), nullable=True, index=True)
    workorder_id: Mapped[Optional[uuid.UUID]] = mapped_column(PG_UUID(as_uuid=True), sa.ForeignKey('workorders.workorder_id', ondelete='SET NULL'), nullable=True)
    total_amount: Mapped[Optional[float]] = mapped_column(sa.Numeric)
    currency: Mapped[Optional[str]] = mapped_column(sa.String(8))
    status: Mapped[str] = mapped_column(InvoiceStatus, nullable=False, server_default='pending')
    submitted_at: Mapped[Optional[datetime]] = mapped_column(sa.DateTime(timezone=True))
    due_date: Mapped[Optional[date]] = mapped_column(sa.Date)
    created_at: Mapped[datetime] = mapped_column(sa.DateTime(timezone=True), nullable=False, server_default=func.now())

    vendor: Mapped[Optional[Vendor]] = relationship('Vendor', back_populates='invoices')
    contractor: Mapped[Optional[Contractor]] = relationship('Contractor', back_populates='invoices')
    client: Mapped[Optional[Client]] = relationship('Client', back_populates='invoices')
    workorder: Mapped[Optional[Workorder]] = relationship('Workorder', back_populates='invoices')
    lines: Mapped[List["InvoiceLine"]] = relationship('InvoiceLine', back_populates='invoice', cascade='all, delete-orphan')
    approvals: Mapped[List["InvoiceApproval"]] = relationship('InvoiceApproval', back_populates='invoice', cascade='all, delete-orphan')
    submissions: Mapped[List["InvoiceSubmission"]] = relationship('InvoiceSubmission', back_populates='invoice', cascade='all, delete-orphan')
    
class InvoiceLine(Base):
    __tablename__ = 'invoice_lines'

    invoice_line_id: Mapped[uuid.UUID] = mapped_column(PG_UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    invoice_id: Mapped[uuid.UUID] = mapped_column(PG_UUID(as_uuid=True), sa.ForeignKey('invoices.invoice_id', ondelete='CASCADE'), nullable=False, index=True)
    workorder_line_id: Mapped[Optional[uuid.UUID]] = mapped_column(PG_UUID(as_uuid=True), sa.ForeignKey('workorder_lines.line_id', ondelete='SET NULL'), nullable=True)
    description: Mapped[Optional[str]] = mapped_column(sa.Text)
    quantity: Mapped[Optional[float]] = mapped_column(sa.Numeric)
    unit_price: Mapped[Optional[float]] = mapped_column(sa.Numeric)
    line_total: Mapped[Optional[float]] = mapped_column(sa.Numeric)

    invoice: Mapped[Invoice] = relationship('Invoice', back_populates='lines')
    workorder_line: Mapped[Optional[WorkorderLine]] = relationship('WorkorderLine', back_populates='invoice_lines')


class InvoiceApproval(Base):
    __tablename__ = 'invoice_approvals'

    approval_id: Mapped[uuid.UUID] = mapped_column(PG_UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    invoice_id: Mapped[uuid.UUID] = mapped_column(PG_UUID(as_uuid=True), sa.ForeignKey('invoices.invoice_id', ondelete='CASCADE'), nullable=False, index=True)
    approver_id: Mapped[Optional[uuid.UUID]] = mapped_column(PG_UUID(as_uuid=True), sa.ForeignKey('users.user_id', ondelete='SET NULL'), nullable=True)
    action: Mapped[Optional[str]] = mapped_column(sa.String)  # 'approved' | 'rejected'
    comment: Mapped[Optional[str]] = mapped_column(sa.Text)
    action_at: Mapped[datetime] = mapped_column(sa.DateTime(timezone=True), nullable=False, server_default=func.now())

    invoice: Mapped[Invoice] = relationship('Invoice', back_populates='approvals')
    approver: Mapped[Optional[User]] = relationship('User')


class InvoiceSubmission(Base):
    __tablename__ = 'invoice_submissions'

    submission_id: Mapped[uuid.UUID] = mapped_column(PG_UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    invoice_id: Mapped[uuid.UUID] = mapped_column(PG_UUID(as_uuid=True), sa.ForeignKey('invoices.invoice_id', ondelete='CASCADE'), nullable=False, index=True)
    submitted_by: Mapped[Optional[uuid.UUID]] = mapped_column(PG_UUID(as_uuid=True), sa.ForeignKey('users.user_id', ondelete='SET NULL'), nullable=True)
    submitted_to_client: Mapped[bool] = mapped_column(sa.Boolean, nullable=False, server_default=sa.text('false'))
    submitted_at: Mapped[datetime] = mapped_column(sa.DateTime(timezone=True), nullable=False, server_default=func.now())
    external_reference: Mapped[Optional[str]] = mapped_column(sa.String)

    invoice: Mapped[Invoice] = relationship('Invoice', back_populates='submissions')
    submitter: Mapped[Optional[User]] = relationship('User')


class UserProfile(Base):
    __tablename__ = "user_profiles"

    profile_id: Mapped[uuid.UUID] = mapped_column(
        PG_UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4
    )

    user_id: Mapped[uuid.UUID] = mapped_column(
        PG_UUID(as_uuid=True),
        sa.ForeignKey("users.user_id", ondelete="CASCADE"),
        unique=True,
        nullable=False
    )

    first_name: Mapped[Optional[str]] = mapped_column(sa.String(100))
    last_name: Mapped[Optional[str]] = mapped_column(sa.String(100))
    phone: Mapped[Optional[str]] = mapped_column(sa.String(20))
    avatar_url: Mapped[Optional[str]] = mapped_column(sa.String(500))

    updated_at: Mapped[datetime] = mapped_column(
        sa.DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now()
    )

    user: Mapped["User"] = relationship(back_populates="profile")

class DashboardWidget(Base):
    __tablename__ = "dashboard_widgets"

    widget_id: Mapped[uuid.UUID] = mapped_column(
        PG_UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4
    )

    user_id: Mapped[uuid.UUID] = mapped_column(
        PG_UUID(as_uuid=True),
        sa.ForeignKey("users.user_id", ondelete="CASCADE"),
        nullable=False
    )

    widget_type: Mapped[str] = mapped_column(sa.String(100), nullable=False)
    position: Mapped[int] = mapped_column(sa.Integer, nullable=False)
    config: Mapped[dict] = mapped_column(sa.JSON, default=dict)

    user: Mapped["User"] = relationship()
class DashboardMetrics(Base):
    __tablename__ = "dashboard_metrics"
    __table_args__ = {"info": {"is_view": True}}

    total_users: Mapped[int] = mapped_column(primary_key=True)
    total_vendors: Mapped[int] = mapped_column()
    total_workorders: Mapped[int] = mapped_column()
    pending_invoices: Mapped[int] = mapped_column()
    refreshed_at: Mapped[datetime] = mapped_column()


class ActivityLog(Base):
    __tablename__ = 'activity_logs'

    activity_id: Mapped[uuid.UUID] = mapped_column(PG_UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    actor_id: Mapped[Optional[uuid.UUID]] = mapped_column(PG_UUID(as_uuid=True), sa.ForeignKey('users.user_id', ondelete='SET NULL'), nullable=True, index=True)
    action: Mapped[Optional[str]] = mapped_column(sa.String)
    target_type: Mapped[Optional[str]] = mapped_column(sa.String)
    target_id: Mapped[Optional[uuid.UUID]] = mapped_column(PG_UUID(as_uuid=True))
    metadata: Mapped[Optional[dict]] = mapped_column(sa.JSON)
    created_at: Mapped[datetime] = mapped_column(sa.DateTime(timezone=True), nullable=False, server_default=func.now())

    actor: Mapped[Optional[User]] = relationship('User', back_populates='activity_logs')


class Notification(Base):
    __tablename__ = 'notifications'

    notification_id: Mapped[uuid.UUID] = mapped_column(PG_UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id: Mapped[Optional[uuid.UUID]] = mapped_column(PG_UUID(as_uuid=True), sa.ForeignKey('users.user_id', ondelete='CASCADE'), nullable=True, index=True)
    type: Mapped[Optional[str]] = mapped_column(sa.String)
    payload: Mapped[Optional[dict]] = mapped_column(sa.JSON)
    sent_at: Mapped[Optional[datetime]] = mapped_column(sa.DateTime(timezone=True))
    status: Mapped[Optional[str]] = mapped_column(sa.String)

    user: Mapped[Optional[User]] = relationship('User')
