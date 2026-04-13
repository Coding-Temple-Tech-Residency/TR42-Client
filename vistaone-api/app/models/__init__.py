from sqlalchemy.orm import DeclarativeBase
from flask_sqlalchemy import SQLAlchemy

db = SQLAlchemy()

class Base(DeclarativeBase):
    pass

from .vendor import Vendor
from .vendor_contact import VendorContact
from .vendor_compliance import VendorCompliance
from .vendor_status_audit import VendorStatusAudit
from .user import User
