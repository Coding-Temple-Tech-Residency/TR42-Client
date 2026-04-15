from app.models.vendor import Vendor, VendorStatus, ComplianceStatus
# Import the junction model under an alias to avoid name collision with this service class
from app.models.vendor_services import VendorService as VendorServiceModel
from app.blueprints.repository.vendor_repository import VendorRepository
from app.blueprints.schema.vendor_schema import vendor_schema, vendors_schema


class VendorService:

    @staticmethod
    def get_all_vendors(status=None, compliance=None, service_id=None):
        """Return a list of vendors serialized with their services and MSA summary."""
        vendors = VendorRepository.get_all(status=status, compliance=compliance, service_id=service_id)

        results = []
        for v in vendors:
            data = vendor_schema.dump(v)
            # Attach the vendor's services list to the serialized output
            data['services'] = VendorRepository.get_vendor_services(v.vendor_id)
            # Attach a lightweight MSA list (just the fields the marketplace cards show)
            data['msas'] = [
                {
                    'msa_id': m.msa_id,
                    'version': m.version,
                    'status': m.status,
                    'effective_date': str(m.effective_date) if m.effective_date else None,
                    'expiration_date': str(m.expiration_date) if m.expiration_date else None,
                }
                for m in v.msas
            ]
            results.append(data)

        return results, 200

    @staticmethod
    def get_vendor_by_id(vendor_id):
        """Return full vendor detail including services, MSAs, and placeholder compliance data."""
        vendor = VendorRepository.get_by_id(vendor_id)
        if not vendor:
            return {'message': 'Vendor not found'}, 404

        data = vendor_schema.dump(vendor)
        data['services'] = VendorRepository.get_vendor_services(vendor.vendor_id)
        data['msas'] = [
            {
                'msa_id': m.msa_id,
                'version': m.version,
                'status': m.status,
                'effective_date': str(m.effective_date) if m.effective_date else None,
                'expiration_date': str(m.expiration_date) if m.expiration_date else None,
            }
            for m in vendor.msas
        ]
        # insurance_policies and licenses come from the contractors table (not built yet)
        # Returning empty arrays so the frontend detail page renders without errors
        data['insurance_policies'] = []
        data['licenses'] = []

        return data, 200

    @staticmethod
    def create_vendor(body, user_id):
        """Validate and create a new vendor. New vendors start as inactive / onboarding."""
        company_name = body.get('company_name', '').strip()
        if not company_name:
            return {'message': 'company_name is required'}, 400

        contact_name = body.get('primary_contact_name', '').strip()
        if not contact_name:
            return {'message': 'primary_contact_name is required'}, 400

        company_email = body.get('company_email', '').strip()
        if not company_email:
            return {'message': 'company_email is required'}, 400

        company_phone = body.get('company_phone', '').strip()
        if not company_phone:
            return {'message': 'company_phone is required'}, 400

        # Check uniqueness before inserting (company_name has a unique constraint in the DB too)
        existing = VendorRepository.get_all()
        names = [v.company_name.lower() for v in existing]
        if company_name.lower() in names:
            return {'message': 'A vendor with this company name already exists'}, 409

        vendor = Vendor(
            company_name=company_name,
            company_code=body.get('company_code'),
            primary_contact_name=contact_name,
            company_email=company_email,
            company_phone=company_phone,
            description=body.get('description'),
            vendor_code=body.get('vendor_code'),
            # New vendors are inactive until reviewed - this matches the AddVendor form behavior
            status=VendorStatus.INACTIVE,
            onboarding=True,
            compliance_status=ComplianceStatus.INCOMPLETE,
            created_by=str(user_id),
        )

        saved = VendorRepository.create(vendor)

        # If service_ids were passed, link them through vendor_services
        service_ids = body.get('service_ids', [])
        for sid in service_ids:
            link = VendorServiceModel(
                vendor_id=saved.vendor_id,
                service_id=sid,
                created_by=str(user_id)
            )
            VendorRepository.add_service_to_vendor(link)

        result = vendor_schema.dump(saved)
        result['services'] = VendorRepository.get_vendor_services(saved.vendor_id)
        return result, 201

    @staticmethod
    def update_vendor(vendor_id, body, user_id):
        """Update allowed vendor fields. Returns updated vendor or an error dict."""
        vendor = VendorRepository.get_by_id(vendor_id)
        if not vendor:
            return {'message': 'Vendor not found'}, 404

        # Only update fields that are present in the request body
        updatable = [
            'company_name', 'company_code', 'primary_contact_name',
            'company_email', 'company_phone', 'description', 'vendor_code',
            'onboarding', 'address_id', 'start_date', 'end_date'
        ]
        for field in updatable:
            if field in body:
                setattr(vendor, field, body[field])

        # status and compliance_status use enum types - validate them before setting
        if 'status' in body:
            try:
                vendor.status = VendorStatus(body['status'])
            except ValueError:
                return {'message': f"Invalid status value: {body['status']}"}, 400

        if 'compliance_status' in body:
            try:
                vendor.compliance_status = ComplianceStatus(body['compliance_status'])
            except ValueError:
                return {'message': f"Invalid compliance_status: {body['compliance_status']}"}, 400

        vendor.updated_by = str(user_id)

        saved = VendorRepository.update(vendor)
        result = vendor_schema.dump(saved)
        result['services'] = VendorRepository.get_vendor_services(saved.vendor_id)
        return result, 200
