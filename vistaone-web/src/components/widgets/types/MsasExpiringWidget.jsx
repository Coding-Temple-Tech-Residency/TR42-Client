import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { msaService } from "../../../services/msaService";
import { daysUntil, formatDate } from "../widgetUtils";

const WINDOW_DAYS = 90;

export default function MsasExpiringWidget() {
    const [state, setState] = useState({
        loading: true,
        error: null,
        items: [],
    });

    useEffect(() => {
        let cancelled = false;
        msaService
            .getAll()
            .then((rows) => {
                if (cancelled) return;
                const expiring = (rows || [])
                    .map((m) => ({ ...m, _days: daysUntil(m.expiration_date) }))
                    .filter(
                        (m) =>
                            m._days !== null &&
                            m._days <= WINDOW_DAYS &&
                            m._days >= -30,
                    )
                    .sort((a, b) => a._days - b._days)
                    .slice(0, 6);
                setState({ loading: false, error: null, items: expiring });
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
                No contracts expiring in the next {WINDOW_DAYS} days.
            </div>
        );

    return (
        <div className="widget-list">
            <ul className="widget-list__items">
                {state.items.map((m) => {
                    const days = m._days;
                    const urgency =
                        days < 0
                            ? "expired"
                            : days <= 14
                              ? "urgent"
                              : days <= 45
                                ? "soon"
                                : "ok";
                    return (
                        <li key={m.id} className="widget-list__row">
                            <div className="widget-list__primary">
                                <span className="widget-list__name">
                                    {m.vendor_name || "Vendor"}
                                </span>
                                <span className="widget-list__meta">
                                    v{m.version} · expires{" "}
                                    {formatDate(m.expiration_date)}
                                </span>
                            </div>
                            <div className="widget-list__secondary">
                                <span className={`urgency-pill urgency-${urgency}`}>
                                    {days < 0
                                        ? `${Math.abs(days)}d overdue`
                                        : `${days}d left`}
                                </span>
                            </div>
                        </li>
                    );
                })}
            </ul>
            <Link to="/contracts" className="widget__footer-link">
                Manage contracts →
            </Link>
        </div>
    );
}
