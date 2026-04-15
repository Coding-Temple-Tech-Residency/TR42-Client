// msaService.js - API calls for MSA / contract uploads
// File uploads use multipart/form-data so we do NOT set Content-Type manually
// (the browser sets it automatically with the correct boundary for FormData)

const BASE = '/api/msa'

const getAuthHeader = (json = true) => {
    const headers = {
        Authorization: `Bearer ${localStorage.getItem('authToken')}`,
    }
    // Only add Content-Type for JSON requests - leave it off for multipart uploads
    if (json) headers['Content-Type'] = 'application/json'
    return headers
}

export const msaService = {

    // GET /api/msa/ - list all MSA records
    // params: { vendor_id, status } - both optional
    getAll: async (params = {}) => {
        const query = new URLSearchParams()
        if (params.vendor_id) query.set('vendor_id', params.vendor_id)
        if (params.status) query.set('status', params.status)

        const url = query.toString() ? `${BASE}/?${query}` : `${BASE}/`
        const res = await fetch(url, { headers: getAuthHeader() })

        if (!res.ok) throw new Error('Failed to load MSA records')
        return res.json()
    },

    // GET /api/msa/<msa_id> - single MSA record
    getById: async (msaId) => {
        const res = await fetch(`${BASE}/${msaId}`, { headers: getAuthHeader() })
        if (res.status === 404) throw new Error('MSA not found')
        if (!res.ok) throw new Error('Failed to load MSA')
        return res.json()
    },

    // POST /api/msa/ - upload a new MSA document
    // formData: FormData object containing vendor_id, version, effective_date, expiration_date, file
    upload: async (formData) => {
        const res = await fetch(`${BASE}/`, {
            method: 'POST',
            // Do NOT pass Content-Type - the browser sets it to multipart/form-data automatically
            headers: getAuthHeader(false),
            body: formData,
        })
        const data = await res.json()
        if (!res.ok) throw new Error(data.message || 'Upload failed')
        return data
    },

    // PATCH /api/msa/<msa_id> - update MSA metadata (status, version, dates)
    update: async (msaId, body) => {
        const res = await fetch(`${BASE}/${msaId}`, {
            method: 'PATCH',
            headers: getAuthHeader(),
            body: JSON.stringify(body),
        })
        const data = await res.json()
        if (!res.ok) throw new Error(data.message || 'Failed to update MSA')
        return data
    },

    // GET /api/msa/<msa_id>/download - download the PDF file
    getDownloadUrl: (msaId) => `${BASE}/${msaId}/download`,
}
