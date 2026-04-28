from sqlalchemy.orm import mapped_column, relationship
from sqlalchemy.sql import func
import uuid
from app.extensions import db
from app.models.audit_mixin import AuditMixin


class LineItem(db.Model, AuditMixin):
    __tablename__ = "line_item"

    id = mapped_column(
        db.String(36), primary_key=True, default=lambda: str(uuid.uuid4())
    )
    invoice_id = mapped_column(
        db.String(36), db.ForeignKey("invoice.id"), nullable=False
    )
    quantity = mapped_column(db.Integer, nullable=False)
    rate = mapped_column(db.Numeric, nullable=False)
    amount = mapped_column(db.Numeric, nullable=False)
    description = mapped_column(db.Text, nullable=True)

    ## Relationships
    invoice = relationship("Invoice", back_populates="line_items")
