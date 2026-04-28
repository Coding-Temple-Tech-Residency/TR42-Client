from sqlalchemy.orm import mapped_column, Mapped, relationship
import uuid
from app.extensions import db
from app.models.audit_mixin import AuditMixin
from app.blueprints.enum.enums import UserStatus


class ClientUser(db.Model, AuditMixin):
    __tablename__ = "client_user"

    id: Mapped[str] = mapped_column(
        db.String(36), primary_key=True, default=lambda: str(uuid.uuid4())
    )
    user_id: Mapped[str] = mapped_column(
        db.String(36), db.ForeignKey("auth_user.id"), nullable=False, unique=True
    )
    client_id: Mapped[str] = mapped_column(
        db.String(36), db.ForeignKey("client.id"), nullable=False
    )
    status: Mapped[UserStatus] = mapped_column(
        db.Enum(UserStatus), nullable=False, default=UserStatus.ACTIVE
    )

    ## Relationships
    user = relationship("User", foreign_keys=[user_id])
    client = relationship("Client", foreign_keys=[client_id], back_populates="users")
