from flask_sqlalchemy import SQLAlchemy
from sqlalchemy import DateTime, func
from werkzeug.security import check_password_hash, generate_password_hash
from __future__ import annotations
import uuid
from datetime import datetime, date
from typing import List, Optional
import sqlalchemy as db
from sqlalchemy import func
from sqlalchemy.dialects.postgresql import UUID as PG_UUID
from sqlalchemy.orm import (Mapped,mapped_column,relationship,
DeclarativeBase,)

class Base(DeclarativeBase):
    pass

# Enums (Postgres-backed)
UserType = db.Enum('operator', 'vendor', 'contractor', name='user_type')
VendorStatus = db.Enum('active', 'inactive', name='vendor_status')
MSAStatus = db.Enum('complete', 'incomplete', 'expired', name='msa_status')
WorkorderStatus = db.Enum('unassigned', 'assigned', 'in_progress', 'completed', 'halted', 'rejected', name='workorder_status')
InvoiceStatus = db.Enum('pending', 'accepted', 'rejected', name='invoice_status')

# Association tables (if needed as explicit tables, otherwise use mapped relationships)
user_roles_table = db.Table(
    'user_roles',
    Base.metadata,
    mapped_column('user_id', PG_UUID(as_uuid=True), db.ForeignKey('users.user_id', ondelete='CASCADE'), primary_key=True),
    mapped_column('role_id', PG_UUID(as_uuid=True), db.ForeignKey('roles.role_id', ondelete='CASCADE'), primary_key=True),
)

vendor_services_table =db.Table(
    'vendor_services',
    Base.metadata,
    mapped_column('vendor_id', PG_UUID(as_uuid=True), db.ForeignKey('vendors.vendor_id', ondelete='CASCADE'), primary_key=True),
    mapped_column('service_id', PG_UUID(as_uuid=True), db.ForeignKey('services.service_id', ondelete='CASCADE'), primary_key=True),
    mapped_column('rate', db.Numeric),
    mapped_column('currency', db.String(8)),
)

class Base(DeclarativeBase):
    pass

db = SQLAlchemy(model_class=Base)



