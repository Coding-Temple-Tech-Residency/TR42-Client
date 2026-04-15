// servicesService.js - API calls for the services catalog
// Used by the vendor marketplace chips and the AddVendor form

const BASE = '/api/services'

const getAuthHeader = () => ({
    'Content-Type': 'application/json',
    Authorization: `Bearer ${localStorage.getItem('authToken')}`,
})

export const servicesService = {

    // GET /api/services/ - return all service types in alphabetical order
    getAll: async () => {
        const res = await fetch(`${BASE}/`, { headers: getAuthHeader() })
        if (!res.ok) throw new Error('Failed to load services')
        return res.json()
    },

    // POST /api/services/ - create a new service in the catalog
    // body: { service: "Service Name" }
    create: async (name) => {
        const res = await fetch(`${BASE}/`, {
            method: 'POST',
            headers: getAuthHeader(),
            body: JSON.stringify({ service: name }),
        })
        const data = await res.json()
        if (!res.ok) throw new Error(data.message || 'Failed to create service')
        return data
    },
}
