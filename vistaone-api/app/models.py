from flask_sqlalchemy import SQLAlchemy
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column
from sqlalchemy import DateTime, func

class Base(DeclarativeBase):
    pass

db = SQLAlchemy(model_class=Base)

class User(Base):
    __tablename__ = 'users'
    
    id: Mapped[int] = mapped_column(primary_key=True)
    first_name: Mapped[str] = mapped_column(db.String(255), nullable=False)
    last_name: Mapped[str] = mapped_column(db.String(255), nullable=False)
    email: Mapped[str] = mapped_column(db.String(255), unique=True, nullable=False)
    password_hash: Mapped[str] = mapped_column(db.String(255), nullable=False)
    role_id: Mapped[int] = mapped_column(nullable=False)
    company_id: Mapped[int] = mapped_column(nullable=False)
    created_at: Mapped[DateTime] = mapped_column(DateTime(timezone=True), nullable=False, server_default=func.now())
