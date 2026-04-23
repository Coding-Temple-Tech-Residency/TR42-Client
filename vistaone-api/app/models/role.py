import uuid
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.extensions import db
from app.models.audit_mixin import AuditMixin


user_role = db.Table(
    "user_role",
    db.Column("user_id", db.String(36), db.ForeignKey("user.id"), primary_key=True),
    db.Column("role_id", db.String(36), db.ForeignKey("role.id"), primary_key=True),
)


class Role(db.Model, AuditMixin):
    __tablename__ = "role"

    id: Mapped[str] = mapped_column(
        db.String(36), primary_key=True, default=lambda: str(uuid.uuid4())
    )
    name: Mapped[str] = mapped_column(db.String(50), unique=True, nullable=False)
    description: Mapped[str] = mapped_column(db.String(255), nullable=True)

    users = relationship("User", secondary=user_role, back_populates="roles")
