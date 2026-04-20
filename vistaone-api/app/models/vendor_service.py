from app.extensions import db, Base

vendor_service = db.Table(
    "vendor_service",
    Base.metadata,
    db.Column("vendor_id", db.ForeignKey("vendor.id")),
    db.Column("service_type_id", db.ForeignKey("service_type.id")),
)
