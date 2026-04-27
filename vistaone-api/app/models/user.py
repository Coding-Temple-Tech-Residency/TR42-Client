from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy import Date
from werkzeug.security import check_password_hash, generate_password_hash
from app.extensions import db
import uuid
from app.blueprints.enum.enums import UserType
from datetime import date
from app.models.audit_mixin import AuditMixin
from app.models.role import user_role


class User(db.Model, AuditMixin):
    __tablename__ = "auth_user"

    id: Mapped[str] = mapped_column(
        db.String(36), primary_key=True, default=lambda: str(uuid.uuid4())
    )
    username: Mapped[str] = mapped_column(db.String(40), unique=True, nullable=False)
    email: Mapped[str] = mapped_column(db.String(100), unique=True, nullable=False)
    password_hash: Mapped[str] = mapped_column(db.String(400), nullable=False)
    user_type: Mapped[UserType] = mapped_column(db.Enum(UserType), nullable=False)
    token_version: Mapped[int] = mapped_column(db.Integer, nullable=False, default=0)
    is_active: Mapped[bool] = mapped_column(db.Boolean, nullable=False, default=True)
    is_admin: Mapped[bool] = mapped_column(db.Boolean, nullable=True, default=False)
    first_name: Mapped[str] = mapped_column(db.String(80), nullable=True)
    middle_name: Mapped[str] = mapped_column(db.String(80), nullable=True)
    last_name: Mapped[str] = mapped_column(db.String(80), nullable=True)
    profile_photo: Mapped[bytes] = mapped_column(db.LargeBinary, nullable=True)
    date_of_birth: Mapped[date] = mapped_column(Date, nullable=True)
    ssn_last_four: Mapped[str] = mapped_column(db.CHAR(4), nullable=True)
    contact_number: Mapped[str] = mapped_column(db.String(30), nullable=True)
    alternate_number: Mapped[str] = mapped_column(db.String(30), nullable=True)

    address_id: Mapped[str] = mapped_column(
        db.String(36), db.ForeignKey("address.id"), nullable=True
    )
    address = db.relationship("Address", foreign_keys=[address_id])

    roles = relationship('Role', secondary=user_role, back_populates='users')

    ## ClientUser relationship — source of truth for client_id and status
    client_user_record = relationship(
        "ClientUser", foreign_keys="[ClientUser.user_id]", uselist=False
    )

    @property
    def client_id(self):
        return self.client_user_record.client_id if self.client_user_record else None

    @property
    def status(self):
        return self.client_user_record.status if self.client_user_record else None

    @status.setter
    def status(self, value):
        if self.client_user_record:
            self.client_user_record.status = value

    def set_password(self, raw_password: str) -> None:
        self.password_hash = generate_password_hash(raw_password)

    def check_password(self, raw_password: str) -> bool:
        return check_password_hash(self.password_hash, raw_password)
