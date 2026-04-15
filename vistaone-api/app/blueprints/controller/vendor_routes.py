from flask import request, jsonify
from . import vendors_bp
from app.utils.util import token_required
from app.blueprints.services.vendor_service import VendorService as VendorSvc
from app.blueprints.repository.vendor_repository import VendorRepository
from app.models.vendor_services import VendorService as VendorServiceModel


# GET /vendors/ - returns vendor list
# Optional query params: status=active|inactive, compliance=complete|incomplete|expired, service_id=<id>
# Requires a valid Bearer token (all vendor data is private to authenticated operators)
@vendors_bp.get('/')
@token_required
def list_vendors(user_id):
    status = request.args.get('status')
    compliance = request.args.get('compliance')
    service_id = request.args.get('service_id')

    result, code = VendorSvc.get_all_vendors(
        status=status, compliance=compliance, service_id=service_id
    )
    return jsonify(result), code


# GET /vendors/<vendor_id> - returns a single vendor with services, MSAs, and compliance info
@vendors_bp.get('/<string:vendor_id>')
@token_required
def get_vendor(user_id, vendor_id):
    result, code = VendorSvc.get_vendor_by_id(vendor_id)
    return jsonify(result), code


# POST /vendors/ - create a new vendor
# Body (JSON): company_name, primary_contact_name, company_email, company_phone, (optional) service_ids[]
@vendors_bp.post('/')
@token_required
def create_vendor(user_id):
    body = request.get_json()
    if not body:
        return jsonify({'message': 'Request body is required'}), 400

    result, code = VendorSvc.create_vendor(body, user_id)
    return jsonify(result), code


# PATCH /vendors/<vendor_id> - update vendor fields
# Only fields present in the body are updated (partial update)
@vendors_bp.patch('/<string:vendor_id>')
@token_required
def update_vendor(user_id, vendor_id):
    body = request.get_json()
    if not body:
        return jsonify({'message': 'Request body is required'}), 400

    result, code = VendorSvc.update_vendor(vendor_id, body, user_id)
    return jsonify(result), code


# POST /vendors/<vendor_id>/services - link an existing service to a vendor
# Body (JSON): { "service_id": "<id>" }
@vendors_bp.post('/<string:vendor_id>/services')
@token_required
def add_vendor_service(user_id, vendor_id):
    body = request.get_json()
    service_id = body.get('service_id') if body else None

    if not service_id:
        return jsonify({'message': 'service_id is required'}), 400

    link = VendorServiceModel(
        vendor_id=vendor_id,
        service_id=service_id,
        created_by=str(user_id)
    )
    VendorRepository.add_service_to_vendor(link)
    return jsonify({'message': 'Service added to vendor'}), 201


# DELETE /vendors/<vendor_id>/services/<service_id> - remove a service from a vendor
@vendors_bp.delete('/<string:vendor_id>/services/<string:service_id>')
@token_required
def remove_vendor_service(user_id, vendor_id, service_id):
    removed = VendorRepository.remove_service_from_vendor(vendor_id, service_id)
    if not removed:
        return jsonify({'message': 'Service link not found'}), 404

    return jsonify({'message': 'Service removed from vendor'}), 200
