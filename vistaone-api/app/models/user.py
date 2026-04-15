from datetime import datetime
from sqlalchemy.orm import Mapped, mapped_column
from sqlalchemy import DateTime, Boolean, Integer, String
from werkzeug.security import check_password_hash, generate_password_hash
from app.extensions import db


class User(db.Model):
    __tablename__ = "users"

    user_id: Mapped[Integer] = mapped_column(Integer, primary_key=True)
    email: Mapped[String] = mapped_column(String(255), unique=True, nullable=False)
    password_hash: Mapped[String] = mapped_column(String(255), nullable=False)
    is_active: Mapped[Boolean] = mapped_column(Boolean, default=True)

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=datetime.utcnow
    )

    def set_password(self, raw_password: str) -> None:
        self.password_hash = generate_password_hash(raw_password)

    def check_password(self, raw_password: str) -> bool:
        return check_password_hash(self.password_hash, raw_password)
