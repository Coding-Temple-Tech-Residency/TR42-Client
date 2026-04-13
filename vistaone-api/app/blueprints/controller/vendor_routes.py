from flask import Blueprint, request
from app.blueprints.services.vendor_service import VendorService, InvalidStatusTransition
from app.schemas.vendorSchema import vendor_list_schema, vendor_detail_schema

vendor_bp = Blueprint("vendors", __name__)


@vendor_bp.route("/vendors", methods=["GET"])
def list_vendors():
    filters = {
        "search": request.args.get("search"),
        "status": request.args.get("status", "all"),
        "service_id": request.args.get("service_id", "all"),
        "msa_status": request.args.get("msa_status", "all"),
        "page": request.args.get("page", 1),
        "per_page": request.args.get("per_page", 25),
        "sort": request.args.get("sort", "vendor_name:asc"),
    }

    pagination = VendorService.list_vendors(filters)
    items = vendor_list_schema.dump(pagination.items)

    return {
        "items": items,
        "page": pagination.page,
        "per_page": pagination.per_page,
        "total": pagination.total,
        "pages": pagination.pages,
    }, 200


@vendor_bp.route("/vendors/<uuid:vendor_id>", methods=["GET"])
def get_vendor_detail(vendor_id):
    try:
        vendor = VendorService.get_vendor_detail(vendor_id)
        return vendor_detail_schema.dump(vendor), 200
    except ValueError:
        return {"error": "Vendor not found"}, 404


@vendor_bp.route("/vendors", methods=["POST"])
def create_vendor():
    data = request.get_json() or {}

    required = ["vendor_name", "primary_contact_name", "contact_email", "services"]
    missing = [f for f in required if not data.get(f)]
    if missing:
        return {"error": f"Missing required fields: {', '.join(missing)}"}, 400

    vendor = VendorService.create_vendor(data)
    return vendor_detail_schema.dump(vendor), 201


@vendor_bp.route("/vendors/<uuid:vendor_id>/status", methods=["PUT"])
def update_vendor_status(vendor_id):
    data = request.get_json() or {}
    new_status = data.get("status")

    if not new_status:
        return {"error": "Missing 'status' in request body"}, 400

    try:
        vendor = VendorService.update_status(vendor_id, new_status)
        return vendor_detail_schema.dump(vendor), 200

    except InvalidStatusTransition as e:
        return {"error": str(e)}, 400

    except ValueError:
        return {"error": "Vendor not found"}, 404
