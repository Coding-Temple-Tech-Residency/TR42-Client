from flask import request, jsonify
from . import services_bp
from app.utils.util import token_required
from app.blueprints.services.services_service import ServicesService


# GET /services/ - return all available service types
# Used by the vendor marketplace and the AddVendor form to populate the service list
@services_bp.get('/')
@token_required
def list_services(user_id):
    result, code = ServicesService.get_all()
    return jsonify(result), code


# POST /services/ - create a new service in the catalog
# Body (JSON): { "service": "New Service Name" }
@services_bp.post('/')
@token_required
def create_service(user_id):
    body = request.get_json()
    if not body:
        return jsonify({'message': 'Request body is required'}), 400

    result, code = ServicesService.create_service(body, user_id)
    return jsonify(result), code
