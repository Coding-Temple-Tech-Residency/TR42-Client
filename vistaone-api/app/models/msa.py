import uuid
from app.models import db, Base
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy import String, Date, DateTime, ForeignKey, func


# MSA table from the ERD - stores Master Service Agreement metadata for each vendor
# The actual PDF file is stored on disk and referenced by file_name (see note below)
class Msa(Base):
    __tablename__ = 'msa'

    msa_id: Mapped[str] = mapped_column(
        String,
        primary_key=True,
        default=lambda: str(uuid.uuid4())
    )
    vendor_id: Mapped[str] = mapped_column(
        String, ForeignKey('vendor.vendor_id'), nullable=False
    )
    # Version tag for the document e.g. "1.0", "2.1" (varchar 10 per ERD)
    version: Mapped[str] = mapped_column(String(10), nullable=True)
    effective_date: Mapped[Date] = mapped_column(Date, nullable=True)
    expiration_date: Mapped[Date] = mapped_column(Date, nullable=True)
    # Status options: active, expired, incomplete, pending
    # varchar(15) per ERD - not a formal enum to allow flexibility
    status: Mapped[str] = mapped_column(String(15), nullable=False, default='active')
    # uploaded_by stores the user_id of whoever uploaded the document
    uploaded_by: Mapped[str] = mapped_column(String, nullable=True)

    # file_name is NOT in the ERD msa table but is required to serve / reference the uploaded PDF
    # Added here to avoid a separate document-storage table for the initial implementation
    # The file is saved at uploads/msa/<file_name> on the server
    file_name: Mapped[str] = mapped_column(String, nullable=True)

    created_at: Mapped[DateTime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )
    updated_at: Mapped[DateTime] = mapped_column(
        DateTime(timezone=True), nullable=True, onupdate=func.now()
    )
    # ERD marks created_by / updated_by as [not null] on every table
    created_by: Mapped[str] = mapped_column(String, nullable=False)
    updated_by: Mapped[str] = mapped_column(String, nullable=True)

    # Back-reference to the vendor this MSA belongs to
    vendor: Mapped['Vendor'] = relationship('Vendor', back_populates='msas')
