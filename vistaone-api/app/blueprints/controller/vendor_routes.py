from flask import Blueprint, request, jsonify ,vendors_bp
from app import db
from app.models.vendors import Vendor, VendorCompliance, VendorStatusAudit
from schema import vendor_schema, vendors_schema
from datetime import datetime


@vendors_bp.get("/")
def list_vendors():
    query = Vendor.query

    # --- Filters ---
    status = request.args.get("status")
    service_type = request.args.get("service_type")
    compliance = request.args.get("compliance")  # "compliant" or "non_compliant"

    if status:
        query = query.filter(Vendor.status == status)

    if service_type:
        query = query.filter(service_type == db.any(Vendor.service_types))

    if compliance:
        if compliance == "compliant":
            query = query.join(VendorCompliance).filter(VendorCompliance.is_compliant == True)
        elif compliance == "non_compliant":
            query = query.join(VendorCompliance).filter(VendorCompliance.is_compliant == False)

    # --- Sorting ---
    sort_by = request.args.get("sort_by", "created_at")
    sort_dir = request.args.get("sort_dir", "desc")

    if sort_dir == "desc":
        query = query.order_by(db.desc(getattr(Vendor, sort_by)))
    else:
        query = query.order_by(db.asc(getattr(Vendor, sort_by)))

    # --- Pagination ---
    page = int(request.args.get("page", 1))
    per_page = int(request.args.get("per_page", 20))

    paginated = query.paginate(page=page, per_page=per_page, error_out=False)

    return jsonify({
        "items": vendors_schema.dump(paginated.items),
        "total": paginated.total,
        "page": paginated.page,
        "pages": paginated.pages
    })


@vendors_bp.get("/<uuid:vendor_id>")
def get_vendor(vendor_id):
    vendor = Vendor.query.get_or_404(vendor_id)

    data = vendor_schema.dump(vendor)

    # Add compliance + contact metadata
    data["compliance"] = vendor.compliance.to_dict() if vendor.compliance else None
    data["primary_contact"] = vendor.primary_contact.to_dict() if vendor.primary_contact else None

    return jsonify(data)


#status uodate endpoint#
ALLOWED_TRANSITIONS = {
    "pending": ["approved", "rejected"],
    "approved": ["inactive"],
    "rejected": ["inactive"],
    "inactive": []
}

@vendors_bp.patch("/<uuid:vendor_id>/status")
def update_vendor_status(vendor_id):
    vendor = Vendor.query.get_or_404(vendor_id)
    new_status = request.json.get("status")
    reason = request.json.get("reason")

    if not new_status:
        return jsonify({"error": "status is required"}), 400

    # --- State Machine Enforcement ---
    allowed = ALLOWED_TRANSITIONS.get(vendor.status, [])
    if new_status not in allowed:
        return jsonify({
            "error": f"Invalid transition: {vendor.status} → {new_status}"
        }), 400

    old_status = vendor.status
    vendor.status = new_status
    vendor.updated_at = datetime.utcnow()

    # --- Audit Log ---
    audit = VendorStatusAudit(
        vendor_id=vendor.id,
        old_status=old_status,
        new_status=new_status,
        reason=reason,
        changed_by="admin",  # replace with auth user
        changed_at=datetime.utcnow()
    )
    db.session.add(audit)

    db.session.commit()

    return vendor_schema.jsonify(vendor)

