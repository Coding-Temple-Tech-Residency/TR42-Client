import { useState, useRef, useCallback, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, Filter, Upload, FileText, AlertCircle, CheckCircle, X, Shield } from 'lucide-react'
import { msaService } from '../../services/msaService'
import { vendorService } from '../../services/vendorService'
import { allowedFileTypes, maxFileSizeMB } from '../../data/contractData'
import '../../styles/ContractsMSA.css'

const ContractsMSA = () => {
    const navigate = useNavigate()
    const fileInputRef = useRef(null)

    // MSA records and vendor list now loaded from the API
    const [msaContracts, setMsaContracts] = useState([])
    const [vendors, setVendors] = useState([])
    const [loading, setLoading] = useState(true)
    const [loadError, setLoadError] = useState('')

    const [searchTerm, setSearchTerm] = useState('')
    const [statusFilter, setStatusFilter] = useState('all')

    const [showUpload, setShowUpload] = useState(false)
    const [dragOver, setDragOver] = useState(false)
    const [uploadFile, setUploadFile] = useState(null)
    const [uploadError, setUploadError] = useState('')
    const [uploadSuccess, setUploadSuccess] = useState(false)
    const [uploading, setUploading] = useState(false)
    const [uploadForm, setUploadForm] = useState({
        vendor_id: '',
        version: '',
        effective_date: '',
        expiration_date: '',
    })

    // Fetch MSA records and vendor list on mount
    useEffect(() => {
        const loadData = async () => {
            try {
                const [msaData, vendorData] = await Promise.all([
                    msaService.getAll(),
                    vendorService.getAll(),
                ])
                setMsaContracts(msaData)
                setVendors(vendorData)
            } catch (err) {
                setLoadError('Failed to load contract data.')
            } finally {
                setLoading(false)
            }
        }
        loadData()
    }, [])

    const filteredContracts = msaContracts.filter((msa) => {
        const matchesSearch =
            (msa.vendor_name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
            msa.msa_id.toLowerCase().includes(searchTerm.toLowerCase())
        const matchesStatus = statusFilter === 'all' || msa.status === statusFilter
        return matchesSearch && matchesStatus
    })

    const validateFile = (file) => {
        if (!file) return 'No file selected.'
        if (!allowedFileTypes.includes(file.type)) return 'Only PDF files are allowed.'
        if (file.size > maxFileSizeMB * 1024 * 1024) return `File must be under ${maxFileSizeMB}MB.`
        return null
    }

    const handleFileSelect = useCallback((file) => {
        setUploadError('')
        setUploadSuccess(false)
        const error = validateFile(file)
        if (error) {
            setUploadError(error)
            setUploadFile(null)
            return
        }
        setUploadFile(file)
    }, [])

    const handleDragOver = (e) => { e.preventDefault(); e.stopPropagation(); setDragOver(true) }
    const handleDragLeave = (e) => { e.preventDefault(); e.stopPropagation(); setDragOver(false) }
    const handleDrop = (e) => {
        e.preventDefault(); e.stopPropagation(); setDragOver(false)
        handleFileSelect(e.dataTransfer.files[0])
    }
    const handleInputChange = (e) => { handleFileSelect(e.target.files[0]) }
    const handleUploadFormChange = (e) => { setUploadForm({ ...uploadForm, [e.target.name]: e.target.value }) }

    const resetUpload = () => {
        setUploadFile(null)
        setUploadError('')
        setUploadSuccess(false)
        setUploadForm({ vendor_id: '', version: '', effective_date: '', expiration_date: '' })
        if (fileInputRef.current) fileInputRef.current.value = ''
    }

    const handleUploadSubmit = async (e) => {
        e.preventDefault()
        setUploadError('')

        if (!uploadFile) { setUploadError('Please select a PDF file to upload.'); return }
        if (!uploadForm.vendor_id) { setUploadError('Please select a vendor.'); return }
        if (!uploadForm.version) { setUploadError('Please enter a version number.'); return }

        // Build FormData so the file is sent as multipart/form-data to the backend
        const formData = new FormData()
        formData.append('file', uploadFile)
        formData.append('vendor_id', uploadForm.vendor_id)
        formData.append('version', uploadForm.version)
        if (uploadForm.effective_date) formData.append('effective_date', uploadForm.effective_date)
        if (uploadForm.expiration_date) formData.append('expiration_date', uploadForm.expiration_date)

        setUploading(true)
        try {
            const newMsa = await msaService.upload(formData)
            // Add the new record to the list so the table updates without a page reload
            setMsaContracts((prev) => [newMsa, ...prev])
            setUploadSuccess(true)
            resetUpload()
        } catch (err) {
            setUploadError(err.message || 'Upload failed. Please try again.')
        } finally {
            setUploading(false)
        }
    }

    if (loading) {
        return (
            <div className="contracts-msa">
                <p className="contracts-results-count">Loading contracts...</p>
            </div>
        )
    }

    return (
        <div className="contracts-msa">
            <div className="contracts-header d-flex justify-content-between align-items-start mb-4">
                <div>
                    <h1 className="contracts-title fw-bold mb-1">Contracts / MSA</h1>
                    <p className="contracts-subtitle mb-0">
                        Manage master service agreements, upload documents, and track compliance
                    </p>
                </div>
                <button
                    className="contracts-upload-btn d-inline-flex align-items-center gap-2"
                    onClick={() => { setShowUpload(!showUpload); resetUpload() }}
                >
                    <Upload size={16} />
                    {showUpload ? 'Close' : 'Upload MSA'}
                </button>
            </div>

            {loadError && <div className="contracts-error d-flex align-items-center gap-2 mb-3"><AlertCircle size={16} /><span>{loadError}</span></div>}

            {showUpload && (
                <div className="contracts-upload-panel mb-4">
                    <h3 className="contracts-section-title">Upload MSA Document</h3>
                    <p className="contracts-upload-note mb-3">
                        PDF files only, max {maxFileSizeMB}MB. Files are sent securely to the server.
                    </p>

                    {uploadSuccess && (
                        <div className="contracts-success d-flex align-items-center gap-2 mb-3">
                            <CheckCircle size={16} />
                            <span>MSA uploaded successfully. It will be reviewed and processed.</span>
                        </div>
                    )}

                    <form onSubmit={handleUploadSubmit}>
                        <div
                            className={`contracts-dropzone d-flex flex-column align-items-center justify-content-center ${dragOver ? 'drag-over' : ''} ${uploadFile ? 'has-file' : ''}`}
                            onDragOver={handleDragOver}
                            onDragLeave={handleDragLeave}
                            onDrop={handleDrop}
                            onClick={() => fileInputRef.current?.click()}
                        >
                            <input ref={fileInputRef} type="file" accept=".pdf" onChange={handleInputChange} className="d-none" />
                            {uploadFile ? (
                                <div className="d-flex align-items-center gap-2">
                                    <FileText size={20} className="contracts-file-icon" />
                                    <div>
                                        <p className="contracts-file-name fw-semibold mb-0">{uploadFile.name}</p>
                                        <p className="contracts-file-size mb-0">{(uploadFile.size / 1024 / 1024).toFixed(2)} MB</p>
                                    </div>
                                    <button type="button" className="contracts-file-remove" onClick={(e) => { e.stopPropagation(); setUploadFile(null); if (fileInputRef.current) fileInputRef.current.value = '' }}>
                                        <X size={16} />
                                    </button>
                                </div>
                            ) : (
                                <>
                                    <Upload size={24} className="contracts-dropzone-icon mb-2" />
                                    <p className="contracts-dropzone-text mb-1">Drag and drop your PDF here</p>
                                    <p className="contracts-dropzone-hint mb-0">or click to browse</p>
                                </>
                            )}
                        </div>

                        <div className="row g-3 mt-3 mb-3">
                            <div className="col-md-3">
                                <label className="form-label contracts-label">Vendor *</label>
                                <select name="vendor_id" className="form-select contracts-input" value={uploadForm.vendor_id} onChange={handleUploadFormChange}>
                                    <option value="">Select vendor</option>
                                    {vendors.map((v) => (
                                        <option key={v.vendor_id} value={v.vendor_id}>{v.company_name}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="col-md-3">
                                <label className="form-label contracts-label">Version *</label>
                                <input type="text" name="version" className="form-control contracts-input" placeholder="e.g. 1.0" maxLength={10} value={uploadForm.version} onChange={handleUploadFormChange} />
                            </div>
                            <div className="col-md-3">
                                <label className="form-label contracts-label">Effective Date</label>
                                <input type="date" name="effective_date" className="form-control contracts-input" value={uploadForm.effective_date} onChange={handleUploadFormChange} />
                            </div>
                            <div className="col-md-3">
                                <label className="form-label contracts-label">Expiration Date</label>
                                <input type="date" name="expiration_date" className="form-control contracts-input" value={uploadForm.expiration_date} onChange={handleUploadFormChange} />
                            </div>
                        </div>

                        {uploadError && (
                            <div className="contracts-error d-flex align-items-center gap-2 mb-3">
                                <AlertCircle size={16} /><span>{uploadError}</span>
                            </div>
                        )}

                        <div className="d-flex gap-3">
                            <button type="button" className="contracts-btn-secondary" onClick={() => { setShowUpload(false); resetUpload() }}>Cancel</button>
                            <button type="submit" className="contracts-btn-primary" disabled={uploading}>
                                {uploading ? 'Uploading...' : 'Upload document'}
                            </button>
                        </div>
                    </form>
                </div>
            )}

            <div className="contracts-filters d-flex flex-wrap gap-3 mb-4">
                <div className="contracts-search d-flex align-items-center gap-2">
                    <Search size={14} className="contracts-search-icon" />
                    <input type="text" className="contracts-search-input" placeholder="Search by vendor or MSA ID..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                </div>
                <div className="d-flex align-items-center gap-2">
                    <Filter size={14} className="contracts-filter-icon" />
                    <select className="contracts-select" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                        <option value="all">All statuses</option>
                        <option value="active">Active</option>
                        <option value="incomplete">Incomplete</option>
                        <option value="expired">Expired</option>
                    </select>
                </div>
            </div>

            <p className="contracts-results-count mb-3">
                {filteredContracts.length} contract{filteredContracts.length !== 1 ? 's' : ''} found
            </p>

            <div className="contracts-table-card">
                <table className="contracts-table w-100">
                    <thead>
                        <tr>
                            <th>MSA ID</th><th>Vendor</th><th>Version</th><th>Status</th>
                            <th>Effective</th><th>Expiration</th><th>Document</th><th>Uploaded By</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredContracts.map((msa) => {
                            const isExpired = msa.expiration_date && new Date(msa.expiration_date) < new Date()
                            return (
                                <tr key={msa.msa_id} className="contracts-table-row">
                                    <td><span className="contracts-cell-id fw-semibold">{msa.msa_id}</span></td>
                                    <td>
                                        <button className="contracts-vendor-link" onClick={() => navigate(`/vendors/${msa.vendor_id}`)}>
                                            {msa.vendor_name}
                                        </button>
                                    </td>
                                    <td>v{msa.version}</td>
                                    <td>
                                        <span className={`contracts-badge ${
                                            msa.status === 'active' ? 'contracts-badge-active'
                                            : msa.status === 'expired' ? 'contracts-badge-expired'
                                            : 'contracts-badge-incomplete'
                                        }`}>{msa.status}</span>
                                    </td>
                                    <td>{msa.effective_date}</td>
                                    <td className={isExpired ? 'contracts-text-danger' : ''}>
                                        {msa.expiration_date}{isExpired && ' (Expired)'}
                                    </td>
                                    <td>
                                        {msa.file_name ? (
                                            <a
                                                href={msaService.getDownloadUrl(msa.msa_id)}
                                                className="d-flex align-items-center gap-1 contracts-file-link"
                                                target="_blank"
                                                rel="noreferrer"
                                            >
                                                <FileText size={14} className="contracts-file-icon" />
                                                {msa.file_name.split('_').slice(1).join('_') || msa.file_name}
                                            </a>
                                        ) : (
                                            <span className="contracts-no-file">No document</span>
                                        )}
                                    </td>
                                    {/* uploaded_by_name is the resolved full name from the users table */}
                                    <td>{msa.uploaded_by_name || 'N/A'}</td>
                                </tr>
                            )
                        })}
                    </tbody>
                </table>

                {filteredContracts.length === 0 && (
                    <div className="contracts-empty text-center py-5">
                        <p className="mb-1 fw-semibold">No contracts match your filters</p>
                        <p className="contracts-sub mb-0">Try adjusting your search or filter criteria</p>
                    </div>
                )}
            </div>
        </div>
    )
}

export default ContractsMSA
