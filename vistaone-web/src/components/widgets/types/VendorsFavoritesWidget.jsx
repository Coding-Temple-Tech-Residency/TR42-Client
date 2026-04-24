import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { fetchCurrentUser } from "../../../services/currentUser";
import { vendorService } from "../../../services/vendorService";
import { statusClass } from "../widgetUtils";

export default function VendorsFavoritesWidget() {
    const [state, setState] = useState({
        loading: true,
        error: null,
        items: [],
    });

    useEffect(() => {
        let cancelled = false;
        fetchCurrentUser()
            .then((u) => {
                const clientId = u?.client_id || u?.company_id;
                if (!clientId) {
                    throw new Error("No client linked to this user");
                }
                return vendorService.getFavorites(clientId);
            })
            .then((rows) => {
                if (cancelled) return;
                setState({
                    loading: false,
                    error: null,
                    items: (rows || []).slice(0, 6),
                });
            })
            .catch((err) => {
                if (cancelled) return;
                setState({
                    loading: false,
                    error: err.message || "Failed to load",
                    items: [],
                });
            });
        return () => {
            cancelled = true;
        };
    }, []);

    if (state.loading) return <div className="widget__placeholder">Loading…</div>;
    if (state.error) return <div className="widget__error">{state.error}</div>;
    if (!state.items.length)
        return (
            <div className="widget__empty">
                No favorites yet.{" "}
                <Link to="/vendor-marketplace">Browse vendors →</Link>
            </div>
        );

    return (
        <div className="widget-list">
            <ul className="widget-list__items">
                {state.items.map((v) => (
                    <li key={v.id} className="widget-list__row">
                        <div className="widget-list__primary">
                            <Link
                                to={`/vendors/${v.id}`}
                                className="widget-list__name widget-list__name--link"
                            >
                                {v.company_name || v.name || "Vendor"}
                            </Link>
                            <span className="widget-list__meta">
                                {v.primary_contact_name || v.company_email || ""}
                            </span>
                        </div>
                        <div className="widget-list__secondary">
                            <span
                                className={`status-pill ${statusClass(v.status)}`}
                            >
                                {v.status || "—"}
                            </span>
                        </div>
                    </li>
                ))}
            </ul>
            <Link to="/vendor-favorites" className="widget__footer-link">
                Manage favorites →
            </Link>
        </div>
    );
}
