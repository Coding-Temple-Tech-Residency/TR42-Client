from sqlalchemy.orm import mapped_column
from sqlalchemy.sql import func
import uuid
from app.extensions import db


# Services table per ERD - catalog of service types vendors can offer
# e.g. "Wellbore Integrity", "Cementing Services", "Pipeline Survey"
# Vendors link to services through the vendor_services junction table
class Service(db.Model):
    __tablename__ = "services"

    service_id = mapped_column(
        db.String(36), primary_key=True, default=lambda: str(uuid.uuid4())
    )
    service = mapped_column(db.String(255), nullable=False, unique=True)
    created_by = mapped_column(db.String(100), nullable=False)
    created_date = mapped_column(db.DateTime, server_default=func.now())
    last_modified_by = mapped_column(db.String(100))
    last_modified_date = mapped_column(db.DateTime)
