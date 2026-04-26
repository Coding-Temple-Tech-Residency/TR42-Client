import { useState, useEffect } from 'react';
import { CheckCircle, XCircle, Edit2, Save, X, ArrowRightLeft } from 'lucide-react';
import { authService } from '../services/authServices';
import AppShell from '../components/AppShell';
import { useAuthContext } from '../context/AuthContext';

const STATUS_BADGE = {
    active: 'bg-success-subtle text-success',
    pending_approval: 'bg-warning-subtle text-warning',
    pending_email_verification: 'bg-info-subtle text-info',
    rejected: 'bg-danger-subtle text-danger',
    inactive: 'bg-secondary-subtle text-secondary',
};

export default function UserManagement() {
    const { isMaster, user: currentUser } = useAuthContext();
    const [users, setUsers] = useState([]);
    const [availableRoles, setAvailableRoles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const [editingId, setEditingId] = useState(null);
    const [editForm, setEditForm] = useState({});

    const [roleEditId, setRoleEditId] = useState(null);
    const [selectedRoles, setSelectedRoles] = useState([]);

    const [transferTarget, setTransferTarget] = useState('');
    const [showTransfer, setShowTransfer] = useState(false);
    const [transferring, setTransferring] = useState(false);

    const reload = () => {
        setLoading(true);
        Promise.all([authService.getUsers(), authService.getRoles()])
            .then(([userList, roleList]) => {
                setUsers(userList);
                setAvailableRoles(roleList);
            })
            .catch((e) => setError(e.message))
            .finally(() => setLoading(false));
    };

    useEffect(reload, []);

    const handleApprove = async (userId) => {
        setError('');
        try {
            await authService.approveUser(userId);
            setUsers((prev) => prev.map((u) => u.id === userId ? { ...u, status: 'active' } : u));
        } catch (e) {
            setError(e.message);
        }
    };

    const handleReject = async (userId) => {
        setError('');
        try {
            await authService.rejectUser(userId);
            setUsers((prev) => prev.map((u) => u.id === userId ? { ...u, status: 'rejected' } : u));
        } catch (e) {
            setError(e.message);
        }
    };

    const startEdit = (user) => {
        setEditingId(user.id);
        setEditForm({ first_name: user.first_name, last_name: user.last_name, contact_number: user.contact_number });
    };

    const saveEdit = async (userId) => {
        setError('');
        try {
            const result = await authService.updateUser(userId, editForm);
            setUsers((prev) => prev.map((u) => u.id === userId ? { ...u, ...result.user } : u));
            setEditingId(null);
        } catch (e) {
            setError(e.message);
        }
    };

    const startRoleEdit = (user) => {
        setRoleEditId(user.id);
        setSelectedRoles([...user.roles]);
    };

    const saveRoles = async (userId) => {
        setError('');
        try {
            await authService.setUserRoles(userId, selectedRoles);
            setUsers((prev) => prev.map((u) => u.id === userId ? { ...u, roles: [...selectedRoles] } : u));
            setRoleEditId(null);
        } catch (e) {
            setError(e.message);
        }
    };

    const toggleRole = (roleName) => {
        setSelectedRoles((prev) =>
            prev.includes(roleName) ? prev.filter((r) => r !== roleName) : [...prev, roleName]
        );
    };

    const handleTransfer = async () => {
        if (!transferTarget) return;
        setTransferring(true);
        setError('');
        try {
            await authService.transferMaster(transferTarget);
            setShowTransfer(false);
            reload();
        } catch (e) {
            setError(e.message);
        } finally {
            setTransferring(false);
        }
    };

    // Roles a given user is allowed to see/assign in the role picker
    const assignableRoles = (targetUser) => {
        return availableRoles.filter((r) => {
            if (r.name === 'MASTER') return false; // never assignable via this UI
            return true;
        });
    };

    const nonMasterUsers = users.filter((u) => !u.roles.includes('MASTER'));

    return (
        <AppShell title="User Management" subtitle="Approve, reject, and manage company users." loading={loading}>
            {error && <div className="alert alert-danger mb-3">{error}</div>}

            {isMaster && (
                <div className="mb-3 d-flex justify-content-end">
                    <button
                        className="btn btn-sm btn-outline-warning d-inline-flex align-items-center gap-1"
                        onClick={() => { setShowTransfer(!showTransfer); setError(''); }}
                    >
                        <ArrowRightLeft size={14} />
                        Transfer MASTER Role
                    </button>
                </div>
            )}

            {showTransfer && isMaster && (
                <div className="card shadow-sm mb-3 border-warning">
                    <div className="card-body">
                        <h6 className="card-title">Transfer MASTER Role</h6>
                        <p className="small text-muted mb-2">
                            You will become an Admin after the transfer. This cannot be undone without the new Master's help.
                        </p>
                        <div className="d-flex gap-2 flex-wrap">
                            <select
                                className="form-select form-select-sm"
                                style={{ maxWidth: 280 }}
                                value={transferTarget}
                                onChange={(e) => setTransferTarget(e.target.value)}
                            >
                                <option value="">— Select user —</option>
                                {nonMasterUsers.filter((u) => u.status === 'active').map((u) => (
                                    <option key={u.id} value={u.id}>
                                        {u.first_name} {u.last_name} ({u.email})
                                    </option>
                                ))}
                            </select>
                            <button
                                className="btn btn-sm btn-warning"
                                onClick={handleTransfer}
                                disabled={!transferTarget || transferring}
                            >
                                {transferring ? 'Transferring…' : 'Transfer'}
                            </button>
                            <button className="btn btn-sm btn-outline-secondary" onClick={() => setShowTransfer(false)}>
                                <X size={13} />
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <div className="card shadow-sm">
                <div className="card-body p-0">
                    <div className="table-responsive">
                        <table className="table table-hover mb-0">
                            <thead>
                                <tr>
                                    <th className="px-3 py-3">Name</th>
                                    <th className="px-3 py-3">Email</th>
                                    <th className="px-3 py-3">Status</th>
                                    <th className="px-3 py-3">Roles</th>
                                    <th className="px-3 py-3">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {users.length === 0 && !loading && (
                                    <tr>
                                        <td colSpan={5} className="text-center text-muted py-4">No users found.</td>
                                    </tr>
                                )}
                                {users.map((user) => (
                                    <tr key={user.id}>
                                        <td className="px-3 py-3 align-middle">
                                            {editingId === user.id ? (
                                                <div className="d-flex gap-1">
                                                    <input
                                                        className="form-control form-control-sm"
                                                        value={editForm.first_name}
                                                        onChange={(e) => setEditForm((f) => ({ ...f, first_name: e.target.value }))}
                                                        placeholder="First"
                                                    />
                                                    <input
                                                        className="form-control form-control-sm"
                                                        value={editForm.last_name}
                                                        onChange={(e) => setEditForm((f) => ({ ...f, last_name: e.target.value }))}
                                                        placeholder="Last"
                                                    />
                                                </div>
                                            ) : (
                                                <span className="fw-medium">{user.first_name} {user.last_name}</span>
                                            )}
                                        </td>
                                        <td className="px-3 py-3 align-middle text-muted small">{user.email}</td>
                                        <td className="px-3 py-3 align-middle">
                                            <span className={`badge px-2 py-1 ${STATUS_BADGE[user.status] || 'bg-secondary-subtle text-secondary'}`}>
                                                {user.status.replace(/_/g, ' ')}
                                            </span>
                                        </td>
                                        <td className="px-3 py-3 align-middle">
                                            {roleEditId === user.id ? (
                                                <div className="d-flex flex-wrap gap-1">
                                                    {assignableRoles(user).map((r) => (
                                                        <div key={r.id} className="form-check form-check-inline me-0">
                                                            <input
                                                                className="form-check-input"
                                                                type="checkbox"
                                                                id={`role-${user.id}-${r.id}`}
                                                                checked={selectedRoles.includes(r.name)}
                                                                onChange={() => toggleRole(r.name)}
                                                            />
                                                            <label className="form-check-label small" htmlFor={`role-${user.id}-${r.id}`}>
                                                                {r.name}
                                                            </label>
                                                        </div>
                                                    ))}
                                                </div>
                                            ) : (
                                                <div className="d-flex flex-wrap gap-1">
                                                    {user.roles.length === 0 && <span className="text-muted small">No roles</span>}
                                                    {user.roles.map((r) => (
                                                        <span key={r} className={`badge px-2 py-1 ${r === 'MASTER' ? 'bg-danger-subtle text-danger' : 'bg-primary-subtle text-primary'}`}>
                                                            {r}
                                                        </span>
                                                    ))}
                                                </div>
                                            )}
                                        </td>
                                        <td className="px-3 py-3 align-middle">
                                            <div className="d-flex gap-1 flex-wrap">
                                                {user.status === 'pending_approval' && (
                                                    <>
                                                        <button className="btn btn-sm btn-success d-inline-flex align-items-center gap-1" onClick={() => handleApprove(user.id)}>
                                                            <CheckCircle size={13} /> Approve
                                                        </button>
                                                        <button className="btn btn-sm btn-outline-danger d-inline-flex align-items-center gap-1" onClick={() => handleReject(user.id)}>
                                                            <XCircle size={13} /> Reject
                                                        </button>
                                                    </>
                                                )}
                                                {editingId === user.id ? (
                                                    <>
                                                        <button className="btn btn-sm btn-primary d-inline-flex align-items-center gap-1" onClick={() => saveEdit(user.id)}>
                                                            <Save size={13} /> Save
                                                        </button>
                                                        <button className="btn btn-sm btn-outline-secondary" onClick={() => setEditingId(null)}>
                                                            <X size={13} />
                                                        </button>
                                                    </>
                                                ) : (
                                                    <button className="btn btn-sm btn-outline-secondary d-inline-flex align-items-center gap-1" onClick={() => startEdit(user)}>
                                                        <Edit2 size={13} /> Edit
                                                    </button>
                                                )}
                                                {!user.roles.includes('MASTER') && (
                                                    roleEditId === user.id ? (
                                                        <>
                                                            <button className="btn btn-sm btn-primary d-inline-flex align-items-center gap-1" onClick={() => saveRoles(user.id)}>
                                                                <Save size={13} /> Roles
                                                            </button>
                                                            <button className="btn btn-sm btn-outline-secondary" onClick={() => setRoleEditId(null)}>
                                                                <X size={13} />
                                                            </button>
                                                        </>
                                                    ) : (
                                                        <button className="btn btn-sm btn-outline-primary d-inline-flex align-items-center gap-1" onClick={() => startRoleEdit(user)}>
                                                            Roles
                                                        </button>
                                                    )
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </AppShell>
    );
}
