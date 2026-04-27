from app.extensions import ma
from app.models.service import Service


class ServiceSchema(ma.SQLAlchemyAutoSchema):
    class Meta:
        model = Service
        fields = ("id", "service")


service_schema = ServiceSchema()
services_schema = ServiceSchema(many=True)
