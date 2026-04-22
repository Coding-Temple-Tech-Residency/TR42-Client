from app.extensions import ma
from marshmallow import fields
from app.blueprints.schema.address_schema import AddressSchema


class RegisterClientSchema(ma.Schema):
    client_name = fields.String(required=True)
    client_code = fields.String(required=True)
    primary_contact_name = fields.String(required=True)
    company_email = fields.Email(required=True)
    company_contact_number = fields.String(required=True)
    company_web_address = fields.String(load_default=None)
    address = fields.Nested(AddressSchema, required=True)


register_client_schema = RegisterClientSchema()
