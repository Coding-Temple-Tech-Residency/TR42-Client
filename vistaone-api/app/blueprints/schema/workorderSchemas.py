from app.extensions import ma
from marshmallow import fields, validates_schema, ValidationError
from app.models.workorder import WorkOrder
from app.models.enums import PriorityEnum, FrequencyEnum, JobTypeEnum, LocationTypeEnum, VendorEnum

class WorkOrderSchema(ma.SQLAlchemyAutoSchema):
    class Meta:
        model = WorkOrder
        include_fk = True
        load_instance = True

    work_order_id = fields.String(required=True)
    job_type = fields.String(required=True)
    vendor_id = fields.String(required=True)
    description = fields.String(required=True)
    location_type = fields.String()
    well_number = fields.String()
    coordinates = fields.String()
    begin_date = fields.Date(required=True)
    begin_time = fields.Time(required=True)
    priority = fields.String(required=True)
    recursion = fields.Boolean()
    frequency = fields.String()
    start_service = fields.Date()
    end_service = fields.Date()
    client_id = fields.String()
    created_by = fields.String(required=True)

    @validates_schema
    def validate_location(self, data, **kwargs):
        # LT1 must have well_number
        if data.get("location_type") == LocationTypeEnum.LT1.value and not data.get("well_number"):
            raise ValidationError("well_number is required for LT1")
        # LT2 must have coordinates
        if data.get("location_type") == LocationTypeEnum.LT2.value and not data.get("coordinates"):
            raise ValidationError("coordinates are required for LT2")

    @validates_schema
    def validate_enums(self, data, **kwargs):
        if data.get("priority") and data["priority"] not in [e.value for e in PriorityEnum]:
            raise ValidationError(f"Invalid priority: {data['priority']}")
        if data.get("frequency") and data["frequency"] not in [e.value for e in FrequencyEnum]:
            raise ValidationError(f"Invalid frequency: {data['frequency']}")
        if data.get("job_type") and data["job_type"] not in [e.value for e in JobTypeEnum]:
            raise ValidationError(f"Invalid job_type: {data['job_type']}")
        if data.get("vendor_id") and data["vendor_id"] not in [e.value for e in VendorEnum]:
            raise ValidationError(f"Invalid vendor_id: {data['vendor_id']}")



# workorder_schema = WorkOrderSchema()
# workorders_schema = WorkOrderSchema(many=True)

'''
from marshmallow import Schema, fields
from app.extensions import ma
from app.models import WorkOrder


class WorkOrderSchema(ma.SQLAlchemyAutoSchema):

    class Meta:
        model = WorkOrder
        load_instance = False

    work_order_id = fields.String(dump_only=True)
    description = fields.String(required=True)
    current_status = fields.String(required=True)
    priority = fields.String(required=True)
    created_by = fields.String(required=False)
    created_at = fields.DateTime(dump_only=True)



workorder_schema = WorkOrderSchema()
workorders_schema = WorkOrderSchema(many=True)


from flask_sqlalchemy import SQLAlchemy
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column
from sqlalchemy import DateTime, func,Text, Interval
import uuid
from werkzeug.security import check_password_hash, generate_password_hash

class Base(DeclarativeBase):
@@ -25,3 +26,26 @@ def set_password(self, raw_password: str) -> None:

    def check_password(self, raw_password: str) -> bool:
        return check_password_hash(self.password_hash, raw_password)



class WorkOrder(Base):
    __tablename__ = "work_orders"

    work_order_id: Mapped[str] = mapped_column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4())) 
    assigned_vendor: Mapped[int] = mapped_column(db.Integer, nullable=True)
    assigned_at: Mapped[DateTime] = mapped_column(DateTime(timezone=True), nullable=True)
    completed_at: Mapped[DateTime] = mapped_column(DateTime(timezone=True), nullable=True)
    description: Mapped[str] = mapped_column(Text, nullable=True)
    due_date: Mapped[DateTime] = mapped_column(DateTime(timezone=True), nullable=True)
    current_status: Mapped[str] = mapped_column(db.String(50), nullable=False)
    comments: Mapped[str] = mapped_column(Text, nullable=True)
    location: Mapped[str] = mapped_column(db.String(60), nullable=True)
    estimated_cost: Mapped[float] = mapped_column(db.Numeric, nullable=True)
    estimated_duration: Mapped[str] = mapped_column(Interval, nullable=True)
    priority: Mapped[str] = mapped_column(db.String(50), nullable=False)
    well_id: Mapped[str] = mapped_column(db.String(50), nullable=True)
    created_at: Mapped[DateTime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    updated_at: Mapped[DateTime] = mapped_column(DateTime(timezone=True), nullable=True)
    created_by: Mapped[str] = mapped_column(db.String(50))
    updated_by: Mapped[str] = mapped_column(db.String(50), nullable=True)


'''