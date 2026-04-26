import { useState, useEffect } from 'react';
import { Save, X, Globe } from 'lucide-react';
import { authService } from '../services/authServices';
import AppShell from '../components/AppShell';

export default function Settings() {
    const [domain, setDomain] = useState('');
    const [inputDomain, setInputDomain] = useState('');
    const [editing, setEditing] = useState(false);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    useEffect(() => {
        authService.getClientSettings()
            .then((data) => {
                setDomain(data.approved_domain || '');
                setInputDomain(data.approved_domain || '');
            })
            .catch((e) => setError(e.message))
            .finally(() => setLoading(false));
    }, []);

    const handleSave = async () => {
        setSaving(true);
        setError('');
        setSuccess('');
        try {
            const data = await authService.updateClientSettings({
                approved_domain: inputDomain.trim().toLowerCase() || null,
            });
            setDomain(data.approved_domain || '');
            setInputDomain(data.approved_domain || '');
            setEditing(false);
            setSuccess('Settings saved.');
        } catch (e) {
            setError(e.message);
        } finally {
            setSaving(false);
        }
    };

    const handleCancel = () => {
        setInputDomain(domain);
        setEditing(false);
        setError('');
    };

    return (
        <AppShell title="Company Settings" subtitle="Configure company-level settings." loading={loading}>
            <div className="row g-4">
                <div className="col-12 col-lg-6">
                    <div className="card shadow-sm">
                        <div className="card-body">
                            <h5 className="card-title d-flex align-items-center gap-2 mb-3">
                                <Globe size={18} />
                                Approved Email Domain
                            </h5>

                            {success && (
                                <div className="alert alert-success py-2 mb-3">{success}</div>
                            )}
                            {error && (
                                <div className="alert alert-danger py-2 mb-3">{error}</div>
                            )}

                            {editing ? (
                                <div className="d-flex flex-column gap-2">
                                    <input
                                        type="text"
                                        className="form-control"
                                        placeholder="e.g. company.com  (leave empty to clear)"
                                        value={inputDomain}
                                        onChange={(e) => setInputDomain(e.target.value)}
                                        disabled={saving}
                                    />
                                    <div className="d-flex gap-2">
                                        <button
                                            className="btn btn-primary d-inline-flex align-items-center gap-1"
                                            onClick={handleSave}
                                            disabled={saving}
                                        >
                                            <Save size={14} />
                                            {saving ? 'Saving…' : 'Save'}
                                        </button>
                                        <button
                                            className="btn btn-outline-secondary d-inline-flex align-items-center gap-1"
                                            onClick={handleCancel}
                                            disabled={saving}
                                        >
                                            <X size={14} />
                                            Cancel
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <div className="d-flex align-items-center justify-content-between">
                                    <div>
                                        {domain ? (
                                            <span className="badge bg-secondary-subtle text-secondary px-3 py-2 fs-6">
                                                @{domain}
                                            </span>
                                        ) : (
                                            <span className="text-muted fst-italic">No approved domain set</span>
                                        )}
                                    </div>
                                    <button
                                        className="btn btn-sm btn-outline-secondary"
                                        onClick={() => { setEditing(true); setSuccess(''); }}
                                    >
                                        {domain ? 'Change' : 'Set domain'}
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                <div className="col-12 col-lg-6">
                    <div className="card shadow-sm border-info">
                        <div className="card-body">
                            <h6 className="fw-semibold mb-2">How domain approval works</h6>
                            <ul className="small text-muted mb-0 ps-3">
                                <li>When a user registers and verifies their email, their domain is checked.</li>
                                <li>If their email domain matches the approved domain set here, their account is <strong>automatically activated</strong>.</li>
                                <li>If their domain does not match, or no domain is set, the account enters <em>Pending Approval</em> and a Master or Admin must manually approve it.</li>
                                <li>Only one domain is supported per company. Leave empty to require all registrations to be manually approved.</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </AppShell>
    );
}
