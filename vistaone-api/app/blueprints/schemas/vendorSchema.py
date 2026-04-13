from marshmallow import fields
from marshmallow_sqlalchemy import SQLAlchemyAutoSchema

from app.extensions import ma
from app.models.vendor import Vendor
from app.models.vendor_contact import VendorContact
from app.models.vendor_compliance import VendorCompliance
from app.models.vendor_status_audit import VendorStatusAudit


class VendorContactSchema(ma.SQLAlchemyAutoSchema):
    class Meta:
        model = VendorContact
        load_instance = True
        include_fk = True
        ordered = True


class VendorComplianceSchema(ma.SQLAlchemyAutoSchema):
    class Meta:
        model = VendorCompliance
        load_instance = True
        include_fk = True
        ordered = True


class VendorStatusAuditSchema(ma.SQLAlchemyAutoSchema):
    class Meta:
        model = VendorStatusAudit
        load_instance = True
        include_fk = True
        ordered = True


class VendorSchema(ma.SQLAlchemyAutoSchema):
    contacts = fields.Nested(VendorContactSchema, many=True)
    compliance = fields.Nested(VendorComplianceSchema)
    status_audits = fields.Nested(VendorStatusAuditSchema, many=True)

    class Meta:
        model = Vendor
        load_instance = True
        include_fk = True
        ordered = True


vendor_schema = VendorSchema()
vendors_schema = VendorSchema(many=True)