# ---------- Models ----------
class User(Base):
    __tablename__ = 'users'

    user_id: Mapped[uuid.UUID] = mapped_column(PG_UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    username: Mapped[str] = mapped_column(db.String(255), nullable=False, unique=True)
    email: Mapped[str] = mapped_column(db.String(255), nullable=False, unique=True, index=True)
    password_hash: Mapped[str] = mapped_column(db.String(255), nullable=False)
    user_type: Mapped[str] = mapped_column(UserType, nullable=False)
    client_id: Mapped[str] = mapped_column(db.String, db.ForeignKey('clients.client_id', ondelete='SET NULL'), nullable=True, index=True)
    vendor_id: Mapped[uuid.UUID] = mapped_column(PG_UUID(as_uuid=True), db.ForeignKey('vendors.vendor_id', ondelete='SET NULL'), nullable=True, index=True)
    contractor_id: Mapped[str] = mapped_column(db.String, db.ForeignKey('contractors.contractor_id', ondelete='SET NULL'), nullable=True, index=True)
    created_at: Mapped[datetime] = mapped_column(db.DateTime(timezone=True), nullable=False, server_default=func.now())
    updated_at: Mapped[List[datetime]] = mapped_column(db.DateTime(timezone=True), onupdate=func.now())
    
  
    roles: Mapped[List["Role"]] = relationship('Role', secondary=user_roles_table, back_populates='users')
    activity_logs: Mapped[List["ActivityLog"]] = relationship('ActivityLog', back_populates='actor', cascade='all, delete-orphan')
    profile: Mapped[List["UserProfile"]] = relationship("UserProfile",back_populates="user",uselist=False,cascade="all, delete-orphan")
    login: Mapped[List["LoginAttempt"]] = relationship('LoginAttempt', back_populates='user', cascade='all, delete-orphan') 
    
    def set_password(self, raw_password: str) -> None:
        self.password_hash = generate_password_hash(raw_password)

    def check_password(self, raw_password: str) -> bool:
        return check_password_hash(self.password_hash, raw_password)


class LoginAttempt(Base):
    __tablename__ = "login_attempts"
    attempt_id: Mapped[uuid.UUID] = mapped_column(PG_UUID(as_uuid=True),primary_key=True,default=uuid.uuid4)
    user_id: Mapped[[uuid.UUID]] = mapped_column(PG_UUID(as_uuid=True),db.ForeignKey("users.user_id", ondelete="SET NULL"))# pyright: ignore[reportInvalidTypeForm]))
    email_used: Mapped[str] = mapped_column(db.String(255), nullable=False)
    success: Mapped[bool] = mapped_column(db.Boolean, nullable=False)
    ip_address: Mapped[str] = mapped_column(db.String(50))
    user_agent: Mapped[str] = mapped_column(db.String(500))
    attempted_at: Mapped[datetime] = mapped_column(db.DateTime(timezone=True),server_default=func.now())
    user: Mapped[List["User"]] = relationship(back_populates="login_attempts")


class Role(Base):
    __tablename__ = 'roles'
    role_id: Mapped[uuid.UUID] = mapped_column(PG_UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name: Mapped[str] = mapped_column(db.String(255), nullable=False, unique=True)
    description: Mapped[str] = mapped_column(db.Text, nullable=True)

    users: Mapped[List[User]] = relationship('User', secondary=user_roles_table, back_populates='roles')


class Client(Base):
    __tablename__ = 'clients'
    client_id: Mapped[str] = mapped_column(db.String, primary_key=True)
    name: Mapped[str] = mapped_column(db.String(255), nullable=False)
    code: Mapped[str] = mapped_column(db.String(100), nullable=False, unique=True)
    email: Mapped[str] = mapped_column(db.String(255), nullable=False)
    phone: Mapped[str] = mapped_column(db.String(50), nullable=False)
    address_id: Mapped[str]= mapped_column(db.String, db.ForeignKey('addresses.address_id', ondelete='SET NULL'), nullable=True, index=True)
    created_at: Mapped[datetime]= mapped_column(db.DateTime(timezone=True), nullable=False, server_default=func.now())
    updated_at: Mapped[datetime]= mapped_column(db.DateTime(timezone=True), onupdate=func.now())
    created_by: Mapped[uuid.UUID]= mapped_column(PG_UUID(as_uuid=True), db.ForeignKey('users.user_id', ondelete='SET NULL'), nullable=True)
    updated_by: Mapped[uuid.UUID]= mapped_column(PG_UUID(as_uuid=True), db.ForeignKey('users.user_id', ondelete='SET NULL'), nullable=True)

    address: Mapped["Address"]= relationship('Address', back_populates='clients')
    users: Mapped[List[User]]= relationship('User', back_populates='client')
    msas: Mapped[List["MSA"]]= relationship('MSA', back_populates='client', cascade='all, delete-orphan')
    workorders: Mapped[List["Workorder"]] = relationship('Workorder', back_populates='client', cascade='all, delete-orphan')
    invoices: Mapped[List["Invoice"]] = relationship('Invoice', back_populates='client', cascade='all, delete-orphan')


class Vendor(Base):
    __tablename__ = 'vendors'

    vendor_id: Mapped[uuid.UUID] = mapped_column(PG_UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    contact_name: Mapped[str] =mapped_column(db.String(255), nullable=True)
    contact_email: Mapped[str] = mapped_column(db.String(255), nullable=True)
    contact_phone: Mapped[str] = mapped_column(db.String(50), nullable=True)
    address_id: Mapped[str ]= mapped_column(db.String, db.ForeignKey('addresses.address_id', ondelete='SET NULL'), nullable=True, index=True)
    status: Mapped[str] = mapped_column(VendorStatus, nullable=False, server_default='active')
    created_at: Mapped[datetime] = mapped_column(db.DateTime(timezone=True), nullable=False, server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(db.DateTime(timezone=True), onupdate=func.now())

    address: Mapped[List["Address"]] = relationship('Address', back_populates='vendors')
    users: Mapped[List[User]] = relationship('User', back_populates='vendor')
    contractors: Mapped[List["Contractor"]] = relationship('Contractor', back_populates='vendor', cascade='all, delete-orphan')
    services: Mapped[List["Service"]] = relationship('Service', secondary=vendor_services_table, back_populates='vendors')
    msas: Mapped[List["MSA"]] = relationship('MSA', back_populates='vendor', cascade='all, delete-orphan')
    workorder_assignments: Mapped[List["WorkorderVendorAssignment"]] = relationship('WorkorderVendorAssignment', back_populates='vendor', cascade='all, delete-orphan')
    invoices: Mapped[List["Invoice"]] = relationship('Invoice', back_populates='vendor', cascade='all, delete-orphan')
   

class Contractor(Base):
    __tablename__ = 'contractors'

    contractor_id: Mapped[str] = mapped_column(db.String, primary_key=True)
    employee_number: Mapped[str] = mapped_column(db.String, nullable=False)
    vendor_id: Mapped[uuid.UUID] = mapped_column(PG_UUID(as_uuid=True), db.ForeignKey('vendors.vendor_id', ondelete='CASCADE'), nullable=False, index=True)
    vendor_manager_id: Mapped[List[uuid.UUID]] = mapped_column(PG_UUID(as_uuid=True), db.ForeignKey('users.user_id', ondelete='SET NULL'), nullable=True)
    first_name: Mapped[str] = mapped_column(db.String(80))
    last_name: Mapped[str] = mapped_column(db.String(80))
    middle_name: Mapped[str] = mapped_column(db.String(80))
    contact_number: Mapped[str] = mapped_column(db.String(20))
    alternate_number: Mapped[str] = mapped_column(db.String(20))
    date_of_birth: Mapped[List[datetime]] = mapped_column(db.DateTime)
    ssn_last_four: Mapped[str] = mapped_column(db.String(4))
    email: Mapped[str] = mapped_column(db.String(100), unique=True)
    role: Mapped[str] = mapped_column(db.String, nullable=False)
    created_at: Mapped[datetime] = mapped_column(db.DateTime(timezone=True), nullable=False, server_default=func.now())
    updated_at: Mapped[List[datetime]] = mapped_column(db.DateTime(timezone=True), onupdate=func.now())

    vendor: Mapped[Vendor] = relationship('Vendor', back_populates='contractors')
    user: Mapped[List[User]] = relationship('User', back_populates='contractor', uselist=False)
    invoices: Mapped[List["Invoice"]] = relationship('Invoice', back_populates='contractor', cascade='all, delete-orphan')
    insurance_policies: Mapped[List["InsurancePolicy"]] = relationship('InsurancePolicy', back_populates='contractor', cascade='all, delete-orphan')
    licenses: Mapped[List["License"]] = relationship('License', back_populates='contractor', cascade='all, delete-orphan')


class Address(Base):
    __tablename__ = 'addresses'

    address_id: Mapped[str] = mapped_column(db.String, primary_key=True)
    line1: Mapped[str]= mapped_column(db.String)
    line2: Mapped[str] = mapped_column(db.String)
    city: Mapped[str] = mapped_column(db.String)
    state: Mapped[str] = mapped_column(db.String)
    postal_code: Mapped[str] = mapped_column(db.String)
    country: Mapped[str] = mapped_column(db.String)
    created_at: Mapped[datetime] = mapped_column(db.DateTime(timezone=True), nullable=False, server_default=func.now())
    updated_at: Mapped[datetime]= mapped_column(db.DateTime(timezone=True), onupdate=func.now())

    clients: Mapped[Client] = relationship('Client', back_populates='address')
    vendors: Mapped[Vendor]= relationship('Vendor', back_populates='address')
    workorders: Mapped[Workorder]= relationship('Workorder', back_populates='site_address')


class Service(Base):
    __tablename__ = 'services'

    service_id: Mapped[uuid.UUID] = mapped_column(PG_UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    code: Mapped[str] = mapped_column(db.String(100), nullable=False, unique=True)
    name: Mapped[str] = mapped_column(db.String(255), nullable=False)
    description: Mapped[str] = mapped_column(db.Text)
    created_at: Mapped[datetime] = mapped_column(db.DateTime(timezone=True), nullable=False, server_default=func.now())

    vendors: Mapped[List[Vendor]] = relationship('Vendor', secondary=vendor_services_table, back_populates='services')
    workorder_lines: Mapped[List["WorkorderLine"]] = relationship('WorkorderLine', back_populates='service')


class MSA(Base):
    __tablename__ = 'msa'

    msa_id: Mapped[uuid.UUID] = mapped_column(PG_UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    msa_number: Mapped[str] = mapped_column(db.String(100), nullable=False, unique=True)
    client_id: Mapped[str] = mapped_column(db.String, db.ForeignKey('clients.client_id', ondelete='CASCADE'), nullable=True, index=True)
    vendor_id: Mapped[uuid.UUID]= mapped_column(PG_UUID(as_uuid=True), db.ForeignKey('vendors.vendor_id', ondelete='CASCADE'), nullable=True, index=True)
    effective_date: Mapped[date]= mapped_column(db.Date)
    expiry_date: Mapped[date]= mapped_column(db.Date)
    status: Mapped[str]= mapped_column(MSAStatus, nullable=False, server_default='incomplete')
    created_at: Mapped[datetime]= mapped_column(db.DateTime(timezone=True), nullable=False, server_default=func.now())

    client: Mapped[Client]= relationship('Client', back_populates='msas')
    vendor: Mapped[Vendor]= relationship('Vendor', back_populates='msas')
    requirements: Mapped[List["MSARequirement"]] = relationship('MSARequirement', back_populates='msa', cascade='all, delete-orphan')


class MSARequirement(Base):
    __tablename__ = 'msa_requirements'
    requirement_id: Mapped[uuid.UUID] = mapped_column(PG_UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    msa_id: Mapped[uuid.UUID] = mapped_column(PG_UUID(as_uuid=True), db.ForeignKey('mdb.msa_id', ondelete='CASCADE'), nullable=False, index=True)
    requirement: Mapped[str] = mapped_column(db.Text)
    is_met: Mapped[bool] = mapped_column(db.Boolean, nullable=False, server_default=db.text('false'))
    notes: Mapped[str] = mapped_column(db.Text)
    clause_id: Mapped[str] = mapped_column(db.String(100))
    msa: Mapped[List[MSA]] = relationship('MSA', back_populates='requirements')


class Document(Base):
    __tablename__ = 'documents'

    document_id: Mapped[uuid.UUID] = mapped_column(PG_UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    documentable_type: Mapped[str] = mapped_column(db.String(50), nullable=False)  # e.g., 'msa','insurance','license','invoice','workorder'
    documentable_id: Mapped[uuid.UUID] = mapped_column(PG_UUID(as_uuid=True), nullable=False)
    doc_type: Mapped[str] = mapped_column(db.String(100))
    filename: Mapped[str] = mapped_column(db.String(255))
    url: Mapped[str] = mapped_column(db.String(2048))
    uploaded_by: Mapped[uuid.UUID]= mapped_column(PG_UUID(as_uuid=True), db.ForeignKey('users.user_id', ondelete='SET NULL'), nullable=True)
    uploaded_at: Mapped[datetime] = mapped_column(db.DateTime(timezone=True), nullable=False, server_default=func.now())

    uploader: Mapped[User] = relationship('User')
    # polymorphic index defined in migrations/DDL


class InsurancePolicy(Base):
    __tablename__ = 'insurance_policies'

    insurance_id: Mapped[uuid.UUID] = mapped_column(PG_UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    vendor_id: Mapped[uuid.UUID] = mapped_column(PG_UUID(as_uuid=True), db.ForeignKey('vendors.vendor_id', ondelete='CASCADE'), nullable=True, index=True)
    contractor_id: Mapped[str] = mapped_column(db.String, db.ForeignKey('contractors.contractor_id', ondelete='CASCADE'), nullable=True, index=True)
    insurer_name: Mapped[str] = mapped_column(db.String)
    policy_number: Mapped[str] = mapped_column(db.String)
    coverage_start: Mapped[date] = mapped_column(db.Date)
    coverage_end: Mapped[date]= mapped_column(db.Date, index=True)
    limit_amount: Mapped[float] = mapped_column(db.Numeric)
    document_id: Mapped[uuid.UUID] = mapped_column(PG_UUID(as_uuid=True), db.ForeignKey('documents.document_id', ondelete='SET NULL'), nullable=True)

    vendor: Mapped[Vendor] = relationship('Vendor', back_populates='insurance_policies')
    contractor: Mapped[Contractor] = relationship('Contractor', back_populates='insurance_policies')
    document: Mapped[Document] = relationship('Document')


class License(Base):
    __tablename__ = 'licenses'

    license_id: Mapped[uuid.UUID] = mapped_column(PG_UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    vendor_id: Mapped[uuid.UUID] = mapped_column(PG_UUID(as_uuid=True), db.ForeignKey('vendors.vendor_id', ondelete='CASCADE'), nullable=True, index=True)
    contractor_id: Mapped[str]= mapped_column(db.String, db.ForeignKey('contractors.contractor_id', ondelete='CASCADE'), nullable=True, index=True)
    license_type: Mapped[str] = mapped_column(db.String)
    license_number: Mapped[str] = mapped_column(db.String)
    issued_by: Mapped[str] = mapped_column(db.String)
    valid_from: Mapped[date] = mapped_column(db.Date)
    valid_to: Mapped[date]= mapped_column(db.Date, index=True)
    document_id: Mapped[uuid.UUID]= mapped_column(PG_UUID(as_uuid=True), db.ForeignKey('documents.document_id', ondelete='SET NULL'), nullable=True)

    vendor: Mapped[Vendor]= relationship('Vendor', back_populates='licenses')
    contractor: Mapped[List[Contractor]]= relationship('Contractor', back_populates='licenses')
    document: Mapped[List[Document]]= relationship('Document')


class Workorder(Base):
    __tablename__ = 'workorders'
    workorder_id: Mapped[uuid.UUID] = mapped_column(PG_UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    workorder_number: Mapped[str] = mapped_column(db.String(100), nullable=False, unique=True)
    client_id: Mapped[str]= mapped_column(db.String, db.ForeignKey('clients.client_id', ondelete='CASCADE'), nullable=True, index=True)
    created_by: Mapped[uuid.UUID] = mapped_column(PG_UUID(as_uuid=True), db.ForeignKey('users.user_id', ondelete='SET NULL'), nullable=True)
    site_address_id: Mapped[str] = mapped_column(db.String, db.ForeignKey('addresses.address_id', ondelete='SET NULL'), nullable=True)
    status: Mapped[str] = mapped_column(WorkorderStatus, nullable=False, server_default='unassigned')
    priority: Mapped[str]= mapped_column(db.String)
    created_at: Mapped[datetime] = mapped_column(db.DateTime(timezone=True), nullable=False, server_default=func.now())
    scheduled_start: Mapped[datetime] = mapped_column(db.DateTime(timezone=True))
    scheduled_end: Mapped[datetime] = mapped_column(db.DateTime(timezone=True))

    client: Mapped[Client]= relationship('Client', back_populates='workorders')
    creator: Mapped[User] = relationship('User')
    site_address: Mapped[Address] = relationship('Address', back_populates='workorders')
    lines: Mapped[List["WorkorderLine"]] = relationship('WorkorderLine', back_populates='workorder', cascade='all, delete-orphan')
    assignments: Mapped[List["WorkorderVendorAssignment"]] = relationship('WorkorderVendorAssignment', back_populates='workorder', cascade='all, delete-orphan')
    tickets: Mapped[List["Ticket"]] = relationship('Ticket', back_populates='workorder', cascade='all, delete-orphan')
    invoices: Mapped[List["Invoice"]] = relationship('Invoice', back_populates='workorder')


class WorkorderLine(Base):
    __tablename__ = 'workorder_lines'
    line_id: Mapped[uuid.UUID] = mapped_column(PG_UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    workorder_id: Mapped[uuid.UUID] = mapped_column(PG_UUID(as_uuid=True), db.ForeignKey('workorders.workorder_id', ondelete='CASCADE'), nullable=False, index=True)
    service_id: Mapped[uuid.UUID] = mapped_column(PG_UUID(as_uuid=True), db.ForeignKey('services.service_id', ondelete='SET NULL'), nullable=True)
    description: Mapped[str] = mapped_column(db.Text)
    quantity: Mapped[float] = mapped_column(db.Numeric)
    unit: Mapped[str] = mapped_column(db.String)
    estimated_cost: Mapped[float] = mapped_column(db.Numeric)

    workorder: Mapped[Workorder] = relationship('Workorder', back_populates='lines')
    service: Mapped[Service] = relationship('Service', back_populates='workorder_lines')
    invoice_lines: Mapped[List["InvoiceLine"]] = relationship('InvoiceLine', back_populates='workorder_line')


class WorkorderVendorAssignment(Base):
    __tablename__ = 'workorder_vendor_assignments'
    assignment_id: Mapped[uuid.UUID] = mapped_column(PG_UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    workorder_id: Mapped[uuid.UUID] = mapped_column(PG_UUID(as_uuid=True), db.ForeignKey('workorders.workorder_id', ondelete='CASCADE'), nullable=False, index=True)
    vendor_id: Mapped[uuid.UUID] = mapped_column(PG_UUID(as_uuid=True), db.ForeignKey('vendors.vendor_id', ondelete='CASCADE'), nullable=False, index=True)
    assigned_by: Mapped[uuid.UUID]= mapped_column(PG_UUID(as_uuid=True), db.ForeignKey('users.user_id', ondelete='SET NULL'), nullable=True)
    assigned_at: Mapped[datetime] = mapped_column(db.DateTime(timezone=True), nullable=False, server_default=func.now())
    status: Mapped[str]= mapped_column(db.String)

    workorder: Mapped[Workorder] = relationship('Workorder', back_populates='assignments')
    vendor: Mapped[Vendor] = relationship('Vendor', back_populates='workorder_assignments')
    assigner: Mapped[User] = relationship('User')
##################################
#Invoices and related models#

class Ticket(Base):
    __tablename__ = 'tickets'
    ticket_id: Mapped[uuid.UUID] = mapped_column(PG_UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    workorder_id: Mapped[uuid.UUID] = mapped_column(PG_UUID(as_uuid=True), db.ForeignKey('workorders.workorder_id', ondelete='CASCADE'), nullable=True, index=True)
    workorder_line_id: Mapped[uuid.UUID] = mapped_column(PG_UUID(as_uuid=True), db.ForeignKey('workorder_lines.line_id', ondelete='SET NULL'), nullable=True)
    reported_by: Mapped[uuid.UUID]= mapped_column(PG_UUID(as_uuid=True), db.ForeignKey('users.user_id', ondelete='SET NULL'), nullable=True)
    assigned_to: Mapped[uuid.UUID] = mapped_column(PG_UUID(as_uuid=True), db.ForeignKey('users.user_id', ondelete='SET NULL'), nullable=True)
    vendor_id: Mapped[uuid.UUID]= mapped_column(PG_UUID(as_uuid=True), db.ForeignKey('vendors.vendor_id', ondelete='SET NULL'), nullable=True)
    contractor_id: Mapped[str]= mapped_column(db.String, db.ForeignKey('contractors.contractor_id', ondelete='SET NULL'), nullable=True)
    category: Mapped[str] = mapped_column(db.String)
    severity: Mapped[str] = mapped_column(db.String)
    description: Mapped[str] = mapped_column(db.Text)
    status: Mapped[str]= mapped_column(db.String)
    created_at: Mapped[datetime] = mapped_column(db.DateTime(timezone=True), nullable=False, server_default=func.now())

    workorder: Mapped[Workorder] = relationship('Workorder', back_populates='tickets')
    reporter: Mapped[User] = relationship('User', foreign_keys=[reported_by])
    assignee: Mapped[User] = relationship('User', foreign_keys=[assigned_to])
    vendor: Mapped[Vendor] = relationship('Vendor')
    contractor: Mapped[Contractor] = relationship('Contractor')


class Invoice(Base):
    __tablename__ = 'invoices'

    invoice_id: Mapped[uuid.UUID] = mapped_column(PG_UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    invoice_number: Mapped[str] = mapped_column(db.String(100), nullable=False, unique=True)
    vendor_id: Mapped[uuid.UUID]= mapped_column(PG_UUID(as_uuid=True), db.ForeignKey('vendors.vendor_id', ondelete='SET NULL'), nullable=True, index=True)
    contractor_id: Mapped[str]= mapped_column(db.String, db.ForeignKey('contractors.contractor_id', ondelete='SET NULL'), nullable=True, index=True)
    client_id: Mapped[str] = mapped_column(db.String, db.ForeignKey('clients.client_id', ondelete='CASCADE'), nullable=True, index=True)
    workorder_id: Mapped[uuid.UUID]= mapped_column(PG_UUID(as_uuid=True), db.ForeignKey('workorders.workorder_id', ondelete='SET NULL'), nullable=True)
    total_amount: Mapped[float]= mapped_column(db.Numeric)
    currency: Mapped[str] = mapped_column(db.String(8))
    status: Mapped[str] = mapped_column(InvoiceStatus, nullable=False, server_default='pending')
    submitted_at: Mapped[datetime] = mapped_column(db.DateTime(timezone=True))
    due_date: Mapped[date] = mapped_column(db.Date)
    created_at: Mapped[datetime] = mapped_column(db.DateTime(timezone=True), nullable=False, server_default=func.now())

    vendor: Mapped[Vendor] = relationship('Vendor', back_populates='invoices')
    contractor: Mapped[Contractor] = relationship('Contractor', back_populates='invoices')
    client: Mapped[Client]= relationship('Client', back_populates='invoices')
    workorder: Mapped[Workorder] = relationship('Workorder', back_populates='invoices')
    lines: Mapped[List["InvoiceLine"]] = relationship('InvoiceLine', back_populates='invoice', cascade='all, delete-orphan')
    approvals: Mapped[List["InvoiceApproval"]] = relationship('InvoiceApproval', back_populates='invoice', cascade='all, delete-orphan')
    submissions: Mapped[List["InvoiceSubmission"]] = relationship('InvoiceSubmission', back_populates='invoice', cascade='all, delete-orphan')
    
class InvoiceLine(Base):
    __tablename__ = 'invoice_lines'
    invoice_line_id: Mapped[uuid.UUID] = mapped_column(PG_UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    invoice_id: Mapped[uuid.UUID] = mapped_column(PG_UUID(as_uuid=True), db.ForeignKey('invoices.invoice_id', ondelete='CASCADE'), nullable=False, index=True)
    workorder_line_id: Mapped[uuid.UUID] = mapped_column(PG_UUID(as_uuid=True), db.ForeignKey('workorder_lines.line_id', ondelete='SET NULL'), nullable=True)
    description: Mapped[str] = mapped_column(db.Text)
    quantity: Mapped[float] = mapped_column(db.Numeric)
    unit_price: Mapped[float] = mapped_column(db.Numeric)
    line_total: Mapped[float] = mapped_column(db.Numeric)

    invoice: Mapped[List['Invoice']] = relationship('Invoice', back_populates='lines')
    workorder_line: Mapped['WorkorderLine'] = relationship('WorkorderLine', back_populates='invoice_lines')


class InvoiceApproval(Base):
    __tablename__ = 'invoice_approvals'
    approval_id: Mapped[uuid.UUID] = mapped_column(PG_UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    invoice_id: Mapped[uuid.UUID] = mapped_column(PG_UUID(as_uuid=True), db.ForeignKey('invoices.invoice_id', ondelete='CASCADE'), nullable=False, index=True)
    approver_id: Mapped[uuid.UUID] = mapped_column(PG_UUID(as_uuid=True), db.ForeignKey('users.user_id', ondelete='SET NULL'), nullable=True)
    action: Mapped[str] = mapped_column(db.String)  # 'approved' | 'rejected'
    comment: Mapped[str] = mapped_column(db.Text)
    action_at: Mapped[datetime] = mapped_column(db.DateTime(timezone=True), nullable=False, server_default=func.now())

    invoice: Mapped[List[Invoice]] = relationship('Invoice', back_populates='approvals')
    approver: Mapped[List[User]] = relationship('User')


class InvoiceSubmission(Base):
    __tablename__ = 'invoice_submissions'
    submission_id: Mapped[uuid.UUID] = mapped_column(PG_UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    invoice_id: Mapped[uuid.UUID] = mapped_column(PG_UUID(as_uuid=True), db.ForeignKey('invoices.invoice_id', ondelete='CASCADE'), nullable=False, index=True)
    submitted_by: Mapped[uuid.UUID] = mapped_column(PG_UUID(as_uuid=True), db.ForeignKey('users.user_id', ondelete='SET NULL'), nullable=True)
    submitted_to_client: Mapped[bool] = mapped_column(db.Boolean, nullable=False, server_default=db.text('false'))
    submitted_at: Mapped[datetime] = mapped_column(db.DateTime(timezone=True), nullable=False, server_default=func.now())
    external_reference: Mapped[str]= mapped_column(db.String)

    invoice: Mapped[List[Invoice]] = relationship('Invoice', back_populates='submissions')
    submitter: Mapped[List[User]] = relationship('User')


class UserProfile(Base):
    __tablename__ = "user_profiles"
    profile_id: Mapped[uuid.UUID] = mapped_column(PG_UUID(as_uuid=True),primary_key=True,default=uuid.uuid4)
    user_id: Mapped[uuid.UUID] = mapped_column(PG_UUID(as_uuid=True),db.ForeignKey("users.user_id", ondelete="CASCADE"),unique=True,nullable=False)
    first_name: Mapped[str] = mapped_column(db.String(100))
    last_name: Mapped[str] = mapped_column(db.String(100))
    phone: Mapped[str] = mapped_column(db.String(20))
    avatar_url: Mapped[str] = mapped_column(db.String(500))
    updated_at: Mapped[datetime] = mapped_column(db.DateTime(timezone=True),server_default=func.now(),onupdate=func.now())

    user: Mapped["User"] = relationship(back_populates="profile")

class DashboardWidget(Base):
    __tablename__ = "dashboard_widgets"
    widget_id: Mapped[uuid.UUID] = mapped_column(PG_UUID(as_uuid=True),primary_key=True,default=uuid.uuid4)
    user_id: Mapped[uuid.UUID] = mapped_column(PG_UUID(as_uuid=True),db.ForeignKey("users.user_id", ondelete="CASCADE"), nullable=False)
    widget_type: Mapped[str] = mapped_column(db.String(100), nullable=False)
    position: Mapped[int] = mapped_column(db.Integer, nullable=False)
    config: Mapped[dict] = mapped_column(db.JSON, default=dict)
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
    actor_id: Mapped[uuid.UUID]= mapped_column(PG_UUID(as_uuid=True), db.ForeignKey('users.user_id', ondelete='SET NULL'), nullable=True, index=True)
    action: Mapped[str]= mapped_column(db.String)
    target_type: Mapped[str] = mapped_column(db.String)
    target_id: Mapped[uuid.UUID] = mapped_column(PG_UUID(as_uuid=True))
    metadata: Mapped[dict] = mapped_column(db.JSON)
    created_at: Mapped[datetime] = mapped_column(db.DateTime(timezone=True), nullable=False, server_default=func.now())

    actor: Mapped[List[User]] = relationship('User', back_populates='activity_logs')


class Notification(Base):
    __tablename__ = 'notifications'
    notification_id: Mapped[uuid.UUID] = mapped_column(PG_UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id: Mapped[uuid.UUID]= mapped_column(PG_UUID(as_uuid=True), db.ForeignKey('users.user_id', ondelete='CASCADE'), nullable=True, index=True)
    type: Mapped[str]= mapped_column(db.String)
    payload: Mapped[dict] = mapped_column(db.JSON)
    sent_at: Mapped[datetime] = mapped_column(db.DateTime(timezone=True))
    status: Mapped[str] = mapped_column(db.String)

    user: Mapped[List[User]] = relationship('User')
