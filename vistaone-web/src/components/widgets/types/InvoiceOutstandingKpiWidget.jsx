import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { invoiceService } from "../../../services/invoiceService";
import { formatCurrency } from "../widgetUtils";

const OUTSTANDING_STATUSES = ["pending", "submitted", "in_review", "approved"];

export default function InvoiceOutstandingKpiWidget() {
    const [state, setState] = useState({
        loading: true,
        error: null,
        total: 0,
        count: 0,
    });

    useEffect(() => {
        let cancelled = false;
        invoiceService
            .getAll()
            .then((rows) => {
                if (cancelled) return;
                const open = (rows || []).filter((r) => {
                    const s = String(r.invoice_status || "").toLowerCase();
                    return OUTSTANDING_STATUSES.includes(s);
                });
                const total = open.reduce(
                    (sum, r) => sum + Number(r.total_amount || 0),
                    0,
                );
                setState({
                    loading: false,
                    error: null,
                    total,
                    count: open.length,
                });
            })
            .catch((err) => {
                if (cancelled) return;
                setState({
                    loading: false,
                    error: err.message || "Failed to load",
                    total: 0,
                    count: 0,
                });
            });
        return () => {
            cancelled = true;
        };
    }, []);

    if (state.loading) {
        return <div className="widget__placeholder">Loading…</div>;
    }
    if (state.error) {
        return <div className="widget__error">{state.error}</div>;
    }

    return (
        <div className="kpi">
            <div className="kpi__value">{formatCurrency(state.total)}</div>
            <div className="kpi__sub">
                {state.count} {state.count === 1 ? "invoice" : "invoices"}{" "}
                outstanding
            </div>
            <Link to="/invoices" className="widget__footer-link">
                View invoices →
            </Link>
        </div>
    );
}
