// vendorService.js - all API calls for the vendor resource
// The Vite proxy maps /api/* to Flask at http://127.0.0.1:5000 and strips the /api prefix
// so /api/vendors/ hits Flask's GET /vendors/

const BASE = '/api/vendors'

// Pull the auth token from localStorage (set by authServices.js on login)
const getAuthHeader = () => ({
    'Content-Type': 'application/json',
    Authorization: `Bearer ${localStorage.getItem('authToken')}`,
})

export const vendorService = {

    // GET /api/vendors/ - returns all vendors
    // params: { status, compliance, service_id } - all optional filters
    getAll: async (params = {}) => {
        const query = new URLSearchParams()
        if (params.status) query.set('status', params.status)
        if (params.compliance) query.set('compliance', params.compliance)
        if (params.service_id) query.set('service_id', params.service_id)

        const url = query.toString() ? `${BASE}/?${query}` : `${BASE}/`
        const res = await fetch(url, { headers: getAuthHeader() })

        if (!res.ok) throw new Error('Failed to load vendors')
        return res.json()
    },

    // GET /api/vendors/<vendor_id> - returns a single vendor with services, MSAs, etc.
    getById: async (vendorId) => {
        const res = await fetch(`${BASE}/${vendorId}`, { headers: getAuthHeader() })
        if (res.status === 404) throw new Error('Vendor not found')
        if (!res.ok) throw new Error('Failed to load vendor')
        return res.json()
    },

    // POST /api/vendors/ - create a new vendor
    // body: { company_name, primary_contact_name, company_email, company_phone, service_ids[] }
    create: async (body) => {
        const res = await fetch(`${BASE}/`, {
            method: 'POST',
            headers: getAuthHeader(),
            body: JSON.stringify(body),
        })
        const data = await res.json()
        if (!res.ok) throw new Error(data.message || 'Failed to create vendor')
        return data
    },

    // PATCH /api/vendors/<vendor_id> - partial update (only fields in body are changed)
    update: async (vendorId, body) => {
        const res = await fetch(`${BASE}/${vendorId}`, {
            method: 'PATCH',
            headers: getAuthHeader(),
            body: JSON.stringify(body),
        })
        const data = await res.json()
        if (!res.ok) throw new Error(data.message || 'Failed to update vendor')
        return data
    },

    // POST /api/vendors/<vendor_id>/services - link a service to a vendor
    addService: async (vendorId, serviceId) => {
        const res = await fetch(`${BASE}/${vendorId}/services`, {
            method: 'POST',
            headers: getAuthHeader(),
            body: JSON.stringify({ service_id: serviceId }),
        })
        if (!res.ok) throw new Error('Failed to add service')
        return res.json()
    },

    // DELETE /api/vendors/<vendor_id>/services/<service_id> - remove a service from a vendor
    removeService: async (vendorId, serviceId) => {
        const res = await fetch(`${BASE}/${vendorId}/services/${serviceId}`, {
            method: 'DELETE',
            headers: getAuthHeader(),
        })
        if (!res.ok) throw new Error('Failed to remove service')
        return res.json()
    },
}
