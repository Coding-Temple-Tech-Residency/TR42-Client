from app.extensions import ma
from marshmallow import fields, validates_schema, ValidationError


class ChangePasswordSchema(ma.Schema):

    old_password = fields.String(required=True)
    new_password = fields.String(required=True)
    confirm_password = fields.String(required=True)

    @validates_schema
    def validate_passwords(self, data, **kwargs):
        if data["new_password"] != data["confirm_password"]:
            raise ValidationError("New password and confirm password do not match")


change_password_schema = ChangePasswordSchema()