from app.extensions import ma
from marshmallow import EXCLUDE, fields, validates_schema, ValidationError
from app.models import WorkOrder
from app.blueprints.schema.vendor_schema import VendorSchema
from app.blueprints.schema.service_type_schema import ServiceTypeSchema
from app.blueprints.enum.enums import (
    PriorityEnum,
    FrequencyEnum,
    LocationTypeEnum,
    StatusEnum,
)
from app.blueprints.schema.address_schema import AddressSchema
import logging

logger = logging.getLogger(__name__)


class WorkOrderSchema(ma.SQLAlchemyAutoSchema):
    class Meta:
        model = WorkOrder
        include_fk = True
        load_instance = False
        unknown = EXCLUDE

    id = fields.String(dump_only=True)
    work_order_id = fields.Int(dump_only=True)

    client_id = fields.String(required=True)
    vendor_id = fields.String(required=True)
    service_type_id = fields.String(required=True)
    description = fields.String(required=True)

    location_type = fields.Enum(LocationTypeEnum, by_value=True, required=True)

    well_id = fields.String()
    latitude = fields.Float()
    longitude = fields.Float()

    address_id = fields.String(
        allow_none=True, required=False
    )  # WorkOrderSchema will accept address fields but they will be used to create an Address record and linked via address_id. address_id is optional in input because if location_type is GPS or WELL, we won't have address info. But if location_type is ADDRESS, we will create an Address record and link it via address_id.
    address = fields.Nested(
        "AddressSchema", dump_only=True
    )  # Nested schema for output only. When we return a workorder, we want to include the address details if it's an ADDRESS type.
    street = (
        fields.String()
    )  # These fields are for input only. They will be used to create an Address record if location_type is ADDRESS, but they won't be stored directly in the WorkOrder table.
    city = fields.String()
    state = fields.String()
    zip = fields.String()
    country = fields.String()

    units = fields.String()
    estimated_quantity = fields.Float()

    priority = fields.Enum(PriorityEnum, by_value=True, required=True)

    is_recurring = fields.Boolean()
    recurrence_type = fields.Enum(FrequencyEnum, by_value=True)

    estimated_start_date = fields.DateTime()
    estimated_end_date = fields.DateTime()

    status = fields.Enum(StatusEnum, by_value=True)
    display_status = fields.Method("compute_display_status", dump_only=True)

    vendor = fields.Nested("VendorSchema", dump_only=True)
    service_type = fields.Nested("ServiceTypeSchema", dump_only=True)

    def compute_display_status(self, obj):
        from app.models.invoice import Invoice
        from app.blueprints.enum.enums import InvoiceStatusEnum

        invoices = Invoice.query.filter_by(work_order_id=obj.id).all()
        if not invoices:
            return obj.status.value if obj.status else None

        statuses = {inv.invoice_status for inv in invoices}
        if InvoiceStatusEnum.REJECTED in statuses:
            return "INVOICE_REJECTED"
        if InvoiceStatusEnum.PENDING in statuses:
            return "PENDING_REVIEW"
        return obj.status.value if obj.status else None

    @validates_schema
    def validate_fields(self, data, **kwargs):
        # RECURSION VALIDATION
        if data.get("is_recurring") == True and not data.get("recurrence_type"):
            raise ValidationError("recurrence_type required when is_recurring is TRUE")

    @validates_schema
    def validate_location(self, data, **kwargs):
        location_type = data.get("location_type")

        # For PUT (partial update) → skip if not provided
        if not location_type:
            return

        has_address = any(
            [data.get("street"), data.get("city"), data.get("state"), data.get("zip")]
        )
        has_gps = data.get("latitude") is not None or data.get("longitude") is not None
        has_well = data.get("well_id") is not None

        if location_type == LocationTypeEnum.ADDRESS:
            if not has_address:
                raise ValidationError("Address fields required")
            if has_gps or has_well:
                raise ValidationError("Only ADDRESS allowed")

        elif location_type == LocationTypeEnum.GPS:
            if not has_gps:
                raise ValidationError("latitude & longitude required")
            if has_address or has_well:
                raise ValidationError("Only GPS allowed")

        elif location_type == LocationTypeEnum.WELL:
            if not has_well:
                raise ValidationError("well_id required")
            if has_address or has_gps:
                raise ValidationError("Only WELL allowed")


workorder_schema = WorkOrderSchema()
workorders_schema = WorkOrderSchema(many=True)
