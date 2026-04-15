from app.extensions import ma
from app.models.vendor import Vendor
from marshmallow import fields


class VendorSchema(ma.SQLAlchemyAutoSchema):
    class Meta:
        model = Vendor
        load_instance = True
        include_fk = True
        # Exclude the relationship collections - we build them manually in the service layer
        # so we control the exact shape returned to the frontend
        exclude = ('vendor_services', 'msas')

    # Serialize enum fields as their string value (e.g. "active" not "VendorStatus.ACTIVE")
    status = fields.String()
    compliance_status = fields.String()

    # contact_email / contact_phone aliases removed - ERD field names are company_email / company_phone
    # Frontend pages have been updated to use the ERD field names directly


vendor_schema = VendorSchema()
vendors_schema = VendorSchema(many=True)
