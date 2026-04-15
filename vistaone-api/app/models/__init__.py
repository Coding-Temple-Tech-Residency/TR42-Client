from flask_sqlalchemy import SQLAlchemy
from sqlalchemy.orm import DeclarativeBase


class Base(DeclarativeBase):
    pass


db = SQLAlchemy(model_class=Base)

# Import all models here so SQLAlchemy registers their tables before db.create_all() runs
from .user import User
from .address import Address
from .services import Service
from .vendor import Vendor
from .vendor_services import VendorService
from .msa import Msa
