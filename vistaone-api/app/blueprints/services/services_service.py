from app.models.services import Service
from app.blueprints.repository.services_repository import ServicesRepository
from app.blueprints.schema.services_schema import service_schema, services_schema


class ServicesService:

    @staticmethod
    def get_all():
        """Return the full services catalog sorted alphabetically."""
        records = ServicesRepository.get_all()
        return services_schema.dump(records), 200

    @staticmethod
    def create_service(body, user_id):
        """Create a new service entry. Rejects duplicates by name."""
        name = body.get('service', '').strip()
        if not name:
            return {'message': 'service name is required'}, 400

        # Prevent creating a duplicate service
        if ServicesRepository.get_by_name(name):
            return {'message': f"Service '{name}' already exists"}, 409

        service = Service(
            service=name,
            created_by=str(user_id),
        )

        saved = ServicesRepository.create(service)
        return service_schema.dump(saved), 201
